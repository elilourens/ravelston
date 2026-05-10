/**
 * Property Validation Utility
 * Validates property data and provides confidence scores
 */

import type { PropertyType, PropertyStatus } from '@/app/dashboard/properties/mock-data';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  confidenceScores: Record<string, number>; // 0-100 for each field
}

// UK postcode regex pattern
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i;

// Valid property types
const PROPERTY_TYPES: PropertyType[] = ['house', 'flat', 'apartment', 'studio', 'hmo'];

// Valid property statuses
const PROPERTY_STATUSES: PropertyStatus[] = ['occupied', 'vacant', 'under-offer'];

/**
 * Validate a property object
 * @param data - Property data to validate
 * @returns Validation result with errors and confidence scores
 */
export function validateProperty(data: Record<string, any>): ValidationResult {
  const errors: ValidationError[] = [];
  const confidenceScores: Record<string, number> = {};

  // Validate address
  if (!data.address || typeof data.address !== 'string' || data.address.trim() === '') {
    errors.push({ field: 'address', message: 'Address is required' });
    confidenceScores.address = 0;
  } else {
    // Check if address looks reasonable (has number and street name)
    const hasNumber = /\d/.test(data.address);
    const hasMultipleWords = data.address.trim().split(/\s+/).length >= 2;

    if (hasNumber && hasMultipleWords) {
      confidenceScores.address = 100;
    } else if (hasNumber || hasMultipleWords) {
      confidenceScores.address = 70;
    } else {
      confidenceScores.address = 40;
      errors.push({ field: 'address', message: 'Address format may be invalid' });
    }
  }

  // Validate postcode
  if (!data.postcode || typeof data.postcode !== 'string') {
    errors.push({ field: 'postcode', message: 'Postcode is required' });
    confidenceScores.postcode = 0;
  } else {
    const normalizedPostcode = data.postcode.trim().toUpperCase();
    if (UK_POSTCODE_REGEX.test(normalizedPostcode)) {
      confidenceScores.postcode = 100;
    } else {
      errors.push({ field: 'postcode', message: 'Invalid UK postcode format' });
      confidenceScores.postcode = 20;
    }
  }

  // Validate property type
  if (!data.type || typeof data.type !== 'string') {
    errors.push({ field: 'type', message: 'Property type is required' });
    confidenceScores.type = 0;
  } else {
    const normalizedType = data.type.toLowerCase().trim();
    if (PROPERTY_TYPES.includes(normalizedType as PropertyType)) {
      confidenceScores.type = 100;
    } else {
      // Check for common variations
      const variations: Record<string, PropertyType> = {
        'terraced': 'house',
        'semi-detached': 'house',
        'detached': 'house',
        'bungalow': 'house',
        'maisonette': 'flat',
        'penthouse': 'flat',
      };

      if (variations[normalizedType]) {
        confidenceScores.type = 80;
      } else {
        errors.push({
          field: 'type',
          message: `Property type must be one of: ${PROPERTY_TYPES.join(', ')}`
        });
        confidenceScores.type = 30;
      }
    }
  }

  // Validate bedrooms
  if (data.bedrooms === undefined || data.bedrooms === null) {
    errors.push({ field: 'bedrooms', message: 'Number of bedrooms is required' });
    confidenceScores.bedrooms = 0;
  } else {
    const bedrooms = typeof data.bedrooms === 'string'
      ? parseInt(data.bedrooms, 10)
      : data.bedrooms;

    if (isNaN(bedrooms)) {
      errors.push({ field: 'bedrooms', message: 'Bedrooms must be a number' });
      confidenceScores.bedrooms = 0;
    } else if (bedrooms < 1 || bedrooms > 20) {
      errors.push({ field: 'bedrooms', message: 'Bedrooms must be between 1 and 20' });
      confidenceScores.bedrooms = 40;
    } else if (!Number.isInteger(bedrooms)) {
      errors.push({ field: 'bedrooms', message: 'Bedrooms must be a whole number' });
      confidenceScores.bedrooms = 60;
    } else {
      confidenceScores.bedrooms = 100;
    }
  }

  // Validate status
  if (!data.status || typeof data.status !== 'string') {
    errors.push({ field: 'status', message: 'Property status is required' });
    confidenceScores.status = 0;
  } else {
    const normalizedStatus = data.status.toLowerCase().trim();
    if (PROPERTY_STATUSES.includes(normalizedStatus as PropertyStatus)) {
      confidenceScores.status = 100;
    } else {
      // Check for common variations
      const variations: Record<string, PropertyStatus> = {
        'let': 'occupied',
        'rented': 'occupied',
        'tenanted': 'occupied',
        'empty': 'vacant',
        'void': 'vacant',
        'available': 'vacant',
        'pending': 'under-offer',
        'reserved': 'under-offer',
      };

      if (variations[normalizedStatus]) {
        confidenceScores.status = 80;
      } else {
        errors.push({
          field: 'status',
          message: `Status must be one of: ${PROPERTY_STATUSES.join(', ')}`
        });
        confidenceScores.status = 30;
      }
    }
  }

  // Validate propertyReference (optional)
  if (data.propertyReference !== undefined && data.propertyReference !== null) {
    if (typeof data.propertyReference === 'string' && data.propertyReference.trim() !== '') {
      confidenceScores.propertyReference = 100;
    } else {
      confidenceScores.propertyReference = 50;
    }
  }

  // Validate currentTenancy (fully optional - only validate provided fields)
  if (data.currentTenancy && typeof data.currentTenancy === 'object') {
    confidenceScores.currentTenancy = 100;

    // Validate tenant name only if provided
    if (data.currentTenancy.tenantName && data.currentTenancy.tenantName.trim() !== '') {
      // Tenant name exists and is valid
      confidenceScores.currentTenancy = Math.max(confidenceScores.currentTenancy, 100);
    }

    // Validate dates only if provided (non-empty)
    if (data.currentTenancy.startDate && data.currentTenancy.startDate.trim() !== '') {
      if (!isValidDate(data.currentTenancy.startDate)) {
        errors.push({ field: 'currentTenancy.startDate', message: 'Invalid start date format' });
        confidenceScores.currentTenancy -= 20;
      }
    }

    if (data.currentTenancy.endDate && data.currentTenancy.endDate.trim() !== '') {
      if (!isValidDate(data.currentTenancy.endDate)) {
        errors.push({ field: 'currentTenancy.endDate', message: 'Invalid end date format' });
        confidenceScores.currentTenancy -= 20;
      }
    }

    // Validate monthly rent only if provided
    if (data.currentTenancy.monthlyRent !== undefined &&
        data.currentTenancy.monthlyRent !== null &&
        data.currentTenancy.monthlyRent !== '' &&
        data.currentTenancy.monthlyRent !== 0) {
      const rent = parseFloat(data.currentTenancy.monthlyRent);
      if (isNaN(rent) || rent <= 0) {
        errors.push({ field: 'currentTenancy.monthlyRent', message: 'Invalid monthly rent' });
        confidenceScores.currentTenancy -= 20;
      }
    }

    // Validate deposit amount only if provided
    if (data.currentTenancy.depositAmount !== undefined &&
        data.currentTenancy.depositAmount !== null &&
        data.currentTenancy.depositAmount !== '' &&
        data.currentTenancy.depositAmount !== 0) {
      const deposit = parseFloat(data.currentTenancy.depositAmount);
      if (isNaN(deposit) || deposit < 0) {
        errors.push({ field: 'currentTenancy.depositAmount', message: 'Invalid deposit amount' });
        confidenceScores.currentTenancy -= 20;
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    confidenceScores
  };
}

/**
 * Extract UK postcode from a string (usually at the end)
 */
function extractPostcodeFromString(str: string): { postcode: string; remainingText: string } | null {
  if (!str) return null;

  // UK postcode pattern - matches at end of string or before comma
  const postcodePattern = /\b([A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2})\b/i;
  const match = str.match(postcodePattern);

  if (match) {
    const postcode = match[1];
    const remainingText = str.replace(postcodePattern, '').trim();
    // Clean up trailing commas and extra spaces
    return {
      postcode: postcode.trim(),
      remainingText: remainingText.replace(/,\s*$/, '').replace(/\s+/g, ' ').trim(),
    };
  }

  return null;
}

/**
 * Normalize property data for storage
 * Converts variations to standard values
 */
export function normalizeProperty(data: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = { ...data };

  // If postcode is missing but address exists, try to extract postcode from address
  if ((!normalized.postcode || normalized.postcode.trim() === '') && normalized.address) {
    const extracted = extractPostcodeFromString(normalized.address);
    if (extracted) {
      normalized.postcode = extracted.postcode;
      normalized.address = extracted.remainingText;
    }
  }

  // Normalize type
  if (normalized.type) {
    const typeVariations: Record<string, PropertyType> = {
      'terraced': 'house',
      'semi-detached': 'house',
      'detached': 'house',
      'bungalow': 'house',
      'maisonette': 'flat',
      'penthouse': 'flat',
    };

    const type = normalized.type.toLowerCase().trim();
    normalized.type = typeVariations[type] || type;
  }

  // Normalize status
  if (normalized.status) {
    const statusVariations: Record<string, PropertyStatus> = {
      'let': 'occupied',
      'rented': 'occupied',
      'tenanted': 'occupied',
      'empty': 'vacant',
      'void': 'vacant',
      'available': 'vacant',
      'pending': 'under-offer',
      'reserved': 'under-offer',
    };

    const status = normalized.status.toLowerCase().trim();
    normalized.status = statusVariations[status] || status;
  }

  // Normalize postcode (add space if missing)
  if (normalized.postcode) {
    normalized.postcode = normalizePostcode(normalized.postcode);
  }

  // Normalize bedrooms to integer
  if (normalized.bedrooms) {
    normalized.bedrooms = typeof normalized.bedrooms === 'string'
      ? parseInt(normalized.bedrooms, 10)
      : normalized.bedrooms;
  }

  // Normalize currency values
  if (normalized.currentTenancy) {
    if (normalized.currentTenancy.monthlyRent) {
      normalized.currentTenancy.monthlyRent = parseCurrency(normalized.currentTenancy.monthlyRent);
    }
    if (normalized.currentTenancy.depositAmount) {
      normalized.currentTenancy.depositAmount = parseCurrency(normalized.currentTenancy.depositAmount);
    }
    // Normalize dates
    if (normalized.currentTenancy.startDate) {
      normalized.currentTenancy.startDate = parseDate(normalized.currentTenancy.startDate);
    }
    if (normalized.currentTenancy.endDate) {
      normalized.currentTenancy.endDate = parseDate(normalized.currentTenancy.endDate);
    }
  }

  return normalized;
}

/**
 * Parse currency string (removes £, commas, etc.)
 */
export function parseCurrency(value: string | number): number {
  if (typeof value === 'number') return value;

  const cleaned = value.replace(/[£,$,\s]/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Parse date string (handles UK format DD/MM/YYYY)
 */
export function parseDate(value: string): string {
  if (!value) return '';

  // If already in ISO format (YYYY-MM-DD), return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  // Try UK format: DD/MM/YYYY or DD-MM-YYYY
  const ukMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ukMatch) {
    const [, day, month, year] = ukMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try US format: MM/DD/YYYY
  const usMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    // Ambiguous - assume UK format (DD/MM/YYYY) for consistency
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return value; // Return as-is if can't parse
}

/**
 * Validate date string
 */
function isValidDate(value: string): boolean {
  if (!value) return false;

  const date = new Date(parseDate(value));
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Normalize UK postcode format
 * Ensures proper spacing (e.g., "NW16XE" -> "NW1 6XE")
 */
export function normalizePostcode(postcode: string): string {
  const cleaned = postcode.replace(/\s+/g, '').toUpperCase();

  // UK postcodes have format: Area(1-2) District(1-2) Sector(1) Unit(2)
  // Add space before last 3 characters
  if (cleaned.length >= 5) {
    return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
  }

  return cleaned;
}
