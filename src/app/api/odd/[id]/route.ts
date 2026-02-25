import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { oddCases, oddSchedules } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const oddCase = oddCases.find((c) => c.id === id);
  if (oddCase) return success(oddCase);

  const schedule = oddSchedules.find((s) => s.id === id);
  if (schedule) return success(schedule);

  return error("Resource not found", 404);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    const body = await request.json();

    const caseIndex = oddCases.findIndex((c) => c.id === id);
    if (caseIndex !== -1) {
      oddCases[caseIndex] = { ...oddCases[caseIndex], ...body, id, updatedAt: now() };
      return success(oddCases[caseIndex]);
    }

    const scheduleIndex = oddSchedules.findIndex((s) => s.id === id);
    if (scheduleIndex !== -1) {
      oddSchedules[scheduleIndex] = { ...oddSchedules[scheduleIndex], ...body, id, updatedAt: now() };
      return success(oddSchedules[scheduleIndex]);
    }

    return error("Resource not found", 404);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  const scheduleIndex = oddSchedules.findIndex((s) => s.id === id);
  if (scheduleIndex !== -1) {
    const [deleted] = oddSchedules.splice(scheduleIndex, 1);
    return success(deleted);
  }

  return error("ODD cases cannot be deleted, only completed or archived", 400);
}
