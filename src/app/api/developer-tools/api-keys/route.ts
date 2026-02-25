import { NextRequest } from "next/server";
import { success, error, generateId, now } from "@/lib/api-helpers";
import { apiKeys } from "@/lib/mock-data";
import { ApiKey } from "@/types";

export async function GET() {
  const safeKeys = apiKeys.map((k) => ({ ...k, key: `${k.prefix}${"*".repeat(32)}` }));
  return success(safeKeys);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.environment) {
      return error("Validation error: name and environment are required");
    }

    const keyId = generateId("ak");
    const prefix = `kg_${body.environment === "production" ? "live" : "test"}_sk_${keyId.slice(3, 7)}`;
    const fullKey = `${prefix}${Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join("")}`;

    const newKey: ApiKey = {
      id: keyId,
      name: body.name,
      key: fullKey,
      prefix,
      status: "active",
      environment: body.environment,
      permissions: body.permissions ?? [],
      expiresAt: body.expiresAt,
      createdBy: body.createdBy ?? "api",
      createdAt: now(),
      updatedAt: now(),
    };

    apiKeys.push(newKey);
    return success(newKey, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
