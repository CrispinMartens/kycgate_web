"use client";

import { useState } from "react";
import { FileCheck, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge, RiskScore } from "@/components/shared/risk-badge";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { Application, PaginatedResponse } from "@/types";

function StepTimeline({ steps }: { steps: Application["steps"] }) {
  return (
    <div className="py-3 px-4 bg-muted/50 rounded-md space-y-2">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-3 text-sm">
          <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
            step.status === "approved" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
            step.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
            step.status === "escalated" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400" :
            step.status === "in_review" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" :
            "bg-muted text-muted-foreground"
          }`}>
            {i + 1}
          </div>
          <span className="flex-1">{step.name}</span>
          <StatusBadge status={step.status} />
        </div>
      ))}
    </div>
  );
}

function ApplicationRow({ app }: { app: Application }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <TableRow className="cursor-pointer hover:bg-muted/50">
        <TableCell>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </TableCell>
        <TableCell className="font-medium">{app.applicantName}</TableCell>
        <TableCell>
          <Badge variant={app.type === "kyc" ? "default" : app.type === "kyb" ? "secondary" : "outline"} className="uppercase text-xs">
            {app.type}
          </Badge>
        </TableCell>
        <TableCell><StatusBadge status={app.status} /></TableCell>
        <TableCell className="text-muted-foreground">{app.workflowName}</TableCell>
        <TableCell>{app.riskLevel ? <RiskBadge level={app.riskLevel} /> : <span className="text-muted-foreground">—</span>}</TableCell>
        <TableCell className="text-right">{app.riskScore != null ? <RiskScore score={app.riskScore} /> : "—"}</TableCell>
        <TableCell className="text-muted-foreground text-sm">
          {new Date(app.submittedAt).toLocaleDateString()}
        </TableCell>
      </TableRow>
      <CollapsibleContent asChild>
        <tr>
          <td colSpan={8} className="p-4 border-b">
            <div className="max-w-2xl">
              <p className="text-sm font-medium mb-2">Workflow Steps</p>
              <StepTimeline steps={app.steps} />
              {app.reviewNotes && (
                <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                  <span className="font-medium">Review Notes: </span>
                  <span className="text-muted-foreground">{app.reviewNotes}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (typeFilter !== "all") params.set("type", typeFilter);

  const { data, loading } = useFetch<PaginatedResponse<Application>>(
    `/api/applications?${params.toString()}`
  );

  return (
    <>
      <PageHeader title="Applications" description="Track KYC, KYB, and AML application submissions and reviews" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search applications..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="kyc">KYC</SelectItem>
            <SelectItem value="kyb">KYB</SelectItem>
            <SelectItem value="aml">AML</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-4 w-4" />
              {data?.pagination.total ?? 0} Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Applicant</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Workflow</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((app) => (
                  <ApplicationRow key={app.id} app={app} />
                ))}
                {data?.data.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No applications found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
