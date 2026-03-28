-- ============================================================================
-- Nexus Demo Seed Data
-- Three vendor scenarios demonstrating different workflow states
-- ============================================================================

-- ============================================================================
-- Vendor 1: Global Health Supplies Ltd (MedTech) - Active, Low Risk
-- ============================================================================

INSERT INTO vendors (id, vendor_name, industry, contact_email, workflow_status, risk_score, risk_rationale, health_status, current_step, escalation_level, monitoring_notes, last_monitored, user_id)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Global Health Supplies Ltd',
  'MedTech',
  'vendor@globalhealthsupplies.com',
  'active',
  'Low',
  'All documents verified. Company has 15+ years of operation with clean compliance record. Strong financial standing confirmed.',
  'Green',
  4,
  0,
  'Routine monitoring completed. All compliance metrics within acceptable ranges.',
  now() - interval '2 hours',
  NULL
);

-- Checklist items for Global Health Supplies
INSERT INTO checklist_items (vendor_id, category, document_name, description, required, status) VALUES
('11111111-1111-1111-1111-111111111111', 'Legal', 'Certificate of Incorporation', 'Company registration certificate', true, 'verified'),
('11111111-1111-1111-1111-111111111111', 'Tax', 'GST Registration', 'Goods and Services Tax registration', true, 'verified'),
('11111111-1111-1111-1111-111111111111', 'Tax', 'PAN Card', 'Permanent Account Number card', true, 'submitted'),
('11111111-1111-1111-1111-111111111111', 'Compliance', 'ISO 9001', 'Quality Management System certification', true, 'submitted'),
('11111111-1111-1111-1111-111111111111', 'Compliance', 'CDSCO Licence', 'Central Drugs Standard Control Organisation licence', true, 'pending'),
('11111111-1111-1111-1111-111111111111', 'Compliance', 'ISO 13485', 'Medical Devices Quality Management', false, 'pending');

-- Audit logs for Global Health Supplies
INSERT INTO audit_logs (vendor_id, agent, action, reason, details, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Orchestrator', 'workflow_started', 'New vendor onboarding initiated', '{"vendor_name": "Global Health Supplies Ltd", "industry": "MedTech"}', now() - interval '7 days'),
('11111111-1111-1111-1111-111111111111', 'Orchestrator', 'checklist_generated', 'Industry-specific checklist created', '{"items_count": 6, "industry": "MedTech"}', now() - interval '7 days' + interval '5 minutes'),
('11111111-1111-1111-1111-111111111111', 'Collector', 'document_requested', 'Certificate of Incorporation requested from vendor', '{"document": "Certificate of Incorporation"}', now() - interval '6 days'),
('11111111-1111-1111-1111-111111111111', 'Collector', 'document_received', 'Certificate of Incorporation submitted by vendor', '{"document": "Certificate of Incorporation", "file_size": "245KB"}', now() - interval '5 days'),
('11111111-1111-1111-1111-111111111111', 'Verifier', 'document_verified', 'Certificate of Incorporation validated successfully', '{"document": "Certificate of Incorporation", "verification_method": "OCR + Database lookup"}', now() - interval '5 days' + interval '30 minutes'),
('11111111-1111-1111-1111-111111111111', 'Collector', 'document_received', 'GST Registration submitted', '{"document": "GST Registration"}', now() - interval '4 days'),
('11111111-1111-1111-1111-111111111111', 'Verifier', 'document_verified', 'GST Registration validated via government portal', '{"document": "GST Registration", "gstin": "27AABCU9603R1ZM"}', now() - interval '4 days' + interval '15 minutes'),
('11111111-1111-1111-1111-111111111111', 'Risk Scorer', 'risk_assessed', 'Comprehensive risk evaluation completed', '{"score": "Low", "factors": ["clean_history", "strong_financials", "verified_docs"]}', now() - interval '3 days'),
('11111111-1111-1111-1111-111111111111', 'Monitor', 'health_check', 'Scheduled health monitoring completed', '{"status": "Green", "next_check": "7 days"}', now() - interval '2 hours');

-- ============================================================================
-- Vendor 2: TechFlow Systems (IT) - Escalated, High Risk
-- ============================================================================

INSERT INTO vendors (id, vendor_name, industry, contact_email, workflow_status, risk_score, risk_rationale, health_status, current_step, escalation_level, monitoring_notes, last_monitored, user_id)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'TechFlow Systems',
  'IT',
  'compliance@techflowsystems.in',
  'escalated',
  'High',
  'GST Registration shows data mismatch. Company name on GST certificate does not match incorporation documents. Potential fraud indicator detected.',
  'Red',
  5,
  2,
  'URGENT: Verification failure on GST documents. Human review required.',
  now() - interval '30 minutes',
  NULL
);

-- Checklist items for TechFlow Systems
INSERT INTO checklist_items (vendor_id, category, document_name, description, required, status, retry_count) VALUES
('22222222-2222-2222-2222-222222222222', 'Legal', 'Certificate of Incorporation', 'Company registration certificate', true, 'verified', 0),
('22222222-2222-2222-2222-222222222222', 'Tax', 'GST Registration', 'Goods and Services Tax registration', true, 'failed', 2),
('22222222-2222-2222-2222-222222222222', 'Compliance', 'ISO 27001', 'Information Security Management certification', true, 'pending', 0);

-- Fraud flag for TechFlow Systems
INSERT INTO fraud_flags (vendor_id, doc_name, flag_type, description, severity, detected_at) VALUES
('22222222-2222-2222-2222-222222222222', 'GST Registration Certificate', 'data_mismatch', 'Company name on GST certificate (TechFlow Solutions Pvt Ltd) does not match incorporation certificate (TechFlow Systems Pvt Ltd). GSTIN validation returned inconsistent entity details.', 'high', now() - interval '1 day');

-- Exception for TechFlow Systems
INSERT INTO exceptions (vendor_id, exception_type, description, agent, requires_human, resolution, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'verification_failure', 'GST Registration verification failed after 2 retry attempts. Data mismatch detected between submitted document and government database. Fraud flag raised.', 'Verifier', true, NULL, now() - interval '1 day');

-- Audit logs for TechFlow Systems
INSERT INTO audit_logs (vendor_id, agent, action, reason, details, created_at) VALUES
('22222222-2222-2222-2222-222222222222', 'Orchestrator', 'workflow_started', 'New vendor onboarding initiated', '{"vendor_name": "TechFlow Systems", "industry": "IT"}', now() - interval '5 days'),
('22222222-2222-2222-2222-222222222222', 'Orchestrator', 'checklist_generated', 'Industry-specific checklist created', '{"items_count": 3, "industry": "IT"}', now() - interval '5 days' + interval '3 minutes'),
('22222222-2222-2222-2222-222222222222', 'Collector', 'document_received', 'Certificate of Incorporation submitted', '{"document": "Certificate of Incorporation"}', now() - interval '4 days'),
('22222222-2222-2222-2222-222222222222', 'Verifier', 'document_verified', 'Certificate of Incorporation validated', '{"document": "Certificate of Incorporation"}', now() - interval '4 days' + interval '20 minutes'),
('22222222-2222-2222-2222-222222222222', 'Collector', 'document_received', 'GST Registration submitted', '{"document": "GST Registration"}', now() - interval '3 days'),
('22222222-2222-2222-2222-222222222222', 'Verifier', 'verification_failed', 'GST Registration verification failed - data mismatch', '{"document": "GST Registration", "error": "Company name mismatch", "retry": 1}', now() - interval '3 days' + interval '10 minutes'),
('22222222-2222-2222-2222-222222222222', 'Verifier', 'verification_retry', 'Retrying GST verification with enhanced validation', '{"document": "GST Registration", "retry": 2}', now() - interval '2 days'),
('22222222-2222-2222-2222-222222222222', 'Verifier', 'fraud_detected', 'Potential fraud flag raised after repeated verification failures', '{"document": "GST Registration", "flag_type": "data_mismatch", "severity": "high"}', now() - interval '1 day'),
('22222222-2222-2222-2222-222222222222', 'Orchestrator', 'workflow_escalated', 'Workflow escalated to human review due to fraud detection', '{"escalation_level": 2, "reason": "fraud_flag"}', now() - interval '1 day' + interval '5 minutes'),
('22222222-2222-2222-2222-222222222222', 'Monitor', 'health_degraded', 'Vendor health status changed to Red', '{"previous_status": "Amber", "new_status": "Red", "reason": "active_fraud_flag"}', now() - interval '30 minutes');

-- ============================================================================
-- Vendor 3: PharmaChem Gujarat (Pharma) - Complete, Medium Risk
-- ============================================================================

INSERT INTO vendors (id, vendor_name, industry, contact_email, workflow_status, risk_score, risk_rationale, health_status, current_step, escalation_level, monitoring_notes, last_monitored, user_id)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'PharmaChem Gujarat',
  'Pharma',
  'regulatory@pharmachemguj.com',
  'complete',
  'Medium',
  'All required documents verified. Company is relatively new (3 years) with limited financial history. Recommend enhanced monitoring during initial contract period.',
  'Amber',
  13,
  0,
  'Onboarding complete. Quarterly compliance reviews scheduled.',
  now() - interval '1 day',
  NULL
);

-- Checklist items for PharmaChem Gujarat (all verified)
INSERT INTO checklist_items (vendor_id, category, document_name, description, required, status) VALUES
('33333333-3333-3333-3333-333333333333', 'Legal', 'Certificate of Incorporation', 'Company registration certificate', true, 'verified'),
('33333333-3333-3333-3333-333333333333', 'Tax', 'GST Registration', 'Goods and Services Tax registration', true, 'verified'),
('33333333-3333-3333-3333-333333333333', 'Compliance', 'Drug License', 'State Drug Controller license', true, 'verified'),
('33333333-3333-3333-3333-333333333333', 'Compliance', 'GMP Certificate', 'Good Manufacturing Practice certification', true, 'verified');

-- Audit logs for PharmaChem Gujarat (complete pipeline flow)
INSERT INTO audit_logs (vendor_id, agent, action, reason, details, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 'Orchestrator', 'workflow_started', 'New vendor onboarding initiated', '{"vendor_name": "PharmaChem Gujarat", "industry": "Pharma"}', now() - interval '14 days'),
('33333333-3333-3333-3333-333333333333', 'Orchestrator', 'checklist_generated', 'Industry-specific checklist created', '{"items_count": 4, "industry": "Pharma"}', now() - interval '14 days' + interval '2 minutes'),
('33333333-3333-3333-3333-333333333333', 'Collector', 'batch_documents_received', 'All required documents submitted by vendor', '{"documents": ["Certificate of Incorporation", "GST Registration", "Drug License", "GMP Certificate"]}', now() - interval '12 days'),
('33333333-3333-3333-3333-333333333333', 'Verifier', 'document_verified', 'Certificate of Incorporation validated', '{"document": "Certificate of Incorporation"}', now() - interval '11 days'),
('33333333-3333-3333-3333-333333333333', 'Verifier', 'document_verified', 'GST Registration validated', '{"document": "GST Registration"}', now() - interval '11 days' + interval '30 minutes'),
('33333333-3333-3333-3333-333333333333', 'Verifier', 'document_verified', 'Drug License validated with State Drug Controller', '{"document": "Drug License", "license_no": "GJ/25D/20-C/1234"}', now() - interval '10 days'),
('33333333-3333-3333-3333-333333333333', 'Verifier', 'document_verified', 'GMP Certificate validated', '{"document": "GMP Certificate", "valid_until": "2026-12-31"}', now() - interval '10 days' + interval '1 hour'),
('33333333-3333-3333-3333-333333333333', 'Risk Scorer', 'risk_assessed', 'Comprehensive risk evaluation completed', '{"score": "Medium", "factors": ["new_company", "limited_history", "all_docs_verified"]}', now() - interval '9 days'),
('33333333-3333-3333-3333-333333333333', 'Orchestrator', 'approval_pending', 'All verifications complete, awaiting final approval', '{"verified_count": 4, "total_count": 4}', now() - interval '8 days'),
('33333333-3333-3333-3333-333333333333', 'Orchestrator', 'workflow_completed', 'Vendor onboarding successfully completed', '{"total_duration_days": 7, "documents_processed": 4}', now() - interval '7 days'),
('33333333-3333-3333-3333-333333333333', 'Monitor', 'health_check', 'Initial post-onboarding health assessment', '{"status": "Amber", "reason": "new_vendor_monitoring", "next_check": "30 days"}', now() - interval '1 day');
