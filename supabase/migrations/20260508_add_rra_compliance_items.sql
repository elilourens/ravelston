-- Migration: Add Renters' Rights Act 2025 Compliance Items
-- Date: 2026-05-08
-- Description: Adds new compliance tracking for RRA requirements (effective 1 May 2026)
--
-- This migration documents the new compliance fields added to the properties.compliance JSONB column.
-- Since compliance is stored as JSONB, no schema changes are required - this is for documentation.
--
-- New compliance items:
-- 1. rraInformationSheet - Track delivery of mandatory RRA Information Sheet (deadline: 31 May 2026)
-- 2. petRequestTracking - Track tenant pet requests with 28-42 day response deadline
-- 3. awaitingGroundsNotice - Track possession grounds disclosure (£7k fine for non-compliance)
-- 4. ombudsmanMembership - Track redress scheme membership
-- 5. writtenStatementOfTerms - Track written statement provision for verbal tenancies

-- Example compliance structure (for reference):
/*
{
  "rraInformationSheet": {
    "status": "valid",
    "required": true,
    "deliveryStatus": "delivered",
    "deliveryDate": "2026-04-15",
    "deliveryMethod": "email",
    "recipientName": "John Smith",
    "deadline": "2026-05-31",
    "notes": "RRA Information Sheet delivered via email with read receipt"
  },
  "petRequestTracking": {
    "status": "valid",
    "required": true,
    "requests": [
      {
        "id": "pet-001",
        "requestDate": "2026-03-10",
        "petType": "Cat",
        "petDetails": "Indoor cat, neutered, fully vaccinated",
        "responseDeadline": "2026-04-21",
        "status": "approved",
        "responseDate": "2026-03-18",
        "conditions": ["Professional carpet cleaning at end of tenancy"]
      }
    ],
    "petsAllowed": true,
    "hasActiveRequests": false
  },
  "awaitingGroundsNotice": {
    "status": "valid",
    "required": true,
    "groundsDisclosed": true,
    "disclosureDate": "2024-01-10",
    "disclosedGrounds": ["Ground 1B", "Ground 6A"],
    "noticeProvided": true,
    "noticeProvidedDate": "2024-01-10"
  },
  "ombudsmanMembership": {
    "status": "valid",
    "required": true,
    "schemeName": "Property Ombudsman",
    "membershipNumber": "PO-123456",
    "issueDate": "2025-04-01",
    "expiryDate": "2026-04-01",
    "renewalDate": "2026-04-01",
    "autoRenewal": true
  },
  "writtenStatementOfTerms": {
    "status": "valid",
    "required": true,
    "tenancyType": "written",
    "statementProvided": true,
    "provisionDate": "2024-01-10"
  }
}
*/

-- Verification query to check existing properties compliance structure:
-- SELECT id, address, compliance FROM properties LIMIT 1;

-- Note: Existing properties will need to be updated with default values for new compliance items.
-- This can be done through the application's seed function or by running an update query.

-- Update existing properties to include new RRA compliance items (optional):
-- This query adds default/pending values for new compliance items to existing properties
/*
UPDATE properties
SET compliance = compliance || jsonb_build_object(
  'rraInformationSheet', jsonb_build_object(
    'status', 'required',
    'required', true,
    'deliveryStatus', 'pending',
    'deadline', '2026-05-31',
    'notes', 'RRA Information Sheet must be provided to existing tenants by 31 May 2026'
  ),
  'petRequestTracking', jsonb_build_object(
    'status', 'not-applicable',
    'required', false,
    'requests', '[]'::jsonb,
    'petsAllowed', true,
    'hasActiveRequests', false
  ),
  'awaitingGroundsNotice', jsonb_build_object(
    'status', 'required',
    'required', true,
    'groundsDisclosed', false,
    'notes', 'Ensure awaiting grounds are disclosed in tenancy agreement to avoid £7k fine'
  ),
  'ombudsmanMembership', jsonb_build_object(
    'status', 'required',
    'required', true,
    'notes', 'Membership in approved redress scheme is mandatory'
  ),
  'writtenStatementOfTerms', jsonb_build_object(
    'status', 'required',
    'required', true,
    'tenancyType', 'written',
    'notes', 'Provide written statement for verbal tenancies by 31 May 2026'
  )
)
WHERE compliance IS NOT NULL;
*/

-- Indexes (if needed for performance with large datasets):
-- CREATE INDEX IF NOT EXISTS idx_properties_compliance_rra ON properties USING GIN ((compliance -> 'rraInformationSheet'));
-- CREATE INDEX IF NOT EXISTS idx_properties_compliance_pets ON properties USING GIN ((compliance -> 'petRequestTracking'));
