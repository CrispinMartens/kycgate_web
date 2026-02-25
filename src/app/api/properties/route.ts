import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { customProperties } from "@/lib/mock-data";
import { CustomProperty } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...customProperties];

  result = applySearch(result, url.searchParams.get("q"), ["name", "label", "description"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    entityType: url.searchParams.get("entityType"),
    type: url.searchParams.get("type"),
    group: url.searchParams.get("group"),
  });
  result = applySorting(result, url.searchParams.get("sortBy") ?? "order", url.searchParams.get("sortOrder") ?? "asc");

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.label || !body.type || !body.entityType) {
      return error("Validation error: name, label, type, and entityType are required");
    }

    const existing = customProperties.find((p) => p.name === body.name && p.entityType === body.entityType);
    if (existing) return error(`Property '${body.name}' already exists for ${body.entityType}`);

    const newProperty: CustomProperty = {
      id: generateId("prop"),
      name: body.name,
      label: body.label,
      description: body.description,
      type: body.type,
      entityType: body.entityType,
      required: body.required ?? false,
      defaultValue: body.defaultValue,
      options: body.options,
      validation: body.validation,
      order: body.order ?? customProperties.length + 1,
      status: "active",
      group: body.group,
      createdAt: now(),
      updatedAt: now(),
    };

    customProperties.push(newProperty);
    return success(newProperty, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
