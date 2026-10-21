-- Seed Workflows and Approvals Engine sample data
-- Tenant: cf1757d5-c535-4335-939c-24908aee0209 (MAX Security Test Tenant)
-- User: 0c5cc1d1-1d02-4d9d-af14-c9f0c3286959 (admin)

-- Workflow 1: Customer Credit Approval
INSERT INTO configuration_workflows (
    id, tenant_id, business_object_id, workflow_key, name, description, trigger_type, status, created_at, updated_at
) VALUES (
    'a1000000-0000-0000-0000-000000000001',
    'cf1757d5-c535-4335-939c-24908aee0209',
    '10000000-0000-0000-0000-000000000001',
    'customer_credit_approval',
    'High-Value Enterprise Credit Approval',
    'Tiered risk evaluation and executive sign-off for enterprise customer accounts exceeding threshold limits.',
    'MANUAL_SUBMISSION',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (tenant_id, workflow_key) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Steps for Workflow 1
INSERT INTO configuration_workflow_steps (
    id, workflow_id, step_order, name, step_type, approver_role_id, condition_expression, status_on_approval, status_on_rejection, timeout_hours, created_at, updated_at
) VALUES 
(
    'a1000000-0000-0000-0001-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    1,
    'Risk & Compliance Review',
    'APPROVAL',
    '069cec02-58a1-4870-b0d5-311fac31d514', -- Compliance & Security Auditor
    'credit_limit >= 250000',
    'STAGE_1_PASSED',
    'REJECTED_CREDIT',
    48,
    NOW(),
    NOW()
),
(
    'a1000000-0000-0000-0001-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    2,
    'Executive Financial Sign-Off',
    'APPROVAL',
    '89b34568-f484-48ed-958e-177a3ca688ae', -- Security Test Manager
    'credit_limit >= 500000',
    'APPROVED',
    'REJECTED_FINAL',
    24,
    NOW(),
    NOW()
) ON CONFLICT (workflow_id, step_order) DO UPDATE
SET name = EXCLUDED.name, approver_role_id = EXCLUDED.approver_role_id, condition_expression = EXCLUDED.condition_expression;

-- Workflow 2: Sales Order Approval
INSERT INTO configuration_workflows (
    id, tenant_id, business_object_id, workflow_key, name, description, trigger_type, status, created_at, updated_at
) VALUES (
    'a2000000-0000-0000-0000-000000000001',
    'cf1757d5-c535-4335-939c-24908aee0209',
    '40000000-0000-0000-0000-000000000001',
    'sales_order_approval',
    'Commercial Sales Order Gating',
    'Multi-step operational verification and CISO security clearance for high-value client contracts.',
    'MANUAL_SUBMISSION',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (tenant_id, workflow_key) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Steps for Workflow 2
INSERT INTO configuration_workflow_steps (
    id, workflow_id, step_order, name, step_type, approver_role_id, condition_expression, status_on_approval, status_on_rejection, timeout_hours, created_at, updated_at
) VALUES 
(
    'a2000000-0000-0000-0001-000000000001',
    'a2000000-0000-0000-0000-000000000001',
    1,
    'Commercial Operations Validation',
    'APPROVAL',
    'd25f3a39-6dc8-4afc-8c5e-e0c984eb4b0d', -- Tenant Access Coordinator
    'total_amount > 10000',
    'OPERATIONS_CLEARED',
    'REJECTED_COMMERCIAL',
    24,
    NOW(),
    NOW()
),
(
    'a2000000-0000-0000-0001-000000000002',
    'a2000000-0000-0000-0000-000000000001',
    2,
    'Security Officer Authorization',
    'APPROVAL',
    '5e842b98-5237-45ea-8a65-702d327ec931', -- Chief Information Security Officer
    'total_amount > 40000',
    'APPROVED',
    'REJECTED_SECURITY',
    12,
    NOW(),
    NOW()
) ON CONFLICT (workflow_id, step_order) DO UPDATE
SET name = EXCLUDED.name, approver_role_id = EXCLUDED.approver_role_id, condition_expression = EXCLUDED.condition_expression;

-- Seed Sample Active Workflow Instance 1 (Customer: Apex Industrial Robotics, pending Step 1)
INSERT INTO configuration_workflow_instances (
    id, tenant_id, workflow_id, business_object_id, record_id, current_step_id, current_step_order, status, initiated_by, initiated_at, context_data
) VALUES (
    'b1000000-0000-0000-0000-000000000001',
    'cf1757d5-c535-4335-939c-24908aee0209',
    'a1000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0003-000000000001',
    'a1000000-0000-0000-0001-000000000001',
    1,
    'PENDING',
    '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959',
    NOW() - INTERVAL '3 hours',
    '{"customer_code": "CUST-1001", "company_name": "Apex Industrial Robotics", "credit_limit": 500000, "industry": "MANUFACTURING", "payment_terms": "NET_30"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Sample Active Workflow Instance 2 (Sales Order: SO-4002, Step 1 passed, pending Step 2)
INSERT INTO configuration_workflow_instances (
    id, tenant_id, workflow_id, business_object_id, record_id, current_step_id, current_step_order, status, initiated_by, initiated_at, context_data
) VALUES (
    'b2000000-0000-0000-0000-000000000001',
    'cf1757d5-c535-4335-939c-24908aee0209',
    'a2000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0003-000000000002',
    'a2000000-0000-0000-0001-000000000002',
    2,
    'PENDING',
    '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959',
    NOW() - INTERVAL '6 hours',
    '{"order_number": "SO-4002", "total_amount": 42500, "customer_name": "BioVance Health Solutions", "priority": "HIGH"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Seed Step 1 Action for Instance 2
INSERT INTO configuration_workflow_actions (
    id, instance_id, step_id, actor_user_id, action, comments, action_timestamp
) VALUES (
    'c2000000-0000-0000-0000-000000000001',
    'b2000000-0000-0000-0000-000000000001',
    'a2000000-0000-0000-0001-000000000001',
    '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959',
    'APPROVED',
    'Commercial terms verified and inventory allocations confirmed. Escalating to CISO for final contract authorization.',
    NOW() - INTERVAL '4 hours'
) ON CONFLICT (id) DO NOTHING;
