-- ============================================================================
-- Nexus Database Schema
-- Initial migration: Create core tables for vendor onboarding system
-- ============================================================================

-- Vendors table: Core vendor information
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  contact_email TEXT,
  workflow_status TEXT DEFAULT 'pending',
  risk_score TEXT,
  risk_rationale TEXT,
  health_status TEXT,
  current_step INTEGER DEFAULT 0,
  escalation_level INTEGER DEFAULT 0,
  monitoring_notes TEXT,
  last_monitored TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id)
);

-- Checklist items table: Document requirements for each vendor
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  document_name TEXT NOT NULL,
  description TEXT,
  required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 2
);

-- Fraud flags table: Detected issues during verification
CREATE TABLE IF NOT EXISTS fraud_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  doc_name TEXT,
  flag_type TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'high',
  detected_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs table: Track all agent actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  agent TEXT NOT NULL,
  action TEXT NOT NULL,
  reason TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Exceptions table: Track issues requiring human intervention
CREATE TABLE IF NOT EXISTS exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  exception_type TEXT NOT NULL,
  description TEXT,
  agent TEXT,
  requires_human BOOLEAN DEFAULT false,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents table: Submitted files from suppliers
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES checklist_items(id),
  document_name TEXT NOT NULL,
  file_path TEXT,
  file_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_workflow_status ON vendors(workflow_status);
CREATE INDEX IF NOT EXISTS idx_vendors_health_status ON vendors(health_status);
CREATE INDEX IF NOT EXISTS idx_checklist_items_vendor_id ON checklist_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_checklist_items_status ON checklist_items(status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_vendor_id ON fraud_flags(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_vendor_id ON audit_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_exceptions_vendor_id ON exceptions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_documents_vendor_id ON documents(vendor_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to vendors table
DROP TRIGGER IF EXISTS update_vendors_updated_at ON vendors;
CREATE TRIGGER update_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
