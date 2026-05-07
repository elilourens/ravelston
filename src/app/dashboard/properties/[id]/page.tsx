'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Property, ComplianceItem, getDaysUntilExpiry, getStatusFromExpiry } from '../mock-data'
import { createClient } from '@/lib/supabase/client'
import { updateProperty, deleteProperty, updatePropertyCompliance } from '@/lib/supabase/properties'
import { logAuditEvent } from '@/lib/supabase/audit'
import { uploadCertificateFile } from '@/lib/supabase/storage'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'compliance' | 'tenancy'>('compliance')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingCert, setEditingCert] = useState<{ type: string; data: any } | null>(null)
  const [certFormData, setCertFormData] = useState<any>({})
  const [editFormData, setEditFormData] = useState({
    address: '',
    postcode: '',
    type: 'house' as Property['type'],
    bedrooms: 1,
    propertyReference: '',
    status: 'vacant' as Property['status'],
  })
  const [auditHistory, setAuditHistory] = useState<Record<string, any[]>>({})
  const [showHistory, setShowHistory] = useState<string | null>(null)
  const [uploadingCert, setUploadingCert] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showExtractModal, setShowExtractModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const supabase = createClient()

  // Load property from Supabase
  useEffect(() => {
    async function loadProperty() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()

      if (error || !data) {
        setProperty(null)
      } else {
        const prop: Property = {
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
        setProperty(prop)
        setEditFormData({
          address: prop.address,
          postcode: prop.postcode,
          type: prop.type,
          bedrooms: prop.bedrooms,
          propertyReference: prop.propertyReference || '',
          status: prop.status,
        })
      }
      setIsLoading(false)
    }
    loadProperty()
  }, [propertyId])

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!property) return

    const updated = await updateProperty(supabase, property.id, {
      ...property,
      address: editFormData.address,
      postcode: editFormData.postcode,
      type: editFormData.type,
      bedrooms: editFormData.bedrooms,
      propertyReference: editFormData.propertyReference || undefined,
      status: editFormData.status,
    })

    if (updated) {
      setProperty(updated)
      setShowEditModal(false)
    } else {
      alert('Failed to update property')
    }
  }

  const handleDelete = async () => {
    if (!property) return

    const success = await deleteProperty(supabase, property.id)
    if (success) {
      router.push('/dashboard/properties')
    } else {
      alert('Failed to delete property')
    }
  }

  const handleCertEdit = (type: string, data: any) => {
    setEditingCert({ type, data })
    setCertFormData(data)
  }

  const handleCertSave = async () => {
    if (!property || !editingCert) return

    // Capture old values for audit trail
    const oldData = editingCert.data

    // Recalculate status based on expiry date
    const updatedData = {
      ...certFormData,
      status: certFormData.expiryDate ? getStatusFromExpiry(certFormData.expiryDate) : certFormData.status,
    }

    // Calculate what changed
    const changes: Record<string, { old: any; new: any }> = {}
    const fields = ['issueDate', 'expiryDate', 'certificateNumber', 'issuedBy', 'notes', 'status']

    fields.forEach(field => {
      if (oldData[field] !== updatedData[field]) {
        changes[field] = {
          old: oldData[field] || null,
          new: updatedData[field] || null,
        }
      }
    })

    const updated = await updatePropertyCompliance(
      supabase,
      property.id,
      editingCert.type,
      updatedData
    )

    if (updated) {
      setProperty(updated)

      // Log with detailed changes
      await logAuditEvent(
        supabase,
        property.id,
        'compliance_updated',
        `Updated ${editingCert.type} certification`,
        { changes }
      )

      setEditingCert(null)
      setCertFormData({})
      // Refresh history for this cert if it's being shown
      if (showHistory === editingCert.type) {
        await loadAuditHistory(editingCert.type)
      }
      alert('Certification updated successfully!')
    } else {
      alert('Failed to update certification')
    }
  }

  const loadAuditHistory = async (complianceKey: string) => {
    if (!property) return

    const { data, error } = await supabase
      .from('audit_events')
      .select('*')
      .eq('property_id', property.id)
      .ilike('description', `%${complianceKey}%`)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAuditHistory({ ...auditHistory, [complianceKey]: data })
    }
  }

  const toggleHistory = async (complianceKey: string) => {
    if (showHistory === complianceKey) {
      setShowHistory(null)
    } else {
      setShowHistory(complianceKey)
      if (!auditHistory[complianceKey]) {
        await loadAuditHistory(complianceKey)
      }
    }
  }

  const handleFileUpload = async (complianceKey: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !property) return

    setIsProcessing(true)
    setUploadingCert(complianceKey)
    setUploadedFile(file)

    try {
      // Process file with AI
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process document')
      }

      const data = await response.json()
      setExtractedData(data)
      setShowExtractModal(true)
    } catch (error) {
      console.error('Error processing document:', error)
      alert('Failed to process document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmExtraction = async () => {
    if (!property || !uploadingCert || !uploadedFile || !extractedData) return

    try {
      // Upload file to storage
      const uploadResult = await uploadCertificateFile(
        supabase,
        property.id,
        uploadingCert,
        uploadedFile
      )

      if (!uploadResult) {
        alert('Failed to upload file')
        return
      }

      // Update compliance with extracted data + file URL
      const updatedData = {
        status: extractedData.expiryDate ? getStatusFromExpiry(extractedData.expiryDate) : 'required',
        issueDate: extractedData.issueDate,
        expiryDate: extractedData.expiryDate,
        certificateNumber: extractedData.certificateNumber,
        issuedBy: extractedData.issuedBy,
        documentUrl: uploadResult.url,
        documentPath: uploadResult.path,
      }

      const updated = await updatePropertyCompliance(
        supabase,
        property.id,
        uploadingCert,
        updatedData
      )

      if (updated) {
        setProperty(updated)
        await logAuditEvent(
          supabase,
          property.id,
          'compliance_updated',
          `Uploaded and updated ${uploadingCert} certification via AI extraction`,
          {
            extractedData,
            fileUrl: uploadResult.url,
            confidence: extractedData.confidence,
          }
        )

        setShowExtractModal(false)
        setExtractedData(null)
        setUploadedFile(null)
        setUploadingCert(null)
        alert('Certificate uploaded and updated successfully!')
      }
    } catch (error) {
      console.error('Error saving certificate:', error)
      alert('Failed to save certificate')
    }
  }

  if (isLoading) {
    return (
      <div className="paper" style={{ maxWidth: 1440, margin: "0 auto", padding: 40, textAlign: 'center' }}>
        <div style={{ color: "var(--forest-ink)" }}>Loading property...</div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="paper" style={{ maxWidth: 1440, margin: "0 auto", padding: 40 }}>
        <div className="display" style={{ fontSize: 32, color: "var(--forest)" }}>
          Property not found
        </div>
        <Link href="/dashboard/properties" style={{ color: "var(--emerald)", marginTop: 16, display: "inline-block" }}>
          ← Back to properties
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'valid': return { color: 'var(--emerald)', bg: 'rgba(16,185,129,.1)', label: 'Valid' }
      case 'expiring-soon': return { color: '#d97706', bg: 'rgba(217,119,6,.1)', label: 'Expiring Soon' }
      case 'expired': return { color: 'var(--pink-ink)', bg: 'rgba(255,185,229,.2)', label: 'Expired' }
      case 'required': return { color: 'var(--pink-ink)', bg: 'rgba(255,185,229,.2)', label: 'Required' }
      case 'not-applicable': return { color: 'var(--forest-ink)', bg: 'var(--cream-2)', label: 'N/A' }
    }
  }

  const renderComplianceCard = (
    title: string,
    item: ComplianceItem,
    description: string,
    complianceKey: string
  ) => {
    const statusStyle = getStatusColor(item.status)
    const daysRemaining = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : null

    return (
      <div style={{
        border: "1px solid var(--forest)",
        background: "var(--cream)",
        padding: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div className="display" style={{ fontSize: 18, color: "var(--forest)", lineHeight: 1.2 }}>
                {title}
              </div>
              {item.documentUrl && (
                <a
                  href={item.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View uploaded certificate"
                  style={{
                    fontSize: 14,
                    background: "rgba(16,185,129,.15)",
                    color: "var(--emerald)",
                    padding: "2px 6px",
                    borderRadius: 3,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  📎
                </a>
              )}
            </div>
            <div style={{ fontSize: 12, color: "var(--forest-ink)", marginBottom: 12 }}>
              {description}
            </div>
          </div>
          <div style={{
            padding: "4px 10px",
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: ".1em",
            background: statusStyle.bg,
            color: statusStyle.color,
            borderRadius: 2,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            {statusStyle.label}
          </div>
        </div>

        {item.status !== 'not-applicable' && item.status !== 'required' && (
          <>
            <div style={{ background: "var(--cream-2)", padding: 16, marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                {item.issueDate && (
                  <div>
                    <div style={{ color: "var(--forest-ink)", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Issue Date
                    </div>
                    <div style={{ color: "var(--forest)", fontWeight: 500 }}>
                      {new Date(item.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {item.expiryDate && (
                  <div>
                    <div style={{ color: "var(--forest-ink)", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Expiry Date
                    </div>
                    <div style={{ color: "var(--forest)", fontWeight: 500 }}>
                      {new Date(item.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                )}
                {item.certificateNumber && (
                  <div>
                    <div style={{ color: "var(--forest-ink)", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Certificate #
                    </div>
                    <div style={{ color: "var(--forest)", fontWeight: 500, fontFamily: "monospace", fontSize: 11 }}>
                      {item.certificateNumber}
                    </div>
                  </div>
                )}
                {item.issuedBy && (
                  <div>
                    <div style={{ color: "var(--forest-ink)", marginBottom: 4, fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Issued By
                    </div>
                    <div style={{ color: "var(--forest)", fontWeight: 500, fontSize: 11 }}>
                      {item.issuedBy}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {daysRemaining !== null && (
              <div style={{
                padding: "10px 12px",
                background: daysRemaining < 0 ? 'rgba(255,185,229,.1)' : daysRemaining <= 60 ? 'rgba(217,119,6,.05)' : 'rgba(16,185,129,.05)',
                borderLeft: `3px solid ${daysRemaining < 0 ? 'var(--pink-ink)' : daysRemaining <= 60 ? '#d97706' : 'var(--emerald)'}`,
                fontSize: 12,
                color: "var(--forest-ink)",
                marginBottom: 12,
              }}>
                {daysRemaining < 0 ? (
                  <span style={{ fontWeight: 600, color: "var(--pink-ink)" }}>
                    EXPIRED: {Math.abs(daysRemaining)} days overdue
                  </span>
                ) : daysRemaining <= 60 ? (
                  <span style={{ fontWeight: 600, color: "#d97706" }}>
                    EXPIRING SOON: {daysRemaining} days remaining
                  </span>
                ) : (
                  <span style={{ color: "var(--emerald)" }}>
                    Valid for {daysRemaining} days
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {item.status === 'required' && (
          <div style={{
            padding: "12px",
            background: 'rgba(255,185,229,.1)',
            borderLeft: `3px solid var(--pink-ink)`,
            fontSize: 12,
            color: "var(--pink-ink)",
            fontWeight: 500,
            marginBottom: 12,
          }}>
            ⚠️ This certificate is required before the property can be let
          </div>
        )}

        {item.notes && (
          <div style={{
            fontSize: 11,
            color: "var(--forest-ink)",
            fontStyle: "italic",
            padding: "8px 12px",
            background: "var(--cream-2)",
            marginBottom: 12,
          }}>
            Note: {item.notes}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => toggleHistory(complianceKey)}
            className="smallcaps"
            style={{
              padding: "6px 14px",
              background: showHistory === complianceKey ? "var(--emerald)" : "transparent",
              color: showHistory === complianceKey ? "var(--cream)" : "var(--forest)",
              fontSize: 9,
              letterSpacing: ".15em",
              border: `1px solid ${showHistory === complianceKey ? "var(--emerald)" : "var(--forest)"}`,
              cursor: "pointer",
            }}
          >
            {showHistory === complianceKey ? 'HIDE HISTORY' : 'VIEW HISTORY'}
          </button>
          <label
            htmlFor={`upload-${complianceKey}`}
            className="smallcaps"
            style={{
              padding: "6px 14px",
              background: "var(--emerald)",
              color: "var(--cream)",
              fontSize: 9,
              letterSpacing: ".15em",
              border: "none",
              cursor: "pointer",
              display: "inline-block",
            }}
          >
            {isProcessing && uploadingCert === complianceKey ? 'PROCESSING...' : 'UPLOAD'}
          </label>
          <input
            type="file"
            id={`upload-${complianceKey}`}
            accept="image/*,.pdf"
            onChange={(e) => handleFileUpload(complianceKey, e)}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
          <button
            onClick={() => handleCertEdit(complianceKey, item)}
            className="smallcaps"
            style={{
              padding: "6px 14px",
              background: "var(--forest)",
              color: "var(--cream)",
              fontSize: 9,
              letterSpacing: ".15em",
              border: "none",
              cursor: "pointer",
            }}
          >
            EDIT
          </button>
        </div>

        {/* Audit History Section */}
        {showHistory === complianceKey && (
          <div style={{
            marginTop: 16,
            borderTop: "1px solid var(--forest)",
            paddingTop: 16,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--forest)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: ".1em",
            }}>
              Change History
            </div>
            {auditHistory[complianceKey] && auditHistory[complianceKey].length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {auditHistory[complianceKey].map((event: any) => (
                  <div
                    key={event.id}
                    style={{
                      padding: "10px 12px",
                      background: "var(--cream-2)",
                      border: "1px solid var(--forest)",
                      fontSize: 11,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--forest)", fontSize: 12 }}>
                        Certification Updated
                      </span>
                      <span style={{ color: "var(--forest-ink)", fontSize: 10 }}>
                        {new Date(event.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {event.metadata?.changes && Object.keys(event.metadata.changes).length > 0 ? (
                      <div style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: "1px dashed var(--forest-ink)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}>
                        {Object.entries(event.metadata.changes).map(([field, change]: [string, any]) => {
                          const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
                          const formatValue = (val: any) => {
                            if (val === null || val === undefined || val === '') return <em style={{ color: 'var(--forest-ink)' }}>empty</em>
                            if (field.includes('Date')) {
                              return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            }
                            return val
                          }

                          return (
                            <div key={field} style={{ fontSize: 10 }}>
                              <span style={{ color: "var(--forest-ink)", fontWeight: 500 }}>{fieldLabel}:</span>{' '}
                              <span style={{
                                textDecoration: "line-through",
                                color: "var(--pink-ink)",
                                background: "rgba(255,185,229,.1)",
                                padding: "2px 4px",
                              }}>
                                {formatValue(change.old)}
                              </span>
                              {' → '}
                              <span style={{
                                color: "var(--emerald)",
                                background: "rgba(16,185,129,.1)",
                                padding: "2px 4px",
                                fontWeight: 500,
                              }}>
                                {formatValue(change.new)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div style={{ fontSize: 10, color: "var(--forest-ink)", fontStyle: "italic" }}>
                        No detailed changes recorded
                      </div>
                    )}

                    {/* Display uploaded certificate file */}
                    {event.metadata?.fileUrl && (
                      <div style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: "1px dashed var(--forest-ink)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <span style={{ fontSize: 10, color: "var(--forest-ink)", fontWeight: 500 }}>
                          📎 Certificate File:
                        </span>
                        <a
                          href={event.metadata.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: 10,
                            color: "var(--emerald)",
                            textDecoration: "none",
                            padding: "4px 8px",
                            background: "rgba(16,185,129,.1)",
                            border: "1px solid var(--emerald)",
                            fontWeight: 500,
                          }}
                        >
                          VIEW / DOWNLOAD
                        </a>
                        {event.metadata.confidence && (
                          <span style={{
                            fontSize: 9,
                            color: "var(--forest-ink)",
                            marginLeft: 4,
                            fontStyle: "italic",
                          }}>
                            (AI: {Math.round(event.metadata.confidence * 100)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: "12px",
                background: "var(--cream-2)",
                fontSize: 11,
                color: "var(--forest-ink)",
                textAlign: "center",
                fontStyle: "italic",
              }}>
                No history available
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="paper" style={{
      maxWidth: 1440, margin: "0 auto",
      borderLeft: "1px solid var(--forest)", borderRight: "1px solid var(--forest)",
      minHeight: "100vh",
    }}>
      {/* Header */}
      <header style={{ borderBottom: "1px solid var(--forest)", padding: "clamp(8px,1.5vw,14px) clamp(20px,5vw,40px)" }}>
        <hr className="hr-thin" style={{ margin: "0 0 4px" }} />
        <Link href="/dashboard" className="display" style={{
          fontSize: "clamp(28px,5vw,64px)", lineHeight: .9,
          letterSpacing: "-.025em", fontWeight: 500,
          color: "var(--forest)", display: "block", textAlign: "center"
        }}>
          Ravelston<span style={{ color: "var(--pink-ink)", fontStyle: "italic" }}>.ai</span>
        </Link>
        <hr className="hr-thin" style={{ margin: "4px 0 0" }} />
      </header>

      {/* Main */}
      <main style={{
        padding: "clamp(48px,8vw,96px) clamp(20px,5vw,40px)",
        maxWidth: 1200, margin: "0 auto",
      }}>
        <Link href="/dashboard/properties" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "var(--emerald)",
          marginBottom: 20,
          textDecoration: "none",
        }}>
          ← Back to properties
        </Link>

        {/* Property Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div className="display ital" style={{ fontSize: "clamp(40px,5vw,56px)", lineHeight: 1, color: "var(--forest)", marginBottom: 8 }}>
                {property.address}
              </div>
              <div style={{ fontSize: 16, color: "var(--forest-ink)", marginBottom: 16 }}>
                {property.postcode}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setShowEditModal(true)}
                className="smallcaps"
                style={{
                  padding: "10px 18px",
                  background: "var(--forest)",
                  color: "var(--cream)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  boxShadow: "3px 3px 0 var(--emerald)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Edit Property
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="smallcaps"
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  color: "var(--pink-ink)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  border: "1px solid var(--pink-ink)",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 14 }}>
            <div>
              <span style={{ color: "var(--forest-ink)" }}>Type: </span>
              <span style={{ color: "var(--forest)", fontWeight: 500, textTransform: "capitalize" }}>{property.type}</span>
            </div>
            <div>
              <span style={{ color: "var(--forest-ink)" }}>Bedrooms: </span>
              <span style={{ color: "var(--forest)", fontWeight: 500 }}>{property.bedrooms}</span>
            </div>
            {property.propertyReference && (
              <div>
                <span style={{ color: "var(--forest-ink)" }}>Ref: </span>
                <span style={{ color: "var(--forest)", fontWeight: 500, fontFamily: "monospace" }}>{property.propertyReference}</span>
              </div>
            )}
            <div>
              <span style={{ color: "var(--forest-ink)" }}>Status: </span>
              <span style={{
                color: "var(--forest)",
                fontWeight: 500,
                textTransform: "capitalize",
                padding: "2px 8px",
                background: property.status === 'occupied' ? 'rgba(16,185,129,.1)' : 'var(--cream-2)',
              }}>
                {property.status}
              </span>
            </div>
          </div>
        </div>

        <hr className="hr-thin" style={{ margin: "0 0 32px" }} />

        {/* Tabs */}
        <div style={{
          display: "flex",
          gap: 16,
          marginBottom: 32,
          borderBottom: "1px solid var(--forest)",
        }}>
          {(['overview', 'compliance', 'tenancy'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className="smallcaps"
              style={{
                padding: "12px 20px",
                background: selectedTab === tab ? "var(--forest)" : "transparent",
                color: selectedTab === tab ? "var(--cream)" : "var(--forest)",
                border: "none",
                fontSize: 11,
                letterSpacing: ".18em",
                cursor: "pointer",
                borderBottom: selectedTab === tab ? "none" : "1px solid transparent",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedTab === 'compliance' && (
          <div>
            <div className="display" style={{ fontSize: 28, color: "var(--emerald)", marginBottom: 8 }}>
              Compliance Tracking
            </div>
            <p style={{ fontSize: 14, color: "var(--forest-ink)", marginBottom: 32, lineHeight: 1.6 }}>
              Monitor all required safety certificates, licenses, and legal compliance requirements for this property.
              Items marked as "Expiring Soon" require renewal within 60 days.
            </p>

            <div style={{ display: "grid", gap: 24 }}>
              {/* Gas Safety */}
              {renderComplianceCard(
                'Gas Safety Certificate (CP12)',
                property.compliance.gasSafetyCertificate,
                'Annual gas safety check by Gas Safe registered engineer. Required for all properties with gas appliances.',
                'gasSafetyCertificate'
              )}

              {/* EICR */}
              {renderComplianceCard(
                'EICR (Electrical Safety)',
                property.compliance.eicr,
                'Electrical Installation Condition Report. Required every 5 years for all rental properties in England.',
                'eicr'
              )}

              {/* EPC */}
              {renderComplianceCard(
                'EPC (Energy Performance)',
                property.compliance.epc,
                'Energy Performance Certificate. Must be rated E or above to legally let the property. Valid for 10 years.',
                'epc'
              )}

              {/* Smoke Alarms */}
              {renderComplianceCard(
                'Smoke Alarms',
                property.compliance.smokeAlarms,
                'Required on every floor with living accommodation. Must be in working order at start of tenancy.',
                'smokeAlarms'
              )}

              {/* CO Alarms */}
              {renderComplianceCard(
                'Carbon Monoxide Alarms',
                property.compliance.coAlarms,
                'Required in every room with a fixed combustion appliance (except gas cookers).',
                'coAlarms'
              )}

              {/* Deposit Protection */}
              {renderComplianceCard(
                'Deposit Protection',
                property.compliance.depositProtection,
                'Tenant deposits must be protected in a government-approved scheme within 30 days of receipt.',
                'depositProtection'
              )}

              {/* Right to Rent */}
              {renderComplianceCard(
                'Right to Rent Check',
                property.compliance.rightToRent,
                'Legal requirement to verify tenant has right to rent in the UK before tenancy begins.',
                'rightToRent'
              )}

              {/* Legionella */}
              {renderComplianceCard(
                'Legionella Risk Assessment',
                property.compliance.legionellaAssessment,
                'Assessment of water systems to prevent Legionella bacteria. Required for all rental properties.',
                'legionellaAssessment'
              )}

              {/* Building Insurance */}
              {renderComplianceCard(
                'Building Insurance',
                property.compliance.buildingInsurance,
                'Comprehensive buildings insurance to protect the property structure and fixtures.',
                'buildingInsurance'
              )}

              {/* Landlord Insurance */}
              {renderComplianceCard(
                'Landlord Insurance',
                property.compliance.landlordInsurance,
                'Specialist landlord insurance including public liability and optional rent guarantee.',
                'landlordInsurance'
              )}

              {/* PRS Database */}
              {renderComplianceCard(
                'PRS Database Registration',
                property.compliance.prsDatabase,
                'New requirement under Renters\' Rights Act 2025. Mandatory registration phased from late 2026.',
                'prsDatabase'
              )}

              {/* HMO License (if applicable) */}
              {property.type === 'hmo' && property.compliance.hmoLicense && renderComplianceCard(
                'HMO License',
                property.compliance.hmoLicense,
                'Mandatory HMO licensing for properties with 5+ occupants from 2+ households.',
                'hmoLicense'
              )}
            </div>
          </div>
        )}

        {selectedTab === 'overview' && (
          <div>
            <div className="display" style={{ fontSize: 28, color: "var(--emerald)", marginBottom: 24 }}>
              Property Overview
            </div>
            <div style={{
              border: "1px solid var(--forest)",
              padding: 32,
              background: "var(--cream-2)",
            }}>
              <div style={{ fontSize: 14, color: "var(--forest-ink)" }}>
                Overview information coming soon. This will include property details, photos, floor plans, and maintenance history.
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'tenancy' && (
          <div>
            <div className="display" style={{ fontSize: 28, color: "var(--emerald)", marginBottom: 24 }}>
              Tenancy Information
            </div>
            {property.currentTenancy ? (
              <div style={{
                border: "1px solid var(--forest)",
                padding: 32,
                background: "var(--cream)",
              }}>
                <div style={{ display: "grid", gap: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                      Tenant Name
                    </div>
                    <div style={{ fontSize: 16, color: "var(--forest)", fontWeight: 500 }}>
                      {property.currentTenancy.tenantName}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                        Start Date
                      </div>
                      <div style={{ fontSize: 14, color: "var(--forest)" }}>
                        {new Date(property.currentTenancy.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                        End Date
                      </div>
                      <div style={{ fontSize: 14, color: "var(--forest)" }}>
                        {new Date(property.currentTenancy.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                        Monthly Rent
                      </div>
                      <div style={{ fontSize: 14, color: "var(--forest)" }}>
                        £{property.currentTenancy.monthlyRent.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                        Deposit Amount
                      </div>
                      <div style={{ fontSize: 14, color: "var(--forest)" }}>
                        £{property.currentTenancy.depositAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                border: "1px solid var(--forest)",
                padding: 32,
                background: "var(--cream-2)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 14, color: "var(--forest-ink)" }}>
                  No active tenancy
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Property Modal */}
      {showEditModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--cream)",
            border: "2px solid var(--forest)",
            padding: "clamp(32px,5vw,48px)",
            maxWidth: 560,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div className="display" style={{ fontSize: 32, color: "var(--forest)", marginBottom: 8 }}>
              Edit Property
            </div>
            <hr className="hr-thin" style={{ margin: "0 0 28px" }} />

            <form onSubmit={handleEdit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                  }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.postcode}
                  onChange={(e) => setEditFormData({ ...editFormData, postcode: e.target.value.toUpperCase() })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                    textTransform: "uppercase",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                    Property Type *
                  </label>
                  <select
                    value={editFormData.type}
                    onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value as Property['type'] })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--forest)",
                      background: "var(--cream)",
                      fontSize: 14,
                      color: "var(--forest)",
                    }}
                  >
                    <option value="house">House</option>
                    <option value="flat">Flat</option>
                    <option value="apartment">Apartment</option>
                    <option value="studio">Studio</option>
                    <option value="hmo">HMO</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={editFormData.bedrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bedrooms: parseInt(e.target.value) })}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--forest)",
                      background: "var(--cream)",
                      fontSize: 14,
                      color: "var(--forest)",
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Status *
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as Property['status'] })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                  }}
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="under-offer">Under Offer</option>
                </select>
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Property Reference (Optional)
                </label>
                <input
                  type="text"
                  value={editFormData.propertyReference}
                  onChange={(e) => setEditFormData({ ...editFormData, propertyReference: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                    fontFamily: "monospace",
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "10px 18px",
                    background: "transparent",
                    border: "1px solid var(--forest)",
                    color: "var(--forest)",
                    fontSize: 11,
                    letterSpacing: ".18em",
                    cursor: "pointer",
                  }}
                  className="smallcaps"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="smallcaps"
                  style={{
                    padding: "10px 18px",
                    background: "var(--forest)",
                    color: "var(--cream)",
                    fontSize: 11,
                    letterSpacing: ".18em",
                    boxShadow: "3px 3px 0 var(--emerald)",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Edit Modal */}
      {editingCert && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--cream)",
            border: "2px solid var(--forest)",
            padding: 40,
            maxWidth: 600,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div className="display" style={{ fontSize: 28, color: "var(--forest)", marginBottom: 8 }}>
              Edit Certification
            </div>
            <hr className="hr-thin" style={{ margin: "0 0 24px" }} />

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6 }}>
                Issue Date
              </label>
              <input
                type="date"
                value={certFormData.issueDate || ''}
                onChange={(e) => setCertFormData({ ...certFormData, issueDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6 }}>
                Expiry Date
              </label>
              <input
                type="date"
                value={certFormData.expiryDate || ''}
                onChange={(e) => setCertFormData({ ...certFormData, expiryDate: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6 }}>
                Certificate Number
              </label>
              <input
                type="text"
                value={certFormData.certificateNumber || ''}
                onChange={(e) => setCertFormData({ ...certFormData, certificateNumber: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                  fontFamily: "monospace",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6 }}>
                Issued By
              </label>
              <input
                type="text"
                value={certFormData.issuedBy || ''}
                onChange={(e) => setCertFormData({ ...certFormData, issuedBy: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6 }}>
                Notes
              </label>
              <textarea
                value={certFormData.notes || ''}
                onChange={(e) => setCertFormData({ ...certFormData, notes: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                  minHeight: 80,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setEditingCert(null); setCertFormData({}) }}
                className="smallcaps"
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "1px solid var(--forest)",
                  color: "var(--forest)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCertSave}
                className="smallcaps"
                style={{
                  padding: "10px 18px",
                  background: "var(--forest)",
                  color: "var(--cream)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  boxShadow: "3px 3px 0 var(--emerald)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          zIndex: 1000,
        }}>
          <div style={{
            background: "var(--cream)",
            border: "2px solid var(--pink-ink)",
            padding: 40,
            maxWidth: 480,
            width: "100%",
          }}>
            <div className="display" style={{ fontSize: 28, color: "var(--forest)", marginBottom: 12 }}>
              Delete Property?
            </div>
            <p style={{ fontSize: 14, color: "var(--forest-ink)", marginBottom: 24, lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{property.address}</strong>? This action cannot be undone and will permanently remove all property data and compliance records.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "10px 18px",
                  background: "transparent",
                  border: "1px solid var(--forest)",
                  color: "var(--forest)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  cursor: "pointer",
                }}
                className="smallcaps"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="smallcaps"
                style={{
                  padding: "10px 18px",
                  background: "var(--pink-ink)",
                  color: "var(--cream)",
                  fontSize: 11,
                  letterSpacing: ".18em",
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Extraction Review Modal */}
      {showExtractModal && extractedData && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          zIndex: 2000,
        }}>
          <div style={{
            background: "var(--cream)",
            border: "2px solid var(--forest)",
            padding: 40,
            maxWidth: 600,
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}>
            <div className="display" style={{ fontSize: 28, color: "var(--forest)", marginBottom: 8 }}>
              Review AI Extracted Data
            </div>
            <p style={{ fontSize: 13, color: "var(--forest-ink)", marginBottom: 24 }}>
              Please review and confirm the information extracted from your certificate.
            </p>

            <div style={{
              padding: '12px 16px',
              background: 'rgba(16,185,129,.1)',
              borderLeft: '3px solid var(--emerald)',
              fontSize: 12,
              color: 'var(--forest-ink)',
              marginBottom: 24,
            }}>
              AI Confidence: {Math.round(extractedData.confidence * 100)}%
            </div>

            <div style={{
              background: 'var(--cream-2)',
              padding: 20,
              marginBottom: 24,
              border: '1px solid var(--forest)',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Issue Date
                  </div>
                  <input
                    type="date"
                    value={extractedData.issueDate || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, issueDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--forest)',
                      background: 'var(--cream)',
                      fontSize: 14,
                      color: 'var(--forest)',
                    }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                    Expiry Date
                  </div>
                  <input
                    type="date"
                    value={extractedData.expiryDate || ''}
                    onChange={(e) => setExtractedData({ ...extractedData, expiryDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--forest)',
                      background: 'var(--cream)',
                      fontSize: 14,
                      color: 'var(--forest)',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Certificate Number
                </div>
                <input
                  type="text"
                  value={extractedData.certificateNumber || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, certificateNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--forest)',
                    background: 'var(--cream)',
                    fontSize: 14,
                    color: 'var(--forest)',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Issued By
                </div>
                <input
                  type="text"
                  value={extractedData.issuedBy || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, issuedBy: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--forest)',
                    background: 'var(--cream)',
                    fontSize: 14,
                    color: 'var(--forest)',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowExtractModal(false)
                  setExtractedData(null)
                  setUploadedFile(null)
                  setUploadingCert(null)
                }}
                style={{
                  padding: '10px 18px',
                  background: 'transparent',
                  border: '1px solid var(--forest)',
                  color: 'var(--forest)',
                  fontSize: 11,
                  letterSpacing: '.18em',
                  cursor: 'pointer',
                }}
                className="smallcaps"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmExtraction}
                className="smallcaps"
                style={{
                  padding: '10px 18px',
                  background: 'var(--forest)',
                  color: 'var(--cream)',
                  fontSize: 11,
                  letterSpacing: '.18em',
                  boxShadow: '3px 3px 0 var(--emerald)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
