"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Idea } from "@/data/mockIdeas";
import { THEMES, MOCK_IDEAS } from "@/data/mockIdeas";
import { formatTimestamp } from "../utils/formatTimestamp";

interface IdeaCardProps {
  idea: Idea | null;
  onClose: () => void;
  onRelatedClick?: (idea: Idea) => void;
}

export default function IdeaCard({
  idea,
  onClose,
  onRelatedClick,
}: IdeaCardProps) {
  return (
    <AnimatePresence>
      {idea ? (
        <IdeaCardOverlay
          key={idea.id}
          idea={idea}
          onClose={onClose}
          onRelatedClick={onRelatedClick}
        />
      ) : null}
    </AnimatePresence>
  );
}

function IdeaCardOverlay({
  idea,
  onClose,
  onRelatedClick,
}: {
  idea: Idea;
  onClose: () => void;
  onRelatedClick?: (idea: Idea) => void;
}) {
  const theme = THEMES[idea.cluster];

  const byId = new Map(MOCK_IDEAS.map((i) => [i.id, i] as const));
  const parent = idea.parentId ? byId.get(idea.parentId) ?? null : null;
  const children = MOCK_IDEAS.filter((i) => i.parentId === idea.id);
  const siblings =
    idea.parentId != null
      ? MOCK_IDEAS.filter((i) => i.parentId === idea.parentId && i.id !== idea.id)
      : [];

  const relatedIdeas = [parent, ...children, ...siblings].filter(Boolean) as Idea[];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-md rounded-2xl border border-white/10 bg-bg-card p-6 shadow-2xl overflow-hidden"
          initial={{ scale: 0.92, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ background: theme.color }}
        />

        <button
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-elevated text-[#9b98a0] flex items-center justify-center text-lg hover:bg-bg-border hover:text-[#e8e6e1] transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{
              backgroundColor: `${theme.color}1A`,
              color: theme.color,
            }}
          >
            {idea.type}
          </span>
          <span className="text-xs text-[#605e66] font-mono">
            {formatTimestamp(idea.timestamp)}
          </span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-wider" style={{ color: theme.color }}>
            {theme.label}
          </span>
        </div>

        <h2 className="text-xl font-medium text-[#e8e6e1] mb-1 pr-8">
          {idea.title}
        </h2>
        {idea.branchLabel ? (
          <div className="text-xs text-[#605e66] font-mono mb-4">
            {idea.branchLabel}
          </div>
        ) : (
          <div className="text-xs text-[#605e66] font-mono mb-4">{theme.label}</div>
        )}
        <p className="text-sm leading-relaxed text-[#9b98a0] mb-6">
          {idea.description}
        </p>

        <div className="border-t border-white/6 pt-4">
          <div className="text-[11px] uppercase tracking-wider text-[#605e66] font-medium mb-2">
            Related ideas
          </div>
          <div className="flex flex-wrap gap-2">
            {relatedIdeas.length > 0 ? (
              relatedIdeas.map((related) => (
                <button
                  key={related.id}
                  type="button"
                  className="px-3 py-1.5 rounded-full text-xs bg-bg-elevated border border-white/5 text-[#9b98a0] hover:border-white/15 hover:text-[#e8e6e1] transition-colors"
                  onClick={() => onRelatedClick?.(related)}
                >
                  {related.title}
                </button>
              ))
            ) : (
              <span className="text-xs text-[#605e66]">
                No related ideas yet
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
