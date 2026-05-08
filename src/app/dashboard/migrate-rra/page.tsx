'use client'

import { useState } from 'react'
import Link from 'next/link'
import { migrateRRACompliance } from '@/lib/supabase/migrate-rra-compliance'

export default function MigrateRRAPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleMigrate = async () => {
    setIsRunning(true)
    setError(null)
    setResult(null)

    try {
      const migrationResult = await migrateRRACompliance()

      if (migrationResult.success) {
        setResult(migrationResult)
      } else {
        setError(migrationResult.error || 'Migration failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsRunning(false)
    }
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
        maxWidth: 1000, margin: "0 auto",
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
            RRA 2025 Migration.
          </div>
          <p style={{ fontSize: 14, color: "var(--forest-ink)", margin: 0 }}>
            Add Renters' Rights Act 2025 compliance fields to existing properties
          </p>
        </div>

        {/* Info Box */}
        <div style={{
          background: "rgba(16,185,129,.1)",
          border: "2px solid var(--emerald)",
          padding: "24px",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--forest)", marginBottom: 12 }}>
            What this does:
          </div>
          <ul style={{ fontSize: 13, color: "var(--forest-ink)", margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Adds 5 new RRA compliance items to all your properties</li>
            <li>Sets appropriate default values based on property status</li>
            <li>Skips properties that already have RRA compliance data</li>
            <li>Safe to run multiple times (won't duplicate data)</li>
          </ul>
        </div>

        {/* New Compliance Items */}
        <div style={{
          background: "var(--cream-2)",
          border: "1px solid var(--forest)",
          padding: "24px",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--forest)", marginBottom: 16 }}>
            New Compliance Items:
          </div>
          <div style={{ display: "grid", gap: 12, fontSize: 13, color: "var(--forest-ink)" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "var(--emerald)", fontWeight: 700 }}>✓</span>
              <div>
                <strong>RRA Information Sheet</strong> - Mandatory by 31 May 2026 (£7k fine)
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "var(--emerald)", fontWeight: 700 }}>✓</span>
              <div>
                <strong>Pet Request Tracking</strong> - 28-42 day response deadline
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "var(--emerald)", fontWeight: 700 }}>✓</span>
              <div>
                <strong>Awaiting Grounds Notice</strong> - Possession grounds disclosure (£7k fine)
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "var(--emerald)", fontWeight: 700 }}>✓</span>
              <div>
                <strong>Ombudsman Membership</strong> - Mandatory redress scheme
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "var(--emerald)", fontWeight: 700 }}>✓</span>
              <div>
                <strong>Written Statement of Terms</strong> - For verbal tenancies by 31 May 2026
              </div>
            </div>
          </div>
        </div>

        {/* Run Button */}
        {!result && (
          <button
            onClick={handleMigrate}
            disabled={isRunning}
            className="smallcaps"
            style={{
              padding: "16px 32px",
              background: isRunning ? "var(--forest-ink)" : "var(--emerald)",
              color: "white",
              fontSize: 13,
              letterSpacing: ".18em",
              border: "none",
              cursor: isRunning ? "not-allowed" : "pointer",
              fontWeight: 700,
              boxShadow: isRunning ? "none" : "4px 4px 0 var(--forest)",
              width: "100%",
            }}
          >
            {isRunning ? 'Running Migration...' : 'Run Migration'}
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(255,185,229,.2)",
            border: "2px solid var(--pink-ink)",
            padding: "20px",
            marginTop: 24,
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--pink-ink)", marginBottom: 8 }}>
              Error
            </div>
            <p style={{ fontSize: 13, color: "var(--forest-ink)", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Success */}
        {result && (
          <div style={{
            background: "rgba(16,185,129,.15)",
            border: "2px solid var(--emerald)",
            padding: "24px",
            marginTop: 24,
          }}>
            <div style={{ fontSize: 18, fontWeight: 600, color: "var(--emerald)", marginBottom: 16 }}>
              ✓ Migration Complete!
            </div>
            <div style={{ display: "grid", gap: 12, fontSize: 14, color: "var(--forest-ink)", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--forest)" }}>
                <span>Properties Updated:</span>
                <strong style={{ color: "var(--emerald)" }}>{result.updated}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--forest)" }}>
                <span>Already Migrated (Skipped):</span>
                <strong>{result.skipped}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px solid var(--forest)" }}>
                <span>Total Properties:</span>
                <strong style={{ color: "var(--forest)" }}>{result.total}</strong>
              </div>
            </div>
            <Link
              href="/dashboard/compliance"
              className="smallcaps"
              style={{
                padding: "12px 24px",
                background: "var(--forest)",
                color: "var(--cream)",
                fontSize: 11,
                letterSpacing: ".18em",
                textDecoration: "none",
                display: "inline-block",
                fontWeight: 700,
              }}
            >
              View Compliance Dashboard →
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
