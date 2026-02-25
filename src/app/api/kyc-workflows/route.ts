import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { kycWorkflows } from "@/lib/mock-data";
import { KycWorkflow } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...kycWorkflows];

  result = applySearch(result, url.searchParams.get("q"), ["name", "description"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    type: url.searchParams.get("type"),
    applicantType: url.searchParams.get("applicantType"),
  });
  result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.type) {
      return error("Validation error: name and type are required");
    }

    const newWorkflow: KycWorkflow = {
      id: generateId("wf"),
      name: body.name,
      description: body.description ?? "",
      type: body.type,
      themeId: body.themeId ?? "theme_05",
      flowLayout: body.flowLayout ?? "split",
      status: body.status ?? "inactive",
      version: 1,
      isDefault: false,
      applicantType: body.applicantType ?? "individual",
      steps: body.steps ?? [],
      conditions: body.conditions ?? [],
      tags: body.tags ?? [],
      createdAt: now(),
      updatedAt: now(),
    };

    kycWorkflows.push(newWorkflow);
    return success(newWorkflow, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
