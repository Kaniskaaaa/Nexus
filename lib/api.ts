// ============================================================================
// Nexus — API Client
// Centralized API calls to the FastAPI backend.
// ============================================================================

const API_BASE = '/api';

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

// Health check
export const getHealth = () => fetchJSON<{ status: string }>('/health');

// Vendor onboarding
export const onboardVendor = (data: {
  vendor_name: string;
  industry: string;
  contact_email: string;
  urgency: string;
}) =>
  fetchJSON<{ vendor_id: string; vendor_name: string; [key: string]: unknown }>(`${API_BASE}/vendor/onboard`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Vendor status
export const getVendorStatus = (vendorId: string) =>
  fetchJSON<{ vendor_id: string; vendor_name: string; workflow_status: string; [key: string]: unknown }>(`${API_BASE}/vendor/${vendorId}/status`);

// List all vendors
export const listVendors = () => fetchJSON<{ vendors: unknown[] } | unknown[]>(`${API_BASE}/vendors`);

// Run full pipeline
export const runPipeline = (vendorId: string) =>
  fetchJSON<{ status: string }>(`${API_BASE}/vendor/${vendorId}/run-pipeline`, { method: 'POST' });

// Monitor vendor
export const monitorVendor = (vendorId: string) =>
  fetchJSON<{ status: string }>(`${API_BASE}/vendor/${vendorId}/monitor`, { method: 'POST' });

// Buyer dashboard
export const getBuyerDashboard = () => fetchJSON<unknown>(`${API_BASE}/buyer/dashboard`);

// Buyer exceptions
export const getExceptions = () => fetchJSON<unknown>(`${API_BASE}/buyer/exceptions`);

// Supplier form
export const getSupplierForm = (vendorId: string) =>
  fetchJSON<unknown>(`${API_BASE}/supplier/${vendorId}/form`);

// Supplier status
export const getSupplierStatus = (vendorId: string) =>
  fetchJSON<unknown>(`${API_BASE}/supplier/${vendorId}/status`);

// Submit document
export const submitDocument = (vendorId: string, formData: FormData) => {
  return fetch(`${API_BASE}/supplier/${vendorId}/submit-document`, {
    method: 'POST',
    body: formData, // Do NOT set Content-Type header manually for FormData
  }).then(async res => {
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API Error: ${res.status}`);
    }
    return res.json();
  });
};

// Monitor health dashboard
export const getHealthDashboard = () =>
  fetchJSON<{ summary: { total: number; green: number; amber: number; red: number }; vendors: unknown[] }>(`${API_BASE}/monitor/health-dashboard`);
