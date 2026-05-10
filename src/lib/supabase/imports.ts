/**
 * Import Management Functions
 * CRUD operations for property imports
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Property } from '@/app/dashboard/properties/mock-data';

export interface PropertyImport {
  id: string;
  user_id: string;
  filename: string;
  total_items: number;
  pending_items: number;
  approved_items: number;
  rejected_items: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface PropertyImportItem {
  id: string;
  import_id: string;
  row_number: number;
  status: 'pending' | 'approved' | 'rejected';
  property_data: Record<string, any>;
  raw_data: Record<string, any>;
  validation_errors: Array<{ field: string; message: string }> | null;
  confidence_scores: Record<string, number> | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new import session
 */
export async function createImport(
  supabase: SupabaseClient,
  filename: string,
  totalItems: number
): Promise<PropertyImport | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('property_imports')
    .insert({
      user_id: user.id,
      filename,
      total_items: totalItems,
      pending_items: totalItems,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating import:', error);
    return null;
  }

  return data;
}

/**
 * Add import items to an import session
 */
export async function addImportItems(
  supabase: SupabaseClient,
  importId: string,
  items: Array<{
    row_number: number;
    property_data: Record<string, any>;
    raw_data: Record<string, any>;
    validation_errors: Array<{ field: string; message: string }> | null;
    confidence_scores: Record<string, number> | null;
  }>
): Promise<boolean> {
  const itemsToInsert = items.map((item) => ({
    import_id: importId,
    row_number: item.row_number,
    status: 'pending',
    property_data: item.property_data,
    raw_data: item.raw_data,
    validation_errors: item.validation_errors,
    confidence_scores: item.confidence_scores,
  }));

  const { error } = await supabase
    .from('property_import_items')
    .insert(itemsToInsert);

  if (error) {
    console.error('Error adding import items:', error);
    return false;
  }

  return true;
}

/**
 * Fetch all imports for the current user
 */
export async function fetchImportsByUser(
  supabase: SupabaseClient
): Promise<PropertyImport[]> {
  const { data, error } = await supabase
    .from('property_imports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching imports:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch a single import by ID
 */
export async function fetchImportById(
  supabase: SupabaseClient,
  importId: string
): Promise<PropertyImport | null> {
  const { data, error } = await supabase
    .from('property_imports')
    .select('*')
    .eq('id', importId)
    .single();

  if (error) {
    console.error('Error fetching import:', error);
    return null;
  }

  return data;
}

/**
 * Fetch import items for an import session
 */
export async function fetchImportItems(
  supabase: SupabaseClient,
  importId: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<PropertyImportItem[]> {
  let query = supabase
    .from('property_import_items')
    .select('*')
    .eq('import_id', importId)
    .order('row_number', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching import items:', error);
    return [];
  }

  return data || [];
}

/**
 * Approve an import item
 */
export async function approveImportItem(
  supabase: SupabaseClient,
  itemId: string,
  updatedPropertyData?: Record<string, any>
): Promise<boolean> {
  const updateData: any = {
    status: 'approved',
    updated_at: new Date().toISOString(),
  };

  if (updatedPropertyData) {
    updateData.property_data = updatedPropertyData;
  }

  const { error } = await supabase
    .from('property_import_items')
    .update(updateData)
    .eq('id', itemId);

  if (error) {
    console.error('Error approving import item:', error);
    return false;
  }

  return true;
}

/**
 * Reject an import item
 */
export async function rejectImportItem(
  supabase: SupabaseClient,
  itemId: string,
  reason: string
): Promise<boolean> {
  const { error } = await supabase
    .from('property_import_items')
    .update({
      status: 'rejected',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (error) {
    console.error('Error rejecting import item:', error);
    return false;
  }

  return true;
}

/**
 * Update import item property data
 */
export async function updateImportItem(
  supabase: SupabaseClient,
  itemId: string,
  propertyData: Record<string, any>
): Promise<boolean> {
  const { error } = await supabase
    .from('property_import_items')
    .update({
      property_data: propertyData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', itemId);

  if (error) {
    console.error('Error updating import item:', error);
    return false;
  }

  return true;
}

/**
 * Finalize import - batch insert approved properties
 */
export async function finalizeImport(
  supabase: SupabaseClient,
  importId: string
): Promise<{ success: boolean; insertedCount: number; errors: string[] }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Fetch all approved items
  const approvedItems = await fetchImportItems(supabase, importId, 'approved');

  if (approvedItems.length === 0) {
    return {
      success: false,
      insertedCount: 0,
      errors: ['No approved items to import'],
    };
  }

  // Initialize default compliance structure for new properties
  const defaultCompliance = {
    gasSafetyCertificate: { status: 'required', required: true },
    eicr: { status: 'required', required: true },
    epc: { status: 'required', required: true },
    smokeAlarms: { status: 'required', required: true },
    coAlarms: { status: 'required', required: true },
    depositProtection: { status: 'not-applicable', required: false },
    rightToRent: { status: 'not-applicable', required: false },
    legionellaAssessment: { status: 'required', required: true },
    buildingInsurance: { status: 'required', required: true },
    landlordInsurance: { status: 'required', required: true },
    prsDatabase: { status: 'required', required: true },
    // RRA items based on occupancy
    rraInformationSheet: { status: 'not-applicable', required: false, deliveryStatus: 'not-applicable', deadline: '2026-05-31' },
    petRequestTracking: { status: 'not-applicable', required: false, requests: [], petsAllowed: true, hasActiveRequests: false },
    awaitingGroundsNotice: { status: 'not-applicable', required: false, groundsDisclosed: false },
    ombudsmanMembership: { status: 'required', required: true },
    writtenStatementOfTerms: { status: 'not-applicable', required: false, tenancyType: 'written' },
  };

  // Prepare properties for insertion
  const propertiesToInsert = approvedItems.map((item) => {
    const propertyData = item.property_data;

    // Set RRA compliance based on occupancy status
    const compliance = { ...defaultCompliance };
    if (propertyData.status === 'occupied') {
      compliance.depositProtection = { status: 'required', required: true };
      compliance.rightToRent = { status: 'required', required: true };
      compliance.rraInformationSheet = { status: 'required', required: true, deliveryStatus: 'pending', deadline: '2026-05-31' };
      compliance.petRequestTracking = { status: 'required', required: true, requests: [], petsAllowed: true, hasActiveRequests: false };
      compliance.awaitingGroundsNotice = { status: 'required', required: true, groundsDisclosed: false };
      compliance.writtenStatementOfTerms = { status: 'required', required: true, tenancyType: 'written' };
    }

    return {
      user_id: user.id,
      address: propertyData.address,
      postcode: propertyData.postcode,
      type: propertyData.type,
      bedrooms: propertyData.bedrooms,
      property_reference: propertyData.propertyReference || null,
      status: propertyData.status,
      current_tenancy: propertyData.currentTenancy || null,
      compliance,
    };
  });

  // Insert properties in batch
  const { data, error } = await supabase
    .from('properties')
    .insert(propertiesToInsert)
    .select();

  if (error) {
    console.error('Error inserting properties:', error);
    return {
      success: false,
      insertedCount: 0,
      errors: [error.message],
    };
  }

  // Update import status to completed
  await supabase
    .from('property_imports')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', importId);

  return {
    success: true,
    insertedCount: data.length,
    errors: [],
  };
}

/**
 * Delete an import and all its items
 */
export async function deleteImport(
  supabase: SupabaseClient,
  importId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('property_imports')
    .delete()
    .eq('id', importId);

  if (error) {
    console.error('Error deleting import:', error);
    return false;
  }

  return true;
}

/**
 * Get pending imports count for current user
 */
export async function getPendingImportsCount(
  supabase: SupabaseClient
): Promise<number> {
  const { data, error } = await supabase
    .from('property_imports')
    .select('id', { count: 'exact', head: true })
    .in('status', ['pending', 'in_progress']);

  if (error) {
    console.error('Error fetching pending imports count:', error);
    return 0;
  }

  return data?.length || 0;
}
