# Thoughtspace — Idea Map

A zoomable spatial map of ideas: explore a universe of thoughts with a minimal, futuristic UI.

## Tech stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **React Flow** (@xyflow/react) — graph visualization, zoom & pan
- **Tailwind CSS** — styling
- **Framer Motion** — animations

## Run the project

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You can:

- **Pan** — drag the canvas
- **Zoom** — scroll or use the +/- controls
- **Click a node** — open the idea card (title, description, related ideas, timestamp)
- **Surprise Me** — randomly select an idea, center the map on it, and open its card

## Project structure

```
/app
  layout.tsx, page.tsx, globals.css
/components
  IdeaMap.tsx   — main map (React Flow + top bar + Surprise Me + card)
  IdeaNode.tsx  — custom node (zoom-based appearance, theme color)
  IdeaCard.tsx  — floating panel when a node is clicked
/data
  mockIdeas.ts  — ideas, themes, cluster layout, nodes/edges helpers
```

## Design

- **Background:** dark neutral (near black `#0a0b0f`)
- **Nodes:** theme-colored dots with a soft glow on hover; labels at medium zoom
- **Connections:** thin, low-opacity lines between related ideas
- **Progressive zoom:** “themes” → “subtopics” → “ideas” → “detail” (see top-right label)

## Next step

To make the map feel more alive, add a **force-directed layout** (e.g. run a layout algorithm on the graph and apply positions to nodes). The current layout is cluster-based with fixed positions.
