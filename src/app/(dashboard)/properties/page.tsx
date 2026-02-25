"use client";

import { useState } from "react";
import { ListTree, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { CustomProperty, PaginatedResponse } from "@/types";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (entityTypeFilter !== "all") params.set("entityType", entityTypeFilter);
  if (typeFilter !== "all") params.set("type", typeFilter);
  params.set("pageSize", "50");

  const { data, loading, refetch } = useFetch<PaginatedResponse<CustomProperty>>(
    `/api/properties?${params.toString()}`
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        label: fd.get("label"),
        type: fd.get("type"),
        entityType: fd.get("entityType"),
        required: fd.get("required") === "true",
        group: fd.get("group") || undefined,
      }),
    });
    refetch();
  };

  const groups = data ? [...new Set(data.data.map((p) => p.group).filter(Boolean))] : [];

  return (
    <>
      <PageHeader title="Properties" description="Define custom fields for entities, individuals, applications, and transactions">
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Property</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Custom Property</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Field Name</Label>
                  <Input id="name" name="name" required placeholder="field_name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Display Label</Label>
                  <Input id="label" name="label" required placeholder="Field Label" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="date">Date</option>
                    <option value="select">Select</option>
                    <option value="multi_select">Multi Select</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                    <option value="url">URL</option>
                    <option value="country">Country</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entityType">Entity Type</Label>
                  <select id="entityType" name="entityType" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="individual">Individual</option>
                    <option value="entity">Entity</option>
                    <option value="application">Application</option>
                    <option value="transaction">Transaction</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <Input id="group" name="group" placeholder="General" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="required">Required</Label>
                  <select id="required" name="required" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="submit">Create</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search properties..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Entity Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="entity">Entity</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="application">Application</SelectItem>
            <SelectItem value="transaction">Transaction</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Field Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="select">Select</SelectItem>
            <SelectItem value="country">Country</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ListTree className="h-4 w-4" />
              {data?.pagination.total ?? 0} Properties
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Label</TableHead>
                  <TableHead>Field Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Applies To</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((prop) => (
                  <TableRow key={prop.id}>
                    <TableCell className="font-medium">{prop.label}</TableCell>
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{prop.name}</code></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{prop.type.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{prop.entityType}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{prop.group ?? "—"}</TableCell>
                    <TableCell>{prop.required ? <Badge variant="default" className="text-xs">Yes</Badge> : <span className="text-muted-foreground text-sm">No</span>}</TableCell>
                    <TableCell><StatusBadge status={prop.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
