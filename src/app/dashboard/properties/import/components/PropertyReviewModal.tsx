'use client';

import { useState, useEffect } from 'react';
import type { PropertyImportItem } from '@/lib/supabase/imports';

interface PropertyReviewModalProps {
  item: PropertyImportItem;
  onClose: () => void;
  onApprove: (updatedData: Record<string, any>) => void;
  onReject: (reason: string) => void;
  onNext?: () => void;
}

export default function PropertyReviewModal({
  item,
  onClose,
  onApprove,
  onReject,
  onNext,
}: PropertyReviewModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showTenancy, setShowTenancy] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const isDuplicate = item.validation_errors?.some((e) => e.field === 'duplicate') || false;

  useEffect(() => {
    // Initialize form data from property_data
    setFormData(item.property_data);
    setShowTenancy(!!item.property_data.currentTenancy);
  }, [item]);

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleTenancyChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      currentTenancy: {
        ...formData.currentTenancy,
        [field]: value,
      },
    });
  };

  const handleApprove = () => {
    // Remove currentTenancy if checkbox is unchecked
    const dataToSave = { ...formData };
    if (!showTenancy) {
      delete dataToSave.currentTenancy;
    }

    onApprove(dataToSave);
    if (onNext) {
      onNext();
    }
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(rejectReason);
    onClose();
  };

  // Get confidence score for a field
  const getFieldConfidence = (field: string): number => {
    return item.confidence_scores?.[field] || 0;
  };

  // Check if field has low confidence
  const hasLowConfidence = (field: string): boolean => {
    const confidence = getFieldConfidence(field);
    return confidence > 0 && confidence < 80;
  };

  // Get field style based on confidence
  const getFieldStyle = (field: string) => {
    const base = {
      width: '100%',
      padding: '12px',
      border: '1px solid var(--forest)',
      background: 'var(--cream)',
      fontSize: 14,
      color: 'var(--forest)',
    };

    if (hasLowConfidence(field)) {
      return {
        ...base,
        borderColor: '#d97706',
        borderWidth: '2px',
      };
    }

    return base;
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 2000,
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'var(--cream)',
          border: '2px solid var(--forest)',
          padding: 40,
          maxWidth: 800,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div className="display" style={{ fontSize: 28, color: 'var(--forest)', marginBottom: 8 }}>
          Review Property
        </div>
        <p style={{ fontSize: 13, color: 'var(--forest-ink)', marginBottom: 24 }}>
          Row #{item.row_number} · Review and edit property details before approving
        </p>

        {/* Duplicate warning */}
        {isDuplicate && (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(255,185,229,.2)',
              borderLeft: '4px solid var(--pink-ink)',
              marginBottom: 24,
            }}
          >
            <div
              className="smallcaps"
              style={{
                fontSize: 10,
                color: 'var(--pink-ink)',
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              ⚠ DUPLICATE DETECTED
            </div>
            <div style={{ fontSize: 13, color: 'var(--forest-ink)', marginBottom: 8 }}>
              <strong>A property with the same address and postcode already exists in your portfolio.</strong>
            </div>
            <div style={{ fontSize: 12, color: 'var(--forest-ink)' }}>
              Review carefully before approving to avoid duplicate entries. Consider rejecting this import
              if you've already added this property.
            </div>
          </div>
        )}

        {/* Validation warnings */}
        {item.validation_errors && item.validation_errors.filter((e) => e.field !== 'duplicate').length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(217,119,6,.1)',
              borderLeft: '4px solid #d97706',
              marginBottom: 24,
            }}
          >
            <div
              className="smallcaps"
              style={{
                fontSize: 10,
                color: '#d97706',
                marginBottom: 8,
                fontWeight: 600,
              }}
            >
              ⚠ Validation Warnings
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: 'var(--forest-ink)' }}>
              {item.validation_errors.filter((e) => e.field !== 'duplicate').map((error, idx) => (
                <li key={idx}>
                  <strong>{error.field}:</strong> {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Form */}
        <div style={{ background: 'var(--cream-2)', padding: 24, marginBottom: 24 }}>
          {/* Address */}
          <div style={{ marginBottom: 16 }}>
            <div
              className="smallcaps"
              style={{
                fontSize: 12,
                color: 'var(--forest)',
                marginBottom: 4,
                letterSpacing: '.05em',
              }}
            >
              Address *
              {hasLowConfidence('address') && (
                <span style={{ color: '#d97706', marginLeft: 8 }}>
                  (Low confidence: {Math.round(getFieldConfidence('address'))}%)
                </span>
              )}
            </div>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              style={getFieldStyle('address')}
              required
            />
          </div>

          {/* Postcode and Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div
                className="smallcaps"
                style={{
                  fontSize: 12,
                  color: 'var(--forest)',
                  marginBottom: 4,
                  letterSpacing: '.05em',
                }}
              >
                Postcode *
                {hasLowConfidence('postcode') && (
                  <span style={{ color: '#d97706', marginLeft: 8 }}>
                    ({Math.round(getFieldConfidence('postcode'))}%)
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.postcode || ''}
                onChange={(e) => handleChange('postcode', e.target.value.toUpperCase())}
                style={getFieldStyle('postcode')}
                required
              />
            </div>

            <div>
              <div
                className="smallcaps"
                style={{
                  fontSize: 12,
                  color: 'var(--forest)',
                  marginBottom: 4,
                  letterSpacing: '.05em',
                }}
              >
                Type *
                {hasLowConfidence('type') && (
                  <span style={{ color: '#d97706', marginLeft: 8 }}>
                    ({Math.round(getFieldConfidence('type'))}%)
                  </span>
                )}
              </div>
              <select
                value={formData.type || ''}
                onChange={(e) => handleChange('type', e.target.value)}
                style={getFieldStyle('type')}
                required
              >
                <option value="">Select type</option>
                <option value="house">House</option>
                <option value="flat">Flat</option>
                <option value="apartment">Apartment</option>
                <option value="studio">Studio</option>
                <option value="hmo">HMO</option>
              </select>
            </div>
          </div>

          {/* Bedrooms and Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <div
                className="smallcaps"
                style={{
                  fontSize: 12,
                  color: 'var(--forest)',
                  marginBottom: 4,
                  letterSpacing: '.05em',
                }}
              >
                Bedrooms *
                {hasLowConfidence('bedrooms') && (
                  <span style={{ color: '#d97706', marginLeft: 8 }}>
                    ({Math.round(getFieldConfidence('bedrooms'))}%)
                  </span>
                )}
              </div>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.bedrooms || ''}
                onChange={(e) => handleChange('bedrooms', parseInt(e.target.value))}
                style={getFieldStyle('bedrooms')}
                required
              />
            </div>

            <div>
              <div
                className="smallcaps"
                style={{
                  fontSize: 12,
                  color: 'var(--forest)',
                  marginBottom: 4,
                  letterSpacing: '.05em',
                }}
              >
                Status *
                {hasLowConfidence('status') && (
                  <span style={{ color: '#d97706', marginLeft: 8 }}>
                    ({Math.round(getFieldConfidence('status'))}%)
                  </span>
                )}
              </div>
              <select
                value={formData.status || ''}
                onChange={(e) => handleChange('status', e.target.value)}
                style={getFieldStyle('status')}
                required
              >
                <option value="">Select status</option>
                <option value="occupied">Occupied</option>
                <option value="vacant">Vacant</option>
                <option value="under-offer">Under Offer</option>
              </select>
            </div>
          </div>

          {/* Property Reference */}
          <div style={{ marginBottom: 16 }}>
            <div
              className="smallcaps"
              style={{
                fontSize: 12,
                color: 'var(--forest)',
                marginBottom: 4,
                letterSpacing: '.05em',
              }}
            >
              Property Reference
            </div>
            <input
              type="text"
              value={formData.propertyReference || ''}
              onChange={(e) => handleChange('propertyReference', e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid var(--forest)',
                background: 'var(--cream)',
                fontSize: 14,
                color: 'var(--forest)',
              }}
            />
          </div>

          {/* Tenancy checkbox */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showTenancy}
                onChange={(e) => setShowTenancy(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <span className="smallcaps" style={{ fontSize: 12, color: 'var(--forest)' }}>
                Has Current Tenancy
              </span>
            </label>
          </div>

          {/* Tenancy details */}
          {showTenancy && (
            <div
              style={{
                background: 'var(--cream)',
                padding: 16,
                border: '1px solid var(--forest)',
                marginTop: 16,
              }}
            >
              <div
                className="smallcaps"
                style={{
                  fontSize: 12,
                  color: 'var(--forest)',
                  marginBottom: 12,
                  fontWeight: 600,
                }}
              >
                Tenancy Details
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  className="smallcaps"
                  style={{
                    fontSize: 10,
                    color: 'var(--forest-ink)',
                    marginBottom: 4,
                  }}
                >
                  Tenant Name
                </div>
                <input
                  type="text"
                  value={formData.currentTenancy?.tenantName || ''}
                  onChange={(e) => handleTenancyChange('tenantName', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--forest)',
                    background: 'var(--cream-2)',
                    fontSize: 14,
                    color: 'var(--forest)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div
                    className="smallcaps"
                    style={{
                      fontSize: 10,
                      color: 'var(--forest-ink)',
                      marginBottom: 4,
                    }}
                  >
                    Start Date
                  </div>
                  <input
                    type="date"
                    value={formData.currentTenancy?.startDate || ''}
                    onChange={(e) => handleTenancyChange('startDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--forest)',
                      background: 'var(--cream-2)',
                      fontSize: 14,
                      color: 'var(--forest)',
                    }}
                  />
                </div>

                <div>
                  <div
                    className="smallcaps"
                    style={{
                      fontSize: 10,
                      color: 'var(--forest-ink)',
                      marginBottom: 4,
                    }}
                  >
                    End Date
                  </div>
                  <input
                    type="date"
                    value={formData.currentTenancy?.endDate || ''}
                    onChange={(e) => handleTenancyChange('endDate', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--forest)',
                      background: 'var(--cream-2)',
                      fontSize: 14,
                      color: 'var(--forest)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <div
                    className="smallcaps"
                    style={{
                      fontSize: 10,
                      color: 'var(--forest-ink)',
                      marginBottom: 4,
                    }}
                  >
                    Monthly Rent (£)
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentTenancy?.monthlyRent || ''}
                    onChange={(e) => handleTenancyChange('monthlyRent', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--forest)',
                      background: 'var(--cream-2)',
                      fontSize: 14,
                      color: 'var(--forest)',
                    }}
                  />
                </div>

                <div>
                  <div
                    className="smallcaps"
                    style={{
                      fontSize: 10,
                      color: 'var(--forest-ink)',
                      marginBottom: 4,
                    }}
                  >
                    Deposit Amount (£)
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentTenancy?.depositAmount || ''}
                    onChange={(e) => handleTenancyChange('depositAmount', parseFloat(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid var(--forest)',
                      background: 'var(--cream-2)',
                      fontSize: 14,
                      color: 'var(--forest)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Original CSV data */}
        <div style={{ marginBottom: 24 }}>
          <div
            className="smallcaps"
            style={{
              fontSize: 12,
              color: 'var(--forest)',
              marginBottom: 8,
              letterSpacing: '.05em',
            }}
          >
            Original CSV Data (Read-Only)
          </div>
          <div
            style={{
              background: 'var(--cream-2)',
              border: '1px solid var(--forest)',
              padding: 16,
              fontSize: 12,
              fontFamily: 'monospace',
              maxHeight: 150,
              overflowY: 'auto',
            }}
          >
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(item.raw_data, null, 2)}
            </pre>
          </div>
        </div>

        {/* Reject reason input */}
        {showRejectInput && (
          <div style={{ marginBottom: 24 }}>
            <div
              className="smallcaps"
              style={{
                fontSize: 12,
                color: 'var(--forest)',
                marginBottom: 8,
                letterSpacing: '.05em',
              }}
            >
              Rejection Reason
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--pink-ink)',
                background: 'var(--cream)',
                fontSize: 14,
                color: 'var(--forest)',
                resize: 'vertical',
              }}
              placeholder="Explain why this property is being rejected..."
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
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

          {!showRejectInput ? (
            <>
              <button
                onClick={() => setShowRejectInput(true)}
                className="smallcaps"
                style={{
                  padding: '10px 18px',
                  background: 'var(--pink-ink)',
                  color: 'var(--cream)',
                  fontSize: 11,
                  letterSpacing: '.18em',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
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
                {onNext ? 'Approve & Continue' : 'Approve'}
              </button>
            </>
          ) : (
            <button
              onClick={handleReject}
              className="smallcaps"
              style={{
                padding: '10px 18px',
                background: 'var(--pink-ink)',
                color: 'var(--cream)',
                fontSize: 11,
                letterSpacing: '.18em',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Confirm Rejection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
