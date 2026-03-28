// ============================================================================
// Nexus — Database Types
// TypeScript types matching the Supabase database schema
// ============================================================================

export type WorkflowStatus = 'pending' | 'active' | 'escalated' | 'complete' | 'failed';
export type RiskScore = 'Low' | 'Medium' | 'High' | null;
export type HealthStatus = 'Green' | 'Amber' | 'Red' | null;
export type ChecklistStatus = 'pending' | 'submitted' | 'verified' | 'failed';
export type FlagSeverity = 'low' | 'medium' | 'high';

export interface Vendor {
  id: string;
  vendor_name: string;
  industry: string;
  contact_email: string | null;
  workflow_status: WorkflowStatus;
  risk_score: RiskScore;
  risk_rationale: string | null;
  health_status: HealthStatus;
  current_step: number;
  escalation_level: number;
  monitoring_notes: string | null;
  last_monitored: string | null;
  created_at: string;
  updated_at: string;
  user_id: string | null;
}

export interface ChecklistItem {
  id: string;
  vendor_id: string;
  category: string;
  document_name: string;
  description: string | null;
  required: boolean;
  status: ChecklistStatus;
  retry_count: number;
  max_retries: number;
}

export interface FraudFlag {
  id: string;
  vendor_id: string;
  doc_name: string | null;
  flag_type: string;
  description: string | null;
  severity: FlagSeverity;
  detected_at: string;
}

export interface AuditLog {
  id: string;
  vendor_id: string;
  agent: string;
  action: string;
  reason: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Exception {
  id: string;
  vendor_id: string;
  exception_type: string;
  description: string | null;
  agent: string | null;
  requires_human: boolean;
  resolution: string | null;
  created_at: string;
}

export interface Document {
  id: string;
  vendor_id: string;
  checklist_item_id: string | null;
  document_name: string;
  file_path: string | null;
  file_url: string | null;
  submitted_at: string;
}

// Extended types with relations
export interface VendorWithCounts extends Vendor {
  checklist_count?: number;
  verified_count?: number;
  fraud_flag_count?: number;
}

export interface VendorWithDetails extends Vendor {
  checklist_items: ChecklistItem[];
  fraud_flags: FraudFlag[];
  audit_logs: AuditLog[];
  exceptions: Exception[];
  documents: Document[];
}

export interface AuditLogWithVendor extends AuditLog {
  vendor?: {
    vendor_name: string;
    industry: string;
  };
}

export interface DashboardSummary {
  total: number;
  pending: number;
  active: number;
  escalated: number;
  complete: number;
}

export interface HealthSummary {
  total: number;
  green: number;
  amber: number;
  red: number;
}

// Input types for creating/updating
export interface CreateVendorInput {
  vendor_name: string;
  industry: string;
  contact_email?: string;
  user_id?: string;
}

export interface UpdateVendorInput {
  vendor_name?: string;
  industry?: string;
  contact_email?: string;
  workflow_status?: WorkflowStatus;
  risk_score?: RiskScore;
  risk_rationale?: string;
  health_status?: HealthStatus;
  current_step?: number;
  escalation_level?: number;
  monitoring_notes?: string;
  last_monitored?: string;
}

export interface CreateAuditLogInput {
  vendor_id: string;
  agent: string;
  action: string;
  reason?: string;
  details?: Record<string, unknown>;
}

export interface AuditLogFilters {
  vendor_id?: string;
  agent?: string;
  action?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
}
