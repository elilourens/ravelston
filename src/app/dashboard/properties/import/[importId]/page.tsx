'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
  fetchImportById,
  fetchImportItems,
  approveImportItem,
  rejectImportItem,
  updateImportItem,
  finalizeImport,
  type PropertyImport,
  type PropertyImportItem,
} from '@/lib/supabase/imports';
import ImportHeader from '../components/ImportHeader';
import PropertyImportCard from '../components/PropertyImportCard';
import PropertyReviewModal from '../components/PropertyReviewModal';

export default function ImportReviewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const importId = params.importId as string;

  const [importSession, setImportSession] = useState<PropertyImport | null>(null);
  const [items, setItems] = useState<PropertyImportItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<PropertyImportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<PropertyImportItem | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Load import data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const session = await fetchImportById(supabase, importId);
      const allItems = await fetchImportItems(supabase, importId);

      setImportSession(session);
      setItems(allItems);
      setFilteredItems(allItems);
      setIsLoading(false);
    }

    loadData();
  }, [importId]);

  // Apply filters
  useEffect(() => {
    let filtered = items;

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const address = item.property_data.address?.toLowerCase() || '';
        const postcode = item.property_data.postcode?.toLowerCase() || '';
        return address.includes(query) || postcode.includes(query);
      });
    }

    setFilteredItems(filtered);
  }, [items, statusFilter, searchQuery]);

  const refreshData = async () => {
    const session = await fetchImportById(supabase, importId);
    const allItems = await fetchImportItems(supabase, importId);
    setImportSession(session);
    setItems(allItems);
  };

  const handleQuickApprove = async (itemId: string) => {
    const success = await approveImportItem(supabase, itemId);
    if (success) {
      await refreshData();
    } else {
      alert('Failed to approve item');
    }
  };

  const handleQuickReject = async (itemId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    const success = await rejectImportItem(supabase, itemId, reason);
    if (success) {
      await refreshData();
    } else {
      alert('Failed to reject item');
    }
  };

  const handleReviewItem = (item: PropertyImportItem) => {
    setSelectedItem(item);
  };

  const handleApproveInModal = async (updatedData: Record<string, any>) => {
    if (!selectedItem) return;

    // Update property data
    const updateSuccess = await updateImportItem(supabase, selectedItem.id, updatedData);
    if (!updateSuccess) {
      alert('Failed to update property data');
      return;
    }

    // Approve the item
    const approveSuccess = await approveImportItem(supabase, selectedItem.id);
    if (!approveSuccess) {
      alert('Failed to approve item');
      return;
    }

    await refreshData();
  };

  const handleRejectInModal = async (reason: string) => {
    if (!selectedItem) return;

    const success = await rejectImportItem(supabase, selectedItem.id, reason);
    if (success) {
      await refreshData();
      setSelectedItem(null);
    } else {
      alert('Failed to reject item');
    }
  };

  const handleNext = () => {
    // Find next pending item
    const currentIndex = filteredItems.findIndex((item) => item.id === selectedItem?.id);
    const nextPendingItem = filteredItems
      .slice(currentIndex + 1)
      .find((item) => item.status === 'pending');

    if (nextPendingItem) {
      setSelectedItem(nextPendingItem);
    } else {
      setSelectedItem(null);
    }
  };

  const handleImportAll = async () => {
    if (!importSession) return;

    const confirmed = confirm(
      `Are you sure you want to import ${importSession.approved_items} approved properties?`
    );
    if (!confirmed) return;

    setIsImporting(true);

    try {
      const result = await finalizeImport(supabase, importId);

      if (result.success) {
        alert(`Successfully imported ${result.insertedCount} properties!`);
        router.push('/dashboard/properties');
      } else {
        alert(`Failed to import properties: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Error importing properties:', error);
      alert('Failed to import properties. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: 'var(--forest)' }}>Loading import...</div>
      </div>
    );
  }

  if (!importSession) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, color: 'var(--pink-ink)', marginBottom: 16 }}>
          Import not found
        </div>
        <Link href="/dashboard/properties/import" style={{ color: 'var(--forest)' }}>
          ← Back to Imports
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px' }}>
      {/* Back link */}
      <Link
        href="/dashboard/properties/import"
        style={{
          fontSize: 12,
          color: 'var(--forest)',
          textDecoration: 'none',
          marginBottom: 16,
          display: 'inline-block',
        }}
      >
        ← Back to Imports
      </Link>

      {/* Import header with stats */}
      <ImportHeader
        importSession={importSession}
        onImportAll={handleImportAll}
        isImporting={isImporting}
      />

      {/* Filters */}
      <div
        style={{
          background: 'var(--cream-2)',
          padding: '20px',
          marginBottom: 24,
          border: '1px solid var(--forest)',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* Status filter */}
          <div style={{ flex: '0 0 200px' }}>
            <div
              className="smallcaps"
              style={{
                fontSize: 10,
                color: 'var(--forest-ink)',
                marginBottom: 4,
                letterSpacing: '.1em',
              }}
            >
              Filter by Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--forest)',
                background: 'var(--cream)',
                fontSize: 13,
                color: 'var(--forest)',
              }}
            >
              <option value="all">All ({items.length})</option>
              <option value="pending">
                Pending ({items.filter((i) => i.status === 'pending').length})
              </option>
              <option value="approved">
                Approved ({items.filter((i) => i.status === 'approved').length})
              </option>
              <option value="rejected">
                Rejected ({items.filter((i) => i.status === 'rejected').length})
              </option>
            </select>
          </div>

          {/* Search */}
          <div style={{ flex: 1 }}>
            <div
              className="smallcaps"
              style={{
                fontSize: 10,
                color: 'var(--forest-ink)',
                marginBottom: 4,
                letterSpacing: '.1em',
              }}
            >
              Search
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address or postcode..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid var(--forest)',
                background: 'var(--cream)',
                fontSize: 13,
                color: 'var(--forest)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Property list */}
      <div>
        {filteredItems.length === 0 ? (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              background: 'var(--cream-2)',
              border: '1px solid var(--forest)',
            }}
          >
            <div style={{ fontSize: 14, color: 'var(--forest-ink)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'No properties match your filters'
                : 'No properties in this import'}
            </div>
          </div>
        ) : (
          filteredItems.map((item) => (
            <PropertyImportCard
              key={item.id}
              item={item}
              onReview={() => handleReviewItem(item)}
              onQuickApprove={() => handleQuickApprove(item.id)}
              onQuickReject={() => handleQuickReject(item.id)}
            />
          ))
        )}
      </div>

      {/* Review modal */}
      {selectedItem && (
        <PropertyReviewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onApprove={handleApproveInModal}
          onReject={handleRejectInModal}
          onNext={
            filteredItems
              .slice(filteredItems.findIndex((i) => i.id === selectedItem.id) + 1)
              .some((i) => i.status === 'pending')
              ? handleNext
              : undefined
          }
        />
      )}
    </div>
  );
}
