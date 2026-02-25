import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { entities } from "@/lib/mock-data";
import { Entity } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...entities];

  result = applySearch(result, url.searchParams.get("q"), ["name", "legalName", "registrationNumber", "country", "industry"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    riskLevel: url.searchParams.get("riskLevel"),
    type: url.searchParams.get("type"),
    country: url.searchParams.get("country"),
  });
  result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.type || !body.country) {
      return error("Validation error: name, type, and country are required");
    }

    const newEntity: Entity = {
      id: generateId("ent"),
      name: body.name,
      legalName: body.legalName ?? body.name,
      type: body.type,
      status: "pending",
      riskLevel: "low",
      riskScore: 0,
      country: body.country,
      registrationNumber: body.registrationNumber ?? "",
      taxId: body.taxId,
      incorporationDate: body.incorporationDate ?? "",
      industry: body.industry ?? "",
      website: body.website,
      address: body.address ?? { line1: "", city: "", postalCode: "", country: body.country },
      contacts: body.contacts ?? [],
      beneficialOwners: body.beneficialOwners ?? [],
      documents: [],
      tags: body.tags ?? [],
      notes: body.notes,
      assignedTo: body.assignedTo,
      createdAt: now(),
      updatedAt: now(),
    };

    entities.push(newEntity);
    return success(newEntity, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
