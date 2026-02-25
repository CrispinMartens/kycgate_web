"use client";

import { AlertTriangle, CheckCircle2, Clock3, FileSearch, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";

export default function ComplianceOfficerDashboardPage() {
  const queue = [
    { id: "case_9012", subject: "Enhanced due diligence review", risk: "high", submitted: "12 min ago" },
    { id: "case_9011", subject: "Manual sanctions adjudication", risk: "critical", submitted: "28 min ago" },
    { id: "case_9010", subject: "UBO ownership verification", risk: "medium", submitted: "1 hr ago" },
    { id: "case_9009", subject: "Source of funds clarification", risk: "high", submitted: "2 hrs ago" },
  ];

  return (
    <>
      <PageHeader
        title="Compliance Officer Dashboard"
        description="Dedicated review workspace for escalations, approvals, and compliance actions"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <FileSearch className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">18</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Open Review Cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Clock3 className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">6</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">SLA Due in 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">4</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Critical Escalations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold">27</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Approved Today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" />
            Priority Review Queue
          </CardTitle>
          <CardDescription>
            High-impact cases requiring compliance officer decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.subject}</p>
                <p className="text-xs text-muted-foreground">{item.id}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  item.risk === "critical"
                    ? "border-red-300 text-red-700"
                    : item.risk === "high"
                      ? "border-orange-300 text-orange-700"
                      : "border-amber-300 text-amber-700"
                }
              >
                {item.risk}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.submitted}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
