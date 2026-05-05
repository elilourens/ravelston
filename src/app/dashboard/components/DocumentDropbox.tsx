'use client'

import { useState } from 'react'
import { Property, getStatusFromExpiry } from '../properties/mock-data'

interface ExtractedData {
  propertyAddress: string
  postcode: string
  complianceType: 'gasSafetyCertificate' | 'eicr' | 'epc' | 'depositProtection' | 'rightToRent' | 'legionellaAssessment' | 'buildingInsurance' | 'landlordInsurance' | 'prsDatabase' | 'hmoLicense'
  issueDate?: string
  expiryDate?: string
  certificateNumber?: string
  issuedBy?: string
  confidence: number
  matchedPropertyId?: string
  matchConfidence?: number
  rawText?: string
}

interface DocumentDropboxProps {
  properties: Property[]
  onDocumentProcessed: (propertyId: string, complianceType: string, data: any) => void
}

export default function DocumentDropbox({ properties, onDocumentProcessed }: DocumentDropboxProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await processFile(files[0])
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  const findMatchingProperty = (address: string, postcode: string): { property: Property | null, confidence: number } => {
    const normalizeStr = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ')

    for (const property of properties) {
      const addressMatch = normalizeStr(property.address).includes(normalizeStr(address)) ||
                          normalizeStr(address).includes(normalizeStr(property.address))
      const postcodeMatch = normalizeStr(property.postcode) === normalizeStr(postcode)

      if (postcodeMatch && addressMatch) {
        return { property, confidence: 0.95 }
      }
      if (postcodeMatch) {
        return { property, confidence: 0.75 }
      }
      if (addressMatch) {
        return { property, confidence: 0.6 }
      }
    }

    return { property: null, confidence: 0 }
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setUploadedFile(file)

    try {
      // Create FormData to send file
      const formData = new FormData()
      formData.append('file', file)

      // Call API route to process document
      const response = await fetch('/api/process-document', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process document')
      }

      const data: ExtractedData = await response.json()

      // Try to match property
      const { property, confidence } = findMatchingProperty(data.propertyAddress, data.postcode)

      if (property) {
        data.matchedPropertyId = property.id
        data.matchConfidence = confidence
      }

      setExtractedData(data)
      setShowConfirmModal(true)
    } catch (error) {
      console.error('Error processing document:', error)
      alert('Failed to process document. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirm = () => {
    if (!extractedData || !extractedData.matchedPropertyId) {
      alert('Please select a property to link this document to.')
      return
    }

    // Calculate status based on expiry date
    const status = getStatusFromExpiry(extractedData.expiryDate)

    onDocumentProcessed(extractedData.matchedPropertyId, extractedData.complianceType, {
      status,
      issueDate: extractedData.issueDate,
      expiryDate: extractedData.expiryDate,
      certificateNumber: extractedData.certificateNumber,
      issuedBy: extractedData.issuedBy,
      documentUrl: URL.createObjectURL(uploadedFile!),
    })

    setShowConfirmModal(false)
    setExtractedData(null)
    setUploadedFile(null)
    alert('Document processed and saved successfully!')
  }

  const getComplianceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      gasSafetyCertificate: 'Gas Safety Certificate',
      eicr: 'EICR (Electrical Safety)',
      epc: 'EPC (Energy Performance)',
      depositProtection: 'Deposit Protection',
      rightToRent: 'Right to Rent',
      legionellaAssessment: 'Legionella Risk Assessment',
      buildingInsurance: 'Building Insurance',
      landlordInsurance: 'Landlord Insurance',
      prsDatabase: 'PRS Database Registration',
      hmoLicense: 'HMO License',
    }
    return labels[type] || type
  }

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed var(--emerald)' : '2px dashed var(--forest)',
          background: isDragging ? 'rgba(16,185,129,.05)' : 'var(--cream-2)',
          padding: '40px',
          textAlign: 'center',
          transition: 'all 0.2s',
          position: 'relative',
        }}
      >
        <div className="display" style={{ fontSize: 20, color: 'var(--forest)', marginBottom: 8 }}>
          Document Dropbox
        </div>
        <p style={{ fontSize: 14, color: 'var(--forest-ink)', marginBottom: 20, lineHeight: 1.6 }}>
          Drop compliance documents here to automatically extract property details and update records
        </p>

        {isProcessing ? (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: 14, color: 'var(--forest)', marginBottom: 8 }}>
              Processing document...
            </div>
            <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
              Extracting text and analyzing with AI
            </div>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileInput}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="smallcaps"
              style={{
                display: 'inline-block',
                padding: '10px 18px',
                background: 'var(--forest)',
                color: 'var(--cream)',
                fontSize: 11,
                letterSpacing: '.18em',
                cursor: 'pointer',
                boxShadow: '3px 3px 0 var(--emerald)',
              }}
            >
              Choose File
            </label>
            <div style={{ fontSize: 11, color: 'var(--forest-ink)', marginTop: 12 }}>
              Supports: Images (JPG, PNG) and PDFs
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && extractedData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          zIndex: 2000,
        }}>
          <div style={{
            background: 'var(--cream)',
            border: '2px solid var(--forest)',
            padding: 40,
            maxWidth: 600,
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div className="display" style={{ fontSize: 28, color: 'var(--forest)', marginBottom: 8 }}>
              Review Extracted Data
            </div>
            <p style={{ fontSize: 13, color: 'var(--forest-ink)', marginBottom: 24 }}>
              Please review and confirm the information extracted from your document.
            </p>

            {/* Property Match Status */}
            {!extractedData.matchedPropertyId ? (
              <div style={{
                padding: '16px 20px',
                background: 'rgba(217,119,6,.1)',
                borderLeft: '4px solid #d97706',
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#d97706', marginBottom: 4 }}>
                  ⚠ No Property Match Found
                </div>
                <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
                  Could not automatically match this document to a property. Please select manually below.
                </div>
              </div>
            ) : (
              <div style={{
                padding: '16px 20px',
                background: 'rgba(16,185,129,.1)',
                borderLeft: '4px solid var(--emerald)',
                marginBottom: 24,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--emerald)', marginBottom: 4 }}>
                  ✓ Property Matched
                </div>
                <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
                  Matched to: {properties.find(p => p.id === extractedData.matchedPropertyId)?.address}
                  {extractedData.matchConfidence && (
                    <span style={{ marginLeft: 8, fontWeight: 500 }}>
                      (Confidence: {Math.round(extractedData.matchConfidence * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            )}

            <div style={{
              background: 'var(--cream-2)',
              padding: 20,
              marginBottom: 24,
              border: '1px solid var(--forest)',
            }}>
              {/* Property Selection */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Link to Property *
                </div>
                <select
                  value={extractedData.matchedPropertyId || ''}
                  onChange={(e) => setExtractedData({ ...extractedData, matchedPropertyId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: extractedData.matchedPropertyId ? '1px solid var(--forest)' : '2px solid #d97706',
                    background: 'var(--cream)',
                    fontSize: 14,
                    color: 'var(--forest)',
                  }}
                >
                  <option value="">-- Select Property --</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.address} ({property.postcode})
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Property Address
                </div>
                <input
                  type="text"
                  value={extractedData.propertyAddress}
                  onChange={(e) => setExtractedData({ ...extractedData, propertyAddress: e.target.value })}
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

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Postcode
                </div>
                <input
                  type="text"
                  value={extractedData.postcode}
                  onChange={(e) => setExtractedData({ ...extractedData, postcode: e.target.value })}
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

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'var(--forest-ink)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  Document Type
                </div>
                <select
                  value={extractedData.complianceType}
                  onChange={(e) => setExtractedData({ ...extractedData, complianceType: e.target.value as any })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--forest)',
                    background: 'var(--cream)',
                    fontSize: 14,
                    color: 'var(--forest)',
                  }}
                >
                  <option value="gasSafetyCertificate">Gas Safety Certificate</option>
                  <option value="eicr">EICR (Electrical Safety)</option>
                  <option value="epc">EPC (Energy Performance)</option>
                  <option value="depositProtection">Deposit Protection</option>
                  <option value="rightToRent">Right to Rent</option>
                  <option value="legionellaAssessment">Legionella Risk Assessment</option>
                  <option value="buildingInsurance">Building Insurance</option>
                  <option value="landlordInsurance">Landlord Insurance</option>
                </select>
              </div>

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

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setExtractedData(null)
                  setUploadedFile(null)
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
                onClick={handleConfirm}
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
    </>
  )
}
