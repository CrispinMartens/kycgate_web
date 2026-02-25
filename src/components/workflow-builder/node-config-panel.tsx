"use client";

import type { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, X } from "lucide-react";
import type { StepNodeData } from "./node-types";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (id: string, data: Partial<StepNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const data = node.data as unknown as StepNodeData;

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
