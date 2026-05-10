-- Create property_imports table to track import sessions
CREATE TABLE IF NOT EXISTS property_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  total_items INTEGER NOT NULL DEFAULT 0,
  pending_items INTEGER NOT NULL DEFAULT 0,
  approved_items INTEGER NOT NULL DEFAULT 0,
  rejected_items INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_import_items table to store individual properties pending review
CREATE TABLE IF NOT EXISTS property_import_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES property_imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  property_data JSONB NOT NULL,
  raw_data JSONB NOT NULL,
  validation_errors JSONB,
  confidence_scores JSONB,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(import_id, row_number)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_imports_user_id ON property_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_property_imports_created_at ON property_imports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_property_import_items_import_id ON property_import_items(import_id);
CREATE INDEX IF NOT EXISTS idx_property_import_items_status ON property_import_items(status);

-- Enable Row Level Security
ALTER TABLE property_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_import_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_imports
CREATE POLICY "Users can view their own imports"
  ON property_imports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own imports"
  ON property_imports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own imports"
  ON property_imports
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own imports"
  ON property_imports
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for property_import_items
CREATE POLICY "Users can view items from their imports"
  ON property_import_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM property_imports
      WHERE property_imports.id = property_import_items.import_id
      AND property_imports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to their imports"
  ON property_import_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM property_imports
      WHERE property_imports.id = property_import_items.import_id
      AND property_imports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items from their imports"
  ON property_import_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM property_imports
      WHERE property_imports.id = property_import_items.import_id
      AND property_imports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from their imports"
  ON property_import_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM property_imports
      WHERE property_imports.id = property_import_items.import_id
      AND property_imports.user_id = auth.uid()
    )
  );

-- Create function to update property_imports counts
CREATE OR REPLACE FUNCTION update_property_import_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE property_imports
  SET
    pending_items = (
      SELECT COUNT(*) FROM property_import_items
      WHERE import_id = NEW.import_id AND status = 'pending'
    ),
    approved_items = (
      SELECT COUNT(*) FROM property_import_items
      WHERE import_id = NEW.import_id AND status = 'approved'
    ),
    rejected_items = (
      SELECT COUNT(*) FROM property_import_items
      WHERE import_id = NEW.import_id AND status = 'rejected'
    ),
    updated_at = NOW()
  WHERE id = NEW.import_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update counts
CREATE TRIGGER update_import_counts_trigger
  AFTER INSERT OR UPDATE OF status ON property_import_items
  FOR EACH ROW
  EXECUTE FUNCTION update_property_import_counts();
