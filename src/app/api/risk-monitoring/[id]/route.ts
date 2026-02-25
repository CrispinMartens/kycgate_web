import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { riskAlerts, monitoringRules } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const alert = riskAlerts.find((a) => a.id === id);
  if (alert) return success(alert);

  const rule = monitoringRules.find((r) => r.id === id);
  if (rule) return success(rule);

  return error("Resource not found", 404);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();

    const alertIndex = riskAlerts.findIndex((a) => a.id === id);
    if (alertIndex !== -1) {
      riskAlerts[alertIndex] = { ...riskAlerts[alertIndex], ...body, id, updatedAt: now() };
      return success(riskAlerts[alertIndex]);
    }

    const ruleIndex = monitoringRules.findIndex((r) => r.id === id);
    if (ruleIndex !== -1) {
      monitoringRules[ruleIndex] = { ...monitoringRules[ruleIndex], ...body, id, updatedAt: now() };
      return success(monitoringRules[ruleIndex]);
    }

    return error("Resource not found", 404);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const ruleIndex = monitoringRules.findIndex((r) => r.id === id);
  if (ruleIndex !== -1) {
    const [deleted] = monitoringRules.splice(ruleIndex, 1);
    return success(deleted);
  }

  return error("Resource not found. Alerts cannot be deleted, only resolved.", 404);
}
