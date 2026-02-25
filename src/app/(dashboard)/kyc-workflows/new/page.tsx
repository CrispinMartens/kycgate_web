"use client";

import { useRouter } from "next/navigation";
import { WorkflowCanvas } from "@/components/workflow-builder/workflow-canvas";
import type { Node, Edge } from "@xyflow/react";
import type { StepNodeData } from "@/components/workflow-builder/node-types";

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
      config: {},
      timeoutHours: data.timeoutHours,
    };
  });
}

export default function NewWorkflowPage() {
  const router = useRouter();

  const handleSave = async (workflow: WorkflowDraft) => {
    const resolvedName =
      workflow.name.trim() || `Untitled ${workflow.type.toUpperCase()} Workflow`;
    const steps = buildStepsFromDraft(workflow);

    await fetch("/api/kyc-workflows", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: resolvedName,
        description: workflow.description,
        type: workflow.type,
        applicantType: workflow.applicantType,
        steps,
        status: "inactive",
      }),
    });

    sessionStorage.removeItem("kycgate.workflowDraft");
    router.push("/kyc-workflows");
  };

  const handlePreview = (workflow: WorkflowDraft) => {
    sessionStorage.setItem("kycgate.workflowDraft", JSON.stringify(workflow));
    router.push("/kyc-workflows/new/preview");
  };

  return (
    <WorkflowCanvas
      onSave={handleSave}
      onPreview={handlePreview}
      onBack={() => router.push("/kyc-workflows")}
    />
  );
}
