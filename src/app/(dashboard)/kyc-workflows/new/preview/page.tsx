"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Edge, Node } from "@xyflow/react";
import { ArrowLeft, Save, AlertCircle, Check, CheckCircle2, ChevronDown, ShieldCheck, Upload, FileText, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { StepNodeData } from "@/components/workflow-builder/node-types";
import { cn } from "@/lib/utils";
import { DatePickerField } from "@/components/shared/date-picker-field";
import { useFetch } from "@/hooks/use-fetch";
import type { ThemeConfig } from "@/types";

const INTRO_IMAGE = "/kyc-intro-hero.svg";
const INTRO_MARK = "/kyc-intro-mark.svg";

type WorkflowDraft = {
  name: string;
  description: string;
  type: string;
  applicantType: string;
  themeId?: string;
  flowLayout?: "split" | "steps_top";
  nodes: Node[];
  edges: Edge[];
};

type PreviewTheme = Pick<ThemeConfig, "colors" | "typography">;

const DEFAULT_PREVIEW_THEME: PreviewTheme = {
  colors: {
    primary: "#004555",
    secondary: "#396d7a",
    accent: "#86a1a9",
    background: "#f3f4f5",
    surface: "#f7f9fa",
    text: "#0f172a",
    textSecondary: "#396d7a",
    success: "#16a34a",
    warning: "#d97706",
    error: "#dc2626",
    info: "#2563eb",
  },
  typography: {
    fontFamily: "Proxima Nova, IBM Plex Sans, system-ui, sans-serif",
    headingFontFamily: "GT Alpina, Times New Roman, serif",
    baseFontSize: "14px",
    headingWeight: "600",
  },
};

const SCREENING_STEP_TYPES = new Set([
  "sanctions_screening",
  "pep_check",
  "adverse_media",
]);

const NATIONALITY_OPTIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Netherlands",
  "Switzerland",
  "Sweden",
  "Norway",
  "Denmark",
  "Ireland",
  "Portugal",
  "Belgium",
  "Austria",
  "Poland",
  "Czech Republic",
  "Romania",
  "Greece",
  "Turkey",
  "United Arab Emirates",
  "Saudi Arabia",
  "India",
  "Singapore",
  "Hong Kong",
  "Japan",
  "South Korea",
  "Australia",
  "New Zealand",
  "Brazil",
  "Mexico",
  "South Africa",
  "Nigeria",
];

function NationalityField({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return NATIONALITY_OPTIONS;
    return NATIONALITY_OPTIONS.filter((country) =>
      country.toLowerCase().includes(search),
    );
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "preview-kyc-dropdown-trigger flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm",
            value ? "text-[#004555]" : "text-[#86a1a9]",
            className,
          )}
        >
          <span>{value || "Select nationality"}</span>
          <ChevronDown className="h-4 w-4 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-(--radix-popover-trigger-width) max-h-[280px] p-2"
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search nationality..."
          className="h-9"
        />
        <ScrollArea className="mt-2 h-40">
          <div className="space-y-1">
            {filtered.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => {
                  setValue(country);
                  setOpen(false);
                  setQuery("");
                }}
                className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span>{country}</span>
                {value === country && <Check className="h-4 w-4 text-[#004555]" />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No nationality found.
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
      <input value={value} onChange={() => undefined} className="sr-only" aria-hidden />
    </Popover>
  );
}

function buildStepsFromDraft(workflow: WorkflowDraft) {
  const stepNodes = workflow.nodes.filter((n) => n.type === "stepNode");
  const edgeMap = new Map<string, string>();
  workflow.edges.forEach((e) => edgeMap.set(e.source, e.target));

  const ordered: Node[] = [];
  let current = "start";
  const visited = new Set<string>();

  while (current && !visited.has(current)) {
    visited.add(current);
    const nextId = edgeMap.get(current);
    if (nextId && nextId !== "end") {
      const node = stepNodes.find((n) => n.id === nextId);
      if (node) ordered.push(node);
    }
    current = nextId ?? "";
  }

  const unlinked = stepNodes.filter((n) => !ordered.some((o) => o.id === n.id));
  const allSteps = [...ordered, ...unlinked].filter((node) => {
    const data = node.data as unknown as StepNodeData;
    return !SCREENING_STEP_TYPES.has(data.stepType);
  });

  return allSteps.map((node, i) => {
    const data = node.data as unknown as StepNodeData;
    return {
      id: node.id,
      name: data.label,
      type: data.stepType,
      order: i + 1,
      required: data.required,
      timeoutHours: data.timeoutHours,
      description: data.description,
    };
  });
}

function getStepHeadlineSubtext(stepType: string) {
  switch (stepType) {
    case "personal_information":
      return "This helps confirm your legal identity.";
    case "contact_information":
      return "This lets us contact you about onboarding updates.";
    case "legal_residences":
      return "This is needed to meet tax and residency regulations.";
    case "document_collection":
    case "identity_verification":
      return "This is required to verify your documents and identity.";
    case "address_verification":
      return "This is used to validate your current address.";
    case "biometric_check":
      return "This confirms you match your identification document.";
    case "business_verification":
      return "This verifies your business registration details.";
    case "ubo_verification":
      return "This identifies beneficial owners for transparency checks.";
    case "risk_assessment":
      return "This helps assess your compliance risk profile.";
    case "manual_review":
      return "This supports compliance during the final review.";
    default:
      return "This information is needed to complete regulatory onboarding.";
  }
}

function StepContent({
  step,
  onContinue,
  variant = "light",
  theme = DEFAULT_PREVIEW_THEME,
}: {
  step: ReturnType<typeof buildStepsFromDraft>[number];
  onContinue: () => void;
  variant?: "light" | "intro";
  theme?: PreviewTheme;
}) {
  const isIntroTheme = variant === "intro";
  const labelClass = isIntroTheme ? "text-[#004555]" : "";
  const inputClass = isIntroTheme
    ? "bg-white border-[#d5e0e5] text-[#004555] placeholder:text-[#86a1a9] focus-visible:ring-[#004555]/30"
    : "";
  const sectionTextClass = isIntroTheme ? "text-[#396d7a]" : "text-sm text-muted-foreground";

  switch (step.type) {
    case "introduction_page":
      return (
        <div className="-mx-6 -my-4 border-y bg-[#f3f4f5]">
          <div className="grid min-h-[540px] grid-cols-1 md:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[360px] md:min-h-[540px]">
              <img
                src={INTRO_IMAGE}
                alt="Luxury door handle"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center">
              <div className="w-full max-w-[620px] px-8 py-10 md:px-14">
                <img src={INTRO_MARK} alt="" className="h-16 w-12" />
                <h1
                  className="mt-7 text-[46px] leading-[1.05] text-[#004555]"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: theme.typography.headingFontFamily,
                    fontWeight: theme.typography.headingWeight,
                  }}
                >
                  Become a client
                </h1>
                <p
                  className="mt-4 text-[16px] leading-[1.95] text-[#396d7a] max-w-[560px]"
                  style={{ color: theme.colors.textSecondary }}
                >
                  With more than 300 years of heritage in private banking and investment
                  management, we partner with entrepreneurs, executives and families to grow,
                  protect and transfer wealth across generations.
                </p>
                <Button
                  onClick={onContinue}
                  className="mt-9 h-[49px] w-full rounded-none bg-[#004555] text-[24px] hover:bg-[#003a48]"
                  style={{ backgroundColor: theme.colors.primary, fontFamily: theme.typography.fontFamily }}
                >
                  Proceed
                </Button>
              </div>
            </div>
          </div>
        </div>
      );

    case "document_collection":
    case "identity_verification":
      return (
        <div className="space-y-4">
          <div className={`rounded-lg border border-dashed p-6 text-center ${isIntroTheme ? "border-[#b8cdd5] bg-white" : ""}`}>
            <Upload className={`mx-auto h-6 w-6 mb-2 ${isIntroTheme ? "text-[#396d7a]" : "text-muted-foreground"}`} />
            <p className={`text-sm font-medium ${isIntroTheme ? "text-[#004555]" : ""}`}>Upload Identity Documents</p>
            <p className={`text-xs mt-1 ${isIntroTheme ? "text-[#396d7a]" : "text-muted-foreground"}`}>
              Passport/National ID and proof of address
            </p>
            <Button variant="outline" size="sm" className={`mt-3 ${isIntroTheme ? "border-[#004555]/30 text-[#004555] hover:bg-[#e8f0f3]" : ""}`}>
              <FileText className="mr-2 h-4 w-4" />
              Select files
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={labelClass}>Document Type</Label>
              <Select defaultValue="passport">
                <SelectTrigger className={`w-full data-[size=default]:h-9 ${inputClass}`}>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="residence_permit">Residence Permit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Issuing Country</Label>
              <Select defaultValue="United States">
                <SelectTrigger className={`w-full data-[size=default]:h-9 ${inputClass}`}>
                  <SelectValue placeholder="Select issuing country" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITY_OPTIONS.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );

    case "personal_information":
      return (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelClass}>First Name</Label>
                <Input placeholder="Jane" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Last Name</Label>
                <Input placeholder="Doe" className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelClass}>Date of Birth</Label>
                <DatePickerField className={inputClass} required />
              </div>
            </div>
          </div>
        </div>
      );

    case "contact_information":
      return (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Email Address</Label>
              <Input type="email" placeholder="jane.doe@email.com" className={inputClass} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelClass}>Mobile Number</Label>
                <Input placeholder="+1 555 123 4567" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Preferred Contact Method</Label>
                <Select defaultValue="email">
                  <SelectTrigger className={`w-full data-[size=default]:h-9 ${inputClass}`}>
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Best Time to Reach You</Label>
              <Input placeholder="Weekdays, 9:00 - 17:00" className={inputClass} />
            </div>
          </div>
        </div>
      );

    case "legal_residences":
      return (
        <div className="space-y-4">
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Primary Country of Legal Residence</Label>
              <Select defaultValue="United Kingdom">
                <SelectTrigger className={`w-full data-[size=default]:h-9 ${inputClass}`}>
                  <SelectValue placeholder="Select primary legal residence country" />
                </SelectTrigger>
                <SelectContent>
                  {NATIONALITY_OPTIONS.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelClass}>Tax Identification Number</Label>
                <Input placeholder="AB123456C" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Resident Since</Label>
                <DatePickerField className={inputClass} required />
              </div>
            </div>
          </div>
        </div>
      );

    case "biometric_check":
      return (
        <div className="space-y-4">
          <p className={sectionTextClass}>
            We will verify your identity by matching your document with a selfie.
          </p>
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Full Legal Name</Label>
              <Input placeholder="Jane Doe" className={inputClass} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className={labelClass}>Date of Birth</Label>
                <DatePickerField className={inputClass} required />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Nationality</Label>
                <NationalityField className={inputClass} />
              </div>
            </div>
          </div>
        </div>
      );

    case "address_verification":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={labelClass}>Street Address</Label>
            <Input placeholder="123 Main Street" className={inputClass} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>City</Label>
              <Input placeholder="New York" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>State</Label>
              <Input placeholder="NY" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Postal Code</Label>
              <Input placeholder="10001" className={inputClass} />
            </div>
          </div>
        </div>
      );

    case "business_verification":
      return (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className={labelClass}>Legal Business Name</Label>
            <Input placeholder="Acme Inc." className={inputClass} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className={labelClass}>Registration Number</Label>
              <Input placeholder="REG-12345" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Incorporation Country</Label>
              <NationalityField className={inputClass} />
            </div>
          </div>
        </div>
      );

    case "ubo_verification":
      return (
        <div className="space-y-3">
          <p className={sectionTextClass}>
            Provide Ultimate Beneficial Owner information (25%+ ownership).
          </p>
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="grid gap-3 md:grid-cols-3">
              <Input placeholder="Owner name" className={inputClass} />
              <Input placeholder="Nationality" className={inputClass} />
              <Input placeholder="% Ownership" className={inputClass} />
            </div>
            <Button variant="outline" size="sm" className={isIntroTheme ? "border-[#004555]/30 text-[#004555] hover:bg-[#e8f0f3]" : ""}>
              + Add another owner
            </Button>
          </div>
        </div>
      );

    case "sanctions_screening":
    case "pep_check":
    case "adverse_media":
      return (
        <div className={`rounded-lg border p-4 space-y-2 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
          <div className={`flex items-center gap-2 text-sm font-medium ${isIntroTheme ? "text-[#004555]" : ""}`}>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Automated screening in progress
          </div>
          <p className={sectionTextClass}>
            Your details are being checked against global watchlists and data providers.
          </p>
          <Progress value={65} className="h-2 mt-2" />
        </div>
      );

    case "risk_assessment":
      return (
        <div className="space-y-3">
          <p className={sectionTextClass}>
            Help us understand your profile for risk assessment.
          </p>
          <div className="space-y-1.5">
            <Label className={labelClass}>Source of Funds</Label>
            <Textarea placeholder="Employment income, business revenue, investments..." rows={3} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <Label className={labelClass}>Expected Monthly Transaction Volume</Label>
            <Input placeholder="$10,000 - $25,000" className={inputClass} />
          </div>
        </div>
      );

    case "manual_review":
      return (
        <div className={`rounded-lg border p-4 space-y-2 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
          <p className={`text-sm font-medium ${isIntroTheme ? "text-[#004555]" : ""}`}>Manual compliance review required</p>
          <p className={sectionTextClass}>
            Our compliance team will review your submission. You may be contacted for additional documents.
          </p>
        </div>
      );

    default:
      return (
        <div className="rounded-lg border p-4">
          <p className={sectionTextClass}>
            This step type is configured but has no dedicated preview template yet.
          </p>
        </div>
      );
  }
}

function SplitStepRail({
  steps,
  currentIndex,
  theme,
}: {
  steps: ReturnType<typeof buildStepsFromDraft>;
  currentIndex: number;
  theme: PreviewTheme;
}) {
  return (
    <aside
      className="w-[320px] border-r px-10 py-12"
      style={{ borderColor: theme.colors.accent, backgroundColor: theme.colors.surface }}
    >
      <img src={INTRO_MARK} alt="Brand" className="h-16 w-12 mb-14" />
      <div className="space-y-8">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={step.id} className="flex items-center gap-4">
              <div className="relative h-5 w-5">
                {isActive ? (
                  <span
                    className="absolute inset-0 rounded-full border-2 animate-spin [animation-duration:2s]"
                    style={{
                      borderColor: `${theme.colors.primary}40`,
                      borderTopColor: theme.colors.primary,
                    }}
                  />
                ) : null}
                <div
                  className={[
                    "h-5 w-5 rounded-full border flex items-center justify-center text-[10px]",
                    isDone ? "text-white" : isActive ? "bg-white" : "",
                  ].join(" ")}
                  style={{
                    borderColor: isDone || isActive ? theme.colors.primary : theme.colors.accent,
                    backgroundColor: isDone ? theme.colors.primary : undefined,
                    color: isDone ? "#ffffff" : isActive ? theme.colors.primary : theme.colors.textSecondary,
                  }}
                >
                  {isDone ? "✓" : ""}
                </div>
              </div>
              <span
                className={[
                  "text-sm",
                  isActive ? "font-medium" : "",
                ].join(" ")}
                style={{
                  color: isDone || isActive ? theme.colors.primary : theme.colors.textSecondary,
                }}
              >
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function TopStepProgress({
  steps,
  currentIndex,
  theme,
}: {
  steps: ReturnType<typeof buildStepsFromDraft>;
  currentIndex: number;
  theme: PreviewTheme;
}) {
  return (
    <div
      className="border-b px-6 py-5"
      style={{ borderColor: `${theme.colors.accent}80`, backgroundColor: theme.colors.surface }}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div
              key={step.id}
              className="rounded-md border px-3 py-2"
              style={{
                borderColor: isDone || isActive ? theme.colors.primary : `${theme.colors.accent}80`,
                backgroundColor: isDone ? `${theme.colors.primary}12` : "#fff",
              }}
            >
              <p
                className="text-xs font-semibold"
                style={{ color: isDone || isActive ? theme.colors.primary : theme.colors.textSecondary }}
              >
                Step {index + 1}
              </p>
              <p
                className="mt-0.5 text-sm"
                style={{ color: isDone || isActive ? theme.colors.primary : theme.colors.text }}
              >
                {step.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewFlowPageInner() {
  const router = useRouter();
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const stepFieldsRef = useRef<HTMLDivElement | null>(null);
  const { data: themes } = useFetch<ThemeConfig[]>("/api/themes");

  useEffect(() => {
    const raw = sessionStorage.getItem("kycgate.workflowDraft");
    if (!raw) return;
    try {
      setDraft(JSON.parse(raw) as WorkflowDraft);
    } catch {
      setDraft(null);
    }
  }, []);

  const orderedSteps = useMemo(() => (draft ? buildStepsFromDraft(draft) : []), [draft]);
  const selectedTheme = useMemo(
    () => themes?.find((item) => item.id === draft?.themeId),
    [themes, draft?.themeId],
  );
  const previewTheme = selectedTheme ?? DEFAULT_PREVIEW_THEME;
  const selectedLayout = draft?.flowLayout ?? "split";
  const isComplete = stepIndex >= orderedSteps.length;
  const currentStep = orderedSteps[stepIndex];
  const progress =
    orderedSteps.length === 0 ? 0 : Math.round((Math.min(stepIndex, orderedSteps.length) / orderedSteps.length) * 100);

  const validateCurrentStepFields = () => {
    const container = stepFieldsRef.current;
    if (!container) return true;

    const fields = container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea");
    if (fields.length === 0) return true;

    for (const field of fields) {
      const value = field.value.trim();
      field.setCustomValidity("");

      if (!value) {
        field.setCustomValidity("This field is required.");
        field.reportValidity();
        return false;
      }

      if (field instanceof HTMLInputElement && field.type === "email") {
        const isValidEmail = /\S+@\S+\.\S+/.test(value);
        if (!isValidEmail) {
          field.setCustomValidity("Please enter a valid email address.");
          field.reportValidity();
          return false;
        }
      }
    }

    const dateFields = container.querySelectorAll<HTMLButtonElement>(
      'button[data-datepicker-required="true"]',
    );
    for (const dateField of dateFields) {
      const value = (dateField.dataset.datepickerValue ?? "").trim();
      if (!value) {
        dateField.focus();
        return false;
      }
    }

    return true;
  };

  const handleProceed = () => {
    if (!validateCurrentStepFields()) return;
    setStepIndex((i) => Math.min(orderedSteps.length, i + 1));
  };

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    const resolvedName =
      draft.name.trim() || `Untitled ${draft.type.toUpperCase()} Workflow`;
    await fetch("/api/kyc-workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: resolvedName,
        description: draft.description,
        type: draft.type,
        applicantType: draft.applicantType,
        themeId: draft.themeId,
        flowLayout: selectedLayout,
        steps: orderedSteps.map((step) => ({
          id: step.id,
          name: step.name,
          type: step.type,
          order: step.order,
          required: step.required,
          config: {},
          timeoutHours: step.timeoutHours,
        })),
        status: "inactive",
      }),
    });
    setSaving(false);
    sessionStorage.removeItem("kycgate.workflowDraft");
    localStorage.removeItem("kycgate.workflowDraftFullPreview");
    router.push("/kyc-workflows");
  };

  const handlePreviewInFull = () => {
    if (!draft) return;
    localStorage.setItem("kycgate.workflowDraftFullPreview", JSON.stringify(draft));
    window.open("/kyc-flow-preview/full", "_blank", "noopener,noreferrer");
  };

  const handleBackToBuilder = () => {
    sessionStorage.setItem("kycgate.resumeDraft", "1");
    router.push("/kyc-workflows/new");
  };

  if (!draft) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToBuilder}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Builder
        </Button>
        <Card>
          <CardContent className="py-10 text-center">
            <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="font-medium">No workflow draft found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Open the builder and click "Preview Flow" to view your customized flow.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="preview-kyc-flow min-h-[calc(100vh-3.5rem)] -m-6 p-6"
      style={{
        backgroundColor: previewTheme.colors.background,
        color: previewTheme.colors.text,
        fontFamily: previewTheme.typography.fontFamily,
        fontSize: previewTheme.typography.baseFontSize,
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToBuilder}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Builder
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreviewInFull} disabled={orderedSteps.length === 0}>
              <Expand className="mr-2 h-4 w-4" />
              Preview in Full
            </Button>
            <Button onClick={handleSave} disabled={saving || orderedSteps.length === 0}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Workflow"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Identity Verification</CardTitle>
                <CardDescription className="mt-1">
                  {draft.name || "Untitled Workflow"} - Customer Journey Preview
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="uppercase text-xs">
                  {draft.type}
                </Badge>
                <Badge variant="secondary" className="capitalize text-xs">
                  {draft.applicantType}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {isComplete
                    ? `Completed ${orderedSteps.length} of ${orderedSteps.length} steps`
                    : `Step ${stepIndex + 1} of ${orderedSteps.length}`}
                </span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {!isComplete && currentStep ? (
              <>
                <div className="space-y-1">
                  <p className="text-base font-semibold">{currentStep.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {currentStep.type.replace(/_/g, " ")}
                  </p>
                </div>
                {currentStep.type === "introduction_page" ? (
                  <StepContent
                    step={currentStep}
                    theme={previewTheme}
                    onContinue={() => setStepIndex((i) => Math.min(orderedSteps.length, i + 1))}
                  />
                ) : selectedLayout === "split" ? (
                  <div
                    className="-mx-6 -my-4 border-y"
                    style={{
                      borderColor: `${previewTheme.colors.accent}80`,
                      backgroundColor: previewTheme.colors.background,
                    }}
                  >
                    <div className="grid min-h-[640px] grid-cols-[320px_1fr]">
                      <SplitStepRail steps={orderedSteps} currentIndex={stepIndex} theme={previewTheme} />
                      <section className="px-12 py-14" style={{ backgroundColor: previewTheme.colors.background }}>
                        <div className="max-w-[640px] space-y-8">
                          <div>
                            <h2
                              className="text-[48px] leading-[1.05] tracking-[-0.02em]"
                              style={{
                                color: previewTheme.colors.primary,
                                fontFamily: previewTheme.typography.headingFontFamily,
                                fontWeight: previewTheme.typography.headingWeight,
                              }}
                            >
                              {currentStep.name}
                            </h2>
                            <p className="mt-3 text-[20px]" style={{ color: previewTheme.colors.textSecondary }}>
                              {getStepHeadlineSubtext(currentStep.type)}
                            </p>
                          </div>

                          <div ref={stepFieldsRef}>
                            <StepContent
                              step={currentStep}
                              variant="intro"
                              theme={previewTheme}
                              onContinue={handleProceed}
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                              disabled={stepIndex === 0}
                              className=""
                              style={{
                                borderColor: `${previewTheme.colors.primary}66`,
                                color: previewTheme.colors.primary,
                              }}
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={handleProceed}
                              className="h-[56px] rounded-none px-10 text-white"
                              style={{ backgroundColor: previewTheme.colors.primary }}
                            >
                              {stepIndex === orderedSteps.length - 1 ? "Finish Review" : "Proceed"}
                            </Button>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div
                    className="-mx-6 -my-4 border-y"
                    style={{
                      borderColor: `${previewTheme.colors.accent}80`,
                      backgroundColor: previewTheme.colors.background,
                    }}
                  >
                    <TopStepProgress steps={orderedSteps} currentIndex={stepIndex} theme={previewTheme} />
                    <section className="px-10 py-12" style={{ backgroundColor: previewTheme.colors.background }}>
                      <div className="mx-auto w-full max-w-[1120px] space-y-8">
                        <div>
                          <h2
                            className="text-[48px] leading-[1.05] tracking-[-0.02em]"
                            style={{
                              color: previewTheme.colors.primary,
                              fontFamily: previewTheme.typography.headingFontFamily,
                              fontWeight: previewTheme.typography.headingWeight,
                            }}
                          >
                            {currentStep.name}
                          </h2>
                          <p className="mt-3 text-[20px]" style={{ color: previewTheme.colors.textSecondary }}>
                            {getStepHeadlineSubtext(currentStep.type)}
                          </p>
                        </div>

                        <div ref={stepFieldsRef}>
                          <StepContent
                            step={currentStep}
                            variant="intro"
                            theme={previewTheme}
                            onContinue={handleProceed}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                            disabled={stepIndex === 0}
                            style={{
                              borderColor: `${previewTheme.colors.primary}66`,
                              color: previewTheme.colors.primary,
                            }}
                          >
                            Previous
                          </Button>
                          <Button
                            onClick={handleProceed}
                            className="h-[56px] rounded-none px-10 text-white"
                            style={{ backgroundColor: previewTheme.colors.primary }}
                          >
                            {stepIndex === orderedSteps.length - 1 ? "Finish Review" : "Proceed"}
                          </Button>
                        </div>
                      </div>
                    </section>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 space-y-3">
                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600" />
                <p className="text-lg font-semibold">Flow Complete</p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This is what end users experience when going through your customized workflow.
                </p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStepIndex(0)}>
                    Restart Preview
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configured Journey Steps</CardTitle>
            <CardDescription>Reference list for this preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {orderedSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2 rounded-md border px-3 py-2">
                <Badge variant="secondary" className="w-7 justify-center">
                  {index + 1}
                </Badge>
                <span className="text-sm font-medium">{step.name}</span>
                <span className="text-xs text-muted-foreground ml-auto capitalize">
                  {step.type.replace(/_/g, " ")}
                </span>
              </div>
            ))}
            {orderedSteps.length === 0 && (
              <p className="text-sm text-muted-foreground">No steps configured.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PreviewFlowPage() {
  return <PreviewFlowPageInner />;
}

