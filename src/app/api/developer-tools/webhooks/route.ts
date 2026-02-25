import { NextRequest } from "next/server";
import { success, error, generateId, now } from "@/lib/api-helpers";
import { webhooks } from "@/lib/mock-data";
import { Webhook } from "@/types";

export async function GET() {
  return success(webhooks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.url || !body.events?.length) {
      return error("Validation error: url and events are required");
    }

    const newWebhook: Webhook = {
      id: generateId("wh"),
      url: body.url,
      description: body.description ?? "",
      status: "active",
      events: body.events,
      secret: `whsec_${Array.from({ length: 20 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`,
      version: body.version ?? "v2",
      failureCount: 0,
      createdAt: now(),
      updatedAt: now(),
    };

    webhooks.push(newWebhook);
    return success(newWebhook, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
