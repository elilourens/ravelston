import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to base64 for OpenAI Vision API
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type

    // Use OpenAI Vision API to extract text and analyze document
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a UK property compliance document analyzer. Extract structured information for letting agencies to verify and approve.

DOCUMENT TYPES TO IDENTIFY:

1. GAS SAFETY CERTIFICATE (CP12)
   - Look for: "Gas Safety Certificate", "CP12", "Landlord Gas Safety Record"
   - Key dates: Issue date, Next inspection due (12 months from issue)
   - complianceType: "gasSafetyCertificate"

2. EICR (ELECTRICAL SAFETY)
   - Look for: "EICR", "Electrical Installation Condition Report", "Periodic Inspection"
   - Key dates: Inspection date, Next inspection recommended (usually 5 years)
   - complianceType: "eicr"

3. EPC (ENERGY PERFORMANCE CERTIFICATE)
   - Look for: "Energy Performance Certificate", "EPC", energy ratings (A-G)
   - Key dates: Issue date, Valid until (10 years from issue)
   - complianceType: "epc"

4. DEPOSIT PROTECTION CERTIFICATE
   - Look for: "Deposit Protection", "DPS", "MyDeposits", "TDS"
   - Key dates: Protection date, Expiry date
   - complianceType: "depositProtection"

5. RIGHT TO RENT CHECK
   - Look for: "Right to Rent", "Immigration check", "ID verification"
   - Key dates: Check date, Follow-up date
   - complianceType: "rightToRent"

6. LEGIONELLA RISK ASSESSMENT
   - Look for: "Legionella", "Water Risk Assessment", "L8"
   - Key dates: Assessment date, Review date (usually 2 years)
   - complianceType: "legionellaAssessment"

7. BUILDING INSURANCE
   - Look for: "Buildings Insurance", "Property Insurance"
   - Key dates: Policy start, Policy expiry, Renewal date
   - complianceType: "buildingInsurance"

8. LANDLORD INSURANCE
   - Look for: "Landlord Insurance", "Rent Guarantee", "Legal Expenses"
   - Key dates: Policy start, Policy expiry
   - complianceType: "landlordInsurance"

9. HMO LICENSE
   - Look for: "HMO License", "House in Multiple Occupation"
   - Key dates: Issue date, Expiry date (usually 5 years)
   - complianceType: "hmoLicense"

EXTRACTION REQUIREMENTS:

Extract the following and return as JSON:
{
  "propertyAddress": "Full property address as shown on document",
  "postcode": "UK postcode (e.g., SW1A 1AA)",
  "complianceType": "one of the complianceType values above",
  "issueDate": "YYYY-MM-DD or null",
  "expiryDate": "YYYY-MM-DD or null (when certificate/policy expires or renewal is due)",
  "certificateNumber": "Certificate/policy/reference number or null",
  "issuedBy": "Company or person name who issued the document or null",
  "confidence": 0.95 (float between 0.0-1.0 indicating extraction confidence)
}

CRITICAL RULES:
- Always extract the EXPIRY/RENEWAL date - this is critical for compliance tracking
- If no expiry date is shown, calculate it based on standard UK regulations:
  * Gas Safety: 12 months from issue date
  * EICR: 5 years from inspection date
  * EPC: 10 years from issue date
  * Legionella: 2 years from assessment date
  * Insurance/HMO: Use policy end date shown
- Parse dates carefully (UK format is DD/MM/YYYY, convert to YYYY-MM-DD)
- Extract postcode separately from address
- Set confidence lower if any critical field is unclear
- Return valid JSON only, no markdown or extra text`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: 'Please extract the compliance document information from this image.',
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    const extractedData = JSON.parse(content)

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error('Error processing document:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}
