import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { configuration } from "@/lib/mock-data";
import { Configuration } from "@/types";

const state = { config: { ...configuration }, updatedAt: "2025-06-01T10:00:00Z" };

export async function GET() {
  return success({ ...state.config, updatedAt: state.updatedAt });
}

export async function PUT(request: NextRequest) {
  try {
    const body: Partial<Configuration> = await request.json();

    if (body.general) state.config.general = { ...state.config.general, ...body.general };
    if (body.compliance) state.config.compliance = { ...state.config.compliance, ...body.compliance };
    if (body.notifications) state.config.notifications = { ...state.config.notifications, ...body.notifications };
    if (body.integrations) state.config.integrations = { ...state.config.integrations, ...body.integrations };

    state.updatedAt = now();
    return success({ ...state.config, updatedAt: state.updatedAt });
  } catch {
    return error("Invalid request body", 400);
  }
}
