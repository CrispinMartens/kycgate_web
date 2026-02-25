import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { riskScoringModels } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const model = riskScoringModels.find((m) => m.id === id);
  if (!model) return error("Risk scoring model not found", 404);
  return success(model);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = riskScoringModels.findIndex((m) => m.id === id);
  if (index === -1) return error("Risk scoring model not found", 404);

  try {
    const body = await request.json();
    const updated = { ...riskScoringModels[index], ...body, id, updatedAt: now() };
    if (body.categories || body.thresholds) {
      updated.version = riskScoringModels[index].version + 1;
    }
    riskScoringModels[index] = updated;
    return success(riskScoringModels[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = riskScoringModels.findIndex((m) => m.id === id);
  if (index === -1) return error("Risk scoring model not found", 404);
  if (riskScoringModels[index].isDefault) return error("Cannot delete a default scoring model", 400);

  const [deleted] = riskScoringModels.splice(index, 1);
  return success(deleted);
}
