import { NextRequest } from "next/server";
import { success, error, paginate, applySearch, applyFilters, applySorting, generateId, now } from "@/lib/api-helpers";
import { transactions } from "@/lib/mock-data";
import { Transaction } from "@/types";

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  let result = [...transactions];

  result = applySearch(result, url.searchParams.get("q"), ["senderName", "receiverName", "reference"]);
  result = applyFilters(result, {
    status: url.searchParams.get("status"),
    type: url.searchParams.get("type"),
    direction: url.searchParams.get("direction"),
    currency: url.searchParams.get("currency"),
  });

  const minAmount = url.searchParams.get("minAmount");
  const maxAmount = url.searchParams.get("maxAmount");
  if (minAmount) result = result.filter((t) => t.amount >= Number(minAmount));
  if (maxAmount) result = result.filter((t) => t.amount <= Number(maxAmount));

  result = applySorting(result, url.searchParams.get("sortBy") ?? "createdAt", url.searchParams.get("sortOrder") ?? "desc");

  return paginate(result, request);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.type || !body.amount || !body.currency || !body.senderName || !body.receiverName) {
      return error("Validation error: type, amount, currency, senderName, and receiverName are required");
    }

    const newTransaction: Transaction = {
      id: generateId("txn"),
      type: body.type,
      status: "pending",
      amount: body.amount,
      currency: body.currency,
      direction: body.direction ?? "outbound",
      senderName: body.senderName,
      senderId: body.senderId,
      senderAccount: body.senderAccount,
      senderCountry: body.senderCountry ?? "",
      receiverName: body.receiverName,
      receiverId: body.receiverId,
      receiverAccount: body.receiverAccount,
      receiverCountry: body.receiverCountry ?? "",
      reference: body.reference,
      riskFlags: [],
      riskScore: 0,
      screeningResult: "pending",
      narrative: body.narrative,
      createdAt: now(),
      updatedAt: now(),
    };

    transactions.push(newTransaction);
    return success(newTransaction, 201);
  } catch {
    return error("Invalid request body", 400);
  }
}
