'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import LogoutButton from './logout-button'
import DocumentDropbox from './components/DocumentDropbox'
import { Property } from './properties/mock-data'
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
        padding: "clamp(48px,8vw,96px) clamp(20px,5vw,40px)",
        maxWidth: 960, margin: "0 auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 16 }}>
          <div className="display ital" style={{ fontSize: "clamp(40px,5vw,64px)", lineHeight: 1, color: "var(--emerald)" }}>
            Dashboard.
          </div>
          <LogoutButton />
        </div>
        <hr className="hr-thin" style={{ margin: "0 0 28px" }} />

        <h1 className="display" style={{
          fontSize: "clamp(24px,3.5vw,36px)", lineHeight: 1.05,
          color: "var(--forest)", fontWeight: 500, letterSpacing: "-.015em",
          margin: "0 0 32px"
        }}>
          Welcome back, {userEmail?.split('@')[0]}.
        </h1>

        <div style={{ display: "grid", gap: 24 }}>
          {/* Properties Card */}
          {isLoading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--forest-ink)' }}>
              Loading properties...
            </div>
          ) : (
            <Link href="/dashboard/properties" style={{
            padding: "32px",
            background: "var(--cream)",
            border: "1px solid var(--forest)",
            textDecoration: "none",
            display: "block",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "4px 4px 0 var(--emerald)"
            e.currentTarget.style.transform = "translateY(-2px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.transform = "translateY(0)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div className="display" style={{ fontSize: 28, color: "var(--forest)" }}>
                Property Portfolio
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", color: "var(--forest-ink)" }}>
              Manage your properties and track all compliance requirements including Gas Safety, EICR, EPC, and more.
            </p>
            <div className="smallcaps" style={{
              display: "inline-block",
              padding: "10px 18px",
              background: "var(--forest)",
              color: "var(--cream)",
              fontSize: 11,
              letterSpacing: ".18em",
              boxShadow: "3px 3px 0 var(--emerald)",
            }}>
              View Properties →
            </div>
          </Link>
          )}

          {/* AI Document Drafter Card */}
          <Link href="/dashboard/section-8-notice" style={{
            padding: "32px",
            background: "rgba(255,185,229,.15)",
            border: "1px solid var(--pink-ink)",
            textDecoration: "none",
            display: "block",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "4px 4px 0 var(--pink)"
            e.currentTarget.style.transform = "translateY(-2px)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.transform = "translateY(0)"
          }}>
            <div className="display" style={{ fontSize: 28, color: "var(--forest)", marginBottom: 12 }}>
              AI Document Drafter
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 20px", color: "var(--forest-ink)" }}>
              Generate AI-drafted Section 8 notices and other legal documents instantly. Our AI helps you create compliant, professional documents in seconds.
            </p>
            <div className="smallcaps" style={{
              display: "inline-block",
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

          {/* Document Dropbox */}
          <DocumentDropbox
            properties={properties}
            onDocumentProcessed={handleDocumentProcessed}
          />
        </div>
      </main>
    </div>
  )
}
