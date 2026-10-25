import { NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  getAccessToken,
  handleProxyError,
  unauthorizedResponse,
} from "../../configuration/proxy-helper";

interface BusinessObjectItem {
  id: string;
  objectKey: string;
  name: string;
  description: string | null;
  status: string;
}

interface WorkflowInstanceItem {
  id: string;
  status: string;
  initiatedAt: string;
  completedAt: string | null;
}

interface PendingApprovalItem {
  instanceId: string;
  workflowId: string;
  workflowName: string;
  businessObjectId: string;
  recordId: string;
  stepId: string;
  stepName: string;
  stepOrder: number;
  initiatedByUsername: string;
  initiatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = await getAccessToken(request);
    if (!token) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId") || "cf1757d5-c535-4335-939c-24908aee0209";

    const authHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    // 1. Fetch Business Objects
    let businessObjects: BusinessObjectItem[] = [];
    try {
      const boRes = await fetch(buildBackendUrl("/api/v1/configuration/business-objects"), {
        headers: authHeaders,
        cache: "no-store",
      });
      if (boRes.ok) {
        businessObjects = await boRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch business objects for operations summary:", e);
    }

    // 2. Fetch Pending Approvals
    let pendingApprovals: PendingApprovalItem[] = [];
    try {
      const inboxRes = await fetch(
        buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/inbox/pending`),
        {
          headers: authHeaders,
          cache: "no-store",
        }
      );
      if (inboxRes.ok) {
        pendingApprovals = await inboxRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch pending inbox for operations summary:", e);
    }

    // 3. Fetch Workflow Instances
    let instances: WorkflowInstanceItem[] = [];
    try {
      const instRes = await fetch(
        buildBackendUrl(`/api/v1/tenants/${tenantId}/workflows/instances`),
        {
          headers: authHeaders,
          cache: "no-store",
        }
      );
      if (instRes.ok) {
        instances = await instRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch instances for operations summary:", e);
    }

    // 4. Fetch Record counts per business object (parallel)
    const objectRecordCounts: Record<string, number> = {};
    let totalRecordsCount = 0;

    await Promise.all(
      businessObjects.map(async (bo) => {
        try {
          const recRes = await fetch(
            buildBackendUrl(`/api/v1/configuration/business-objects/${bo.id}/records`),
            {
              headers: authHeaders,
              cache: "no-store",
            }
          );
          if (recRes.ok) {
            const records = await recRes.json();
            const count = Array.isArray(records) ? records.length : 0;
            objectRecordCounts[bo.id] = count;
            totalRecordsCount += count;
          }
        } catch {
          objectRecordCounts[bo.id] = 0;
        }
      })
    );

    const approvedCount = instances.filter((i) => i.status === "APPROVED").length;
    const rejectedCount = instances.filter((i) => i.status === "REJECTED").length;
    const pendingCount = instances.filter((i) => i.status === "PENDING").length;

    return NextResponse.json({
      tenantId,
      totalBusinessObjects: businessObjects.length,
      totalRecordsCount,
      pendingApprovalsCount: pendingApprovals.length,
      instancesCount: instances.length,
      approvedInstancesCount: approvedCount,
      rejectedInstancesCount: rejectedCount,
      pendingInstancesCount: pendingCount,
      businessObjects: businessObjects.map((bo) => ({
        ...bo,
        recordCount: objectRecordCounts[bo.id] || 0,
      })),
      pendingApprovals,
      recentInstances: instances.slice(0, 10),
    });
  } catch (error) {
    return handleProxyError(error, "Operations summary GET");
  }
}
