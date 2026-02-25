import { NextRequest } from "next/server";
import { paginate, applySearch, applyFilters, applySorting } from "@/lib/api-helpers";
import { apiLogs } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...apiLogs];

  result = applySearch(result, url.searchParams.get("q"), ["path", "apiKeyName"]);
  result = applyFilters(result, {
    method: url.searchParams.get("method"),
    apiKeyId: url.searchParams.get("apiKeyId"),
  });

  const statusCode = url.searchParams.get("statusCode");
  if (statusCode) {
    const code = Number(statusCode);
    result = result.filter((l) => l.statusCode === code);
  }

  result = applySorting(result, url.searchParams.get("sortBy") ?? "timestamp", url.searchParams.get("sortOrder") ?? "desc");

  return paginate(result, request);
}
