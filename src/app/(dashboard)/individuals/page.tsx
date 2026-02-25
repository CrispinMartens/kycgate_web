"use client";

import { useState } from "react";
import { Users, Search, Plus, ShieldAlert, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RiskBadge, RiskScore } from "@/components/shared/risk-badge";
import { TableLoading } from "@/components/shared/loading";
import { useFetch } from "@/hooks/use-fetch";
import type { Individual, PaginatedResponse } from "@/types";

export default function IndividualsPage() {
  const [search, setSearch] = useState("");
  const [kycFilter, setKycFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (kycFilter !== "all") params.set("kycStatus", kycFilter);
  if (riskFilter !== "all") params.set("riskLevel", riskFilter);

  const { data, loading, refetch } = useFetch<PaginatedResponse<Individual>>(
    `/api/individuals?${params.toString()}`
  );

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await fetch("/api/individuals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        email: form.get("email"),
        nationality: form.get("nationality"),
        dateOfBirth: form.get("dateOfBirth"),
      }),
    });
    refetch();
  };

  return (
    <>
      <PageHeader title="Individuals" description="Manage individual profiles for KYC verification">
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Individual</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Individual</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input id="nationality" name="nationality" placeholder="US" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input id="dateOfBirth" name="dateOfBirth" type="date" />
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
          <Input placeholder="Search individuals..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={kycFilter} onValueChange={setKycFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="KYC Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All KYC</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
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
              <Users className="h-4 w-4" />
              {data?.pagination.total ?? 0} Individuals
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.map((ind) => (
                  <TableRow key={ind.id}>
                    <TableCell className="font-medium">
                      {ind.firstName} {ind.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ind.email}</TableCell>
                    <TableCell>{ind.nationality}</TableCell>
                    <TableCell><StatusBadge status={ind.kycStatus} /></TableCell>
                    <TableCell><RiskBadge level={ind.riskLevel} /></TableCell>
                    <TableCell className="text-right"><RiskScore score={ind.riskScore} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {ind.pepStatus && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 text-xs">PEP</Badge>
                            </TooltipTrigger>
                            <TooltipContent>Politically Exposed Person</TooltipContent>
                          </Tooltip>
                        )}
                        {ind.sanctionsHit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="destructive" className="text-xs gap-1"><ShieldAlert className="h-3 w-3" />SAN</Badge>
                            </TooltipTrigger>
                            <TooltipContent>Sanctions List Match</TooltipContent>
                          </Tooltip>
                        )}
                        {ind.adverseMedia && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 text-xs gap-1"><AlertTriangle className="h-3 w-3" />AM</Badge>
                            </TooltipTrigger>
                            <TooltipContent>Adverse Media</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {data?.data.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No individuals found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
