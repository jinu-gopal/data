"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import MaxShell from "@/components/max/MaxShell";

/* ============================================================================
 * Types & Domain Constants
 * ========================================================================== */

export type OrganizationType =
  | "COMPANY"
  | "DIVISION"
  | "BRANCH"
  | "DEPARTMENT"
  | "UNIT"
  | "LOCATION";

export type OrganizationStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface OrganizationNode {
  id: string;
  tenantId: string;
  tenantKey?: string;
  parentOrganizationId: string | null;
  parentOrganizationName: string | null;
  organizationKey: string;
  name: string;
  organizationType: OrganizationType;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TenantInfo {
  id: string;
  tenantKey: string;
  name: string;
  status: string;
}

const TYPE_CONFIG: Record<
  OrganizationType,
  { label: string; badgeClass: string; iconBg: string; textClass: string; description: string }
> = {
  COMPANY: {
    label: "Legal Entity / Company",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
    iconBg: "bg-emerald-500 text-white",
    textClass: "text-emerald-600 dark:text-emerald-400",
    description: "Statutory legal entity, parent corporation or holding company",
  },
  DIVISION: {
    label: "Division",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800",
    iconBg: "bg-indigo-500 text-white",
    textClass: "text-indigo-600 dark:text-indigo-400",
    description: "Major commercial or operating division",
  },
  BRANCH: {
    label: "Branch",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800",
    iconBg: "bg-cyan-500 text-white",
    textClass: "text-cyan-600 dark:text-cyan-400",
    description: "Regional office, satellite subsidiary or branch territory",
  },
  DEPARTMENT: {
    label: "Department",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
    iconBg: "bg-amber-500 text-white",
    textClass: "text-amber-600 dark:text-amber-400",
    description: "Functional operating group (e.g. Finance, Supply Chain, IT)",
  },
  UNIT: {
    label: "Operational Unit",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
    iconBg: "bg-purple-500 text-white",
    textClass: "text-purple-600 dark:text-purple-400",
    description: "Operational team, cost center or service unit",
  },
  LOCATION: {
    label: "Facility / Location",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
    iconBg: "bg-rose-500 text-white",
    textClass: "text-rose-600 dark:text-rose-400",
    description: "Physical hospital site, plant, warehouse, or clinical clinic",
  },
};

/* ============================================================================
 * SVG Icons
 * ========================================================================== */

function BuildingIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

/* ============================================================================
 * Helper: Find all descendants of an organization
 * ========================================================================== */

function getAllDescendantIds(targetId: string, allOrgs: OrganizationNode[]): Set<string> {
  const descendants = new Set<string>();
  const queue = [targetId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const directChildren = allOrgs.filter((o) => o.parentOrganizationId === currentId);
    for (const child of directChildren) {
      if (!descendants.has(child.id)) {
        descendants.add(child.id);
        queue.push(child.id);
      }
    }
  }

  return descendants;
}

/* ============================================================================
 * Main Page Component
 * ========================================================================== */

export default function OrganizationHierarchyPage() {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [organizations, setOrganizations] = useState<OrganizationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // Modals & Drawers
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationNode | null>(null);
  const [selectedOrgForDetail, setSelectedOrgForDetail] = useState<OrganizationNode | null>(null);

  // Form State
  const [formKey, setFormKey] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<OrganizationType>("DEPARTMENT");
  const [formParentId, setFormParentId] = useState<string>("");
  const [formStatus, setFormStatus] = useState<OrganizationStatus>("ACTIVE");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Initial Data Fetch
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch tenants
      const tenantsRes = await fetch("/api/tenants");
      if (!tenantsRes.ok) {
        throw new Error("Failed to load enterprise tenants.");
      }
      const tenantsData: TenantInfo[] = await tenantsRes.json();
      setTenants(tenantsData);

      // Default to first tenant or security-test
      const activeTenant =
        tenantsData.find((t) => t.tenantKey === "security-test") ||
        tenantsData[0];

      if (!activeTenant) {
        throw new Error("No active tenant found.");
      }

      const tenantId = selectedTenantId || activeTenant.id;
      if (!selectedTenantId) {
        setSelectedTenantId(tenantId);
      }

      // 2. Fetch organizations for active tenant
      const orgsRes = await fetch(`/api/tenants/${tenantId}/organizations`);
      if (!orgsRes.ok) {
        throw new Error("Failed to load organizations.");
      }
      const orgsData: OrganizationNode[] = await orgsRes.json();
      setOrganizations(orgsData);
    } catch (err) {
      console.error("[Organization Load Error]", err);
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
      setError(null);
      const orgsRes = await fetch(`/api/tenants/${newTenantId}/organizations`);
      if (!orgsRes.ok) throw new Error("Failed to load organizations for selected tenant.");
      const orgsData: OrganizationNode[] = await orgsRes.json();
      setOrganizations(orgsData);
      setSelectedOrgForDetail(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch tenant.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Collapse
  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Expand / Collapse All
  const handleExpandAll = () => setCollapsedNodes(new Set());
  const handleCollapseAll = () => {
    const parentIds = new Set(
      organizations
        .filter((o) => organizations.some((child) => child.parentOrganizationId === o.id))
        .map((o) => o.id)
    );
    setCollapsedNodes(parentIds);
  };

  // Open Create Modal
  const openCreateModal = (parentId: string | null = null) => {
    setDefaultParentId(parentId);
    setFormKey("");
    setFormName("");
    setFormType(parentId ? "DEPARTMENT" : "COMPANY");
    setFormParentId(parentId || "");
    setFormError(null);
    setCreateModalOpen(true);
  };

  // Auto-slugify key on Name input if key untouched
  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingOrg) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setFormKey(slug);
    }
  };

  // Submit Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKey.trim() || !formName.trim() || !formType) {
      setFormError("Organization key, name, and type are required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await fetch(`/api/tenants/${selectedTenantId}/organizations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationKey: formKey.trim(),
          name: formName.trim(),
          organizationType: formType,
          parentOrganizationId: formParentId.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create organization node.");
      }

      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (org: OrganizationNode) => {
    setEditingOrg(org);
    setFormName(org.name);
    setFormStatus(org.status);
    setFormType(org.organizationType);
    setFormParentId(org.parentOrganizationId || "");
    setFormError(null);
    setEditModalOpen(true);
  };

  // Submit Edit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg || !formName.trim()) {
      setFormError("Name is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);

      const res = await fetch(
        `/api/tenants/${selectedTenantId}/organizations/${editingOrg.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName.trim(),
            status: formStatus,
            organizationType: formType,
            parentOrganizationId: formParentId.trim() || null,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update organization node.");
      }

      setEditModalOpen(false);
      setEditingOrg(null);
      await loadData();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredOrgs = useMemo(() => {
    return organizations.filter((org) => {
      const matchSearch =
        searchQuery.trim() === "" ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.organizationKey.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = typeFilter === "ALL" || org.organizationType === typeFilter;
      const matchStatus = statusFilter === "ALL" || org.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [organizations, searchQuery, typeFilter, statusFilter]);

  // Tree Structure: Build recursive nodes
  interface TreeNode extends OrganizationNode {
    children: TreeNode[];
    depth: number;
  }

  const orgTree = useMemo(() => {
    const map = new Map<string, TreeNode>();
    organizations.forEach((o) => {
      map.set(o.id, { ...o, children: [], depth: 0 });
    });

    const roots: TreeNode[] = [];

    map.forEach((node) => {
      if (node.parentOrganizationId && map.has(node.parentOrganizationId)) {
        const parent = map.get(node.parentOrganizationId)!;
        node.depth = parent.depth + 1;
        parent.children.push(node);
      } else {
        node.depth = 0;
        roots.push(node);
      }
    });

    // Sort roots & children by name
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach((n) => sortNodes(n.children));
    };

    sortNodes(roots);
    return roots;
  }, [organizations]);

  // Statistics
  const stats = useMemo(() => {
    const total = organizations.length;
    const companies = organizations.filter((o) => o.organizationType === "COMPANY").length;
    const divisions = organizations.filter((o) => o.organizationType === "DIVISION" || o.organizationType === "BRANCH").length;
    const departments = organizations.filter((o) => o.organizationType === "DEPARTMENT" || o.organizationType === "UNIT").length;
    const activeCount = organizations.filter((o) => o.status === "ACTIVE").length;

    // Max depth calculation
    let maxDepth = 0;
    const calculateDepth = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        if (node.depth > maxDepth) maxDepth = node.depth;
        if (node.children.length > 0) calculateDepth(node.children);
      }
    };
    calculateDepth(orgTree);

    return { total, companies, divisions, departments, activeCount, maxDepth: total > 0 ? maxDepth + 1 : 0 };
  }, [organizations, orgTree]);

  // Edit Modal: Prevent setting self or descendants as parent
  const disabledParentIds = useMemo(() => {
    if (!editingOrg) return new Set<string>();
    const descendants = getAllDescendantIds(editingOrg.id, organizations);
    descendants.add(editingOrg.id); // Add self
    return descendants;
  }, [editingOrg, organizations]);

  const currentTenant = tenants.find((t) => t.id === selectedTenantId);

  return (
    <MaxShell>
      <div className="space-y-6">
        {/* ===================================================================
         * 1. Breadcrumbs & Header
         * =================================================================== */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
          <div>
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Link href="/configuration" className="hover:text-blue-600 transition">
                Configuration
              </Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white">Organization & Company Structure</span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              Organization Structure
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Multi-Entity
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Govern your enterprise operating model: statutory legal entities, operating divisions, regional branches, and functional departments with full hierarchy inheritance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openCreateModal(null)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 hover:shadow transition active:scale-95"
            >
              <PlusIcon />
              New Organization Node
            </button>
          </div>
        </div>

        {/* ===================================================================
         * 2. Tenant Context Bar
         * =================================================================== */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 font-bold">
              <BuildingIcon />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Tenant Partition
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {currentTenant ? currentTenant.name : "Loading Tenant..."}
                <code className="text-[11px] font-mono font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {currentTenant?.tenantKey}
                </code>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto">
            {tenants.length > 1 && (
              <select
                value={selectedTenantId}
                onChange={(e) => handleTenantChange(e.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.tenantKey})
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={() => loadData()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 transition"
              title="Refresh Data"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ===================================================================
         * 3. KPI Summary Cards
         * =================================================================== */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Nodes</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {stats.total}
            </div>
            <div className="mt-1 text-[11px] text-emerald-600 font-medium">
              {stats.activeCount} Active in Tenant
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Hierarchy Depth</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {stats.maxDepth} <span className="text-xs font-normal text-slate-500">Levels</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Root to Leaf Nodes</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Legal Entities</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.companies}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Statutory Parent Companies</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Divisions & Branches</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {stats.divisions}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Operating Segments</div>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Departments & Units</div>
            <div className="mt-1 text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {stats.departments}
            </div>
            <div className="mt-1 text-[11px] text-slate-500">Functional Workgroups</div>
          </div>
        </div>

        {/* ===================================================================
         * 4. Error Banner
         * =================================================================== */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="font-bold underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ===================================================================
         * 5. Filters, Search & View Switcher
         * =================================================================== */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl bg-white p-3 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search organizations by name or key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Types</option>
              <option value="COMPANY">Company / Legal Entity</option>
              <option value="DIVISION">Division</option>
              <option value="BRANCH">Branch</option>
              <option value="DEPARTMENT">Department</option>
              <option value="UNIT">Unit</option>
              <option value="LOCATION">Location / Site</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {viewMode === "tree" && (
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-2 dark:border-slate-800">
                <button
                  onClick={handleExpandAll}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAll}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Collapse All
                </button>
              </div>
            )}

            <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                onClick={() => setViewMode("tree")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "tree"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Tree View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
         * 6. Content Section (Tree or Table)
         * =================================================================== */}
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:bg-slate-900 dark:border-slate-800">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <div className="mt-3 text-xs font-medium text-slate-500">Loading organization hierarchy...</div>
          </div>
        ) : organizations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:bg-slate-900 dark:border-slate-800">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <BuildingIcon />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              No Organizations Configured
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
              Start building your enterprise company hierarchy by creating a top-level legal entity or company node.
            </p>
            <button
              onClick={() => openCreateModal(null)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <PlusIcon />
              Create Root Legal Entity
            </button>
          </div>
        ) : viewMode === "tree" ? (
          /* ===============================================================
           * TREE VIEW
           * =============================================================== */
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <div className="space-y-3">
              {orgTree.map((rootNode) => (
                <TreeItem
                  key={rootNode.id}
                  node={rootNode}
                  collapsedNodes={collapsedNodes}
                  toggleCollapse={toggleCollapse}
                  onAddChild={(parentId) => openCreateModal(parentId)}
                  onEdit={(org) => openEditModal(org)}
                  onSelectDetail={(org) => setSelectedOrgForDetail(org)}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ===============================================================
           * TABLE VIEW
           * =============================================================== */
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/60 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Organization Key</th>
                  <th className="px-5 py-3.5">Name</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Parent Node</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate-500">
                      No organizations matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  filteredOrgs.map((org) => {
                    const cfg = TYPE_CONFIG[org.organizationType] || TYPE_CONFIG.UNIT;
                    return (
                      <tr key={org.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3 font-mono font-medium text-slate-900 dark:text-white">
                          {org.organizationKey}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                          {org.name}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${cfg.badgeClass}`}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                          {org.parentOrganizationName ? (
                            <span className="font-medium">{org.parentOrganizationName}</span>
                          ) : (
                            <span className="text-slate-400 italic">None (Root)</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              org.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            }`}
                          >
                            {org.status}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openCreateModal(org.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                              title="Add Child Node"
                            >
                              <PlusIcon />
                            </button>
                            <button
                              onClick={() => openEditModal(org)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
                              title="Edit Node"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={() => setSelectedOrgForDetail(org)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
                              title="View Details"
                            >
                              <InfoIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===================================================================
         * 7. Detail Slide-Over Drawer
         * =================================================================== */}
        {selectedOrgForDetail && (
          <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl border-l border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  <BuildingIcon />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organization Details</h3>
              </div>
              <button
                onClick={() => setSelectedOrgForDetail(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Node Name</div>
                <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedOrgForDetail.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold border ${
                        TYPE_CONFIG[selectedOrgForDetail.organizationType]?.badgeClass
                      }`}
                    >
                      {TYPE_CONFIG[selectedOrgForDetail.organizationType]?.label}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                        selectedOrgForDetail.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {selectedOrgForDetail.status}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Organization Key</div>
                <div className="mt-1 font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                  {selectedOrgForDetail.organizationKey}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hierarchy Parent</div>
                <div className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                  {selectedOrgForDetail.parentOrganizationName ? (
                    <div className="flex items-center gap-2 font-medium">
                      <span>{selectedOrgForDetail.parentOrganizationName}</span>
                      <span className="text-[10px] text-slate-400">
                        ({selectedOrgForDetail.parentOrganizationId})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">None (Top-Level Root)</span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Direct Children</div>
                <div className="mt-2 space-y-1.5">
                  {organizations.filter((o) => o.parentOrganizationId === selectedOrgForDetail.id).length === 0 ? (
                    <div className="text-xs text-slate-400 italic">No sub-organizations configured</div>
                  ) : (
                    organizations
                      .filter((o) => o.parentOrganizationId === selectedOrgForDetail.id)
                      .map((child) => (
                        <div
                          key={child.id}
                          onClick={() => setSelectedOrgForDetail(child)}
                          className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-xs hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 cursor-pointer transition"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {child.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {child.organizationType}
                          </span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 dark:border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>Node UUID: {selectedOrgForDetail.id}</div>
                <div>Tenant ID: {selectedOrgForDetail.tenantId}</div>
                <div>Created: {new Date(selectedOrgForDetail.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(selectedOrgForDetail.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  const org = selectedOrgForDetail;
                  setSelectedOrgForDetail(null);
                  openEditModal(org);
                }}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              >
                Edit Node
              </button>
              <button
                onClick={() => {
                  const parentId = selectedOrgForDetail.id;
                  setSelectedOrgForDetail(null);
                  openCreateModal(parentId);
                }}
                className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              >
                + Add Child
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
         * 8. Create Organization Modal
         * =================================================================== */}
        {createModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Create Organization Node
                </h3>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
                {formError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Max Health Holdings or North America Division"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Key *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. max-health-holdings"
                    value={formKey}
                    onChange={(e) => setFormKey(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Unique identifier within tenant (lowercase, numbers, dashes).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as OrganizationType)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="COMPANY">COMPANY - Statutory Legal Entity / Holding Company</option>
                    <option value="DIVISION">DIVISION - Operating / Commercial Division</option>
                    <option value="BRANCH">BRANCH - Regional Office / Branch Subsidiary</option>
                    <option value="DEPARTMENT">DEPARTMENT - Functional Department</option>
                    <option value="UNIT">UNIT - Operating Unit / Cost Center</option>
                    <option value="LOCATION">LOCATION - Physical Hospital, Clinic or Warehouse</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Organization
                  </label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">(None - Top Level Legal Entity)</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.organizationType})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Leave blank to create a root organization.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {submitting ? "Creating..." : "Create Organization"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
         * 9. Edit Organization Modal
         * =================================================================== */}
        {editModalOpen && editingOrg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Edit Organization Node
                </h3>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
                {formError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-300">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Key (Immutable)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingOrg.organizationKey}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Organization Type *
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as OrganizationType)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option value="COMPANY">COMPANY</option>
                      <option value="DIVISION">DIVISION</option>
                      <option value="BRANCH">BRANCH</option>
                      <option value="DEPARTMENT">DEPARTMENT</option>
                      <option value="UNIT">UNIT</option>
                      <option value="LOCATION">LOCATION</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Status *
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as OrganizationStatus)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Parent Organization
                  </label>
                  <select
                    value={formParentId}
                    onChange={(e) => setFormParentId(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  >
                    <option value="">(None - Top Level Legal Entity)</option>
                    {organizations.map((org) => {
                      const isDisabled = disabledParentIds.has(org.id);
                      return (
                        <option key={org.id} value={org.id} disabled={isDisabled}>
                          {org.name} ({org.organizationType})
                          {org.id === editingOrg.id ? " - (Current Node)" : isDisabled ? " - (Descendant / Invalid)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="mt-1 text-[11px] text-slate-400">
                    Descendant nodes are disabled to prevent circular hierarchy loops.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MaxShell>
  );
}

/* ============================================================================
 * Sub-Component: Tree Item (Recursive)
 * ========================================================================== */

interface TreeItemProps {
  node: {
    id: string;
    name: string;
    organizationKey: string;
    organizationType: OrganizationType;
    status: OrganizationStatus;
    children: any[];
    depth: number;
    parentOrganizationId: string | null;
    parentOrganizationName: string | null;
    tenantId: string;
    createdAt: string;
    updatedAt: string;
  };
  collapsedNodes: Set<string>;
  toggleCollapse: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (org: any) => void;
  onSelectDetail: (org: any) => void;
  searchQuery: string;
}

function TreeItem({
  node,
  collapsedNodes,
  toggleCollapse,
  onAddChild,
  onEdit,
  onSelectDetail,
  searchQuery,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isCollapsed = collapsedNodes.has(node.id);
  const cfg = TYPE_CONFIG[node.organizationType] || TYPE_CONFIG.UNIT;

  const isHighlighted =
    searchQuery.trim() !== "" &&
    (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.organizationKey.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="relative">
      <div
        className={`group flex items-center justify-between rounded-xl border p-3 transition ${
          isHighlighted
            ? "border-blue-400 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-700"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800/60"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Collapse/Expand Toggle */}
          {hasChildren ? (
            <button
              onClick={() => toggleCollapse(node.id)}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              aria-label={isCollapsed ? "Expand children" : "Collapse children"}
            >
              <ChevronDownIcon open={!isCollapsed} />
            </button>
          ) : (
            <span className="h-6 w-6 flex items-center justify-center text-slate-300 dark:text-slate-600">
              •
            </span>
          )}

          {/* Type Icon Badge */}
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${cfg.iconBg}`}
          >
            {node.organizationType.substring(0, 2)}
          </span>

          {/* Node Names */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {node.name}
              </span>
              <span
                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-bold border ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                  node.status === "ACTIVE"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {node.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <code className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                {node.organizationKey}
              </code>
              {hasChildren && (
                <span className="text-[10px] font-semibold text-slate-400">
                  ({node.children.length} {node.children.length === 1 ? "child node" : "child nodes"})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100">
          <button
            onClick={() => onAddChild(node.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-blue-400 transition"
          >
            <PlusIcon />
            Add Child
          </button>
          <button
            onClick={() => onEdit(node)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
            title="Edit Organization"
          >
            <EditIcon />
          </button>
          <button
            onClick={() => onSelectDetail(node)}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white transition"
            title="View Details"
          >
            <InfoIcon />
          </button>
        </div>
      </div>

      {/* Child Nodes (Indented Tree) */}
      {hasChildren && !isCollapsed && (
        <div className="ml-6 pl-4 border-l-2 border-slate-200 dark:border-slate-800 space-y-2.5 mt-2.5">
          {node.children.map((child: any) => (
            <TreeItem
              key={child.id}
              node={child}
              collapsedNodes={collapsedNodes}
              toggleCollapse={toggleCollapse}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onSelectDetail={onSelectDetail}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
}
