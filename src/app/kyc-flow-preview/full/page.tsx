"use client";

import { useEffect, useMemo, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { AlertCircle, CheckCircle2, ShieldCheck, Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StepNodeData } from "@/components/workflow-builder/node-types";

const INTRO_IMAGE =
  "http://localhost:3845/assets/fe90864170fe71788a5168267867913e53248551.png";
const INTRO_MARK =
  "http://localhost:3845/assets/875f40dbfbc030fffe01dba90b6f050410ffb9aa.svg";

type WorkflowDraft = {
  name: string;
  description: string;
  type: string;
  applicantType: string;
  nodes: Node[];
  edges: Edge[];
};

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
  const allSteps = [...ordered, ...unlinked];

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

function StepContent({
  step,
  onContinue,
  variant = "light",
}: {
  step: ReturnType<typeof buildStepsFromDraft>[number];
  onContinue: () => void;
  variant?: "light" | "intro";
}) {
  const isIntroTheme = variant === "intro";
  const labelClass = isIntroTheme ? "text-[#004555]" : "";
  const inputClass = isIntroTheme
    ? "h-12 bg-white border-[#d5e0e5] text-[#004555] placeholder:text-[#86a1a9] focus-visible:ring-[#004555]/30"
    : "h-12";
  const textareaClass = isIntroTheme
    ? "min-h-[140px] bg-white border-[#d5e0e5] text-[#004555] placeholder:text-[#86a1a9] focus-visible:ring-[#004555]/30"
    : "min-h-[140px]";
  const sectionTextClass = isIntroTheme ? "text-[#396d7a]" : "text-sm text-muted-foreground";

  switch (step.type) {
    case "introduction_page":
      return (
        <div className="border-y bg-[#f3f4f5]">
          <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[1.05fr_1fr]">
            <div className="relative min-h-[360px] md:min-h-dvh">
              <img
                src={INTRO_IMAGE}
                alt="Luxury door handle"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="flex items-center">
              <div className="w-full max-w-[620px] px-8 py-10 md:px-14">
                <img src={INTRO_MARK} alt="" className="h-16 w-12" />
                <h1 className="mt-7 text-[46px] leading-[1.05] font-serif text-[#004555]">
                  Become a client
                </h1>
                <p className="mt-4 text-[16px] leading-[1.95] text-[#396d7a] max-w-[560px]">
                  With more than 300 years of heritage in private banking and investment
                  management, we partner with entrepreneurs, executives and families to grow,
                  protect and transfer wealth across generations.
                </p>
                <Button
                  onClick={onContinue}
                  className="mt-9 h-[49px] w-full rounded-none bg-[#004555] text-[24px] font-serif hover:bg-[#003a48]"
                >
                  Proceed
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    case "document_collection":
      return (
        <div className="space-y-4">
          <div className={`rounded-lg border border-dashed p-6 text-center ${isIntroTheme ? "border-[#b8cdd5] bg-white" : ""}`}>
            <Upload className={`mx-auto h-6 w-6 mb-2 ${isIntroTheme ? "text-[#396d7a]" : "text-muted-foreground"}`} />
            <p className={`text-sm font-medium ${isIntroTheme ? "text-[#004555]" : ""}`}>Upload Identity Documents</p>
            <p className={`text-xs mt-1 ${isIntroTheme ? "text-[#396d7a]" : "text-muted-foreground"}`}>Passport/National ID and proof of address</p>
            <Button variant="outline" size="sm" className={`mt-3 ${isIntroTheme ? "border-[#004555]/30 text-[#004555] hover:bg-[#e8f0f3]" : ""}`}>
              <FileText className="mr-2 h-4 w-4" />
              Select files
            </Button>
          </div>
          <div className="grid gap-5">
            <div className="space-y-1.5">
              <Label className={labelClass}>Document Type</Label>
              <Input defaultValue="Passport" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Issuing Country</Label>
              <Input defaultValue="United States" className={inputClass} />
            </div>
          </div>
        </div>
      );
    case "personal_information":
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <Label className={labelClass}>First Name</Label>
                <Input placeholder="Jane" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Last Name</Label>
                <Input placeholder="Doe" className={inputClass} />
              </div>
            </div>
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <Label className={labelClass}>Date of Birth</Label>
                <Input type="date" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Nationality</Label>
                <Input placeholder="United States" className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Email Address</Label>
              <Input type="email" placeholder="jane.doe@email.com" className={inputClass} />
            </div>
          </div>
        </div>
      );
    case "legal_residences":
      return (
        <div className="space-y-4">
          <p className={sectionTextClass}>
            Tell us where you are legally resident for tax and compliance purposes.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Primary Country of Legal Residence</Label>
              <Input placeholder="United Kingdom" className={inputClass} />
            </div>
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <Label className={labelClass}>Tax Identification Number</Label>
                <Input placeholder="AB123456C" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Resident Since</Label>
                <Input type="date" className={inputClass} />
              </div>
            </div>
          </div>
        </div>
      );
    case "identity_verification":
    case "biometric_check":
      return (
        <div className="space-y-4">
          <p className={sectionTextClass}>
            We will verify your identity by matching your document with a selfie.
          </p>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className={labelClass}>Full Legal Name</Label>
              <Input placeholder="Jane Doe" className={inputClass} />
            </div>
            <div className="grid gap-5">
              <div className="space-y-1.5">
                <Label className={labelClass}>Date of Birth</Label>
                <Input type="date" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <Label className={labelClass}>Nationality</Label>
                <Input placeholder="US" className={inputClass} />
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
          <div className="grid gap-5">
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
          <div className="grid gap-5">
            <div className="space-y-1.5">
              <Label className={labelClass}>Registration Number</Label>
              <Input placeholder="REG-12345" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Incorporation Country</Label>
              <Input placeholder="US" className={inputClass} />
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
          <div className="space-y-3">
            <div className="grid gap-5">
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
          <p className={sectionTextClass}>Help us understand your profile for risk assessment.</p>
          <div className="space-y-1.5">
            <Label className={labelClass}>Source of Funds</Label>
            <Textarea placeholder="Employment income, business revenue, investments..." rows={3} className={textareaClass} />
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
            Continue through this step in the onboarding journey.
          </p>
        </div>
      );
  }
}

function SplitStepRail({
  steps,
  currentIndex,
}: {
  steps: ReturnType<typeof buildStepsFromDraft>;
  currentIndex: number;
}) {
  return (
    <aside className="w-[320px] border-r border-[#d8e3e7] px-10 py-12 bg-[#f7f9fa]">
      <img src={INTRO_MARK} alt="Brand" className="h-16 w-12 mb-14" />
      <div className="space-y-8">
        {steps.map((step, index) => {
          const isDone = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <div key={step.id} className="flex items-center gap-4">
              <div
                className={[
                  "h-5 w-5 rounded-full border flex items-center justify-center text-[10px]",
                  isDone
                    ? "bg-[#004555] border-[#004555] text-white"
                    : isActive
                      ? "border-[#004555] text-[#004555]"
                      : "border-[#c7d6dc] text-[#8ba3ab]",
                ].join(" ")}
              >
                {isDone ? "✓" : ""}
              </div>
              <span
                className={[
                  "text-sm",
                  isDone ? "text-[#004555]" : isActive ? "text-[#004555] font-medium" : "text-[#8ba3ab]",
                ].join(" ")}
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

export default function FullFlowPreviewPage() {
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [showTopBar, setShowTopBar] = useState(false);

  useEffect(() => {
    const raw =
      localStorage.getItem("kycgate.workflowDraftFullPreview") ||
      sessionStorage.getItem("kycgate.workflowDraft");
    if (!raw) return;
    try {
      setDraft(JSON.parse(raw) as WorkflowDraft);
    } catch {
      setDraft(null);
    }
  }, []);

  const orderedSteps = useMemo(() => (draft ? buildStepsFromDraft(draft) : []), [draft]);
  const isComplete = stepIndex >= orderedSteps.length;
  const currentStep = orderedSteps[stepIndex];
  const progress =
    orderedSteps.length === 0 ? 0 : Math.round((Math.min(stepIndex, orderedSteps.length) / orderedSteps.length) * 100);

  if (!draft) {
    return (
      <div className="min-h-screen bg-muted/20 p-8">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">No workflow preview data found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Open "Preview in Full" from the workflow preview screen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f5]">
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="secondary"
          size="sm"
          className="shadow-md bg-white/90 backdrop-blur"
          onClick={() => setShowTopBar((v) => !v)}
        >
          {showTopBar ? "Hide Header" : "Show Header"}
        </Button>
      </div>

      {showTopBar && (
        <header className="border-b border-[#d8e3e7] bg-white/70 backdrop-blur px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-medium text-[#004555]">
                {draft.name || "Customer Onboarding"}
              </p>
              <p className="text-sm text-[#396d7a]">Full-screen end-customer flow preview</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase text-xs">{draft.type}</Badge>
              <Badge variant="secondary" className="capitalize text-xs">{draft.applicantType}</Badge>
            </div>
          </div>
          <div className="space-y-1 mt-3">
            <div className="flex items-center justify-between text-xs text-[#6b8790]">
              <span>
                {isComplete
                  ? `Completed ${orderedSteps.length} of ${orderedSteps.length} steps`
                  : `Step ${stepIndex + 1} of ${orderedSteps.length}`}
              </span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </header>
      )}

      <main className={showTopBar ? "min-h-[calc(100vh-97px)]" : "min-h-screen"}>
        {!isComplete && currentStep ? (
          <>
            {currentStep.type === "introduction_page" ? (
              <StepContent
                step={currentStep}
                onContinue={() => setStepIndex((i) => Math.min(orderedSteps.length, i + 1))}
              />
            ) : (
              <div className={showTopBar ? "grid min-h-[calc(100vh-97px)] grid-cols-[320px_1fr]" : "grid min-h-screen grid-cols-[320px_1fr]"}>
                <SplitStepRail steps={orderedSteps} currentIndex={stepIndex} />
                <section className="bg-[#f3f4f5] px-12 py-14 flex items-center justify-center">
                  <div className="w-full max-w-[640px] space-y-8">
                    <div>
                      <h2 className="text-[48px] leading-[1.05] text-[#004555] tracking-[-0.02em]">
                        {currentStep.name}
                      </h2>
                      <p className="mt-3 text-[20px] text-[#396d7a]">
                        We are asking these questions for the
                      </p>
                    </div>

                    <StepContent
                      step={currentStep}
                      variant="intro"
                      onContinue={() => setStepIndex((i) => Math.min(orderedSteps.length, i + 1))}
                    />

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                        disabled={stepIndex === 0}
                        className="h-[56px] w-[180px] rounded-none border-[#004555]/30 text-[#004555] hover:bg-[#e8f0f3]"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setStepIndex((i) => Math.min(orderedSteps.length, i + 1))}
                        className="h-[56px] w-[180px] rounded-none bg-[#004555] text-white hover:bg-[#003a48]"
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
          <div className={showTopBar ? "min-h-[calc(100vh-97px)] grid place-items-center px-8" : "min-h-screen grid place-items-center px-8"}>
            <div className="text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-600" />
              <p className="text-lg font-semibold">Flow Complete</p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                End-customer preview finished.
              </p>
              <Button variant="outline" onClick={() => setStepIndex(0)}>
                Restart Preview
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

