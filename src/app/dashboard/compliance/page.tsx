'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Property, getStatusFromExpiry, getDaysUntilExpiry, getPetRequestStatus } from '../properties/mock-data'
import { createClient } from '@/lib/supabase/client'
import { fetchProperties } from '@/lib/supabase/properties'

// Human-readable labels for compliance types
const complianceLabels: Record<string, string> = {
  gasSafetyCertificate: 'Gas Safety Certificate',
  eicr: 'EICR',
  epc: 'EPC',
  smokeAlarms: 'Smoke Alarms',
  coAlarms: 'CO Alarms',
  depositProtection: 'Deposit Protection',
  rightToRent: 'Right to Rent',
  legionellaAssessment: 'Legionella Assessment',
  buildingInsurance: 'Building Insurance',
  landlordInsurance: 'Landlord Insurance',
  prsDatabase: 'PRS Database',
  hmoLicense: 'HMO License',
  // Renters' Rights Act 2025 items
  rraInformationSheet: 'RRA Information Sheet',
  petRequestTracking: 'Pet Request Tracking',
  awaitingGroundsNotice: 'Awaiting Grounds Notice',
  ombudsmanMembership: 'Ombudsman Membership',
  writtenStatementOfTerms: 'Written Statement of Terms',
}

interface ComplianceIssue {
  propertyId: string
  propertyAddress: string
  propertyPostcode: string
  propertyReference?: string
  complianceType: string
  complianceLabel: string
  status: string
  issueDate?: string
  expiryDate?: string
  daysUntil?: number
  certificateNumber?: string
  issuedBy?: string
  required: boolean
}

export default function CompliancePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [issues, setIssues] = useState<ComplianceIssue[]>([])
  const [filteredIssues, setFilteredIssues] = useState<ComplianceIssue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showExpired, setShowExpired] = useState(true)
  const [showRequired, setShowRequired] = useState(true)
  const [showExpiring, setShowExpiring] = useState(false)
  const [showCompliant, setShowCompliant] = useState(false)
  const [propertyFilter, setPropertyFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const supabase = createClient()

  // Load properties and extract compliance issues
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await fetchProperties(supabase)
      setProperties(data)

      // Extract all compliance items as individual issues
      const allIssues: ComplianceIssue[] = []

      data.forEach(property => {
        Object.entries(property.compliance).forEach(([key, item]) => {
          // Use custom label mapping or fallback to formatted key
          const label = complianceLabels[key] || key.replace(/([A-Z])/g, ' $1').trim()

          // Special handling for pet request tracking
          if (key === 'petRequestTracking' && 'requests' in item && Array.isArray(item.requests)) {
            // For each pending pet request, create a separate issue
            item.requests.forEach((request: any) => {
              if (request.status === 'pending') {
                const petStatus = getPetRequestStatus(request.responseDeadline, request.status)
                allIssues.push({
                  propertyId: property.id,
                  propertyAddress: property.address,
                  propertyPostcode: property.postcode,
                  propertyReference: property.propertyReference,
                  complianceType: `petRequest-${request.id}`,
                  complianceLabel: `Pet Request - ${request.petType}`,
                  status: petStatus,
                  issueDate: request.requestDate,
                  expiryDate: request.responseDeadline,
                  daysUntil: getDaysUntilExpiry(request.responseDeadline),
                  issuedBy: request.petDetails,
                  required: true,
                })
              }
            })
            // Still add the main tracking item
          }

          const currentStatus = item.expiryDate ? getStatusFromExpiry(item.expiryDate) : item.status
          const daysUntil = item.expiryDate ? getDaysUntilExpiry(item.expiryDate) : undefined

          allIssues.push({
            propertyId: property.id,
            propertyAddress: property.address,
            propertyPostcode: property.postcode,
            propertyReference: property.propertyReference,
            complianceType: key,
            complianceLabel: label,
            status: currentStatus,
            issueDate: item.issueDate,
            expiryDate: item.expiryDate,
            daysUntil,
            certificateNumber: item.certificateNumber,
            issuedBy: item.issuedBy,
            required: item.required,
          })
        })
      })

      setIssues(allIssues)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Filter issues
  useEffect(() => {
    let filtered = [...issues]

    // Filter by status checkboxes
    const enabledStatuses: string[] = []
    if (showExpired) enabledStatuses.push('expired')
    if (showRequired) enabledStatuses.push('required')
    if (showExpiring) enabledStatuses.push('expiring-soon')
    if (showCompliant) enabledStatuses.push('valid', 'not-applicable')

    if (enabledStatuses.length > 0) {
      filtered = filtered.filter(issue => enabledStatuses.includes(issue.status))
    } else {
      // If nothing is checked, show nothing
      filtered = []
    }

    // Filter by property
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(issue => issue.propertyId === propertyFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(issue =>
        issue.propertyAddress.toLowerCase().includes(query) ||
        issue.complianceLabel.toLowerCase().includes(query) ||
        issue.propertyPostcode.toLowerCase().includes(query) ||
        issue.propertyReference?.toLowerCase().includes(query)
      )
    }

    // Sort by urgency (expired first, then expiring soon, then by days)
    filtered.sort((a, b) => {
      const statusOrder = { 'expired': 0, 'required': 1, 'expiring-soon': 2, 'valid': 3, 'not-applicable': 4 }
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 99
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 99

      if (aOrder !== bOrder) return aOrder - bOrder

      // If same status, sort by days until expiry
      if (a.daysUntil !== undefined && b.daysUntil !== undefined) {
        return a.daysUntil - b.daysUntil
      }

      return 0
    })

    setFilteredIssues(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [issues, showExpired, showRequired, showExpiring, showCompliant, propertyFilter, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedIssues = filteredIssues.slice(startIndex, endIndex)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'valid':
        return { bg: 'rgba(16,185,129,.1)', color: 'var(--emerald)', label: 'Valid' }
      case 'expiring-soon':
        return { bg: 'rgba(217,119,6,.1)', color: '#d97706', label: 'Expiring Soon' }
      case 'expired':
        return { bg: 'rgba(255,185,229,.2)', color: 'var(--pink-ink)', label: 'Expired' }
      case 'required':
        return { bg: 'rgba(255,185,229,.2)', color: 'var(--pink-ink)', label: 'Required' }
      case 'not-applicable':
        return { bg: 'var(--cream-2)', color: 'var(--forest-ink)', label: 'N/A' }
      default:
        return { bg: 'var(--cream-2)', color: 'var(--forest-ink)', label: status }
    }
  }

  const stats = {
    total: issues.length,
    expired: issues.filter(i => i.status === 'expired' || i.status === 'required').length,
    expiring: issues.filter(i => i.status === 'expiring-soon').length,
    valid: issues.filter(i => i.status === 'valid').length,
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
        maxWidth: 1400, margin: "0 auto",
      }}>
        <Link href="/dashboard" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: "var(--emerald)",
          marginBottom: 20,
          textDecoration: "none",
        }}>
          ← Back to dashboard
        </Link>

        <div style={{ marginBottom: 32 }}>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,56px)", lineHeight: 1, color: "var(--emerald)", marginBottom: 8 }}>
            Compliance Issues.
          </div>
          <p style={{ fontSize: 14, color: "var(--forest-ink)", margin: 0 }}>
            Monitor and manage all compliance requirements across your portfolio
          </p>
        </div>

        {/* RRA 2025 Deadline Notice */}
        <div style={{
          background: "linear-gradient(135deg, rgba(16,185,129,.15) 0%, rgba(16,185,129,.05) 100%)",
          border: "2px solid var(--emerald)",
          padding: "20px 24px",
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <div style={{
            background: "var(--emerald)",
            color: "white",
            padding: "8px 12px",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: 1,
            borderRadius: 4,
          }}>
            ⚖️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--forest)", marginBottom: 4 }}>
              Renters' Rights Act 2025 Deadline: 31 May 2026
            </div>
            <p style={{ fontSize: 13, color: "var(--forest-ink)", margin: 0, lineHeight: 1.5 }}>
              New compliance requirements are now in effect. Ensure RRA Information Sheets are delivered to existing tenants by 31 May 2026 to avoid fines up to £7,000.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 32 }}>
          <div style={{ padding: "16px", background: "var(--cream-2)", border: "1px solid var(--forest)", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Total Items</div>
            <div className="display" style={{ fontSize: 32, color: "var(--forest)" }}>{stats.total}</div>
          </div>
          <div style={{ padding: "16px", background: "rgba(255,185,229,.1)", border: "1px solid var(--pink-ink)", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Expired</div>
            <div className="display" style={{ fontSize: 32, color: "var(--pink-ink)" }}>{stats.expired}</div>
          </div>
          <div style={{ padding: "16px", background: "rgba(217,119,6,.1)", border: "1px solid #d97706", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Expiring Soon</div>
            <div className="display" style={{ fontSize: 32, color: "#d97706" }}>{stats.expiring}</div>
          </div>
          <div style={{ padding: "16px", background: "rgba(16,185,129,.1)", border: "1px solid var(--emerald)", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Valid</div>
            <div className="display" style={{ fontSize: 32, color: "var(--emerald)" }}>{stats.valid}</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          background: "var(--cream-2)",
          border: "1px solid var(--forest)",
          padding: "20px 24px",
          marginBottom: 24,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 16 }}>
            {/* Search */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Address, postcode, type..."
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                  color: "var(--forest)",
                }}
              />
            </div>

            {/* Property Filter */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".1em" }}>
                Property
              </label>
              <select
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--forest)",
                  background: "var(--cream)",
                  fontSize: 13,
                  color: "var(--forest)",
                }}
              >
                <option value="all">All Properties</option>
                {properties.map(prop => (
                  <option key={prop.id} value={prop.id}>{prop.address}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Checkboxes */}
          <div style={{ paddingTop: 16, borderTop: "1px solid var(--forest)" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--forest)", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".1em" }}>
              Show Status Types
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--pink-ink)", fontWeight: 500 }}>
                  Expired
                </span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showRequired}
                  onChange={(e) => setShowRequired(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--pink-ink)", fontWeight: 500 }}>
                  Required
                </span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showExpiring}
                  onChange={(e) => setShowExpiring(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "#d97706", fontWeight: 500 }}>
                  Expiring Soon
                </span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={showCompliant}
                  onChange={(e) => setShowCompliant(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <span style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 500 }}>
                  Compliant
                </span>
              </label>
              <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--forest-ink)", alignSelf: "center" }}>
                Showing {filteredIssues.length} of {issues.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--forest-ink)' }}>
            <div className="display" style={{ fontSize: 24, marginBottom: 12 }}>Loading compliance data...</div>
          </div>
        ) : filteredIssues.length === 0 ? (
          <div style={{
            padding: "60px 40px",
            textAlign: "center",
            border: "1px dashed var(--forest-ink)",
            background: "var(--cream-2)",
          }}>
            <div className="display" style={{ fontSize: 24, color: "var(--forest-ink)", marginBottom: 12 }}>
              No issues found
            </div>
            <p style={{ fontSize: 14, color: "var(--forest-ink)" }}>
              Try adjusting your filters or selecting different status types
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "var(--cream)", border: "1px solid var(--forest)" }}>
              <thead>
                <tr style={{ background: "var(--forest)", color: "var(--cream)" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Property</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Compliance Type</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Status</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Expiry Date</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Days</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Issued By</th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedIssues.map((issue, idx) => {
                  const statusStyle = getStatusStyle(issue.status)
                  return (
                    <tr key={`${issue.propertyId}-${issue.complianceType}`} style={{ borderBottom: idx < paginatedIssues.length - 1 ? "1px solid var(--forest)" : "none" }}>
                      <td style={{ padding: "16px", fontSize: 13 }}>
                        <div style={{ fontWeight: 500, color: "var(--forest)", marginBottom: 4 }}>{issue.propertyAddress}</div>
                        <div style={{ fontSize: 11, color: "var(--forest-ink)" }}>
                          {issue.propertyPostcode}
                          {issue.propertyReference && ` • ${issue.propertyReference}`}
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--forest)", fontWeight: 500 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span>{issue.complianceLabel}</span>
                          {/* Badge for RRA items */}
                          {(issue.complianceType === 'rraInformationSheet' ||
                            issue.complianceType === 'petRequestTracking' ||
                            issue.complianceType.startsWith('petRequest-') ||
                            issue.complianceType === 'awaitingGroundsNotice' ||
                            issue.complianceType === 'ombudsmanMembership' ||
                            issue.complianceType === 'writtenStatementOfTerms') && (
                            <span style={{
                              padding: "2px 6px",
                              background: "var(--emerald)",
                              color: "white",
                              fontSize: 8,
                              fontWeight: 700,
                              letterSpacing: ".1em",
                              textTransform: "uppercase",
                              borderRadius: 2,
                            }}>
                              RRA 2025
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "16px" }}>
                        <div style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          borderRadius: 2,
                        }}>
                          {statusStyle.label}
                        </div>
                      </td>
                      <td style={{ padding: "16px", fontSize: 13, color: "var(--forest)" }}>
                        {issue.expiryDate ? new Date(issue.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td style={{ padding: "16px", fontSize: 13 }}>
                        {issue.daysUntil !== undefined ? (
                          <span style={{
                            color: issue.daysUntil < 0 ? 'var(--pink-ink)' : issue.daysUntil <= 60 ? '#d97706' : 'var(--emerald)',
                            fontWeight: 500,
                          }}>
                            {issue.daysUntil < 0 ? `${Math.abs(issue.daysUntil)}d overdue` : `${issue.daysUntil}d`}
                          </span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: "16px", fontSize: 12, color: "var(--forest-ink)" }}>
                        {issue.issuedBy || '—'}
                      </td>
                      <td style={{ padding: "16px", textAlign: "center" }}>
                        <Link
                          href={`/dashboard/properties/${issue.propertyId}`}
                          className="smallcaps"
                          style={{
                            padding: "6px 12px",
                            background: "var(--forest)",
                            color: "var(--cream)",
                            fontSize: 9,
                            letterSpacing: ".15em",
                            textDecoration: "none",
                            display: "inline-block",
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                marginTop: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}>
                <div style={{ fontSize: 13, color: "var(--forest-ink)" }}>
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredIssues.length)} of {filteredIssues.length} items
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="smallcaps"
                    style={{
                      padding: "8px 16px",
                      background: currentPage === 1 ? "var(--cream-2)" : "var(--forest)",
                      color: currentPage === 1 ? "var(--forest-ink)" : "var(--cream)",
                      fontSize: 10,
                      letterSpacing: ".15em",
                      border: `1px solid ${currentPage === 1 ? "var(--forest-ink)" : "var(--forest)"}`,
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                  >
                    ← Previous
                  </button>

                  <div style={{ display: "flex", gap: 4 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = page === 1 ||
                                      page === totalPages ||
                                      (page >= currentPage - 1 && page <= currentPage + 1)

                      // Show ellipsis
                      const showEllipsisBefore = page === currentPage - 2 && currentPage > 3
                      const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return <span key={page} style={{ padding: "0 4px", color: "var(--forest-ink)" }}>...</span>
                      }

                      if (!showPage) return null

                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: "8px 12px",
                            background: currentPage === page ? "var(--forest)" : "var(--cream)",
                            color: currentPage === page ? "var(--cream)" : "var(--forest)",
                            fontSize: 13,
                            border: "1px solid var(--forest)",
                            cursor: "pointer",
                            fontWeight: currentPage === page ? 600 : 400,
                          }}
                        >
                          {page}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="smallcaps"
                    style={{
                      padding: "8px 16px",
                      background: currentPage === totalPages ? "var(--cream-2)" : "var(--forest)",
                      color: currentPage === totalPages ? "var(--forest-ink)" : "var(--cream)",
                      fontSize: 10,
                      letterSpacing: ".15em",
                      border: `1px solid ${currentPage === totalPages ? "var(--forest-ink)" : "var(--forest)"}`,
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
