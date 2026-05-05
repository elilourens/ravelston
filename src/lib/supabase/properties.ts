import { SupabaseClient } from '@supabase/supabase-js'
import { Property } from '@/app/dashboard/properties/mock-data'

export async function fetchProperties(supabase: SupabaseClient): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  // Transform database format (snake_case) to Property interface (camelCase)
  return (data || []).map((row: any) => ({
    id: row.id,
    address: row.address,
    postcode: row.postcode,
    type: row.type,
    bedrooms: row.bedrooms,
    propertyReference: row.property_reference,
    status: row.status,
    currentTenancy: row.current_tenancy,
    compliance: row.compliance,
  }))
}

export async function createProperty(
  supabase: SupabaseClient,
  property: Omit<Property, 'id'>
): Promise<Property | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('properties')
    .insert({
      user_id: user.id,
      address: property.address,
      postcode: property.postcode,
      type: property.type,
      bedrooms: property.bedrooms,
      property_reference: property.propertyReference,
      status: property.status,
      current_tenancy: property.currentTenancy,
      compliance: property.compliance,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating property:', error)
    return null
  }

  // Transform to Property interface
  return {
    id: data.id,
    address: data.address,
    postcode: data.postcode,
    type: data.type,
    bedrooms: data.bedrooms,
    propertyReference: data.property_reference,
    status: data.status,
    currentTenancy: data.current_tenancy,
    compliance: data.compliance,
  }
}

export async function updateProperty(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Property>
): Promise<Property | null> {
  const updateData: Record<string, any> = {}

  if (updates.address) updateData.address = updates.address
  if (updates.postcode) updateData.postcode = updates.postcode
  if (updates.type) updateData.type = updates.type
  if (updates.bedrooms) updateData.bedrooms = updates.bedrooms
  if (updates.propertyReference !== undefined) updateData.property_reference = updates.propertyReference
  if (updates.status) updateData.status = updates.status
  if (updates.currentTenancy !== undefined) updateData.current_tenancy = updates.currentTenancy
  if (updates.compliance) updateData.compliance = updates.compliance

  const { data, error } = await supabase
    .from('properties')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating property:', error)
    return null
  }

  // Transform to Property interface
  return {
    id: data.id,
    address: data.address,
    postcode: data.postcode,
    type: data.type,
    bedrooms: data.bedrooms,
    propertyReference: data.property_reference,
    status: data.status,
    currentTenancy: data.current_tenancy,
    compliance: data.compliance,
  }
}

export async function updatePropertyCompliance(
  supabase: SupabaseClient,
  propertyId: string,
  complianceType: string,
  complianceData: any
): Promise<Property | null> {
  // First fetch the current property to get existing compliance data
  const { data: currentProperty, error: fetchError } = await supabase
    .from('properties')
    .select('compliance')
    .eq('id', propertyId)
    .single()

  if (fetchError) {
    console.error('Error fetching property:', fetchError)
    return null
  }

  // Merge the new compliance data with existing
  const updatedCompliance = {
    ...currentProperty.compliance,
    [complianceType]: {
      ...(currentProperty.compliance?.[complianceType] || {}),
      ...complianceData,
    },
  }

  // Update the property with new compliance data
  const { data, error } = await supabase
    .from('properties')
    .update({ compliance: updatedCompliance })
    .eq('id', propertyId)
    .select()
    .single()

  if (error) {
    console.error('Error updating compliance:', error)
    return null
  }

  // Transform to Property interface
  return {
    id: data.id,
    address: data.address,
    postcode: data.postcode,
    type: data.type,
    bedrooms: data.bedrooms,
    propertyReference: data.property_reference,
    status: data.status,
    currentTenancy: data.current_tenancy,
    compliance: data.compliance,
  }
}

export async function deleteProperty(
  supabase: SupabaseClient,
  id: string
): Promise<boolean> {
  const { error } = await supabase.from('properties').delete().eq('id', id)

  if (error) {
    console.error('Error deleting property:', error)
    return false
  }

  return true
}
