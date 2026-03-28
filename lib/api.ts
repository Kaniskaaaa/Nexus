// ============================================================================
// Nexus — API Client
// Hybrid API: Supabase for reads, FastAPI for write operations
// Falls back to FastAPI if Supabase is not configured
// ============================================================================

import {
  getVendors as supabaseGetVendors,
  getVendorWithDetails,
  getDashboardSummary,
  getHealthDashboard as supabaseGetHealthDashboard,
  getAuditLogs as supabaseGetAuditLogs,
  getExceptionsRequiringHuman,
  createVendor as supabaseCreateVendor,
  updateVendor as supabaseUpdateVendor,
  insertAuditLog,
  getChecklistItems,
} from './supabase/queries';
import type { 
  VendorWithCounts, 
  VendorWithDetails, 
  AuditLogWithVendor,
  AuditLogFilters,
  CreateVendorInput,
} from './types';

const API_BASE = '/api';

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_SUPABASE_URL;
};

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

async function fetchJSON<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// ============================================================================
// Health Check (always backend)
// ============================================================================

export const getHealth = () => fetchJSON<{ status: string }>('/health');

// ============================================================================
// Vendor Operations — Supabase first, fallback to backend
// ============================================================================

/**
 * List all vendors with counts
 */
export async function listVendors(): Promise<{ vendors: VendorWithCounts[] }> {
  if (isSupabaseConfigured()) {
    try {
      const vendors = await supabaseGetVendors();
      return { vendors };
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  // Fallback to FastAPI
  const result = await fetchJSON<{ vendors: unknown[] } | unknown[]>(`${API_BASE}/vendors`);
  const vendors = Array.isArray(result) ? result : result.vendors;
  return { vendors: vendors as VendorWithCounts[] };
}

/**
 * Get vendor status/details
 */
export async function getVendorStatus(vendorId: string): Promise<VendorWithDetails | null> {
  if (isSupabaseConfigured()) {
    try {
      return await getVendorWithDetails(vendorId);
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  // Fallback to FastAPI
  return fetchJSON<VendorWithDetails>(`${API_BASE}/vendor/${vendorId}/status`);
}

/**
 * Onboard a new vendor
 */
export async function onboardVendor(data: {
  vendor_name: string;
  industry: string;
  contact_email: string;
  urgency?: string;
}): Promise<{ vendor_id: string; vendor_name: string }> {
  // Always use FastAPI for onboarding (triggers AI pipeline)
  const result = await fetchJSON<{ vendor_id: string; vendor_name: string }>(`${API_BASE}/vendor/onboard`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  // Also create in Supabase for persistence
  if (isSupabaseConfigured()) {
    try {
      const input: CreateVendorInput = {
        vendor_name: data.vendor_name,
        industry: data.industry,
        contact_email: data.contact_email,
      };
      await supabaseCreateVendor(input);
    } catch (error) {
      console.warn('Failed to sync vendor to Supabase:', error);
    }
  }

  return result;
}

// ============================================================================
// Dashboard Data — Supabase first
// ============================================================================

/**
 * Get buyer dashboard data
 */
export async function getBuyerDashboard() {
  if (isSupabaseConfigured()) {
    try {
      const [vendors, summary] = await Promise.all([
        supabaseGetVendors(),
        getDashboardSummary(),
      ]);
      
      return {
        summary,
        vendors,
        recent_activity: [], // Audit logs can be fetched separately
      };
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  return fetchJSON<unknown>(`${API_BASE}/buyer/dashboard`);
}

/**
 * Get exceptions requiring human review
 */
export async function getExceptions() {
  if (isSupabaseConfigured()) {
    try {
      const exceptions = await getExceptionsRequiringHuman();
      return { exceptions };
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  return fetchJSON<unknown>(`${API_BASE}/buyer/exceptions`);
}

/**
 * Get health dashboard
 */
export async function getHealthDashboard(): Promise<{
  summary: { total: number; green: number; amber: number; red: number };
  vendors: unknown[];
}> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseGetHealthDashboard();
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  return fetchJSON<{
    summary: { total: number; green: number; amber: number; red: number };
    vendors: unknown[];
  }>(`${API_BASE}/monitor/health-dashboard`);
}

/**
 * Get audit logs with filtering
 */
export async function getAuditLogs(filters?: AuditLogFilters): Promise<AuditLogWithVendor[]> {
  if (isSupabaseConfigured()) {
    try {
      return await supabaseGetAuditLogs(filters);
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  // Fallback - construct query params for API
  const params = new URLSearchParams();
  if (filters?.vendor_id) params.set('vendor_id', filters.vendor_id);
  if (filters?.agent) params.set('agent', filters.agent);
  if (filters?.limit) params.set('limit', String(filters.limit));
  
  const url = `${API_BASE}/audit/logs${params.toString() ? `?${params}` : ''}`;
  const result = await fetchJSON<{ logs: AuditLogWithVendor[] }>(url);
  return result.logs || [];
}

// ============================================================================
// Supplier Portal — Supabase first for reads
// ============================================================================

/**
 * Get supplier form data (checklist items)
 */
export async function getSupplierForm(vendorId: string) {
  if (isSupabaseConfigured()) {
    try {
      const [vendor, checklist] = await Promise.all([
        getVendorWithDetails(vendorId),
        getChecklistItems(vendorId),
      ]);
      
      if (vendor) {
        return {
          vendor_id: vendor.id,
          vendor_name: vendor.vendor_name,
          industry: vendor.industry,
          checklist: checklist,
        };
      }
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  return fetchJSON<unknown>(`${API_BASE}/supplier/${vendorId}/form`);
}

/**
 * Get supplier status
 */
export async function getSupplierStatus(vendorId: string) {
  if (isSupabaseConfigured()) {
    try {
      const vendor = await getVendorWithDetails(vendorId);
      if (vendor) {
        const totalDocs = vendor.checklist_items.length;
        const verifiedDocs = vendor.checklist_items.filter(item => item.status === 'verified').length;
        
        return {
          vendor_id: vendor.id,
          vendor_name: vendor.vendor_name,
          workflow_status: vendor.workflow_status,
          current_step: vendor.current_step,
          progress: {
            total: totalDocs,
            verified: verifiedDocs,
            pending: totalDocs - verifiedDocs,
          },
        };
      }
    } catch (error) {
      console.warn('Supabase query failed, falling back to API:', error);
    }
  }
  
  return fetchJSON<unknown>(`${API_BASE}/supplier/${vendorId}/status`);
}

// ============================================================================
// Actions — Always use FastAPI (triggers AI pipeline)
// ============================================================================

/**
 * Run full AI pipeline for vendor
 */
export const runPipeline = (vendorId: string) =>
  fetchJSON<{ status: string }>(`${API_BASE}/vendor/${vendorId}/run-pipeline`, { method: 'POST' });

/**
 * Monitor vendor health
 */
export const monitorVendor = (vendorId: string) =>
  fetchJSON<{ status: string }>(`${API_BASE}/vendor/${vendorId}/monitor`, { method: 'POST' });

/**
 * Submit document (always backend - handles file upload)
 */
export const submitDocument = (vendorId: string, formData: FormData) => {
  return fetch(`${API_BASE}/supplier/${vendorId}/submit-document`, {
    method: 'POST',
    body: formData,
  }).then(async res => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API Error: ${res.status}`);
    }
    return res.json();
  });
};

// ============================================================================
// Supabase-specific exports for direct use
// ============================================================================

export {
  supabaseCreateVendor as createVendorInSupabase,
  supabaseUpdateVendor as updateVendorInSupabase,
  insertAuditLog as createAuditLog,
};
