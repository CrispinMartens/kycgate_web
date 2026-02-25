import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { customProperties } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const property = customProperties.find((p) => p.id === id);
  if (!property) return error("Property not found", 404);
  return success(property);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = customProperties.findIndex((p) => p.id === id);
  if (index === -1) return error("Property not found", 404);

  try {
    const body = await request.json();
    customProperties[index] = { ...customProperties[index], ...body, id, updatedAt: now() };
    return success(customProperties[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = customProperties.findIndex((p) => p.id === id);
  if (index === -1) return error("Property not found", 404);

  const [deleted] = customProperties.splice(index, 1);
  return success(deleted);
}
