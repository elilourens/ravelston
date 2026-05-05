import Link from 'next/link'
import { Property, getDaysUntilExpiry } from '../mock-data'

interface PropertyTableProps {
  properties: Property[]
  getComplianceStatus: (property: Property) => {
    label: string
    color: string
    bg: string
  }
}

type ComplianceItem = Property['compliance'][keyof Property['compliance']]

const COMPLIANCE_COLUMNS = [
  { key: 'gasSafetyCertificate', label: 'Gas', title: 'Gas Safety Certificate' },
  { key: 'eicr', label: 'EICR', title: 'Electrical Installation Condition Report' },
  { key: 'epc', label: 'EPC', title: 'Energy Performance Certificate' },
  { key: 'depositProtection', label: 'Deposit', title: 'Deposit Protection' },
  { key: 'rightToRent', label: 'RTR', title: 'Right to Rent' },
  { key: 'prsDatabase', label: 'PRS', title: 'PRS Database Registration' },
] as const

function StatusIndicator({ item }: { item: ComplianceItem }) {
  if (item.status === 'not-applicable' || item.status === 'required' || !item.expiryDate) {
    return (
      <div style={{ fontSize: 13, color: 'var(--forest-ink)', fontWeight: 500 }}>
        —
      </div>
    )
  }

  const days = getDaysUntilExpiry(item.expiryDate)
  const isOverdue = days < 0
  const isExpiringSoon = days >= 0 && days <= 60

  return (
    <div style={{
      fontSize: 15,
      fontWeight: 600,
      fontFamily: 'monospace',
      color: isOverdue ? '#b91c1c' : isExpiringSoon ? '#d97706' : 'var(--forest)',
    }}>
      {days}
    </div>
  )
}

export default function PropertyTable({ properties, getComplianceStatus }: PropertyTableProps) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        border: "1px solid var(--forest)",
        background: "var(--cream)",
        fontSize: 13,
      }}>
        <thead>
          <tr style={{ background: "var(--forest)", color: "var(--cream)" }}>
            <th className="smallcaps" style={{
              padding: "12px 16px",
              textAlign: "left",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: ".1em"
            }}>
              Property
            </th>
            <th className="smallcaps" style={{
              padding: "12px 16px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: ".1em"
            }}>
              Status
            </th>
            {COMPLIANCE_COLUMNS.map(col => (
              <th
                key={col.key}
                className="smallcaps"
                title={col.title}
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontWeight: 600,
                  fontSize: 11,
                  letterSpacing: ".1em",
                  cursor: "help",
                }}
              >
                {col.label}
              </th>
            ))}
            <th className="smallcaps" style={{
              padding: "12px 16px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: ".1em"
            }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property, idx) => {
            const overallStatus = getComplianceStatus(property)

            return (
              <tr
                key={property.id}
                style={{
                  borderTop: idx > 0 ? "1px solid var(--forest)" : "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--cream-2)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--cream)"
                }}
              >
                {/* Property Info */}
                <td style={{ padding: "16px", minWidth: 240 }}>
                  <div style={{ fontWeight: 500, color: "var(--forest)", marginBottom: 4 }}>
                    {property.address}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--forest-ink)" }}>
                    {property.postcode} • {property.type} • {property.bedrooms} bed
                  </div>
                  {property.propertyReference && (
                    <div style={{
                      fontSize: 10,
                      color: "var(--forest-ink)",
                      fontFamily: "monospace",
                      marginTop: 2
                    }}>
                      {property.propertyReference}
                    </div>
                  )}
                </td>

                {/* Overall Status */}
                <td style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    fontSize: 9,
                    fontWeight: 600,
                    letterSpacing: ".1em",
                    background: overallStatus.bg,
                    color: overallStatus.color,
                    borderRadius: 2,
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    {overallStatus.label}
                  </div>
                </td>

                {/* Compliance Columns */}
                {COMPLIANCE_COLUMNS.map(col => (
                  <td key={col.key} style={{ padding: "16px", textAlign: "center" }}>
                    <StatusIndicator
                      item={property.compliance[col.key as keyof Property['compliance']]}
                    />
                  </td>
                ))}

                {/* Actions */}
                <td style={{ padding: "16px", textAlign: "center" }}>
                  <Link
                    href={`/dashboard/properties/${property.id}`}
                    className="smallcaps"
                    style={{
                      display: "inline-block",
                      padding: "6px 12px",
                      background: "var(--forest)",
                      color: "var(--cream)",
                      fontSize: 9,
                      letterSpacing: ".14em",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "2px 2px 0 var(--emerald)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
