import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { apiKeys } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const key = apiKeys.find((k) => k.id === id);
  if (!key) return error("API key not found", 404);
  return success({ ...key, key: `${key.prefix}${"*".repeat(32)}` });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = apiKeys.findIndex((k) => k.id === id);
  if (index === -1) return error("API key not found", 404);

  try {
    const body = await request.json();
    const { key: _key, ...safeBody } = body;
    apiKeys[index] = { ...apiKeys[index], ...safeBody, id, updatedAt: now() };
    return success({ ...apiKeys[index], key: `${apiKeys[index].prefix}${"*".repeat(32)}` });
  } catch {
    return error("Invalid request body", 400);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = apiKeys.findIndex((k) => k.id === id);
  if (index === -1) return error("API key not found", 404);

  apiKeys[index].status = "inactive";
  apiKeys[index].updatedAt = now();
  return success({ message: "API key revoked" });
}
