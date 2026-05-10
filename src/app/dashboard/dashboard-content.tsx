'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LogoutButton from './logout-button'
import DocumentDropbox from './components/DocumentDropbox'
import PropertyTable from './properties/components/PropertyTable'
import { Property, getStatusFromExpiry } from './properties/mock-data'
import { createClient } from '@/lib/supabase/client'
import { fetchProperties, updatePropertyCompliance } from '@/lib/supabase/properties'
import { seedPropertiesForUser } from '@/lib/supabase/seed-properties'

interface DashboardContentProps {
  userEmail: string
  userId: string
  userCreatedAt: string
}

export default function DashboardContent({ userEmail, userId, userCreatedAt }: DashboardContentProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  // Load properties from Supabase
  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true)
      let data = await fetchProperties(supabase)

      // If no properties exist, seed with demo data
      if (data.length === 0) {
        const result = await seedPropertiesForUser()
        if (result.success) {
          data = await fetchProperties(supabase)
        }
      }

      setProperties(data)
      setIsLoading(false)
    }
    loadProperties()
  }, [])

  const handleDocumentProcessed = async (propertyId: string, complianceType: string, data: any) => {
    // Update in Supabase
    const updated = await updatePropertyCompliance(supabase, propertyId, complianceType, data)

    if (updated) {
      // Update local state
      setProperties(prevProperties =>
        prevProperties.map(prop => {
          if (prop.id === propertyId) {
            return {
              ...prop,
              compliance: {
                ...prop.compliance,
                [complianceType]: {
                  ...prop.compliance[complianceType as keyof typeof prop.compliance],
                  ...data,
                },
              },
            }
          }
          return prop
        })
      )
    }
  }

  const getComplianceStatus = (property: Property) => {
    const items = Object.values(property.compliance)
    const total = items.filter(item => item.required).length
    // Calculate current status from expiry dates instead of using stored status
    const getCurrentStatus = (item: any) => item.expiryDate ? getStatusFromExpiry(item.expiryDate) : item.status
    const compliant = items.filter(item => item.required && getCurrentStatus(item) === 'valid').length
    const expiring = items.filter(item => item.required && getCurrentStatus(item) === 'expiring-soon').length
    const expired = items.filter(item => item.required && (getCurrentStatus(item) === 'expired' || getCurrentStatus(item) === 'required')).length

    if (expired > 0) return { label: 'Non-Compliant', color: 'var(--pink-ink)', bg: 'rgba(255,185,229,.2)' }
    if (expiring > 0) return { label: 'Action Needed', color: '#d97706', bg: 'rgba(217,119,6,.1)' }
    if (compliant === total) return { label: 'Compliant', color: 'var(--emerald)', bg: 'rgba(16,185,129,.1)' }
    return { label: 'In Progress', color: 'var(--forest-ink)', bg: 'var(--cream-2)' }
  }

  // Calculate detailed stats
  const stats = {
    totalProperties: properties.length,
    totalRequiredItems: 0,
    compliantItems: 0,
    expiringItems: 0,
    expiredItems: 0,
    compliancePercentage: 0,
    propertiesAtRisk: 0,
    fullyCompliant: 0,
  }

  // Collect properties with issues for recommended actions
  const propertiesWithIssues: Array<{
    property: Property
    issues: Array<{ type: string; label: string; status: string; daysUntil?: number }>
  }> = []

  properties.forEach(property => {
    const items = Object.values(property.compliance)
    const required = items.filter(item => item.required)

    // Helper to get current status from expiry date
    const getCurrentStatus = (item: any) => item.expiryDate ? getStatusFromExpiry(item.expiryDate) : item.status

    stats.totalRequiredItems += required.length
    stats.compliantItems += items.filter(item => item.required && getCurrentStatus(item) === 'valid').length

    const expiringCount = items.filter(item => item.required && getCurrentStatus(item) === 'expiring-soon').length
    const expiredCount = items.filter(item => item.required && (getCurrentStatus(item) === 'expired' || getCurrentStatus(item) === 'required')).length

    stats.expiringItems += expiringCount
    stats.expiredItems += expiredCount

    // Track properties at risk (expired or expiring soon)
    if (expiredCount > 0 || expiringCount > 0) {
      stats.propertiesAtRisk++

      // Collect issues for this property
      const issues: Array<{ type: string; label: string; status: string; daysUntil?: number }> = []
      Object.entries(property.compliance).forEach(([key, item]) => {
        const currentStatus = getCurrentStatus(item)
        if (item.required && (currentStatus === 'expired' || currentStatus === 'expiring-soon' || currentStatus === 'required')) {
          const label = key.replace(/([A-Z])/g, ' $1').trim()
          issues.push({
            type: key,
            label: label.charAt(0).toUpperCase() + label.slice(1),
            status: currentStatus,
            daysUntil: item.expiryDate ? Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : undefined
          })
        }
      })

      if (issues.length > 0) {
        propertiesWithIssues.push({ property, issues })
      }
    } else if (required.every(item => getCurrentStatus(item) === 'valid')) {
      stats.fullyCompliant++
    }
  })

  stats.compliancePercentage = stats.totalRequiredItems > 0
    ? Math.round((stats.compliantItems / stats.totalRequiredItems) * 100)
    : 0

  // Sort properties with issues: expired first, then by number of issues
  propertiesWithIssues.sort((a, b) => {
    const aHasExpired = a.issues.some(i => i.status === 'expired' || i.status === 'required')
    const bHasExpired = b.issues.some(i => i.status === 'expired' || i.status === 'required')
    if (aHasExpired && !bHasExpired) return -1
    if (!aHasExpired && bHasExpired) return 1
    return b.issues.length - a.issues.length
  })

  // Get top priority actions (show max 5 properties with issues)
  const priorityActions = propertiesWithIssues.slice(0, 5)

  // Collect all pending pet requests across portfolio
  const pendingPetRequests: Array<{
    property: Property
    request: any
    daysRemaining: number
    isUrgent: boolean
  }> = []

  properties.forEach(property => {
    if (property.compliance.petRequestTracking) {
      const petTracking = property.compliance.petRequestTracking as any
      if (petTracking.requests && Array.isArray(petTracking.requests)) {
        petTracking.requests.forEach((request: any) => {
          if (request.status === 'pending') {
            const deadline = new Date(request.responseDeadline)
            const now = new Date()
            const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            pendingPetRequests.push({
              property,
              request,
              daysRemaining,
              isUrgent: daysRemaining <= 7 || daysRemaining < 0
            })
          }
        })
      }
    }
  })

  // Sort by urgency (most urgent first)
  pendingPetRequests.sort((a, b) => a.daysRemaining - b.daysRemaining)

  return (
    <div className="paper" style={{
      maxWidth: 1440, margin: "0 auto",
      borderLeft: "1px solid var(--forest)", borderRight: "1px solid var(--forest)",
      minHeight: "100vh",
    }}>
      {/* header */}
      <header style={{ borderBottom: "1px solid var(--forest)", padding: "clamp(8px,1.5vw,14px) clamp(20px,5vw,40px)" }}>
        <hr className="hr-thin" style={{ margin: "0 0 4px" }} />
        <Link href="/" className="display" style={{
          fontSize: "clamp(28px,5vw,64px)", lineHeight: .9,
          letterSpacing: "-.025em", fontWeight: 500,
          color: "var(--forest)", display: "block", textAlign: "center"
        }}>
          Ravelston<span style={{ color: "var(--pink-ink)", fontStyle: "italic" }}>.ai</span>
        </Link>
        <hr className="hr-thin" style={{ margin: "4px 0 0" }} />
      </header>

      {/* main */}
      <main style={{
        padding: "clamp(32px,6vw,64px) clamp(20px,4vw,40px)",
        maxWidth: 1400, margin: "0 auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="display ital" style={{ fontSize: "clamp(32px,4vw,48px)", lineHeight: 1, color: "var(--emerald)", marginBottom: 8 }}>
              Dashboard.
            </div>
            <p style={{ fontSize: 14, color: "var(--forest-ink)", margin: 0 }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <LogoutButton />
        </div>

        {isLoading ? (
          <div style={{ padding: 80, textAlign: 'center', color: 'var(--forest-ink)' }}>
            <div className="display" style={{ fontSize: 24, marginBottom: 12 }}>Loading your portfolio...</div>
            <p style={{ fontSize: 14 }}>Please wait</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 40 }}>
            {/* Hero Section: Compliance Score + Urgent Actions */}
            <div style={{ display: "grid", gridTemplateColumns: priorityActions.length > 0 ? "repeat(auto-fit, minmax(min(100%, 450px), 1fr))" : "1fr", gap: 24 }}>
              {/* Portfolio Compliance Score */}
              <div style={{
                background: stats.compliancePercentage >= 90 ? "linear-gradient(135deg, rgba(16,185,129,.15) 0%, rgba(16,185,129,.05) 100%)" :
                           stats.compliancePercentage >= 70 ? "linear-gradient(135deg, rgba(217,119,6,.15) 0%, rgba(217,119,6,.05) 100%)" :
                           "linear-gradient(135deg, rgba(255,185,229,.25) 0%, rgba(255,185,229,.1) 100%)",
                border: stats.compliancePercentage >= 90 ? "2px solid var(--emerald)" :
                       stats.compliancePercentage >= 70 ? "2px solid #d97706" :
                       "2px solid var(--pink-ink)",
                padding: "clamp(24px,4vw,32px)",
                boxShadow: stats.compliancePercentage >= 90 ? "4px 4px 0 var(--emerald)" :
                           stats.compliancePercentage >= 70 ? "4px 4px 0 #d97706" :
                           "4px 4px 0 var(--pink)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 8, textTransform: "uppercase", letterSpacing: ".15em", fontWeight: 600 }}>
                    Portfolio Compliance Score
                  </div>
                  <div className="display" style={{
                    fontSize: "clamp(56px,8vw,72px)",
                    color: stats.compliancePercentage >= 90 ? "var(--emerald)" :
                           stats.compliancePercentage >= 70 ? "#d97706" :
                           "var(--pink-ink)",
                    lineHeight: 1,
                    marginBottom: 6,
                  }}>
                    {stats.compliancePercentage}%
                  </div>
                  <p style={{ fontSize: 13, color: "var(--forest-ink)", margin: "0 0 20px" }}>
                    {stats.compliantItems} of {stats.totalRequiredItems} compliance items valid
                  </p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  <div style={{ textAlign: "center", padding: "12px 16px", background: "rgba(255,255,255,.6)", border: "1px solid var(--forest)" }}>
                    <div className="display" style={{ fontSize: 28, color: "var(--forest)", lineHeight: 1 }}>{stats.totalProperties}</div>
                    <div style={{ fontSize: 9, color: "var(--forest-ink)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Properties</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px 16px", background: "rgba(255,255,255,.6)", border: "1px solid var(--emerald)" }}>
                    <div className="display" style={{ fontSize: 28, color: "var(--emerald)", lineHeight: 1 }}>{stats.fullyCompliant}</div>
                    <div style={{ fontSize: 9, color: "var(--forest-ink)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Compliant</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px 16px", background: "rgba(255,255,255,.6)", border: "1px solid #d97706" }}>
                    <div className="display" style={{ fontSize: 28, color: "#d97706", lineHeight: 1 }}>{stats.expiringItems}</div>
                    <div style={{ fontSize: 9, color: "var(--forest-ink)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Expiring</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "12px 16px", background: "rgba(255,255,255,.6)", border: "1px solid var(--pink-ink)" }}>
                    <div className="display" style={{ fontSize: 28, color: "var(--pink-ink)", lineHeight: 1 }}>{stats.expiredItems}</div>
                    <div style={{ fontSize: 9, color: "var(--forest-ink)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Urgent</div>
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              {priorityActions.length > 0 && (
              <div style={{
                background: "var(--forest)",
                color: "var(--cream)",
                padding: "clamp(24px,4vw,32px)",
                border: "2px solid var(--forest)",
                display: "flex",
                flexDirection: "column",
              }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div className="display ital" style={{ fontSize: "clamp(32px,4vw,40px)", lineHeight: 1, color: "var(--pink)" }}>!</div>
                    <div className="smallcaps mono" style={{ fontSize: 11, color: "var(--pink)", letterSpacing: ".15em" }}>Urgent</div>
                  </div>
                  <h3 className="display" style={{
                    fontSize: "clamp(20px,2.5vw,28px)", lineHeight: 1.1, margin: 0,
                    color: "var(--cream)", fontWeight: 500, letterSpacing: "-.015em"
                  }}>
                    {priorityActions.length} {priorityActions.length === 1 ? 'property needs' : 'properties need'} attention. <em style={{ color: "var(--pink)" }}>Act today.</em>
                  </h3>
                </div>

                <div style={{ display: "grid", gap: 1, background: "rgba(255,250,223,.15)", flex: 1, alignContent: "start", maxHeight: "400px", overflowY: "auto" }}>
                  {priorityActions.map(({ property, issues }) => {
                    const hasExpired = issues.some(i => i.status === 'expired' || i.status === 'required')
                    return (
                      <div key={property.id} style={{
                        background: "var(--forest)",
                        padding: "14px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 16,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <div className="display" style={{ fontSize: 16, color: "var(--cream)", fontWeight: 500, lineHeight: 1.2 }}>
                              {property.address}
                            </div>
                            {hasExpired && (
                              <div style={{
                                padding: "2px 6px",
                                background: "var(--pink)",
                                color: "var(--forest)",
                                fontSize: 8,
                                fontWeight: 700,
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                                flexShrink: 0,
                              }}>
                                EXPIRED
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: "rgba(255,250,223,.5)", marginBottom: 8 }}>
                            {property.postcode} • {property.bedrooms} bed {property.type}
                          </div>
                          <div style={{ fontSize: 10, color: "var(--pink)", fontWeight: 500 }}>
                            {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/properties/${property.id}`}
                          className="smallcaps"
                          style={{
                            padding: "8px 14px",
                            background: "var(--pink)",
                            color: "var(--forest)",
                            fontSize: 9,
                            letterSpacing: ".15em",
                            border: "none",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          Fix →
                        </Link>
                      </div>
                    )
                  })}
                </div>

                {propertiesWithIssues.length > 5 && (
                  <div style={{ textAlign: "center", padding: "12px 16px", background: "var(--forest)", borderTop: "1px solid rgba(255,250,223,.15)" }}>
                    <Link
                      href="/dashboard/properties"
                      style={{
                        fontSize: 12,
                        color: "var(--pink)",
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      View all {propertiesWithIssues.length} properties →
                    </Link>
                  </div>
                )}
              </div>
              )}
            </div>

            {/* Pet Request Deadline Alerts */}
            {pendingPetRequests.length > 0 && (
              <div style={{
                background: pendingPetRequests.some(r => r.isUrgent)
                  ? "linear-gradient(135deg, rgba(217,119,6,.2) 0%, rgba(217,119,6,.05) 100%)"
                  : "linear-gradient(135deg, rgba(16,185,129,.15) 0%, rgba(16,185,129,.05) 100%)",
                border: `2px solid ${pendingPetRequests.some(r => r.isUrgent) ? '#d97706' : 'var(--emerald)'}`,
                padding: "24px",
                boxShadow: pendingPetRequests.some(r => r.isUrgent) ? "4px 4px 0 #d97706" : "4px 4px 0 var(--emerald)",
              }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 28 }}>🐾</div>
                    <div>
                      <div className="display" style={{ fontSize: 20, color: "var(--forest)", lineHeight: 1.2 }}>
                        Pending Pet Requests
                      </div>
                      <div style={{ fontSize: 11, color: "var(--forest-ink)", marginTop: 4 }}>
                        Response required within {pendingPetRequests.some(r => r.isUrgent) ? '7 days' : '28-42 days'} under RRA 2025
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                  {pendingPetRequests.slice(0, 3).map((item, idx) => {
                    const isOverdue = item.daysRemaining < 0
                    const deadlineColor = isOverdue ? 'var(--pink-ink)' : item.daysRemaining <= 7 ? '#d97706' : 'var(--emerald)'

                    return (
                      <div key={`pet-${item.property.id}-${item.request.id}`} style={{
                        background: "var(--cream)",
                        border: `2px solid ${deadlineColor}`,
                        padding: "16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <div className="display" style={{ fontSize: 14, color: "var(--forest)", fontWeight: 500 }}>
                              {item.property.address}
                            </div>
                            {isOverdue && (
                              <div style={{
                                padding: "2px 6px",
                                background: "var(--pink-ink)",
                                color: "white",
                                fontSize: 8,
                                fontWeight: 700,
                                letterSpacing: ".1em",
                                textTransform: "uppercase",
                              }}>
                                OVERDUE
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--forest-ink)", marginBottom: 8 }}>
                            {item.request.petType} • Requested {new Date(item.request.requestDate).toLocaleDateString('en-GB')}
                          </div>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: deadlineColor,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}>
                            <div style={{
                              background: deadlineColor,
                              color: "white",
                              padding: "4px 8px",
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: 3,
                            }}>
                              {isOverdue
                                ? `${Math.abs(item.daysRemaining)} days overdue`
                                : `${item.daysRemaining} days left`}
                            </div>
                            <span style={{ fontSize: 11 }}>
                              to respond
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/properties/${item.property.id}`}
                          className="smallcaps"
                          style={{
                            padding: "8px 14px",
                            background: deadlineColor,
                            color: "white",
                            fontSize: 9,
                            letterSpacing: ".15em",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            fontWeight: 700,
                          }}
                        >
                          Respond →
                        </Link>
                      </div>
                    )
                  })}
                </div>

                {pendingPetRequests.length > 3 && (
                  <div style={{ textAlign: "center", marginTop: 12 }}>
                    <Link
                      href="/dashboard/compliance"
                      style={{
                        fontSize: 12,
                        color: pendingPetRequests.some(r => r.isUrgent) ? '#d97706' : 'var(--emerald)',
                        textDecoration: "none",
                        fontWeight: 500,
                      }}
                    >
                      View all {pendingPetRequests.length} pending requests →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Document Tools */}
            <div>
              <div className="display" style={{ fontSize: 24, color: "var(--forest)", marginBottom: 16 }}>
                Tools & Resources
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
                <DocumentDropbox
                  properties={properties}
                  onDocumentProcessed={handleDocumentProcessed}
                />
                <Link href="/dashboard/compliance" style={{
                  padding: "40px",
                  background: "rgba(16,185,129,.15)",
                  border: "2px dashed var(--emerald)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(16,185,129,.25)"
                  e.currentTarget.style.borderStyle = "solid"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(16,185,129,.15)"
                  e.currentTarget.style.borderStyle = "dashed"
                }}>
                  <div className="display" style={{ fontSize: 20, color: "var(--forest)", marginBottom: 8 }}>
                    Compliance Issues
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", color: "var(--forest-ink)" }}>
                    View and filter all compliance requirements across your entire portfolio
                  </p>
                  <div className="smallcaps" style={{
                    padding: "10px 18px",
                    background: "var(--forest)",
                    color: "var(--cream)",
                    fontSize: 11,
                    letterSpacing: ".18em",
                    boxShadow: "3px 3px 0 var(--emerald)",
                  }}>
                    View All Issues →
                  </div>
                </Link>
                <Link href="/dashboard/section-8-notice" style={{
                  padding: "40px",
                  background: "rgba(255,185,229,.15)",
                  border: "2px dashed var(--pink-ink)",
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,185,229,.25)"
                  e.currentTarget.style.borderStyle = "solid"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,185,229,.15)"
                  e.currentTarget.style.borderStyle = "dashed"
                }}>
                  <div className="display" style={{ fontSize: 20, color: "var(--forest)", marginBottom: 8 }}>
                    AI Document Drafter
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", color: "var(--forest-ink)" }}>
                    Generate Section 8 notices and legal documents with AI assistance
                  </p>
                  <div className="smallcaps" style={{
                    padding: "10px 18px",
                    background: "var(--forest)",
                    color: "var(--cream)",
                    fontSize: 11,
                    letterSpacing: ".18em",
                    boxShadow: "3px 3px 0 var(--pink)",
                  }}>
                    Draft Documents →
                  </div>
                </Link>
              </div>
            </div>

            {/* Properties Quick Access */}
            <div>
              <div className="display" style={{ fontSize: 24, color: "var(--forest)", marginBottom: 16 }}>
                Property Management
              </div>
              <div style={{
                background: "var(--cream-2)",
                border: "2px solid var(--forest)",
                padding: "32px",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
                  <div>
                    <div className="display" style={{ fontSize: 20, color: "var(--forest)", marginBottom: 6 }}>
                      View All Properties
                    </div>
                    <p style={{ fontSize: 14, color: "var(--forest-ink)", margin: 0 }}>
                      Access your full portfolio, add new properties, and manage details
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <Link
                      href="/dashboard/properties/import"
                      className="smallcaps"
                      style={{
                        padding: "12px 20px",
                        background: "transparent",
                        border: "1px solid var(--forest)",
                        color: "var(--forest)",
                        fontSize: 11,
                        letterSpacing: ".18em",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      Import Portfolio
                    </Link>
                    <Link
                      href="/dashboard/properties"
                      className="smallcaps"
                      style={{
                        padding: "12px 20px",
                        background: "var(--forest)",
                        color: "var(--cream)",
                        fontSize: 11,
                        letterSpacing: ".18em",
                        boxShadow: "4px 4px 0 var(--emerald)",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                    >
                      View All Properties →
                    </Link>
                  </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
                  <div style={{ padding: "16px", background: "var(--cream)", border: "1px solid var(--forest)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>At Risk</div>
                    <div className="display" style={{ fontSize: 28, color: "var(--pink-ink)" }}>{stats.propertiesAtRisk}</div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--cream)", border: "1px solid var(--forest)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Compliant</div>
                    <div className="display" style={{ fontSize: 28, color: "var(--emerald)" }}>{stats.fullyCompliant}</div>
                  </div>
                  <div style={{ padding: "16px", background: "var(--cream)", border: "1px solid var(--forest)", textAlign: "center" }}>
                    <div style={{ fontSize: 11, color: "var(--forest-ink)", marginBottom: 4, textTransform: "uppercase", letterSpacing: ".1em" }}>Total</div>
                    <div className="display" style={{ fontSize: 28, color: "var(--forest)" }}>{stats.totalProperties}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
