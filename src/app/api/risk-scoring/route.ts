import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { riskScoringModels } from "@/lib/mock-data";
import { RiskScoringModel } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...riskScoringModels];

  result = applySearch(result, url.searchParams.get("q"), ["name", "description"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
  });
  result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name) {
      return error("Validation error: name is required");
    }

    const newModel: RiskScoringModel = {
      id: generateId("rsm"),
      name: body.name,
      description: body.description ?? "",
      status: "inactive",
      version: 1,
      isDefault: false,
      maxScore: body.maxScore ?? 100,
      thresholds: body.thresholds ?? {
        low: { min: 0, max: 25 },
        medium: { min: 26, max: 50 },
        high: { min: 51, max: 75 },
        critical: { min: 76, max: 100 },
      },
      categories: body.categories ?? [],
      createdAt: now(),
      updatedAt: now(),
    };

    riskScoringModels.push(newModel);
    return success(newModel, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
