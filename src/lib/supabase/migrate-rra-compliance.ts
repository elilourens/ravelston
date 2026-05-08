import { createClient } from './client'

/**
 * Migration function to add RRA 2025 compliance fields to existing properties
 * Run this once to update all properties in the database with the new compliance items
 */
export async function migrateRRACompliance() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('No user logged in')
    return { success: false, error: 'Not authenticated' }
  }

  // Fetch all properties for the current user
  const { data: properties, error: fetchError } = await supabase
    .from('properties')
    .select('*')

  if (fetchError) {
    console.error('Error fetching properties:', fetchError)
    return { success: false, error: fetchError.message }
  }

  if (!properties || properties.length === 0) {
    return { success: false, error: 'No properties found' }
  }

  console.log(`Found ${properties.length} properties to migrate`)

  // Default RRA compliance data
  const defaultRRACompliance = {
    rraInformationSheet: {
      status: 'required',
      required: true,
      deliveryStatus: 'pending',
      deadline: '2026-05-31',
      notes: 'RRA Information Sheet must be provided to existing tenants by 31 May 2026',
    },
    petRequestTracking: {
      status: 'not-applicable',
      required: false,
      requests: [],
      petsAllowed: true,
      hasActiveRequests: false,
      notes: 'No active pet requests',
    },
    awaitingGroundsNotice: {
      status: 'required',
      required: true,
      groundsDisclosed: false,
      notes: 'Ensure awaiting grounds are disclosed in tenancy agreement to avoid £7k fine',
    },
    ombudsmanMembership: {
      status: 'required',
      required: true,
      notes: 'Membership in approved redress scheme is mandatory',
    },
    writtenStatementOfTerms: {
      status: 'required',
      required: true,
      tenancyType: 'written',
      notes: 'Provide written statement for verbal tenancies by 31 May 2026',
    },
  }

  let updatedCount = 0
  let skippedCount = 0

  // Update each property
  for (const property of properties) {
    const compliance = property.compliance || {}

    // Check if already has RRA compliance fields
    if (compliance.rraInformationSheet) {
      console.log(`Property ${property.id} already has RRA compliance, skipping`)
      skippedCount++
      continue
    }

    // Merge new RRA compliance with existing compliance
    const updatedCompliance = {
      ...compliance,
      ...defaultRRACompliance,
    }

    // Adjust based on property status
    if (property.status === 'vacant') {
      // For vacant properties, set RRA items as not applicable (except ombudsman)
      updatedCompliance.rraInformationSheet = {
        ...defaultRRACompliance.rraInformationSheet,
        status: 'not-applicable',
        required: false,
        deliveryStatus: 'not-applicable',
        notes: 'Not applicable - property currently vacant',
      }
      updatedCompliance.awaitingGroundsNotice = {
        ...defaultRRACompliance.awaitingGroundsNotice,
        status: 'not-applicable',
        required: false,
        notes: 'Will be required for next tenancy agreement',
      }
      updatedCompliance.writtenStatementOfTerms = {
        ...defaultRRACompliance.writtenStatementOfTerms,
        status: 'not-applicable',
        required: false,
        notes: 'Will be provided with new tenancy agreement',
      }
    }

    // Update the property
    const { error: updateError } = await supabase
      .from('properties')
      .update({ compliance: updatedCompliance })
      .eq('id', property.id)

    if (updateError) {
      console.error(`Error updating property ${property.id}:`, updateError)
    } else {
      console.log(`✓ Updated property ${property.id} (${property.address})`)
      updatedCount++
    }
  }

  console.log(`\nMigration complete:`)
  console.log(`- Updated: ${updatedCount}`)
  console.log(`- Skipped: ${skippedCount}`)
  console.log(`- Total: ${properties.length}`)

  return {
    success: true,
    updated: updatedCount,
    skipped: skippedCount,
    total: properties.length,
  }
}
