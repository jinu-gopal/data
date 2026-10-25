import { NextRequest, NextResponse } from "next/server";

export interface JobPostingChannel {
  id: string;
  requisitionId: string;
  requisitionTitle: string;
  channel: "CAREERS_PORTAL" | "LINKEDIN" | "INDEED" | "GLASSDOOR" | "INTERNAL_BOARD";
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  publishedAt: string;
  expiresAt: string;
  viewsCount: number;
  clicksCount: number;
  applicationsCount: number;
  costUsd: number;
  externalUrl?: string;
}

let jobPostings: JobPostingChannel[] = [
  {
    id: "post-101",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    channel: "CAREERS_PORTAL",
    status: "ACTIVE",
    publishedAt: "2026-10-02T10:00:00Z",
    expiresAt: "2026-11-30T23:59:59Z",
    viewsCount: 1420,
    clicksCount: 380,
    applicationsCount: 14,
    costUsd: 0,
    externalUrl: "http://localhost:3000/careers",
  },
  {
    id: "post-102",
    requisitionId: "req-101",
    requisitionTitle: "Senior Full-Stack Cloud Architect",
    channel: "LINKEDIN",
    status: "ACTIVE",
    publishedAt: "2026-10-03T09:00:00Z",
    expiresAt: "2026-11-03T23:59:59Z",
    viewsCount: 3840,
    clicksCount: 920,
    applicationsCount: 42,
    costUsd: 495,
    externalUrl: "https://linkedin.com/jobs/view/max-erp-cloud-arch",
  },
  {
    id: "post-103",
    requisitionId: "req-104",
    requisitionTitle: "Enterprise Global Solutions Executive",
    channel: "LINKEDIN",
    status: "ACTIVE",
    publishedAt: "2026-10-06T12:00:00Z",
    expiresAt: "2026-11-06T23:59:59Z",
    viewsCount: 2910,
    clicksCount: 640,
    applicationsCount: 28,
    costUsd: 495,
    externalUrl: "https://linkedin.com/jobs/view/max-erp-sales-exec",
  },
  {
    id: "post-104",
    requisitionId: "req-104",
    requisitionTitle: "Enterprise Global Solutions Executive",
    channel: "INDEED",
    status: "ACTIVE",
    publishedAt: "2026-10-07T08:30:00Z",
    expiresAt: "2026-11-07T23:59:59Z",
    viewsCount: 1850,
    clicksCount: 410,
    applicationsCount: 19,
    costUsd: 250,
  },
  {
    id: "post-105",
    requisitionId: "req-102",
    requisitionTitle: "Plant Reliability & Safety Lead",
    channel: "INTERNAL_BOARD",
    status: "ACTIVE",
    publishedAt: "2026-10-04T10:00:00Z",
    expiresAt: "2026-12-31T23:59:59Z",
    viewsCount: 410,
    clicksCount: 120,
    applicationsCount: 6,
    costUsd: 0,
  },
];

export async function GET() {
  return NextResponse.json(jobPostings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPosting: JobPostingChannel = {
      id: "post-" + Date.now().toString().slice(-6),
      requisitionId: body.requisitionId,
      requisitionTitle: body.requisitionTitle,
      channel: body.channel || "LINKEDIN",
      status: "ACTIVE",
      publishedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      viewsCount: 0,
      clicksCount: 0,
      applicationsCount: 0,
      costUsd: body.costUsd || 0,
      externalUrl: body.externalUrl || undefined,
    };
    jobPostings.unshift(newPosting);
    return NextResponse.json(newPosting, { status: 201 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_CREATE_POSTING" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const post = jobPostings.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (status) post.status = status;
    return NextResponse.json(post);
  } catch {
    return NextResponse.json({ error: "FAILED_TO_UPDATE_POSTING" }, { status: 400 });
  }
}
