import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@/lib/supabase/server';
import { parseCSV, getCSVSample } from '@/lib/parsers/csv';
import { parseExcel, getExcelSample } from '@/lib/parsers/excel';
import { validateProperty, normalizeProperty } from '@/lib/validators/property';
import { createImport, addImportItems } from '@/lib/supabase/imports';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_PROPERTIES = 500;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const filename = file.name.toLowerCase();
    const isCSV = filename.endsWith('.csv');
    const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls');

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV or Excel file.' },
        { status: 400 }
      );
    }

    // Parse file
    const bytes = await file.arrayBuffer();
    let headers: string[];
    let rows: Record<string, string>[];

    try {
      if (isCSV) {
        const text = new TextDecoder().decode(bytes);
        const parsed = parseCSV(text);
        headers = parsed.headers;
        rows = parsed.rows;
      } else {
        const parsed = parseExcel(bytes);
        headers = parsed.headers;
        rows = parsed.rows;
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      return NextResponse.json(
        { error: 'Failed to parse file. Please check the file format.' },
        { status: 400 }
      );
    }

    // Check if file has data
    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'File contains no data rows' },
        { status: 400 }
      );
    }

    // Check property limit
    if (rows.length > MAX_PROPERTIES) {
      return NextResponse.json(
        { error: `File contains too many properties. Maximum is ${MAX_PROPERTIES}.` },
        { status: 400 }
      );
    }

    // Get sample for AI analysis
    const sampleRows = rows.slice(0, 5);

    // Call OpenAI to detect column mappings
    const columnMapping = await detectColumnMapping(headers, sampleRows);

    if (!columnMapping) {
      return NextResponse.json(
        { error: 'Failed to detect column mappings. Please check the file format.' },
        { status: 500 }
      );
    }

    // Create import session
    const importSession = await createImport(supabase, file.name, rows.length);

    if (!importSession) {
      return NextResponse.json(
        { error: 'Failed to create import session' },
        { status: 500 }
      );
    }

    // Fetch existing properties for duplicate detection
    const { data: existingProperties } = await supabase
      .from('properties')
      .select('address, postcode');

    const existingPropertiesSet = new Set(
      (existingProperties || []).map((p) =>
        `${p.address?.toLowerCase().trim()}|${p.postcode?.toLowerCase().trim()}`
      )
    );

    // Parse all rows using detected schema
    const importItems = rows.map((row, index) => {
      // Map CSV columns to property fields
      const propertyData: Record<string, any> = {};

      // Required fields
      if (columnMapping.address) {
        propertyData.address = row[columnMapping.address] || '';
      }
      if (columnMapping.postcode) {
        propertyData.postcode = row[columnMapping.postcode] || '';
      }
      if (columnMapping.type) {
        propertyData.type = row[columnMapping.type] || '';
      }
      if (columnMapping.bedrooms) {
        propertyData.bedrooms = row[columnMapping.bedrooms] || '';
      }
      if (columnMapping.status) {
        propertyData.status = row[columnMapping.status] || '';
      }

      // Optional fields
      if (columnMapping.propertyReference) {
        propertyData.propertyReference = row[columnMapping.propertyReference] || null;
      }

      // Tenancy fields (optional)
      const hasTenancyData =
        columnMapping.tenantName ||
        columnMapping.startDate ||
        columnMapping.monthlyRent;

      if (hasTenancyData) {
        propertyData.currentTenancy = {
          tenantName: columnMapping.tenantName ? row[columnMapping.tenantName] : '',
          startDate: columnMapping.startDate ? row[columnMapping.startDate] : '',
          endDate: columnMapping.endDate ? row[columnMapping.endDate] : '',
          monthlyRent: columnMapping.monthlyRent ? row[columnMapping.monthlyRent] : 0,
          depositAmount: columnMapping.depositAmount ? row[columnMapping.depositAmount] : 0,
        };

        // Remove empty tenancy if all fields are empty
        const allEmpty = Object.values(propertyData.currentTenancy).every(
          (v) => v === '' || v === 0
        );
        if (allEmpty) {
          delete propertyData.currentTenancy;
        }
      }

      // Normalize property data
      const normalized = normalizeProperty(propertyData);

      // Validate property
      const validation = validateProperty(normalized);

      // Check for duplicates
      const duplicateKey = `${normalized.address?.toLowerCase().trim()}|${normalized.postcode?.toLowerCase().trim()}`;
      const isDuplicate = existingPropertiesSet.has(duplicateKey);

      if (isDuplicate) {
        validation.errors.push({
          field: 'duplicate',
          message: 'Likely duplicate - property with same address and postcode already exists',
        });
        validation.confidenceScores.duplicate = 0; // Flag as duplicate
      }

      return {
        row_number: index + 1,
        property_data: normalized,
        raw_data: row,
        validation_errors: validation.errors.length > 0 ? validation.errors : null,
        confidence_scores: validation.confidenceScores,
      };
    });

    // Add items to database
    const success = await addImportItems(supabase, importSession.id, importItems);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save import items' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      importId: importSession.id,
      totalItems: rows.length,
      message: 'Import created successfully',
    });
  } catch (error) {
    console.error('Error processing import:', error);
    return NextResponse.json(
      { error: 'Failed to process import' },
      { status: 500 }
    );
  }
}

/**
 * Use OpenAI to detect column mappings from CSV headers
 */
async function detectColumnMapping(
  headers: string[],
  sampleRows: Record<string, string>[]
): Promise<Record<string, string> | null> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a property portfolio CSV analyzer. Analyze CSV headers and sample data to map columns to property fields.

TARGET FIELDS (required):
- address: Full property address
- postcode: UK postcode (e.g., NW1 6XE)
- type: Property type (house, flat, apartment, studio, hmo)
- bedrooms: Number of bedrooms (integer)
- status: Property status (occupied, vacant, under-offer)

TARGET FIELDS (optional):
- propertyReference: Property reference number
- tenantName: Current tenant name (if occupied)
- startDate: Tenancy start date
- endDate: Tenancy end date
- monthlyRent: Monthly rent amount (£)
- depositAmount: Deposit amount (£)

COLUMN NAME VARIATIONS:
- Address: "Property Address", "Address", "Street Address", "Location"
- Postcode: "Post Code", "Postcode", "Postal Code", "ZIP"
- Type: "Property Type", "Type", "Category"
- Bedrooms: "Beds", "Bedrooms", "Bed", "No. of Bedrooms"
- Status: "Status", "Property Status", "Occupancy", "Let Status"
- Reference: "Ref", "Reference", "Property Ref", "ID"
- Tenant: "Tenant", "Tenant Name", "Current Tenant"
- Start Date: "Start Date", "Tenancy Start", "Let Date"
- End Date: "End Date", "Tenancy End", "Expiry Date"
- Rent: "Rent", "Monthly Rent", "PCM", "Rental", "Monthly Rental"
- Deposit: "Deposit", "Deposit Amount", "Security Deposit"

IMPORTANT - COMBINED ADDRESS/POSTCODE:
If you see address and postcode in the SAME column (e.g., "45 Baker Street, NW1 6XE"):
- Map that column to "address"
- Do NOT map anything to "postcode"
- Our system will automatically extract the postcode from the address
- Example: "45 Baker Street EH5 3LC, Edinburgh" → address gets full string, postcode extracted automatically

Return a JSON object mapping target field names to CSV column names:
{
  "address": "Property Address",
  "postcode": "Post Code",
  "type": "Type",
  "bedrooms": "Beds",
  "status": "Status",
  "propertyReference": "Ref",
  "tenantName": "Tenant Name",
  "startDate": "Start Date",
  "endDate": "End Date",
  "monthlyRent": "Monthly Rent",
  "depositAmount": "Deposit"
}

IMPORTANT:
- Only include mappings where you found a matching CSV column
- Return exact CSV column names as they appear in the headers
- If a required field is missing, omit it (we'll handle validation later)
- Return valid JSON only, no markdown or extra text`,
        },
        {
          role: 'user',
          content: `CSV Headers: ${JSON.stringify(headers)}

Sample Rows:
${JSON.stringify(sampleRows, null, 2)}

Please analyze and return the column mapping.`,
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const mapping = JSON.parse(content);

    return mapping;
  } catch (error) {
    console.error('Error detecting column mapping:', error);
    return null;
  }
}
