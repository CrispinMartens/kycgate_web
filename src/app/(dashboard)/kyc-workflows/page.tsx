"use client";

import { useState } from "react";
import Link from "next/link";
import { GitBranch, Search, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { KycWorkflow, PaginatedResponse } from "@/types";

function WorkflowCard({ workflow }: { workflow: KycWorkflow }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <CardTitle className="text-base">{workflow.name}</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">{workflow.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase text-xs">{workflow.type}</Badge>
              <StatusBadge status={workflow.status} />
              {workflow.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
              <Badge variant="outline" className="text-xs">v{workflow.version}</Badge>
            </div>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Steps ({workflow.steps.length})</p>
                <div className="space-y-2">
                  {workflow.steps.map((step, i) => (
                    <div key={step.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{step.type.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {step.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                        {step.timeoutHours && (
                          <span className="text-muted-foreground">{step.timeoutHours}h timeout</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {workflow.conditions.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Conditions ({workflow.conditions.length})</p>
                  <div className="space-y-2">
                    {workflow.conditions.map((cond) => (
                      <div key={cond.id} className="flex items-center gap-3 rounded-lg border p-3 bg-muted/30">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {cond.field} {cond.operator} {JSON.stringify(cond.value)}
                        </code>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant={cond.action === "reject" ? "destructive" : cond.action === "escalate" ? "outline" : "secondary"} className="text-xs capitalize">
                          {cond.action.replace("_", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1">
                {workflow.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function KycWorkflowsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (typeFilter !== "all") params.set("type", typeFilter);
  if (statusFilter !== "all") params.set("status", statusFilter);

  const { data, loading } = useFetch<PaginatedResponse<KycWorkflow>>(
    `/api/kyc-workflows?${params.toString()}`
  );

  if (loading) return <PageLoading />;

  return (
    <>
      <PageHeader title="KYC Workflows" description="Configure verification workflows for KYC, KYB, and AML processes">
        <Button asChild><Link href="/kyc-workflows/new"><Plus className="mr-2 h-4 w-4" />New Workflow</Link></Button>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search workflows..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{data?.pagination.total ?? 0} workflows</span>
      </div>

      <div className="space-y-4">
        {data?.data.map((wf) => <WorkflowCard key={wf.id} workflow={wf} />)}
      </div>
    </>
  );
}
