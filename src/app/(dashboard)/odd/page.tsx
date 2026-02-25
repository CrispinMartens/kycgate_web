"use client";

import { useState } from "react";
import { ClipboardCheck, Search, Calendar, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { PageHeader } from "@/components/shared/page-header";
import { TableLoading, PageLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { OddCase, OddSchedule, PaginatedResponse } from "@/types";

function CasesTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (statusFilter !== "all") params.set("status", statusFilter);

  const { data, loading } = useFetch<PaginatedResponse<OddCase>>(
    `/api/odd?${params.toString()}`
  );

  if (loading) return <TableLoading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search cases..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {data?.data.map((c) => (
          <Card key={c.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{c.entityName}</p>
                    <StatusBadge status={c.status} />
                    <RiskBadge level={c.riskLevel} />
                    <Badge variant="outline" className="text-xs capitalize">{c.triggerType.replace("_", " ")}</Badge>
                  </div>
                  {c.triggerReason && (
                    <p className="text-sm text-muted-foreground mt-1">{c.triggerReason}</p>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>Due: {new Date(c.dueDate).toLocaleDateString()}</p>
                  {c.assignedTo && <p>Assigned: {c.assignedTo}</p>}
                </div>
              </div>
              {c.findings.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Findings ({c.findings.length})</p>
                  {c.findings.map((f) => (
                    <div key={f.id} className="flex items-start gap-2 rounded bg-muted/40 p-2">
                      <AlertCircle className={`h-4 w-4 mt-0.5 ${f.resolved ? "text-emerald-500" : "text-orange-500"}`} />
                      <div className="flex-1 text-sm">
                        <p>{f.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span className="capitalize">{f.category.replace("_", " ")}</span> · <RiskBadge level={f.severity} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {data?.data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No ODD cases found.</div>
        )}
      </div>
    </div>
  );
}

function SchedulesTab() {
  const { data, loading } = useFetch<PaginatedResponse<OddSchedule>>(
    "/api/odd?resource=schedules"
  );

  if (loading) return <TableLoading />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review Schedules</CardTitle>
        <CardDescription>Automated ODD review frequency by risk level</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Schedule</TableHead>
              <TableHead>Risk Level</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Auto-Trigger</TableHead>
              <TableHead>Checks</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell><RiskBadge level={s.riskLevel} /></TableCell>
                <TableCell>Every {s.frequencyMonths} months</TableCell>
                <TableCell className="capitalize">{s.entityType}</TableCell>
                <TableCell>{s.autoTrigger ? <Badge variant="default" className="text-xs">Yes</Badge> : <Badge variant="secondary" className="text-xs">No</Badge>}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {s.checks.slice(0, 3).map((c) => (
                      <Badge key={c} variant="outline" className="text-xs capitalize">{c.replace(/_/g, " ")}</Badge>
                    ))}
                    {s.checks.length > 3 && <Badge variant="secondary" className="text-xs">+{s.checks.length - 3}</Badge>}
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function OddPage() {
  return (
    <>
      <PageHeader title="ODD" description="Ongoing Due Diligence - scheduled and event-driven reviews" />

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases" className="gap-2"><ClipboardCheck className="h-4 w-4" />Cases</TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2"><Calendar className="h-4 w-4" />Schedules</TabsTrigger>
        </TabsList>
        <TabsContent value="cases"><CasesTab /></TabsContent>
        <TabsContent value="schedules"><SchedulesTab /></TabsContent>
      </Tabs>
    </>
  );
}
