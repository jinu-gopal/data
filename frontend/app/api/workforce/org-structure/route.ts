import { NextRequest, NextResponse } from "next/server";
import { ecCoreStore } from "@/lib/ec-core-store";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // optional filter: LEGAL_ENTITY, BUSINESS_UNIT, DIVISION, etc.

    const allEntities = ecCoreStore.getOrgEntities();
    const filtered = type ? allEntities.filter((e) => e.type === type) : allEntities;

    // Structured multi-tier hierarchy breakdown
    const legalEntities = allEntities.filter((e) => e.type === "LEGAL_ENTITY");
    const businessUnits = allEntities.filter((e) => e.type === "BUSINESS_UNIT");
    const divisions = allEntities.filter((e) => e.type === "DIVISION");
    const departments = allEntities.filter((e) => e.type === "DEPARTMENT");
    const locations = allEntities.filter((e) => e.type === "LOCATION");
    const costCenters = allEntities.filter((e) => e.type === "COST_CENTER");

    const totalHeadcount = legalEntities.reduce((sum, e) => sum + e.headcount, 0);
    const totalBudgetUsd = legalEntities.reduce((sum, e) => sum + (e.budgetUsd || 0), 0);

    return NextResponse.json({
      entities: filtered,
      structure: {
        legalEntities,
        businessUnits,
        divisions,
        departments,
        locations,
        costCenters,
      },
      metrics: {
        totalLegalEntities: legalEntities.length,
        totalBusinessUnits: businessUnits.length,
        totalDivisions: divisions.length,
        totalDepartments: departments.length,
        totalLocations: locations.length,
        totalCostCenters: costCenters.length,
        totalHeadcount,
        totalBudgetUsd,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_FETCH_ORG_STRUCTURE", message: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.type) {
      return NextResponse.json({ error: "BAD_REQUEST", message: "Name and Type are required." }, { status: 400 });
    }

    const created = ecCoreStore.createOrgEntity(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "FAILED_TO_CREATE_ORG_ENTITY", message: err.message }, { status: 500 });
  }
}
