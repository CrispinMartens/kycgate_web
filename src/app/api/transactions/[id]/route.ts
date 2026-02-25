import { NextRequest } from "next/server";
import { success, error, now } from "@/lib/api-helpers";
import { transactions } from "@/lib/mock-data";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  const transaction = transactions.find((t) => t.id === id);
  if (!transaction) return error("Transaction not found", 404);
  return success(transaction);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const index = transactions.findIndex((t) => t.id === id);
  if (index === -1) return error("Transaction not found", 404);

  try {
    const body = await request.json();
    transactions[index] = { ...transactions[index], ...body, id, updatedAt: now() };
    return success(transactions[index]);
  } catch {
    return error("Invalid request body", 400);
  }
}
