import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { individuals } from "@/lib/mock-data";
import { Individual } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...individuals];

  result = applySearch(result, url.searchParams.get("q"), ["firstName", "lastName", "email", "nationality"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    kycStatus: url.searchParams.get("kycStatus"),
    riskLevel: url.searchParams.get("riskLevel"),
    nationality: url.searchParams.get("nationality"),
  });
  result = applySorting(result, url.searchParams.get("sortBy"), url.searchParams.get("sortOrder"));

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.firstName || !body.lastName || !body.email) {
      return error("Validation error: firstName, lastName, and email are required");
    }

    const newIndividual: Individual = {
      id: generateId("ind"),
      firstName: body.firstName,
      lastName: body.lastName,
      middleName: body.middleName,
      email: body.email,
      phone: body.phone,
      dateOfBirth: body.dateOfBirth ?? "",
      nationality: body.nationality ?? "",
      countryOfResidence: body.countryOfResidence ?? "",
      status: "active",
      kycStatus: "not_started",
      riskLevel: "low",
      riskScore: 0,
      address: body.address ?? { line1: "", city: "", postalCode: "", country: "" },
      documents: [],
      pepStatus: false,
      sanctionsHit: false,
      adverseMedia: false,
      sourceOfFunds: body.sourceOfFunds,
      occupation: body.occupation,
      employer: body.employer,
      entityIds: body.entityIds ?? [],
      tags: body.tags ?? [],
      notes: body.notes,
      assignedTo: body.assignedTo,
      createdAt: now(),
      updatedAt: now(),
    };

    individuals.push(newIndividual);
    return success(newIndividual, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
