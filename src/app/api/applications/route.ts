import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { applications } from "@/lib/mock-data";
import { Application } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...applications];

  result = applySearch(result, url.searchParams.get("q"), ["applicantName", "workflowName"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    type: url.searchParams.get("type"),
    applicantType: url.searchParams.get("applicantType"),
    riskLevel: url.searchParams.get("riskLevel"),
  });
  result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.type || !body.applicantId || !body.workflowId) {
      return error("Validation error: type, applicantId, and workflowId are required");
    }

    const newApplication: Application = {
      id: generateId("app"),
      type: body.type,
      status: "pending",
      applicantType: body.applicantType ?? "individual",
      applicantId: body.applicantId,
      applicantName: body.applicantName ?? "Unknown",
      workflowId: body.workflowId,
      workflowName: body.workflowName ?? "Unknown Workflow",
      currentStepIndex: 0,
      steps: body.steps ?? [],
      assignedTo: body.assignedTo,
      submittedAt: now(),
      createdAt: now(),
      updatedAt: now(),
    };

    applications.push(newApplication);
    return success(newApplication, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
