"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import IdeaNode from "./IdeaNode";
import IdeaCard from "./IdeaCard";
import ZoomEdge from "./ZoomEdge";
import {
  MOCK_IDEAS,
  getNodesFromIdeas,
  getEdgesFromIdeas,
  THEMES,
  type Idea,
} from "@/data/mockIdeas";
import { ZoomLevelProvider, useZoomViewport } from "./ZoomContext";
import { FloatingLabels } from "./FloatingLabels";

const nodeTypes = { ideaNode: IdeaNode };
const edgeTypes = { zoomEdge: ZoomEdge };

const initialNodes = getNodesFromIdeas(MOCK_IDEAS) as unknown as Node[];
const initialEdges = getEdgesFromIdeas(MOCK_IDEAS);

function getZoomLabel(zoom: number): string {
  if (zoom < 0.5) return "themes";
  if (zoom < 1.2) return "subtopics";
  if (zoom < 2.2) return "ideas";
  return "detail";
}

function ZoomIndicator() {
  const { zoom } = useZoomViewport();
  const label = getZoomLabel(zoom);
  return (
    <div className="font-mono text-[11px] text-[#605e66] bg-bg-elevated px-3 py-1.5 rounded-full border border-white/6">
      {label}
    </div>
  );
}

function TopBar() {
  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
      <div className="pointer-events-auto flex items-center justify-between px-6 pt-5 pb-4 bg-gradient-to-b from-bg via-bg/80 to-transparent">
        <div className="flex items-center gap-2 font-semibold text-lg text-[#e8e6e1] tracking-tight">
          <svg
            className="w-5 h-5 text-accent-mint"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="3" fill="currentColor" opacity={0.3} />
            <circle cx="5" cy="7" r="1.5" fill="currentColor" opacity={0.5} />
            <circle cx="19" cy="8" r="2" fill="currentColor" opacity={0.4} />
            <circle cx="7" cy="18" r="1.8" fill="currentColor" opacity={0.35} />
            <circle cx="18" cy="17" r="1.2" fill="currentColor" opacity={0.45} />
            <line x1="12" y1="12" x2="5" y2="7" strokeOpacity={0.2} />
            <line x1="12" y1="12" x2="19" y2="8" strokeOpacity={0.2} />
            <line x1="12" y1="12" x2="7" y2="18" strokeOpacity={0.2} />
            <line x1="12" y1="12" x2="18" y2="17" strokeOpacity={0.2} />
          </svg>
          thoughtspace
        </div>
        <ZoomIndicator />
      </div>
    </div>
  );
}

function nodeColor(node: Node) {
  const idea = node.data as unknown as Idea;
  return (idea?.cluster && THEMES[idea.cluster]?.color) ?? "#6ee7b7";
}

function IdeaMapFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const { setCenter, getNodes, getViewport, setViewport: setFlowViewport } =
    useReactFlow();
  const { setViewport } = useZoomViewport();

  // Sync initial React Flow viewport into ZoomContext so overlays have
  // correct zoom/x/y even before the user pans or zooms.
  useEffect(() => {
    const viewport = getViewport();
    setViewport({
      zoom: viewport.zoom,
      x: viewport.x,
      y: viewport.y,
    });
  }, [getViewport, setViewport]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedIdea(node.data as unknown as Idea);
  }, []);

  const handleRelatedClick = useCallback(
    (idea: Idea) => {
      const node = getNodes().find((n) => n.id === idea.id);
      setSelectedIdea(null);
      if (node) {
        setCenter(node.position.x + 80, node.position.y + 40, {
          zoom: 1.5,
          duration: 600,
        });
      }
      window.setTimeout(() => {
        setSelectedIdea(idea);
      }, 200);
    },
    [setCenter, getNodes]
  );

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onMove={(_, viewport) => {
          setViewport({
            zoom: viewport.zoom,
            x: viewport.x,
            y: viewport.y,
          });
        }}
        nodeTypes={nodeTypes as NodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 0.6 }}
        minZoom={0.2}
        maxZoom={3}
        defaultEdgeOptions={{
          type: "zoomEdge",
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-bg"
      >
        <Background color="rgba(255,255,255,0.03)" gap={24} size={0.5} />
        <MiniMap
          className="!bg-bg-card !opacity-60 hover:!opacity-90 transition-opacity duration-200"
          nodeColor={nodeColor}
          maskColor="rgba(10, 11, 15, 0.8)"
        />
        <FloatingLabels />
      </ReactFlow>

      <TopBar />
      <IdeaCard
        idea={selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onRelatedClick={handleRelatedClick}
      />
    </>
  );
}

export default function IdeaMap() {
  return (
    <div className="h-full w-full relative">
      <ReactFlowProvider>
        <ZoomLevelProvider>
          <IdeaMapFlow />
        </ZoomLevelProvider>
      </ReactFlowProvider>
    </div>
  );
}
