"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, ExternalLink, Search, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge, RiskScore } from "@/components/shared/risk-badge";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { Entity, PaginatedResponse } from "@/types";

export default function EntitiesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (riskFilter !== "all") params.set("riskLevel", riskFilter);

  const { data, loading, refetch } = useFetch<PaginatedResponse<Entity>>(
    `/api/entities?${params.toString()}`
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/entities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        type: form.get("type"),
        country: form.get("country"),
        industry: form.get("industry"),
      }),
    });
    refetch();
  };

  return (
    <>
      <PageHeader title="Entities" description="Manage business entities for KYB compliance">
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Entity</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Entity</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Entity Name</Label>
                <Input id="name" name="name" required placeholder="Company name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select id="type" name="type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                    <option value="trust">Trust</option>
                    <option value="non_profit">Non-Profit</option>
                    <option value="sole_proprietorship">Sole Proprietorship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" name="country" required placeholder="US" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" placeholder="Financial Services" />
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
          <Input placeholder="Search entities..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Risk" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Risk</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <TableLoading />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              {data?.pagination.total ?? 0} Entities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((entity) => (
                  <TableRow key={entity.id}>
                    <TableCell className="font-medium">{entity.name}</TableCell>
                    <TableCell className="capitalize">{entity.type.replace("_", " ")}</TableCell>
                    <TableCell>{entity.country}</TableCell>
                    <TableCell className="text-muted-foreground">{entity.industry}</TableCell>
                    <TableCell><StatusBadge status={entity.status} /></TableCell>
                    <TableCell><RiskBadge level={entity.riskLevel} /></TableCell>
                    <TableCell className="text-right"><RiskScore score={entity.riskScore} /></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/entities/${entity.id}`} aria-label="View"><ExternalLink className="h-4 w-4" /></Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No entities found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
