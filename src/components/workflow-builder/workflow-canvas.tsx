"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
  type Node,
  type OnConnect,
  ReactFlowProvider,
  type ReactFlowInstance,
  BackgroundVariant,
  MarkerType,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./node-types";
import type { StepNodeData } from "./node-types";
import { StepPalette, paletteItems, type PaletteItem } from "./step-palette";
import { NodeConfigPanel } from "./node-config-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, ArrowLeft, List, Workflow, Plus, ChevronUp, ChevronDown, Trash2, Eye } from "lucide-react";

const defaultEdgeOptions: Partial<Edge> = {
  type: "smoothstep",
  animated: true,
  style: { strokeWidth: 2, stroke: "hsl(var(--muted-foreground))" },
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: "hsl(var(--muted-foreground))" },
};

const INTRO_NODE_ID = "step_intro";

const createIntroductionNode = (): Node => ({
  id: INTRO_NODE_ID,
  type: "stepNode",
  position: { x: 250, y: 180 },
  data: {
    label: "Introduction Page",
    stepType: "introduction_page",
    required: true,
    description: "Welcome screen and consent start",
  } satisfies StepNodeData,
});

const initialNodes: Node[] = [
  {
    id: "start",
    type: "startNode",
    position: { x: 250, y: 40 },
    data: {},
    deletable: false,
  },
  createIntroductionNode(),
  {
    id: "end",
    type: "endNode",
    position: { x: 250, y: 600 },
    data: {},
    deletable: false,
  },
];

const initialEdges: Edge[] = [
  {
    id: "e_start_intro",
    source: "start",
    target: INTRO_NODE_ID,
    ...defaultEdgeOptions,
  } as Edge,
  {
    id: "e_intro_end",
    source: INTRO_NODE_ID,
    target: "end",
    ...defaultEdgeOptions,
  } as Edge,
];
const WORKFLOW_DRAFT_KEY = "kycgate.workflowDraft";

interface WorkflowCanvasProps {
  onSave: (workflow: {
    name: string;
    description: string;
    type: string;
    applicantType: string;
    nodes: Node[];
    edges: Edge[];
  }) => void;
  onPreview: (workflow: {
    name: string;
    description: string;
    type: string;
    applicantType: string;
    nodes: Node[];
    edges: Edge[];
  }) => void;
  onBack: () => void;
}

function WorkflowCanvasInner({ onSave, onPreview, onBack }: WorkflowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [workflowType, setWorkflowType] = useState("kyc");
  const [applicantType, setApplicantType] = useState("individual");
  const [listMode, setListMode] = useState(false);
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [pendingDeleteNodeId, setPendingDeleteNodeId] = useState<string | null>(null);

  const nodeIdCounter = useRef(0);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, ...defaultEdgeOptions }, eds)),
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const itemJson =
        event.dataTransfer.getData("application/kycgate-step") ||
        event.dataTransfer.getData("text/plain");
      if (!itemJson) return;

      const item: PaletteItem = JSON.parse(itemJson);
      if (!reactFlowInstance) {
        setNodes((nds) => {
          nodeIdCounter.current += 1;
          const stepCountFallback = nds.filter((n) => n.type === "stepNode").length;
          const fallbackNode: Node = {
            id: `step_${nodeIdCounter.current}_${Date.now()}`,
            type: "stepNode",
            position: { x: 250, y: 160 + stepCountFallback * 140 },
            data: {
              label: item.label,
              stepType: item.stepType,
              required: true,
              description: item.description,
            } satisfies StepNodeData,
          };
          return [...nds, fallbackNode];
        });
        return;
      }
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      nodeIdCounter.current += 1;
      const newNode: Node = {
        id: `step_${nodeIdCounter.current}_${Date.now()}`,
        type: "stepNode",
        position,
        data: {
          label: item.label,
          stepType: item.stepType,
          required: true,
          description: item.description,
        } satisfies StepNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [reactFlowInstance, setNodes],
  );

  const onDragStart = useCallback((event: React.DragEvent, item: PaletteItem) => {
    const payload = JSON.stringify(item);
    event.dataTransfer.setData("application/kycgate-step", payload);
    event.dataTransfer.setData("text/plain", payload);
    event.dataTransfer.effectAllowed = "move";
  }, []);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const updateNodeData = useCallback(
    (id: string, updates: Partial<StepNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...updates } } : n,
        ),
      );
      setSelectedNode((prev) =>
        prev?.id === id ? { ...prev, data: { ...prev.data, ...updates } } : prev,
      );
    },
    [setNodes],
  );

  const performDeleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNode(null);
    },
    [setNodes, setEdges],
  );

  const deleteNode = useCallback(
    (id: string) => {
      const node = nodes.find((n) => n.id === id);
      const stepType =
        node?.type === "stepNode"
          ? ((node.data as unknown as StepNodeData).stepType ?? "")
          : "";

      if (stepType === "introduction_page") {
        setPendingDeleteNodeId(id);
        setDeleteWarningOpen(true);
        return;
      }

      performDeleteNode(id);
    },
    [nodes, performDeleteNode],
  );

  const stepCount = useMemo(
    () => nodes.filter((n) => n.type === "stepNode").length,
    [nodes],
  );

  const getOrderedStepNodes = useCallback(() => {
    const stepNodes = nodes.filter((n) => n.type === "stepNode");
    const byId = new Map(stepNodes.map((n) => [n.id, n]));
    const edgeMap = new Map(edges.map((e) => [e.source, e.target]));

    const ordered: Node[] = [];
    let current = "start";
    const visited = new Set<string>();

    while (current && !visited.has(current)) {
      visited.add(current);
      const nextId = edgeMap.get(current);
      if (!nextId) break;
      if (nextId !== "end") {
        const node = byId.get(nextId);
        if (node) ordered.push(node);
      }
      current = nextId;
      if (nextId === "end") break;
    }

    const usedIds = new Set(ordered.map((n) => n.id));
    const unlinked = stepNodes
      .filter((n) => !usedIds.has(n.id))
      .sort((a, b) => a.position.y - b.position.y);

    return [...ordered, ...unlinked];
  }, [nodes, edges]);

  const syncSequentialFlow = useCallback(
    (orderedNodes: Node[]) => {
      setNodes((prev) => {
        const nonSteps = prev.filter((n) => n.type !== "stepNode");
        const updatedSteps = orderedNodes.map((node, index) => ({
          ...node,
          position: { x: 250, y: 160 + index * 140 },
        }));
        return [...nonSteps, ...updatedSteps];
      });

      const sequence = ["start", ...orderedNodes.map((n) => n.id), "end"];
      const nextEdges: Edge[] = [];
      for (let i = 0; i < sequence.length - 1; i += 1) {
        nextEdges.push({
          id: `e_${sequence[i]}_${sequence[i + 1]}`,
          source: sequence[i],
          target: sequence[i + 1],
          ...defaultEdgeOptions,
        } as Edge);
      }
      setEdges(nextEdges);
    },
    [setNodes, setEdges],
  );

  const addStepFromPalette = useCallback(
    (item: PaletteItem) => {
      const hasIntroduction = nodes.some(
        (n) =>
          n.type === "stepNode" &&
          (n.data as unknown as StepNodeData).stepType === "introduction_page",
      );
      if (item.stepType === "introduction_page" && hasIntroduction) return;

      nodeIdCounter.current += 1;
      const newNode: Node = {
        id: `step_${nodeIdCounter.current}_${Date.now()}`,
        type: "stepNode",
        position: { x: 250, y: 160 + stepCount * 140 },
        data: {
          label: item.label,
          stepType: item.stepType,
          required: true,
          description: item.description,
        } satisfies StepNodeData,
      };

      const ordered = getOrderedStepNodes();
      syncSequentialFlow([...ordered, newNode]);
    },
    [nodes, getOrderedStepNodes, stepCount, syncSequentialFlow],
  );

  const moveStep = useCallback(
    (nodeId: string, direction: "up" | "down") => {
      const ordered = getOrderedStepNodes();
      const index = ordered.findIndex((n) => n.id === nodeId);
      if (index === -1) return;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= ordered.length) return;

      const next = [...ordered];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      syncSequentialFlow(next);
    },
    [getOrderedStepNodes, syncSequentialFlow],
  );

  const handleSave = () => {
    onSave({
      name: workflowName,
      description: workflowDescription,
      type: workflowType,
      applicantType,
      nodes,
      edges,
    });
  };

  const handlePreview = () => {
    onPreview({
      name: workflowName,
      description: workflowDescription,
      type: workflowType,
      applicantType,
      nodes,
      edges,
    });
  };

  const canSave = stepCount > 0;

  const confirmDeleteIntroductionPage = useCallback(() => {
    if (!pendingDeleteNodeId) return;
    performDeleteNode(pendingDeleteNodeId);
    setDeleteWarningOpen(false);
    setPendingDeleteNodeId(null);
  }, [pendingDeleteNodeId, performDeleteNode]);

  const cancelDeleteIntroductionPage = useCallback(() => {
    setDeleteWarningOpen(false);
    setPendingDeleteNodeId(null);
  }, []);

  // Hydrate builder state when returning from preview or refresh.
  useEffect(() => {
    const raw = sessionStorage.getItem(WORKFLOW_DRAFT_KEY);
    if (!raw) {
      setHasHydratedDraft(true);
      return;
    }
    try {
      const draft = JSON.parse(raw) as {
        name?: string;
        description?: string;
        type?: string;
        applicantType?: string;
        nodes?: Node[];
        edges?: Edge[];
      };
      if (draft.name) setWorkflowName(draft.name);
      if (draft.description) setWorkflowDescription(draft.description);
      if (draft.type) setWorkflowType(draft.type);
      if (draft.applicantType) setApplicantType(draft.applicantType);
      if (Array.isArray(draft.nodes) && draft.nodes.length > 0) setNodes(draft.nodes);
      if (Array.isArray(draft.edges)) setEdges(draft.edges);

      const hasIntro = (draft.nodes ?? []).some(
        (n) =>
          n.type === "stepNode" &&
          (n.data as unknown as StepNodeData).stepType === "introduction_page",
      );
      if (!hasIntro) {
        const stepNodes = (draft.nodes ?? [])
          .filter((n) => n.type === "stepNode")
          .sort((a, b) => a.position.y - b.position.y);
        syncSequentialFlow([createIntroductionNode(), ...stepNodes]);
      }

      const maxStepIndex = (draft.nodes ?? [])
        .filter((n) => n.type === "stepNode")
        .reduce((max, n) => {
          const match = String(n.id).match(/^step_(\d+)_/);
          const value = match ? Number(match[1]) : 0;
          return Math.max(max, value);
        }, 0);
      nodeIdCounter.current = maxStepIndex;
    } catch {
      // Ignore malformed persisted draft.
    } finally {
      setHasHydratedDraft(true);
    }
  }, [setEdges, setNodes, syncSequentialFlow]);

  // Persist draft continuously so navigation doesn't lose canvas composition.
  useEffect(() => {
    if (!hasHydratedDraft) return;
    const draft = {
      name: workflowName,
      description: workflowDescription,
      type: workflowType,
      applicantType,
      nodes,
      edges,
    };
    sessionStorage.setItem(WORKFLOW_DRAFT_KEY, JSON.stringify(draft));
  }, [hasHydratedDraft, workflowName, workflowDescription, workflowType, applicantType, nodes, edges]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden -m-6">
      {/* Left Sidebar - Step Palette */}
      <div className="w-72 border-r bg-background flex flex-col shrink-0 min-h-0">
        <div className="p-4 border-b">
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Workflows
          </Button>
          <h2 className="font-semibold">Workflow Builder</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Build your flow visually or in list mode
          </p>
          <div className="flex items-center justify-between mt-3 rounded-lg border px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              {listMode ? <List className="h-3.5 w-3.5" /> : <Workflow className="h-3.5 w-3.5" />}
              {listMode ? "List View" : "Canvas View"}
            </div>
            <Switch checked={listMode} onCheckedChange={setListMode} />
          </div>
        </div>

        <div className="p-4 border-b space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Workflow Name</Label>
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="My KYC Workflow"
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              value={workflowDescription}
              onChange={(e) => setWorkflowDescription(e.target.value)}
              placeholder="Describe this workflow..."
              className="h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <select
                value={workflowType}
                onChange={(e) => setWorkflowType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="kyc">KYC</option>
                <option value="kyb">KYB</option>
                <option value="aml">AML</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Applies To</Label>
              <select
                value={applicantType}
                onChange={(e) => setApplicantType(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
              >
                <option value="individual">Individual</option>
                <option value="entity">Entity</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 pb-6">
            <StepPalette
              onDragStart={onDragStart}
              onItemClick={(item) => {
                if (!listMode) addStepFromPalette(item);
              }}
            />
          </div>
        </div>

        <div className="p-4 border-t">
          <div className="space-y-2">
            <Button onClick={handlePreview} disabled={!canSave} variant="outline" className="w-full">
              <Eye className="mr-2 h-4 w-4" />Preview Flow
            </Button>
            <Button onClick={handleSave} disabled={!canSave} className="w-full">
              <Save className="mr-2 h-4 w-4" />Save Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas/List */}
      <div className="flex-1 relative overflow-hidden" ref={reactFlowWrapper}>
        {!listMode ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            snapToGrid
            snapGrid={[16, 16]}
            deleteKeyCode={null}
            className="bg-muted/30"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="!bg-background" />
            <Controls
              showInteractive={false}
              className="!bg-background !border !shadow-sm !rounded-lg"
            />
            <MiniMap
              nodeStrokeWidth={3}
              className="!bg-background !border !shadow-sm !rounded-lg"
              maskColor="rgba(0,0,0,0.08)"
            />
            <Panel position="top-center">
              <div className="flex items-center gap-2 bg-background border rounded-lg shadow-sm px-3 py-2">
                <Badge variant="outline" className="text-xs uppercase">{workflowType}</Badge>
                <Separator orientation="vertical" className="!h-4" />
                <span className="text-sm font-medium">
                  {workflowName || "Untitled Workflow"}
                </span>
                <Separator orientation="vertical" className="!h-4" />
                <span className="text-xs text-muted-foreground">{stepCount} steps</span>
              </div>
            </Panel>
          </ReactFlow>
        ) : (
          <div className="h-full bg-muted/20 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-background p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Step Sequence Editor</p>
                  <p className="text-xs text-muted-foreground">
                    Add, reorder, and edit workflow steps in list format
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">{stepCount} steps</Badge>
              </div>

              <div className="rounded-lg border bg-background p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Add Steps
                </p>
                <div className="flex flex-wrap gap-2">
                  {paletteItems.map((item) => (
                    <Button
                      key={item.stepType}
                      variant="outline"
                      size="sm"
                      onClick={() => addStepFromPalette(item)}
                      className="text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {getOrderedStepNodes().map((node, index, arr) => {
                  const data = node.data as unknown as StepNodeData;
                  return (
                    <div key={node.id} className="rounded-lg border bg-background p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="w-8 justify-center">{index + 1}</Badge>
                          <p className="text-sm font-medium">{data.label}</p>
                          <Badge variant="outline" className="text-xs capitalize">
                            {data.stepType.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveStep(node.id, "up")}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => moveStep(node.id, "down")}
                            disabled={index === arr.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteNode(node.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Step Name</Label>
                          <Input
                            value={data.label}
                            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={data.description ?? ""}
                            onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Timeout (hours)</Label>
                          <Input
                            type="number"
                            min={1}
                            value={data.timeoutHours ?? ""}
                            onChange={(e) =>
                              updateNodeData(node.id, {
                                timeoutHours: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <span className="text-xs text-muted-foreground">Required step</span>
                        <Switch
                          checked={data.required}
                          onCheckedChange={(checked) => updateNodeData(node.id, { required: checked })}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Node Config */}
      {selectedNode && !listMode && (
        <div className="w-72 border-l bg-background shrink-0">
          <ScrollArea className="h-full">
            <NodeConfigPanel
              node={selectedNode}
              onUpdate={updateNodeData}
              onDelete={deleteNode}
              onClose={() => setSelectedNode(null)}
            />
          </ScrollArea>
        </div>
      )}

      <Dialog
        open={deleteWarningOpen}
        onOpenChange={(open) => {
          setDeleteWarningOpen(open);
          if (!open) setPendingDeleteNodeId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Introduction Page?</DialogTitle>
            <DialogDescription>
              Removing the Introduction Page can create a worse first impression and
              reduce completion rates in onboarding flows. Are you sure you want to remove it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelDeleteIntroductionPage}>
              Keep Introduction
            </Button>
            <Button variant="destructive" onClick={confirmDeleteIntroductionPage}>
              Delete Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
