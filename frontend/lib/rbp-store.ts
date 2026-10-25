// MAX-ERP Role-Based Permissions (RBP) Security Governance Engine
// Controls enterprise access to Workforce, Positions, People Profile, Compensation, and Business Objects.

export type EnterpriseRoleKey = 
  | "SYSTEM_ADMIN" 
  | "HR_DIRECTOR" 
  | "HIRING_MANAGER" 
  | "STANDARD_EMPLOYEE";

export interface EnterpriseRole {
  key: EnterpriseRoleKey;
  name: string;
  badge: string;
  description: string;
  permissions: string[];
}

export const ENTERPRISE_ROLES: EnterpriseRole[] = [
  {
    key: "SYSTEM_ADMIN",
    name: "Enterprise Administrator",
    badge: "Full Access",
    description: "Complete unrestricted administrative control across all enterprise modules, schemas, and configurations.",
    permissions: [
      "WORKFORCE_POSITION_VIEW",
      "WORKFORCE_POSITION_MANAGE",
      "WORKFORCE_PROFILE_VIEW",
      "WORKFORCE_COMPENSATION_VIEW",
      "CONFIG_BUSINESSOBJECTS_MANAGE",
      "WORKFORCE_TIME_OFF_APPROVE",
      "WORKFORCE_H2R_EXECUTE",
      "SECURITY_AUDIT_VIEW",
    ],
  },
  {
    key: "HR_DIRECTOR",
    name: "HR Operations Director",
    badge: "HR Operations",
    description: "Authorized for workforce management, org tree, people profile dossier, and compensation governance. Read-only for schema metadata.",
    permissions: [
      "WORKFORCE_POSITION_VIEW",
      "WORKFORCE_POSITION_MANAGE",
      "WORKFORCE_PROFILE_VIEW",
      "WORKFORCE_COMPENSATION_VIEW",
      "WORKFORCE_TIME_OFF_APPROVE",
      "WORKFORCE_H2R_EXECUTE",
    ],
  },
  {
    key: "HIRING_MANAGER",
    name: "Hiring Manager / Team Lead",
    badge: "Department Lead",
    description: "Department-level view of positions and candidate pipelines. Restricted from confidential base salaries and executive schema config.",
    permissions: [
      "WORKFORCE_POSITION_VIEW",
      "WORKFORCE_PROFILE_VIEW",
      "WORKFORCE_TIME_OFF_APPROVE",
    ],
  },
  {
    key: "STANDARD_EMPLOYEE",
    name: "Standard Employee / Staff",
    badge: "Self-Service",
    description: "Personal self-service access only. Restricted from global org tree management, peer salaries, and administrative studios.",
    permissions: [
      "WORKFORCE_SELF_VIEW",
    ],
  },
];

export function hasPermission(roleKey: EnterpriseRoleKey, permission: string): boolean {
  const role = ENTERPRISE_ROLES.find((r) => r.key === roleKey);
  if (!role) return false;
  return role.permissions.includes(permission);
}

export function getRoleDetails(roleKey: EnterpriseRoleKey): EnterpriseRole {
  return ENTERPRISE_ROLES.find((r) => r.key === roleKey) || ENTERPRISE_ROLES[0];
}
