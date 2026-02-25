import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { individuals } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const individual = individuals.find((i) => i.id === id);
  if (!individual) return error("Individual not found", 404);
  return success(individual);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = individuals.findIndex((i) => i.id === id);
  if (index === -1) return error("Individual not found", 404);

  try {
    const body = await request.json();
    individuals[index] = { ...individuals[index], ...body, id, updatedAt: now() };
    return success(individuals[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = individuals.findIndex((i) => i.id === id);
  if (index === -1) return error("Individual not found", 404);

  const [deleted] = individuals.splice(index, 1);
  return success(deleted);
}
