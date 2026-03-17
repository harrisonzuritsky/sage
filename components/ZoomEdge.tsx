"use client";

import { getBezierPath, type EdgeProps } from "@xyflow/react";
import type { ThemeId } from "@/data/mockIdeas";
import { THEMES } from "@/data/mockIdeas";
import { useZoomLevel } from "./ZoomContext";

type EdgeData = {
  sourceCluster?: ThemeId;
  targetCluster?: ThemeId;
};

function hexToRgb(hex: string) {
  const raw = hex.replace("#", "").trim();
  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;

  const int = Number.parseInt(normalized, 16);
  // eslint-disable-next-line no-restricted-globals
  if (Number.isNaN(int) || normalized.length !== 6) return null;
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function blendHex(a: string, b: string) {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  if (!ra || !rb) return null;
  return {
    r: Math.round((ra.r + rb.r) / 2),
    g: Math.round((ra.g + rb.g) / 2),
    b: Math.round((ra.b + rb.b) / 2),
  };
}

export default function ZoomEdge(props: EdgeProps) {
  const level = useZoomLevel();
  const opacity = level === "cluster" ? 0 : level === "titles" ? 0.04 : 0.1;

  const data = (props.data ?? {}) as EdgeData;
  const sourceTheme = data.sourceCluster ? THEMES[data.sourceCluster] : null;
  const targetTheme = data.targetCluster ? THEMES[data.targetCluster] : null;

  const blended =
    sourceTheme && targetTheme && data.sourceCluster !== data.targetCluster
      ? blendHex(sourceTheme.color, targetTheme.color)
      : null;

  const stroke = blended
    ? `rgba(${blended.r}, ${blended.g}, ${blended.b}, 1)`
    : "rgba(255,255,255,1)";

  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <path
      className="react-flow__edge-path"
      d={edgePath}
      fill="none"
      stroke={stroke}
      strokeWidth={0.5}
      strokeOpacity={opacity}
    />
  );
}

