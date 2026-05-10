'use client';

import type { PropertyImport } from '@/lib/supabase/imports';

interface ImportHeaderProps {
  importSession: PropertyImport;
  onImportAll: () => void;
  isImporting: boolean;
}

export default function ImportHeader({ importSession, onImportAll, isImporting }: ImportHeaderProps) {
  const hasApprovedItems = importSession.approved_items > 0;
  const hasPendingItems = importSession.pending_items > 0;

  return (
    <div
      style={{
        background: 'var(--cream-2)',
        border: '2px solid var(--forest)',
        padding: '24px',
        marginBottom: 32,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="display" style={{ fontSize: 24, color: 'var(--forest)', marginBottom: 8 }}>
            {importSession.filename}
          </div>
          <div style={{ fontSize: 12, color: 'var(--forest-ink)', marginBottom: 16 }}>
            Imported {new Date(importSession.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>

        {hasApprovedItems && (
          <button
            onClick={onImportAll}
            disabled={isImporting}
            className="smallcaps"
            style={{
              padding: '12px 20px',
              background: isImporting ? 'var(--cream-2)' : 'var(--forest)',
              color: isImporting ? 'var(--forest-ink)' : 'var(--cream)',
              fontSize: 11,
              letterSpacing: '.18em',
              boxShadow: isImporting ? 'none' : '3px 3px 0 var(--emerald)',
              border: 'none',
              cursor: isImporting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {isImporting ? 'Importing...' : `Import Approved (${importSession.approved_items})`}
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div>
          <div
            className="smallcaps"
            style={{
              fontSize: 10,
              color: 'var(--forest-ink)',
              letterSpacing: '.1em',
              marginBottom: 4,
            }}
          >
            Total Items
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--forest)' }}>
            {importSession.total_items}
          </div>
        </div>

        <div>
          <div
            className="smallcaps"
            style={{
              fontSize: 10,
              color: 'var(--forest-ink)',
              letterSpacing: '.1em',
              marginBottom: 4,
            }}
          >
            Pending Review
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: '#d97706' }}>
            {importSession.pending_items}
          </div>
        </div>

        <div>
          <div
            className="smallcaps"
            style={{
              fontSize: 10,
              color: 'var(--forest-ink)',
              letterSpacing: '.1em',
              marginBottom: 4,
            }}
          >
            Approved
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--emerald)' }}>
            {importSession.approved_items}
          </div>
        </div>

        <div>
          <div
            className="smallcaps"
            style={{
              fontSize: 10,
              color: 'var(--forest-ink)',
              letterSpacing: '.1em',
              marginBottom: 4,
            }}
          >
            Rejected
          </div>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--pink-ink)' }}>
            {importSession.rejected_items}
          </div>
        </div>
      </div>

      {!hasApprovedItems && !hasPendingItems && (
        <div
          style={{
            marginTop: 16,
            padding: '12px 16px',
            background: 'rgba(16,185,129,.1)',
            borderLeft: '3px solid var(--emerald)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--forest-ink)' }}>
            All items have been reviewed. No approved items to import.
          </div>
        </div>
      )}
    </div>
  );
}
