'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { fetchImportsByUser, deleteImport } from '@/lib/supabase/imports';
import type { PropertyImport } from '@/lib/supabase/imports';
import FileDropzone from './components/FileDropzone';

export default function ImportPortfolioPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentImports, setRecentImports] = useState<PropertyImport[]>([]);
  const [isLoadingImports, setIsLoadingImports] = useState(true);

  useEffect(() => {
    loadImports();
  }, []);

  const loadImports = async () => {
    const imports = await fetchImportsByUser(supabase);
    setRecentImports(imports);
    setIsLoadingImports(false);
  };

  const handleFileSelected = async (file: File) => {
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import-portfolio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process import');
      }

      const data = await response.json();

      // Redirect to review queue
      router.push(`/dashboard/properties/import/${data.importId}`);
    } catch (error) {
      console.error('Error processing import:', error);
      alert(error instanceof Error ? error.message : 'Failed to process import. Please try again.');
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: PropertyImport['status']) => {
    const styles: Record<string, { color: string; bg: string }> = {
      pending: { color: 'var(--forest-ink)', bg: 'var(--cream-2)' },
      'in_progress': { color: 'var(--forest-ink)', bg: 'var(--cream-2)' },
      completed: { color: 'var(--emerald)', bg: 'rgba(16,185,129,.1)' },
      failed: { color: 'var(--pink-ink)', bg: 'rgba(255,185,229,.2)' },
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
        {status.replace('_', ' ')}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteImport = async (importId: string, filename: string) => {
    const confirmed = confirm(
      `Are you sure you want to delete "${filename}"? This will remove all pending items in this import.`
    );
    if (!confirmed) return;

    const success = await deleteImport(supabase, importId);
    if (success) {
      await loadImports();
    } else {
      alert('Failed to delete import. Please try again.');
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/dashboard/properties"
          style={{
            fontSize: 12,
            color: 'var(--forest)',
            textDecoration: 'none',
            marginBottom: 16,
            display: 'inline-block',
          }}
        >
          ← Back to Properties
        </Link>
        <h1 className="display" style={{ fontSize: 40, color: 'var(--forest)', marginBottom: 8 }}>
          Import Portfolio
        </h1>
        <p style={{ fontSize: 14, color: 'var(--forest-ink)', lineHeight: 1.6 }}>
          Upload a CSV or Excel file to import multiple properties at once. Our AI will automatically
          detect columns and parse property data for your review.
        </p>
      </div>

      {/* File Dropzone */}
      <div style={{ marginBottom: 48 }}>
        <FileDropzone onFileSelected={handleFileSelected} isProcessing={isProcessing} />
      </div>

      {/* Recent Imports */}
      <div>
        <h2
          className="smallcaps"
          style={{
            fontSize: 14,
            color: 'var(--forest)',
            marginBottom: 16,
            letterSpacing: '.1em',
          }}
        >
          Recent Imports
        </h2>

        {isLoadingImports ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--forest-ink)' }}>
            Loading...
          </div>
        ) : recentImports.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              background: 'var(--cream-2)',
              border: '1px solid var(--forest)',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--forest-ink)' }}>
              No imports yet. Upload a file to get started.
            </div>
          </div>
        ) : (
          <div
            style={{
              border: '1px solid var(--forest)',
              background: 'var(--cream)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--forest)', color: 'var(--cream)' }}>
                  <th
                    className="smallcaps"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '.1em',
                    }}
                  >
                    Filename
                  </th>
                  <th
                    className="smallcaps"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '.1em',
                    }}
                  >
                    Date
                  </th>
                  <th
                    className="smallcaps"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '.1em',
                    }}
                  >
                    Total
                  </th>
                  <th
                    className="smallcaps"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '.1em',
                    }}
                  >
                    Pending
                  </th>
                  <th
                    className="smallcaps"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '.1em',
                    }}
                  >
                    Status
                  </th>
                  <th
                    className="smallcaps"
                    style={{
                      padding: '12px 16px',
                      textAlign: 'right',
                      fontWeight: 600,
                      fontSize: 11,
                      letterSpacing: '.1em',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentImports.map((importSession) => (
                  <tr
                    key={importSession.id}
                    style={{
                      borderTop: '1px solid var(--forest)',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>{importSession.filename}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {formatDate(importSession.created_at)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {importSession.total_items}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {importSession.pending_items}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {getStatusBadge(importSession.status)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        {importSession.status === 'pending' && (
                          <button
                            onClick={() => handleDeleteImport(importSession.id, importSession.filename)}
                            className="smallcaps"
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid var(--pink-ink)',
                              color: 'var(--pink-ink)',
                              fontSize: 10,
                              letterSpacing: '.18em',
                              cursor: 'pointer',
                            }}
                          >
                            Delete
                          </button>
                        )}
                        <Link
                          href={`/dashboard/properties/import/${importSession.id}`}
                          className="smallcaps"
                          style={{
                            padding: '6px 12px',
                            background: 'var(--forest)',
                            color: 'var(--cream)',
                            fontSize: 10,
                            letterSpacing: '.18em',
                            textDecoration: 'none',
                            display: 'inline-block',
                          }}
                        >
                          {importSession.status === 'completed' ? 'View' : 'Review'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
