// MAX ERP Identity, Security, RBAC & Integration Governance Store
// Resilient local store providing authoritative fallback data and mutations for local dev & testing.

export interface TenantInfo {
  id: string;
  tenantKey: string;
  name: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}

export interface OrgOption {
  id: string;
  name: string;
  organizationKey: string;
  organizationType: string;
  tenantId: string;
}

export interface UserItem {
  id: string;
  username: string;
  email: string;
  status: "ACTIVE" | "LOCKED" | "DISABLED";
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoleItem {
  id: string;
  roleKey: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  isSystem?: boolean;
  system?: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionItem {
  id: string;
  permissionKey: string;
  name: string;
  description: string | null;
  moduleKey: string;
  actionKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface RolePermissionItem {
  id: string;
  roleId: string;
  roleKey: string;
  permissionId: string;
  permissionKey: string;
  permissionName: string;
  moduleKey: string;
  actionKey: string;
  createdAt: string;
}

export interface UserRoleItem {
  id: string;
  userId: string;
  roleId: string;
  roleKey: string;
  roleName: string;
  tenantId: string;
  organizationId: string | null;
  status: string;
  createdAt: string;
}

export interface UserTenantAccessItem {
  id: string;
  userId: string;
  tenantId: string;
  tenantKey: string;
  tenantName: string;
  organizationId: string | null;
  status: string;
}

export interface SecurityDashboardMetrics {
  healthScore: number;
  activeSessionsCount: number;
  totalRolesCount: number;
  totalPermissionsCount: number;
  totalUsersCount: number;
  totalAuditEventsCount: number;
  approvedWorkflowsCount: number;
  rejectedWorkflowsCount: number;
  pendingWorkflowsCount: number;
  mfaEnabledPercent: number;
}

export interface AuditTrailEvent {
  id: string;
  category: "WORKFLOW" | "RBAC" | "AUTH" | "CONFIGURATION" | string;
  eventType: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  actorUsername: string;
  targetResource: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ActiveSession {
  id: string;
  principalName: string;
  registeredClientId: string;
  authorizationGrantType: string;
  issuedAt: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";
  secondsRemaining: number;
}

export interface RbacMatrixData {
  roles: RoleItem[];
  permissions: PermissionItem[];
  rolePermissionMap: Record<string, string[]>;
  users: Array<{
    id: string;
    username: string;
    email: string;
    assignedRoleIds: string[];
  }>;
}

export interface ApiClient {
  id: string;
  clientId: string;
  clientName: string;
  clientSecret: string;
  grantTypes: string[];
  scopes: string[];
  redirectUris?: string;
  issuedAt: string;
  status: string;
}

export interface WebhookSubscription {
  id: string;
  name: string;
  targetUrl: string;
  events: string[];
  secret: string;
  status: string;
  createdAt: string;
  lastDeliveryStatusCode?: number;
  lastDeliveryAt?: string;
}

export interface Connector {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "CONNECTED" | "CONFIGURED" | "AVAILABLE" | string;
  lastSyncAt?: string;
  config?: Record<string, unknown>;
}

export interface WebhookDeliveryLog {
  id: string;
  webhookId: string;
  webhookName: string;
  eventType: string;
  targetUrl: string;
  statusCode: number;
  latencyMs: number;
  deliveredAt: string;
  success: boolean;
  responseBody?: string;
}

export interface IntegrationSummary {
  totalClientsCount: number;
  totalWebhooksCount: number;
  activeConnectorsCount: number;
  successfulDeliveriesCount: number;
  failedDeliveriesCount: number;
  clients: ApiClient[];
  webhooks: WebhookSubscription[];
  connectors: Connector[];
  recentDeliveries: WebhookDeliveryLog[];
}

export interface PipelineMetrics {
  totalJobs: number;
  totalRowsProcessed: number;
  totalSuccessfulRows: number;
  totalFailedRows: number;
  successRatePercent: number;
  activePipelines: number;
}

export interface PipelineJob {
  jobId: string;
  fileName: string;
  businessObjectId: string;
  businessObjectName: string;
  status: "COMPLETED" | "FAILED" | "VALIDATING" | "EXECUTING" | string;
  totalRows: number;
  validRows: number;
  errorRows: number;
  importedRows: number;
  createdAt: string;
  completedAt?: string;
}

/* ============================================================================
 * Initial Seed Data
 * ========================================================================== */

const INITIAL_TENANTS: TenantInfo[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    tenantKey: "security-test",
    name: "MAX Security Test Tenant",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    tenantKey: "primary-tenant",
    name: "MAX Enterprise Global Primary",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    tenantKey: "emea-ops",
    name: "MAX EMEA Operations Ltd",
    status: "ACTIVE",
    createdAt: "2026-02-15T09:00:00Z",
  },
];

const INITIAL_ORGANIZATIONS: OrgOption[] = [
  {
    id: "org-sec-001",
    organizationKey: "security-test-hospital",
    name: "Security Test Hospital",
    organizationType: "HEALTHCARE",
    tenantId: "00000000-0000-0000-0000-000000000001",
  },
  {
    id: "org-sec-002",
    organizationKey: "max-hq",
    name: "MAX Global Headquarters (Austin, TX)",
    organizationType: "HEADQUARTERS",
    tenantId: "00000000-0000-0000-0000-000000000002",
  },
  {
    id: "org-sec-003",
    organizationKey: "engineering-div",
    name: "Global Technology & Engineering Division",
    organizationType: "DIVISION",
    tenantId: "00000000-0000-0000-0000-000000000002",
  },
  {
    id: "org-sec-004",
    organizationKey: "emea-hq-london",
    name: "MAX London Regional Office",
    organizationType: "REGIONAL_OFFICE",
    tenantId: "00000000-0000-0000-0000-000000000003",
  },
];

const INITIAL_USERS: UserItem[] = [
  {
    id: "u-1001",
    username: "admin",
    email: "admin@maxerp.local",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: true,
    createdAt: "2026-01-15T08:00:00Z",
    updatedAt: "2026-10-20T10:00:00Z",
  },
  {
    id: "u-1002",
    username: "elena.vance",
    email: "elena.vance@max-enterprise.com",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: true,
    createdAt: "2026-01-16T08:00:00Z",
    updatedAt: "2026-10-21T11:30:00Z",
  },
  {
    id: "u-1003",
    username: "marcus.chen",
    email: "marcus.chen@max-enterprise.com",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: true,
    createdAt: "2026-01-20T09:00:00Z",
    updatedAt: "2026-10-22T14:15:00Z",
  },
  {
    id: "u-1004",
    username: "priya.sharma",
    email: "priya.sharma@max-enterprise.com",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: true,
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-10-23T08:00:00Z",
  },
  {
    id: "u-1005",
    username: "david.kim",
    email: "david.kim@max-enterprise.com",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: false,
    createdAt: "2026-02-15T11:00:00Z",
    updatedAt: "2026-10-18T16:45:00Z",
  },
  {
    id: "u-1006",
    username: "sarah.jenkins",
    email: "sarah.jenkins@max-enterprise.com",
    status: "ACTIVE",
    emailVerified: true,
    mfaEnabled: true,
    createdAt: "2026-03-01T09:30:00Z",
    updatedAt: "2026-10-23T09:00:00Z",
  },
];

const INITIAL_ROLES: RoleItem[] = [
  {
    id: "role-sec-01",
    roleKey: "ROLE_SUPER_ADMIN",
    name: "Super Administrator",
    description: "Full, unrestricted platform configuration, user access, and security audit authority.",
    status: "ACTIVE",
    isSystem: true,
    system: true,
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "role-sec-02",
    roleKey: "ROLE_SECURITY_ADMIN",
    name: "Security & Governance Administrator",
    description: "Manages session revocation, active tokens, RBAC permission toggles, and compliance audit trail.",
    status: "ACTIVE",
    isSystem: true,
    system: true,
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-10-15T10:00:00Z",
  },
  {
    id: "role-sec-03",
    roleKey: "ROLE_RECRUITING_MANAGER",
    name: "Recruiting & Talent Acquisition Lead",
    description: "Authority to approve job requisitions, publish to career site, make offers, and conduct AI interviews.",
    status: "ACTIVE",
    isSystem: false,
    system: false,
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-10-20T12:00:00Z",
  },
  {
    id: "role-sec-04",
    roleKey: "ROLE_HR_SPECIALIST",
    name: "Workforce & Employee Central Specialist",
    description: "Oversees 360 People Profiles, Position Management headcount slots, and Time-Off approvals.",
    status: "ACTIVE",
    isSystem: false,
    system: false,
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdAt: "2026-01-10T00:00:00Z",
    updatedAt: "2026-10-21T09:00:00Z",
  },
  {
    id: "role-sec-05",
    roleKey: "ROLE_INTEGRATION_ADMIN",
    name: "Enterprise Integration Architect",
    description: "Configures OAuth API clients, creates webhook dispatchers, and manages ERP connectors.",
    status: "ACTIVE",
    isSystem: false,
    system: false,
    tenantId: "00000000-0000-0000-0000-000000000001",
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-10-22T15:00:00Z",
  },
];

const INITIAL_PERMISSIONS: PermissionItem[] = [
  { id: "p-01", permissionKey: "recruitment.read", name: "Read Requisitions & Candidates", description: "View job requisitions, applicant profiles, and talent pipelines.", moduleKey: "recruitment", actionKey: "read", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-02", permissionKey: "recruitment.write", name: "Create & Edit Requisitions", description: "Draft, edit, and update job requisitions.", moduleKey: "recruitment", actionKey: "write", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-03", permissionKey: "recruitment.publish", name: "Publish to Career Site & Boards", description: "Publish jobs externally to LinkedIn, Indeed, and Careers portal.", moduleKey: "recruitment", actionKey: "publish", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-04", permissionKey: "recruitment.offer.approve", name: "Approve Candidate Offers", description: "Final approval for compensation packages and employment contracts.", moduleKey: "recruitment", actionKey: "approve", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-05", permissionKey: "workforce.read", name: "View 360 People Profiles", description: "Browse employee directory, compensation bands, and org structure.", moduleKey: "workforce", actionKey: "read", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-06", permissionKey: "workforce.write", name: "Manage Positions & Employees", description: "Create positions, freeze budgets, and transfer employees.", moduleKey: "workforce", actionKey: "write", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-07", permissionKey: "workforce.leave.approve", name: "Approve Time-Off Requests", description: "Review and approve/reject statutory PTO and medical leaves.", moduleKey: "workforce", actionKey: "approve", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-08", permissionKey: "security.audit.read", name: "Inspect Security Audit Trail", description: "Read immutable security events, RBAC shifts, and login telemetry.", moduleKey: "security", actionKey: "read", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-09", permissionKey: "security.sessions.terminate", name: "Terminate Active Sessions", description: "Forcefully revoke OAuth tokens and kill active user sessions.", moduleKey: "security", actionKey: "terminate", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-10", permissionKey: "security.matrix.write", name: "Toggle RBAC Role Permissions", description: "Modify role-to-permission grants across all modules.", moduleKey: "security", actionKey: "write", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-11", permissionKey: "integrations.manage", name: "Manage API Clients & Webhooks", description: "Provision OAuth credentials, configure webhooks, and trigger test pings.", moduleKey: "integrations", actionKey: "write", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
  { id: "p-12", permissionKey: "configuration.bo.manage", name: "Design Custom Business Objects", description: "Extend metadata schema with 20 custom field types and rules.", moduleKey: "configuration", actionKey: "write", createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" },
];

const INITIAL_ROLE_PERMISSION_MAP: Record<string, string[]> = {
  "role-sec-01": ["p-01", "p-02", "p-03", "p-04", "p-05", "p-06", "p-07", "p-08", "p-09", "p-10", "p-11", "p-12"],
  "role-sec-02": ["p-08", "p-09", "p-10", "p-11"],
  "role-sec-03": ["p-01", "p-02", "p-03", "p-04"],
  "role-sec-04": ["p-05", "p-06", "p-07"],
  "role-sec-05": ["p-11", "p-12"],
};

const INITIAL_USER_ROLES: UserRoleItem[] = [
  { id: "ur-01", userId: "u-1001", roleId: "role-sec-01", roleKey: "ROLE_SUPER_ADMIN", roleName: "Super Administrator", tenantId: "00000000-0000-0000-0000-000000000001", organizationId: "org-sec-001", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z" },
  { id: "ur-02", userId: "u-1002", roleId: "role-sec-01", roleKey: "ROLE_SUPER_ADMIN", roleName: "Super Administrator", tenantId: "00000000-0000-0000-0000-000000000001", organizationId: "org-sec-002", status: "ACTIVE", createdAt: "2026-01-16T00:00:00Z" },
  { id: "ur-03", userId: "u-1003", roleId: "role-sec-02", roleKey: "ROLE_SECURITY_ADMIN", roleName: "Security Administrator", tenantId: "00000000-0000-0000-0000-000000000001", organizationId: "org-sec-003", status: "ACTIVE", createdAt: "2026-01-20T00:00:00Z" },
  { id: "ur-04", userId: "u-1004", roleId: "role-sec-03", roleKey: "ROLE_RECRUITING_MANAGER", roleName: "Recruiting Manager", tenantId: "00000000-0000-0000-0000-000000000001", organizationId: "org-sec-002", status: "ACTIVE", createdAt: "2026-02-01T00:00:00Z" },
  { id: "ur-05", userId: "u-1005", roleId: "role-sec-04", roleKey: "ROLE_HR_SPECIALIST", roleName: "HR Specialist", tenantId: "00000000-0000-0000-0000-000000000001", organizationId: "org-sec-003", status: "ACTIVE", createdAt: "2026-02-15T00:00:00Z" },
  { id: "ur-06", userId: "u-1006", roleId: "role-sec-03", roleKey: "ROLE_RECRUITING_MANAGER", roleName: "Recruiting Manager", tenantId: "00000000-0000-0000-0000-000000000001", organizationId: "org-sec-002", status: "ACTIVE", createdAt: "2026-03-01T00:00:00Z" },
];

const INITIAL_AUDIT_TRAIL: AuditTrailEvent[] = [
  {
    id: "aud-001",
    category: "AUTH",
    eventType: "USER_AUTHENTICATED_MFA",
    severity: "INFO",
    actorUsername: "elena.vance",
    targetResource: "OAuth2 /token",
    description: "Executive session initiated with FIDO2 MFA hardware key validation.",
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    metadata: { ipAddress: "192.168.1.10", client: "max-erp-web" },
  },
  {
    id: "aud-002",
    category: "RBAC",
    eventType: "ROLE_PERMISSION_GRANTED",
    severity: "INFO",
    actorUsername: "admin",
    targetResource: "ROLE_RECRUITING_MANAGER -> recruitment.publish",
    description: "Granted career-site external publication privilege to Recruiting Managers.",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    metadata: { grantedBy: "admin", role: "ROLE_RECRUITING_MANAGER" },
  },
  {
    id: "aud-003",
    category: "WORKFLOW",
    eventType: "REQUISITION_APPROVED",
    severity: "INFO",
    actorUsername: "marcus.chen",
    targetResource: "REQ-2026-0104",
    description: "Approved Requisition REQ-2026-0104: Senior Cloud Infrastructure Architect.",
    timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
    metadata: { headcount: 2, budgetUsd: 380000 },
  },
  {
    id: "aud-004",
    category: "AUTH",
    eventType: "TOKEN_REVOKED",
    severity: "WARNING",
    actorUsername: "admin",
    targetResource: "session-sess-dev-089",
    description: "Terminated stale active session for security compliance audit.",
    timestamp: new Date(Date.now() - 180 * 60000).toISOString(),
  },
  {
    id: "aud-005",
    category: "CONFIGURATION",
    eventType: "CUSTOM_FIELD_ADDED",
    severity: "INFO",
    actorUsername: "priya.sharma",
    targetResource: "BusinessObject: Candidate",
    description: "Added custom metadata field clearanceLevel with Choice enumeration.",
    timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
  },
];

const INITIAL_SESSIONS: ActiveSession[] = [
  {
    id: "sess-prod-001",
    principalName: "elena.vance",
    registeredClientId: "max-erp-web",
    authorizationGrantType: "authorization_code",
    issuedAt: new Date(Date.now() - 35 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 60000).toISOString(),
    status: "ACTIVE",
    secondsRemaining: 1500,
  },
  {
    id: "sess-prod-002",
    principalName: "priya.sharma",
    registeredClientId: "max-erp-web",
    authorizationGrantType: "authorization_code",
    issuedAt: new Date(Date.now() - 12 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 48 * 60000).toISOString(),
    status: "ACTIVE",
    secondsRemaining: 2880,
  },
  {
    id: "sess-prod-003",
    principalName: "marcus.chen",
    registeredClientId: "partner-data-ingest",
    authorizationGrantType: "client_credentials",
    issuedAt: new Date(Date.now() - 55 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
    status: "EXPIRING_SOON",
    secondsRemaining: 300,
  },
];

const INITIAL_CLIENTS: ApiClient[] = [
  {
    id: "703b3276-568e-4a77-b126-5db6f661fb82",
    clientId: "max-erp-web",
    clientName: "MAX ERP Primary Web Application",
    clientSecret: "••••••••••••••••••••••••••••••••",
    grantTypes: ["authorization_code", "refresh_token"],
    scopes: ["openid", "profile", "read", "write"],
    redirectUris: "http://localhost:3000/api/auth/callback/max-erp",
    issuedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "client-partner-ingest",
    clientId: "partner-data-ingest",
    clientName: "External Ingestion & ATS Sync Pipeline",
    clientSecret: "••••••••••••••••••••••••••••••••",
    grantTypes: ["client_credentials"],
    scopes: ["read", "write", "records.sync"],
    issuedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    status: "ACTIVE",
  },
  {
    id: "client-workday-bridge",
    clientId: "workday-hcm-connector",
    clientName: "Workday HCM Bi-directional Sync",
    clientSecret: "••••••••••••••••••••••••••••••••",
    grantTypes: ["client_credentials"],
    scopes: ["read", "workforce.sync"],
    issuedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    status: "ACTIVE",
  },
];

const INITIAL_WEBHOOKS: WebhookSubscription[] = [
  {
    id: "wh-workflow-approvals",
    name: "Workflow State Event Dispatcher",
    targetUrl: "https://api.partner-portal.com/webhooks/max-workflow",
    events: ["workflow.approved", "workflow.rejected"],
    secret: "whsec_live_99a8bc43d1",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastDeliveryStatusCode: 200,
    lastDeliveryAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "wh-candidate-hired",
    name: "Candidate Day-1 Onboarding Trigger",
    targetUrl: "https://provisioning.it-ops.internal/events/hired",
    events: ["candidate.hired", "offer.accepted"],
    secret: "whsec_live_55ef1290aa",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastDeliveryStatusCode: 200,
    lastDeliveryAt: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: "wh-security-alerts",
    name: "SIEM & SOC Security Event Stream",
    targetUrl: "https://soc-ingest.max-security.net/siem/audit",
    events: ["security.token_revoked", "security.mfa_failed", "rbac.changed"],
    secret: "whsec_live_44bb7700ff",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    lastDeliveryStatusCode: 200,
    lastDeliveryAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

const INITIAL_CONNECTORS: Connector[] = [
  {
    id: "conn-salesforce",
    name: "Salesforce CRM Enterprise",
    category: "CRM & Pipeline",
    description: "Bi-directional account, contact and sales opportunity synchronization.",
    status: "CONNECTED",
    lastSyncAt: new Date(Date.now() - 10 * 60000).toISOString(),
    config: { instanceUrl: "https://maxerp.my.salesforce.com", syncIntervalMins: 15 },
  },
  {
    id: "conn-sap-s4hana",
    name: "SAP S/4HANA Finance Cloud",
    category: "ERP & Ledger",
    description: "General ledger chart-of-accounts and cost-center budget mapping.",
    status: "CONNECTED",
    lastSyncAt: new Date(Date.now() - 25 * 60000).toISOString(),
    config: { odataEndpoint: "https://s4hana.internal/sap/opu/odata", companyCode: "1000" },
  },
  {
    id: "conn-workday",
    name: "Workday Human Capital Management",
    category: "HCM & Payroll",
    description: "Core worker profile and position synchronization bridge.",
    status: "CONFIGURED",
    lastSyncAt: new Date(Date.now() - 120 * 60000).toISOString(),
    config: { tenantName: "max_workday_prod" },
  },
  {
    id: "conn-servicenow",
    name: "ServiceNow IT Service Management",
    category: "ITSM & Provisioning",
    description: "Automatic hardware asset requisitioning on candidate offer acceptance.",
    status: "AVAILABLE",
    config: {},
  },
];

const INITIAL_DELIVERY_LOGS: WebhookDeliveryLog[] = [
  {
    id: "del-001",
    webhookId: "wh-workflow-approvals",
    webhookName: "Workflow State Event Dispatcher",
    eventType: "workflow.approved",
    targetUrl: "https://api.partner-portal.com/webhooks/max-workflow",
    statusCode: 200,
    latencyMs: 142,
    deliveredAt: new Date(Date.now() - 15 * 60000).toISOString(),
    success: true,
    responseBody: '{"status":"received","eventId":"evt_98321"}',
  },
  {
    id: "del-002",
    webhookId: "wh-candidate-hired",
    webhookName: "Candidate Day-1 Onboarding Trigger",
    eventType: "offer.accepted",
    targetUrl: "https://provisioning.it-ops.internal/events/hired",
    statusCode: 200,
    latencyMs: 98,
    deliveredAt: new Date(Date.now() - 60 * 60000).toISOString(),
    success: true,
    responseBody: '{"ticketId":"INC-90412","assignedQueue":"IT_HARDWARE"}',
  },
  {
    id: "del-003",
    webhookId: "wh-security-alerts",
    webhookName: "SIEM & SOC Security Event Stream",
    eventType: "security.token_revoked",
    targetUrl: "https://soc-ingest.max-security.net/siem/audit",
    statusCode: 200,
    latencyMs: 64,
    deliveredAt: new Date(Date.now() - 5 * 60000).toISOString(),
    success: true,
    responseBody: '{"indexed":true,"splunkIndex":"max_audit"}',
  },
];

const INITIAL_PIPELINE_JOBS: PipelineJob[] = [
  {
    jobId: "pipe-job-001",
    fileName: "q4_enterprise_candidates_ingest.csv",
    businessObjectId: "bo-cand-001",
    businessObjectName: "Candidate",
    status: "COMPLETED",
    totalRows: 1250,
    validRows: 1248,
    errorRows: 2,
    importedRows: 1248,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 86400000 + 45000).toISOString(),
  },
  {
    jobId: "pipe-job-002",
    fileName: "apac_headcount_rebalance_master.json",
    businessObjectId: "bo-pos-001",
    businessObjectName: "Position",
    status: "COMPLETED",
    totalRows: 800,
    validRows: 800,
    errorRows: 0,
    importedRows: 800,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 86400000 + 32000).toISOString(),
  },
  {
    jobId: "pipe-job-003",
    fileName: "vendor_rate_cards_2026.csv",
    businessObjectId: "bo-fin-001",
    businessObjectName: "FinanceRateCard",
    status: "COMPLETED",
    totalRows: 420,
    validRows: 418,
    errorRows: 2,
    importedRows: 418,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 3600000 + 18000).toISOString(),
  },
];

/* ============================================================================
 * State Store Class
 * ========================================================================== */

class IdentitySecurityStore {
  private tenants: TenantInfo[] = [...INITIAL_TENANTS];
  private organizations: OrgOption[] = [...INITIAL_ORGANIZATIONS];
  private users: UserItem[] = [...INITIAL_USERS];
  private roles: RoleItem[] = [...INITIAL_ROLES];
  private permissions: PermissionItem[] = [...INITIAL_PERMISSIONS];
  private rolePermissionMap: Record<string, string[]> = { ...INITIAL_ROLE_PERMISSION_MAP };
  private userRoles: UserRoleItem[] = [...INITIAL_USER_ROLES];
  private auditEvents: AuditTrailEvent[] = [...INITIAL_AUDIT_TRAIL];
  private sessions: ActiveSession[] = [...INITIAL_SESSIONS];
  private clients: ApiClient[] = [...INITIAL_CLIENTS];
  private webhooks: WebhookSubscription[] = [...INITIAL_WEBHOOKS];
  private connectors: Connector[] = [...INITIAL_CONNECTORS];
  private deliveries: WebhookDeliveryLog[] = [...INITIAL_DELIVERY_LOGS];
  private pipelineJobs: PipelineJob[] = [...INITIAL_PIPELINE_JOBS];

  /* --------------------------------------------------------------------------
   * Tenants & Organizations
   * ------------------------------------------------------------------------ */

  getTenants(): TenantInfo[] {
    return [...this.tenants];
  }

  getTenantById(id: string): TenantInfo | undefined {
    return this.tenants.find((t) => t.id === id || t.tenantKey === id);
  }

  createTenant(data: { tenantKey: string; name: string }): TenantInfo {
    const newTenant: TenantInfo = {
      id: `tenant-${Date.now()}`,
      tenantKey: data.tenantKey.trim().toLowerCase(),
      name: data.name.trim(),
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.tenants.push(newTenant);
    return newTenant;
  }

  getOrganizations(tenantId?: string): OrgOption[] {
    if (!tenantId) return [...this.organizations];
    return this.organizations.filter((o) => o.tenantId === tenantId);
  }

  /* --------------------------------------------------------------------------
   * Users & Roles
   * ------------------------------------------------------------------------ */

  getUsers(): UserItem[] {
    return [...this.users];
  }

  getUserById(id: string): UserItem | undefined {
    return this.users.find((u) => u.id === id || u.username === id || u.email === id);
  }

  createUser(data: { username: string; email: string; password?: string }): UserItem {
    const newUser: UserItem = {
      id: `u-${Date.now()}`,
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      status: "ACTIVE",
      emailVerified: true,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.unshift(newUser);

    // Record audit event
    this.recordAuditEvent({
      category: "AUTH",
      eventType: "USER_CREATED",
      severity: "INFO",
      actorUsername: "admin",
      targetResource: `User: ${newUser.username}`,
      description: `Created enterprise user dossier for ${newUser.email}.`,
    });

    return newUser;
  }

  updateUser(id: string, updates: Partial<UserItem>): UserItem | null {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.users[idx] = { ...this.users[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.users[idx];
  }

  deleteUser(id: string): boolean {
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length < initialLen;
  }

  getRoles(tenantId?: string): RoleItem[] {
    if (!tenantId) return [...this.roles];
    return this.roles.filter((r) => r.tenantId === tenantId || r.isSystem);
  }

  createRole(data: { roleKey: string; name: string; description?: string; tenantId: string }): RoleItem {
    const newRole: RoleItem = {
      id: `role-${Date.now()}`,
      roleKey: data.roleKey.trim().toUpperCase(),
      name: data.name.trim(),
      description: data.description || null,
      status: "ACTIVE",
      isSystem: false,
      tenantId: data.tenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.roles.push(newRole);
    this.rolePermissionMap[newRole.id] = [];
    return newRole;
  }

  getPermissions(): PermissionItem[] {
    return [...this.permissions];
  }

  getUserRoles(userId: string, tenantId?: string): UserRoleItem[] {
    return this.userRoles.filter((ur) => {
      if (ur.userId !== userId) return false;
      if (tenantId && ur.tenantId !== tenantId) return false;
      return true;
    });
  }

  assignRoleToUser(data: { userId: string; roleId: string; tenantId: string; organizationId?: string }): UserRoleItem {
    const role = this.roles.find((r) => r.id === data.roleId);
    const existing = this.userRoles.find(
      (ur) => ur.userId === data.userId && ur.roleId === data.roleId && ur.tenantId === data.tenantId
    );
    if (existing) return existing;

    const assignment: UserRoleItem = {
      id: `ur-${Date.now()}`,
      userId: data.userId,
      roleId: data.roleId,
      roleKey: role ? role.roleKey : "ROLE_CUSTOM",
      roleName: role ? role.name : "Custom Role",
      tenantId: data.tenantId,
      organizationId: data.organizationId || null,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.userRoles.push(assignment);
    return assignment;
  }

  removeRoleFromUser(userId: string, roleId: string): boolean {
    const initialLen = this.userRoles.length;
    this.userRoles = this.userRoles.filter(
      (ur) => !(ur.userId === userId && (ur.roleId === roleId || ur.id === roleId))
    );
    return this.userRoles.length < initialLen;
  }

  /* --------------------------------------------------------------------------
   * Security & Governance
   * ------------------------------------------------------------------------ */

  getSecurityMetrics(): SecurityDashboardMetrics {
    return {
      healthScore: 99,
      activeSessionsCount: this.sessions.filter((s) => s.status === "ACTIVE").length,
      totalRolesCount: this.roles.length,
      totalPermissionsCount: this.permissions.length,
      totalUsersCount: this.users.length,
      totalAuditEventsCount: this.auditEvents.length,
      approvedWorkflowsCount: 12,
      rejectedWorkflowsCount: 1,
      pendingWorkflowsCount: 2,
      mfaEnabledPercent: Math.round((this.users.filter((u) => u.mfaEnabled).length / Math.max(1, this.users.length)) * 100),
    };
  }

  getAuditTrail(category?: string, search?: string, limit: number = 100): AuditTrailEvent[] {
    let result = [...this.auditEvents];
    if (category && category !== "ALL") {
      result = result.filter((e) => e.category === category);
    }
    if (search && search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.actorUsername.toLowerCase().includes(q) ||
          e.eventType.toLowerCase().includes(q) ||
          e.targetResource.toLowerCase().includes(q)
      );
    }
    return result.slice(0, limit);
  }

  recordAuditEvent(event: Omit<AuditTrailEvent, "id" | "timestamp">): AuditTrailEvent {
    const created: AuditTrailEvent = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    this.auditEvents.unshift(created);
    return created;
  }

  getActiveSessions(): ActiveSession[] {
    if (this.sessions.length === 0) {
      this.sessions = [...INITIAL_SESSIONS];
    }
    return [...this.sessions];
  }

  terminateSession(sessionId: string): boolean {
    const target = this.sessions.find((s) => s.id === sessionId);
    if (!target) return false;
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);

    this.recordAuditEvent({
      category: "AUTH",
      eventType: "SESSION_TERMINATED",
      severity: "WARNING",
      actorUsername: "admin",
      targetResource: `Session: ${sessionId}`,
      description: `Forcefully revoked OAuth2 session token for principal ${target.principalName}.`,
    });

    return true;
  }

  getRbacMatrix(tenantId?: string): RbacMatrixData {
    const targetRoles = this.getRoles(tenantId);
    const usersWithRoles = this.users.map((u) => {
      const assigned = this.userRoles.filter((ur) => ur.userId === u.id).map((ur) => ur.roleId);
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        assignedRoleIds: assigned,
      };
    });

    return {
      roles: targetRoles,
      permissions: [...this.permissions],
      rolePermissionMap: { ...this.rolePermissionMap },
      users: usersWithRoles,
    };
  }

  toggleRolePermission(roleId: string, permissionId: string, grant: boolean): boolean {
    const current = this.rolePermissionMap[roleId] || [];
    if (grant) {
      if (!current.includes(permissionId)) {
        this.rolePermissionMap[roleId] = [...current, permissionId];
      }
    } else {
      this.rolePermissionMap[roleId] = current.filter((id) => id !== permissionId);
    }

    const role = this.roles.find((r) => r.id === roleId);
    const perm = this.permissions.find((p) => p.id === permissionId);
    this.recordAuditEvent({
      category: "RBAC",
      eventType: grant ? "ROLE_PERMISSION_GRANTED" : "ROLE_PERMISSION_REVOKED",
      severity: "INFO",
      actorUsername: "admin",
      targetResource: `${role ? role.roleKey : roleId} -> ${perm ? perm.permissionKey : permissionId}`,
      description: `${grant ? "Granted" : "Revoked"} ${perm ? perm.name : permissionId} on role ${role ? role.name : roleId}.`,
    });

    return true;
  }

  /* --------------------------------------------------------------------------
   * Enterprise Integrations Hub
   * ------------------------------------------------------------------------ */

  getIntegrationSummary(): IntegrationSummary {
    return {
      totalClientsCount: this.clients.length,
      totalWebhooksCount: this.webhooks.length,
      activeConnectorsCount: this.connectors.filter((c) => c.status === "CONNECTED").length,
      successfulDeliveriesCount: this.deliveries.filter((d) => d.success).length + 45,
      failedDeliveriesCount: this.deliveries.filter((d) => !d.success).length + 1,
      clients: [...this.clients],
      webhooks: [...this.webhooks],
      connectors: [...this.connectors],
      recentDeliveries: [...this.deliveries],
    };
  }

  getClients(): ApiClient[] {
    return [...this.clients];
  }

  createClient(data: { clientId: string; clientName: string; grantTypes: string[]; scopes: string[]; redirectUris?: string }): ApiClient {
    const secret = `sec_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newClient: ApiClient = {
      id: `client-${Date.now()}`,
      clientId: data.clientId.trim().toLowerCase(),
      clientName: data.clientName.trim(),
      clientSecret: secret,
      grantTypes: data.grantTypes,
      scopes: data.scopes,
      redirectUris: data.redirectUris,
      issuedAt: new Date().toISOString(),
      status: "ACTIVE",
    };
    this.clients.push(newClient);
    return newClient;
  }

  deleteClient(id: string): boolean {
    const initialLen = this.clients.length;
    this.clients = this.clients.filter((c) => c.id !== id && c.clientId !== id);
    return this.clients.length < initialLen;
  }

  getWebhooks(): WebhookSubscription[] {
    return [...this.webhooks];
  }

  createWebhook(data: { name: string; targetUrl: string; events: string[] }): WebhookSubscription {
    const newWebhook: WebhookSubscription = {
      id: `wh-${Date.now()}`,
      name: data.name.trim(),
      targetUrl: data.targetUrl.trim(),
      events: data.events,
      secret: `whsec_${Math.random().toString(36).substring(2)}`,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      lastDeliveryStatusCode: 200,
      lastDeliveryAt: new Date().toISOString(),
    };
    this.webhooks.push(newWebhook);
    return newWebhook;
  }

  deleteWebhook(id: string): boolean {
    const initialLen = this.webhooks.length;
    this.webhooks = this.webhooks.filter((w) => w.id !== id);
    return this.webhooks.length < initialLen;
  }

  testPingWebhook(webhookId: string): WebhookDeliveryLog {
    const wh = this.webhooks.find((w) => w.id === webhookId);
    const log: WebhookDeliveryLog = {
      id: `del-ping-${Date.now()}`,
      webhookId,
      webhookName: wh ? wh.name : "Test Ping Endpoint",
      eventType: "ping.test",
      targetUrl: wh ? wh.targetUrl : "https://echo.max-erp.com/webhook",
      statusCode: 200,
      latencyMs: Math.floor(Math.random() * 80) + 40,
      deliveredAt: new Date().toISOString(),
      success: true,
      responseBody: '{"pong":true,"received":true,"latencyMs":48}',
    };
    this.deliveries.unshift(log);
    if (wh) {
      wh.lastDeliveryStatusCode = 200;
      wh.lastDeliveryAt = log.deliveredAt;
    }
    return log;
  }

  getConnectors(): Connector[] {
    return [...this.connectors];
  }

  toggleConnector(id: string, enable: boolean): Connector | null {
    const c = this.connectors.find((conn) => conn.id === id);
    if (!c) return null;
    c.status = enable ? "CONNECTED" : "AVAILABLE";
    if (enable) c.lastSyncAt = new Date().toISOString();
    return c;
  }

  getDeliveries(): WebhookDeliveryLog[] {
    return [...this.deliveries];
  }

  /* --------------------------------------------------------------------------
   * Data Pipeline
   * ------------------------------------------------------------------------ */

  getPipelineMetrics(): PipelineMetrics {
    const totalRows = this.pipelineJobs.reduce((acc, j) => acc + j.totalRows, 0);
    const validRows = this.pipelineJobs.reduce((acc, j) => acc + j.validRows, 0);
    const failedRows = this.pipelineJobs.reduce((acc, j) => acc + j.errorRows, 0);
    return {
      totalJobs: this.pipelineJobs.length + 11,
      totalRowsProcessed: totalRows + 16000,
      totalSuccessfulRows: validRows + 15840,
      totalFailedRows: failedRows + 160,
      successRatePercent: 99.12,
      activePipelines: 2,
    };
  }

  getPipelineJobs(): PipelineJob[] {
    return [...this.pipelineJobs];
  }
}

// Global Singleton Instance
export const identitySecurityStore = new IdentitySecurityStore();
