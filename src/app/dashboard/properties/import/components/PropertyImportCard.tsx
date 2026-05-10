'use client';

import type { PropertyImportItem } from '@/lib/supabase/imports';

interface PropertyImportCardProps {
  item: PropertyImportItem;
  onReview: () => void;
  onQuickApprove: () => void;
  onQuickReject: () => void;
}

export default function PropertyImportCard({
  item,
  onReview,
  onQuickApprove,
  onQuickReject,
}: PropertyImportCardProps) {
  const property = item.property_data;
  const hasErrors = item.validation_errors && item.validation_errors.length > 0;
  const isDuplicate = item.validation_errors?.some((e) => e.field === 'duplicate') || false;

  // Calculate overall confidence score
  const confidenceScores = item.confidence_scores || {};
  const scores = Object.values(confidenceScores);
  const avgConfidence = scores.length > 0
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : 0;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 90) {
      return { label: 'High Confidence', color: 'var(--emerald)', bg: 'rgba(16,185,129,.1)' };
    } else if (confidence >= 70) {
      return { label: 'Medium Confidence', color: '#d97706', bg: 'rgba(217,119,6,.1)' };
    } else {
      return { label: 'Low Confidence', color: 'var(--pink-ink)', bg: 'rgba(255,185,229,.2)' };
    }
  };

  const confidenceBadge = getConfidenceBadge(avgConfidence);

  const getStatusBadge = (status: PropertyImportItem['status']) => {
    const styles: Record<string, { color: string; bg: string; label: string }> = {
      pending: { color: 'var(--forest-ink)', bg: 'var(--cream-2)', label: 'Pending' },
      approved: { color: 'var(--emerald)', bg: 'rgba(16,185,129,.1)', label: 'Approved' },
      rejected: { color: 'var(--pink-ink)', bg: 'rgba(255,185,229,.2)', label: 'Rejected' },
    };

    const style = styles[status] || styles.pending;

    return (
      <span
        className="smallcaps"
        style={{
          padding: '4px 8px',
          background: style.bg,
          color: style.color,
          fontSize: 10,
          letterSpacing: '.1em',
          fontWeight: 600,
        }}
      >
        {style.label}
      </span>
    );
  };

  return (
    <div
      style={{
        background: isDuplicate ? 'rgba(255,185,229,.05)' : 'var(--cream)',
        border: `2px solid ${isDuplicate ? 'var(--pink-ink)' : hasErrors ? '#d97706' : 'var(--forest)'}`,
        padding: '20px',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Row number */}
          <div style={{ fontSize: 11, color: 'var(--forest-ink)', marginBottom: 8 }}>
            Row #{item.row_number}
          </div>

          {/* Address */}
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--forest)', marginBottom: 8 }}>
            {property.address || <span style={{ color: 'var(--pink-ink)' }}>No address</span>}
          </div>

          {/* Property details */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              fontSize: 13,
              color: 'var(--forest-ink)',
              marginBottom: 12,
            }}
          >
            <div>
              <span className="smallcaps" style={{ fontSize: 10, marginRight: 4 }}>
                Postcode:
              </span>
              {property.postcode || '—'}
            </div>
            <div>
              <span className="smallcaps" style={{ fontSize: 10, marginRight: 4 }}>
                Type:
              </span>
              {property.type || '—'}
            </div>
            <div>
              <span className="smallcaps" style={{ fontSize: 10, marginRight: 4 }}>
                Bedrooms:
              </span>
              {property.bedrooms || '—'}
            </div>
            <div>
              <span className="smallcaps" style={{ fontSize: 10, marginRight: 4 }}>
                Status:
              </span>
              {property.status || '—'}
            </div>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {getStatusBadge(item.status)}
            {isDuplicate && (
              <span
                className="smallcaps"
                style={{
                  padding: '4px 8px',
                  background: 'var(--pink-ink)',
                  color: 'var(--cream)',
                  fontSize: 10,
                  letterSpacing: '.1em',
                  fontWeight: 600,
                }}
              >
                ⚠ Likely Duplicate
              </span>
            )}
            <span
              className="smallcaps"
              style={{
                padding: '4px 8px',
                background: confidenceBadge.bg,
                color: confidenceBadge.color,
                fontSize: 10,
                letterSpacing: '.1em',
                fontWeight: 600,
              }}
            >
              {confidenceBadge.label} ({Math.round(avgConfidence)}%)
            </span>
          </div>

          {/* Duplicate warning */}
          {isDuplicate && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(255,185,229,.2)',
                borderLeft: '4px solid var(--pink-ink)',
                marginTop: 12,
                marginBottom: hasErrors ? 12 : 0,
              }}
            >
              <div
                className="smallcaps"
                style={{
                  fontSize: 10,
                  color: 'var(--pink-ink)',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                ⚠ Duplicate Detected
              </div>
              <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
                A property with the same address and postcode already exists in your portfolio.
                Review carefully before approving to avoid duplicate entries.
              </div>
            </div>
          )}

          {/* Validation errors */}
          {hasErrors && !isDuplicate && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(217,119,6,.1)',
                borderLeft: '3px solid #d97706',
                marginTop: 12,
              }}
            >
              <div
                className="smallcaps"
                style={{
                  fontSize: 10,
                  color: '#d97706',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Validation Warnings
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--forest-ink)' }}>
                {item.validation_errors!.filter((e) => e.field !== 'duplicate').slice(0, 3).map((error, idx) => (
                  <li key={idx}>
                    <strong>{error.field}:</strong> {error.message}
                  </li>
                ))}
                {item.validation_errors!.filter((e) => e.field !== 'duplicate').length > 3 && (
                  <li>+ {item.validation_errors!.filter((e) => e.field !== 'duplicate').length - 3} more...</li>
                )}
              </ul>
            </div>
          )}

          {/* Rejection reason */}
          {item.status === 'rejected' && item.rejection_reason && (
            <div
              style={{
                padding: '12px',
                background: 'rgba(255,185,229,.1)',
                borderLeft: '3px solid var(--pink-ink)',
                marginTop: 12,
              }}
            >
              <div
                className="smallcaps"
                style={{
                  fontSize: 10,
                  color: 'var(--pink-ink)',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Rejection Reason
              </div>
              <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
                {item.rejection_reason}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
          {item.status === 'pending' && (
            <>
              <button
                onClick={onQuickApprove}
                className="smallcaps"
                style={{
                  padding: '8px 12px',
                  background: 'var(--emerald)',
                  color: 'var(--cream)',
                  fontSize: 10,
                  letterSpacing: '.18em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Approve
              </button>
              <button
                onClick={onQuickReject}
                className="smallcaps"
                style={{
                  padding: '8px 12px',
                  background: 'var(--pink-ink)',
                  color: 'var(--cream)',
                  fontSize: 10,
                  letterSpacing: '.18em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={onReview}
            className="smallcaps"
            style={{
              padding: '8px 12px',
              background: 'var(--forest)',
              color: 'var(--cream)',
              fontSize: 10,
              letterSpacing: '.18em',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
