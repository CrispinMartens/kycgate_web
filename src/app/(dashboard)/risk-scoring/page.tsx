"use client";

import { useState } from "react";
import { ShieldAlert, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge } from "@/components/shared/risk-badge";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { RiskScoringModel, PaginatedResponse } from "@/types";

function ScoringModelCard({ model }: { model: RiskScoringModel }) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <div>
                <CardTitle className="text-base">{model.name}</CardTitle>
                <CardDescription className="mt-0.5">{model.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={model.status} />
              {model.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
              <Badge variant="outline" className="text-xs">v{model.version}</Badge>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            {(["low", "medium", "high", "critical"] as const).map((level) => {
              const t = model.thresholds[level];
              return (
                <div key={level} className="flex items-center gap-1.5 text-xs">
                  <RiskBadge level={level} />
                  <span className="text-muted-foreground font-mono">{t.min}–{t.max}</span>
                </div>
              );
            })}
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {model.categories.map((cat) => (
              <div key={cat.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">Weight: {cat.weight}%</p>
                  </div>
                  <div className="w-24">
                    <Progress value={cat.weight} className="h-2" />
                  </div>
                </div>
                <div className="space-y-2">
                  {cat.factors.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded bg-muted/40 px-3 py-2">
                      <div className="flex-1">
                        <p className="text-sm">{f.name}</p>
                        <p className="text-xs text-muted-foreground">{f.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-semibold text-primary">+{f.score}</span>
                        <p className="text-xs text-muted-foreground">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export default function RiskScoringPage() {
  const { data, loading } = useFetch<PaginatedResponse<RiskScoringModel>>("/api/risk-scoring");

  if (loading) return <PageLoading />;

  return (
    <>
      <PageHeader title="Risk Scoring" description="Configure risk scoring models, categories, and factors">
        <Button><Plus className="mr-2 h-4 w-4" />New Model</Button>
      </PageHeader>

      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{data?.pagination.total ?? 0} scoring models</span>
      </div>

      <div className="space-y-4">
        {data?.data.map((model) => <ScoringModelCard key={model.id} model={model} />)}
      </div>
    </>
  );
}
