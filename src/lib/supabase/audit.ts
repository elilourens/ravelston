import { SupabaseClient } from '@supabase/supabase-js'

export async function logAuditEvent(
  supabase: SupabaseClient,
  propertyId: string,
  eventType: string,
  description: string,
  metadata?: any
) {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error('No authenticated user found')
      return false
    }

    const { error } = await supabase
      .from('audit_events')
      .insert({
        user_id: user.id,
        property_id: propertyId,
        event_type: eventType,
        description,
        metadata: metadata || null,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Failed to log audit event:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error logging audit event:', err)
    return false
  }
}
