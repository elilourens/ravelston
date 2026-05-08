# Supabase Migrations

This directory contains SQL migration files for the Ravelston.ai property compliance platform.

## Migrations

### 20260508_add_rra_compliance_items.sql

**Purpose:** Adds tracking for Renters' Rights Act 2025 compliance requirements (effective 1 May 2026)

**New Compliance Items:**

1. **RRA Information Sheet** - Mandatory information sheet for existing tenants (deadline: 31 May 2026)
   - Fine for non-compliance: Up to £7,000 first offense, up to £40,000 for repeated violations

2. **Pet Request Tracking** - Log and track tenant pet requests with 28-42 day response deadline
   - Automatic deadline calculation
   - Approval/denial tracking with reasons

3. **Awaiting Grounds Notice** - Track possession grounds that require advance disclosure
   - Fine for non-compliance: Up to £7,000
   - Must be disclosed before tenancy begins

4. **Ombudsman Membership** - Track membership in approved redress scheme
   - Mandatory for all landlords
   - Annual renewal tracking

5. **Written Statement of Terms** - Track provision of written summary for verbal tenancies
   - Required by 31 May 2026 for existing verbal tenancies

## Applying Migrations

### If using Supabase CLI:

```bash
supabase db push
```

### If using Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL

### For Existing Properties:

The seed function (`src/lib/supabase/seed-properties.ts`) will automatically include the new compliance items for new properties. For existing properties, you can either:

1. **Option A (Recommended):** Let the application handle it - the UI will treat missing compliance items as "required"
2. **Option B:** Run the UPDATE query provided in the migration file to add default values

## Database Schema

The `properties` table uses a JSONB column for compliance data, which allows flexible schema changes without requiring strict migrations. The compliance structure is defined in TypeScript interfaces at `src/app/dashboard/properties/mock-data.ts`.

## Testing

After applying the migration, verify the structure:

```sql
SELECT id, address, compliance FROM properties LIMIT 1;
```

The compliance object should include the new RRA compliance items.
