"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Edge, Node } from "@xyflow/react";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, ShieldCheck, Upload, FileText, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Primary Country of Legal Residence</Label>
              <Input placeholder="United Kingdom" className={inputClass} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
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
          <div className={`rounded-lg border p-4 space-y-3 ${isIntroTheme ? "border-[#d5e0e5] bg-white" : ""}`}>
            <div className="space-y-1.5">
              <Label className={labelClass}>Full Legal Name</Label>
              <Input placeholder="Jane Doe" className={inputClass} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
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

function PreviewFlowPageInner() {
  const router = useRouter();
  const [draft, setDraft] = useState<WorkflowDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

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
  const isComplete = stepIndex >= orderedSteps.length;
  const currentStep = orderedSteps[stepIndex];
  const progress =
    orderedSteps.length === 0 ? 0 : Math.round((Math.min(stepIndex, orderedSteps.length) / orderedSteps.length) * 100);

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

  if (!draft) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push("/kyc-workflows/new")}>
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
    <div className="min-h-[calc(100vh-3.5rem)] bg-muted/20 -m-6 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/kyc-workflows/new")}>
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
                    onContinue={() => setStepIndex((i) => Math.min(orderedSteps.length, i + 1))}
                  />
                ) : (
                  <div className="-mx-6 -my-4 border-y border-[#d8e3e7] bg-[#f3f4f5]">
                    <div className="grid min-h-[640px] grid-cols-[320px_1fr]">
                      <SplitStepRail steps={orderedSteps} currentIndex={stepIndex} />
                      <section className="px-12 py-14 bg-[#f3f4f5]">
                        <div className="max-w-[640px] space-y-8">
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

                          <div className="flex items-center justify-between pt-2">
                            <Button
                              variant="outline"
                              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
                              disabled={stepIndex === 0}
                              className="border-[#004555]/30 text-[#004555] hover:bg-[#e8f0f3]"
                            >
                              Previous
                            </Button>
                            <Button
                              onClick={() => setStepIndex((i) => Math.min(orderedSteps.length, i + 1))}
                              className="h-[56px] rounded-none bg-[#004555] px-10 text-white hover:bg-[#003a48]"
                            >
                              {stepIndex === orderedSteps.length - 1 ? "Finish Review" : "Proceed"}
                            </Button>
                          </div>
                        </div>
                      </section>
                    </div>
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

