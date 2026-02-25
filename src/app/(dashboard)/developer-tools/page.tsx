"use client";

import { useState } from "react";
import { Code2, Key, Webhook, ScrollText, Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { ApiKey, Webhook as WebhookType, ApiLog, PaginatedResponse } from "@/types";

function ApiKeysTab() {
  const { data, loading, refetch } = useFetch<ApiKey[]>("/api/developer-tools/api-keys");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/developer-tools/api-keys/${id}`, { method: "DELETE" });
    refetch();
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/developer-tools/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        environment: fd.get("environment"),
        permissions: ["read:entities", "read:individuals", "read:applications"],
      }),
    });
    refetch();
  };

  if (loading) return <TableLoading />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Create API Key</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create API Key</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input id="keyName" name="name" required placeholder="My API Key" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="env">Environment</Label>
                <select id="env" name="environment" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="sandbox">Sandbox</option>
                  <option value="production">Production</option>
                </select>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                        {visibleKeys.has(key.id) ? key.key : `${key.prefix}${"•".repeat(12)}`}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleVisibility(key.id)}>
                        {visibleKeys.has(key.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => navigator.clipboard.writeText(key.key)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={key.environment === "production" ? "default" : "secondary"} className="text-xs capitalize">
                      {key.environment}
                    </Badge>
                  </TableCell>
                  <TableCell><StatusBadge status={key.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {key.permissions.slice(0, 2).map((p) => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                      {key.permissions.length > 2 && <Badge variant="secondary" className="text-xs">+{key.permissions.length - 2}</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    {key.status === "active" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRevoke(key.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function WebhooksTab() {
  const { data, loading } = useFetch<WebhookType[]>("/api/developer-tools/webhooks");

  if (loading) return <TableLoading />;

  return (
    <div className="space-y-3">
      {data?.map((wh) => (
        <Card key={wh.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded truncate">{wh.url}</code>
                  <StatusBadge status={wh.status} />
                  <Badge variant="outline" className="text-xs">{wh.version}</Badge>
                </div>
                {wh.description && (
                  <p className="text-sm text-muted-foreground mt-1">{wh.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {wh.events.map((ev) => (
                    <Badge key={ev} variant="secondary" className="text-xs">{ev}</Badge>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground ml-4">
                {wh.lastTriggeredAt && (
                  <div className="flex items-center gap-1">
                    <span>Last: {new Date(wh.lastTriggeredAt).toLocaleDateString()}</span>
                    <Badge variant={wh.lastResponseCode === 200 ? "default" : "destructive"} className="text-xs">
                      {wh.lastResponseCode}
                    </Badge>
                  </div>
                )}
                {wh.failureCount > 0 && (
                  <p className="text-red-500 mt-1">{wh.failureCount} failures</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LogsTab() {
  const { data, loading } = useFetch<PaginatedResponse<ApiLog>>("/api/developer-tools/logs");

  if (loading) return <TableLoading />;

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Duration</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((log) => {
              const methodColor: Record<string, string> = {
                GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                POST: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
                PUT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
                PATCH: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
                DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
              };
              return (
                <TableRow key={log.id}>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs font-mono ${methodColor[log.method] ?? ""}`}>
                      {log.method}
                    </Badge>
                  </TableCell>
                  <TableCell><code className="text-xs">{log.path}</code></TableCell>
                  <TableCell>
                    <Badge variant={log.statusCode < 300 ? "default" : log.statusCode < 400 ? "secondary" : "destructive"} className="text-xs font-mono">
                      {log.statusCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">{log.duration}ms</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{log.apiKeyName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{log.ipAddress}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function DeveloperToolsPage() {
  return (
    <>
      <PageHeader title="Developer Tools" description="Manage API keys, webhooks, and view API logs" />

      <Tabs defaultValue="api-keys" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2"><Key className="h-4 w-4" />API Keys</TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2"><Webhook className="h-4 w-4" />Webhooks</TabsTrigger>
          <TabsTrigger value="logs" className="gap-2"><ScrollText className="h-4 w-4" />API Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="api-keys"><ApiKeysTab /></TabsContent>
        <TabsContent value="webhooks"><WebhooksTab /></TabsContent>
        <TabsContent value="logs"><LogsTab /></TabsContent>
      </Tabs>
    </>
  );
}
