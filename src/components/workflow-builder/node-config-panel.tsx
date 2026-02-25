"use client";

import type { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, DoorOpen, Trash2, X } from "lucide-react";
import type { StepNodeData, VerificationOutcomeAction } from "./node-types";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (id: string, data: Partial<StepNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const data = node.data as unknown as StepNodeData;
  const isVerificationStep = [
    "biometric_check",
    "address_verification",
    "business_verification",
    "ubo_verification",
  ].includes(data.stepType);

  if (node.type === "startNode" || node.type === "endNode") {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">{node.type === "startNode" ? "Start" : "End"} Node</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {node.type === "startNode"
            ? "This is the entry point of the workflow. Every workflow must begin here."
            : "This marks the completion of the workflow. Connect the final step here."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Configure Step</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-label" className="text-xs">Step Name</Label>
        <Input
          id="node-label"
          value={data.label}
          onChange={(e) => onUpdate(node.id, { label: e.target.value })}
          className="h-9"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Step Type</Label>
        <div className="rounded-md bg-muted px-3 py-2 text-sm capitalize">
          {data.stepType.replace(/_/g, " ")}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-desc" className="text-xs">Description</Label>
        <Input
          id="node-desc"
          value={data.description ?? ""}
          onChange={(e) => onUpdate(node.id, { description: e.target.value })}
          placeholder="Optional description..."
          className="h-9"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-xs">Required</Label>
          <p className="text-[11px] text-muted-foreground">Must be completed to proceed</p>
        </div>
        <Switch
          checked={data.required}
          onCheckedChange={(checked) => onUpdate(node.id, { required: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="node-timeout" className="text-xs">Timeout (hours)</Label>
        <Input
          id="node-timeout"
          type="number"
          value={data.timeoutHours ?? ""}
          onChange={(e) => onUpdate(node.id, { timeoutHours: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="No timeout"
          className="h-9"
          min={1}
        />
      </div>

      {isVerificationStep && (
        <div className="space-y-2 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />
            <DoorOpen className="h-4 w-4 text-slate-600" />
            <Label className="text-xs">Verification Outcome Routing</Label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">If verification succeeds</Label>
            <Select
              value={data.verificationSuccessAction ?? "proceed"}
              onValueChange={(value) =>
                onUpdate(node.id, { verificationSuccessAction: value as VerificationOutcomeAction })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proceed">Proceed to next step</SelectItem>
                <SelectItem value="request_documents">Request additional documents</SelectItem>
                <SelectItem value="manual_review">Send to manual review</SelectItem>
                <SelectItem value="reject">Reject application</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] text-muted-foreground">If verification fails</Label>
            <Select
              value={data.verificationFailureAction ?? "manual_review"}
              onValueChange={(value) =>
                onUpdate(node.id, { verificationFailureAction: value as VerificationOutcomeAction })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retry_verification">Retry verification</SelectItem>
                <SelectItem value="request_documents">Request additional documents</SelectItem>
                <SelectItem value="manual_review">Send to manual review</SelectItem>
                <SelectItem value="reject">Reject application</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <Separator />

      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => onDelete(node.id)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Step
      </Button>
    </div>
  );
}
