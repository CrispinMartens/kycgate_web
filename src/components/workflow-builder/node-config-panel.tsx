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
import {
  DEFAULT_CONTACT_INFORMATION_FIELDS,
  type ContactInformationFields,
  type StepNodeData,
  type VerificationOutcomeAction,
} from "./node-types";

interface NodeConfigPanelProps {
  node: Node;
  onUpdate: (id: string, data: Partial<StepNodeData>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const MAX_INTRO_IMAGE_DATA_URL_LENGTH = 1_250_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to read image file."));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = src;
  });
}

function compressImageToDataUrl(
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number,
  mimeType: "image/webp" | "image/jpeg",
  quality: number,
): string {
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.floor(image.width * scale));
  const height = Math.max(1, Math.floor(image.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to process image.");
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL(mimeType, quality);
}

async function getOptimizedIntroductionImage(file: File): Promise<string> {
  const source = await readFileAsDataUrl(file);
  if (source.length <= MAX_INTRO_IMAGE_DATA_URL_LENGTH) {
    return source;
  }

  const image = await loadImage(source);
  const attempts = [
    { maxWidth: 2400, maxHeight: 1800, mimeType: "image/webp" as const, quality: 0.96 },
    { maxWidth: 2200, maxHeight: 1650, mimeType: "image/webp" as const, quality: 0.92 },
    { maxWidth: 2000, maxHeight: 1500, mimeType: "image/webp" as const, quality: 0.88 },
    { maxWidth: 1800, maxHeight: 1350, mimeType: "image/jpeg" as const, quality: 0.9 },
    { maxWidth: 1600, maxHeight: 1200, mimeType: "image/jpeg" as const, quality: 0.84 },
    { maxWidth: 1440, maxHeight: 1080, mimeType: "image/jpeg" as const, quality: 0.8 },
  ];

  let lastResult = source;
  for (const attempt of attempts) {
    const result = compressImageToDataUrl(
      image,
      attempt.maxWidth,
      attempt.maxHeight,
      attempt.mimeType,
      attempt.quality,
    );
    lastResult = result;
    if (result.length <= MAX_INTRO_IMAGE_DATA_URL_LENGTH) {
      return result;
    }
  }
  return lastResult;
}

export function NodeConfigPanel({ node, onUpdate, onDelete, onClose }: NodeConfigPanelProps) {
  const data = node.data as unknown as StepNodeData;
  const isIntroductionStep = data.stepType === "introduction_page";
  const isContactInformationStep = data.stepType === "contact_information";
  const isVerificationStep = [
    "biometric_check",
    "address_verification",
    "business_verification",
    "ubo_verification",
  ].includes(data.stepType);
  const contactInformationFields =
    data.contactInformationFields ?? DEFAULT_CONTACT_INFORMATION_FIELDS;

  const updateContactInformationField = (
    field: keyof ContactInformationFields,
    checked: boolean,
  ) => {
    onUpdate(node.id, {
      contactInformationFields: {
        ...contactInformationFields,
        [field]: checked,
      },
    });
  };

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

      {isIntroductionStep && (
        <div className="space-y-2 rounded-lg border p-3">
          <Label htmlFor="intro-image-upload" className="text-xs">Introduction Left Image</Label>
          <Input
            id="intro-image-upload"
            type="file"
            accept="image/*"
            className="h-9"
            onChange={async (event) => {
              const inputElement = event.currentTarget;
              const file = event.target.files?.[0];
              if (!file || !file.type.startsWith("image/")) return;
              try {
                const optimizedDataUrl = await getOptimizedIntroductionImage(file);
                onUpdate(node.id, { introductionImageUrl: optimizedDataUrl });
              } catch {
                // Fall back quietly if image optimization fails.
              } finally {
                inputElement.value = "";
              }
            }}
          />
          {data.introductionImageUrl ? (
            <div className="space-y-2">
              <img
                src={data.introductionImageUrl}
                alt="Introduction preview"
                className="h-24 w-full rounded-md border object-cover"
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onUpdate(node.id, { introductionImageUrl: undefined })}
              >
                Remove Image
              </Button>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              Upload an image shown on the left side of the introduction page preview.
            </p>
          )}
        </div>
      )}

      {isContactInformationStep && (
        <div className="space-y-2 rounded-lg border p-3">
          <Label className="text-xs">Contact Fields to Ask</Label>
          <p className="text-[11px] text-muted-foreground">
            Choose which fields are shown to end users in this step.
          </p>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between rounded-md border px-2.5 py-2">
              <span className="text-xs">Email Address</span>
              <Switch
                checked={contactInformationFields.emailAddress}
                onCheckedChange={(checked) =>
                  updateContactInformationField("emailAddress", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-2.5 py-2">
              <span className="text-xs">Mobile Number</span>
              <Switch
                checked={contactInformationFields.mobileNumber}
                onCheckedChange={(checked) =>
                  updateContactInformationField("mobileNumber", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-2.5 py-2">
              <span className="text-xs">Preferred Contact Method</span>
              <Switch
                checked={contactInformationFields.preferredContactMethod}
                onCheckedChange={(checked) =>
                  updateContactInformationField("preferredContactMethod", checked)
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-md border px-2.5 py-2">
              <span className="text-xs">Best Time to Reach You</span>
              <Switch
                checked={contactInformationFields.bestTimeToReachYou}
                onCheckedChange={(checked) =>
                  updateContactInformationField("bestTimeToReachYou", checked)
                }
              />
            </div>
          </div>
        </div>
      )}

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
