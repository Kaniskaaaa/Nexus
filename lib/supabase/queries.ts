// ============================================================================
// Nexus — Supabase Query Helpers
// Centralized database queries for vendor management
// ============================================================================

import { createClient } from './client';
import type {
  Vendor,
  VendorWithCounts,
  VendorWithDetails,
  ChecklistItem,
  FraudFlag,
  AuditLog,
  AuditLogWithVendor,
  Exception,
  DashboardSummary,
  HealthSummary,
  CreateVendorInput,
  UpdateVendorInput,
  CreateAuditLogInput,
  AuditLogFilters,
} from '../types';

// ============================================================================
// Vendor Queries
// ============================================================================

/**
 * Get all vendors with counts of checklist items and fraud flags
 */
export async function getVendors(): Promise<VendorWithCounts[]> {
  const supabase = createClient();
  
  const { data: vendors, error } = await supabase
    .from('vendors')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!vendors) return [];

  // Get counts for each vendor
  const vendorsWithCounts = await Promise.all(
    vendors.map(async (vendor) => {
      const [checklistResult, fraudResult] = await Promise.all([
        supabase
          .from('checklist_items')
          .select('id, status')
          .eq('vendor_id', vendor.id),
        supabase
          .from('fraud_flags')
          .select('id')
          .eq('vendor_id', vendor.id),
      ]);

      const checklistItems = checklistResult.data || [];
      const verifiedCount = checklistItems.filter(item => item.status === 'verified').length;

      return {
        ...vendor,
        checklist_count: checklistItems.length,
        verified_count: verifiedCount,
        fraud_flag_count: fraudResult.data?.length || 0,
      };
    })
  );

  return vendorsWithCounts;
}

/**
 * Get a single vendor with all related data
 */
export async function getVendorWithDetails(vendorId: string): Promise<VendorWithDetails | null> {
  const supabase = createClient();

  const [vendorResult, checklistResult, fraudResult, auditResult, exceptionsResult, documentsResult] = await Promise.all([
    supabase.from('vendors').select('*').eq('id', vendorId).single(),
    supabase.from('checklist_items').select('*').eq('vendor_id', vendorId).order('category'),
    supabase.from('fraud_flags').select('*').eq('vendor_id', vendorId).order('detected_at', { ascending: false }),
    supabase.from('audit_logs').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }),
    supabase.from('exceptions').select('*').eq('vendor_id', vendorId).order('created_at', { ascending: false }),
    supabase.from('documents').select('*').eq('vendor_id', vendorId).order('submitted_at', { ascending: false }),
  ]);

  if (vendorResult.error || !vendorResult.data) return null;

  return {
    ...vendorResult.data,
    checklist_items: checklistResult.data || [],
    fraud_flags: fraudResult.data || [],
    audit_logs: auditResult.data || [],
    exceptions: exceptionsResult.data || [],
    documents: documentsResult.data || [],
  };
}

/**
 * Get dashboard summary counts by workflow status
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vendors')
    .select('workflow_status');

  if (error) throw error;

  const summary: DashboardSummary = {
    total: data?.length || 0,
    pending: 0,
    active: 0,
    escalated: 0,
    complete: 0,
  };

  data?.forEach((vendor) => {
    const status = vendor.workflow_status as keyof Omit<DashboardSummary, 'total'>;
    if (status && status in summary) {
      summary[status]++;
    }
  });

  return summary;
}

/**
 * Create a new vendor
 */
export async function createVendor(input: CreateVendorInput): Promise<Vendor> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vendors')
    .insert({
      vendor_name: input.vendor_name,
      industry: input.industry,
      contact_email: input.contact_email || null,
      user_id: input.user_id || null,
      workflow_status: 'pending',
      current_step: 0,
      escalation_level: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a vendor
 */
export async function updateVendor(vendorId: string, updates: UpdateVendorInput): Promise<Vendor> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vendors')
    .update(updates)
    .eq('id', vendorId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Audit Log Queries
// ============================================================================

/**
 * Get audit logs with optional filtering
 */
export async function getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogWithVendor[]> {
  const supabase = createClient();

  let query = supabase
    .from('audit_logs')
    .select('*, vendor:vendors(vendor_name, industry)')
    .order('created_at', { ascending: false });

  if (filters?.vendor_id) {
    query = query.eq('vendor_id', filters.vendor_id);
  }
  if (filters?.agent) {
    query = query.eq('agent', filters.agent);
  }
  if (filters?.action) {
    query = query.ilike('action', `%${filters.action}%`);
  }
  if (filters?.from_date) {
    query = query.gte('created_at', filters.from_date);
  }
  if (filters?.to_date) {
    query = query.lte('created_at', filters.to_date);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Insert a new audit log entry
 */
export async function insertAuditLog(input: CreateAuditLogInput): Promise<AuditLog> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      vendor_id: input.vendor_id,
      agent: input.agent,
      action: input.action,
      reason: input.reason || null,
      details: input.details || {},
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Health Dashboard Queries
// ============================================================================

/**
 * Get health dashboard data with summary and vendor list
 */
export async function getHealthDashboard(): Promise<{
  summary: HealthSummary;
  vendors: Vendor[];
}> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .not('health_status', 'is', null)
    .order('last_monitored', { ascending: false });

  if (error) throw error;

  const vendors = data || [];
  const summary: HealthSummary = {
    total: vendors.length,
    green: vendors.filter((v) => v.health_status === 'Green').length,
    amber: vendors.filter((v) => v.health_status === 'Amber').length,
    red: vendors.filter((v) => v.health_status === 'Red').length,
  };

  return { summary, vendors };
}

// ============================================================================
// Checklist Queries
// ============================================================================

/**
 * Get checklist items for a vendor
 */
export async function getChecklistItems(vendorId: string): Promise<ChecklistItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('category');

  if (error) throw error;
  return data || [];
}

/**
 * Update checklist item status
 */
export async function updateChecklistItem(
  itemId: string,
  updates: Partial<ChecklistItem>
): Promise<ChecklistItem> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Exception Queries
// ============================================================================

/**
 * Get all exceptions requiring human review
 */
export async function getExceptionsRequiringHuman(): Promise<(Exception & { vendor?: Vendor })[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exceptions')
    .select('*, vendor:vendors(*)')
    .eq('requires_human', true)
    .is('resolution', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Resolve an exception
 */
export async function resolveException(exceptionId: string, resolution: string): Promise<Exception> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('exceptions')
    .update({ resolution, requires_human: false })
    .eq('id', exceptionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Fraud Flag Queries
// ============================================================================

/**
 * Get all fraud flags
 */
export async function getFraudFlags(vendorId?: string): Promise<FraudFlag[]> {
  const supabase = createClient();

  let query = supabase
    .from('fraud_flags')
    .select('*')
    .order('detected_at', { ascending: false });

  if (vendorId) {
    query = query.eq('vendor_id', vendorId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}
