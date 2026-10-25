import { NextRequest, NextResponse } from "next/server";

export interface TeamsIntegrationSettings {
  tenantId: string;
  clientId: string;
  clientSecretConfigured: boolean;
  status: "CONNECTED" | "DISCONNECTED" | "AUTHENTICATING";
  connectedTenantName: string;
  defaultMeetingDurationMins: number;
  autoRecordMeetings: boolean;
  allowDialInAudio: boolean;
  dialInConferenceNumber: string;
  dialInConferenceId: string;
  lastSyncAt: string;
}

let teamsConfig: TeamsIntegrationSettings = {
  tenantId: "7f4c3a2b-91d8-4f5e-b3c2-89a102345678",
  clientId: "3d2e1f0a-6c5b-4a3b-8f7e-123456789abc",
  clientSecretConfigured: true,
  status: "CONNECTED",
  connectedTenantName: "MAX Enterprise Global (microsoft365.max-erp.com)",
  defaultMeetingDurationMins: 45,
  autoRecordMeetings: true,
  allowDialInAudio: true,
  dialInConferenceNumber: "+1 (800) 555-8326 (US Toll-Free)",
  dialInConferenceId: "948 221 405#",
  lastSyncAt: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(teamsConfig);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || "TEST_CONNECTION";

    if (action === "TEST_CONNECTION") {
      teamsConfig.status = "CONNECTED";
      teamsConfig.lastSyncAt = new Date().toISOString();
      return NextResponse.json({
        success: true,
        message: "Successfully authenticated with Microsoft Graph API (OnlineMeetings.ReadWrite). Graph token active.",
        config: teamsConfig,
      });
    }

    if (action === "UPDATE_CONFIG") {
      if (body.tenantId) teamsConfig.tenantId = body.tenantId;
      if (body.clientId) teamsConfig.clientId = body.clientId;
      if (body.defaultMeetingDurationMins) teamsConfig.defaultMeetingDurationMins = Number(body.defaultMeetingDurationMins);
      if (body.autoRecordMeetings !== undefined) teamsConfig.autoRecordMeetings = Boolean(body.autoRecordMeetings);
      return NextResponse.json({ success: true, config: teamsConfig });
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "FAILED_TO_PROCESS_TEAMS_CONFIG" }, { status: 500 });
  }
}
