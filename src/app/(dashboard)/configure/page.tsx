"use client";

import { useState } from "react";
import { Settings, Save, Bell, Shield, Link2, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { PageLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { Configuration } from "@/types";

type ConfigWithUpdatedAt = Configuration & { updatedAt: string };

export default function ConfigurePage() {
  const { data, loading, refetch } = useFetch<ConfigWithUpdatedAt>("/api/configure");
  const [saving, setSaving] = useState(false);

  const handleSave = async (section: string, values: Record<string, unknown>) => {
    setSaving(true);
    await fetch("/api/configure", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [section]: values }),
    });
    setSaving(false);
    refetch();
  };

  if (loading || !data) return <PageLoading />;

  return (
    <>
      <PageHeader title="Configure" description="Manage platform settings and compliance policies">
        <span className="text-xs text-muted-foreground">
          Last updated: {new Date(data.updatedAt).toLocaleString()}
        </span>
      </PageHeader>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="gap-2"><Globe className="h-4 w-4" />General</TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2"><Shield className="h-4 w-4" />Compliance</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" />Notifications</TabsTrigger>
          <TabsTrigger value="integrations" className="gap-2"><Link2 className="h-4 w-4" />Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4" />General Settings</CardTitle>
              <CardDescription>Core platform configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleSave("general", {
                    companyName: fd.get("companyName"),
                    defaultCountry: fd.get("defaultCountry"),
                    defaultLanguage: fd.get("defaultLanguage"),
                    timezone: fd.get("timezone"),
                    autoApproveThreshold: Number(fd.get("autoApproveThreshold")),
                    sessionTimeoutMinutes: Number(fd.get("sessionTimeoutMinutes")),
                  });
                }}
                className="space-y-4 max-w-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" name="companyName" defaultValue={data.general.companyName} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCountry">Default Country</Label>
                    <Input id="defaultCountry" name="defaultCountry" defaultValue={data.general.defaultCountry} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultLanguage">Default Language</Label>
                    <Input id="defaultLanguage" name="defaultLanguage" defaultValue={data.general.defaultLanguage} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" name="timezone" defaultValue={data.general.timezone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="autoApproveThreshold">Auto-Approve Threshold</Label>
                    <Input id="autoApproveThreshold" name="autoApproveThreshold" type="number" defaultValue={data.general.autoApproveThreshold} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</Label>
                  <Input id="sessionTimeoutMinutes" name="sessionTimeoutMinutes" type="number" defaultValue={data.general.sessionTimeoutMinutes} />
                </div>
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" />Compliance Settings</CardTitle>
              <CardDescription>Screening, monitoring, and policy configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-w-lg">
              <div className="space-y-4">
                {[
                  { key: "enablePepScreening", label: "PEP Screening", desc: "Screen individuals against PEP databases" },
                  { key: "enableSanctionsScreening", label: "Sanctions Screening", desc: "Screen against global sanctions lists" },
                  { key: "enableAdverseMedia", label: "Adverse Media", desc: "Check for negative news coverage" },
                  { key: "enableTransactionMonitoring", label: "Transaction Monitoring", desc: "Monitor transactions for suspicious activity" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label>{item.label}</Label>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked={data.compliance[item.key as keyof typeof data.compliance] as boolean} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Document Expiry (days)</Label>
                  <Input type="number" defaultValue={data.compliance.documentExpiryDays} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Review Expiry (days)</Label>
                  <Input type="number" defaultValue={data.compliance.reviewExpiryDays} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>KYC Renewal (months)</Label>
                  <Input type="number" defaultValue={data.compliance.kycRenewalMonths} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label>High-Risk Countries</Label>
                <div className="flex flex-wrap gap-1">
                  {data.compliance.highRiskCountries.map((c) => (
                    <Badge key={c} variant="destructive" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sanctions Lists</Label>
                <div className="flex flex-wrap gap-1">
                  {data.compliance.sanctionsLists.map((l) => (
                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-4 w-4" />Notification Settings</CardTitle>
              <CardDescription>Manage alerts and notification channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              {[
                { key: "emailNotifications", label: "Email Notifications" },
                { key: "slackIntegration", label: "Slack Integration" },
                { key: "alertOnHighRisk", label: "Alert on High Risk" },
                { key: "alertOnSanctionsHit", label: "Alert on Sanctions Hit" },
                { key: "alertOnPepMatch", label: "Alert on PEP Match" },
                { key: "dailyDigest", label: "Daily Digest" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between rounded-lg border p-3">
                  <Label>{item.label}</Label>
                  <Switch defaultChecked={data.notifications[item.key as keyof typeof data.notifications] as boolean} />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Digest Recipients</Label>
                <div className="flex flex-wrap gap-1">
                  {data.notifications.digestRecipients.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Link2 className="h-4 w-4" />Integration Providers</CardTitle>
              <CardDescription>Third-party service configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-lg">
              {Object.entries(data.integrations).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{(value as string).replace(/_/g, " ")}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
