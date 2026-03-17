"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import type { Idea } from "@/data/mockIdeas";
import { THEMES } from "@/data/mockIdeas";
import { useZoomLevel } from "./ZoomContext";
import { formatTimestamp } from "../utils/formatTimestamp";

export type IdeaNodeData = Idea;

function getCardSize(level: "cluster" | "titles" | "detail") {
  if (level === "cluster") return { width: 10, height: 6 };
  if (level === "titles") return { width: 120, height: 38 };
  return { width: 240, height: 114 };
}

function hashToUnit(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return ((h >>> 0) % 1000) / 1000;
}

function IdeaNodeComponent(props: NodeProps<Node>) {
  const { data, selected } = props;
  const idea = data as unknown as Idea;
  if (!idea?.cluster) return null;
  const theme = THEMES[idea.cluster];
  const level = useZoomLevel();
  const { width, height } = getCardSize(level);
  const isCluster = level === "cluster";
  const isTitles = level === "titles";
  const isDetail = level === "detail";

  const accentWidth = isDetail ? 4 : isTitles ? 3 : 2;
  const isTrunk = idea.depth === 0;

  const background = "#12131a";
  const baseBorder = `rgba(255,255,255,${isDetail ? 0.1 : 0.06})`;

  const jitter = hashToUnit(idea.id);
  const breatheDuration = 3.2 + jitter * 0.8; // 3.2–4.0s
  const breatheDelay = jitter * 4; // 0–4s

  return (
    <>
      <Handle type="target" position={Position.Top} className="!invisible" />
      <div
        className="idea-node idea-node-breathe relative rounded-lg overflow-hidden border cursor-pointer transition-transform transition-opacity duration-150"
        style={{
          width,
          height,
          opacity: 0.95,
          background: isCluster ? `${theme.color}33` : background,
          borderColor: isCluster ? `${theme.color}66` : baseBorder,
          boxShadow: selected
            ? `0 0 24px ${theme.glow}`
            : `0 0 12px rgba(0,0,0,0.5)`,
          transformOrigin: "center center",
          transition: "width 0.2s ease, height 0.2s ease, transform 0.2s ease",
          animationDuration: `${breatheDuration}s`,
          animationDelay: `${breatheDelay}s`,
        }}
      >
        {/* Left accent strip */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: accentWidth,
            background: theme.color,
            opacity: isTrunk ? 1 : isDetail ? 0.9 : 0.85,
          }}
        />

        {/* Far zoom: minimal rectangle */}
        {isCluster && (
          <div className="w-full h-full" aria-hidden="true" />
        )}

        {/* Mid zoom: title + cluster label */}
        {isTitles && (
          <div className="flex flex-col justify-center h-full pl-2.5 pr-2 py-1">
            <div className="text-[11px] font-medium text-[#e8e6e1] truncate">
              {idea.title}
            </div>
            <div className="mt-0.5 text-[10px] text-[#9b98a0] truncate">
              {theme.label}
            </div>
          </div>
        )}

        {/* Close zoom: full notecard */}
        {isDetail && (
          <div className="flex flex-col h-full pl-3 pr-3 py-2 gap-1.5">
            <div className="flex items-center gap-2 text-[10px]">
              <span
                className="px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${theme.color}1A`,
                  color: theme.color,
                }}
              >
                {idea.type}
              </span>
              <span className="text-[#605e66]">
                {formatTimestamp(idea.timestamp)}
              </span>
            </div>

            <div className="text-xs font-semibold text-[#e8e6e1] leading-snug line-clamp-2">
              {idea.title}
            </div>

            {idea.branchLabel ? (
              <div className="text-[10px] text-[#605e66] truncate">
                {idea.branchLabel}
              </div>
            ) : null}

            <div className="text-[11px] text-[#9b98a0] leading-snug line-clamp-3">
              {idea.description}
            </div>

            <div className="mt-auto text-[10px] text-[#605e66]">
              {idea.depth === 0 ? "trunk" : idea.depth === 1 ? "branch" : "twig"}
            </div>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!invisible" />
    </>
  );
}

export default memo(IdeaNodeComponent);
