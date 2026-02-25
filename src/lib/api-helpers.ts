import { NextRequest, NextResponse } from "next/server";
import { ApiResponse, PaginatedResponse } from "@/types";

export function success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400): NextResponse<ApiResponse<null>> {
  return NextResponse.json({ success: false, data: null, error: message }, { status });
}

export function paginate<T>(
  items: T[],
  request: NextRequest
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  const url = request.nextUrl;
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20")));

  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);

  return success({
    data,
    pagination: { page, pageSize, total, totalPages },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export function applySearch<T extends AnyRecord>(
  items: T[],
  query: string | null,
  fields: (keyof T)[]
): T[] {
  if (!query) return items;
  const lower = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return typeof value === "string" && value.toLowerCase().includes(lower);
    })
  );
}

export function applyFilters<T extends AnyRecord>(
  items: T[],
  filters: Record<string, string | null>
): T[] {
  return items.filter((item) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return String(item[key]) === value;
    })
  );
}

export function applySorting<T extends AnyRecord>(
  items: T[],
  sortBy: string | null,
  sortOrder: string | null
): T[] {
  if (!sortBy) return items;
  const order = sortOrder === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * order;
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * order;
    }
    return 0;
  });
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function now(): string {
  return new Date().toISOString();
}
