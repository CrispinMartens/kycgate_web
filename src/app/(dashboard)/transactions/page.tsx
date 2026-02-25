"use client";

import { useState } from "react";
import { ArrowLeftRight, Search, ArrowUpRight, ArrowDownLeft, Ban } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskScore } from "@/components/shared/risk-badge";
import { PageHeader } from "@/components/shared/page-header";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { Transaction, PaginatedResponse } from "@/types";

function formatAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [directionFilter, setDirectionFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (typeFilter !== "all") params.set("type", typeFilter);
  if (directionFilter !== "all") params.set("direction", directionFilter);

  const { data, loading } = useFetch<PaginatedResponse<Transaction>>(
    `/api/transactions?${params.toString()}`
  );

  return (
    <>
      <PageHeader title="Transactions" description="Monitor and review financial transactions across all entities" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
            <SelectItem value="ach">ACH</SelectItem>
            <SelectItem value="crypto">Crypto</SelectItem>
            <SelectItem value="card_payment">Card Payment</SelectItem>
            <SelectItem value="cash_deposit">Cash Deposit</SelectItem>
            <SelectItem value="internal_transfer">Internal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={directionFilter} onValueChange={setDirectionFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="inbound">Inbound</SelectItem>
            <SelectItem value="outbound">Outbound</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="h-4 w-4" />
              {data?.pagination.total ?? 0} Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((txn) => (
                  <TableRow key={txn.id} className={txn.status === "flagged" || txn.status === "blocked" ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                    <TableCell>
                      {txn.status === "blocked" ? (
                        <Ban className="h-4 w-4 text-red-500" />
                      ) : txn.direction === "inbound" ? (
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-blue-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{txn.senderName}</p>
                      <p className="text-xs text-muted-foreground">{txn.senderCountry}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm font-medium">{txn.receiverName}</p>
                      <p className="text-xs text-muted-foreground">{txn.receiverCountry}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatAmount(txn.amount, txn.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{txn.type.replace(/_/g, " ")}</Badge>
                    </TableCell>
                    <TableCell><StatusBadge status={txn.status} /></TableCell>
                    <TableCell className="text-right"><RiskScore score={txn.riskScore} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {txn.riskFlags.slice(0, 2).map((f) => (
                          <Badge key={f} variant="destructive" className="text-xs">{f.replace(/_/g, " ")}</Badge>
                        ))}
                        {txn.riskFlags.length > 2 && <Badge variant="secondary" className="text-xs">+{txn.riskFlags.length - 2}</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
