import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { oddCases, oddSchedules } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const resource = url.searchParams.get("resource");

  if (resource === "schedules") {
    let result = [...oddSchedules];
    result = applySearch(result, url.searchParams.get("q"), ["name"]);
    result = applyFilters(result, {
      status: url.searchParams.get("status"),
      riskLevel: url.searchParams.get("riskLevel"),
    });
    return paginate(result, request);
  }

  let result = [...oddCases];
  result = applySearch(result, url.searchParams.get("q"), ["entityName"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    riskLevel: url.searchParams.get("riskLevel"),
    entityType: url.searchParams.get("entityType"),
    triggerType: url.searchParams.get("triggerType"),
  });
  result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const resource = url.searchParams.get("resource");

  try {
    const body = await request.json();

    if (resource === "schedules") {
      if (!body.name || !body.riskLevel) return error("Validation error: name and riskLevel are required");
      const newSchedule = {
        id: generateId("os"),
        name: body.name,
        riskLevel: body.riskLevel,
        frequencyMonths: body.frequencyMonths ?? 12,
        entityType: body.entityType ?? ("both" as const),
        autoTrigger: body.autoTrigger ?? true,
        checks: body.checks ?? [],
        status: body.status ?? ("inactive" as const),
        createdAt: now(),
        updatedAt: now(),
      };
      oddSchedules.push(newSchedule);
      return success(newSchedule, 201);
    }

    if (!body.entityId || !body.entityType) return error("Validation error: entityId and entityType are required");
    const newCase = {
      id: generateId("odd"),
      entityType: body.entityType,
      entityId: body.entityId,
      entityName: body.entityName ?? "Unknown",
      status: "scheduled" as const,
      riskLevel: body.riskLevel ?? ("medium" as const),
      triggerType: body.triggerType ?? ("manual" as const),
      triggerReason: body.triggerReason,
      dueDate: body.dueDate ?? new Date(Date.now() + 30 * 86400000).toISOString(),
      assignedTo: body.assignedTo,
      findings: [],
      createdAt: now(),
      updatedAt: now(),
    };
    oddCases.push(newCase);
    return success(newCase, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
