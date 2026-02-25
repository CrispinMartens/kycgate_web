"use client";

import { AlertTriangle, CheckCircle2, Clock3, FileSearch, ShieldCheck, UserCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export default function ComplianceOfficerDashboardPage() {
  const queue = [
    { id: "kyc_4012", prospect: "Sophia Turner", workflow: "Individual KYC", risk: "high", submitted: "12 min ago" },
    { id: "kyc_4011", prospect: "Apex Global LLC", workflow: "Business KYB", risk: "critical", submitted: "28 min ago" },
    { id: "kyc_4010", prospect: "Daniel Weber", workflow: "Individual KYC", risk: "medium", submitted: "1 hr ago" },
    { id: "kyc_4009", prospect: "Nova Capital Partners", workflow: "Enhanced KYB", risk: "high", submitted: "2 hrs ago" },
  ];

  return (
    <>
      <PageHeader
        title="Compliance Officer Dashboard"
        description="Review completed KYC forms and approve or reject prospect customers"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <FileSearch className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold">22</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Completed KYC Forms Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Clock3 className="h-5 w-5 text-amber-600" />
              <span className="text-2xl font-bold">8</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Approval SLA Due in 24h</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold">4</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">High-Risk Prospects Requiring Escalation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <span className="text-2xl font-bold">31</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Prospect Customers Approved Today</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4" />
            KYC Approval Queue
          </CardTitle>
          <CardDescription>
            Completed onboarding forms awaiting your compliance decision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-md border px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.prospect}</p>
                <p className="text-xs text-muted-foreground">
                  {item.id} · {item.workflow}
                </p>
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
              <div className="ml-2 flex items-center gap-2">
                <Button size="sm" className="h-8">
                  <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                  Approve
                </Button>
                <Button variant="outline" size="sm" className="h-8">
                  Request Info
                </Button>
                <Button variant="destructive" size="sm" className="h-8">
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
