import { SupabaseClient } from '@supabase/supabase-js'

export async function uploadCertificateFile(
  supabase: SupabaseClient,
  propertyId: string,
  certType: string,
  file: File
): Promise<{ path: string; url: string } | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const timestamp = Date.now()
    const fileName = `${certType}_${timestamp}.${fileExt}`
    const filePath = `${propertyId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('compliance-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('compliance-documents')
      .getPublicUrl(filePath)

    return { path: filePath, url: publicUrl }
  } catch (err) {
    console.error('Error uploading file:', err)
    return null
  }
}

export async function getCertificateFiles(
  supabase: SupabaseClient,
  propertyId: string,
  certType?: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase.storage
      .from('compliance-documents')
      .list(propertyId, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      console.error('Error listing files:', error)
      return []
    }

    if (certType) {
      return data.filter(file => file.name.startsWith(certType))
    }

    return data
  } catch (err) {
    console.error('Error getting files:', err)
    return []
  }
}

export async function deleteCertificateFile(
  supabase: SupabaseClient,
  filePath: string
): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('compliance-documents')
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (err) {
    console.error('Error deleting file:', err)
    return false
  }
}
