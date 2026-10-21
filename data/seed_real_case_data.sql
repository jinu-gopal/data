-- ==============================================================================
-- MAX ERP — Real-Case Production Business Objects & Records Seed Script
-- ==============================================================================

BEGIN;

-- 1. CLEAN EXISTING TEST DATA IN REVERSE DEPENDENCY ORDER
DELETE FROM configuration_import_errors;
DELETE FROM configuration_import_rows;
DELETE FROM configuration_import_jobs;
DELETE FROM configuration_business_object_records;
DELETE FROM configuration_business_object_field_references;
DELETE FROM configuration_business_object_field_options;
DELETE FROM configuration_business_object_fields;
DELETE FROM configuration_business_objects;

-- 2. INSERT REAL-CASE BUSINESS OBJECTS
INSERT INTO configuration_business_objects (id, object_key, name, description, status, version_number, created_by, created_at, updated_at)
VALUES
('10000000-0000-0000-0000-000000000001', 'customer', 'Customer', 'Enterprise B2B customer accounts and client organizations', 'PUBLISHED', 1, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('20000000-0000-0000-0000-000000000001', 'vendor', 'Vendor', 'Approved enterprise suppliers, service providers, and vendors', 'PUBLISHED', 1, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('30000000-0000-0000-0000-000000000001', 'product', 'Product', 'Product catalog items, assemblies, raw materials, and service offerings', 'PUBLISHED', 1, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('40000000-0000-0000-0000-000000000001', 'sales_order', 'Sales Order', 'Customer sales orders and delivery commitments', 'PUBLISHED', 1, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW());

-- 3. INSERT FIELDS FOR CUSTOMER
INSERT INTO configuration_business_object_fields (id, business_object_id, field_key, label, description, field_type, required, unique_value, read_only, hidden, min_value, max_value, validation_pattern, display_order, created_at, updated_at)
VALUES
('10000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'customer_code', 'Customer Code', 'Unique identifier for customer', 'TEXT', true, true, false, false, null, null, '^CUST-[0-9]{4}$', 1, NOW(), NOW()),
('10000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'company_name', 'Company Name', 'Legal registered name of customer', 'TEXT', true, false, false, false, null, null, null, 2, NOW(), NOW()),
('10000000-0000-0000-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'customer_type', 'Customer Type', 'Market segmentation tier', 'CHOICE', true, false, false, false, null, null, null, 3, NOW(), NOW()),
('10000000-0000-0000-0001-000000000004', '10000000-0000-0000-0000-000000000001', 'industry', 'Industry', 'Primary business industry', 'CHOICE', true, false, false, false, null, null, null, 4, NOW(), NOW()),
('10000000-0000-0000-0001-000000000005', '10000000-0000-0000-0000-000000000001', 'email', 'Email Address', 'Primary billing and communication email', 'EMAIL', true, false, false, false, null, null, null, 5, NOW(), NOW()),
('10000000-0000-0000-0001-000000000006', '10000000-0000-0000-0000-000000000001', 'phone', 'Phone Number', 'Customer direct contact number', 'PHONE', false, false, false, false, null, null, null, 6, NOW(), NOW()),
('10000000-0000-0000-0001-000000000007', '10000000-0000-0000-0000-000000000001', 'tax_id', 'Tax ID / VAT', 'Tax identification number', 'TEXT', false, false, false, false, null, null, null, 7, NOW(), NOW()),
('10000000-0000-0000-0001-000000000008', '10000000-0000-0000-0000-000000000001', 'credit_limit', 'Credit Limit ($)', 'Maximum approved credit facility', 'NUMBER', false, false, false, false, 0, 5000000, null, 8, NOW(), NOW()),
('10000000-0000-0000-0001-000000000009', '10000000-0000-0000-0000-000000000001', 'payment_terms', 'Payment Terms', 'Agreed payment terms', 'CHOICE', true, false, false, false, null, null, null, 9, NOW(), NOW()),
('10000000-0000-0000-0001-000000000010', '10000000-0000-0000-0000-000000000001', 'billing_address', 'Billing Address', 'Street address for invoicing', 'TEXT', false, false, false, false, null, null, null, 10, NOW(), NOW()),
('10000000-0000-0000-0001-000000000011', '10000000-0000-0000-0000-000000000001', 'status', 'Account Status', 'Active status of account', 'CHOICE', true, false, false, false, null, null, null, 11, NOW(), NOW()),
('10000000-0000-0000-0001-000000000012', '10000000-0000-0000-0000-000000000001', 'account_manager', 'Account Manager', 'Assigned enterprise account executive', 'USER', false, false, false, false, null, null, null, 12, NOW(), NOW());

-- 4. INSERT CHOICE OPTIONS FOR CUSTOMER
-- customer_type
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('10000000-0000-0000-0002-000000000001', '10000000-0000-0000-0001-000000000003', 'ENTERPRISE', 'Enterprise', 1, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000002', '10000000-0000-0000-0001-000000000003', 'MID_MARKET', 'Mid-Market', 2, true, true, NOW(), NOW()),
('10000000-0000-0000-0002-000000000003', '10000000-0000-0000-0001-000000000003', 'SMB', 'Small & Medium Business', 3, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000004', '10000000-0000-0000-0001-000000000003', 'GOVERNMENT', 'Government & Public Sector', 4, true, false, NOW(), NOW());

-- industry
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('10000000-0000-0000-0002-000000000005', '10000000-0000-0000-0001-000000000004', 'MANUFACTURING', 'Manufacturing & Industrial', 1, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000006', '10000000-0000-0000-0001-000000000004', 'TECHNOLOGY', 'Technology & SaaS', 2, true, true, NOW(), NOW()),
('10000000-0000-0000-0002-000000000007', '10000000-0000-0000-0001-000000000004', 'HEALTHCARE', 'Healthcare & Life Sciences', 3, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000008', '10000000-0000-0000-0001-000000000004', 'FINANCIAL_SERVICES', 'Financial Services', 4, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000009', '10000000-0000-0000-0001-000000000004', 'RETAIL', 'Retail & Consumer Goods', 5, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000010', '10000000-0000-0000-0001-000000000004', 'LOGISTICS', 'Transportation & Logistics', 6, true, false, NOW(), NOW());

-- payment_terms
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('10000000-0000-0000-0002-000000000011', '10000000-0000-0000-0001-000000000009', 'NET_15', 'Net 15 Days', 1, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000012', '10000000-0000-0000-0001-000000000009', 'NET_30', 'Net 30 Days', 2, true, true, NOW(), NOW()),
('10000000-0000-0000-0002-000000000013', '10000000-0000-0000-0001-000000000009', 'NET_45', 'Net 45 Days', 3, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000014', '10000000-0000-0000-0001-000000000009', 'NET_60', 'Net 60 Days', 4, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000015', '10000000-0000-0000-0001-000000000009', 'IMMEDIATE', 'Due Upon Receipt', 5, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000016', '10000000-0000-0000-0001-000000000009', 'PREPAID', 'Prepaid / In Advance', 6, true, false, NOW(), NOW());

-- status
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('10000000-0000-0000-0002-000000000017', '10000000-0000-0000-0001-000000000011', 'ACTIVE', 'Active', 1, true, true, NOW(), NOW()),
('10000000-0000-0000-0002-000000000018', '10000000-0000-0000-0001-000000000011', 'PROSPECT', 'Prospect', 2, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000019', '10000000-0000-0000-0001-000000000011', 'INACTIVE', 'Inactive', 3, true, false, NOW(), NOW()),
('10000000-0000-0000-0002-000000000020', '10000000-0000-0000-0001-000000000011', 'SUSPENDED', 'Credit Suspended', 4, true, false, NOW(), NOW());

-- 5. INSERT FIELDS FOR VENDOR
INSERT INTO configuration_business_object_fields (id, business_object_id, field_key, label, description, field_type, required, unique_value, read_only, hidden, min_value, max_value, validation_pattern, display_order, created_at, updated_at)
VALUES
('20000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001', 'vendor_code', 'Vendor Code', 'Unique vendor identifier', 'TEXT', true, true, false, false, null, null, '^VEND-[0-9]{4}$', 1, NOW(), NOW()),
('20000000-0000-0000-0001-000000000002', '20000000-0000-0000-0000-000000000001', 'vendor_name', 'Vendor Name', 'Official company name of vendor', 'TEXT', true, false, false, false, null, null, null, 2, NOW(), NOW()),
('20000000-0000-0000-0001-000000000003', '20000000-0000-0000-0000-000000000001', 'vendor_category', 'Category', 'Supply category classification', 'CHOICE', true, false, false, false, null, null, null, 3, NOW(), NOW()),
('20000000-0000-0000-0001-000000000004', '20000000-0000-0000-0000-000000000001', 'tax_id', 'Tax Identification', 'Federal tax ID or VAT', 'TEXT', false, false, false, false, null, null, null, 4, NOW(), NOW()),
('20000000-0000-0000-0001-000000000005', '20000000-0000-0000-0000-000000000001', 'email', 'Orders Email', 'Purchase order dispatch email', 'EMAIL', true, false, false, false, null, null, null, 5, NOW(), NOW()),
('20000000-0000-0000-0001-000000000006', '20000000-0000-0000-0000-000000000001', 'phone', 'Phone', 'Primary contact phone', 'PHONE', false, false, false, false, null, null, null, 6, NOW(), NOW()),
('20000000-0000-0000-0001-000000000007', '20000000-0000-0000-0000-000000000001', 'payment_terms', 'Payment Terms', 'Vendor terms for payables', 'CHOICE', true, false, false, false, null, null, null, 7, NOW(), NOW()),
('20000000-0000-0000-0001-000000000008', '20000000-0000-0000-0000-000000000001', 'currency', 'Billing Currency', 'Settlement currency', 'CHOICE', true, false, false, false, null, null, null, 8, NOW(), NOW()),
('20000000-0000-0000-0001-000000000009', '20000000-0000-0000-0000-000000000001', 'status', 'Vendor Status', 'Procurement authorization status', 'CHOICE', true, false, false, false, null, null, null, 9, NOW(), NOW()),
('20000000-0000-0000-0001-000000000010', '20000000-0000-0000-0000-000000000001', 'lead_time_days', 'Lead Time (Days)', 'Standard order fulfillment lead time', 'NUMBER', false, false, false, false, 1, 180, null, 10, NOW(), NOW());

-- 6. INSERT CHOICE OPTIONS FOR VENDOR
-- vendor_category
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('20000000-0000-0000-0002-000000000001', '20000000-0000-0000-0001-000000000003', 'RAW_MATERIALS', 'Raw Materials', 1, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000002', '20000000-0000-0000-0001-000000000003', 'LOGISTICS', 'Logistics & Freight', 2, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000003', '20000000-0000-0000-0001-000000000003', 'HARDWARE', 'Electronics & Hardware', 3, true, true, NOW(), NOW()),
('20000000-0000-0000-0002-000000000004', '20000000-0000-0000-0001-000000000003', 'SOFTWARE_SERVICES', 'Software & Cloud Services', 4, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000005', '20000000-0000-0000-0001-000000000003', 'CONSULTING', 'Professional Consulting', 5, true, false, NOW(), NOW());

-- payment_terms
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('20000000-0000-0000-0002-000000000006', '20000000-0000-0000-0001-000000000007', 'NET_30', 'Net 30 Days', 1, true, true, NOW(), NOW()),
('20000000-0000-0000-0002-000000000007', '20000000-0000-0000-0001-000000000007', 'NET_45', 'Net 45 Days', 2, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000008', '20000000-0000-0000-0001-000000000007', 'NET_60', 'Net 60 Days', 3, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000009', '20000000-0000-0000-0001-000000000007', 'IMMEDIATE', 'Immediate Payment', 4, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000010', '20000000-0000-0000-0001-000000000007', 'ADVANCE_50', '50% Advance / 50% Delivery', 5, true, false, NOW(), NOW());

-- currency
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('20000000-0000-0000-0002-000000000011', '20000000-0000-0000-0001-000000000008', 'USD', 'US Dollar ($)', 1, true, true, NOW(), NOW()),
('20000000-0000-0000-0002-000000000012', '20000000-0000-0000-0001-000000000008', 'EUR', 'Euro (€)', 2, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000013', '20000000-0000-0000-0001-000000000008', 'GBP', 'British Pound (£)', 3, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000014', '20000000-0000-0000-0001-000000000008', 'INR', 'Indian Rupee (₹)', 4, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000015', '20000000-0000-0000-0001-000000000008', 'CAD', 'Canadian Dollar (C$)', 5, true, false, NOW(), NOW());

-- status
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('20000000-0000-0000-0002-000000000016', '20000000-0000-0000-0001-000000000009', 'ACTIVE', 'Active Supplier', 1, true, true, NOW(), NOW()),
('20000000-0000-0000-0002-000000000017', '20000000-0000-0000-0001-000000000009', 'PENDING_REVIEW', 'Pending Review', 2, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000018', '20000000-0000-0000-0001-000000000009', 'SUSPENDED', 'Suspended', 3, true, false, NOW(), NOW()),
('20000000-0000-0000-0002-000000000019', '20000000-0000-0000-0001-000000000009', 'INACTIVE', 'Inactive', 4, true, false, NOW(), NOW());

-- 7. INSERT FIELDS FOR PRODUCT
INSERT INTO configuration_business_object_fields (id, business_object_id, field_key, label, description, field_type, required, unique_value, read_only, hidden, min_value, max_value, validation_pattern, display_order, created_at, updated_at)
VALUES
('30000000-0000-0000-0001-000000000001', '30000000-0000-0000-0000-000000000001', 'sku', 'SKU Code', 'Unique inventory stock keeping unit', 'TEXT', true, true, false, false, null, null, '^SKU-[0-9]{4}$', 1, NOW(), NOW()),
('30000000-0000-0000-0001-000000000002', '30000000-0000-0000-0000-000000000001', 'product_name', 'Product Name', 'Descriptive commercial product title', 'TEXT', true, false, false, false, null, null, null, 2, NOW(), NOW()),
('30000000-0000-0000-0001-000000000003', '30000000-0000-0000-0000-000000000001', 'product_type', 'Product Type', 'Item classification', 'CHOICE', true, false, false, false, null, null, null, 3, NOW(), NOW()),
('30000000-0000-0000-0001-000000000004', '30000000-0000-0000-0000-000000000001', 'category', 'Category', 'Product domain category', 'CHOICE', true, false, false, false, null, null, null, 4, NOW(), NOW()),
('30000000-0000-0000-0001-000000000005', '30000000-0000-0000-0000-000000000001', 'unit_of_measure', 'Unit of Measure', 'Inventory base unit', 'CHOICE', true, false, false, false, null, null, null, 5, NOW(), NOW()),
('30000000-0000-0000-0001-000000000006', '30000000-0000-0000-0000-000000000001', 'unit_price', 'List Unit Price ($)', 'Standard sale price', 'NUMBER', true, false, false, false, 0, null, null, 6, NOW(), NOW()),
('30000000-0000-0000-0001-000000000007', '30000000-0000-0000-0000-000000000001', 'cost_price', 'Standard Cost ($)', 'Base procurement cost', 'NUMBER', false, false, false, false, 0, null, null, 7, NOW(), NOW()),
('30000000-0000-0000-0001-000000000008', '30000000-0000-0000-0000-000000000001', 'preferred_vendor', 'Preferred Vendor', 'Primary supplier for this item', 'REFERENCE', false, false, false, false, null, null, null, 8, NOW(), NOW()),
('30000000-0000-0000-0001-000000000009', '30000000-0000-0000-0000-000000000001', 'status', 'Lifecycle Status', 'Commercial catalog lifecycle', 'CHOICE', true, false, false, false, null, null, null, 9, NOW(), NOW());

-- 8. REFERENCE CONFIGURATION FOR PRODUCT -> VENDOR
INSERT INTO configuration_business_object_field_references (id, field_id, target_business_object_id, display_field_id, allow_multiple, allow_create, created_at, updated_at)
VALUES
('30000000-0000-0000-0005-000000000001', '30000000-0000-0000-0001-000000000008', '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0001-000000000002', false, false, NOW(), NOW());

-- 9. CHOICE OPTIONS FOR PRODUCT
-- product_type
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('30000000-0000-0000-0002-000000000001', '30000000-0000-0000-0001-000000000003', 'FINISHED_GOOD', 'Finished Good', 1, true, true, NOW(), NOW()),
('30000000-0000-0000-0002-000000000002', '30000000-0000-0000-0001-000000000003', 'RAW_MATERIAL', 'Raw Material', 2, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000003', '30000000-0000-0000-0001-000000000003', 'CONSUMABLE', 'Consumable Supply', 3, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000004', '30000000-0000-0000-0001-000000000003', 'SERVICE', 'Service / Labor', 4, true, false, NOW(), NOW());

-- category
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('30000000-0000-0000-0002-000000000005', '30000000-0000-0000-0001-000000000004', 'ELECTRONICS', 'Electronics & Controls', 1, true, true, NOW(), NOW()),
('30000000-0000-0000-0002-000000000006', '30000000-0000-0000-0001-000000000004', 'MECHANICAL', 'Mechanical & Hardware', 2, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000007', '30000000-0000-0000-0001-000000000004', 'CHEMICAL', 'Chemicals & Adhesives', 3, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000008', '30000000-0000-0000-0001-000000000004', 'SOFTWARE', 'Software & Licenses', 4, true, false, NOW(), NOW());

-- unit_of_measure
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('30000000-0000-0000-0002-000000000009', '30000000-0000-0000-0001-000000000005', 'EACH', 'Each (Unit)', 1, true, true, NOW(), NOW()),
('30000000-0000-0000-0002-000000000010', '30000000-0000-0000-0001-000000000005', 'KG', 'Kilogram (kg)', 2, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000011', '30000000-0000-0000-0001-000000000005', 'METER', 'Meter (m)', 3, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000012', '30000000-0000-0000-0001-000000000005', 'BOX', 'Box / Pack', 4, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000013', '30000000-0000-0000-0001-000000000005', 'HOUR', 'Hours (hr)', 5, true, false, NOW(), NOW());

-- status
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('30000000-0000-0000-0002-000000000014', '30000000-0000-0000-0001-000000000009', 'ACTIVE', 'Active in Catalog', 1, true, true, NOW(), NOW()),
('30000000-0000-0000-0002-000000000015', '30000000-0000-0000-0001-000000000009', 'DISCONTINUED', 'Discontinued', 2, true, false, NOW(), NOW()),
('30000000-0000-0000-0002-000000000016', '30000000-0000-0000-0001-000000000009', 'DEVELOPMENT', 'Under Development', 3, true, false, NOW(), NOW());

-- 10. INSERT FIELDS FOR SALES ORDER
INSERT INTO configuration_business_object_fields (id, business_object_id, field_key, label, description, field_type, required, unique_value, read_only, hidden, min_value, max_value, validation_pattern, display_order, created_at, updated_at)
VALUES
('40000000-0000-0000-0001-000000000001', '40000000-0000-0000-0000-000000000001', 'order_number', 'Sales Order #', 'Unique commercial order number', 'TEXT', true, true, false, false, null, null, '^SO-[0-9]{4}$', 1, NOW(), NOW()),
('40000000-0000-0000-0001-000000000002', '40000000-0000-0000-0000-000000000001', 'customer', 'Customer', 'Ordering customer account', 'REFERENCE', true, false, false, false, null, null, null, 2, NOW(), NOW()),
('40000000-0000-0000-0001-000000000003', '40000000-0000-0000-0000-000000000001', 'order_date', 'Order Date', 'Date order was booked', 'DATE', true, false, false, false, null, null, null, 3, NOW(), NOW()),
('40000000-0000-0000-0001-000000000004', '40000000-0000-0000-0000-000000000001', 'order_status', 'Order Status', 'Fulfillment workflow progress', 'CHOICE', true, false, false, false, null, null, null, 4, NOW(), NOW()),
('40000000-0000-0000-0001-000000000005', '40000000-0000-0000-0000-000000000001', 'payment_status', 'Payment Status', 'Invoice settlement status', 'CHOICE', true, false, false, false, null, null, null, 5, NOW(), NOW()),
('40000000-0000-0000-0001-000000000006', '40000000-0000-0000-0000-000000000001', 'total_amount', 'Total Order Amount ($)', 'Gross total order value', 'NUMBER', true, false, false, false, 0, null, null, 6, NOW(), NOW()),
('40000000-0000-0000-0001-000000000007', '40000000-0000-0000-0000-000000000001', 'shipping_address', 'Shipping Destination', 'Delivery site address', 'TEXT', false, false, false, false, null, null, null, 7, NOW(), NOW()),
('40000000-0000-0000-0001-000000000008', '40000000-0000-0000-0000-000000000001', 'sales_rep', 'Sales Representative', 'Internal owner of order', 'USER', false, false, false, false, null, null, null, 8, NOW(), NOW());

-- 11. REFERENCE CONFIGURATION FOR SALES ORDER -> CUSTOMER
INSERT INTO configuration_business_object_field_references (id, field_id, target_business_object_id, display_field_id, allow_multiple, allow_create, created_at, updated_at)
VALUES
('40000000-0000-0000-0005-000000000001', '40000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0001-000000000002', false, false, NOW(), NOW());

-- 12. CHOICE OPTIONS FOR SALES ORDER
-- order_status
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('40000000-0000-0000-0002-000000000001', '40000000-0000-0000-0001-000000000004', 'DRAFT', 'Draft Quotation', 1, true, false, NOW(), NOW()),
('40000000-0000-0000-0002-000000000002', '40000000-0000-0000-0001-000000000004', 'CONFIRMED', 'Confirmed Order', 2, true, true, NOW(), NOW()),
('40000000-0000-0000-0002-000000000003', '40000000-0000-0000-0001-000000000004', 'PROCESSING', 'In Fulfillment', 3, true, false, NOW(), NOW()),
('40000000-0000-0000-0002-000000000004', '40000000-0000-0000-0001-000000000004', 'SHIPPED', 'Dispatched / In Transit', 4, true, false, NOW(), NOW()),
('40000000-0000-0000-0002-000000000005', '40000000-0000-0000-0001-000000000004', 'DELIVERED', 'Delivered & Closed', 5, true, false, NOW(), NOW()),
('40000000-0000-0000-0002-000000000006', '40000000-0000-0000-0001-000000000004', 'CANCELLED', 'Cancelled', 6, true, false, NOW(), NOW());

-- payment_status
INSERT INTO configuration_business_object_field_options (id, field_id, option_value, option_label, display_order, active, is_default, created_at, updated_at) VALUES
('40000000-0000-0000-0002-000000000007', '40000000-0000-0000-0001-000000000005', 'PENDING', 'Payment Pending', 1, true, true, NOW(), NOW()),
('40000000-0000-0000-0002-000000000008', '40000000-0000-0000-0001-000000000005', 'PARTIAL', 'Partially Paid', 2, true, false, NOW(), NOW()),
('40000000-0000-0000-0002-000000000009', '40000000-0000-0000-0001-000000000005', 'PAID', 'Fully Paid', 3, true, false, NOW(), NOW()),
('40000000-0000-0000-0002-000000000010', '40000000-0000-0000-0001-000000000005', 'REFUNDED', 'Refunded', 4, true, false, NOW(), NOW());

-- 13. INSERT REAL INITIAL RECORDS
-- Customers
INSERT INTO configuration_business_object_records (id, business_object_id, record_data, created_by, created_at, updated_at) VALUES
('10000000-0000-0000-0003-000000000001', '10000000-0000-0000-0000-000000000001', '{"customer_code": "CUST-1001", "company_name": "Apex Industrial Robotics", "customer_type": "ENTERPRISE", "industry": "MANUFACTURING", "email": "procurement@apexrobotics.com", "phone": "+1-415-555-0101", "tax_id": "US-94-2819201", "credit_limit": 500000, "payment_terms": "NET_30", "billing_address": "1000 Automation Pkwy, San Jose, CA 95134", "status": "ACTIVE", "account_manager": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('10000000-0000-0000-0003-000000000002', '10000000-0000-0000-0000-000000000001', '{"customer_code": "CUST-1002", "company_name": "BioVance Health Solutions", "customer_type": "ENTERPRISE", "industry": "HEALTHCARE", "email": "finance@biovancehealth.com", "phone": "+1-617-555-0142", "tax_id": "US-04-3928102", "credit_limit": 750000, "payment_terms": "NET_45", "billing_address": "450 Innovation Way, Cambridge, MA 02142", "status": "ACTIVE", "account_manager": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('10000000-0000-0000-0003-000000000003', '10000000-0000-0000-0000-000000000001', '{"customer_code": "CUST-1003", "company_name": "Starlight Software Systems", "customer_type": "MID_MARKET", "industry": "TECHNOLOGY", "email": "billing@starlightsoft.io", "phone": "+1-206-555-0188", "tax_id": "US-91-8472910", "credit_limit": 250000, "payment_terms": "NET_15", "billing_address": "800 Cloud Vista Blvd, Seattle, WA 98101", "status": "ACTIVE", "account_manager": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('10000000-0000-0000-0003-000000000004', '10000000-0000-0000-0000-000000000001', '{"customer_code": "CUST-1004", "company_name": "Zenith Retail Group", "customer_type": "ENTERPRISE", "industry": "RETAIL", "email": "ap@zenithretail.com", "phone": "+1-312-555-0177", "tax_id": "US-36-7291823", "credit_limit": 1000000, "payment_terms": "NET_60", "billing_address": "200 Michigan Ave, Chicago, IL 60601", "status": "ACTIVE", "account_manager": null}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('10000000-0000-0000-0003-000000000005', '10000000-0000-0000-0000-000000000001', '{"customer_code": "CUST-1005", "company_name": "Atlas Financial Advisory", "customer_type": "MID_MARKET", "industry": "FINANCIAL_SERVICES", "email": "invoices@atlasfin.com", "phone": "+1-212-555-0155", "tax_id": "US-13-8291039", "credit_limit": 400000, "payment_terms": "NET_30", "billing_address": "140 Wall St, New York, NY 10005", "status": "ACTIVE", "account_manager": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW());

-- Vendors
INSERT INTO configuration_business_object_records (id, business_object_id, record_data, created_by, created_at, updated_at) VALUES
('20000000-0000-0000-0003-000000000001', '20000000-0000-0000-0000-000000000001', '{"vendor_code": "VEND-2001", "vendor_name": "Silicon Wave Semi-Conductors", "vendor_category": "HARDWARE", "tax_id": "US-77-2918203", "email": "orders@siliconwave.com", "phone": "+1-408-555-0211", "payment_terms": "NET_30", "currency": "USD", "status": "ACTIVE", "lead_time_days": 14}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('20000000-0000-0000-0003-000000000002', '20000000-0000-0000-0000-000000000001', '{"vendor_code": "VEND-2002", "vendor_name": "Global Freight Express", "vendor_category": "LOGISTICS", "tax_id": "US-47-8192039", "email": "dispatch@globalfreight.com", "phone": "+1-773-555-0244", "payment_terms": "NET_30", "currency": "USD", "status": "ACTIVE", "lead_time_days": 5}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('20000000-0000-0000-0003-000000000003', '20000000-0000-0000-0000-000000000001', '{"vendor_code": "VEND-2003", "vendor_name": "Polymer & Alloy Industrial", "vendor_category": "RAW_MATERIALS", "tax_id": "US-31-9281048", "email": "sales@polymeralloy.com", "phone": "+1-216-555-0233", "payment_terms": "NET_45", "currency": "USD", "status": "ACTIVE", "lead_time_days": 21}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('20000000-0000-0000-0003-000000000004', '20000000-0000-0000-0000-000000000001', '{"vendor_code": "VEND-2004", "vendor_name": "Nordic Precision Sensors", "vendor_category": "HARDWARE", "tax_id": "DE-81-2910394", "email": "b2b@nordicsensors.de", "phone": "+49-89-555-0277", "payment_terms": "NET_30", "currency": "EUR", "status": "ACTIVE", "lead_time_days": 10}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW());

-- Products (referencing Vendors)
INSERT INTO configuration_business_object_records (id, business_object_id, record_data, created_by, created_at, updated_at) VALUES
('30000000-0000-0000-0003-000000000001', '30000000-0000-0000-0000-000000000001', '{"sku": "SKU-3001", "product_name": "Industrial Edge Controller v4", "product_type": "FINISHED_GOOD", "category": "ELECTRONICS", "unit_of_measure": "EACH", "unit_price": 1250, "cost_price": 780, "preferred_vendor": "20000000-0000-0000-0003-000000000001", "status": "ACTIVE"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('30000000-0000-0000-0003-000000000002', '30000000-0000-0000-0000-000000000001', '{"sku": "SKU-3002", "product_name": "Optical Sensor Transceiver 10G", "product_type": "FINISHED_GOOD", "category": "ELECTRONICS", "unit_of_measure": "EACH", "unit_price": 450, "cost_price": 260, "preferred_vendor": "20000000-0000-0000-0003-000000000004", "status": "ACTIVE"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('30000000-0000-0000-0003-000000000003', '30000000-0000-0000-0000-000000000001', '{"sku": "SKU-3003", "product_name": "Thermal Conductive Polymer 5L", "product_type": "RAW_MATERIAL", "category": "CHEMICAL", "unit_of_measure": "BOX", "unit_price": 320, "cost_price": 195, "preferred_vendor": "20000000-0000-0000-0003-000000000003", "status": "ACTIVE"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW());

-- Sales Orders (referencing Customers)
INSERT INTO configuration_business_object_records (id, business_object_id, record_data, created_by, created_at, updated_at) VALUES
('40000000-0000-0000-0003-000000000001', '40000000-0000-0000-0000-000000000001', '{"order_number": "SO-4001", "customer": "10000000-0000-0000-0003-000000000001", "order_date": "2026-03-01", "order_status": "CONFIRMED", "payment_status": "PAID", "total_amount": 18750, "shipping_address": "1000 Automation Pkwy, San Jose, CA 95134", "sales_rep": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('40000000-0000-0000-0003-000000000002', '40000000-0000-0000-0000-000000000001', '{"order_number": "SO-4002", "customer": "10000000-0000-0000-0003-000000000002", "order_date": "2026-03-03", "order_status": "PROCESSING", "payment_status": "PARTIAL", "total_amount": 42500, "shipping_address": "450 Innovation Way, Cambridge, MA 02142", "sales_rep": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW()),
('40000000-0000-0000-0003-000000000003', '40000000-0000-0000-0000-000000000001', '{"order_number": "SO-4003", "customer": "10000000-0000-0000-0003-000000000003", "order_date": "2026-03-05", "order_status": "DELIVERED", "payment_status": "PAID", "total_amount": 9600, "shipping_address": "800 Cloud Vista Blvd, Seattle, WA 98101", "sales_rep": "0c5cc1d1-1d02-4d9d-af14-c9f0c3286959"}'::jsonb, '0c5cc1d1-1d02-4d9d-af14-c9f0c3286959', NOW(), NOW());

COMMIT;
