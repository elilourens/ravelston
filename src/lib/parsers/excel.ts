/**
 * Excel Parser Utility
 * Parses Excel files (.xlsx, .xls) using the xlsx package
 */

import * as XLSX from 'xlsx';

export interface ParsedExcel {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse Excel file buffer into headers and rows
 * @param buffer - Excel file buffer (ArrayBuffer or Uint8Array)
 * @returns Parsed Excel data with headers and rows
 */
export function parseExcel(buffer: ArrayBuffer): ParsedExcel {
  try {
    // Read the workbook
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error('Excel file has no sheets');
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1, // Return array of arrays
      raw: false, // Return formatted strings
      defval: '' // Default value for empty cells
    });

    if (jsonData.length === 0) {
      throw new Error('Excel sheet is empty');
    }

    // Extract headers from first row
    const headerRow = jsonData[0];
    const headers = headerRow.map(h => String(h).trim());

    if (headers.length === 0 || headers.every(h => h === '')) {
      throw new Error('Excel file has no headers');
    }

    // Parse data rows
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < jsonData.length; i++) {
      const rowData = jsonData[i];

      // Skip completely empty rows
      if (!rowData || rowData.every(cell => String(cell).trim() === '')) {
        continue;
      }

      // Create object mapping headers to values
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        const value = rowData[index];
        row[header] = value ? String(value).trim() : '';
      });

      rows.push(row);
    }

    return {
      headers,
      rows
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
    throw new Error('Failed to parse Excel file: Unknown error');
  }
}

/**
 * Convert parsed Excel to a format suitable for analysis
 * Returns first N rows for AI column mapping detection
 * @param parsed - Parsed Excel data
 * @param sampleSize - Number of sample rows to return (default: 5)
 * @returns Sample data for AI analysis
 */
export function getExcelSample(parsed: ParsedExcel, sampleSize: number = 5): {
  headers: string[];
  sampleRows: Record<string, string>[];
} {
  return {
    headers: parsed.headers,
    sampleRows: parsed.rows.slice(0, sampleSize)
  };
}
