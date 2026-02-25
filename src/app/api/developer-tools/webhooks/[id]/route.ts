import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { webhooks } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const webhook = webhooks.find((w) => w.id === id);
  if (!webhook) return error("Webhook not found", 404);
  return success(webhook);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = webhooks.findIndex((w) => w.id === id);
  if (index === -1) return error("Webhook not found", 404);

  try {
    const body = await request.json();
    webhooks[index] = { ...webhooks[index], ...body, id, updatedAt: now() };
    return success(webhooks[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = webhooks.findIndex((w) => w.id === id);
  if (index === -1) return error("Webhook not found", 404);

  const [deleted] = webhooks.splice(index, 1);
  return success(deleted);
}
