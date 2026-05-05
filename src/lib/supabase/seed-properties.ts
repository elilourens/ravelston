import { createClient } from './client'
import { properties as mockProperties } from '@/app/dashboard/properties/mock-data'

export async function seedPropertiesForUser() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('No user logged in')
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user already has properties
  const { data: existing } = await supabase
    .from('properties')
    .select('id')
    .limit(1)

  if (existing && existing.length > 0) {
    return { success: false, error: 'User already has properties' }
  }

  // Insert mock properties
  const propertiesToInsert = mockProperties.map((prop) => ({
    user_id: user.id,
    address: prop.address,
    postcode: prop.postcode,
    type: prop.type,
    bedrooms: prop.bedrooms,
    property_reference: prop.propertyReference,
    status: prop.status,
    current_tenancy: prop.currentTenancy,
    compliance: prop.compliance,
  }))

  const { data, error } = await supabase
    .from('properties')
    .insert(propertiesToInsert)
    .select()

  if (error) {
    console.error('Error seeding properties:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
