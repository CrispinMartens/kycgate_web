import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { entities } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const entity = entities.find((e) => e.id === id);
  if (!entity) return error("Entity not found", 404);
  return success(entity);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = entities.findIndex((e) => e.id === id);
  if (index === -1) return error("Entity not found", 404);

  try {
    const body = await request.json();
    entities[index] = { ...entities[index], ...body, id, updatedAt: now() };
    return success(entities[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = entities.findIndex((e) => e.id === id);
  if (index === -1) return error("Entity not found", 404);

  const [deleted] = entities.splice(index, 1);
  return success(deleted);
}
