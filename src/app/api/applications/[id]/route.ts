import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { applications } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const application = applications.find((a) => a.id === id);
  if (!application) return error("Application not found", 404);
  return success(application);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = applications.findIndex((a) => a.id === id);
  if (index === -1) return error("Application not found", 404);

  try {
    const body = await request.json();
    applications[index] = { ...applications[index], ...body, id, updatedAt: now() };
    return success(applications[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = applications.findIndex((a) => a.id === id);
  if (index === -1) return error("Application not found", 404);

  const [deleted] = applications.splice(index, 1);
  return success(deleted);
}
