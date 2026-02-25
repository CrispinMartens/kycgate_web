import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { kycWorkflows } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const workflow = kycWorkflows.find((w) => w.id === id);
  if (!workflow) return error("Workflow not found", 404);
  return success(workflow);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = kycWorkflows.findIndex((w) => w.id === id);
  if (index === -1) return error("Workflow not found", 404);

  try {
    const body = await request.json();
    const updated = { ...kycWorkflows[index], ...body, id, updatedAt: now() };
    if (body.steps || body.conditions) {
      updated.version = kycWorkflows[index].version + 1;
    }
    kycWorkflows[index] = updated;
    return success(kycWorkflows[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = kycWorkflows.findIndex((w) => w.id === id);
  if (index === -1) return error("Workflow not found", 404);
  if (kycWorkflows[index].isDefault) return error("Cannot delete a default workflow", 400);

  const [deleted] = kycWorkflows.splice(index, 1);
  return success(deleted);
}
