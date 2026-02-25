import { NextRequest } from "next/server";
import { success, paginate, applySearch, applyFilters, applySorting } from "@/lib/api-helpers";
import { riskAlerts, monitoringRules } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const resource = url.searchParams.get("resource");

  if (resource === "rules") {
    let result = [...monitoringRules];
    result = applySearch(result, url.searchParams.get("q"), ["name", "description"]);
    result = applyFilters(result, { status: url.searchParams.get("status") });
    result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));
    return paginate(result, request);
  }

  let result = [...riskAlerts];
  result = applySearch(result, url.searchParams.get("q"), ["title", "description", "entityName"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    severity: url.searchParams.get("severity"),
    type: url.searchParams.get("type"),
    entityType: url.searchParams.get("entityType"),
  });
  result = applySorting(result, url.searchParams.get("sortBy") ?? "createdAt", url.searchParams.get("sortOrder") ?? "desc");

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  const url = request.nextUrl;
  const resource = url.searchParams.get("resource");

  if (resource === "rules") {
    const { error: errFn, generateId, now } = await import("@/lib/api-helpers");
    try {
      const body = await request.json();
      if (!body.name) return errFn("Validation error: name is required");

      const newRule = {
        id: generateId("mr"),
        name: body.name,
        description: body.description ?? "",
        status: body.status ?? ("inactive" as const),
        type: body.type ?? ("periodic" as const),
        frequency: body.frequency,
        conditions: body.conditions ?? [],
        actions: body.actions ?? ["alert" as const],
        createdAt: now(),
        updatedAt: now(),
      };
      monitoringRules.push(newRule);
      return success(newRule, 201);
    } catch {
      return errFn("Invalid request body", 400);
    }
  }

  const { error: errFn } = await import("@/lib/api-helpers");
  return errFn("Use resource=rules to create monitoring rules. Alerts are system-generated.", 400);
}
