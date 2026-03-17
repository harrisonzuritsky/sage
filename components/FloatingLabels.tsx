 "use client";

import { useMemo } from "react";
import { useReactFlow, type Node } from "@xyflow/react";
import { THEMES, type Idea, type ThemeId } from "@/data/mockIdeas";
import { useZoomViewport } from "./ZoomContext";

function worldToScreen(
  x: number,
  y: number,
  zoom: number,
  viewportX: number,
  viewportY: number
) {
  return {
    x: x * zoom + viewportX,
    y: y * zoom + viewportY,
  };
}

function hexToRgba(hex: string, alpha: number) {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function useBranchCenters(nodes: Node[]) {
  return useMemo(() => {
    const accum: Record<
      string,
      { x: number; y: number; count: number; cluster: ThemeId }
    > = {};

    nodes.forEach((node) => {
      const idea = node.data as unknown as Idea | undefined;
      if (!idea?.branchLabel) return;

      const key = idea.branchLabel;
      if (!accum[key]) {
        accum[key] = {
          x: 0,
          y: 0,
          count: 0,
          cluster: idea.cluster,
        };
      }
      accum[key].x += node.position.x;
      accum[key].y += node.position.y;
      accum[key].count += 1;
    });

    return Object.entries(accum).map(([label, info]) => ({
      label,
      cluster: info.cluster,
      x: info.x / info.count,
      y: info.y / info.count,
    }));
  }, [nodes]);
}

function useClusterCenters(nodes: Node[]) {
  return useMemo(() => {
    const accum: Partial<
      Record<ThemeId, { x: number; y: number; count: number }>
    > = {};

    nodes.forEach((node) => {
      const idea = node.data as unknown as Idea | undefined;
      if (!idea) return;
      const cluster = idea.cluster;
      if (!accum[cluster]) {
        accum[cluster] = { x: 0, y: 0, count: 0 };
      }
      const bucket = accum[cluster]!;
      bucket.x += node.position.x;
      bucket.y += node.position.y;
      bucket.count += 1;
    });

    return (Object.entries(accum) as [ThemeId, { x: number; y: number; count: number }][])
      .filter(([, v]) => v.count > 0)
      .map(([cluster, info]) => ({
        cluster,
        x: info.x / info.count,
        y: info.y / info.count,
      }));
  }, [nodes]);
}

export function FloatingLabels() {
  const { zoom, viewport } = useZoomViewport();
  const { getNodes } = useReactFlow();
  const nodes = getNodes();

  const clusterCenters = useClusterCenters(nodes);
  const branchCenters = useBranchCenters(nodes);

  const showClusterLabels = zoom < 0.9;
  const showBranchLabels = zoom > 0.45 && zoom < 1.3;

  // Opacity ramps to keep labels feeling like background wayfinding
  const clusterBaseOpacity = 0.6; // 50–60% effective at peak
  const branchBaseOpacity = 0.7; // 60–70% effective at peak
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

  // Cluster labels: strong <=0.4, fade to 0 by 0.8
  let clusterFade = 0;
  if (zoom <= 0.4) {
    clusterFade = 1;
  } else if (zoom < 0.8) {
    clusterFade = clamp01((0.8 - zoom) / 0.4);
  } else {
    clusterFade = 0;
  }
  const clusterOpacity = showClusterLabels ? clusterBaseOpacity * clusterFade : 0;

  // Branch labels: fade in 0.45–0.6, solid 0.6–1.2, fade out 1.2–1.3
  let branchFade = 0;
  if (zoom >= 0.45 && zoom < 0.6) {
    branchFade = clamp01((zoom - 0.45) / 0.15);
  } else if (zoom >= 0.6 && zoom <= 1.2) {
    branchFade = 1;
  } else if (zoom > 1.2 && zoom < 1.3) {
    branchFade = clamp01((1.3 - zoom) / 0.1);
  } else {
    branchFade = 0;
  }
  // When cluster (topic) labels are visible, keep branch labels present
  // but visually subordinate. Once we leave the topic band, branches get
  // full strength (subject to their own fade curve).
  const branchOverlapScale = showClusterLabels ? 0.7 : 1;

  const branchOpacity = showBranchLabels
    ? branchBaseOpacity * branchFade * branchOverlapScale
    : 0;

  if (!showClusterLabels && !showBranchLabels) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-[30]">
      {showClusterLabels &&
        clusterCenters.map((clusterCenter) => {
          const theme = THEMES[clusterCenter.cluster];
          const color = hexToRgba(theme.color, clusterOpacity);
          const { x, y } = worldToScreen(
            clusterCenter.x,
            clusterCenter.y,
            zoom,
            viewport.x,
            viewport.y
          );

          return (
            <div
              key={clusterCenter.cluster}
              className="absolute select-none"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                color,
                fontSize: 22,
                fontWeight: 500,
                textShadow:
                  "0 0 18px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.85)",
                mixBlendMode: "soft-light",
                opacity: clusterOpacity,
              }}
            >
              {theme.label}
            </div>
          );
        })}

      {showBranchLabels &&
        branchCenters.map((branch) => {
          const theme = THEMES[branch.cluster];
          const color = hexToRgba(theme.color, branchOpacity);
          const { x, y } = worldToScreen(
            branch.x,
            branch.y,
            zoom,
            viewport.x,
            viewport.y
          );

          return (
            <div
              key={branch.label}
              className="absolute select-none"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -50%)",
                color,
                fontSize: 17,
                fontWeight: 500,
                textShadow:
                  "0 0 10px rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.9)",
                mixBlendMode: "normal",
                opacity: branchOpacity,
              }}
            >
              {branch.label}
            </div>
          );
        })}
    </div>
  );
}

