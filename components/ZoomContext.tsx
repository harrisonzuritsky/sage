"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ZoomLevel = "cluster" | "titles" | "detail";

export interface ZoomViewport {
  zoom: number;
  x: number;
  y: number;
}

interface ViewportState {
  zoom: number;
  x: number;
  y: number;
}

interface ViewportContextValue {
  zoom: number;
  viewport: { x: number; y: number };
  setViewport: (viewport: ZoomViewport) => void;
}

const LevelContext = createContext<ZoomLevel>("cluster");
const ViewportContext = createContext<ViewportContextValue | undefined>(
  undefined
);

function getZoomLevel(zoom: number): ZoomLevel {
  if (zoom < 0.6) return "cluster";
  if (zoom < 1.4) return "titles";
  return "detail";
}

export function ZoomLevelProvider({ children }: { children: ReactNode }) {
  const [viewportState, setViewportState] = useState<ViewportState>({
    zoom: 1,
    x: 0,
    y: 0,
  });
  const [level, setLevel] = useState<ZoomLevel>(getZoomLevel(1));

  const setViewport = useCallback((viewport: ZoomViewport) => {
    setViewportState({
      zoom: viewport.zoom,
      x: viewport.x,
      y: viewport.y,
    });

    const nextLevel = getZoomLevel(viewport.zoom);
    setLevel((prev) => (prev === nextLevel ? prev : nextLevel));
  }, []);

  const viewportValue = useMemo<ViewportContextValue>(
    () => ({
      zoom: viewportState.zoom,
      viewport: { x: viewportState.x, y: viewportState.y },
      setViewport,
    }),
    [viewportState.zoom, viewportState.x, viewportState.y, setViewport]
  );

  return (
    <ViewportContext.Provider value={viewportValue}>
      <LevelContext.Provider value={level}>{children}</LevelContext.Provider>
    </ViewportContext.Provider>
  );
}

export function useZoomLevel(): ZoomLevel {
  return useContext(LevelContext);
}

export function useZoomViewport(): ViewportContextValue {
  const ctx = useContext(ViewportContext);
  if (!ctx) {
    throw new Error(
      "useZoomViewport must be used within a ZoomLevelProvider"
    );
  }
  return ctx;
}

