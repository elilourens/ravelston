'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Property, getStatusFromExpiry } from './mock-data'
import PropertyTable from './components/PropertyTable'
import { createClient } from '@/lib/supabase/client'
import { fetchProperties, createProperty } from '@/lib/supabase/properties'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    address: '',
    postcode: '',
    type: 'house' as Property['type'],
    bedrooms: 1,
    propertyReference: '',
  })
  const supabase = createClient()

  // Load properties from Supabase
  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true)
      const data = await fetchProperties(supabase)
      setProperties(data)
      setIsLoading(false)
    }
    loadProperties()
  }, [])

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault()

    const newProperty: Omit<Property, 'id'> = {
      address: formData.address,
      postcode: formData.postcode,
      type: formData.type,
      bedrooms: formData.bedrooms,
      propertyReference: formData.propertyReference || undefined,
      status: 'vacant',
      compliance: {
        gasSafetyCertificate: { status: 'required', required: true },
        eicr: { status: 'required', required: true },
        epc: { status: 'required', required: true, minRating: 'E' },
        smokeAlarms: { status: 'required', required: true },
        coAlarms: { status: 'required', required: true },
        depositProtection: { status: 'not-applicable', required: false },
        rightToRent: { status: 'not-applicable', required: false },
        legionellaAssessment: { status: 'required', required: true },
        buildingInsurance: { status: 'required', required: true },
        landlordInsurance: { status: 'required', required: true },
        prsDatabase: { status: 'required', required: true },
        // Renters' Rights Act 2025 Compliance
        rraInformationSheet: {
          status: 'not-applicable',
          required: false,
          deliveryStatus: 'not-applicable',
          deadline: '2026-05-31',
        },
        petRequestTracking: {
          status: 'not-applicable',
          required: false,
          requests: [],
          petsAllowed: true,
          hasActiveRequests: false,
        },
        awaitingGroundsNotice: {
          status: 'not-applicable',
          required: false,
          groundsDisclosed: false,
        },
        ombudsmanMembership: {
          status: 'required',
          required: true,
        },
        writtenStatementOfTerms: {
          status: 'not-applicable',
          required: false,
          tenancyType: 'written',
        },
      }
    }

    const created = await createProperty(supabase, newProperty)

    if (created) {
      setProperties([created, ...properties])
      setShowAddModal(false)
      setFormData({
        address: '',
        postcode: '',
        type: 'house',
        bedrooms: 1,
        propertyReference: '',
      })
    } else {
      alert('Failed to create property. Please try again.')
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 16 }}>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)" }}>
            Properties.
          </div>
          <button
            onClick={() => setShowAddModal(true)}
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
            + Add Property
          </button>
        </div>
        <hr className="hr-thin" style={{ margin: "0 0 32px" }} />

        {/* Properties Table */}
        {properties.length === 0 ? (
          <div style={{
            padding: "60px 40px",
            textAlign: "center",
            border: "1px dashed var(--forest-ink)",
            background: "var(--cream-2)",
          }}>
            <div className="display" style={{ fontSize: 24, color: "var(--forest-ink)", marginBottom: 12 }}>
              No properties yet
            </div>
            <p style={{ fontSize: 14, color: "var(--forest-ink)", marginBottom: 20 }}>
              Add your first property to start tracking compliance requirements
            </p>
            <button
              onClick={() => setShowAddModal(true)}
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
              + Add Property
            </button>
          </div>
        ) : (
          <PropertyTable properties={properties} getComplianceStatus={getComplianceStatus} />
        )}
      </main>

      {/* Add Property Modal */}
      {showAddModal && (
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
              Add Property
            </div>
            <hr className="hr-thin" style={{ margin: "0 0 28px" }} />

            <form onSubmit={handleAddProperty}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                  }}
                  placeholder="123 High Street, London"
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Postcode *
                </label>
                <input
                  type="text"
                  required
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value.toUpperCase() })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                    textTransform: "uppercase",
                  }}
                  placeholder="SW1A 1AA"
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                    Property Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as Property['type'] })}
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
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
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

              <div style={{ marginBottom: 28 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--forest)", marginBottom: 6, letterSpacing: ".05em" }}>
                  Property Reference (Optional)
                </label>
                <input
                  type="text"
                  value={formData.propertyReference}
                  onChange={(e) => setFormData({ ...formData, propertyReference: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--forest)",
                    background: "var(--cream)",
                    fontSize: 14,
                    color: "var(--forest)",
                    fontFamily: "monospace",
                  }}
                  placeholder="PROP-001"
                />
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
