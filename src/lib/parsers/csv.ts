/**
 * CSV Parser Utility
 * Parses CSV files and returns structured data
 */

export interface ParsedCSV {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parse CSV content into headers and rows
 * @param content - Raw CSV file content as string
 * @returns Parsed CSV data with headers and rows
 */
export function parseCSV(content: string): ParsedCSV {
  // Split into lines and remove empty lines
  const lines = content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse headers from first line
  const headers = parseCSVLine(lines[0]);

  if (headers.length === 0) {
    throw new Error('CSV file has no headers');
  }

  // Parse data rows
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // Skip empty rows
    if (values.every(v => v === '')) {
      continue;
    }

    // Create object mapping headers to values
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return {
    headers,
    rows
  };
}

/**
 * Parse a single CSV line, handling quoted values with commas
 * @param line - Single CSV line
 * @returns Array of values
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add final field
  values.push(current.trim());

  return values;
}

/**
 * Convert parsed CSV to a format suitable for analysis
 * Returns first N rows for AI column mapping detection
 * @param parsed - Parsed CSV data
 * @param sampleSize - Number of sample rows to return (default: 5)
 * @returns Sample data for AI analysis
 */
export function getCSVSample(parsed: ParsedCSV, sampleSize: number = 5): {
  headers: string[];
  sampleRows: Record<string, string>[];
} {
  return {
    headers: parsed.headers,
    sampleRows: parsed.rows.slice(0, sampleSize)
  };
}
