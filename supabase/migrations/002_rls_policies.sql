-- ============================================================================
-- Row Level Security Policies
-- Secure access to vendor data based on authentication
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Vendors Policies
-- ============================================================================

-- Authenticated users can read all vendors (for hackathon demo collaboration)
CREATE POLICY "vendors_select_authenticated" ON vendors
  FOR SELECT
  TO authenticated
  USING (true);

-- Public read for demo seed data (vendors without user_id)
CREATE POLICY "vendors_select_public_demo" ON vendors
  FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Users can insert vendors (will be assigned to them)
CREATE POLICY "vendors_insert_authenticated" ON vendors
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can update their own vendors OR demo vendors
CREATE POLICY "vendors_update_own" ON vendors
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL)
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Users can delete their own vendors
CREATE POLICY "vendors_delete_own" ON vendors
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- Checklist Items Policies (cascade from vendor access)
-- ============================================================================

CREATE POLICY "checklist_items_select" ON checklist_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = checklist_items.vendor_id
    )
  );

CREATE POLICY "checklist_items_select_anon" ON checklist_items
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = checklist_items.vendor_id AND vendors.user_id IS NULL
    )
  );

CREATE POLICY "checklist_items_insert" ON checklist_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = checklist_items.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

CREATE POLICY "checklist_items_update" ON checklist_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = checklist_items.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

CREATE POLICY "checklist_items_delete" ON checklist_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = checklist_items.vendor_id
        AND vendors.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Fraud Flags Policies
-- ============================================================================

CREATE POLICY "fraud_flags_select" ON fraud_flags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = fraud_flags.vendor_id
    )
  );

CREATE POLICY "fraud_flags_select_anon" ON fraud_flags
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = fraud_flags.vendor_id AND vendors.user_id IS NULL
    )
  );

CREATE POLICY "fraud_flags_insert" ON fraud_flags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = fraud_flags.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

CREATE POLICY "fraud_flags_update" ON fraud_flags
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = fraud_flags.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

-- ============================================================================
-- Audit Logs Policies
-- ============================================================================

CREATE POLICY "audit_logs_select" ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = audit_logs.vendor_id
    )
  );

CREATE POLICY "audit_logs_select_anon" ON audit_logs
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = audit_logs.vendor_id AND vendors.user_id IS NULL
    )
  );

CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = audit_logs.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

-- ============================================================================
-- Exceptions Policies
-- ============================================================================

CREATE POLICY "exceptions_select" ON exceptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = exceptions.vendor_id
    )
  );

CREATE POLICY "exceptions_select_anon" ON exceptions
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = exceptions.vendor_id AND vendors.user_id IS NULL
    )
  );

CREATE POLICY "exceptions_insert" ON exceptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = exceptions.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

CREATE POLICY "exceptions_update" ON exceptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = exceptions.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

-- ============================================================================
-- Documents Policies
-- ============================================================================

CREATE POLICY "documents_select" ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = documents.vendor_id
    )
  );

CREATE POLICY "documents_select_anon" ON documents
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = documents.vendor_id AND vendors.user_id IS NULL
    )
  );

CREATE POLICY "documents_insert" ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = documents.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );

CREATE POLICY "documents_update" ON documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM vendors WHERE vendors.id = documents.vendor_id
        AND (vendors.user_id = auth.uid() OR vendors.user_id IS NULL)
    )
  );
