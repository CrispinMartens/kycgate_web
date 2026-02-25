"use client";

import {
  House,
  FileText,
  ScanFace,
  MapPin,
  UserRound,
  Globe,
  ShieldAlert,
  UserCheck,
  Newspaper,
  BarChart3,
  ClipboardCheck,
  Fingerprint,
  Building2,
  Users,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaletteItem {
  stepType: string;
  label: string;
  description: string;
  icon: React.ElementType;
  category: "collection" | "verification" | "screening" | "review";
}

export const paletteItems: PaletteItem[] = [
  { stepType: "introduction_page", label: "Introduction Page", description: "Welcome screen and consent start", icon: House, category: "collection" },
  { stepType: "personal_information", label: "Personal Information", description: "Capture core personal identity details", icon: UserRound, category: "collection" },
  { stepType: "legal_residences", label: "Legal Residences", description: "Collect tax and legal residency information", icon: Globe, category: "collection" },
  { stepType: "document_collection", label: "Document Collection", description: "Collect identity & proof documents", icon: FileText, category: "collection" },
  { stepType: "identity_verification", label: "Identity Verification", description: "Verify identity against documents", icon: ScanFace, category: "verification" },
  { stepType: "biometric_check", label: "Biometric Check", description: "Liveness & face match verification", icon: Fingerprint, category: "verification" },
  { stepType: "address_verification", label: "Address Verification", description: "Verify proof of address", icon: MapPin, category: "verification" },
  { stepType: "business_verification", label: "Business Verification", description: "Verify against company registries", icon: Building2, category: "verification" },
  { stepType: "ubo_verification", label: "UBO Verification", description: "Identify & verify beneficial owners", icon: Users, category: "verification" },
  { stepType: "sanctions_screening", label: "Sanctions Screening", description: "Screen against sanctions lists", icon: ShieldAlert, category: "screening" },
  { stepType: "pep_check", label: "PEP Check", description: "Check for political exposure", icon: UserCheck, category: "screening" },
  { stepType: "adverse_media", label: "Adverse Media", description: "Scan for negative news coverage", icon: Newspaper, category: "screening" },
  { stepType: "risk_assessment", label: "Risk Assessment", description: "Calculate risk score", icon: BarChart3, category: "review" },
  { stepType: "manual_review", label: "Manual Review", description: "Analyst manual review step", icon: ClipboardCheck, category: "review" },
];

const categoryLabels: Record<string, string> = {
  collection: "Data Collection",
  verification: "Verification",
  screening: "Screening",
  review: "Assessment & Review",
};

const categoryOrder = ["collection", "verification", "screening", "review"];

interface StepPaletteProps {
  onDragStart: (event: React.DragEvent, item: PaletteItem) => void;
  onItemClick?: (item: PaletteItem) => void;
}

export function StepPalette({ onDragStart, onItemClick }: StepPaletteProps) {
  const grouped = categoryOrder.map((cat) => ({
    label: categoryLabels[cat],
    items: paletteItems.filter((i) => i.category === cat),
  }));

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            {group.label}
          </p>
          <div className="space-y-1.5">
            {group.items.map((item) => (
              <div
                key={item.stepType}
                draggable
                onDragStart={(e) => onDragStart(e, item)}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border bg-card p-2.5 cursor-grab active:cursor-grabbing",
                  "hover:border-primary/40 hover:shadow-sm transition-all",
                  "select-none",
                )}
                title="Drag to canvas or click to add"
              >
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
                <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground leading-tight">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
