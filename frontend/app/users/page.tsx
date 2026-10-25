"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Types & Domain Interfaces
 * ========================================================================== */

export interface UserItem {
  id: string;
  username: string;
  email: string;
  status: string;
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
  status: string;
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

export interface TenantInfo {
  id: string;
  tenantKey: string;
  name: string;
  status: string;
}

export interface OrgOption {
  id: string;
  name: string;
  organizationKey: string;
  organizationType: string;
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ParsedUserRow {
  username: string;
  email: string;
  password?: string;
  roleKey?: string;
  status?: string;
  valid: boolean;
  error?: string;
}

interface ParsedRoleRow {
  roleKey: string;
  name: string;
  description?: string;
  permissions?: string;
  valid: boolean;
  error?: string;
}

/* ============================================================================
 * SVG Icons
 * ========================================================================== */

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ShieldIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function KeyIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  );
}

function PlusIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function UploadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function SearchIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function TrashIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function BuildingIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function LockClosedIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function CheckCircleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ============================================================================
 * Helper: Avatar Initials & Color Hash
 * ========================================================================== */

function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/[\s._-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

const AVATAR_GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-indigo-500 to-purple-600",
  "from-violet-500 to-fuchsia-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

function getAvatarGradient(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}

/* ============================================================================
 * Main Users & Access Component
 * ========================================================================== */

export default function UsersAndAccessPage() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"users" | "roles" | "permissions">("users");

  // Core Data
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [organizations, setOrganizations] = useState<OrgOption[]>([]);
  const [userRolesMap, setUserRolesMap] = useState<Record<string, UserRoleItem[]>>({});

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Modals & Drawers
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);
  const [importUsersModalOpen, setImportUsersModalOpen] = useState(false);
  const [importRolesModalOpen, setImportRolesModalOpen] = useState(false);
  const [rolePermissionsDrawerOpen, setRolePermissionsDrawerOpen] = useState(false);
  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState<RoleItem | null>(null);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionItem[]>([]);
  const [rolePermsLoading, setRolePermsLoading] = useState(false);
  const [userAccessDrawerOpen, setUserAccessDrawerOpen] = useState(false);
  const [selectedUserForAccess, setSelectedUserForAccess] = useState<UserItem | null>(null);
  const [userRoles, setUserRoles] = useState<UserRoleItem[]>([]);
  const [userTenantAccess, setUserTenantAccess] = useState<UserTenantAccessItem[]>([]);
  const [userAccessLoading, setUserAccessLoading] = useState(false);

  // Form States
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formAutoGrantTenant, setFormAutoGrantTenant] = useState(true);
  const [formRoleKey, setFormRoleKey] = useState("");
  const [formRoleName, setFormRoleName] = useState("");
  const [formRoleDesc, setFormRoleDesc] = useState("");
  const [selectedRoleIdToAssign, setSelectedRoleIdToAssign] = useState("");
  const [selectedOrgIdToAssign, setSelectedOrgIdToAssign] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Bulk Import States
  const [userCsvText, setUserCsvText] = useState("");
  const [roleCsvText, setRoleCsvText] = useState("");
  const [parsedUsers, setParsedUsers] = useState<ParsedUserRow[]>([]);
  const [parsedRoles, setParsedRoles] = useState<ParsedRoleRow[]>([]);
  const [importExecuting, setImportExecuting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const userFileInputRef = useRef<HTMLInputElement | null>(null);
  const roleFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load Main Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Load Tenants
      const tenantsRes = await fetch("/api/tenants");
      if (!tenantsRes.ok) throw new Error("Failed to load enterprise tenants.");
      const tenantsData: TenantInfo[] = await tenantsRes.json();
      setTenants(tenantsData);

      const activeTenant =
        tenantsData.find((t) => t.tenantKey === "security-test") ||
        tenantsData[0];
      const tenantId = selectedTenantId || activeTenant?.id;
      if (!selectedTenantId && tenantId) setSelectedTenantId(tenantId);

      // 2. Load Users
      const usersRes = await fetch("/api/users");
      if (!usersRes.ok) throw new Error("Failed to load enterprise users.");
      const usersData: UserItem[] = await usersRes.json();
      setUsers(usersData);

      // 3. Load Permissions
      const permsRes = await fetch("/api/permissions");
      if (!permsRes.ok) throw new Error("Failed to load system permissions.");
      const permsData: PermissionItem[] = await permsRes.json();
      setPermissions(permsData);

      // 4. Load Roles & Organizations for Active Tenant
      if (tenantId) {
        const [rolesRes, orgsRes] = await Promise.all([
          fetch(`/api/roles?tenantId=${tenantId}`),
          fetch(`/api/tenants/${tenantId}/organizations`),
        ]);
        if (rolesRes.ok) {
          const rolesData: RoleItem[] = await rolesRes.json();
          setRoles(rolesData);
        }
        if (orgsRes.ok) {
          const orgsData: OrgOption[] = await orgsRes.json();
          setOrganizations(orgsData);
        }

        // Preload role assignments for all users in this tenant to display badges
        const roleMap: Record<string, UserRoleItem[]> = {};
        await Promise.all(
          usersData.slice(0, 20).map(async (u) => {
            try {
              const res = await fetch(`/api/users/${u.id}/roles?tenantId=${tenantId}`);
              if (res.ok) {
                roleMap[u.id] = await res.json();
              }
            } catch {
              // Ignore background fetch failure
            }
          })
        );
        setUserRolesMap(roleMap);
      }
    } catch (err) {
      console.error("[Users & Access Load Error]", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }, [selectedTenantId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tenant change handler
  const handleTenantChange = async (newTenantId: string) => {
    setSelectedTenantId(newTenantId);
    try {
      setLoading(true);
      const [rolesRes, orgsRes] = await Promise.all([
        fetch(`/api/roles?tenantId=${newTenantId}`),
        fetch(`/api/tenants/${newTenantId}/organizations`),
      ]);
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (orgsRes.ok) setOrganizations(await orgsRes.json());
      addToast("Active security tenant partition switched.", "info");
    } catch (err) {
      console.error("Tenant switch error", err);
      addToast("Failed to switch tenant context.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Submit Create User
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formEmail.trim() || !formPassword) {
      setFormError("Username, email, and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formUsername.trim(),
          email: formEmail.trim(),
          password: formPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create user.");
      }

      const createdUser: UserItem = await res.json();

      // Automatically grant tenant access if checked
      if (formAutoGrantTenant && selectedTenantId && createdUser.id) {
        try {
          await fetch(`/api/users/${createdUser.id}/tenant-access`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId: selectedTenantId }),
          });
        } catch (grantErr) {
          console.warn("Auto tenant grant failed:", grantErr);
        }
      }

      setCreateUserModalOpen(false);
      setFormUsername("");
      setFormEmail("");
      setFormPassword("");
      addToast(`User "${createdUser.username}" created successfully!`, "success");
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Create Role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = formRoleKey.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "_");
    if (!cleanKey || !formRoleName.trim()) {
      setFormError("Role key and name are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: selectedTenantId,
          roleKey: cleanKey,
          name: formRoleName.trim(),
          description: formRoleDesc.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create role.");
      }

      const createdRole: RoleItem = await res.json();
      setCreateRoleModalOpen(false);
      setFormRoleKey("");
      setFormRoleName("");
      setFormRoleDesc("");
      addToast(`Role "${createdRole.name}" created successfully!`, "success");
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Role creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Role Permissions Drawer
  const openRolePermissions = async (role: RoleItem) => {
    setSelectedRoleForPerms(role);
    setRolePermissionsDrawerOpen(true);
    setRolePermsLoading(true);
    try {
      const res = await fetch(`/api/roles/${role.id}/permissions`);
      if (res.ok) {
        const data: RolePermissionItem[] = await res.json();
        setRolePermissions(data);
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || "Failed to fetch role permissions.", "error");
      }
    } catch (err) {
      console.error("Failed to load role permissions", err);
      addToast("Failed to load permissions for role.", "error");
    } finally {
      setRolePermsLoading(false);
    }
  };

  // Toggle Permission Assignment
  const handleTogglePermission = async (perm: PermissionItem, isCurrentlyAssigned: boolean) => {
    if (!selectedRoleForPerms) return;

    const isSystemRole = Boolean(selectedRoleForPerms.system || selectedRoleForPerms.isSystem);
    if (isSystemRole) {
      addToast("Permissions of system roles cannot be modified. Create a custom role to customize access.", "error");
      return;
    }

    try {
      if (isCurrentlyAssigned) {
        // Remove assignment
        const res = await fetch(`/api/roles/${selectedRoleForPerms.id}/permissions/${perm.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setRolePermissions((prev) => prev.filter((rp) => rp.permissionId !== perm.id));
          addToast(`Permission "${perm.name}" removed from role.`, "success");
        } else {
          const err = await res.json().catch(() => ({}));
          addToast(err.message || "Failed to revoke permission.", "error");
        }
      } else {
        // Assign permission
        const res = await fetch(`/api/roles/${selectedRoleForPerms.id}/permissions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ permissionId: perm.id }),
        });
        if (res.ok) {
          const newAssignment: RolePermissionItem = await res.json();
          setRolePermissions((prev) => [...prev, newAssignment]);
          addToast(`Permission "${perm.name}" assigned to role!`, "success");
        } else {
          const err = await res.json().catch(() => ({}));
          addToast(err.message || "Failed to assign permission.", "error");
        }
      }
    } catch (err) {
      console.error("Toggle permission failed", err);
      addToast("Network or server error updating permission.", "error");
    }
  };

  // Open User Access Drawer
  const openUserAccess = async (user: UserItem) => {
    setSelectedUserForAccess(user);
    setUserAccessDrawerOpen(true);
    setUserAccessLoading(true);
    try {
      const [rolesRes, tenantAccessRes] = await Promise.all([
        fetch(`/api/users/${user.id}/roles?tenantId=${selectedTenantId}`),
        fetch(`/api/users/${user.id}/tenant-access?tenantId=${selectedTenantId}`),
      ]);
      if (rolesRes.ok) {
        const rolesData = await rolesRes.json();
        setUserRoles(rolesData);
        setUserRolesMap((prev) => ({ ...prev, [user.id]: rolesData }));
      }
      if (tenantAccessRes.ok) setUserTenantAccess(await tenantAccessRes.json());
    } catch (err) {
      console.error("Failed to load user access", err);
      addToast("Failed to fetch user access credentials.", "error");
    } finally {
      setUserAccessLoading(false);
    }
  };

  // Explicitly grant tenant access from drawer
  const handleGrantTenantAccess = async () => {
    if (!selectedUserForAccess || !selectedTenantId) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/users/${selectedUserForAccess.id}/tenant-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: selectedTenantId }),
      });
      if (res.ok) {
        const newAccess = await res.json();
        setUserTenantAccess((prev) => [...prev, newAccess]);
        addToast(`Tenant access granted to "${selectedUserForAccess.username}"!`, "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || "Failed to grant tenant access.", "error");
      }
    } catch (err) {
      addToast("Failed to grant tenant access.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Assign Role to User
  const handleAssignRoleToUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAccess || !selectedRoleIdToAssign) return;

    try {
      setSubmitting(true);

      // 1. Ensure user has tenant access first
      const hasTenantAccess = userTenantAccess.some(
        (ta) => ta.tenantId === selectedTenantId && ta.status === "ACTIVE"
      );
      if (!hasTenantAccess) {
        try {
          const accessRes = await fetch(`/api/users/${selectedUserForAccess.id}/tenant-access`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantId: selectedTenantId }),
          });
          if (accessRes.ok) {
            const newAccess = await accessRes.json();
            setUserTenantAccess((prev) => [...prev, newAccess]);
          }
        } catch {
          // Continue to role assignment if already present
        }
      }

      // 2. Assign the Role
      const res = await fetch(`/api/users/${selectedUserForAccess.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: selectedRoleIdToAssign,
          tenantId: selectedTenantId,
          organizationId: selectedOrgIdToAssign || null,
        }),
      });

      if (res.ok) {
        const assignedRole: UserRoleItem = await res.json();
        setUserRoles((prev) => [...prev, assignedRole]);
        setUserRolesMap((prev) => ({
          ...prev,
          [selectedUserForAccess.id]: [...(prev[selectedUserForAccess.id] || []), assignedRole],
        }));
        setSelectedRoleIdToAssign("");
        setSelectedOrgIdToAssign("");
        addToast(`Role "${assignedRole.roleName}" assigned successfully!`, "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || "Failed to assign role. Ensure user has active tenant access.", "error");
      }
    } catch (err) {
      console.error("Assign role failed", err);
      addToast("Network or authorization error assigning role.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Revoke Role from User
  const handleRevokeRole = async (roleId: string, orgId: string | null) => {
    if (!selectedUserForAccess) return;
    try {
      let query = `tenantId=${selectedTenantId}`;
      if (orgId) query += `&organizationId=${orgId}`;
      const res = await fetch(`/api/users/${selectedUserForAccess.id}/roles/${roleId}?${query}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUserRoles((prev) => prev.filter((r) => !(r.roleId === roleId && r.organizationId === orgId)));
        setUserRolesMap((prev) => ({
          ...prev,
          [selectedUserForAccess.id]: (prev[selectedUserForAccess.id] || []).filter(
            (r) => !(r.roleId === roleId && r.organizationId === orgId)
          ),
        }));
        addToast("Role assignment revoked successfully.", "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || "Failed to revoke role.", "error");
      }
    } catch (err) {
      console.error("Revoke role failed", err);
      addToast("Error revoking role assignment.", "error");
    }
  };

  // Toggle user status active/inactive
  const handleToggleUserStatus = async (user: UserItem) => {
    const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          email: user.email,
        }),
      });
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );
        addToast(`User "${user.username}" status updated to ${newStatus}.`, "success");
      } else {
        const err = await res.json().catch(() => ({}));
        addToast(err.message || "Failed to update user status.", "error");
      }
    } catch (err) {
      addToast("Error updating user status.", "error");
    }
  };

  /* ============================================================================
   * Bulk Import: Users
   * ========================================================================== */

  const parseUserCsv = useCallback((text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedUsers([]);
      return;
    }

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("username") || firstLine.includes("email");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const seenUsernames = new Set<string>();
    const seenEmails = new Set<string>();

    const rows: ParsedUserRow[] = dataLines.map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const username = cols[0] || "";
      const email = cols[1] || "";
      const password = cols[2] || "TempPass123!";
      const roleKey = cols[3] || "";

      let valid = true;
      let error = "";

      if (!username || username.length < 3) {
        valid = false;
        error = "Username must be at least 3 characters";
      } else if (!email || !email.includes("@")) {
        valid = false;
        error = "Valid email is required";
      } else if (password && password.length < 8) {
        valid = false;
        error = "Password must be at least 8 characters";
      } else if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        valid = false;
        error = `Username "${username}" already exists in system`;
      } else if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        valid = false;
        error = `Email "${email}" already registered`;
      } else if (seenUsernames.has(username.toLowerCase())) {
        valid = false;
        error = `Duplicate username in file`;
      } else if (seenEmails.has(email.toLowerCase())) {
        valid = false;
        error = `Duplicate email in file`;
      }

      if (username) seenUsernames.add(username.toLowerCase());
      if (email) seenEmails.add(email.toLowerCase());

      return { username, email, password, roleKey, valid, error };
    });

    setParsedUsers(rows);
  }, [users]);

  const loadFreshUserSample = () => {
    const timestamp = Date.now().toString().slice(-4);
    const freshSample = `username,email,password,role_key\nsarah.c${timestamp},sarah.c${timestamp}@maxerp.internal,TempPass123!,security_test_manager\nalex.m${timestamp},alex.m${timestamp}@maxerp.internal,TempPass123!,security_test_manager\nelena.r${timestamp},elena.r${timestamp}@maxerp.internal,TempPass123!,\n`;
    setUserCsvText(freshSample);
    parseUserCsv(freshSample);
    setImportResult(null);
  };

  const downloadUserTemplate = () => {
    const sample = `username,email,password,role_key\nsarah.connor,sarah.connor@maxerp.internal,TempPass123!,security_test_manager\nalex.murphy,alex.murphy@maxerp.internal,TempPass123!,security_test_manager\nelena.rostova,elena.rostova@maxerp.internal,TempPass123!,\n`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "max_users_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeUserImport = async () => {
    const validRows = parsedUsers.filter((r) => r.valid);
    if (validRows.length === 0) {
      addToast("No valid user rows to import. Correct validation errors below.", "error");
      return;
    }

    setImportExecuting(true);
    setImportResult(null);

    let successCount = 0;
    let failCount = 0;
    const failureReasons: string[] = [];

    for (const row of validRows) {
      try {
        // 1. Create User
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: row.username,
            email: row.email,
            password: row.password || "TempPass123!",
          }),
        });

        if (res.ok) {
          const created: UserItem = await res.json();
          successCount++;

          // 2. Grant tenant access
          if (selectedTenantId && created.id) {
            try {
              await fetch(`/api/users/${created.id}/tenant-access`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenantId: selectedTenantId }),
              });
            } catch {
              // Ignore
            }

            // 3. Assign role if specified
            if (row.roleKey) {
              const matchedRole = roles.find((r) => r.roleKey.toLowerCase() === row.roleKey?.toLowerCase());
              if (matchedRole) {
                try {
                  await fetch(`/api/users/${created.id}/roles`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      roleId: matchedRole.id,
                      tenantId: selectedTenantId,
                      organizationId: null,
                    }),
                  });
                } catch {
                  // Ignore role assignment error in bulk
                }
              }
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || errData.error || `HTTP ${res.status}`;
          failCount++;
          failureReasons.push(`${row.username}: ${errMsg}`);
        }
      } catch (err) {
        failCount++;
        failureReasons.push(`${row.username}: Network or server error`);
      }
    }

    setImportExecuting(false);
    if (failCount > 0) {
      setImportResult(
        `Import Completed: ${successCount} user(s) created, ${failCount} failed.\nReasons:\n• ${failureReasons.join("\n• ")}`
      );
      addToast(`Import finished with errors: ${successCount} created, ${failCount} failed.`, "error");
    } else {
      setImportResult(`Import Completed: All ${successCount} user(s) created successfully!`);
      addToast(`All ${successCount} users imported successfully!`, "success");
    }
    await loadData();
  };

  /* ============================================================================
   * Bulk Import: Roles
   * ========================================================================== */

  const parseRoleCsv = useCallback((text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      setParsedRoles([]);
      return;
    }

    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes("role_key") || firstLine.includes("name");
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const seenRoleKeys = new Set<string>();

    const rows: ParsedRoleRow[] = dataLines.map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
      const roleKey = (cols[0] || "").toLowerCase().replace(/[^a-z0-9_-]/g, "_");
      const name = cols[1] || "";
      const description = cols[2] || "";
      const permissions = cols[3] || "";

      let valid = true;
      let error = "";

      if (!roleKey || roleKey.length < 2) {
        valid = false;
        error = "Role key must be at least 2 alphanumeric chars";
      } else if (!name || name.length < 2) {
        valid = false;
        error = "Role name is required";
      } else if (roles.some((r) => r.roleKey.toLowerCase() === roleKey.toLowerCase())) {
        valid = false;
        error = `Role "${roleKey}" already exists in this tenant`;
      } else if (seenRoleKeys.has(roleKey.toLowerCase())) {
        valid = false;
        error = `Duplicate role key in file`;
      }

      if (roleKey) seenRoleKeys.add(roleKey.toLowerCase());

      return { roleKey, name, description, permissions, valid, error };
    });

    setParsedRoles(rows);
  }, [roles]);

  const loadFreshRoleSample = () => {
    const timestamp = Date.now().toString().slice(-4);
    const freshSample = `role_key,name,description,permissions\nauditor_${timestamp},Auditor ${timestamp},Audits security role assignments and access records,SECURITY.USER_ROLE_ASSIGN|SECURITY.ACCESS_MANAGE\ncoordinator_${timestamp},Coordinator ${timestamp},Manages organization-level user access and role assignments,SECURITY.USER_ROLE_ASSIGN|SECURITY.ACCESS_MANAGE\n`;
    setRoleCsvText(freshSample);
    parseRoleCsv(freshSample);
    setImportResult(null);
  };

  const downloadRoleTemplate = () => {
    const sample = `role_key,name,description,permissions\ncompliance_auditor,Compliance & Security Auditor,Audits security role assignments and access records,SECURITY.USER_ROLE_ASSIGN|SECURITY.ACCESS_MANAGE\naccess_coordinator,Tenant Access Coordinator,Manages organization-level user access and role assignments,SECURITY.USER_ROLE_ASSIGN|SECURITY.ACCESS_MANAGE\n`;
    const blob = new Blob([sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "max_roles_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const executeRoleImport = async () => {
    const validRows = parsedRoles.filter((r) => r.valid);
    if (validRows.length === 0) {
      addToast("No valid role rows to import. Correct validation errors below.", "error");
      return;
    }

    setImportExecuting(true);
    setImportResult(null);

    let successCount = 0;
    let failCount = 0;
    const failureReasons: string[] = [];

    for (const row of validRows) {
      try {
        // 1. Create Role
        const res = await fetch("/api/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId: selectedTenantId,
            roleKey: row.roleKey,
            name: row.name,
            description: row.description || null,
          }),
        });

        if (res.ok) {
          const createdRole: RoleItem = await res.json();
          successCount++;

          // 2. Assign specified permissions
          if (row.permissions && createdRole.id) {
            const permKeys = row.permissions.split(/[|;]+/).map((k) => k.trim());
            for (const pKey of permKeys) {
              const matchedPerm = permissions.find(
                (p) => p.permissionKey.toLowerCase() === pKey.toLowerCase() || p.name.toLowerCase() === pKey.toLowerCase()
              );
              if (matchedPerm) {
                try {
                  await fetch(`/api/roles/${createdRole.id}/permissions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ permissionId: matchedPerm.id }),
                  });
                } catch {
                  // Ignore per-permission assignment failure
                }
              }
            }
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.message || errData.error || `HTTP ${res.status}`;
          failCount++;
          failureReasons.push(`${row.roleKey}: ${errMsg}`);
        }
      } catch (err) {
        failCount++;
        failureReasons.push(`${row.roleKey}: Network or server error`);
      }
    }

    setImportExecuting(false);
    if (failCount > 0) {
      setImportResult(
        `Role Import Completed: ${successCount} role(s) created, ${failCount} failed.\nReasons:\n• ${failureReasons.join("\n• ")}`
      );
      addToast(`Role import finished with errors: ${successCount} created, ${failCount} failed.`, "error");
    } else {
      setImportResult(`Role Import Completed: All ${successCount} role(s) created successfully!`);
      addToast(`All ${successCount} roles imported successfully!`, "success");
    }
    await loadData();
  };

  /* ============================================================================
   * Filtered Computations
   * ========================================================================== */

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const q = searchQuery.toLowerCase().trim();
      return !q || r.name.toLowerCase().includes(q) || r.roleKey.toLowerCase().includes(q);
    });
  }, [roles, searchQuery]);

  const filteredPermissions = useMemo(() => {
    return permissions.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      return (
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.permissionKey.toLowerCase().includes(q) ||
        p.moduleKey.toLowerCase().includes(q)
      );
    });
  }, [permissions, searchQuery]);

  const permissionsByModule = useMemo(() => {
    const map: Record<string, PermissionItem[]> = {};
    for (const p of filteredPermissions) {
      if (!map[p.moduleKey]) map[p.moduleKey] = [];
      map[p.moduleKey].push(p);
    }
    return map;
  }, [filteredPermissions]);

  const activeTenantObj = useMemo(() => {
    return tenants.find((t) => t.id === selectedTenantId);
  }, [tenants, selectedTenantId]);

  return (
    <MaxShell>
      <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
        {/* ===================================================================
         * Toast Notification Container
         * =================================================================== */}
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border backdrop-blur-md text-xs font-semibold transition-all duration-300 transform translate-y-0 ${
                toast.type === "success"
                  ? "bg-emerald-500/95 border-emerald-400 text-white shadow-emerald-500/20"
                  : toast.type === "error"
                  ? "bg-rose-500/95 border-rose-400 text-white shadow-rose-500/20"
                  : "bg-slate-900/95 border-slate-700 text-white shadow-slate-900/30 dark:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === "success" && <CheckCircleIcon className="h-4 w-4 shrink-0" />}
                {toast.type === "error" && <ShieldIcon className="h-4 w-4 shrink-0" />}
                {toast.type === "info" && <KeyIcon className="h-4 w-4 shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 p-1 text-white font-bold"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* ===================================================================
         * Top Header & Tenant Selector
         * =================================================================== */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Identity & Access Governance</span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Users & Enterprise RBAC
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Manage enterprise user identities, tenant-isolated roles, granular module permissions, and company organization scoping.
            </p>
          </div>

          {/* Tenant Selector & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <BuildingIcon className="h-4 w-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tenant Partition
                </span>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none dark:text-white cursor-pointer"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-slate-900">
                      {t.name} ({t.tenantKey})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Action Buttons */}
            {activeTab === "users" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setUserCsvText("");
                    setParsedUsers([]);
                    setImportResult(null);
                    setImportUsersModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <UploadIcon className="h-4 w-4 text-blue-600" />
                  Import Users
                </button>
                <button
                  onClick={() => {
                    setFormError(null);
                    setCreateUserModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
                >
                  <PlusIcon className="h-4 w-4" />
                  New User
                </button>
              </div>
            ) : activeTab === "roles" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRoleCsvText("");
                    setParsedRoles([]);
                    setImportResult(null);
                    setImportRolesModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
                >
                  <UploadIcon className="h-4 w-4 text-indigo-600" />
                  Import Roles
                </button>
                <button
                  onClick={() => {
                    setFormError(null);
                    setCreateRoleModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  <PlusIcon className="h-4 w-4" />
                  New Role
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* ===================================================================
         * Metric Stat Cards (4 Grid)
         * =================================================================== */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Users</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <UserIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {users.length}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>{users.filter((u) => u.status === "ACTIVE").length} Active Accounts</span>
            </div>
          </div>

          {/* Card 2: Roles */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tenant Roles</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <ShieldIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {roles.length}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              <span>{roles.filter((r) => r.system || r.isSystem).length} System</span>
              <span>•</span>
              <span>{roles.filter((r) => !(r.system || r.isSystem)).length} Custom Roles</span>
            </div>
          </div>

          {/* Card 3: Permissions */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Security Permissions</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <KeyIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
              {permissions.length}
            </div>
            <div className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Across {Object.keys(permissionsByModule).length || 1} Functional Modules
            </div>
          </div>

          {/* Card 4: Tenant Scope */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Active Tenant</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <BuildingIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-2 text-base font-extrabold text-slate-900 dark:text-white truncate">
              {activeTenantObj?.name || "Global Tenant"}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
              <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5">
                {activeTenantObj?.tenantKey || "security-test"}
              </span>
            </div>
          </div>
        </div>

        {/* ===================================================================
         * Tab Navigation & Filter Bar
         * =================================================================== */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          {/* Segmented Pills */}
          <div className="inline-flex rounded-2xl bg-slate-200/70 p-1 dark:bg-slate-800/80 backdrop-blur-md">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "users"
                  ? "bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <UserIcon className="h-4 w-4" />
              <span>Users & Accounts</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px]">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "roles"
                  ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <ShieldIcon className="h-4 w-4" />
              <span>Roles & RBAC Matrix</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px]">
                {roles.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("permissions")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "permissions"
                  ? "bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <KeyIcon className="h-4 w-4" />
              <span>Permissions Directory</span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px]">
                {permissions.length}
              </span>
            </button>
          </div>

          {/* Search & Status Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <SearchIcon className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {activeTab === "users" && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            )}
          </div>
        </div>

        {/* ===================================================================
         * Tab 1: Users & Accounts View
         * =================================================================== */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span className="text-xs font-semibold text-slate-400">Loading user directory...</span>
                </div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
                  <UserIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No users found</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  {searchQuery ? "No users matching your query." : "Get started by creating a new enterprise user or importing from CSV."}
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setCreateUserModalOpen(true)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                  >
                    Create User
                  </button>
                  <button
                    onClick={() => setImportUsersModalOpen(true)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    Import CSV
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                      <th className="py-3.5 pl-6 pr-4">User</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Assigned Roles</th>
                      <th className="px-4 py-3.5">Created</th>
                      <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                    {filteredUsers.map((user) => {
                      const rolesForUser = userRolesMap[user.id] || [];
                      const initials = getInitials(user.username);
                      const gradientClass = getAvatarGradient(user.username);

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 pl-6 pr-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${gradientClass} text-xs font-black text-white shadow-xs`}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white">
                                  {user.username}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                                  {user.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5 font-medium text-slate-600 dark:text-slate-300">
                            {user.email}
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                user.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  user.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              {user.status}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            {rolesForUser.length === 0 ? (
                              <span className="text-[11px] text-slate-400 italic">No roles</span>
                            ) : (
                              <div className="flex flex-wrap gap-1.5 max-w-xs">
                                {rolesForUser.map((ur) => (
                                  <span
                                    key={ur.id}
                                    className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300"
                                  >
                                    <ShieldIcon className="h-3 w-3" />
                                    {ur.roleName || ur.roleKey}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                          </td>

                          <td className="py-3.5 pl-4 pr-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => openUserAccess(user)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300 transition"
                              >
                                <KeyIcon className="h-3.5 w-3.5" />
                                <span>Roles & Access</span>
                              </button>

                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                title={user.status === "ACTIVE" ? "Deactivate User" : "Activate User"}
                              >
                                <span className="text-xs font-bold">
                                  {user.status === "ACTIVE" ? "⏸" : "▶"}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
         * Tab 2: Roles & RBAC Matrix View
         * =================================================================== */}
        {activeTab === "roles" && (
          <div>
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                  <ShieldIcon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No roles defined</h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm">
                  Create roles scoped to this tenant partition to control access privileges.
                </p>
                <button
                  onClick={() => setCreateRoleModalOpen(true)}
                  className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
                >
                  Create Role
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((role) => {
                  const isSystem = Boolean(role.system || role.isSystem);

                  return (
                    <div
                      key={role.id}
                      className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 transition-all"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                              <ShieldIcon className="h-4 w-4" />
                            </span>
                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {role.name}
                              </h3>
                              <code className="text-[10px] font-mono text-slate-400">
                                {role.roleKey}
                              </code>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                              isSystem
                                ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-400"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800 dark:text-emerald-400"
                            }`}
                          >
                            {isSystem ? "System" : "Custom"}
                          </span>
                        </div>

                        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 min-h-[36px] line-clamp-2">
                          {role.description || "No description provided for this security role."}
                        </p>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                          {isSystem ? (
                            <>
                              <LockClosedIcon className="h-3.5 w-3.5 text-amber-500" />
                              <span>Protected</span>
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Configurable</span>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() => openRolePermissions(role)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900 transition"
                        >
                          <KeyIcon className="h-3.5 w-3.5" />
                          <span>Configure Permissions</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
         * Tab 3: Permissions Directory View
         * =================================================================== */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            {Object.keys(permissionsByModule).map((moduleKey) => {
              const perms = permissionsByModule[moduleKey];

              return (
                <div
                  key={moduleKey}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-3.5 flex items-center justify-between dark:border-slate-800 dark:bg-slate-950/40">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                        <KeyIcon className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
                        Module: {moduleKey}
                      </h3>
                    </div>
                    <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {perms.length} Permissions
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {perms.map((p) => (
                      <div
                        key={p.id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {p.name}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {p.actionKey}
                            </span>
                          </div>
                          <code className="text-[11px] font-mono text-slate-400">
                            {p.permissionKey}
                          </code>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {p.description || "System policy capability"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===================================================================
         * Modal: Create User
         * =================================================================== */}
        {createUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <UserIcon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Create New Enterprise User
                  </h3>
                </div>
                <button
                  onClick={() => setCreateUserModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. john.doe"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="john.doe@company.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 8 characters"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoGrantTenant"
                    checked={formAutoGrantTenant}
                    onChange={(e) => setFormAutoGrantTenant(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="autoGrantTenant" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                    Grant active access to tenant <strong className="text-slate-900 dark:text-white">{activeTenantObj?.name}</strong>
                  </label>
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateUserModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
         * Modal: Create Role
         * =================================================================== */}
        {createRoleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <ShieldIcon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Create Tenant Role
                  </h3>
                </div>
                <button
                  onClick={() => setCreateRoleModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-400">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateRole} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Role Key (lowercase alphanumeric, underscores) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. billing_supervisor"
                    value={formRoleKey}
                    onChange={(e) => setFormRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "_"))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-mono text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Billing Supervisor"
                    value={formRoleName}
                    onChange={(e) => setFormRoleName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe role responsibilities and privileges..."
                    value={formRoleDesc}
                    onChange={(e) => setFormRoleDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateRoleModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {submitting ? "Creating..." : "Create Role"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
         * Modal: Bulk Import Users
         * =================================================================== */}
        {importUsersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <UploadIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Bulk Import Users
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      Import multiple user accounts from CSV into tenant {activeTenantObj?.name}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setImportUsersModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadFreshUserSample}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-300 transition"
                    >
                      ✨ Load Fresh Sample
                    </button>
                    <button
                      onClick={downloadUserTemplate}
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" />
                      Template
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setUserCsvText("");
                      setParsedUsers([]);
                      setImportResult(null);
                    }}
                    type="button"
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear Text
                  </button>
                </div>

                {/* File Upload / Paste Area */}
                <div>
                  <textarea
                    rows={4}
                    placeholder="Paste CSV text here, e.g.:
sarah.connor,sarah.connor@maxerp.internal,TempPass123!,security_test_manager
alex.murphy,alex.murphy@maxerp.internal,TempPass123!,security_test_manager"
                    value={userCsvText}
                    onChange={(e) => {
                      setUserCsvText(e.target.value);
                      parseUserCsv(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    ref={userFileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setUserCsvText(content);
                          parseUserCsv(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => userFileInputRef.current?.click()}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Upload CSV File
                  </button>
                  <span className="text-xs text-slate-400">
                    {parsedUsers.length} rows parsed ({parsedUsers.filter((r) => r.valid).length} valid)
                  </span>
                </div>

                {/* Preview Table */}
                {parsedUsers.length > 0 && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 dark:bg-slate-800">
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Username</th>
                          <th className="p-2.5">Email</th>
                          <th className="p-2.5">Role Key</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedUsers.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="dark:bg-slate-900">
                            <td className="p-2.5">
                              {row.valid ? (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  Valid
                                </span>
                              ) : row.error?.toLowerCase().includes("already") || row.error?.toLowerCase().includes("registered") ? (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-400" title={row.error}>
                                  Already Exists
                                </span>
                              ) : (
                                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-400" title={row.error}>
                                  Invalid
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold font-mono text-slate-900 dark:text-white">{row.username}</span>
                              {row.error && (
                                <div className="text-[10px] text-rose-500 font-medium leading-tight mt-0.5">
                                  {row.error}
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.email}</td>
                            <td className="p-2.5 font-mono text-slate-400">{row.roleKey || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedUsers.length > 10 && (
                      <div className="p-2 text-center text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-850">
                        + {parsedUsers.length - 10} more rows
                      </div>
                    )}
                  </div>
                )}

                {importResult && (
                  <div className={`rounded-xl p-3 text-xs font-semibold whitespace-pre-line ${
                    importResult.includes("failed") || importResult.includes("error")
                      ? "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300"
                  }`}>
                    {importResult}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImportUsersModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importExecuting || parsedUsers.filter((r) => r.valid).length === 0}
                  onClick={executeUserImport}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {importExecuting ? "Importing Users..." : `Import ${parsedUsers.filter((r) => r.valid).length} Users`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
         * Modal: Bulk Import Roles
         * =================================================================== */}
        {importRolesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <UploadIcon className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Bulk Import Roles
                    </h3>
                    <div className="text-[10px] text-slate-400">
                      Import role definitions and assign initial permissions
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setImportRolesModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadFreshRoleSample}
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 dark:bg-indigo-950/60 dark:border-indigo-900 dark:text-indigo-300 transition"
                    >
                      ✨ Load Fresh Sample
                    </button>
                    <button
                      onClick={downloadRoleTemplate}
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      <DownloadIcon className="h-3.5 w-3.5" />
                      Template
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setRoleCsvText("");
                      setParsedRoles([]);
                      setImportResult(null);
                    }}
                    type="button"
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear Text
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder="Paste CSV text here, e.g.:
compliance_auditor,Compliance & Security Auditor,Audits security role assignments,SECURITY.USER_ROLE_ASSIGN|SECURITY.ACCESS_MANAGE
access_coordinator,Tenant Access Coordinator,Manages user role assignments,SECURITY.USER_ROLE_ASSIGN"
                  value={roleCsvText}
                  onChange={(e) => {
                    setRoleCsvText(e.target.value);
                    parseRoleCsv(e.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 font-mono text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    ref={roleFileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const content = event.target?.result as string;
                          setRoleCsvText(content);
                          parseRoleCsv(content);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => roleFileInputRef.current?.click()}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Upload CSV File
                  </button>
                  <span className="text-xs text-slate-400">
                    {parsedRoles.length} roles parsed ({parsedRoles.filter((r) => r.valid).length} valid)
                  </span>
                </div>

                {parsedRoles.length > 0 && (
                  <div className="rounded-xl border border-slate-200 overflow-hidden dark:border-slate-800">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 dark:bg-slate-800">
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Role Key</th>
                          <th className="p-2.5">Name</th>
                          <th className="p-2.5">Permissions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedRoles.slice(0, 10).map((row, idx) => (
                          <tr key={idx} className="dark:bg-slate-900">
                            <td className="p-2.5">
                              {row.valid ? (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                                  Valid
                                </span>
                              ) : row.error?.toLowerCase().includes("already") ? (
                                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 dark:bg-amber-950 dark:text-amber-400" title={row.error}>
                                  Already Exists
                                </span>
                              ) : (
                                <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-400" title={row.error}>
                                  Invalid
                                </span>
                              )}
                            </td>
                            <td className="p-2.5">
                              <span className="font-bold font-mono text-slate-900 dark:text-white">{row.roleKey}</span>
                              {row.error && (
                                <div className="text-[10px] text-rose-500 font-medium leading-tight mt-0.5">
                                  {row.error}
                                </div>
                              )}
                            </td>
                            <td className="p-2.5 text-slate-800 dark:text-slate-200">{row.name}</td>
                            <td className="p-2.5 font-mono text-[10px] text-slate-400">{row.permissions || "None"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {importResult && (
                  <div className={`rounded-xl p-3 text-xs font-semibold whitespace-pre-line ${
                    importResult.includes("failed") || importResult.includes("error")
                      ? "bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-900 dark:text-rose-300"
                      : "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900 dark:text-emerald-300"
                  }`}>
                    {importResult}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setImportRolesModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importExecuting || parsedRoles.filter((r) => r.valid).length === 0}
                  onClick={executeRoleImport}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {importExecuting ? "Importing Roles..." : `Import ${parsedRoles.filter((r) => r.valid).length} Roles`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
         * Drawer: Role Permissions Assignment
         * =================================================================== */}
        {rolePermissionsDrawerOpen && selectedRoleForPerms && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl border-l border-slate-200 dark:bg-slate-900 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <ShieldIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedRoleForPerms.name}
                  </h3>
                  <code className="text-[10px] font-mono text-slate-400">
                    {selectedRoleForPerms.roleKey}
                  </code>
                </div>
              </div>
              <button
                onClick={() => setRolePermissionsDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* System Role Protection Banner */}
              {Boolean(selectedRoleForPerms.system || selectedRoleForPerms.isSystem) ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/40">
                  <div className="flex items-start gap-2.5">
                    <LockClosedIcon className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                        Protected System Role
                      </h4>
                      <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                        Default system roles have immutable permissions to ensure baseline platform security. To customize permission policies, create a custom role.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900 dark:bg-blue-950/40">
                  <div className="flex items-start gap-2.5">
                    <KeyIcon className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        Custom Role Permissions Matrix
                      </h4>
                      <p className="mt-0.5 text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                        Toggle permissions below to assign or revoke capabilities for this role. Updates take effect immediately in the database.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Permissions List */}
              <div className="space-y-2.5">
                {rolePermsLoading ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : (
                  permissions.map((perm) => {
                    const isAssigned = rolePermissions.some((rp) => rp.permissionId === perm.id);
                    const isSystem = Boolean(selectedRoleForPerms.system || selectedRoleForPerms.isSystem);

                    return (
                      <div
                        key={perm.id}
                        onClick={() => {
                          if (!isSystem) handleTogglePermission(perm, isAssigned);
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                          isSystem ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
                        } ${
                          isAssigned
                            ? "border-indigo-300 bg-indigo-50/70 dark:border-indigo-800 dark:bg-indigo-950/40"
                            : "border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="space-y-0.5 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {perm.name}
                            </span>
                            <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {perm.moduleKey}
                            </span>
                          </div>
                          <code className="text-[10px] font-mono text-slate-400">
                            {perm.permissionKey}
                          </code>
                        </div>

                        <input
                          type="checkbox"
                          checked={isAssigned}
                          disabled={isSystem}
                          readOnly
                          className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setRolePermissionsDrawerOpen(false)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
         * Drawer: User Roles & Multi-Tenant Access
         * =================================================================== */}
        {userAccessDrawerOpen && selectedUserForAccess && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl border-l border-slate-200 dark:bg-slate-900 dark:border-slate-800 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${getAvatarGradient(
                    selectedUserForAccess.username
                  )} text-xs font-black text-white`}
                >
                  {getInitials(selectedUserForAccess.username)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Access & Roles: {selectedUserForAccess.username}
                  </h3>
                  <div className="text-[11px] text-slate-400">{selectedUserForAccess.email}</div>
                </div>
              </div>
              <button
                onClick={() => setUserAccessDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tenant Access Status & Grant */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-850">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Tenant Access Partition
                  </h4>
                  {userTenantAccess.some((ta) => ta.tenantId === selectedTenantId) ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active Access
                    </span>
                  ) : (
                    <button
                      onClick={handleGrantTenantAccess}
                      disabled={submitting}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-blue-700 transition"
                    >
                      <PlusIcon className="h-3 w-3" />
                      Grant Access to {activeTenantObj?.name}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Users require an active tenant grant before receiving role-based privileges within {activeTenantObj?.name}.
                </p>
              </div>

              {/* Assigned Roles List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Assigned Roles ({userRoles.length})
                </h4>

                {userAccessLoading ? (
                  <div className="flex h-20 items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : userRoles.length === 0 ? (
                  <div className="text-xs text-slate-400 italic p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
                    No roles currently assigned in this tenant partition.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {userRoles.map((ur) => {
                      const orgMatch = organizations.find((o) => o.id === ur.organizationId);
                      return (
                        <div
                          key={ur.id}
                          className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs"
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <span>{ur.roleName || ur.roleKey}</span>
                              <span className="text-[10px] font-mono text-slate-400">({ur.roleKey})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                              <BuildingIcon className="h-3 w-3" />
                              <span>
                                Scope: {orgMatch ? `${orgMatch.name} (${orgMatch.organizationType})` : "Tenant-Wide (All Orgs)"}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeRole(ur.roleId, ur.organizationId)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 hover:text-rose-700 dark:hover:bg-rose-950/40 transition"
                            title="Revoke Role"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Assign New Role Form */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-850">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <ShieldIcon className="h-4 w-4 text-blue-600" />
                  <span>Assign Role to User</span>
                </h4>
                <form onSubmit={handleAssignRoleToUser} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Select Role *
                    </label>
                    <select
                      value={selectedRoleIdToAssign}
                      onChange={(e) => setSelectedRoleIdToAssign(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option value="">Choose a role...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.roleKey})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Organization Scope (Optional)
                    </label>
                    <select
                      value={selectedOrgIdToAssign}
                      onChange={(e) => setSelectedOrgIdToAssign(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option value="">Tenant-Wide (No Organization restriction)</option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name} ({org.organizationType})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Optionally restrict this role to a specific organization node in the hierarchy.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !selectedRoleIdToAssign}
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-xs"
                  >
                    {submitting ? "Assigning Role..." : "Assign Role"}
                  </button>
                </form>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setUserAccessDrawerOpen(false)}
                className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}
