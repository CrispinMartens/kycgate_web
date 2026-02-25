"use client";

import {
  Building2,
  Users,
  FileCheck,
  AlertTriangle,
  ShieldCheck,
  Activity,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";
import { RiskBadge } from "@/components/shared/risk-badge";
import { PageLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { OverviewStats } from "@/types";

export default function OverviewPage() {
  const { data, loading } = useFetch<OverviewStats>("/api/overview");

  if (loading || !data) return <PageLoading />;

  const statCards = [
    { label: "Total Entities", value: data.totalEntities, icon: Building2, color: "text-blue-600" },
    { label: "Total Individuals", value: data.totalIndividuals, icon: Users, color: "text-violet-600" },
    { label: "Applications", value: data.totalApplications, icon: FileCheck, color: "text-emerald-600" },
    { label: "Pending Reviews", value: data.pendingReviews, icon: Clock, color: "text-amber-600" },
    { label: "Active Alerts", value: data.activeAlerts, icon: AlertTriangle, color: "text-red-600" },
    { label: "Completed Today", value: data.completedToday, icon: TrendingUp, color: "text-emerald-600" },
  ];

  const riskTotal = Object.values(data.riskDistribution).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Overview"
        description="Your compliance dashboard at a glance"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-4xl font-bold">{data.complianceScore}%</span>
              <span className="mb-1 text-sm text-muted-foreground">Overall</span>
            </div>
            <Progress value={data.complianceScore} className="h-2" />
            <p className="mt-3 text-xs text-muted-foreground">
              Based on completed reviews, active monitoring, and policy adherence.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(["low", "medium", "high", "critical"] as const).map((level) => {
                const count = data.riskDistribution[level];
                const pct = riskTotal > 0 ? (count / riskTotal) * 100 : 0;
                return (
                  <div key={level} className="flex items-center gap-3">
                    <RiskBadge level={level} />
                    <div className="flex-1">
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            level === "low"
                              ? "bg-emerald-500"
                              : level === "medium"
                                ? "bg-amber-500"
                                : level === "high"
                                  ? "bg-orange-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-8 text-right text-sm font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck className="h-4 w-4" />
              Applications by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(data.applicationsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-muted-foreground">
                    {status.replace("_", " ")}
                  </span>
                  <Badge variant={status === "approved" ? "default" : status === "rejected" || status === "escalated" ? "destructive" : "outline"}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest events across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.map((event) => {
              const iconMap: Record<string, string> = {
                application_submitted: "text-blue-600",
                review_completed: "text-emerald-600",
                alert_triggered: "text-red-600",
                entity_created: "text-violet-600",
                risk_changed: "text-amber-600",
                document_uploaded: "text-sky-600",
              };
              return (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${iconMap[event.type]?.replace("text-", "bg-") ?? "bg-gray-400"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{event.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(event.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
