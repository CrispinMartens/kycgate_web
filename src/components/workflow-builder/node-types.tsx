"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  House,
  FileText,
  MapPin,
  UserRound,
  PhoneCall,
  Globe,
  ShieldAlert,
  UserCheck,
  Newspaper,
  BarChart3,
  ClipboardCheck,
  Fingerprint,
  Building2,
  Users,
  Play,
  CheckCircle2,
  Check,
  DoorOpen,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type VerificationOutcomeAction =
  | "proceed"
  | "request_documents"
  | "manual_review"
  | "retry_verification"
  | "reject";

export interface ContactInformationFields {
  emailAddress: boolean;
  mobileNumber: boolean;
  preferredContactMethod: boolean;
  bestTimeToReachYou: boolean;
}

export const DEFAULT_CONTACT_INFORMATION_FIELDS: ContactInformationFields = {
  emailAddress: true,
  mobileNumber: true,
  preferredContactMethod: true,
  bestTimeToReachYou: true,
};

export interface StepNodeData {
  label: string;
  stepType: string;
  required: boolean;
  timeoutHours?: number;
  description?: string;
  introductionImageUrl?: string;
  contactInformationFields?: ContactInformationFields;
  verificationSuccessAction?: VerificationOutcomeAction;
  verificationFailureAction?: VerificationOutcomeAction;
}

const verificationStepTypes = new Set([
  "biometric_check",
  "address_verification",
  "business_verification",
  "ubo_verification",
]);

const screeningStepTypes = new Set([
  "sanctions_screening",
  "pep_check",
  "adverse_media",
]);

const stepIcons: Record<string, React.ElementType> = {
  introduction_page: House,
  personal_information: UserRound,
  contact_information: PhoneCall,
  legal_residences: Globe,
  document_collection: FileText,
  address_verification: MapPin,
  sanctions_screening: ShieldAlert,
  pep_check: UserCheck,
  adverse_media: Newspaper,
  risk_assessment: BarChart3,
  manual_review: ClipboardCheck,
  biometric_check: Fingerprint,
  business_verification: Building2,
  ubo_verification: Users,
};

const stepColors: Record<string, { bg: string; border: string; icon: string }> = {
  introduction_page: { bg: "bg-slate-50 dark:bg-slate-950/30", border: "border-slate-300 dark:border-slate-700", icon: "text-slate-700 dark:text-slate-300" },
  personal_information: { bg: "bg-sky-50 dark:bg-sky-950/30", border: "border-sky-200 dark:border-sky-800", icon: "text-sky-600" },
  contact_information: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-600" },
  legal_residences: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", icon: "text-cyan-600" },
  document_collection: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-600" },
  address_verification: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", icon: "text-cyan-600" },
  sanctions_screening: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600" },
  pep_check: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600" },
  adverse_media: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-200 dark:border-red-800", icon: "text-red-600" },
  risk_assessment: { bg: "bg-orange-50 dark:bg-orange-950/30", border: "border-orange-200 dark:border-orange-800", icon: "text-orange-600" },
  manual_review: { bg: "bg-slate-50 dark:bg-slate-950/30", border: "border-slate-300 dark:border-slate-700", icon: "text-slate-600" },
  biometric_check: { bg: "bg-emerald-50 dark:bg-emerald-950/30", border: "border-emerald-200 dark:border-emerald-800", icon: "text-emerald-600" },
  business_verification: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", icon: "text-indigo-600" },
  ubo_verification: { bg: "bg-teal-50 dark:bg-teal-950/30", border: "border-teal-200 dark:border-teal-800", icon: "text-teal-600" },
};

export const StepNode = memo(function StepNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as StepNodeData;
  const Icon = stepIcons[nodeData.stepType] ?? FileText;
  const colors = stepColors[nodeData.stepType] ?? stepColors.document_collection;

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 shadow-sm transition-all w-[240px]",
        colors.bg,
        colors.border,
        selected && "ring-2 ring-primary ring-offset-2 shadow-md",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-muted-foreground/40 !border-2 !border-background"
      />
      <div className="p-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-background border", colors.border)}>
            <Icon className={cn("h-4 w-4", colors.icon)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate leading-tight">{nodeData.label}</p>
            <p className="text-[11px] text-muted-foreground capitalize leading-tight mt-0.5">
              {nodeData.stepType.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px]">
          {nodeData.required && (
            <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Required</span>
          )}
          {nodeData.timeoutHours && (
            <span className="text-muted-foreground">{nodeData.timeoutHours}h timeout</span>
          )}
        </div>
        {verificationStepTypes.has(nodeData.stepType) && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px]">
            <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-emerald-700">
              <Check className="h-3 w-3" />
              Pass/Fail
            </span>
            <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-700">
              <DoorOpen className="h-3 w-3" />
              Route
            </span>
          </div>
        )}
        {screeningStepTypes.has(nodeData.stepType) && (
          <div className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-0 text-muted-foreground/55">
            <Cog className="h-3.5 w-3.5 animate-spin [animation-duration:8s]" />
            <Cog className="h-3 w-3 animate-spin [animation-direction:reverse] [animation-duration:5s]" />
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-muted-foreground/40 !border-2 !border-background"
      />
    </div>
  );
});

export const StartNode = memo(function StartNode({ selected }: NodeProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 shadow-sm w-[120px] flex items-center justify-center py-2.5",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <Play className="h-4 w-4 text-emerald-600 mr-1.5" />
      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">Start</span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background"
      />
    </div>
  );
});

export const EndNode = memo(function EndNode({ selected }: NodeProps) {
  return (
    <div
      className={cn(
        "rounded-full border-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 shadow-sm w-[120px] flex items-center justify-center py-2.5",
        selected && "ring-2 ring-primary ring-offset-2",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-slate-500 !border-2 !border-background"
      />
      <CheckCircle2 className="h-4 w-4 text-slate-500 mr-1.5" />
      <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">End</span>
    </div>
  );
});

export const nodeTypes = {
  stepNode: StepNode,
  startNode: StartNode,
  endNode: EndNode,
};
