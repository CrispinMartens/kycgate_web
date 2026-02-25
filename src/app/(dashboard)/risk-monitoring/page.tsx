"use client";

import { useState } from "react";
import { Radar, Search, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { PageHeader } from "@/components/shared/page-header";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { RiskAlert, MonitoringRule, PaginatedResponse } from "@/types";

function AlertsTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (severityFilter !== "all") params.set("severity", severityFilter);

  const { data, loading } = useFetch<PaginatedResponse<RiskAlert>>(
    `/api/risk-monitoring?${params.toString()}`
  );

  const alertIcon = (type: string) => {
    switch (type) {
      case "sanctions_hit": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "pep_match": return <AlertTriangle className="h-4 w-4 text-purple-500" />;
      case "adverse_media": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "unusual_activity": return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "document_expired": return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search alerts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <TableLoading /> : (
        <div className="space-y-3">
          {data?.data.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{alertIcon(alert.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <RiskBadge level={alert.severity} />
                      <StatusBadge status={alert.status} />
                      <Badge variant="outline" className="text-xs capitalize">{alert.type.replace(/_/g, " ")}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Entity: <strong className="text-foreground">{alert.entityName}</strong></span>
                      <span>Source: {alert.source}</span>
                      <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    {alert.resolution && (
                      <div className="mt-2 rounded bg-muted/50 p-2 text-xs">
                        <span className="font-medium">Resolution: </span>{alert.resolution}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {data?.data.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">No alerts found.</div>
          )}
        </div>
      )}
    </div>
  );
}

function RulesTab() {
  const { data, loading } = useFetch<PaginatedResponse<MonitoringRule>>(
    "/api/risk-monitoring?resource=rules"
  );

  if (loading) return <TableLoading />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Monitoring Rules</CardTitle>
        <CardDescription>Automated rules that trigger alerts and actions</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
              <TableHead>Last Run</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>
                  <p className="font-medium text-sm">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.description}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize text-xs">{rule.type}</Badge>
                </TableCell>
                <TableCell className="capitalize text-sm">{rule.frequency ?? "Real-time"}</TableCell>
                <TableCell><StatusBadge status={rule.status} /></TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {rule.actions.map((a) => (
                      <Badge key={a} variant="secondary" className="text-xs capitalize">{a}</Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleDateString() : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function RiskMonitoringPage() {
  const { data: alertData } = useFetch<PaginatedResponse<RiskAlert>>("/api/risk-monitoring");

  const openCount = alertData?.data.filter((a) => a.status === "open").length ?? 0;
  const investigatingCount = alertData?.data.filter((a) => a.status === "investigating").length ?? 0;
  const resolvedCount = alertData?.data.filter((a) => ["resolved", "dismissed"].includes(a.status)).length ?? 0;

  return (
    <>
      <PageHeader title="Risk Monitoring" description="Monitor alerts, screening results, and automated monitoring rules" />

      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{openCount}</p>
              <p className="text-xs text-muted-foreground">Open Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{investigatingCount}</p>
              <p className="text-xs text-muted-foreground">Investigating</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedCount}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts" className="gap-2">
            <Radar className="h-4 w-4" />Alerts
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2">
            <XCircle className="h-4 w-4" />Rules
          </TabsTrigger>
        </TabsList>
        <TabsContent value="alerts"><AlertsTab /></TabsContent>
        <TabsContent value="rules"><RulesTab /></TabsContent>
      </Tabs>
    </>
  );
}
