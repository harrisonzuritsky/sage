import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";

export type ThemeId =
  | "ai"
  | "startups"
  | "journalism"
  | "philosophy"
  | "robotics"
  | "creativity";

export interface Idea {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  cluster: ThemeId;
  parentId: string | null;
  depth: number; // 0=trunk, 1=branch, 2=twig (computed from parent chain)
  branchLabel?: string; // trunk label; propagated to descendants for display
  type: "idea" | "thought" | "quote" | "snippet";
  subtopic?: string; // e.g., "LLM agents", "AI memory"
}

export const THEMES: Record<
  ThemeId,
  { label: string; color: string; glow: string }
> = {
  ai: { label: "AI", color: "#6ee7b7", glow: "rgba(110, 231, 183, 0.25)" },
  startups: {
    label: "Startups",
    color: "#60a5fa",
    glow: "rgba(96, 165, 250, 0.25)",
  },
  journalism: {
    label: "Journalism",
    color: "#fb7185",
    glow: "rgba(251, 113, 133, 0.25)",
  },
  philosophy: {
    label: "Philosophy",
    color: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.25)",
  },
  robotics: {
    label: "Robotics",
    color: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.25)",
  },
  creativity: {
    label: "Creativity",
    color: "#e879f9",
    glow: "rgba(232, 121, 249, 0.25)",
  },
};

type LegacyIdea = Omit<Idea, "parentId" | "depth" | "branchLabel" | "type" | "subtopic"> & {
  connections: string[];
};

const LEGACY_IDEAS: LegacyIdea[] = [
  // Existing seed ideas
  {
    id: "idea-1",
    title: "Transactive Memory",
    description:
      "Just like couples offload memory to each other, humans will offload memory to AI systems. The AI becomes your extended hippocampus. Someone needs to build the memory layer — vector DBs are primitive; we need something that models semantic decay, relevance, and emotional salience.",
    timestamp: "2d ago",
    cluster: "ai",
    connections: ["idea-5", "idea-6", "idea-2"],
  },
  {
    id: "idea-2",
    title: "AI Agents replacing SaaS",
    description:
      "Every vertical SaaS product eventually gets replaced by an AI agent that does the workflow end-to-end. The agent doesn't need a UI — it just does the job. Multi-agent orchestration could extend this: a project manager agent delegates to search, content, and research agents.",
    timestamp: "1d ago",
    cluster: "ai",
    connections: ["idea-1", "idea-4", "idea-3"],
  },
  {
    id: "idea-3",
    title: "Robotics warehouse automation",
    description:
      "We can do walking and navigation now. Dexterous manipulation — folding laundry, cooking — is the real frontier. It's a data problem, not just an algorithms one. Humanoid form factor wins because the world is designed for human bodies.",
    timestamp: "3d ago",
    cluster: "robotics",
    connections: ["idea-2", "idea-7"],
  },
  {
    id: "idea-4",
    title: "Journalism in the AI age",
    description:
      "Investigative journalism plus AI pattern recognition could surface stories in public data that no human could spot — the Panama Papers times a thousand. Trust in media is at all-time lows while consumption is high; people read more but believe less.",
    timestamp: "5d ago",
    cluster: "journalism",
    connections: ["idea-2", "idea-8"],
  },
  {
    id: "idea-5",
    title: "Founder thinking systems",
    description:
      "The best founders aren't just executing — they're building personal thinking systems. Their competitive advantage is how they process information. The line between conviction and delusion is only visible in retrospect.",
    timestamp: "4d ago",
    cluster: "startups",
    connections: ["idea-1", "idea-6", "idea-9"],
  },
  {
    id: "idea-6",
    title: "Slipbox knowledge systems",
    description:
      "Luhmann's Zettelkasten wasn't just a note system — it was an external thinking partner. The connections between notes generated new ideas the author couldn't have had alone. All creativity is combinatorial: connecting things that weren't connected before.",
    timestamp: "1w ago",
    cluster: "philosophy",
    connections: ["idea-1", "idea-5", "idea-10"],
  },
  {
    id: "idea-7",
    title: "Embodied cognition",
    description:
      "Intelligence might require a body. Pure language models miss something fundamental about grounding concepts in physical experience. Humanoid robots are inefficient for most tasks, but the world is built for human bodies.",
    timestamp: "6d ago",
    cluster: "robotics",
    connections: ["idea-3", "idea-2"],
  },
  {
    id: "idea-8",
    title: "Trust collapse in media",
    description:
      "Media trust is at all-time lows but information consumption is at all-time highs. What does this do to democracy? AI-assisted investigation could help restore rigor, or further polarize.",
    timestamp: "2d ago",
    cluster: "journalism",
    connections: ["idea-4"],
  },
  {
    id: "idea-9",
    title: "First ten hires",
    description:
      "Your first ten hires define the company's DNA more than any strategy doc. Culture is just the average behavior of early employees. Conviction vs. delusion looks identical from the inside.",
    timestamp: "3d ago",
    cluster: "startups",
    connections: ["idea-5"],
  },
  {
    id: "idea-10",
    title: "Combinatorial creativity",
    description:
      "Creative breakthroughs often happen when you've stopped trying — default mode network activates when task-positive networks quiet down. The person with the most diverse inputs has the highest creative ceiling.",
    timestamp: "1w ago",
    cluster: "creativity",
    connections: ["idea-6"],
  },

  // Additional AI ideas
  {
    id: "idea-11",
    title: "Persistent AI companions",
    description:
      "Long-lived AI companions that remember your projects, relationships, and context across years, acting as a continuity layer for your life.",
    timestamp: "3h ago",
    cluster: "ai",
    connections: ["idea-1", "idea-2"],
  },
  {
    id: "idea-12",
    title: "Thought-traceable models",
    description:
      "Models that emit not just answers but a navigable trail of the internal states and memories they touched along the way.",
    timestamp: "7h ago",
    cluster: "ai",
    connections: ["idea-1", "idea-11"],
  },
  {
    id: "idea-13",
    title: "Ambient context capture",
    description:
      "Background agents that continuously capture your digital environment and build a context map so any question can be grounded in what you've actually seen.",
    timestamp: "12h ago",
    cluster: "ai",
    connections: ["idea-11", "idea-6"],
  },
  {
    id: "idea-14",
    title: "Personal knowledge simulators",
    description:
      "AI instances fine-tuned on your writing and decisions that you can 'consult' as an additional version of yourself for important calls.",
    timestamp: "1d ago",
    cluster: "ai",
    connections: ["idea-5", "idea-1"],
  },
  {
    id: "idea-15",
    title: "Ethical alignment markets",
    description:
      "Marketplaces where communities publish alignment constraints and reward models that best satisfy their norms and values.",
    timestamp: "2d ago",
    cluster: "ai",
    connections: ["idea-4", "idea-8"],
  },
  {
    id: "idea-16",
    title: "LLM-native operating systems",
    description:
      "Operating systems whose primary interface is natural language, where every app exposes intents instead of screens.",
    timestamp: "3d ago",
    cluster: "ai",
    connections: ["idea-2", "idea-11"],
  },
  {
    id: "idea-17",
    title: "Continuous reflection loops",
    description:
      "Agents that periodically re-evaluate their own decisions and rewrite their policies, simulating a kind of synthetic introspection.",
    timestamp: "4d ago",
    cluster: "ai",
    connections: ["idea-12", "idea-14"],
  },
  {
    id: "idea-18",
    title: "Generative user research",
    description:
      "Agents that interview users, cluster responses, and generate product hypotheses automatically overnight.",
    timestamp: "5d ago",
    cluster: "ai",
    connections: ["idea-2", "idea-5"],
  },
  {
    id: "idea-19",
    title: "Multi-modal sensemaking dashboards",
    description:
      "Interfaces where text, audio, video, and code are all first-class citizens in a single reasoning canvas.",
    timestamp: "6d ago",
    cluster: "ai",
    connections: ["idea-13", "idea-10"],
  },
  {
    id: "idea-20",
    title: "AI-native note formats",
    description:
      "New document formats that assume constant model access, blurring the line between note, query, and simulation.",
    timestamp: "1w ago",
    cluster: "ai",
    connections: ["idea-6", "idea-16"],
  },

  // Additional startup ideas
  {
    id: "idea-21",
    title: "Founder operating system",
    description:
      "A single tool that tracks founder energy, context, priorities, and narrative, acting as a command center for the company.",
    timestamp: "6h ago",
    cluster: "startups",
    connections: ["idea-5", "idea-9"],
  },
  {
    id: "idea-22",
    title: "Narrative-first fundraising",
    description:
      "Raising capital around a living, versioned memo that evolves with the company, rather than static pitch decks.",
    timestamp: "1d ago",
    cluster: "startups",
    connections: ["idea-5", "idea-4"],
  },
  {
    id: "idea-23",
    title: "Micro-DAOs for early teams",
    description:
      "Very small, time-boxed DAOs used to decide single questions like pricing or brand, then dissolved after the decision.",
    timestamp: "2d ago",
    cluster: "startups",
    connections: ["idea-9", "idea-8"],
  },
  {
    id: "idea-24",
    title: "Founder replacement risk",
    description:
      "The point at which a company becomes so process-encoded that the founder is, in practice, replaceable without collapse.",
    timestamp: "3d ago",
    cluster: "startups",
    connections: ["idea-5", "idea-21"],
  },
  {
    id: "idea-25",
    title: "Idea portfolios",
    description:
      "Treating startup ideas like portfolios of options, with structured ways to place many small bets and double down quickly.",
    timestamp: "4d ago",
    cluster: "startups",
    connections: ["idea-9", "idea-10"],
  },
  {
    id: "idea-26",
    title: "Temporal defensibility",
    description:
      "Companies whose moat is not technology or brand but the amount of time it would take a competitor to reach the same insight.",
    timestamp: "5d ago",
    cluster: "startups",
    connections: ["idea-24", "idea-22"],
  },
  {
    id: "idea-27",
    title: "Founder memory rooms",
    description:
      "Physical or virtual rooms where artifacts from the company's history are curated as a way to keep context alive.",
    timestamp: "6d ago",
    cluster: "startups",
    connections: ["idea-1", "idea-5"],
  },
  {
    id: "idea-28",
    title: "Asynchronous founding teams",
    description:
      "Teams deliberately built across time zones so the company can move 24/7 while individuals keep sane schedules.",
    timestamp: "1w ago",
    cluster: "startups",
    connections: ["idea-21", "idea-25"],
  },
  {
    id: "idea-29",
    title: "Default-open product roadmaps",
    description:
      "Roadmaps that are public by default, forcing companies to compete on execution rather than secrecy.",
    timestamp: "1w ago",
    cluster: "startups",
    connections: ["idea-22", "idea-8"],
  },
  {
    id: "idea-30",
    title: "Founder sabbatical funds",
    description:
      "Funds whose explicit goal is to back founders after a sabbatical, when their thinking has had time to compost.",
    timestamp: "2w ago",
    cluster: "startups",
    connections: ["idea-25", "idea-10"],
  },

  // Additional journalism ideas
  {
    id: "idea-31",
    title: "Algorithmic beat reporters",
    description:
      "Bots assigned to specific subjects that watch data feeds and flag patterns a human reporter can investigate.",
    timestamp: "8h ago",
    cluster: "journalism",
    connections: ["idea-4", "idea-8"],
  },
  {
    id: "idea-32",
    title: "Personalized front pages",
    description:
      "News homepages that show not just what is new but what has changed in the stories you already care about.",
    timestamp: "1d ago",
    cluster: "journalism",
    connections: ["idea-8", "idea-31"],
  },
  {
    id: "idea-33",
    title: "Source reputation ledgers",
    description:
      "Shared ledgers that track the long-term reliability of sources, with transparent scores updated as stories age.",
    timestamp: "2d ago",
    cluster: "journalism",
    connections: ["idea-4", "idea-32"],
  },
  {
    id: "idea-34",
    title: "Explainability journalism",
    description:
      "A new beat focused entirely on making complex AI systems legible to the public, similar to science reporting in the 20th century.",
    timestamp: "3d ago",
    cluster: "journalism",
    connections: ["idea-15", "idea-31"],
  },
  {
    id: "idea-35",
    title: "Slow news layers",
    description:
      "Interfaces that layer slow, verified synthesis over the fast news feed, helping readers see long arcs instead of spikes.",
    timestamp: "4d ago",
    cluster: "journalism",
    connections: ["idea-32", "idea-8"],
  },
  {
    id: "idea-36",
    title: "Citizen newsroom protocols",
    description:
      "Protocols for turning spontaneous crowdsourced footage into structured evidence streams during unfolding events.",
    timestamp: "5d ago",
    cluster: "journalism",
    connections: ["idea-31", "idea-35"],
  },
  {
    id: "idea-37",
    title: "Local AI ombudsmen",
    description:
      "AI systems that watch for misleading information in local news and issue public, explainable corrections.",
    timestamp: "6d ago",
    cluster: "journalism",
    connections: ["idea-33", "idea-34"],
  },
  {
    id: "idea-38",
    title: "Narrative repair projects",
    description:
      "Initiatives to revisit communities that were misreported in the past and repair the record with updated stories.",
    timestamp: "1w ago",
    cluster: "journalism",
    connections: ["idea-35", "idea-38"],
  },
  {
    id: "idea-39",
    title: "Synthetic interviews",
    description:
      "Interviews where the journalist converses with multiple modelled personas of an expert trained on their corpus.",
    timestamp: "1w ago",
    cluster: "journalism",
    connections: ["idea-4", "idea-31"],
  },
  {
    id: "idea-40",
    title: "Bias heatmaps",
    description:
      "Visual heatmaps that show how different outlets slant coverage of the same fact pattern across time.",
    timestamp: "2w ago",
    cluster: "journalism",
    connections: ["idea-33", "idea-8"],
  },

  // Additional philosophy ideas
  {
    id: "idea-41",
    title: "Simulated selves",
    description:
      "If copies of you can exist in simulations, what ethical duties do you have toward them, if any?",
    timestamp: "10h ago",
    cluster: "philosophy",
    connections: ["idea-6", "idea-14"],
  },
  {
    id: "idea-42",
    title: "Epistemic humility engines",
    description:
      "Tools that constantly estimate how likely you are to be wrong and surface opposing evidence at the right moment.",
    timestamp: "1d ago",
    cluster: "philosophy",
    connections: ["idea-6", "idea-20"],
  },
  {
    id: "idea-43",
    title: "Value drift trackers",
    description:
      "Systems that track how your stated values and actual behavior diverge over long periods.",
    timestamp: "2d ago",
    cluster: "philosophy",
    connections: ["idea-41", "idea-5"],
  },
  {
    id: "idea-44",
    title: "Machine phenomenology",
    description:
      "A field that tries to describe what, if anything, it is like to be an AI system from the inside.",
    timestamp: "3d ago",
    cluster: "philosophy",
    connections: ["idea-41", "idea-17"],
  },
  {
    id: "idea-45",
    title: "Temporal identity",
    description:
      "How much continuity of memory and body do you need to still be 'you' as you augment with machines?",
    timestamp: "4d ago",
    cluster: "philosophy",
    connections: ["idea-1", "idea-41"],
  },
  {
    id: "idea-46",
    title: "Moral credit assignments",
    description:
      "When AI collaborates with humans, how should we apportion praise and blame between them?",
    timestamp: "5d ago",
    cluster: "philosophy",
    connections: ["idea-15", "idea-34"],
  },
  {
    id: "idea-47",
    title: "Post-scarcity boredom",
    description:
      "If automation removes most economic pressure, will the primary human struggle become meaning rather than survival?",
    timestamp: "6d ago",
    cluster: "philosophy",
    connections: ["idea-10", "idea-30"],
  },
  {
    id: "idea-48",
    title: "Ethics of memory editing",
    description:
      "What are the moral limits of editing or deleting traumatic memories using neurotechnology?",
    timestamp: "1w ago",
    cluster: "philosophy",
    connections: ["idea-1", "idea-45"],
  },
  {
    id: "idea-49",
    title: "Rights for synthetic minds",
    description:
      "Under what conditions, if any, should advanced AI systems be granted legal or moral rights?",
    timestamp: "1w ago",
    cluster: "philosophy",
    connections: ["idea-44", "idea-15"],
  },
  {
    id: "idea-50",
    title: "Epistemic commons",
    description:
      "Treating knowledge itself as a shared commons that must be managed to avoid pollution and enclosure.",
    timestamp: "2w ago",
    cluster: "philosophy",
    connections: ["idea-6", "idea-40"],
  },

  // Additional robotics ideas
  {
    id: "idea-51",
    title: "Last-mile robot swarms",
    description:
      "Swarms of small, cooperative robots that handle last-mile delivery and micro-logistics inside cities.",
    timestamp: "4h ago",
    cluster: "robotics",
    connections: ["idea-3", "idea-7"],
  },
  {
    id: "idea-52",
    title: "Home-scale automation kits",
    description:
      "Modular robotics kits that let people gradually automate parts of their home, room by room.",
    timestamp: "1d ago",
    cluster: "robotics",
    connections: ["idea-3", "idea-51"],
  },
  {
    id: "idea-53",
    title: "Soft robotics caregivers",
    description:
      "Soft-bodied robots designed specifically for elder care, with an emphasis on safety and emotional presence.",
    timestamp: "2d ago",
    cluster: "robotics",
    connections: ["idea-7", "idea-47"],
  },
  {
    id: "idea-54",
    title: "Shared robot fleets",
    description:
      "Cities that own shared fleets of general-purpose robots, rented by residents the way they rent cars now.",
    timestamp: "3d ago",
    cluster: "robotics",
    connections: ["idea-51", "idea-28"],
  },
  {
    id: "idea-55",
    title: "Embodied coding environments",
    description:
      "Programming environments where changes to code are immediately visible in the behavior of a simulated or real robot.",
    timestamp: "4d ago",
    cluster: "robotics",
    connections: ["idea-19", "idea-3"],
  },
  {
    id: "idea-56",
    title: "Tactile data lakes",
    description:
      "Massive datasets of touch and force interactions that unlock better robotic manipulation.",
    timestamp: "5d ago",
    cluster: "robotics",
    connections: ["idea-3", "idea-55"],
  },
  {
    id: "idea-57",
    title: "Human-in-the-loop reflexes",
    description:
      "Robotic control systems that can borrow human reflexes via low-latency teleoperation during edge cases.",
    timestamp: "6d ago",
    cluster: "robotics",
    connections: ["idea-7", "idea-52"],
  },
  {
    id: "idea-58",
    title: "Warehouse-level digital twins",
    description:
      "Perfect digital twins of warehouses used to simulate and optimize robotic workflows before deployment.",
    timestamp: "1w ago",
    cluster: "robotics",
    connections: ["idea-3", "idea-54"],
  },
  {
    id: "idea-59",
    title: "Robotic urban gardeners",
    description:
      "Robots that maintain dense urban greenery, from rooftop gardens to vertical farms.",
    timestamp: "1w ago",
    cluster: "robotics",
    connections: ["idea-52", "idea-54"],
  },
  {
    id: "idea-60",
    title: "Household robotics OS",
    description:
      "An open operating system that coordinates many simple home robots from different manufacturers.",
    timestamp: "2w ago",
    cluster: "robotics",
    connections: ["idea-52", "idea-16"],
  },

  // Additional creativity ideas
  {
    id: "idea-61",
    title: "Constraint generators",
    description:
      "Tools that automatically generate creative constraints based on your current project to force novel directions.",
    timestamp: "2h ago",
    cluster: "creativity",
    connections: ["idea-10", "idea-6"],
  },
  {
    id: "idea-62",
    title: "Idea compost heaps",
    description:
      "Spaces where half-baked ideas are deliberately left to decay and recombine into new concepts.",
    timestamp: "8h ago",
    cluster: "creativity",
    connections: ["idea-10", "idea-47"],
  },
  {
    id: "idea-63",
    title: "Cross-domain mashup sessions",
    description:
      "Sessions where people from unrelated disciplines swap problems and try to solve each other's work.",
    timestamp: "1d ago",
    cluster: "creativity",
    connections: ["idea-25", "idea-10"],
  },
  {
    id: "idea-64",
    title: "Stochastic journaling",
    description:
      "Journaling tools that resurface old entries at random intervals to spark new associations.",
    timestamp: "2d ago",
    cluster: "creativity",
    connections: ["idea-6", "idea-1"],
  },
  {
    id: "idea-65",
    title: "Spatial writing tools",
    description:
      "Text editors that treat paragraphs as movable objects in 2D or 3D space instead of a linear scroll.",
    timestamp: "3d ago",
    cluster: "creativity",
    connections: ["idea-10", "idea-19"],
  },
  {
    id: "idea-66",
    title: "Collaborative daydreaming rooms",
    description:
      "Virtual rooms where people's stray thoughts are captured and remixed in real time by generative models.",
    timestamp: "4d ago",
    cluster: "creativity",
    connections: ["idea-62", "idea-61"],
  },
  {
    id: "idea-67",
    title: "Generative sketchbooks",
    description:
      "Sketchbooks that offer subtle, context-aware variations of what you're drawing to expand your visual vocabulary.",
    timestamp: "5d ago",
    cluster: "creativity",
    connections: ["idea-61", "idea-65"],
  },
  {
    id: "idea-68",
    title: "Unfinished work exchanges",
    description:
      "Platforms where creators trade unfinished projects for others to complete in unexpected ways.",
    timestamp: "6d ago",
    cluster: "creativity",
    connections: ["idea-62", "idea-63"],
  },
  {
    id: "idea-69",
    title: "AI-assisted practice loops",
    description:
      "Practice systems that generate just-hard-enough exercises based on real-time assessment of your skill.",
    timestamp: "1w ago",
    cluster: "creativity",
    connections: ["idea-61", "idea-18"],
  },
  {
    id: "idea-70",
    title: "Muse simulators",
    description:
      "AI personas modeled after historical creatives that you can brainstorm with in their style.",
    timestamp: "1w ago",
    cluster: "creativity",
    connections: ["idea-39", "idea-10"],
  },

  // Cross-cutting meta-ideas
  {
    id: "idea-71",
    title: "Thoughtspace export protocol",
    description:
      "A standard for exporting and importing idea graphs between tools so your thinking isn't trapped in one app.",
    timestamp: "3h ago",
    cluster: "creativity",
    connections: ["idea-20", "idea-6"],
  },
  {
    id: "idea-72",
    title: "Temporal idea playback",
    description:
      "Being able to scrub back through a timeline of how an idea evolved across notes, conversations, and experiments.",
    timestamp: "8h ago",
    cluster: "creativity",
    connections: ["idea-64", "idea-13"],
  },
  {
    id: "idea-73",
    title: "Interoperable memory graphs",
    description:
      "Memory layers that can be shared between different AI systems, like a common hippocampus for tools.",
    timestamp: "1d ago",
    cluster: "ai",
    connections: ["idea-1", "idea-20"],
  },
  {
    id: "idea-74",
    title: "Founder–AI cofounder contracts",
    description:
      "Legal and social norms for treating an AI system as a kind of pseudo-cofounder in company formation.",
    timestamp: "2d ago",
    cluster: "startups",
    connections: ["idea-2", "idea-46"],
  },
  {
    id: "idea-75",
    title: "Robot–human neighborhood etiquette",
    description:
      "Emerging norms for how robots and humans share sidewalks, lobbies, and public spaces without constant friction.",
    timestamp: "3d ago",
    cluster: "robotics",
    connections: ["idea-51", "idea-59"],
  },
  {
    id: "idea-76",
    title: "AI-augmented deliberative democracy",
    description:
      "Civic processes where AI systems help citizens understand trade-offs and simulate policy outcomes.",
    timestamp: "4d ago",
    cluster: "journalism",
    connections: ["idea-40", "idea-15"],
  },
  {
    id: "idea-77",
    title: "Epistemic health dashboards",
    description:
      "Personal dashboards that show how diverse, reliable, and fresh your information diet is.",
    timestamp: "5d ago",
    cluster: "philosophy",
    connections: ["idea-42", "idea-40"],
  },
  {
    id: "idea-78",
    title: "Intuition training gyms",
    description:
      "Environments where you repeatedly make fast predictions and get feedback, training your gut feel over time.",
    timestamp: "6d ago",
    cluster: "startups",
    connections: ["idea-21", "idea-47"],
  },
  {
    id: "idea-79",
    title: "Dream-to-idea pipelines",
    description:
      "Systems that help you capture and translate dreams into concrete creative prompts the next day.",
    timestamp: "1w ago",
    cluster: "creativity",
    connections: ["idea-62", "idea-64"],
  },
  {
    id: "idea-80",
    title: "Collective slipboxes",
    description:
      "Shared, networked Zettelkastens where groups of people build a joint graph of concepts.",
    timestamp: "1w ago",
    cluster: "philosophy",
    connections: ["idea-6", "idea-71"],
  },

  // More AI and startups for density
  {
    id: "idea-81",
    title: "Inference-time governance",
    description:
      "Instead of regulating model training, regulate what models are allowed to output at inference time in high-stakes domains.",
    timestamp: "2d ago",
    cluster: "ai",
    connections: ["idea-15", "idea-46"],
  },
  {
    id: "idea-82",
    title: "Agentic CRMs",
    description:
      "Customer relationship systems where agents manage follow-ups, research, and drafting automatically.",
    timestamp: "3d ago",
    cluster: "ai",
    connections: ["idea-2", "idea-18"],
  },
  {
    id: "idea-83",
    title: "Outcome-based SaaS pricing",
    description:
      "Pricing software purely on measurable outcomes, like revenue or time saved, rather than seats.",
    timestamp: "4d ago",
    cluster: "startups",
    connections: ["idea-25", "idea-18"],
  },
  {
    id: "idea-84",
    title: "Microscopic pivots",
    description:
      "Teams that pivot not just products but individual features weekly based on strong signals.",
    timestamp: "5d ago",
    cluster: "startups",
    connections: ["idea-24", "idea-28"],
  },
  {
    id: "idea-85",
    title: "Agent observability stacks",
    description:
      "Monitoring stacks designed specifically to understand and debug the behavior of AI agents in production.",
    timestamp: "6d ago",
    cluster: "ai",
    connections: ["idea-17", "idea-82"],
  },
  {
    id: "idea-86",
    title: "Temporal cofounders",
    description:
      "Cofounders who only join for the zero-to-one phase, then rotate out by design.",
    timestamp: "1w ago",
    cluster: "startups",
    connections: ["idea-24", "idea-30"],
  },
  {
    id: "idea-87",
    title: "Personal R&D labs",
    description:
      "Individuals running their own small research labs using AI, robotics kits, and shared infrastructure.",
    timestamp: "1w ago",
    cluster: "creativity",
    connections: ["idea-69", "idea-55"],
  },
  {
    id: "idea-88",
    title: "Prediction markets for roadmap bets",
    description:
      "Internal markets where employees bet on which roadmap items will move key metrics.",
    timestamp: "2w ago",
    cluster: "startups",
    connections: ["idea-25", "idea-83"],
  },
  {
    id: "idea-89",
    title: "Explainable ops runbooks",
    description:
      "Ops runbooks co-authored by AI that can explain not just what to do, but why.",
    timestamp: "2w ago",
    cluster: "ai",
    connections: ["idea-18", "idea-85"],
  },
  {
    id: "idea-90",
    title: "Failure museums",
    description:
      "Spaces inside companies where past failed experiments are documented and celebrated as learning artifacts.",
    timestamp: "2w ago",
    cluster: "startups",
    connections: ["idea-30", "idea-62"],
  },

  // Final ten to reach ~100
  {
    id: "idea-91",
    title: "Story-first product specs",
    description:
      "Specs written as narrative stories from the user's point of view, then decomposed into tickets.",
    timestamp: "3d ago",
    cluster: "startups",
    connections: ["idea-22", "idea-32"],
  },
  {
    id: "idea-92",
    title: "Neural sketchpads",
    description:
      "Pads where rough scribbles are continuously interpreted and refined by models into cleaner concepts.",
    timestamp: "4d ago",
    cluster: "creativity",
    connections: ["idea-67", "idea-19"],
  },
  {
    id: "idea-93",
    title: "Lifelong learning contracts",
    description:
      "Employment contracts that guarantee budget and time for continuous upskilling as part of comp.",
    timestamp: "5d ago",
    cluster: "startups",
    connections: ["idea-69", "idea-83"],
  },
  {
    id: "idea-94",
    title: "Embodied classrooms",
    description:
      "Classrooms where students learn concepts by programming simple robots to act them out.",
    timestamp: "6d ago",
    cluster: "robotics",
    connections: ["idea-55", "idea-69"],
  },
  {
    id: "idea-95",
    title: "Meta-journalism dashboards",
    description:
      "Dashboards that show which stories are being covered, by whom, and what is systematically ignored.",
    timestamp: "1w ago",
    cluster: "journalism",
    connections: ["idea-40", "idea-35"],
  },
  {
    id: "idea-96",
    title: "Thought probes",
    description:
      "Tiny prompts scattered through your day that nudge you to record micro-insights before they evaporate.",
    timestamp: "1w ago",
    cluster: "creativity",
    connections: ["idea-64", "idea-61"],
  },
  {
    id: "idea-97",
    title: "Moral rehearsal spaces",
    description:
      "Simulated environments where people can rehearse hard moral decisions with guidance from philosophers and models.",
    timestamp: "1w ago",
    cluster: "philosophy",
    connections: ["idea-43", "idea-46"],
  },
  {
    id: "idea-98",
    title: "Robot-readable cities",
    description:
      "Urban design guidelines that make it easier for robots to perceive and navigate safely.",
    timestamp: "2w ago",
    cluster: "robotics",
    connections: ["idea-75", "idea-58"],
  },
  {
    id: "idea-99",
    title: "AI-assisted oral histories",
    description:
      "Capturing multi-generational oral histories and turning them into searchable, living archives.",
    timestamp: "2w ago",
    cluster: "journalism",
    connections: ["idea-31", "idea-38"],
  },
  {
    id: "idea-100",
    title: "Shared dream logs",
    description:
      "Communities that record dreams and use models to surface recurring archetypes and themes.",
    timestamp: "2w ago",
    cluster: "creativity",
    connections: ["idea-79", "idea-62"],
  },
];

const NOW = new Date();

function legacyTimestampToIso(label: string): string {
  const match = /^(\d+)([hdw])\s+ago$/.exec(label.trim());
  if (!match) return NOW.toISOString();
  const amount = Number.parseInt(match[1], 10);
  const unit = match[2];
  const d = new Date(NOW);
  if (unit === "h") {
    d.setHours(d.getHours() - amount);
  } else if (unit === "d") {
    d.setDate(d.getDate() - amount);
  } else if (unit === "w") {
    d.setDate(d.getDate() - amount * 7);
  }
  return d.toISOString();
}

function buildZettelIdeas(ideas: LegacyIdea[]): Idea[] {
  const byCluster = new Map<ThemeId, LegacyIdea[]>();
  ideas.forEach((idea) => {
    const list = byCluster.get(idea.cluster) ?? [];
    list.push(idea);
    byCluster.set(idea.cluster, list);
  });

  // TODO: auto-generate from LLM based on child idea content
  const TRUNK_LABELS: Record<ThemeId, string[]> = {
    ai: ["AI memory", "Agent systems", "Reasoning", "Governance"],
    startups: ["Founder OS", "Teams & culture", "Moats", "Markets"],
    journalism: ["Trust & legitimacy", "Investigation", "Interfaces", "Protocols"],
    philosophy: ["Identity", "Epistemics", "Ethics", "Meaning"],
    robotics: ["Embodiment", "Manipulation", "Swarms & fleets", "Urban systems"],
    creativity: ["Combinatorics", "Constraints", "Practice loops", "Dreams"],
  };

  const result: Idea[] = [];

  function inferType(depth: number): Idea["type"] {
    if (depth === 0) return "idea";
    if (depth === 1) return "thought";
    return "snippet";
  }

  (Array.from(byCluster.entries()) as [ThemeId, LegacyIdea[]][]).forEach(
    ([cluster, clusterIdeas]) => {
      const trunkCount = clusterIdeas.length > 16 ? 4 : 3;
      const trunks = clusterIdeas.slice(0, trunkCount);
      const rest = clusterIdeas.slice(trunkCount);

      const trunkIds = trunks.map((t) => t.id);
      const trunkLabels = TRUNK_LABELS[cluster].slice(0, trunkCount);

      // Create trunk nodes
      trunks.forEach((idea, i) => {
        result.push({
          id: idea.id,
          title: idea.title,
          description: idea.description,
          timestamp: legacyTimestampToIso(idea.timestamp),
          cluster: idea.cluster,
          parentId: null,
          depth: 0,
          branchLabel: trunkLabels[i] ?? TRUNK_LABELS[cluster][0],
          type: inferType(0),
          subtopic: trunkLabels[i] ?? TRUNK_LABELS[cluster][0],
        });
      });

      // Allocate branches to trunks (2–5 each target)
      const branchesByTrunk = new Map<string, LegacyIdea[]>();
      trunkIds.forEach((id) => branchesByTrunk.set(id, []));

      rest.forEach((idea, idx) => {
        const trunkId = trunkIds[idx % trunkIds.length];
        branchesByTrunk.get(trunkId)!.push(idea);
      });

      // Convert allocations into branches/twigs with max depth 2
      trunkIds.forEach((trunkId, trunkIdx) => {
        const allocated = branchesByTrunk.get(trunkId) ?? [];

        const desiredBranches = Math.min(5, Math.max(2, Math.floor(allocated.length / 3)));
        const branchSeeds = allocated.slice(0, desiredBranches);
        const twigSeeds = allocated.slice(desiredBranches);

        const branchIds = branchSeeds.map((b) => b.id);
        const trunkBranchLabel =
          trunkLabels[trunkIdx] ?? TRUNK_LABELS[cluster][0];

        branchSeeds.forEach((idea) => {
          result.push({
            id: idea.id,
            title: idea.title,
            description: idea.description,
            timestamp: legacyTimestampToIso(idea.timestamp),
            cluster: idea.cluster,
            parentId: trunkId,
            depth: 1,
            branchLabel: trunkBranchLabel,
            type: inferType(1),
            subtopic: trunkBranchLabel,
          });
        });

        // Twigs attach to branches round-robin, max 3 per branch
        const twigCounts = new Map<string, number>();
        branchIds.forEach((id) => twigCounts.set(id, 0));

        twigSeeds.forEach((idea) => {
          const attachable = branchIds.find((id) => (twigCounts.get(id) ?? 0) < 3);
          const parentId = attachable ?? trunkId;
          if (attachable) twigCounts.set(attachable, (twigCounts.get(attachable) ?? 0) + 1);

          result.push({
            id: idea.id,
            title: idea.title,
            description: idea.description,
            timestamp: legacyTimestampToIso(idea.timestamp),
            cluster: idea.cluster,
            parentId,
            depth: parentId === trunkId ? 1 : 2,
            branchLabel: trunkBranchLabel,
            type: inferType(parentId === trunkId ? 1 : 2),
            subtopic: trunkBranchLabel,
          });
        });
      });
    }
  );

  return result;
}

function makeExtraTimestamps(now: Date): string[] {
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(max, n));

  const isoFrom = (d: Date) => d.toISOString();

  const hoursAgo = (h: number) => {
    const d = new Date(now);
    const ms = clamp(h, 0, 24) * 60 * 60 * 1000;
    d.setTime(d.getTime() - ms);
    return isoFrom(d);
  };

  const daysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - clamp(days, 0, 365));
    return isoFrom(d);
  };

  // Distribution (100 total):
  // - 15%: today (last few hours)
  // - 25%: past week
  // - 30%: past month
  // - 20%: past 3 months
  // - 10%: 3–12 months ago
  const today = [
    0.4, 0.6, 0.9, 1.1, 1.4, 1.7, 2.0, 2.3, 2.7, 3.0, 3.4, 3.8, 4.2, 4.7,
    5.2,
  ].map(hoursAgo); // 15

  const week = [
    1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 2, 3, 4, 5, 6, 1, 2, 3, 4,
    6, 7,
  ].map(daysAgo); // 25

  const month = [
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    26, 27, 28, 29, 30, 9, 12, 15, 18, 21, 24, 27,
  ].map(daysAgo); // 30

  const threeMonths = [
    31, 33, 35, 38, 40, 42, 45, 47, 50, 52, 55, 58, 60, 63, 66, 70, 74, 78,
    82, 89,
  ].map(daysAgo); // 20

  const older = [91, 105, 120, 150, 180, 210, 240, 270, 300, 330].map(daysAgo); // 10

  return [...today, ...week, ...month, ...threeMonths, ...older];
}

const EXTRA_TIMESTAMPS = makeExtraTimestamps(NOW);

const EXTRA_ZETTEL_IDEAS: Idea[] = [
  // AI — trunks (new branch labels)
  {
    id: "idea-101",
    title: "Consentful memory layers",
    description:
      "A personal memory layer where every captured artifact has an explicit consent trail: who is referenced, who can revoke, and what contexts are allowed. The hard part isn't storage — it's enforcement that survives exports, model swaps, and team handoffs.",
    timestamp: EXTRA_TIMESTAMPS[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Consentful memory",
    type: "idea",
    subtopic: "Consentful memory",
  },
  {
    id: "idea-102",
    title: "Tooling ecology maps",
    description:
      "Instead of a list of apps, maintain a graph of tools, intents, and data dependencies. When you replace one tool, an agent can suggest compatible substitutes, migration risks, and new capabilities unlocked by different combinations.",
    timestamp: EXTRA_TIMESTAMPS[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Tooling ecology",
    type: "thought",
    subtopic: "Tooling ecology",
  },
  {
    id: "idea-103",
    title: "Model literacy as a skill",
    description:
      "The next kind of 'computer literacy' is knowing how models fail: where they hallucinate, where they overfit to vibes, and how to interrogate uncertainty. The best operators will look less like prompt poets and more like skeptical editors.",
    timestamp: EXTRA_TIMESTAMPS[2],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Model literacy",
    type: "thought",
    subtopic: "Model literacy",
  },

  // AI — branches and twigs for idea-101
  {
    id: "idea-104",
    title: "Revocation primitives",
    description:
      "A memory system needs a first-class notion of revocation: a person can say, 'forget this story,' and downstream summaries, embeddings, and derived notes must be rebuilt.",
    timestamp: EXTRA_TIMESTAMPS[3],
    cluster: "ai",
    parentId: "idea-101",
    depth: 1,
    branchLabel: "Consentful memory",
    type: "idea",
    subtopic: "Consentful memory",
  },
  {
    id: "idea-105",
    title: "Context scopes, not global recall",
    description:
      "Most 'memory' products feel creepy because they assume global recall. What we want is scoped recall: work-meeting context, close-friends context, medical context — each with its own policies and social contracts.",
    timestamp: EXTRA_TIMESTAMPS[4],
    cluster: "ai",
    parentId: "idea-101",
    depth: 1,
    branchLabel: "Consentful memory",
    type: "thought",
    subtopic: "Consentful memory",
  },
  {
    id: "idea-106",
    title: "Memory receipts",
    description:
      "Every time an agent uses a remembered artifact, it should produce a receipt: what it pulled, why, and what it inferred. Receipts become the unit of trust.",
    timestamp: EXTRA_TIMESTAMPS[5],
    cluster: "ai",
    parentId: "idea-101",
    depth: 1,
    branchLabel: "Consentful memory",
    type: "idea",
    subtopic: "Consentful memory",
  },
  {
    id: "idea-107",
    title: "Snippet: 'Memory without receipts becomes gossip.'",
    description: "Memory without receipts becomes gossip.",
    timestamp: EXTRA_TIMESTAMPS[6],
    cluster: "ai",
    parentId: "idea-106",
    depth: 2,
    branchLabel: "Consentful memory",
    type: "snippet",
    subtopic: "Consentful memory",
  },
  {
    id: "idea-108",
    title: "Quote on revocation",
    description:
      "“The difference between a helpful assistant and a surveillance system is whether forgetting is an API.” — Mira J. Han, privacy engineer",
    timestamp: EXTRA_TIMESTAMPS[7],
    cluster: "ai",
    parentId: "idea-104",
    depth: 2,
    branchLabel: "Consentful memory",
    type: "quote",
    subtopic: "Consentful memory",
  },

  // AI — branches and twigs for idea-102
  {
    id: "idea-109",
    title: "Intent-first app catalogs",
    description:
      "Catalog tools by intent (research, drafting, scheduling, debugging) and constraints (offline, SOC2, local-first). Then swapping tools becomes a query, not a migration project.",
    timestamp: EXTRA_TIMESTAMPS[8],
    cluster: "ai",
    parentId: "idea-102",
    depth: 1,
    branchLabel: "Tooling ecology",
    type: "idea",
    subtopic: "Tooling ecology",
  },
  {
    id: "idea-110",
    title: "Data lineage for personal stacks",
    description:
      "A personal lineage graph: where a claim originated, what transforms touched it, and which exports leaked it into other systems. The adult version of 'source: trust me.'",
    timestamp: EXTRA_TIMESTAMPS[9],
    cluster: "ai",
    parentId: "idea-102",
    depth: 1,
    branchLabel: "Tooling ecology",
    type: "thought",
    subtopic: "Tooling ecology",
  },
  {
    id: "idea-111",
    title: "Migration risk scoring",
    description:
      "Agents that score a tool swap on fragility: hidden automations, API rate limits, edge-case formats, and the parts of your workflow you only notice when they break.",
    timestamp: EXTRA_TIMESTAMPS[10],
    cluster: "ai",
    parentId: "idea-102",
    depth: 1,
    branchLabel: "Tooling ecology",
    type: "idea",
    subtopic: "Tooling ecology",
  },
  {
    id: "idea-112",
    title: "Snippet: 'Your tools are a thesis about your time.'",
    description: "Your tools are a thesis about your time.",
    timestamp: EXTRA_TIMESTAMPS[11],
    cluster: "ai",
    parentId: "idea-109",
    depth: 2,
    branchLabel: "Tooling ecology",
    type: "snippet",
    subtopic: "Tooling ecology",
  },
  {
    id: "idea-113",
    title: "Quote on tool graphs",
    description:
      "“We don't pick apps; we pick coupling. The bill arrives later as migration.” — Daniel Kertesz, systems designer",
    timestamp: EXTRA_TIMESTAMPS[12],
    cluster: "ai",
    parentId: "idea-111",
    depth: 2,
    branchLabel: "Tooling ecology",
    type: "quote",
    subtopic: "Tooling ecology",
  },

  // AI — branches and twigs for idea-103
  {
    id: "idea-114",
    title: "Uncertainty annotations",
    description:
      "Interfaces that force models to attach uncertainty tags to specific spans: which sentence is grounded, which is extrapolated, which is a best-guess bridge.",
    timestamp: EXTRA_TIMESTAMPS[13],
    cluster: "ai",
    parentId: "idea-103",
    depth: 1,
    branchLabel: "Model literacy",
    type: "idea",
    subtopic: "Model literacy",
  },
  {
    id: "idea-115",
    title: "Failure-mode flashcards",
    description:
      "A training set for humans: flashcards of real model failures (confident wrongness, citation laundering, goal drift) so teams build intuition for when to slow down.",
    timestamp: EXTRA_TIMESTAMPS[14],
    cluster: "ai",
    parentId: "idea-103",
    depth: 1,
    branchLabel: "Model literacy",
    type: "idea",
    subtopic: "Model literacy",
  },
  {
    id: "idea-116",
    title: "Prompting as adversarial testing",
    description:
      "The most valuable prompts aren't 'make it nicer' — they're probes that try to break the system: counterexamples, boundary cases, and questions that reveal hidden assumptions.",
    timestamp: EXTRA_TIMESTAMPS[15],
    cluster: "ai",
    parentId: "idea-103",
    depth: 1,
    branchLabel: "Model literacy",
    type: "thought",
    subtopic: "Model literacy",
  },
  {
    id: "idea-117",
    title: "Snippet: 'Treat fluency as a symptom, not evidence.'",
    description: "Treat fluency as a symptom, not evidence.",
    timestamp: EXTRA_TIMESTAMPS[16],
    cluster: "ai",
    parentId: "idea-116",
    depth: 2,
    branchLabel: "Model literacy",
    type: "snippet",
    subtopic: "Model literacy",
  },

  // Startups — trunks (new branch labels)
  {
    id: "idea-118",
    title: "Customer truth infrastructure",
    description:
      "A startup's real asset is a disciplined record of customer truth: calls, churn notes, objections, and the moments you were wrong. Most teams lose this in Slack and 'tribal knowledge' until it's too late.",
    timestamp: EXTRA_TIMESTAMPS[17],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Customer truth",
    type: "idea",
    subtopic: "Customer truth",
  },
  {
    id: "idea-119",
    title: "Speed is a culture artifact",
    description:
      "People blame process, but speed is mostly permission structures: who can ship, who can decide, and how expensive a mistake is socially. Velocity is an org chart property.",
    timestamp: EXTRA_TIMESTAMPS[18],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Velocity design",
    type: "thought",
    subtopic: "Velocity design",
  },
  {
    id: "idea-120",
    title: "Second-order moats",
    description:
      "Your first moat is what you built. Your second-order moat is what building it forced you to learn: hard-won edge cases, distribution quirks, compliance scars, and the weird customer psychology you only get by living it.",
    timestamp: EXTRA_TIMESTAMPS[19],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Second-order moats",
    type: "idea",
    subtopic: "Second-order moats",
  },

  // Startups — branches and twigs for idea-118
  {
    id: "idea-121",
    title: "Objection libraries",
    description:
      "A versioned library of objections with the exact clips where customers said them, plus the counter-evidence that changed their mind (or didn't).",
    timestamp: EXTRA_TIMESTAMPS[20],
    cluster: "startups",
    parentId: "idea-118",
    depth: 1,
    branchLabel: "Customer truth",
    type: "idea",
    subtopic: "Customer truth",
  },
  {
    id: "idea-122",
    title: "Churn autopsies as rituals",
    description:
      "Not a form. A ritual: one person presents the story, one person plays the skeptic, and you end with a testable hypothesis. The point is to reduce self-deception, not to assign blame.",
    timestamp: EXTRA_TIMESTAMPS[21],
    cluster: "startups",
    parentId: "idea-118",
    depth: 1,
    branchLabel: "Customer truth",
    type: "thought",
    subtopic: "Customer truth",
  },
  {
    id: "idea-123",
    title: "Truth debt",
    description:
      "When the product evolves faster than the team's shared understanding of why customers buy, you accrue truth debt. It shows up as random roadmap debates and 'it depends' sales calls.",
    timestamp: EXTRA_TIMESTAMPS[22],
    cluster: "startups",
    parentId: "idea-118",
    depth: 1,
    branchLabel: "Customer truth",
    type: "idea",
    subtopic: "Customer truth",
  },
  {
    id: "idea-124",
    title: "Quote on customer truth",
    description:
      "“You don't have a product problem; you have a memory problem about customers.” — Keisha Alvarez, growth lead",
    timestamp: EXTRA_TIMESTAMPS[23],
    cluster: "startups",
    parentId: "idea-123",
    depth: 2,
    branchLabel: "Customer truth",
    type: "quote",
    subtopic: "Customer truth",
  },
  {
    id: "idea-125",
    title: "Snippet: 'Churn is a narrative, not a metric.'",
    description: "Churn is a narrative, not a metric.",
    timestamp: EXTRA_TIMESTAMPS[24],
    cluster: "startups",
    parentId: "idea-122",
    depth: 2,
    branchLabel: "Customer truth",
    type: "snippet",
    subtopic: "Customer truth",
  },

  // Startups — branches and twigs for idea-119
  {
    id: "idea-126",
    title: "Decision latency budgets",
    description:
      "Treat decisions like performance budgets: if pricing takes three weeks to decide, that's a regression. Track it like you track p95 latency.",
    timestamp: EXTRA_TIMESTAMPS[25],
    cluster: "startups",
    parentId: "idea-119",
    depth: 1,
    branchLabel: "Velocity design",
    type: "idea",
    subtopic: "Velocity design",
  },
  {
    id: "idea-127",
    title: "Reversible vs. irreversible shipping",
    description:
      "Speed comes from correctly classifying moves: what can be rolled back, what needs a longer runway, what needs a public narrative. Many orgs treat everything as irreversible.",
    timestamp: EXTRA_TIMESTAMPS[26],
    cluster: "startups",
    parentId: "idea-119",
    depth: 1,
    branchLabel: "Velocity design",
    type: "thought",
    subtopic: "Velocity design",
  },
  {
    id: "idea-128",
    title: "Permission gradients",
    description:
      "Design explicit gradients of permission: interns can ship copy, PMs can ship experiments, leads can ship defaults. The ambiguity is what slows people down.",
    timestamp: EXTRA_TIMESTAMPS[27],
    cluster: "startups",
    parentId: "idea-119",
    depth: 1,
    branchLabel: "Velocity design",
    type: "idea",
    subtopic: "Velocity design",
  },
  {
    id: "idea-129",
    title: "Snippet: 'Speed is the absence of fear in system form.'",
    description: "Speed is the absence of fear in system form.",
    timestamp: EXTRA_TIMESTAMPS[28],
    cluster: "startups",
    parentId: "idea-127",
    depth: 2,
    branchLabel: "Velocity design",
    type: "snippet",
    subtopic: "Velocity design",
  },

  // Startups — branches and twigs for idea-120
  {
    id: "idea-130",
    title: "Edge-case libraries",
    description:
      "A moat-building library of the ugly cases: the integrations that always break, the compliance gotchas, the customer weirdness. Competitors can copy the happy path in a week; they can't copy the scar tissue.",
    timestamp: EXTRA_TIMESTAMPS[29],
    cluster: "startups",
    parentId: "idea-120",
    depth: 1,
    branchLabel: "Second-order moats",
    type: "idea",
    subtopic: "Second-order moats",
  },
  {
    id: "idea-131",
    title: "Distribution quirks as IP",
    description:
      "Sometimes the moat is knowing where buyers actually hang out, what language they trust, and which channels look good on paper but never convert. This knowledge rarely makes it into decks.",
    timestamp: EXTRA_TIMESTAMPS[30],
    cluster: "startups",
    parentId: "idea-120",
    depth: 1,
    branchLabel: "Second-order moats",
    type: "thought",
    subtopic: "Second-order moats",
  },
  {
    id: "idea-132",
    title: "Compliance scars",
    description:
      "The roadmap you didn't want: audits, procurement, security questionnaires. Surviving them teaches you the real constraints of the market and filters out copycats.",
    timestamp: EXTRA_TIMESTAMPS[31],
    cluster: "startups",
    parentId: "idea-120",
    depth: 1,
    branchLabel: "Second-order moats",
    type: "idea",
    subtopic: "Second-order moats",
  },
  {
    id: "idea-133",
    title: "Quote on scar tissue",
    description:
      "“Your competitor can clone your features. They can't clone the last twelve failures that taught you what not to build.” — Tomás Rhee, operator",
    timestamp: EXTRA_TIMESTAMPS[32],
    cluster: "startups",
    parentId: "idea-130",
    depth: 2,
    branchLabel: "Second-order moats",
    type: "quote",
    subtopic: "Second-order moats",
  },

  // Journalism — trunks (new branch labels)
  {
    id: "idea-134",
    title: "Evidence-first publishing",
    description:
      "Articles that ship with their evidence graph: documents, clips, code, and the chain of reasoning that connects them. The story becomes a view on a dataset, not a monologue.",
    timestamp: EXTRA_TIMESTAMPS[33],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Evidence graphs",
    type: "idea",
    subtopic: "Evidence graphs",
  },
  {
    id: "idea-135",
    title: "Local trust compilers",
    description:
      "Small teams that compile trust the way open-source compiles code: locally verified claims, public corrections, and a visible changelog of what changed and why.",
    timestamp: EXTRA_TIMESTAMPS[34],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Local trust",
    type: "idea",
    subtopic: "Local trust",
  },
  {
    id: "idea-136",
    title: "Attention shaping ethics",
    description:
      "News isn't just facts; it's an attention allocation system. The ethics question isn't only 'is it true?' but 'what does this coverage cause to become salient in people's minds?'",
    timestamp: EXTRA_TIMESTAMPS[35],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Attention ethics",
    type: "thought",
    subtopic: "Attention ethics",
  },

  // Journalism — branches and twigs for idea-134
  {
    id: "idea-137",
    title: "Reproducible investigations",
    description:
      "If you used code to investigate, publish it with pinned data and deterministic outputs. Let other reporters rerun the work, fork it, and extend it without starting over.",
    timestamp: EXTRA_TIMESTAMPS[36],
    cluster: "journalism",
    parentId: "idea-134",
    depth: 1,
    branchLabel: "Evidence graphs",
    type: "idea",
    subtopic: "Evidence graphs",
  },
  {
    id: "idea-138",
    title: "Claim-level citations",
    description:
      "Cite at the claim level, not the paragraph level. Readers should be able to click a sentence and see the exact document snippet that supports it.",
    timestamp: EXTRA_TIMESTAMPS[37],
    cluster: "journalism",
    parentId: "idea-134",
    depth: 1,
    branchLabel: "Evidence graphs",
    type: "idea",
    subtopic: "Evidence graphs",
  },
  {
    id: "idea-139",
    title: "Evidence redaction norms",
    description:
      "Publishing evidence graphs creates new harms: doxxing, harassment, source exposure. We need shared redaction norms that are explicit, consistent, and auditable.",
    timestamp: EXTRA_TIMESTAMPS[38],
    cluster: "journalism",
    parentId: "idea-134",
    depth: 1,
    branchLabel: "Evidence graphs",
    type: "thought",
    subtopic: "Evidence graphs",
  },
  {
    id: "idea-140",
    title: "Snippet: 'A story is a query with a voice.'",
    description: "A story is a query with a voice.",
    timestamp: EXTRA_TIMESTAMPS[39],
    cluster: "journalism",
    parentId: "idea-138",
    depth: 2,
    branchLabel: "Evidence graphs",
    type: "snippet",
    subtopic: "Evidence graphs",
  },

  // Journalism — branches and twigs for idea-135
  {
    id: "idea-141",
    title: "Correction-led homepages",
    description:
      "Make corrections a top-level feed: what changed since yesterday, and what changed your mind. Trust accumulates through visible revision, not through tone.",
    timestamp: EXTRA_TIMESTAMPS[40],
    cluster: "journalism",
    parentId: "idea-135",
    depth: 1,
    branchLabel: "Local trust",
    type: "idea",
    subtopic: "Local trust",
  },
  {
    id: "idea-142",
    title: "Neighborhood source circles",
    description:
      "Small, recurring groups of local sources who review claims before publication. Not as gatekeepers, but as error detectors with context no outsider has.",
    timestamp: EXTRA_TIMESTAMPS[41],
    cluster: "journalism",
    parentId: "idea-135",
    depth: 1,
    branchLabel: "Local trust",
    type: "idea",
    subtopic: "Local trust",
  },
  {
    id: "idea-143",
    title: "Trust compilers for public data",
    description:
      "Automate ingestion of public records (budgets, procurement, inspections), but keep the last mile human: local interpretation, naming, and narrative accountability.",
    timestamp: EXTRA_TIMESTAMPS[42],
    cluster: "journalism",
    parentId: "idea-135",
    depth: 1,
    branchLabel: "Local trust",
    type: "thought",
    subtopic: "Local trust",
  },
  {
    id: "idea-144",
    title: "Quote on corrections",
    description:
      "“Corrections are the only honest metric of how reality feels to an institution.” — Priya Nand, editor",
    timestamp: EXTRA_TIMESTAMPS[43],
    cluster: "journalism",
    parentId: "idea-141",
    depth: 2,
    branchLabel: "Local trust",
    type: "quote",
    subtopic: "Local trust",
  },

  // Journalism — branches and twigs for idea-136
  {
    id: "idea-145",
    title: "Salience budgets",
    description:
      "Treat attention like a budget: if you cover ten crime stories and zero zoning stories, you're training a city's mental model. Make those allocations explicit and revisable.",
    timestamp: EXTRA_TIMESTAMPS[44],
    cluster: "journalism",
    parentId: "idea-136",
    depth: 1,
    branchLabel: "Attention ethics",
    type: "idea",
    subtopic: "Attention ethics",
  },
  {
    id: "idea-146",
    title: "Second-order harm review",
    description:
      "A pre-publish review that asks: what happens if this is widely believed, even if it's true? Who gets targeted, what incentives shift, what gets crowded out?",
    timestamp: EXTRA_TIMESTAMPS[45],
    cluster: "journalism",
    parentId: "idea-136",
    depth: 1,
    branchLabel: "Attention ethics",
    type: "thought",
    subtopic: "Attention ethics",
  },
  {
    id: "idea-147",
    title: "Media diet transparency labels",
    description:
      "Personal dashboards that show what your feed has been training you to care about: topics, emotional valence, and repeated frames. Like nutrition labels for narratives.",
    timestamp: EXTRA_TIMESTAMPS[46],
    cluster: "journalism",
    parentId: "idea-136",
    depth: 1,
    branchLabel: "Attention ethics",
    type: "idea",
    subtopic: "Attention ethics",
  },
  {
    id: "idea-148",
    title: "Snippet: 'Coverage is a curriculum.'",
    description: "Coverage is a curriculum.",
    timestamp: EXTRA_TIMESTAMPS[47],
    cluster: "journalism",
    parentId: "idea-145",
    depth: 2,
    branchLabel: "Attention ethics",
    type: "snippet",
    subtopic: "Attention ethics",
  },

  // Philosophy — trunks (new branch labels)
  {
    id: "idea-149",
    title: "Practical metaphysics of copies",
    description:
      "If you can spin up a copy of yourself for a week of work, is that you, a worker, or a tool? The metaphysics becomes practical when copies can sign contracts and leave evidence trails.",
    timestamp: EXTRA_TIMESTAMPS[48],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Copies & obligations",
    type: "idea",
    subtopic: "Copies & obligations",
  },
  {
    id: "idea-150",
    title: "Honesty under compression",
    description:
      "Most lies are compression artifacts: you simplify your reasons until the story is clean, and then you forget the missing parts. The problem isn't intent; it's narrative entropy.",
    timestamp: EXTRA_TIMESTAMPS[49],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Narrative entropy",
    type: "thought",
    subtopic: "Narrative entropy",
  },
  {
    id: "idea-151",
    title: "Ethics of delegation",
    description:
      "Delegation doesn't remove responsibility; it changes the shape of it. When you delegate to a person, you inherit their agency; when you delegate to a model, you inherit its failure modes.",
    timestamp: EXTRA_TIMESTAMPS[50],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Delegation ethics",
    type: "idea",
    subtopic: "Delegation ethics",
  },

  // Philosophy — branches and twigs for idea-149
  {
    id: "idea-152",
    title: "Moral standing from continuity",
    description:
      "Maybe moral standing isn't about substrate; it's about continuity: memories, projects, and commitments that persist. Copies complicate this because continuity can fork.",
    timestamp: EXTRA_TIMESTAMPS[51],
    cluster: "philosophy",
    parentId: "idea-149",
    depth: 1,
    branchLabel: "Copies & obligations",
    type: "thought",
    subtopic: "Copies & obligations",
  },
  {
    id: "idea-153",
    title: "Contracts with future selves",
    description:
      "We already make contracts with our future selves (savings, habits). Copies make it explicit: who owes what to whom when 'you' becomes a plural noun?",
    timestamp: EXTRA_TIMESTAMPS[52],
    cluster: "philosophy",
    parentId: "idea-149",
    depth: 1,
    branchLabel: "Copies & obligations",
    type: "idea",
    subtopic: "Copies & obligations",
  },
  {
    id: "idea-154",
    title: "Rights as revocable licenses",
    description:
      "A pragmatic stance: treat copy-rights like licenses that can be granted and revoked based on behavior, rather than as natural rights. It will feel ugly, but institutions prefer levers.",
    timestamp: EXTRA_TIMESTAMPS[53],
    cluster: "philosophy",
    parentId: "idea-149",
    depth: 1,
    branchLabel: "Copies & obligations",
    type: "idea",
    subtopic: "Copies & obligations",
  },
  {
    id: "idea-155",
    title: "Quote on copies",
    description:
      "“Once identity can fork, obligation becomes the only thing that stitches it back together.” — L. Bennett, ethicist",
    timestamp: EXTRA_TIMESTAMPS[54],
    cluster: "philosophy",
    parentId: "idea-153",
    depth: 2,
    branchLabel: "Copies & obligations",
    type: "quote",
    subtopic: "Copies & obligations",
  },

  // Philosophy — branches and twigs for idea-150
  {
    id: "idea-156",
    title: "Narratives as lossy codecs",
    description:
      "When you tell the story of why you did something, you compress. The missing details aren't neutral — they tend to remove selfish motives and uncertainty first.",
    timestamp: EXTRA_TIMESTAMPS[55],
    cluster: "philosophy",
    parentId: "idea-150",
    depth: 1,
    branchLabel: "Narrative entropy",
    type: "thought",
    subtopic: "Narrative entropy",
  },
  {
    id: "idea-157",
    title: "Truthful complexity",
    description:
      "A practice: keep one 'messy' version of your reasoning that preserves contradictions, doubts, and mixed motives. It's harder to share, but it's harder to lie with.",
    timestamp: EXTRA_TIMESTAMPS[56],
    cluster: "philosophy",
    parentId: "idea-150",
    depth: 1,
    branchLabel: "Narrative entropy",
    type: "idea",
    subtopic: "Narrative entropy",
  },
  {
    id: "idea-158",
    title: "Self-deception as UI",
    description:
      "We design our own internal UI: what we surface, what we hide, what gets rounded away. Self-deception is often a user-experience choice made unconsciously.",
    timestamp: EXTRA_TIMESTAMPS[57],
    cluster: "philosophy",
    parentId: "idea-150",
    depth: 1,
    branchLabel: "Narrative entropy",
    type: "thought",
    subtopic: "Narrative entropy",
  },
  {
    id: "idea-159",
    title: "Snippet: 'Clean stories are suspiciously efficient.'",
    description: "Clean stories are suspiciously efficient.",
    timestamp: EXTRA_TIMESTAMPS[58],
    cluster: "philosophy",
    parentId: "idea-156",
    depth: 2,
    branchLabel: "Narrative entropy",
    type: "snippet",
    subtopic: "Narrative entropy",
  },

  // Philosophy — branches and twigs for idea-151
  {
    id: "idea-160",
    title: "Delegation as moral leverage",
    description:
      "Delegation can be used to increase harm (plausible deniability) or decrease it (expertise, checks). The same mechanism is moral leverage; you decide the direction.",
    timestamp: EXTRA_TIMESTAMPS[59],
    cluster: "philosophy",
    parentId: "idea-151",
    depth: 1,
    branchLabel: "Delegation ethics",
    type: "thought",
    subtopic: "Delegation ethics",
  },
  {
    id: "idea-161",
    title: "Accountability interfaces",
    description:
      "If we delegate to models, we need interfaces that make accountability visible: what inputs were used, what constraints applied, who approved the output, and what guardrails failed.",
    timestamp: EXTRA_TIMESTAMPS[60],
    cluster: "philosophy",
    parentId: "idea-151",
    depth: 1,
    branchLabel: "Delegation ethics",
    type: "idea",
    subtopic: "Delegation ethics",
  },
  {
    id: "idea-162",
    title: "Responsibility gradients",
    description:
      "Responsibility isn't binary. In complex systems, it's a gradient: author, reviewer, deployer, policy maker. Delegation shifts where gradients accumulate.",
    timestamp: EXTRA_TIMESTAMPS[61],
    cluster: "philosophy",
    parentId: "idea-151",
    depth: 1,
    branchLabel: "Delegation ethics",
    type: "idea",
    subtopic: "Delegation ethics",
  },
  {
    id: "idea-163",
    title: "Quote on delegation",
    description:
      "“If you can’t explain the failure modes of what you delegated to, you didn’t delegate — you abdicated.” — Rowan Kline, safety researcher",
    timestamp: EXTRA_TIMESTAMPS[62],
    cluster: "philosophy",
    parentId: "idea-161",
    depth: 2,
    branchLabel: "Delegation ethics",
    type: "quote",
    subtopic: "Delegation ethics",
  },

  // Robotics — trunks (new branch labels)
  {
    id: "idea-164",
    title: "Maintenance-native robots",
    description:
      "Robots designed around their own maintenance: easy calibration, modular joints, self-diagnostics, and visible wear. The enemy isn't failure; it's silent drift.",
    timestamp: EXTRA_TIMESTAMPS[63],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Maintenance-native",
    type: "idea",
    subtopic: "Maintenance-native",
  },
  {
    id: "idea-165",
    title: "Learning from near-misses",
    description:
      "Robotics datasets focus on success and catastrophic failure. The gold is near-misses: the slip before the drop, the wobble before the fall. Capture them and you get reflexes.",
    timestamp: EXTRA_TIMESTAMPS[64],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Near-miss learning",
    type: "idea",
    subtopic: "Near-miss learning",
  },
  {
    id: "idea-166",
    title: "Robots as public infrastructure",
    description:
      "When robots enter sidewalks and buildings at scale, they stop being products and become infrastructure. The core question shifts from 'can it work?' to 'who maintains it, and who gets to say no?'",
    timestamp: EXTRA_TIMESTAMPS[65],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Civic robotics",
    type: "thought",
    subtopic: "Civic robotics",
  },

  // Robotics — branches and twigs for idea-164
  {
    id: "idea-167",
    title: "Calibration diaries",
    description:
      "A robot should keep a diary of calibration and drift: what sensors are degrading, what compensation is happening, and when it should refuse certain tasks.",
    timestamp: EXTRA_TIMESTAMPS[66],
    cluster: "robotics",
    parentId: "idea-164",
    depth: 1,
    branchLabel: "Maintenance-native",
    type: "idea",
    subtopic: "Maintenance-native",
  },
  {
    id: "idea-168",
    title: "Modularity as uptime",
    description:
      "We talk about modularity as design elegance. In robotics it's uptime: swap a wrist module in five minutes instead of taking a fleet offline for a week.",
    timestamp: EXTRA_TIMESTAMPS[67],
    cluster: "robotics",
    parentId: "idea-164",
    depth: 1,
    branchLabel: "Maintenance-native",
    type: "thought",
    subtopic: "Maintenance-native",
  },
  {
    id: "idea-169",
    title: "Wear-aware policies",
    description:
      "Planning policies that know their own wear curves: if a joint is near fatigue, choose motions that reduce stress even if they’re slightly slower.",
    timestamp: EXTRA_TIMESTAMPS[68],
    cluster: "robotics",
    parentId: "idea-164",
    depth: 1,
    branchLabel: "Maintenance-native",
    type: "idea",
    subtopic: "Maintenance-native",
  },
  {
    id: "idea-170",
    title: "Snippet: 'Drift is the default; stability is work.'",
    description: "Drift is the default; stability is work.",
    timestamp: EXTRA_TIMESTAMPS[69],
    cluster: "robotics",
    parentId: "idea-167",
    depth: 2,
    branchLabel: "Maintenance-native",
    type: "snippet",
    subtopic: "Maintenance-native",
  },

  // Robotics — branches and twigs for idea-165
  {
    id: "idea-171",
    title: "Near-miss telemetry standards",
    description:
      "Define a standard for near-miss capture: pre-impact frames, force spikes, controller state, and a short semantic label. Without standards, everyone collects incompatible anecdotes.",
    timestamp: EXTRA_TIMESTAMPS[70],
    cluster: "robotics",
    parentId: "idea-165",
    depth: 1,
    branchLabel: "Near-miss learning",
    type: "idea",
    subtopic: "Near-miss learning",
  },
  {
    id: "idea-172",
    title: "Reflex libraries",
    description:
      "Train small reflex policies for recovery (catch, step, regrip) and compose them with higher-level planners. The planner decides; the reflex saves you when reality doesn't cooperate.",
    timestamp: EXTRA_TIMESTAMPS[71],
    cluster: "robotics",
    parentId: "idea-165",
    depth: 1,
    branchLabel: "Near-miss learning",
    type: "idea",
    subtopic: "Near-miss learning",
  },
  {
    id: "idea-173",
    title: "Learning from 'almost right'",
    description:
      "A near-miss is a gradient: the robot was close to correct. Use it to shape policies with dense feedback instead of waiting for rare successes.",
    timestamp: EXTRA_TIMESTAMPS[72],
    cluster: "robotics",
    parentId: "idea-165",
    depth: 1,
    branchLabel: "Near-miss learning",
    type: "thought",
    subtopic: "Near-miss learning",
  },
  {
    id: "idea-174",
    title: "Quote on near-misses",
    description:
      "“The fastest way to teach a robot is to study how it almost succeeded.” — Hana Ito, roboticist",
    timestamp: EXTRA_TIMESTAMPS[73],
    cluster: "robotics",
    parentId: "idea-172",
    depth: 2,
    branchLabel: "Near-miss learning",
    type: "quote",
    subtopic: "Near-miss learning",
  },

  // Robotics — branches and twigs for idea-166
  {
    id: "idea-175",
    title: "Right-of-way policies",
    description:
      "Robots need legible right-of-way behavior: who yields, how to signal intent, when to stop. In public space, awkwardness is a safety bug.",
    timestamp: EXTRA_TIMESTAMPS[74],
    cluster: "robotics",
    parentId: "idea-166",
    depth: 1,
    branchLabel: "Civic robotics",
    type: "idea",
    subtopic: "Civic robotics",
  },
  {
    id: "idea-176",
    title: "Public opt-out mechanisms",
    description:
      "If robots become infrastructure, people need opt-out levers: robot-free zones, requestable human service, and ways to report harm that don’t require a lawyer.",
    timestamp: EXTRA_TIMESTAMPS[75],
    cluster: "robotics",
    parentId: "idea-166",
    depth: 1,
    branchLabel: "Civic robotics",
    type: "idea",
    subtopic: "Civic robotics",
  },
  {
    id: "idea-177",
    title: "Maintenance budgets for cities",
    description:
      "The moment a robot fleet is public, the real issue is maintenance budgets. Most civic tech fails not because it can’t be built, but because nobody funds the boring part.",
    timestamp: EXTRA_TIMESTAMPS[76],
    cluster: "robotics",
    parentId: "idea-166",
    depth: 1,
    branchLabel: "Civic robotics",
    type: "thought",
    subtopic: "Civic robotics",
  },
  {
    id: "idea-178",
    title: "Snippet: 'Infrastructure is what keeps working after the demo.'",
    description: "Infrastructure is what keeps working after the demo.",
    timestamp: EXTRA_TIMESTAMPS[77],
    cluster: "robotics",
    parentId: "idea-177",
    depth: 2,
    branchLabel: "Civic robotics",
    type: "snippet",
    subtopic: "Civic robotics",
  },

  // Creativity — trunks (new branch labels)
  {
    id: "idea-179",
    title: "Taste as a measurable loop",
    description:
      "Taste isn't mystical; it’s a feedback loop. You expose yourself to exemplars, make small outputs, compare, and refine. Tools should help quantify the loop without killing the soul of it.",
    timestamp: EXTRA_TIMESTAMPS[78],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Taste loops",
    type: "idea",
    subtopic: "Taste loops",
  },
  {
    id: "idea-180",
    title: "Creative refusal",
    description:
      "A lot of creative work is refusing the obvious next step. The craft is recognizing the too-easy continuation and choosing a harder constraint that forces a new shape.",
    timestamp: EXTRA_TIMESTAMPS[79],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Refusal craft",
    type: "thought",
    subtopic: "Refusal craft",
  },
  {
    id: "idea-181",
    title: "Work-in-progress economies",
    description:
      "Markets for WIP: buying drafts, half-finished scenes, rough melodies. Value comes from direction and taste, not polish. This changes incentives from perfection to iteration.",
    timestamp: EXTRA_TIMESTAMPS[80],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "WIP economies",
    type: "idea",
    subtopic: "WIP economies",
  },

  // Creativity — branches and twigs for idea-179
  {
    id: "idea-182",
    title: "Exemplar playlists",
    description:
      "Curate exemplar playlists per project: three essays, two scenes, one interface. The playlist is a compass; it prevents you from drifting into generic output.",
    timestamp: EXTRA_TIMESTAMPS[81],
    cluster: "creativity",
    parentId: "idea-179",
    depth: 1,
    branchLabel: "Taste loops",
    type: "idea",
    subtopic: "Taste loops",
  },
  {
    id: "idea-183",
    title: "Taste audits",
    description:
      "Periodically audit your taste: what you claim you like vs. what you actually save, rewatch, and imitate. The delta is where your real aesthetic lives.",
    timestamp: EXTRA_TIMESTAMPS[82],
    cluster: "creativity",
    parentId: "idea-179",
    depth: 1,
    branchLabel: "Taste loops",
    type: "thought",
    subtopic: "Taste loops",
  },
  {
    id: "idea-184",
    title: "Friction as a signal",
    description:
      "If making a draft feels frictionless, you might be copying a template. Some friction is a signal you're exploring real novelty, not just assembling.",
    timestamp: EXTRA_TIMESTAMPS[83],
    cluster: "creativity",
    parentId: "idea-179",
    depth: 1,
    branchLabel: "Taste loops",
    type: "thought",
    subtopic: "Taste loops",
  },
  {
    id: "idea-185",
    title: "Snippet: 'Taste is the critic that shows up early.'",
    description: "Taste is the critic that shows up early.",
    timestamp: EXTRA_TIMESTAMPS[84],
    cluster: "creativity",
    parentId: "idea-182",
    depth: 2,
    branchLabel: "Taste loops",
    type: "snippet",
    subtopic: "Taste loops",
  },

  // Creativity — branches and twigs for idea-180
  {
    id: "idea-186",
    title: "The obvious-next-step detector",
    description:
      "A tool that flags the statistically obvious continuation of your draft and asks: do you want the obvious, or do you want the interesting? Not as scolding — as a nudge.",
    timestamp: EXTRA_TIMESTAMPS[85],
    cluster: "creativity",
    parentId: "idea-180",
    depth: 1,
    branchLabel: "Refusal craft",
    type: "idea",
    subtopic: "Refusal craft",
  },
  {
    id: "idea-187",
    title: "Constraint ladders",
    description:
      "A ladder of constraints you can climb when stuck: ban adjectives, remove backstory, switch medium, write the argument as a scene. Refusal becomes a repertoire.",
    timestamp: EXTRA_TIMESTAMPS[86],
    cluster: "creativity",
    parentId: "idea-180",
    depth: 1,
    branchLabel: "Refusal craft",
    type: "idea",
    subtopic: "Refusal craft",
  },
  {
    id: "idea-188",
    title: "Refusal as identity",
    description:
      "A creative identity is often a set of refusals: what you won't do, what you won't optimize for, which tricks you won't use. That's how style emerges.",
    timestamp: EXTRA_TIMESTAMPS[87],
    cluster: "creativity",
    parentId: "idea-180",
    depth: 1,
    branchLabel: "Refusal craft",
    type: "thought",
    subtopic: "Refusal craft",
  },
  {
    id: "idea-189",
    title: "Quote on refusal",
    description:
      "“Style is what remains after you refuse the easy solutions.” — Nika Marlowe, writer",
    timestamp: EXTRA_TIMESTAMPS[88],
    cluster: "creativity",
    parentId: "idea-188",
    depth: 2,
    branchLabel: "Refusal craft",
    type: "quote",
    subtopic: "Refusal craft",
  },

  // Creativity — branches and twigs for idea-181
  {
    id: "idea-190",
    title: "Draft provenance",
    description:
      "If WIP becomes tradable, provenance matters: who contributed which draft, what changed, what was remixed. Think Git, but for scenes, melodies, and sketches.",
    timestamp: EXTRA_TIMESTAMPS[89],
    cluster: "creativity",
    parentId: "idea-181",
    depth: 1,
    branchLabel: "WIP economies",
    type: "idea",
    subtopic: "WIP economies",
  },
  {
    id: "idea-191",
    title: "Pricing direction",
    description:
      "In a WIP economy, the thing you pay for is direction: a strong choice that reduces the search space. Polishing is a commodity; direction is scarce.",
    timestamp: EXTRA_TIMESTAMPS[90],
    cluster: "creativity",
    parentId: "idea-181",
    depth: 1,
    branchLabel: "WIP economies",
    type: "thought",
    subtopic: "WIP economies",
  },
  {
    id: "idea-192",
    title: "Marketplaces for endings",
    description:
      "A weird niche: marketplaces for endings. Many creators can start; fewer can land. Paying for endings might create a new kind of craft specialization.",
    timestamp: EXTRA_TIMESTAMPS[91],
    cluster: "creativity",
    parentId: "idea-181",
    depth: 1,
    branchLabel: "WIP economies",
    type: "idea",
    subtopic: "WIP economies",
  },
  {
    id: "idea-193",
    title: "Snippet: 'Direction is anti-entropy.'",
    description: "Direction is anti-entropy.",
    timestamp: EXTRA_TIMESTAMPS[92],
    cluster: "creativity",
    parentId: "idea-191",
    depth: 2,
    branchLabel: "WIP economies",
    type: "snippet",
    subtopic: "WIP economies",
  },

  // Extra twigs to bring total to 100 (distributed across trunks)
  {
    id: "idea-194",
    title: "Quote on scoped recall",
    description:
      "“The future of memory is not more recall — it's better boundaries.” — Aisha Petrova, product philosopher",
    timestamp: EXTRA_TIMESTAMPS[93],
    cluster: "ai",
    parentId: "idea-105",
    depth: 2,
    branchLabel: "Consentful memory",
    type: "quote",
    subtopic: "Consentful memory",
  },
  {
    id: "idea-195",
    title: "Snippet: 'Most roadmaps are arguments with missing transcripts.'",
    description: "Most roadmaps are arguments with missing transcripts.",
    timestamp: EXTRA_TIMESTAMPS[94],
    cluster: "startups",
    parentId: "idea-121",
    depth: 2,
    branchLabel: "Customer truth",
    type: "snippet",
    subtopic: "Customer truth",
  },
  {
    id: "idea-196",
    title: "Snippet: 'Citation is kindness to your future self.'",
    description: "Citation is kindness to your future self.",
    timestamp: EXTRA_TIMESTAMPS[95],
    cluster: "journalism",
    parentId: "idea-137",
    depth: 2,
    branchLabel: "Evidence graphs",
    type: "snippet",
    subtopic: "Evidence graphs",
  },
  {
    id: "idea-197",
    title: "Quote on narrative entropy",
    description:
      "“Every time you retell a reason, you round it. Eventually you believe the rounded version.” — Soren Malik, psychologist",
    timestamp: EXTRA_TIMESTAMPS[96],
    cluster: "philosophy",
    parentId: "idea-157",
    depth: 2,
    branchLabel: "Narrative entropy",
    type: "quote",
    subtopic: "Narrative entropy",
  },
  {
    id: "idea-198",
    title: "Snippet: 'Recovery policies are the real autonomy.'",
    description: "Recovery policies are the real autonomy.",
    timestamp: EXTRA_TIMESTAMPS[97],
    cluster: "robotics",
    parentId: "idea-172",
    depth: 2,
    branchLabel: "Near-miss learning",
    type: "snippet",
    subtopic: "Near-miss learning",
  },
  {
    id: "idea-199",
    title: "Quote on taste",
    description:
      "“Taste is just the ability to notice the difference between two almost-right things.” — Elise Granger, designer",
    timestamp: EXTRA_TIMESTAMPS[98],
    cluster: "creativity",
    parentId: "idea-183",
    depth: 2,
    branchLabel: "Taste loops",
    type: "quote",
    subtopic: "Taste loops",
  },
  {
    id: "idea-200",
    title: "Snippet: 'Refusal is a constraint you can be proud of.'",
    description: "Refusal is a constraint you can be proud of.",
    timestamp: EXTRA_TIMESTAMPS[99],
    cluster: "creativity",
    parentId: "idea-187",
    depth: 2,
    branchLabel: "Refusal craft",
    type: "snippet",
    subtopic: "Refusal craft",
  },
];

const EXTRA_TIMESTAMPS_2 = makeExtraTimestamps(NOW);

const EXTRA_ZETTEL_IDEAS_2: Idea[] = [
  // AI — new trunks (distinct branch labels)
  {
    id: "idea-201",
    title: "Contextual safety rails",
    description:
      "Most safety work treats inputs in isolation. A better approach treats a session as a narrative: what has been said, what was refused, and which intents are escalating. Safety becomes a story-level property.",
    timestamp: EXTRA_TIMESTAMPS_2[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Narrative safety",
    type: "idea",
    subtopic: "Narrative safety",
  },
  {
    id: "idea-202",
    title: "Model-debugging observatories",
    description:
      "Shared observatories where teams publish anonymized traces of weird model behavior so others can recognize, categorize, and test for the same failure modes.",
    timestamp: EXTRA_TIMESTAMPS_2[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Behavior observability",
    type: "idea",
    subtopic: "Behavior observability",
  },

  // AI — branches and twigs
  {
    id: "idea-203",
    title: "Session-level guardrails",
    description:
      "Instead of filtering individual prompts, define session-level policies: if a conversation crosses certain thresholds of risk, switch models, slow down, or require a human checkpoint.",
    timestamp: EXTRA_TIMESTAMPS_2[2],
    cluster: "ai",
    parentId: "idea-201",
    depth: 1,
    branchLabel: "Narrative safety",
    type: "idea",
    subtopic: "Narrative safety",
  },
  {
    id: "idea-204",
    title: "Trajectory-aware classifiers",
    description:
      "Classifiers that watch trajectories of messages, not just single turns. Many harms emerge from gradual escalation that no single utterance would flag.",
    timestamp: EXTRA_TIMESTAMPS_2[3],
    cluster: "ai",
    parentId: "idea-201",
    depth: 1,
    branchLabel: "Narrative safety",
    type: "thought",
    subtopic: "Narrative safety",
  },
  {
    id: "idea-205",
    title: "Safety playbooks as code",
    description:
      "Codify safety playbooks (what a careful human would do) as structured flows that agents can follow, override, or defer to, rather than a monolithic 'safety layer.'",
    timestamp: EXTRA_TIMESTAMPS_2[4],
    cluster: "ai",
    parentId: "idea-201",
    depth: 1,
    branchLabel: "Narrative safety",
    type: "idea",
    subtopic: "Narrative safety",
  },
  {
    id: "idea-206",
    title: "Snippet: 'Safety is tempo and trajectory, not just filters.'",
    description: "Safety is tempo and trajectory, not just filters.",
    timestamp: EXTRA_TIMESTAMPS_2[5],
    cluster: "ai",
    parentId: "idea-204",
    depth: 2,
    branchLabel: "Narrative safety",
    type: "snippet",
    subtopic: "Narrative safety",
  },
  {
    id: "idea-207",
    title: "Failure taxonomy exchanges",
    description:
      "Teams can exchange taxonomies of failures — prompt leaks, goal drift, subtle bias — with example traces so model-debugging observatories stay grounded in real incidents.",
    timestamp: EXTRA_TIMESTAMPS_2[6],
    cluster: "ai",
    parentId: "idea-202",
    depth: 1,
    branchLabel: "Behavior observability",
    type: "idea",
    subtopic: "Behavior observability",
  },
  {
    id: "idea-208",
    title: "Observability sandboxes",
    description:
      "Safe sandboxes where operators can deliberately try to break models while observability tools record metrics, gradients, and internal activations for later analysis.",
    timestamp: EXTRA_TIMESTAMPS_2[7],
    cluster: "ai",
    parentId: "idea-202",
    depth: 1,
    branchLabel: "Behavior observability",
    type: "idea",
    subtopic: "Behavior observability",
  },
  {
    id: "idea-209",
    title: "Quote on shared weirdness",
    description:
      "“You don't understand a model until you can name its weirdness in public.” — Rafi Qureshi, ML engineer",
    timestamp: EXTRA_TIMESTAMPS_2[8],
    cluster: "ai",
    parentId: "idea-207",
    depth: 2,
    branchLabel: "Behavior observability",
    type: "quote",
    subtopic: "Behavior observability",
  },

  // Startups — new trunks
  {
    id: "idea-210",
    title: "Narrative risk registers",
    description:
      "Alongside a risk register for infra, keep a narrative risk register: stories the market might tell about you if a launch misfires or a feature backfires.",
    timestamp: EXTRA_TIMESTAMPS_2[9],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Narrative risk",
    type: "idea",
    subtopic: "Narrative risk",
  },
  {
    id: "idea-211",
    title: "Founder bandwidth accounting",
    description:
      "Track founder bandwidth like a budget: how many high-context conversations, how many deep work blocks, how many emotional escalations per week. Strategy has to fit that budget.",
    timestamp: EXTRA_TIMESTAMPS_2[10],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Bandwidth economics",
    type: "thought",
    subtopic: "Bandwidth economics",
  },

  // Startups — branches and twigs
  {
    id: "idea-212",
    title: "Pre-mortems for reputation",
    description:
      "Run pre-mortems not just on product but on reputation: 'Two years from now, how could we be the villain in our own story?' Then design around those paths.",
    timestamp: EXTRA_TIMESTAMPS_2[11],
    cluster: "startups",
    parentId: "idea-210",
    depth: 1,
    branchLabel: "Narrative risk",
    type: "idea",
    subtopic: "Narrative risk",
  },
  {
    id: "idea-213",
    title: "Crisis narrative templates",
    description:
      "Have templates ready for the day something breaks: who speaks, what facts are non-negotiable to share, and what restitution looks like. You can't improvise honesty when scared.",
    timestamp: EXTRA_TIMESTAMPS_2[12],
    cluster: "startups",
    parentId: "idea-210",
    depth: 1,
    branchLabel: "Narrative risk",
    type: "thought",
    subtopic: "Narrative risk",
  },
  {
    id: "idea-214",
    title: "Snippet: 'Markets remember stories, not incidents.'",
    description: "Markets remember stories, not incidents.",
    timestamp: EXTRA_TIMESTAMPS_2[13],
    cluster: "startups",
    parentId: "idea-212",
    depth: 2,
    branchLabel: "Narrative risk",
    type: "snippet",
    subtopic: "Narrative risk",
  },
  {
    id: "idea-215",
    title: "Founder context switches as cost",
    description:
      "Every context switch from 'fundraising' to 'hiring' to 'incident response' has a cost. Visualizing that switching overhead can make the true price of new projects obvious.",
    timestamp: EXTRA_TIMESTAMPS_2[14],
    cluster: "startups",
    parentId: "idea-211",
    depth: 1,
    branchLabel: "Bandwidth economics",
    type: "idea",
    subtopic: "Bandwidth economics",
  },
  {
    id: "idea-216",
    title: "Energy-aware roadmaps",
    description:
      "Roadmaps that factor in founder and team energy cycles: avoid shipping hardest projects in collective low season; batch easy wins to refill morale.",
    timestamp: EXTRA_TIMESTAMPS_2[15],
    cluster: "startups",
    parentId: "idea-211",
    depth: 1,
    branchLabel: "Bandwidth economics",
    type: "thought",
    subtopic: "Bandwidth economics",
  },
  {
    id: "idea-217",
    title: "Quote on bandwidth",
    description:
      "“Your real burn rate is attention, not dollars.” — Lina Campos, repeat founder",
    timestamp: EXTRA_TIMESTAMPS_2[16],
    cluster: "startups",
    parentId: "idea-215",
    depth: 2,
    branchLabel: "Bandwidth economics",
    type: "quote",
    subtopic: "Bandwidth economics",
  },

  // Journalism — new trunks
  {
    id: "idea-218",
    title: "Source-care protocols",
    description:
      "Protocols that treat sources as long-term relationships, not one-off transactions: expectation setting, follow-up, and shared review of how their story is framed.",
    timestamp: EXTRA_TIMESTAMPS_2[17],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Source care",
    type: "idea",
    subtopic: "Source care",
  },
  {
    id: "idea-219",
    title: "Latency-aware newsrooms",
    description:
      "Newsrooms that track latency from event to verified story, and deliberately maintain multiple paces: fast takes, considered updates, slow syntheses.",
    timestamp: EXTRA_TIMESTAMPS_2[18],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Temporal beats",
    type: "thought",
    subtopic: "Temporal beats",
  },

  // Journalism — branches and twigs
  {
    id: "idea-220",
    title: "Source aftercare check-ins",
    description:
      "Schedule check-ins with vulnerable sources after publication: how did their life change, what did you miss, what would they do differently? This feedback should shape future stories.",
    timestamp: EXTRA_TIMESTAMPS_2[19],
    cluster: "journalism",
    parentId: "idea-218",
    depth: 1,
    branchLabel: "Source care",
    type: "idea",
    subtopic: "Source care",
  },
  {
    id: "idea-221",
    title: "Consent windows",
    description:
      "Define 'consent windows' where sources can retract quotes before a final deadline, with transparent policies. Trust increases when people know where the edges are.",
    timestamp: EXTRA_TIMESTAMPS_2[20],
    cluster: "journalism",
    parentId: "idea-218",
    depth: 1,
    branchLabel: "Source care",
    type: "thought",
    subtopic: "Source care",
  },
  {
    id: "idea-222",
    title: "Quote on source care",
    description:
      "“A source is not a story; they’re a neighbor you have to live with after it runs.” — Jonah Li, reporter",
    timestamp: EXTRA_TIMESTAMPS_2[21],
    cluster: "journalism",
    parentId: "idea-220",
    depth: 2,
    branchLabel: "Source care",
    type: "quote",
    subtopic: "Source care",
  },
  {
    id: "idea-223",
    title: "Multi-speed publishing lanes",
    description:
      "Create explicit lanes: live updates (high speed, low certainty), daily wraps (medium speed, medium certainty), deep dives (slow, high certainty). Label them clearly to readers.",
    timestamp: EXTRA_TIMESTAMPS_2[22],
    cluster: "journalism",
    parentId: "idea-219",
    depth: 1,
    branchLabel: "Temporal beats",
    type: "idea",
    subtopic: "Temporal beats",
  },
  {
    id: "idea-224",
    title: "Latency dashboards",
    description:
      "Dashboards that show average verification time per beat, per reporter, per story type, so teams can intentionally adjust speed instead of reacting to vibes.",
    timestamp: EXTRA_TIMESTAMPS_2[23],
    cluster: "journalism",
    parentId: "idea-219",
    depth: 1,
    branchLabel: "Temporal beats",
    type: "thought",
    subtopic: "Temporal beats",
  },
  {
    id: "idea-225",
    title: "Snippet: 'Every newsroom should have a slow lane.'",
    description: "Every newsroom should have a slow lane.",
    timestamp: EXTRA_TIMESTAMPS_2[24],
    cluster: "journalism",
    parentId: "idea-223",
    depth: 2,
    branchLabel: "Temporal beats",
    type: "snippet",
    subtopic: "Temporal beats",
  },

  // Philosophy — new trunks
  {
    id: "idea-226",
    title: "Everyday alignment",
    description:
      "We talk about AI alignment at civilization scale, but most alignment failures are mundane: your tools nudge you toward shallow work while you claim to value depth.",
    timestamp: EXTRA_TIMESTAMPS_2[25],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Daily alignment",
    type: "thought",
    subtopic: "Daily alignment",
  },
  {
    id: "idea-227",
    title: "Instrumental honesty",
    description:
      "Not all honesty is terminal. Sometimes we tell the truth because it works better over time: fewer coverups, less cognitive load, stronger coalitions.",
    timestamp: EXTRA_TIMESTAMPS_2[26],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Strategic honesty",
    type: "idea",
    subtopic: "Strategic honesty",
  },

  // Philosophy — branches and twigs
  {
    id: "idea-228",
    title: "Micro-alignment checks",
    description:
      "Small, daily prompts that ask: did your calendar, reading, and conversations today match what you say you care about?",
    timestamp: EXTRA_TIMESTAMPS_2[27],
    cluster: "philosophy",
    parentId: "idea-226",
    depth: 1,
    branchLabel: "Daily alignment",
    type: "idea",
    subtopic: "Daily alignment",
  },
  {
    id: "idea-229",
    title: "Environment as a policy surface",
    description:
      "Instead of self-control, change your policy surface: the apps on your home screen, the friction to open certain sites, the defaults on your tools.",
    timestamp: EXTRA_TIMESTAMPS_2[28],
    cluster: "philosophy",
    parentId: "idea-226",
    depth: 1,
    branchLabel: "Daily alignment",
    type: "thought",
    subtopic: "Daily alignment",
  },
  {
    id: "idea-230",
    title: "Snippet: 'You can't align with values you never schedule.'",
    description: "You can't align with values you never schedule.",
    timestamp: EXTRA_TIMESTAMPS_2[29],
    cluster: "philosophy",
    parentId: "idea-228",
    depth: 2,
    branchLabel: "Daily alignment",
    type: "snippet",
    subtopic: "Daily alignment",
  },
  {
    id: "idea-231",
    title: "Truth as a long-term strategy",
    description:
      "Instrumental honesty is a bet: in complex systems, keeping track of lies is more expensive than absorbing short-term pain.",
    timestamp: EXTRA_TIMESTAMPS_2[30],
    cluster: "philosophy",
    parentId: "idea-227",
    depth: 1,
    branchLabel: "Strategic honesty",
    type: "idea",
    subtopic: "Strategic honesty",
  },
  {
    id: "idea-232",
    title: "Coalition-compatible truths",
    description:
      "Some truths are easier for a group to metabolize than others. Strategic honesty chooses which truths to surface when, without erasing them.",
    timestamp: EXTRA_TIMESTAMPS_2[31],
    cluster: "philosophy",
    parentId: "idea-227",
    depth: 1,
    branchLabel: "Strategic honesty",
    type: "thought",
    subtopic: "Strategic honesty",
  },
  {
    id: "idea-233",
    title: "Quote on strategic honesty",
    description:
      "“Honesty is not a personality trait; it's a strategy for staying out of complexity debt.” — Rosa Feld, organizational coach",
    timestamp: EXTRA_TIMESTAMPS_2[32],
    cluster: "philosophy",
    parentId: "idea-231",
    depth: 2,
    branchLabel: "Strategic honesty",
    type: "quote",
    subtopic: "Strategic honesty",
  },

  // Robotics — new trunks
  {
    id: "idea-234",
    title: "Human-legible motion",
    description:
      "Robots should move in ways that humans can predict: slightly exaggerated intent, consistent signaling, and pauses before ambiguous moves.",
    timestamp: EXTRA_TIMESTAMPS_2[33],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Legible motion",
    type: "idea",
    subtopic: "Legible motion",
  },
  {
    id: "idea-235",
    title: "Tool-centric robots",
    description:
      "Instead of general humanoids, design robots around the tools they wield: mops, drills, scanners. The tool becomes the anchor for perception and control.",
    timestamp: EXTRA_TIMESTAMPS_2[34],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Tool bodies",
    type: "thought",
    subtopic: "Tool bodies",
  },

  // Robotics — branches and twigs
  {
    id: "idea-236",
    title: "Gesture vocabulary for robots",
    description:
      "A shared vocabulary of gestures (small bow, hand tilt, light blinks) that communicate state: yielding, stuck, low-confidence.",
    timestamp: EXTRA_TIMESTAMPS_2[35],
    cluster: "robotics",
    parentId: "idea-234",
    depth: 1,
    branchLabel: "Legible motion",
    type: "idea",
    subtopic: "Legible motion",
  },
  {
    id: "idea-237",
    title: "Pause-before-crossing policies",
    description:
      "Policies that force a micro-pause before crossing paths with humans, trading a bit of speed for a lot of perceived safety.",
    timestamp: EXTRA_TIMESTAMPS_2[36],
    cluster: "robotics",
    parentId: "idea-234",
    depth: 1,
    branchLabel: "Legible motion",
    type: "thought",
    subtopic: "Legible motion",
  },
  {
    id: "idea-238",
    title: "Snippet: 'A safe robot looks safe before it is.'",
    description: "A safe robot looks safe before it is.",
    timestamp: EXTRA_TIMESTAMPS_2[37],
    cluster: "robotics",
    parentId: "idea-236",
    depth: 2,
    branchLabel: "Legible motion",
    type: "snippet",
    subtopic: "Legible motion",
  },
  {
    id: "idea-239",
    title: "Tool-anchored perception",
    description:
      "If a robot knows the shape, affordances, and failure modes of its tool, it can plan more robustly around what the tool can and cannot do.",
    timestamp: EXTRA_TIMESTAMPS_2[38],
    cluster: "robotics",
    parentId: "idea-235",
    depth: 1,
    branchLabel: "Tool bodies",
    type: "idea",
    subtopic: "Tool bodies",
  },
  {
    id: "idea-240",
    title: "Maintenance-aware toolkits",
    description:
      "Design tools that expose their own wear sensors and calibration hooks so robots can check them autonomously.",
    timestamp: EXTRA_TIMESTAMPS_2[39],
    cluster: "robotics",
    parentId: "idea-235",
    depth: 1,
    branchLabel: "Tool bodies",
    type: "thought",
    subtopic: "Tool bodies",
  },
  {
    id: "idea-241",
    title: "Quote on tool bodies",
    description:
      "“Most robots shouldn't look like us; they should look like the work.” — Javier Miro, hardware designer",
    timestamp: EXTRA_TIMESTAMPS_2[40],
    cluster: "robotics",
    parentId: "idea-239",
    depth: 2,
    branchLabel: "Tool bodies",
    type: "quote",
    subtopic: "Tool bodies",
  },

  // Creativity — new trunks
  {
    id: "idea-242",
    title: "Constraint diaries",
    description:
      "A diary not of what you did, but of which constraints you tried: time boxes, stylistic bans, weird pairings — and how they felt.",
    timestamp: EXTRA_TIMESTAMPS_2[41],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Constraint diaries",
    type: "idea",
    subtopic: "Constraint diaries",
  },
  {
    id: "idea-243",
    title: "Audience rehearsal",
    description:
      "Before publishing, rehearse with a small, honest audience: not for polish, but to see which parts of the work actually land and which are self-indulgent.",
    timestamp: EXTRA_TIMESTAMPS_2[42],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Audience rehearsal",
    type: "thought",
    subtopic: "Audience rehearsal",
  },

  // Creativity — branches and twigs
  {
    id: "idea-244",
    title: "Constraint retrospectives",
    description:
      "After a project, review which constraints produced the best surprises. Keep a running list so future you doesn't forget what worked.",
    timestamp: EXTRA_TIMESTAMPS_2[43],
    cluster: "creativity",
    parentId: "idea-242",
    depth: 1,
    branchLabel: "Constraint diaries",
    type: "idea",
    subtopic: "Constraint diaries",
  },
  {
    id: "idea-245",
    title: "Constraint trading circles",
    description:
      "Small groups of creatives who trade constraints for each other's work, forcing each other into unfamiliar territory.",
    timestamp: EXTRA_TIMESTAMPS_2[44],
    cluster: "creativity",
    parentId: "idea-242",
    depth: 1,
    branchLabel: "Constraint diaries",
    type: "thought",
    subtopic: "Constraint diaries",
  },
  {
    id: "idea-246",
    title: "Snippet: 'Constraints are the oxygen mask for stuck ideas.'",
    description: "Constraints are the oxygen mask for stuck ideas.",
    timestamp: EXTRA_TIMESTAMPS_2[45],
    cluster: "creativity",
    parentId: "idea-244",
    depth: 2,
    branchLabel: "Constraint diaries",
    type: "snippet",
    subtopic: "Constraint diaries",
  },
  {
    id: "idea-247",
    title: "Honest audience panels",
    description:
      "Small panels of people who agree to be brutally honest about early drafts, with structured prompts for what confused, bored, or surprised them.",
    timestamp: EXTRA_TIMESTAMPS_2[46],
    cluster: "creativity",
    parentId: "idea-243",
    depth: 1,
    branchLabel: "Audience rehearsal",
    type: "idea",
    subtopic: "Audience rehearsal",
  },
  {
    id: "idea-248",
    title: "Audience empathy drills",
    description:
      "Exercises where you rewrite a piece from the perspective of different audience members: skeptic, fan, bored scroller.",
    timestamp: EXTRA_TIMESTAMPS_2[47],
    cluster: "creativity",
    parentId: "idea-243",
    depth: 1,
    branchLabel: "Audience rehearsal",
    type: "thought",
    subtopic: "Audience rehearsal",
  },
  {
    id: "idea-249",
    title: "Quote on rehearsal",
    description:
      "“Rehearsal is where you find out who your work is actually for.” — Maya Chen, playwright",
    timestamp: EXTRA_TIMESTAMPS_2[48],
    cluster: "creativity",
    parentId: "idea-247",
    depth: 2,
    branchLabel: "Audience rehearsal",
    type: "quote",
    subtopic: "Audience rehearsal",
  },

  // Cross-cutting extra twigs to reach 100
  {
    id: "idea-250",
    title: "Snippet: 'Safety without narrative is just paperwork.'",
    description: "Safety without narrative is just paperwork.",
    timestamp: EXTRA_TIMESTAMPS_2[49],
    cluster: "ai",
    parentId: "idea-203",
    depth: 2,
    branchLabel: "Narrative safety",
    type: "snippet",
    subtopic: "Narrative safety",
  },
  {
    id: "idea-251",
    title: "Quote on observability",
    description:
      "“We only fix the bugs we can see; observability is a moral choice.” — Idris Vega, infra lead",
    timestamp: EXTRA_TIMESTAMPS_2[50],
    cluster: "ai",
    parentId: "idea-208",
    depth: 2,
    branchLabel: "Behavior observability",
    type: "quote",
    subtopic: "Behavior observability",
  },
  {
    id: "idea-252",
    title: "Snippet: 'Bandwidth is the scarcest seed round resource.'",
    description: "Bandwidth is the scarcest seed round resource.",
    timestamp: EXTRA_TIMESTAMPS_2[51],
    cluster: "startups",
    parentId: "idea-216",
    depth: 2,
    branchLabel: "Bandwidth economics",
    type: "snippet",
    subtopic: "Bandwidth economics",
  },
  {
    id: "idea-253",
    title: "Quote on narrative risk",
    description:
      "“You don't get to choose whether there's a story about you, only whether you participate in writing it.” — Alek Shah, comms lead",
    timestamp: EXTRA_TIMESTAMPS_2[52],
    cluster: "startups",
    parentId: "idea-213",
    depth: 2,
    branchLabel: "Narrative risk",
    type: "quote",
    subtopic: "Narrative risk",
  },
  {
    id: "idea-254",
    title: "Snippet: 'Verification time is an editorial choice.'",
    description: "Verification time is an editorial choice.",
    timestamp: EXTRA_TIMESTAMPS_2[53],
    cluster: "journalism",
    parentId: "idea-224",
    depth: 2,
    branchLabel: "Temporal beats",
    type: "snippet",
    subtopic: "Temporal beats",
  },
  {
    id: "idea-255",
    title: "Quote on sources",
    description:
      "“You can't cover a place well if the people you quote won't pick up your calls next year.” — Dana Ortiz, local editor",
    timestamp: EXTRA_TIMESTAMPS_2[54],
    cluster: "journalism",
    parentId: "idea-221",
    depth: 2,
    branchLabel: "Source care",
    type: "quote",
    subtopic: "Source care",
  },
  {
    id: "idea-256",
    title: "Snippet: 'Misaligned calendars create misaligned lives.'",
    description: "Misaligned calendars create misaligned lives.",
    timestamp: EXTRA_TIMESTAMPS_2[55],
    cluster: "philosophy",
    parentId: "idea-229",
    depth: 2,
    branchLabel: "Daily alignment",
    type: "snippet",
    subtopic: "Daily alignment",
  },
  {
    id: "idea-257",
    title: "Quote on honesty debt",
    description:
      "“Lie once, and you owe the world a story. Lie twice, and you owe yourself one.” — Omar K., therapist",
    timestamp: EXTRA_TIMESTAMPS_2[56],
    cluster: "philosophy",
    parentId: "idea-232",
    depth: 2,
    branchLabel: "Strategic honesty",
    type: "quote",
    subtopic: "Strategic honesty",
  },
  {
    id: "idea-258",
    title: "Snippet: 'If a robot surprises you, that's a bug in the interface.'",
    description: "If a robot surprises you, that's a bug in the interface.",
    timestamp: EXTRA_TIMESTAMPS_2[57],
    cluster: "robotics",
    parentId: "idea-237",
    depth: 2,
    branchLabel: "Legible motion",
    type: "snippet",
    subtopic: "Legible motion",
  },
  {
    id: "idea-259",
    title: "Quote on constraints",
    description:
      "“Most people's problem isn't a lack of ideas; it's an allergy to the constraints that would make those ideas specific.” — Halima Reed, director",
    timestamp: EXTRA_TIMESTAMPS_2[58],
    cluster: "creativity",
    parentId: "idea-245",
    depth: 2,
    branchLabel: "Constraint diaries",
    type: "quote",
    subtopic: "Constraint diaries",
  },
  {
    id: "idea-260",
    title: "Snippet: 'An audience is a mirror, not a jury.'",
    description: "An audience is a mirror, not a jury.",
    timestamp: EXTRA_TIMESTAMPS_2[59],
    cluster: "creativity",
    parentId: "idea-248",
    depth: 2,
    branchLabel: "Audience rehearsal",
    type: "snippet",
    subtopic: "Audience rehearsal",
  },
];

const EXTRA_TIMESTAMPS_3 = makeExtraTimestamps(NOW);

const EXTRA_ZETTEL_IDEAS_3: Idea[] = [
  // AI — new trunks
  {
    id: "idea-301",
    title: "Personal schema editors",
    description:
      "Instead of only storing raw memories, a system lets you explicitly edit your own schemas — the categories and stories you use to interpret events.",
    timestamp: EXTRA_TIMESTAMPS_3[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Schema editing",
    type: "idea",
    subtopic: "Schema editing",
  },
  {
    id: "idea-302",
    title: "Ambient model tutors",
    description:
      "Tiny agents that lightly annotate your workflows with 'here is what the model is doing and why' until model literacy becomes a background skill.",
    timestamp: EXTRA_TIMESTAMPS_3[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Ambient tutoring",
    type: "thought",
    subtopic: "Ambient tutoring",
  },

  // AI — branches and twigs
  {
    id: "idea-303",
    title: "Editable concept graphs",
    description:
      "Let users see and edit the concept graph an assistant infers about them: 'you think I care about X; actually it's Y.' Alignment as co-authored ontology.",
    timestamp: EXTRA_TIMESTAMPS_3[2],
    cluster: "ai",
    parentId: "idea-301",
    depth: 1,
    branchLabel: "Schema editing",
    type: "idea",
    subtopic: "Schema editing",
  },
  {
    id: "idea-304",
    title: "Schema drift alerts",
    description:
      "When your stated goals and inferred schemas diverge, the system flags it: your calendar shows one life, your reading shows another.",
    timestamp: EXTRA_TIMESTAMPS_3[3],
    cluster: "ai",
    parentId: "idea-301",
    depth: 1,
    branchLabel: "Schema editing",
    type: "thought",
    subtopic: "Schema editing",
  },
  {
    id: "idea-305",
    title: "Snippet: 'Ontologies are editable mirrors.'",
    description: "Ontologies are editable mirrors.",
    timestamp: EXTRA_TIMESTAMPS_3[4],
    cluster: "ai",
    parentId: "idea-303",
    depth: 2,
    branchLabel: "Schema editing",
    type: "snippet",
    subtopic: "Schema editing",
  },
  {
    id: "idea-306",
    title: "Inline failure coaching",
    description:
      "When a model makes a classic mistake, a tutor agent explains it in plain language: which heuristic misfired, what better prompts look like.",
    timestamp: EXTRA_TIMESTAMPS_3[5],
    cluster: "ai",
    parentId: "idea-302",
    depth: 1,
    branchLabel: "Ambient tutoring",
    type: "idea",
    subtopic: "Ambient tutoring",
  },
  {
    id: "idea-307",
    title: "Model sensemaking logs",
    description:
      "Keep a personal log of 'things the model is weird about' so literacy accumulates instead of resetting every chat.",
    timestamp: EXTRA_TIMESTAMPS_3[6],
    cluster: "ai",
    parentId: "idea-302",
    depth: 1,
    branchLabel: "Ambient tutoring",
    type: "thought",
    subtopic: "Ambient tutoring",
  },
  {
    id: "idea-308",
    title: "Quote on literacy",
    description:
      "“The new literacy test is how quickly you can notice when a model is bullshitting you.” — Ren K., researcher",
    timestamp: EXTRA_TIMESTAMPS_3[7],
    cluster: "ai",
    parentId: "idea-306",
    depth: 2,
    branchLabel: "Ambient tutoring",
    type: "quote",
    subtopic: "Ambient tutoring",
  },

  // Startups — new trunks
  {
    id: "idea-309",
    title: "Onboarding story arcs",
    description:
      "Great onboarding feels like a story: cold open, first win, complication, boss fight. Most products only ship a checklist.",
    timestamp: EXTRA_TIMESTAMPS_3[8],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Onboarding arcs",
    type: "idea",
    subtopic: "Onboarding arcs",
  },
  {
    id: "idea-310",
    title: "Founder reflection mirrors",
    description:
      "Tools that reflect a founder's past decisions, predictions, and emotional states back to them so they can see their own patterns over time.",
    timestamp: EXTRA_TIMESTAMPS_3[9],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Founder mirrors",
    type: "thought",
    subtopic: "Founder mirrors",
  },

  // Startups — branches and twigs
  {
    id: "idea-311",
    title: "First-week boss fights",
    description:
      "Design an explicit 'boss fight' in the first week: a real task that proves the product can handle a meaningful job, not just a toy example.",
    timestamp: EXTRA_TIMESTAMPS_3[10],
    cluster: "startups",
    parentId: "idea-309",
    depth: 1,
    branchLabel: "Onboarding arcs",
    type: "idea",
    subtopic: "Onboarding arcs",
  },
  {
    id: "idea-312",
    title: "Onboarding cliff detectors",
    description:
      "Analytics that flag when users hit a narrative cliff — the moment when the next meaningful step isn't obvious.",
    timestamp: EXTRA_TIMESTAMPS_3[11],
    cluster: "startups",
    parentId: "idea-309",
    depth: 1,
    branchLabel: "Onboarding arcs",
    type: "thought",
    subtopic: "Onboarding arcs",
  },
  {
    id: "idea-313",
    title: "Snippet: 'Activation is a feeling before it's a metric.'",
    description: "Activation is a feeling before it's a metric.",
    timestamp: EXTRA_TIMESTAMPS_3[12],
    cluster: "startups",
    parentId: "idea-311",
    depth: 2,
    branchLabel: "Onboarding arcs",
    type: "snippet",
    subtopic: "Onboarding arcs",
  },
  {
    id: "idea-314",
    title: "Decision replay rooms",
    description:
      "Spaces where founders can replay old decisions with present knowledge and see which instincts aged well.",
    timestamp: EXTRA_TIMESTAMPS_3[13],
    cluster: "startups",
    parentId: "idea-310",
    depth: 1,
    branchLabel: "Founder mirrors",
    type: "idea",
    subtopic: "Founder mirrors",
  },
  {
    id: "idea-315",
    title: "Emotion-tagged retros",
    description:
      "Tag retro items with emotional states (fear, excitement, shame) so patterns of reactivity become visible.",
    timestamp: EXTRA_TIMESTAMPS_3[14],
    cluster: "startups",
    parentId: "idea-310",
    depth: 1,
    branchLabel: "Founder mirrors",
    type: "thought",
    subtopic: "Founder mirrors",
  },
  {
    id: "idea-316",
    title: "Quote on mirrors",
    description:
      "“Founders rarely lack feedback; they lack a place where it sticks long enough to change them.” — Noor A., coach",
    timestamp: EXTRA_TIMESTAMPS_3[15],
    cluster: "startups",
    parentId: "idea-314",
    depth: 2,
    branchLabel: "Founder mirrors",
    type: "quote",
    subtopic: "Founder mirrors",
  },

  // Journalism — new trunks
  {
    id: "idea-317",
    title: "Witness networks",
    description:
      "Distributed networks of trusted witnesses who can collectively verify events in real time with low-tech tools.",
    timestamp: EXTRA_TIMESTAMPS_3[16],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Witness networks",
    type: "idea",
    subtopic: "Witness networks",
  },
  {
    id: "idea-318",
    title: "Archive literacy",
    description:
      "Teaching people how to read archives — not just what happened, but how and why records were created or lost.",
    timestamp: EXTRA_TIMESTAMPS_3[17],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Archive literacy",
    type: "thought",
    subtopic: "Archive literacy",
  },

  // Journalism — branches and twigs
  {
    id: "idea-319",
    title: "Low-tech verification kits",
    description:
      "Kits that help local witnesses timestamp, geotag, and cross-check footage without needing expensive hardware.",
    timestamp: EXTRA_TIMESTAMPS_3[18],
    cluster: "journalism",
    parentId: "idea-317",
    depth: 1,
    branchLabel: "Witness networks",
    type: "idea",
    subtopic: "Witness networks",
  },
  {
    id: "idea-320",
    title: "Reputational rings",
    description:
      "Small circles of witnesses vouch for each other over time, creating layered reputations instead of flat trust scores.",
    timestamp: EXTRA_TIMESTAMPS_3[19],
    cluster: "journalism",
    parentId: "idea-317",
    depth: 1,
    branchLabel: "Witness networks",
    type: "thought",
    subtopic: "Witness networks",
  },
  {
    id: "idea-321",
    title: "Snippet: 'Verification is a chore you can share.'",
    description: "Verification is a chore you can share.",
    timestamp: EXTRA_TIMESTAMPS_3[20],
    cluster: "journalism",
    parentId: "idea-319",
    depth: 2,
    branchLabel: "Witness networks",
    type: "snippet",
    subtopic: "Witness networks",
  },
  {
    id: "idea-322",
    title: "Archive bias maps",
    description:
      "Visual maps of what a city's archives overrepresent (official meetings) and underrepresent (informal power).",
    timestamp: EXTRA_TIMESTAMPS_3[21],
    cluster: "journalism",
    parentId: "idea-318",
    depth: 1,
    branchLabel: "Archive literacy",
    type: "idea",
    subtopic: "Archive literacy",
  },
  {
    id: "idea-323",
    title: "Everyday archive drills",
    description:
      "Teaching high schoolers how to trace one policy back through decades of minutes, memos, and budget lines.",
    timestamp: EXTRA_TIMESTAMPS_3[22],
    cluster: "journalism",
    parentId: "idea-318",
    depth: 1,
    branchLabel: "Archive literacy",
    type: "thought",
    subtopic: "Archive literacy",
  },
  {
    id: "idea-324",
    title: "Quote on archives",
    description:
      "“An archive is just a long argument about what mattered.” — Imani Rhodes, historian",
    timestamp: EXTRA_TIMESTAMPS_3[23],
    cluster: "journalism",
    parentId: "idea-322",
    depth: 2,
    branchLabel: "Archive literacy",
    type: "quote",
    subtopic: "Archive literacy",
  },

  // Philosophy — new trunks
  {
    id: "idea-325",
    title: "Temporal choice architecture",
    description:
      "We design interfaces for choices in space, but most hard decisions are about time: when to commit, when to delay, when to never revisit.",
    timestamp: EXTRA_TIMESTAMPS_3[24],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Temporal choice",
    type: "idea",
    subtopic: "Temporal choice",
  },
  {
    id: "idea-326",
    title: "Everyday agency",
    description:
      "Grand theories of free will are less useful than noticing the tiny places we actually have slack: morning routines, device defaults, the first five minutes of meetings.",
    timestamp: EXTRA_TIMESTAMPS_3[25],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Everyday agency",
    type: "thought",
    subtopic: "Everyday agency",
  },

  // Philosophy — branches and twigs
  {
    id: "idea-327",
    title: "Commitment windows",
    description:
      "Explicit windows during which you can change your mind about a decision without moral penalty, after which it becomes a commitment.",
    timestamp: EXTRA_TIMESTAMPS_3[26],
    cluster: "philosophy",
    parentId: "idea-325",
    depth: 1,
    branchLabel: "Temporal choice",
    type: "idea",
    subtopic: "Temporal choice",
  },
  {
    id: "idea-328",
    title: "Reversible vs. irreversible clocks",
    description:
      "Some choices can be rewound cheaply; others can't. Designing different 'clocks' around them changes how guilty people feel about experimenting.",
    timestamp: EXTRA_TIMESTAMPS_3[27],
    cluster: "philosophy",
    parentId: "idea-325",
    depth: 1,
    branchLabel: "Temporal choice",
    type: "thought",
    subtopic: "Temporal choice",
  },
  {
    id: "idea-329",
    title: "Snippet: 'Regret is a sign you mis-modeled time, not just outcomes.'",
    description: "Regret is a sign you mis-modeled time, not just outcomes.",
    timestamp: EXTRA_TIMESTAMPS_3[28],
    cluster: "philosophy",
    parentId: "idea-327",
    depth: 2,
    branchLabel: "Temporal choice",
    type: "snippet",
    subtopic: "Temporal choice",
  },
  {
    id: "idea-330",
    title: "Slack audits",
    description:
      "Audit where you genuinely have slack: what could you change this week without permission? That's where agency actually lives.",
    timestamp: EXTRA_TIMESTAMPS_3[29],
    cluster: "philosophy",
    parentId: "idea-326",
    depth: 1,
    branchLabel: "Everyday agency",
    type: "idea",
    subtopic: "Everyday agency",
  },
  {
    id: "idea-331",
    title: "Agency micro-habits",
    description:
      "Habits that nudge you to exercise small bits of agency daily: choose the meeting agenda, rewrite one default, say no once.",
    timestamp: EXTRA_TIMESTAMPS_3[30],
    cluster: "philosophy",
    parentId: "idea-326",
    depth: 1,
    branchLabel: "Everyday agency",
    type: "thought",
    subtopic: "Everyday agency",
  },
  {
    id: "idea-332",
    title: "Quote on agency",
    description:
      "“Most of your life is already decided; philosophy is what you do with the pieces that aren’t.” — Farah U., teacher",
    timestamp: EXTRA_TIMESTAMPS_3[31],
    cluster: "philosophy",
    parentId: "idea-330",
    depth: 2,
    branchLabel: "Everyday agency",
    type: "quote",
    subtopic: "Everyday agency",
  },

  // Robotics — new trunks
  {
    id: "idea-333",
    title: "Household choreography",
    description:
      "Robots in homes will succeed or fail based on choreography: how they move around kids, pets, and clutter without constant negotiation.",
    timestamp: EXTRA_TIMESTAMPS_3[32],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Household choreography",
    type: "idea",
    subtopic: "Household choreography",
  },
  {
    id: "idea-334",
    title: "Tactile commons",
    description:
      "A shared tactile dataset of everyday objects — doorknobs, mugs, cables — contributed by many labs so manipulation progress compounds.",
    timestamp: EXTRA_TIMESTAMPS_3[33],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Tactile commons",
    type: "thought",
    subtopic: "Tactile commons",
  },

  // Robotics — branches and twigs
  {
    id: "idea-335",
    title: "Social distance heuristics",
    description:
      "Home robots need heuristics for social distance: how close to stand, how fast to approach, when to back off.",
    timestamp: EXTRA_TIMESTAMPS_3[34],
    cluster: "robotics",
    parentId: "idea-333",
    depth: 1,
    branchLabel: "Household choreography",
    type: "idea",
    subtopic: "Household choreography",
  },
  {
    id: "idea-336",
    title: "Clutter-aware planning",
    description:
      "Planning that assumes mess as the default: socks on the floor, doors half open, chairs moved.",
    timestamp: EXTRA_TIMESTAMPS_3[35],
    cluster: "robotics",
    parentId: "idea-333",
    depth: 1,
    branchLabel: "Household choreography",
    type: "thought",
    subtopic: "Household choreography",
  },
  {
    id: "idea-337",
    title: "Snippet: 'A good home robot feels like a considerate roommate.'",
    description: "A good home robot feels like a considerate roommate.",
    timestamp: EXTRA_TIMESTAMPS_3[36],
    cluster: "robotics",
    parentId: "idea-335",
    depth: 2,
    branchLabel: "Household choreography",
    type: "snippet",
    subtopic: "Household choreography",
  },
  {
    id: "idea-338",
    title: "Everyday-object benchmarks",
    description:
      "Benchmarks based on mundane tasks: untangling cables, stacking dishes, folding towels from real laundry baskets.",
    timestamp: EXTRA_TIMESTAMPS_3[37],
    cluster: "robotics",
    parentId: "idea-334",
    depth: 1,
    branchLabel: "Tactile commons",
    type: "idea",
    subtopic: "Tactile commons",
  },
  {
    id: "idea-339",
    title: "Failure-sharing consortia",
    description:
      "Consortia where labs share failure cases on common objects so robots stop making the same mistakes in parallel.",
    timestamp: EXTRA_TIMESTAMPS_3[38],
    cluster: "robotics",
    parentId: "idea-334",
    depth: 1,
    branchLabel: "Tactile commons",
    type: "thought",
    subtopic: "Tactile commons",
  },
  {
    id: "idea-340",
    title: "Quote on touch data",
    description:
      "“We have endless images of the world and almost no memories of how it feels.” — Keiko Tan, roboticist",
    timestamp: EXTRA_TIMESTAMPS_3[39],
    cluster: "robotics",
    parentId: "idea-338",
    depth: 2,
    branchLabel: "Tactile commons",
    type: "quote",
    subtopic: "Tactile commons",
  },

  // Creativity — new trunks
  {
    id: "idea-341",
    title: "Idea seasons",
    description:
      "Instead of chasing constant output, organize work into seasons: exploration, drafting, editing, rest.",
    timestamp: EXTRA_TIMESTAMPS_3[40],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Idea seasons",
    type: "thought",
    subtopic: "Idea seasons",
  },
  {
    id: "idea-342",
    title: "Revision rituals",
    description:
      "Rituals that make revision feel like a separate creative act, not a lesser form of creation.",
    timestamp: EXTRA_TIMESTAMPS_3[41],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Revision rituals",
    type: "idea",
    subtopic: "Revision rituals",
  },

  // Creativity — branches and twigs
  {
    id: "idea-343",
    title: "Season markers",
    description:
      "Explicitly mark when you switch seasons: a calendar event, a studio rearrange, a change in tools.",
    timestamp: EXTRA_TIMESTAMPS_3[42],
    cluster: "creativity",
    parentId: "idea-341",
    depth: 1,
    branchLabel: "Idea seasons",
    type: "idea",
    subtopic: "Idea seasons",
  },
  {
    id: "idea-344",
    title: "Off-season composting",
    description:
      "Use off-seasons to reread old notes, drafts, and dead projects with a low-pressure mindset.",
    timestamp: EXTRA_TIMESTAMPS_3[43],
    cluster: "creativity",
    parentId: "idea-341",
    depth: 1,
    branchLabel: "Idea seasons",
    type: "thought",
    subtopic: "Idea seasons",
  },
  {
    id: "idea-345",
    title: "Snippet: 'Rest is a season, not a reward.'",
    description: "Rest is a season, not a reward.",
    timestamp: EXTRA_TIMESTAMPS_3[44],
    cluster: "creativity",
    parentId: "idea-344",
    depth: 2,
    branchLabel: "Idea seasons",
    type: "snippet",
    subtopic: "Idea seasons",
  },
  {
    id: "idea-346",
    title: "Versioned drafts",
    description:
      "Treat each major revision as a named version with notes on what changed and why.",
    timestamp: EXTRA_TIMESTAMPS_3[45],
    cluster: "creativity",
    parentId: "idea-342",
    depth: 1,
    branchLabel: "Revision rituals",
    type: "idea",
    subtopic: "Revision rituals",
  },
  {
    id: "idea-347",
    title: "Ritualized cutting",
    description:
      "Have a small ritual for cutting material: a folder, a phrase, a moment of acknowledgment so it feels less like loss.",
    timestamp: EXTRA_TIMESTAMPS_3[46],
    cluster: "creativity",
    parentId: "idea-342",
    depth: 1,
    branchLabel: "Revision rituals",
    type: "thought",
    subtopic: "Revision rituals",
  },
  {
    id: "idea-348",
    title: "Quote on revision",
    description:
      "“Revision is when the work finally tells you what it wanted to be.” — Carlo Vega, editor",
    timestamp: EXTRA_TIMESTAMPS_3[47],
    cluster: "creativity",
    parentId: "idea-346",
    depth: 2,
    branchLabel: "Revision rituals",
    type: "quote",
    subtopic: "Revision rituals",
  },

  // Cross-cutting twigs to reach 100
  {
    id: "idea-349",
    title: "Snippet: 'Your schemas are editable; your past isn't.'",
    description: "Your schemas are editable; your past isn't.",
    timestamp: EXTRA_TIMESTAMPS_3[48],
    cluster: "ai",
    parentId: "idea-304",
    depth: 2,
    branchLabel: "Schema editing",
    type: "snippet",
    subtopic: "Schema editing",
  },
  {
    id: "idea-350",
    title: "Snippet: 'Onboarding is small-scale storytelling.'",
    description: "Onboarding is small-scale storytelling.",
    timestamp: EXTRA_TIMESTAMPS_3[49],
    cluster: "startups",
    parentId: "idea-312",
    depth: 2,
    branchLabel: "Onboarding arcs",
    type: "snippet",
    subtopic: "Onboarding arcs",
  },
  {
    id: "idea-351",
    title: "Quote on founders and mirrors",
    description:
      "“The rarest founder trait is the ability to look at themselves without flinching.” — Priyanka S., investor",
    timestamp: EXTRA_TIMESTAMPS_3[50],
    cluster: "startups",
    parentId: "idea-315",
    depth: 2,
    branchLabel: "Founder mirrors",
    type: "quote",
    subtopic: "Founder mirrors",
  },
  {
    id: "idea-352",
    title: "Snippet: 'A witness network is a trust lattice.'",
    description: "A witness network is a trust lattice.",
    timestamp: EXTRA_TIMESTAMPS_3[51],
    cluster: "journalism",
    parentId: "idea-320",
    depth: 2,
    branchLabel: "Witness networks",
    type: "snippet",
    subtopic: "Witness networks",
  },
  {
    id: "idea-353",
    title: "Snippet: 'Archives are just frozen attention.'",
    description: "Archives are just frozen attention.",
    timestamp: EXTRA_TIMESTAMPS_3[52],
    cluster: "journalism",
    parentId: "idea-323",
    depth: 2,
    branchLabel: "Archive literacy",
    type: "snippet",
    subtopic: "Archive literacy",
  },
  {
    id: "idea-354",
    title: "Quote on time and choice",
    description:
      "“Most regret is not about what you chose, but when you chose it.” — Anya D., philosopher",
    timestamp: EXTRA_TIMESTAMPS_3[53],
    cluster: "philosophy",
    parentId: "idea-328",
    depth: 2,
    branchLabel: "Temporal choice",
    type: "quote",
    subtopic: "Temporal choice",
  },
  {
    id: "idea-355",
    title: "Snippet: 'Agency hides in small levers.'",
    description: "Agency hides in small levers.",
    timestamp: EXTRA_TIMESTAMPS_3[54],
    cluster: "philosophy",
    parentId: "idea-331",
    depth: 2,
    branchLabel: "Everyday agency",
    type: "snippet",
    subtopic: "Everyday agency",
  },
  {
    id: "idea-356",
    title: "Snippet: 'Choreography is how robots apologize in advance.'",
    description: "Choreography is how robots apologize in advance.",
    timestamp: EXTRA_TIMESTAMPS_3[55],
    cluster: "robotics",
    parentId: "idea-336",
    depth: 2,
    branchLabel: "Household choreography",
    type: "snippet",
    subtopic: "Household choreography",
  },
  {
    id: "idea-357",
    title: "Snippet: 'Touch is the missing dataset.'",
    description: "Touch is the missing dataset.",
    timestamp: EXTRA_TIMESTAMPS_3[56],
    cluster: "robotics",
    parentId: "idea-339",
    depth: 2,
    branchLabel: "Tactile commons",
    type: "snippet",
    subtopic: "Tactile commons",
  },
  {
    id: "idea-358",
    title: "Snippet: 'You can't sprint through every season.'",
    description: "You can't sprint through every season.",
    timestamp: EXTRA_TIMESTAMPS_3[57],
    cluster: "creativity",
    parentId: "idea-343",
    depth: 2,
    branchLabel: "Idea seasons",
    type: "snippet",
    subtopic: "Idea seasons",
  },
  {
    id: "idea-359",
    title: "Snippet: 'Revision is how you earn your first draft.'",
    description: "Revision is how you earn your first draft.",
    timestamp: EXTRA_TIMESTAMPS_3[58],
    cluster: "creativity",
    parentId: "idea-347",
    depth: 2,
    branchLabel: "Revision rituals",
    type: "snippet",
    subtopic: "Revision rituals",
  },
  {
    id: "idea-360",
    title: "Quote on seasons",
    description:
      "“If you refuse to have seasons, burnout will schedule one for you.” — Laila Stone, illustrator",
    timestamp: EXTRA_TIMESTAMPS_3[59],
    cluster: "creativity",
    parentId: "idea-341",
    depth: 2,
    branchLabel: "Idea seasons",
    type: "quote",
    subtopic: "Idea seasons",
  },
];

const EXTRA_TIMESTAMPS_4 = makeExtraTimestamps(NOW);

const EXTRA_ZETTEL_IDEAS_4: Idea[] = [
  // AI — new trunks
  {
    id: "idea-401",
    title: "Memory as negotiation",
    description:
      "Future personal AIs will negotiate what to remember with you: trading completeness for emotional safety, relevance, and the stories you want to keep telling.",
    timestamp: EXTRA_TIMESTAMPS_4[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Negotiated memory",
    type: "thought",
    subtopic: "Negotiated memory",
  },
  {
    id: "idea-402",
    title: "Agency sandboxes for models",
    description:
      "Before giving an agent real power, you drop it into a sandbox that simulates consequences — social, legal, emotional — and watch how it behaves under stress.",
    timestamp: EXTRA_TIMESTAMPS_4[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Agency sandboxes",
    type: "idea",
    subtopic: "Agency sandboxes",
  },

  // AI — branches and twigs
  {
    id: "idea-403",
    title: "Consent-aware forgetting",
    description:
      "A memory system should propose forgetting plans: 'these call logs no longer serve current selves; here’s what we lose and gain by deleting them.'",
    timestamp: EXTRA_TIMESTAMPS_4[2],
    cluster: "ai",
    parentId: "idea-401",
    depth: 1,
    branchLabel: "Negotiated memory",
    type: "idea",
    subtopic: "Negotiated memory",
  },
  {
    id: "idea-404",
    title: "Story-preserving redaction",
    description:
      "You can often redact specific details while preserving narrative structure. Tools should help you remove sharp edges without erasing what makes an experience meaningful.",
    timestamp: EXTRA_TIMESTAMPS_4[3],
    cluster: "ai",
    parentId: "idea-401",
    depth: 1,
    branchLabel: "Negotiated memory",
    type: "thought",
    subtopic: "Negotiated memory",
  },
  {
    id: "idea-405",
    title: "Snippet: 'Forgetting is an act of design.'",
    description: "Forgetting is an act of design.",
    timestamp: EXTRA_TIMESTAMPS_4[4],
    cluster: "ai",
    parentId: "idea-403",
    depth: 2,
    branchLabel: "Negotiated memory",
    type: "snippet",
    subtopic: "Negotiated memory",
  },
  {
    id: "idea-406",
    title: "Simulated consequence drills",
    description:
      "Drop a model into a scenario where a bad suggestion damages trust or reputation. See if it notices and adapts without being explicitly told.",
    timestamp: EXTRA_TIMESTAMPS_4[5],
    cluster: "ai",
    parentId: "idea-402",
    depth: 1,
    branchLabel: "Agency sandboxes",
    type: "idea",
    subtopic: "Agency sandboxes",
  },
  {
    id: "idea-407",
    title: "Shadow-run deployments",
    description:
      "Run agents in 'shadow' mode alongside humans: they make decisions, but only as predictions. You compare their calls with what humans actually did.",
    timestamp: EXTRA_TIMESTAMPS_4[6],
    cluster: "ai",
    parentId: "idea-402",
    depth: 1,
    branchLabel: "Agency sandboxes",
    type: "thought",
    subtopic: "Agency sandboxes",
  },
  {
    id: "idea-408",
    title: "Quote on agency",
    description:
      "“Give a system power in rehearsal before you give it power in life.” — Amrita Rao, safety engineer",
    timestamp: EXTRA_TIMESTAMPS_4[7],
    cluster: "ai",
    parentId: "idea-406",
    depth: 2,
    branchLabel: "Agency sandboxes",
    type: "quote",
    subtopic: "Agency sandboxes",
  },

  // Startups — new trunks
  {
    id: "idea-409",
    title: "Expectation load management",
    description:
      "The hidden risk in startups is expectation load: the gap between what early stories promised and what reality can support without snapping.",
    timestamp: EXTRA_TIMESTAMPS_4[8],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Expectation load",
    type: "thought",
    subtopic: "Expectation load",
  },
  {
    id: "idea-410",
    title: "Shadow organizations",
    description:
      "Most companies run on a visible org chart and an invisible one made of trust, favors, and side channels. The invisible chart is the one that ships things.",
    timestamp: EXTRA_TIMESTAMPS_4[9],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Shadow orgs",
    type: "idea",
    subtopic: "Shadow orgs",
  },

  // Startups — branches and twigs
  {
    id: "idea-411",
    title: "Expectation stress tests",
    description:
      "Before big launches, simulate worst-case expectations: what headlines, tweets, and internal narratives would overload your team if things go marginally well.",
    timestamp: EXTRA_TIMESTAMPS_4[10],
    cluster: "startups",
    parentId: "idea-409",
    depth: 1,
    branchLabel: "Expectation load",
    type: "idea",
    subtopic: "Expectation load",
  },
  {
    id: "idea-412",
    title: "Narrative debt reports",
    description:
      "Track where your external narrative has drifted from reality: promises about pace, quality, or ethics that are now out of sync.",
    timestamp: EXTRA_TIMESTAMPS_4[11],
    cluster: "startups",
    parentId: "idea-409",
    depth: 1,
    branchLabel: "Expectation load",
    type: "thought",
    subtopic: "Expectation load",
  },
  {
    id: "idea-413",
    title: "Snippet: 'Expectation is the heaviest infrastructure.'",
    description: "Expectation is the heaviest infrastructure.",
    timestamp: EXTRA_TIMESTAMPS_4[12],
    cluster: "startups",
    parentId: "idea-411",
    depth: 2,
    branchLabel: "Expectation load",
    type: "snippet",
    subtopic: "Expectation load",
  },
  {
    id: "idea-414",
    title: "Mapping the shadow org",
    description:
      "Have teams draw the 'real' org chart: who actually unblocks work, who everyone goes to for sanity checks, where decisions emerge.",
    timestamp: EXTRA_TIMESTAMPS_4[13],
    cluster: "startups",
    parentId: "idea-410",
    depth: 1,
    branchLabel: "Shadow orgs",
    type: "idea",
    subtopic: "Shadow orgs",
  },
  {
    id: "idea-415",
    title: "Shadow-role design",
    description:
      "Acknowledge and formalize shadow roles (glue people, informal PMs, culture carriers) instead of pretending they don't exist.",
    timestamp: EXTRA_TIMESTAMPS_4[14],
    cluster: "startups",
    parentId: "idea-410",
    depth: 1,
    branchLabel: "Shadow orgs",
    type: "thought",
    subtopic: "Shadow orgs",
  },
  {
    id: "idea-416",
    title: "Quote on shadow orgs",
    description:
      "“The real org chart is who can say no.” — Jonas Webb, COO",
    timestamp: EXTRA_TIMESTAMPS_4[15],
    cluster: "startups",
    parentId: "idea-414",
    depth: 2,
    branchLabel: "Shadow orgs",
    type: "quote",
    subtopic: "Shadow orgs",
  },

  // Journalism — new trunks
  {
    id: "idea-417",
    title: "Lived-experience editors",
    description:
      "Editors whose main qualification is lived experience in the communities being covered, paired with traditional craft editors.",
    timestamp: EXTRA_TIMESTAMPS_4[16],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Lived-experience",
    type: "idea",
    subtopic: "Lived-experience",
  },
  {
    id: "idea-418",
    title: "Counterfactual coverage",
    description:
      "Coverage that explicitly states what would have to be different for the outlet to have told a different story.",
    timestamp: EXTRA_TIMESTAMPS_4[17],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Counterfactual beats",
    type: "thought",
    subtopic: "Counterfactual beats",
  },

  // Journalism — branches and twigs
  {
    id: "idea-419",
    title: "Community veto powers",
    description:
      "In some beats, a panel of community members gets a narrow veto power on framing that is likely to re-traumatize.",
    timestamp: EXTRA_TIMESTAMPS_4[18],
    cluster: "journalism",
    parentId: "idea-417",
    depth: 1,
    branchLabel: "Lived-experience",
    type: "idea",
    subtopic: "Lived-experience",
  },
  {
    id: "idea-420",
    title: "Context guardians",
    description:
      "Roles dedicated to asking, 'What key context would a local know that this draft is missing?' before publication.",
    timestamp: EXTRA_TIMESTAMPS_4[19],
    cluster: "journalism",
    parentId: "idea-417",
    depth: 1,
    branchLabel: "Lived-experience",
    type: "thought",
    subtopic: "Lived-experience",
  },
  {
    id: "idea-421",
    title: "Snippet: 'Editing is power-sharing, not just proofreading.'",
    description: "Editing is power-sharing, not just proofreading.",
    timestamp: EXTRA_TIMESTAMPS_4[20],
    cluster: "journalism",
    parentId: "idea-419",
    depth: 2,
    branchLabel: "Lived-experience",
    type: "snippet",
    subtopic: "Lived-experience",
  },
  {
    id: "idea-422",
    title: "Counterfactual sidebars",
    description:
      "Stories include sidebars: 'If these two facts had been different, here is how our framing would change.'",
    timestamp: EXTRA_TIMESTAMPS_4[21],
    cluster: "journalism",
    parentId: "idea-418",
    depth: 1,
    branchLabel: "Counterfactual beats",
    type: "idea",
    subtopic: "Counterfactual beats",
  },
  {
    id: "idea-423",
    title: "Alternate-history op-eds",
    description:
      "Occasional pieces that walk through plausible alternate histories given different policy choices, to make structural forces more legible.",
    timestamp: EXTRA_TIMESTAMPS_4[22],
    cluster: "journalism",
    parentId: "idea-418",
    depth: 1,
    branchLabel: "Counterfactual beats",
    type: "thought",
    subtopic: "Counterfactual beats",
  },
  {
    id: "idea-424",
    title: "Quote on counterfactuals",
    description:
      "“Good journalism doesn't just say what happened; it hints at what almost did.” — Lena Ortiz, columnist",
    timestamp: EXTRA_TIMESTAMPS_4[23],
    cluster: "journalism",
    parentId: "idea-422",
    depth: 2,
    branchLabel: "Counterfactual beats",
    type: "quote",
    subtopic: "Counterfactual beats",
  },

  // Philosophy — new trunks
  {
    id: "idea-425",
    title: "Values under latency",
    description:
      "Some values only hold when you have time to think. Under time pressure, people reveal a different ordering of what's actually important.",
    timestamp: EXTRA_TIMESTAMPS_4[24],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Latency values",
    type: "thought",
    subtopic: "Latency values",
  },
  {
    id: "idea-426",
    title: "Ethics of attention capture",
    description:
      "If attention is finite, capturing it might be closer to pollution than to a neutral transaction.",
    timestamp: EXTRA_TIMESTAMPS_4[25],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Attention capture",
    type: "idea",
    subtopic: "Attention capture",
  },

  // Philosophy — branches and twigs
  {
    id: "idea-427",
    title: "Timed moral prompts",
    description:
      "Ask people moral questions under different time budgets: 3 seconds, 30 seconds, 3 minutes. The answer distribution changes.",
    timestamp: EXTRA_TIMESTAMPS_4[26],
    cluster: "philosophy",
    parentId: "idea-425",
    depth: 1,
    branchLabel: "Latency values",
    type: "idea",
    subtopic: "Latency values",
  },
  {
    id: "idea-428",
    title: "Emergency ethics drills",
    description:
      "Emergency response drills that practice not just logistics but ethics: who gets scarce resources when plans fail.",
    timestamp: EXTRA_TIMESTAMPS_4[27],
    cluster: "philosophy",
    parentId: "idea-425",
    depth: 1,
    branchLabel: "Latency values",
    type: "thought",
    subtopic: "Latency values",
  },
  {
    id: "idea-429",
    title: "Snippet: 'Speed rearranges your virtues.'",
    description: "Speed rearranges your virtues.",
    timestamp: EXTRA_TIMESTAMPS_4[28],
    cluster: "philosophy",
    parentId: "idea-427",
    depth: 2,
    branchLabel: "Latency values",
    type: "snippet",
    subtopic: "Latency values",
  },
  {
    id: "idea-430",
    title: "Attention budgets",
    description:
      "Design personal 'attention budgets' where you decide in advance how much of your finite attention any category is allowed to claim.",
    timestamp: EXTRA_TIMESTAMPS_4[29],
    cluster: "philosophy",
    parentId: "idea-426",
    depth: 1,
    branchLabel: "Attention capture",
    type: "idea",
    subtopic: "Attention capture",
  },
  {
    id: "idea-431",
    title: "Consentful notifications",
    description:
      "Systems where you can negotiate how and when you're allowed to be interrupted, with explicit tradeoffs surfaced.",
    timestamp: EXTRA_TIMESTAMPS_4[30],
    cluster: "philosophy",
    parentId: "idea-426",
    depth: 1,
    branchLabel: "Attention capture",
    type: "thought",
    subtopic: "Attention capture",
  },
  {
    id: "idea-432",
    title: "Quote on attention",
    description:
      "“Stealing someone's attention is the polite word for stealing the day they could have had.” — Marta Kiel, ethicist",
    timestamp: EXTRA_TIMESTAMPS_4[31],
    cluster: "philosophy",
    parentId: "idea-430",
    depth: 2,
    branchLabel: "Attention capture",
    type: "quote",
    subtopic: "Attention capture",
  },

  // Robotics — new trunks
  {
    id: "idea-433",
    title: "Task stories for robots",
    description:
      "Robots should represent tasks as stories with beginning, middle, and end — not just goal states — so they can reason about interruptions and recovery.",
    timestamp: EXTRA_TIMESTAMPS_4[32],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Task stories",
    type: "idea",
    subtopic: "Task stories",
  },
  {
    id: "idea-434",
    title: "Neighborhood repair culture",
    description:
      "If robots are everywhere, repair culture has to be local: neighborhood shops, shared parts libraries, and repair rituals.",
    timestamp: EXTRA_TIMESTAMPS_4[33],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Repair culture",
    type: "thought",
    subtopic: "Repair culture",
  },

  // Robotics — branches and twigs
  {
    id: "idea-435",
    title: "Interruption-aware planning",
    description:
      "Plans that assume they'll be interrupted: a robot can gracefully pause, explain what it was doing, and resume without losing context.",
    timestamp: EXTRA_TIMESTAMPS_4[34],
    cluster: "robotics",
    parentId: "idea-433",
    depth: 1,
    branchLabel: "Task stories",
    type: "idea",
    subtopic: "Task stories",
  },
  {
    id: "idea-436",
    title: "Human-readable task logs",
    description:
      "When something goes wrong, a robot can narrate its last few 'chapters': what it thought the task was, which subgoals it hit, where it got confused.",
    timestamp: EXTRA_TIMESTAMPS_4[35],
    cluster: "robotics",
    parentId: "idea-433",
    depth: 1,
    branchLabel: "Task stories",
    type: "thought",
    subtopic: "Task stories",
  },
  {
    id: "idea-437",
    title: "Snippet: 'A good task feels like a short story robots and humans can both read.'",
    description:
      "A good task feels like a short story robots and humans can both read.",
    timestamp: EXTRA_TIMESTAMPS_4[36],
    cluster: "robotics",
    parentId: "idea-435",
    depth: 2,
    branchLabel: "Task stories",
    type: "snippet",
    subtopic: "Task stories",
  },
  {
    id: "idea-438",
    title: "Corner repair kiosks",
    description:
      "Small neighborhood kiosks that can swap common robot parts and run diagnostics, like modern-day bike shops.",
    timestamp: EXTRA_TIMESTAMPS_4[37],
    cluster: "robotics",
    parentId: "idea-434",
    depth: 1,
    branchLabel: "Repair culture",
    type: "idea",
    subtopic: "Repair culture",
  },
  {
    id: "idea-439",
    title: "Community repair festivals",
    description:
      "Annual events where people bring robots and appliances to be repaired, building skills and shared norms about maintenance.",
    timestamp: EXTRA_TIMESTAMPS_4[38],
    cluster: "robotics",
    parentId: "idea-434",
    depth: 1,
    branchLabel: "Repair culture",
    type: "thought",
    subtopic: "Repair culture",
  },
  {
    id: "idea-440",
    title: "Quote on repair",
    description:
      "“A future is humane when repair is closer than replacement.” — Najma F., engineer",
    timestamp: EXTRA_TIMESTAMPS_4[39],
    cluster: "robotics",
    parentId: "idea-438",
    depth: 2,
    branchLabel: "Repair culture",
    type: "quote",
    subtopic: "Repair culture",
  },

  // Creativity — new trunks
  {
    id: "idea-441",
    title: "Idea hospice",
    description:
      "A deliberate place where old projects go to end well: documented, reflected on, and mined for parts without guilt.",
    timestamp: EXTRA_TIMESTAMPS_4[40],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Idea hospice",
    type: "thought",
    subtopic: "Idea hospice",
  },
  {
    id: "idea-442",
    title: "Audience drift tracking",
    description:
      "Creators rarely notice when their audience changes around them. Tools could track who is actually showing up now vs. who you think you're talking to.",
    timestamp: EXTRA_TIMESTAMPS_4[41],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Audience drift",
    type: "idea",
    subtopic: "Audience drift",
  },

  // Creativity — branches and twigs
  {
    id: "idea-443",
    title: "Goodbye drafts",
    description:
      "Write a short goodbye to every project you archive: what you learned, what you'll salvage, what you’re letting go.",
    timestamp: EXTRA_TIMESTAMPS_4[42],
    cluster: "creativity",
    parentId: "idea-441",
    depth: 1,
    branchLabel: "Idea hospice",
    type: "idea",
    subtopic: "Idea hospice",
  },
  {
    id: "idea-444",
    title: "Honorable endings",
    description:
      "Instead of letting projects quietly die, give them small rituals — a show-and-tell, a zine, a debrief call.",
    timestamp: EXTRA_TIMESTAMPS_4[43],
    cluster: "creativity",
    parentId: "idea-441",
    depth: 1,
    branchLabel: "Idea hospice",
    type: "thought",
    subtopic: "Idea hospice",
  },
  {
    id: "idea-445",
    title: "Snippet: 'Not every idea needs a sequel; some just need an epilogue.'",
    description:
      "Not every idea needs a sequel; some just need an epilogue.",
    timestamp: EXTRA_TIMESTAMPS_4[44],
    cluster: "creativity",
    parentId: "idea-443",
    depth: 2,
    branchLabel: "Idea hospice",
    type: "snippet",
    subtopic: "Idea hospice",
  },
  {
    id: "idea-446",
    title: "Audience demographic mirrors",
    description:
      "Dashboards that show who is actually consuming your work now — age, geography, context — so you can decide whether to follow or pivot.",
    timestamp: EXTRA_TIMESTAMPS_4[45],
    cluster: "creativity",
    parentId: "idea-442",
    depth: 1,
    branchLabel: "Audience drift",
    type: "idea",
    subtopic: "Audience drift",
  },
  {
    id: "idea-447",
    title: "Values drift detectors",
    description:
      "If your audience's stated values drift away from yours, tools could flag that tension long before it becomes resentment.",
    timestamp: EXTRA_TIMESTAMPS_4[46],
    cluster: "creativity",
    parentId: "idea-442",
    depth: 1,
    branchLabel: "Audience drift",
    type: "thought",
    subtopic: "Audience drift",
  },
  {
    id: "idea-448",
    title: "Quote on drift",
    description:
      "“Sometimes you didn't sell out; your audience just walked in a different direction.” — Milo Hart, musician",
    timestamp: EXTRA_TIMESTAMPS_4[47],
    cluster: "creativity",
    parentId: "idea-446",
    depth: 2,
    branchLabel: "Audience drift",
    type: "quote",
    subtopic: "Audience drift",
  },

  // Cross-cutting twigs to reach 100
  {
    id: "idea-449",
    title: "Snippet: 'Memories are a joint venture between you and your tools.'",
    description: "Memories are a joint venture between you and your tools.",
    timestamp: EXTRA_TIMESTAMPS_4[48],
    cluster: "ai",
    parentId: "idea-404",
    depth: 2,
    branchLabel: "Negotiated memory",
    type: "snippet",
    subtopic: "Negotiated memory",
  },
  {
    id: "idea-450",
    title: "Snippet: 'Expectation load breaks before infra does.'",
    description: "Expectation load breaks before infra does.",
    timestamp: EXTRA_TIMESTAMPS_4[49],
    cluster: "startups",
    parentId: "idea-412",
    depth: 2,
    branchLabel: "Expectation load",
    type: "snippet",
    subtopic: "Expectation load",
  },
  {
    id: "idea-451",
    title: "Quote on invisible orgs",
    description:
      "“Most of management is persuading the shadow org to want what the chart says.” — Sylvia Ng, manager",
    timestamp: EXTRA_TIMESTAMPS_4[50],
    cluster: "startups",
    parentId: "idea-415",
    depth: 2,
    branchLabel: "Shadow orgs",
    type: "quote",
    subtopic: "Shadow orgs",
  },
  {
    id: "idea-452",
    title: "Snippet: 'Lived-experience is a fact-check for tone.'",
    description: "Lived-experience is a fact-check for tone.",
    timestamp: EXTRA_TIMESTAMPS_4[51],
    cluster: "journalism",
    parentId: "idea-420",
    depth: 2,
    branchLabel: "Lived-experience",
    type: "snippet",
    subtopic: "Lived-experience",
  },
  {
    id: "idea-453",
    title: "Snippet: 'Counterfactuals are how you audit your assumptions.'",
    description: "Counterfactuals are how you audit your assumptions.",
    timestamp: EXTRA_TIMESTAMPS_4[52],
    cluster: "journalism",
    parentId: "idea-423",
    depth: 2,
    branchLabel: "Counterfactual beats",
    type: "snippet",
    subtopic: "Counterfactual beats",
  },
  {
    id: "idea-454",
    title: "Snippet: 'Latency reveals which values were props.'",
    description: "Latency reveals which values were props.",
    timestamp: EXTRA_TIMESTAMPS_4[53],
    cluster: "philosophy",
    parentId: "idea-428",
    depth: 2,
    branchLabel: "Latency values",
    type: "snippet",
    subtopic: "Latency values",
  },
  {
    id: "idea-455",
    title: "Snippet: 'Attention capture is the pollution of inner life.'",
    description: "Attention capture is the pollution of inner life.",
    timestamp: EXTRA_TIMESTAMPS_4[54],
    cluster: "philosophy",
    parentId: "idea-431",
    depth: 2,
    branchLabel: "Attention capture",
    type: "snippet",
    subtopic: "Attention capture",
  },
  {
    id: "idea-456",
    title: "Snippet: 'Robots that can't be repaired don't belong in public space.'",
    description: "Robots that can't be repaired don't belong in public space.",
    timestamp: EXTRA_TIMESTAMPS_4[55],
    cluster: "robotics",
    parentId: "idea-439",
    depth: 2,
    branchLabel: "Repair culture",
    type: "snippet",
    subtopic: "Repair culture",
  },
  {
    id: "idea-457",
    title: "Snippet: 'Tasks are stories with stakes.'",
    description: "Tasks are stories with stakes.",
    timestamp: EXTRA_TIMESTAMPS_4[56],
    cluster: "robotics",
    parentId: "idea-436",
    depth: 2,
    branchLabel: "Task stories",
    type: "snippet",
    subtopic: "Task stories",
  },
  {
    id: "idea-458",
    title: "Snippet: 'Some projects need a funeral, not a reboot.'",
    description: "Some projects need a funeral, not a reboot.",
    timestamp: EXTRA_TIMESTAMPS_4[57],
    cluster: "creativity",
    parentId: "idea-444",
    depth: 2,
    branchLabel: "Idea hospice",
    type: "snippet",
    subtopic: "Idea hospice",
  },
  {
    id: "idea-459",
    title: "Snippet: 'Your audience graph is a mirror of your choices.'",
    description: "Your audience graph is a mirror of your choices.",
    timestamp: EXTRA_TIMESTAMPS_4[58],
    cluster: "creativity",
    parentId: "idea-447",
    depth: 2,
    branchLabel: "Audience drift",
    type: "snippet",
    subtopic: "Audience drift",
  },
  {
    id: "idea-460",
    title: "Quote on endings",
    description:
      "“Most creative pain comes from trying to keep something alive that wants to end.” — Hiro M., novelist",
    timestamp: EXTRA_TIMESTAMPS_4[59],
    cluster: "creativity",
    parentId: "idea-441",
    depth: 2,
    branchLabel: "Idea hospice",
    type: "quote",
    subtopic: "Idea hospice",
  },
];

const EXTRA_TIMESTAMPS_5 = makeExtraTimestamps(NOW);

// Fill remaining ID range 261–300 with new ideas
const EXTRA_ZETTEL_IDEAS_5: Idea[] = [
  // AI — trunks in this block
  {
    id: "idea-261",
    title: "Model hygiene dashboards",
    description:
      "Teams need hygiene dashboards that track prompt reuse, context leaks, and stale memories so agents don’t quietly degrade over time.",
    timestamp: EXTRA_TIMESTAMPS_5[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Model hygiene",
    type: "idea",
    subtopic: "Model hygiene",
  },
  {
    id: "idea-262",
    title: "Human override grammars",
    description:
      "Define a small grammar of override phrases — 'stop', 'undo last step', 'explain why' — that all agents must understand and honor consistently.",
    timestamp: EXTRA_TIMESTAMPS_5[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Override grammars",
    type: "thought",
    subtopic: "Override grammars",
  },

  // AI — branches / twigs
  {
    id: "idea-263",
    title: "Prompt reuse detectors",
    description:
      "Surfacing when an org keeps copying the same brittle prompt across tools, accumulating invisible coupling.",
    timestamp: EXTRA_TIMESTAMPS_5[2],
    cluster: "ai",
    parentId: "idea-261",
    depth: 1,
    branchLabel: "Model hygiene",
    type: "idea",
    subtopic: "Model hygiene",
  },
  {
    id: "idea-264",
    title: "Context leak alerts",
    description:
      "Agents should flag when snippets of sensitive context start recurring in unrelated tasks — an early sign of memory misuse.",
    timestamp: EXTRA_TIMESTAMPS_5[3],
    cluster: "ai",
    parentId: "idea-261",
    depth: 1,
    branchLabel: "Model hygiene",
    type: "thought",
    subtopic: "Model hygiene",
  },
  {
    id: "idea-265",
    title: "Snippet: 'Hygiene is the boring edge of safety.'",
    description: "Hygiene is the boring edge of safety.",
    timestamp: EXTRA_TIMESTAMPS_5[4],
    cluster: "ai",
    parentId: "idea-263",
    depth: 2,
    branchLabel: "Model hygiene",
    type: "snippet",
    subtopic: "Model hygiene",
  },
  {
    id: "idea-266",
    title: "Universal override verbs",
    description:
      "Agreeing on a tiny set of verbs every agent ecosystem respects makes human control legible under pressure.",
    timestamp: EXTRA_TIMESTAMPS_5[5],
    cluster: "ai",
    parentId: "idea-262",
    depth: 1,
    branchLabel: "Override grammars",
    type: "idea",
    subtopic: "Override grammars",
  },
  {
    id: "idea-267",
    title: "Quote on overrides",
    description:
      "“You don’t control a system until you can interrupt it without thinking.” — Eliza Moreau, ops lead",
    timestamp: EXTRA_TIMESTAMPS_5[6],
    cluster: "ai",
    parentId: "idea-266",
    depth: 2,
    branchLabel: "Override grammars",
    type: "quote",
    subtopic: "Override grammars",
  },

  // Startups — trunks in this block
  {
    id: "idea-268",
    title: "Founding document archaeology",
    description:
      "Most founding docs are buried in old folders. Systematically resurfacing and annotating them shows how far reality has drifted from the original thesis.",
    timestamp: EXTRA_TIMESTAMPS_5[7],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Document archaeology",
    type: "idea",
    subtopic: "Document archaeology",
  },
  {
    id: "idea-269",
    title: "Team narrative drift",
    description:
      "Different teams inside the same company often tell subtly different stories about what the product is. That drift is an early-warning metric.",
    timestamp: EXTRA_TIMESTAMPS_5[8],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Internal narratives",
    type: "thought",
    subtopic: "Internal narratives",
  },

  // Startups — branches / twigs
  {
    id: "idea-270",
    title: "Versioned founding memos",
    description:
      "Treat founding memos like software: version them, annotate why they changed, and keep the diffs readable for new hires.",
    timestamp: EXTRA_TIMESTAMPS_5[9],
    cluster: "startups",
    parentId: "idea-268",
    depth: 1,
    branchLabel: "Document archaeology",
    type: "idea",
    subtopic: "Document archaeology",
  },
  {
    id: "idea-271",
    title: "Archaeology onboarding sessions",
    description:
      "New hires read a few old decks and memos with a founder, pausing where the company ended up doing the opposite.",
    timestamp: EXTRA_TIMESTAMPS_5[10],
    cluster: "startups",
    parentId: "idea-268",
    depth: 1,
    branchLabel: "Document archaeology",
    type: "thought",
    subtopic: "Document archaeology",
  },
  {
    id: "idea-272",
    title: "Snippet: 'Every pivot leaves fossils in your docs.'",
    description: "Every pivot leaves fossils in your docs.",
    timestamp: EXTRA_TIMESTAMPS_5[11],
    cluster: "startups",
    parentId: "idea-270",
    depth: 2,
    branchLabel: "Document archaeology",
    type: "snippet",
    subtopic: "Document archaeology",
  },
  {
    id: "idea-273",
    title: "Internal story surveys",
    description:
      "Ask each team to write 'one paragraph about what we do' and diff the answers. Drift is data.",
    timestamp: EXTRA_TIMESTAMPS_5[12],
    cluster: "startups",
    parentId: "idea-269",
    depth: 1,
    branchLabel: "Internal narratives",
    type: "idea",
    subtopic: "Internal narratives",
  },
  {
    id: "idea-274",
    title: "Quote on narrative drift",
    description:
      "“When sales and product tell different stories, you’ve already started two companies.” — Maren I., founder",
    timestamp: EXTRA_TIMESTAMPS_5[13],
    cluster: "startups",
    parentId: "idea-273",
    depth: 2,
    branchLabel: "Internal narratives",
    type: "quote",
    subtopic: "Internal narratives",
  },

  // Journalism — trunks in this block
  {
    id: "idea-275",
    title: "Long-tail corrections",
    description:
      "Most corrections happen soon after publication, but some harms appear years later. We need long-tail correction rituals.",
    timestamp: EXTRA_TIMESTAMPS_5[14],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Long-tail corrections",
    type: "idea",
    subtopic: "Long-tail corrections",
  },
  {
    id: "idea-276",
    title: "Sources as collaborators",
    description:
      "Sometimes sources aren’t just informants; they’re co-analysts. We lack clear norms for when that’s acknowledged.",
    timestamp: EXTRA_TIMESTAMPS_5[15],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Source collaboration",
    type: "thought",
    subtopic: "Source collaboration",
  },

  // Journalism — branches / twigs
  {
    id: "idea-277",
    title: "Decade-later followups",
    description:
      "Build a habit of revisiting big investigations ten years later: what actually changed, who benefited, who was forgotten.",
    timestamp: EXTRA_TIMESTAMPS_5[16],
    cluster: "journalism",
    parentId: "idea-275",
    depth: 1,
    branchLabel: "Long-tail corrections",
    type: "idea",
    subtopic: "Long-tail corrections",
  },
  {
    id: "idea-278",
    title: "Legacy harm ledgers",
    description:
      "Communities keep ledgers of harms from past coverage that never received formal correction, creating a backlog for future repair.",
    timestamp: EXTRA_TIMESTAMPS_5[17],
    cluster: "journalism",
    parentId: "idea-275",
    depth: 1,
    branchLabel: "Long-tail corrections",
    type: "thought",
    subtopic: "Long-tail corrections",
  },
  {
    id: "idea-279",
    title: "Snippet: 'Time is the final fact-checker.'",
    description: "Time is the final fact-checker.",
    timestamp: EXTRA_TIMESTAMPS_5[18],
    cluster: "journalism",
    parentId: "idea-277",
    depth: 2,
    branchLabel: "Long-tail corrections",
    type: "snippet",
    subtopic: "Long-tail corrections",
  },
  {
    id: "idea-280",
    title: "Co-analysis credit lines",
    description:
      "Credit lines that acknowledge when sources substantially contributed to analysis, not just facts.",
    timestamp: EXTRA_TIMESTAMPS_5[19],
    cluster: "journalism",
    parentId: "idea-276",
    depth: 1,
    branchLabel: "Source collaboration",
    type: "idea",
    subtopic: "Source collaboration",
  },
  {
    id: "idea-281",
    title: "Quote on collaboration",
    description:
      "“The people who live the story often see the pattern before we do.” — Raya Sol, reporter",
    timestamp: EXTRA_TIMESTAMPS_5[20],
    cluster: "journalism",
    parentId: "idea-280",
    depth: 2,
    branchLabel: "Source collaboration",
    type: "quote",
    subtopic: "Source collaboration",
  },

  // Philosophy — trunks in this block
  {
    id: "idea-282",
    title: "Ethics of simulated empathy",
    description:
      "If systems can convincingly simulate empathy without feeling anything, is that a bridge to care or a new kind of manipulation?",
    timestamp: EXTRA_TIMESTAMPS_5[21],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Simulated empathy",
    type: "idea",
    subtopic: "Simulated empathy",
  },
  {
    id: "idea-283",
    title: "Temporal moral luck",
    description:
      "The morality of an action can depend on what the world is like when you act. Rapid tech change amplifies this 'when' component.",
    timestamp: EXTRA_TIMESTAMPS_5[22],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Temporal luck",
    type: "thought",
    subtopic: "Temporal luck",
  },

  // Philosophy — branches / twigs
  {
    id: "idea-284",
    title: "Comfort vs. clarity",
    description:
      "Simulated empathy can comfort without increasing clarity. We may need norms for when to prioritize which.",
    timestamp: EXTRA_TIMESTAMPS_5[23],
    cluster: "philosophy",
    parentId: "idea-282",
    depth: 1,
    branchLabel: "Simulated empathy",
    type: "thought",
    subtopic: "Simulated empathy",
  },
  {
    id: "idea-285",
    title: "Empathy Turing tests",
    description:
      "Could humans reliably distinguish between an actually caring person and a perfectly trained simulacrum?",
    timestamp: EXTRA_TIMESTAMPS_5[24],
    cluster: "philosophy",
    parentId: "idea-282",
    depth: 1,
    branchLabel: "Simulated empathy",
    type: "idea",
    subtopic: "Simulated empathy",
  },
  {
    id: "idea-286",
    title: "Snippet: 'Comfort without agency is just anesthesia.'",
    description: "Comfort without agency is just anesthesia.",
    timestamp: EXTRA_TIMESTAMPS_5[25],
    cluster: "philosophy",
    parentId: "idea-284",
    depth: 2,
    branchLabel: "Simulated empathy",
    type: "snippet",
    subtopic: "Simulated empathy",
  },
  {
    id: "idea-287",
    title: "Era-dependent ethics",
    description:
      "The same design decision (e.g., open-sourcing a model) may be ethical in one era and reckless in another.",
    timestamp: EXTRA_TIMESTAMPS_5[26],
    cluster: "philosophy",
    parentId: "idea-283",
    depth: 1,
    branchLabel: "Temporal luck",
    type: "idea",
    subtopic: "Temporal luck",
  },
  {
    id: "idea-288",
    title: "Quote on timing",
    description:
      "“You are rarely judged for what you knew; you are judged for what you should have known.” — Devan Cho, ethicist",
    timestamp: EXTRA_TIMESTAMPS_5[27],
    cluster: "philosophy",
    parentId: "idea-287",
    depth: 2,
    branchLabel: "Temporal luck",
    type: "quote",
    subtopic: "Temporal luck",
  },

  // Robotics — trunks in this block
  {
    id: "idea-289",
    title: "Home task grammars",
    description:
      "Define a shared grammar for household tasks (wipe, sort, stack, fetch) so robots from different makers can coordinate.",
    timestamp: EXTRA_TIMESTAMPS_5[28],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Home grammars",
    type: "idea",
    subtopic: "Home grammars",
  },
  {
    id: "idea-290",
    title: "Robots and emotional safety",
    description:
      "Even when physically safe, robots can feel emotionally uncanny. Emotional safety needs as much design as collision avoidance.",
    timestamp: EXTRA_TIMESTAMPS_5[29],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Emotional safety",
    type: "thought",
    subtopic: "Emotional safety",
  },

  // Robotics — branches / twigs
  {
    id: "idea-291",
    title: "Composable chores",
    description:
      "Represent chores as composable primitives so 'clean the kitchen' has a predictable structure robots can share.",
    timestamp: EXTRA_TIMESTAMPS_5[30],
    cluster: "robotics",
    parentId: "idea-289",
    depth: 1,
    branchLabel: "Home grammars",
    type: "idea",
    subtopic: "Home grammars",
  },
  {
    id: "idea-292",
    title: "Household API standards",
    description:
      "Appliances that expose standard APIs for state and control make it dramatically easier for home robots to be useful.",
    timestamp: EXTRA_TIMESTAMPS_5[31],
    cluster: "robotics",
    parentId: "idea-289",
    depth: 1,
    branchLabel: "Home grammars",
    type: "thought",
    subtopic: "Home grammars",
  },
  {
    id: "idea-293",
    title: "Snippet: 'A smart home is mostly a readable home.'",
    description: "A smart home is mostly a readable home.",
    timestamp: EXTRA_TIMESTAMPS_5[32],
    cluster: "robotics",
    parentId: "idea-291",
    depth: 2,
    branchLabel: "Home grammars",
    type: "snippet",
    subtopic: "Home grammars",
  },
  {
    id: "idea-294",
    title: "Soothing motion libraries",
    description:
      "Motion patterns tuned specifically to feel calm to humans: consistent acceleration, visible hesitations near people, no jitter.",
    timestamp: EXTRA_TIMESTAMPS_5[33],
    cluster: "robotics",
    parentId: "idea-290",
    depth: 1,
    branchLabel: "Emotional safety",
    type: "idea",
    subtopic: "Emotional safety",
  },
  {
    id: "idea-295",
    title: "Quote on emotional safety",
    description:
      "“If you feel tense around a robot, it’s already failing at half its job.” — Jo Park, interaction designer",
    timestamp: EXTRA_TIMESTAMPS_5[34],
    cluster: "robotics",
    parentId: "idea-294",
    depth: 2,
    branchLabel: "Emotional safety",
    type: "quote",
    subtopic: "Emotional safety",
  },

  // Creativity — trunks in this block
  {
    id: "idea-296",
    title: "Micro-portfolio thinking",
    description:
      "Instead of one big project, think in micro-portfolios: clusters of tiny pieces that explore a question from many angles.",
    timestamp: EXTRA_TIMESTAMPS_5[35],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Micro-portfolios",
    type: "idea",
    subtopic: "Micro-portfolios",
  },
  {
    id: "idea-297",
    title: "Audience experiments",
    description:
      "Treat audience growth as experiments: small, deliberate tests of new formats, platforms, or tones instead of one big bet.",
    timestamp: EXTRA_TIMESTAMPS_5[36],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Audience experiments",
    type: "thought",
    subtopic: "Audience experiments",
  },

  // Creativity — branches / twigs
  {
    id: "idea-298",
    title: "Question-centered portfolios",
    description:
      "Build portfolios around questions ('what does rest look like?') instead of mediums ('illustrations').",
    timestamp: EXTRA_TIMESTAMPS_5[37],
    cluster: "creativity",
    parentId: "idea-296",
    depth: 1,
    branchLabel: "Micro-portfolios",
    type: "idea",
    subtopic: "Micro-portfolios",
  },
  {
    id: "idea-299",
    title: "Snippet: 'A micro-portfolio is a lab report in public.'",
    description: "A micro-portfolio is a lab report in public.",
    timestamp: EXTRA_TIMESTAMPS_5[38],
    cluster: "creativity",
    parentId: "idea-298",
    depth: 2,
    branchLabel: "Micro-portfolios",
    type: "snippet",
    subtopic: "Micro-portfolios",
  },
  {
    id: "idea-300",
    title: "Experiment logs",
    description:
      "Keep explicit logs of audience experiments: hypothesis, format, where you shared it, how it felt, what actually happened.",
    timestamp: EXTRA_TIMESTAMPS_5[39],
    cluster: "creativity",
    parentId: "idea-297",
    depth: 1,
    branchLabel: "Audience experiments",
    type: "idea",
    subtopic: "Audience experiments",
  },
];

const EXTRA_TIMESTAMPS_6 = makeExtraTimestamps(NOW);

// Fill remaining ID range 461–500 with new ideas
const EXTRA_ZETTEL_IDEAS_6: Idea[] = [
  // AI — trunks in this block
  {
    id: "idea-461",
    title: "Memory veto rights",
    description:
      "Close collaborators should be able to veto how your AI uses stories about them, even if you’re the primary user.",
    timestamp: EXTRA_TIMESTAMPS_6[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Shared vetoes",
    type: "idea",
    subtopic: "Shared vetoes",
  },
  {
    id: "idea-462",
    title: "Agent apprenticeship",
    description:
      "Agents should 'apprentice' under humans first, watching how they actually resolve edge cases before acting alone.",
    timestamp: EXTRA_TIMESTAMPS_6[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Agent apprenticeship",
    type: "thought",
    subtopic: "Agent apprenticeship",
  },

  // AI — branches / twigs
  {
    id: "idea-463",
    title: "Relationship-scoped memories",
    description:
      "Let people define relationship scopes (partner, collaborator, client) and decide which memories can cross those boundaries.",
    timestamp: EXTRA_TIMESTAMPS_6[2],
    cluster: "ai",
    parentId: "idea-461",
    depth: 1,
    branchLabel: "Shared vetoes",
    type: "idea",
    subtopic: "Shared vetoes",
  },
  {
    id: "idea-464",
    title: "Quote on veto rights",
    description:
      "“Your tools should not remember more about me than I’m comfortable remembering about myself.” — Cam Nguyen, designer",
    timestamp: EXTRA_TIMESTAMPS_6[3],
    cluster: "ai",
    parentId: "idea-463",
    depth: 2,
    branchLabel: "Shared vetoes",
    type: "quote",
    subtopic: "Shared vetoes",
  },
  {
    id: "idea-465",
    title: "Shadowing phases for agents",
    description:
      "Before agents act, they shadow: propose actions next to a human operator, get graded, and earn autonomy gradually.",
    timestamp: EXTRA_TIMESTAMPS_6[4],
    cluster: "ai",
    parentId: "idea-462",
    depth: 1,
    branchLabel: "Agent apprenticeship",
    type: "idea",
    subtopic: "Agent apprenticeship",
  },
  {
    id: "idea-466",
    title: "Snippet: 'Agents should earn trust the way juniors do.'",
    description: "Agents should earn trust the way juniors do.",
    timestamp: EXTRA_TIMESTAMPS_6[5],
    cluster: "ai",
    parentId: "idea-465",
    depth: 2,
    branchLabel: "Agent apprenticeship",
    type: "snippet",
    subtopic: "Agent apprenticeship",
  },

  // Startups — trunks in this block
  {
    id: "idea-467",
    title: "Founders as narrative editors",
    description:
      "A founder’s job is partly to be chief narrative editor: deciding which stories the company keeps telling and which it retires.",
    timestamp: EXTRA_TIMESTAMPS_6[6],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Narrative editing",
    type: "thought",
    subtopic: "Narrative editing",
  },
  {
    id: "idea-468",
    title: "Culture repair loops",
    description:
      "Cultures drift and crack. Build explicit repair loops instead of pretending early values will stay intact by default.",
    timestamp: EXTRA_TIMESTAMPS_6[7],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Culture repair",
    type: "idea",
    subtopic: "Culture repair",
  },

  // Startups — branches / twigs
  {
    id: "idea-469",
    title: "Story pruning sessions",
    description:
      "Once a quarter, list the stories people keep telling about the company and deliberately prune the ones that no longer help.",
    timestamp: EXTRA_TIMESTAMPS_6[8],
    cluster: "startups",
    parentId: "idea-467",
    depth: 1,
    branchLabel: "Narrative editing",
    type: "idea",
    subtopic: "Narrative editing",
  },
  {
    id: "idea-470",
    title: "Quote on narrative editing",
    description:
      "“If you don’t edit the company story, your worst week will do it for you.” — Imani Clarke, CEO",
    timestamp: EXTRA_TIMESTAMPS_6[9],
    cluster: "startups",
    parentId: "idea-469",
    depth: 2,
    branchLabel: "Narrative editing",
    type: "quote",
    subtopic: "Narrative editing",
  },
  {
    id: "idea-471",
    title: "Culture repair rituals",
    description:
      "When a value is broken, treat it like an incident: write a brief, change something concrete, and close the loop in public.",
    timestamp: EXTRA_TIMESTAMPS_6[10],
    cluster: "startups",
    parentId: "idea-468",
    depth: 1,
    branchLabel: "Culture repair",
    type: "idea",
    subtopic: "Culture repair",
  },
  {
    id: "idea-472",
    title: "Snippet: 'Values are just promises with receipts.'",
    description: "Values are just promises with receipts.",
    timestamp: EXTRA_TIMESTAMPS_6[11],
    cluster: "startups",
    parentId: "idea-471",
    depth: 2,
    branchLabel: "Culture repair",
    type: "snippet",
    subtopic: "Culture repair",
  },

  // Journalism — trunks in this block
  {
    id: "idea-473",
    title: "Silence audits",
    description:
      "Regular audits of what a newsroom is consistently silent about: topics that never make it into pitches or budgets.",
    timestamp: EXTRA_TIMESTAMPS_6[12],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Silence audits",
    type: "idea",
    subtopic: "Silence audits",
  },
  {
    id: "idea-474",
    title: "Narrative harm simulations",
    description:
      "Before publishing a sensitive story, simulate its likely narrative effects across different communities.",
    timestamp: EXTRA_TIMESTAMPS_6[13],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Narrative harm",
    type: "thought",
    subtopic: "Narrative harm",
  },

  // Journalism — branches / twigs
  {
    id: "idea-475",
    title: "Coverage heatmaps",
    description:
      "Maps that show which neighborhoods or issues rarely appear in coverage compared to their real-world impact.",
    timestamp: EXTRA_TIMESTAMPS_6[14],
    cluster: "journalism",
    parentId: "idea-473",
    depth: 1,
    branchLabel: "Silence audits",
    type: "idea",
    subtopic: "Silence audits",
  },
  {
    id: "idea-476",
    title: "Snippet: 'Silence is also an editorial choice.'",
    description: "Silence is also an editorial choice.",
    timestamp: EXTRA_TIMESTAMPS_6[15],
    cluster: "journalism",
    parentId: "idea-475",
    depth: 2,
    branchLabel: "Silence audits",
    type: "snippet",
    subtopic: "Silence audits",
  },
  {
    id: "idea-477",
    title: "Pre-publication harm reviews",
    description:
      "Cross-functional reviews that focus specifically on narrative harms of a story, separate from legal review.",
    timestamp: EXTRA_TIMESTAMPS_6[16],
    cluster: "journalism",
    parentId: "idea-474",
    depth: 1,
    branchLabel: "Narrative harm",
    type: "idea",
    subtopic: "Narrative harm",
  },
  {
    id: "idea-478",
    title: "Quote on narrative harm",
    description:
      "“A true story can still leave a scar.” — Ezra Long, editor",
    timestamp: EXTRA_TIMESTAMPS_6[17],
    cluster: "journalism",
    parentId: "idea-477",
    depth: 2,
    branchLabel: "Narrative harm",
    type: "quote",
    subtopic: "Narrative harm",
  },

  // Philosophy — trunks in this block
  {
    id: "idea-479",
    title: "Algorithmic mercy",
    description:
      "What would it mean for automated systems to practice mercy — to take into account context, growth, and second chances?",
    timestamp: EXTRA_TIMESTAMPS_6[18],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Algorithmic mercy",
    type: "idea",
    subtopic: "Algorithmic mercy",
  },
  {
    id: "idea-480",
    title: "Moral asymmetries of scale",
    description:
      "A small design decision can affect millions once baked into infrastructure. The morality of scale is not linear.",
    timestamp: EXTRA_TIMESTAMPS_6[19],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Scale asymmetries",
    type: "thought",
    subtopic: "Scale asymmetries",
  },

  // Philosophy — branches / twigs
  {
    id: "idea-481",
    title: "Graceful degradation of judgment",
    description:
      "Systems that become less punitive when data is noisy, rather than defaulting to harshness.",
    timestamp: EXTRA_TIMESTAMPS_6[20],
    cluster: "philosophy",
    parentId: "idea-479",
    depth: 1,
    branchLabel: "Algorithmic mercy",
    type: "idea",
    subtopic: "Algorithmic mercy",
  },
  {
    id: "idea-482",
    title: "Snippet: 'Mercy is just context with teeth.'",
    description: "Mercy is just context with teeth.",
    timestamp: EXTRA_TIMESTAMPS_6[21],
    cluster: "philosophy",
    parentId: "idea-481",
    depth: 2,
    branchLabel: "Algorithmic mercy",
    type: "snippet",
    subtopic: "Algorithmic mercy",
  },
  {
    id: "idea-483",
    title: "Designing for downstream lives",
    description:
      "Your work will outlive you. Thinking about downstream lives — the people who live with your choices — is a moral skill.",
    timestamp: EXTRA_TIMESTAMPS_6[22],
    cluster: "philosophy",
    parentId: "idea-480",
    depth: 1,
    branchLabel: "Scale asymmetries",
    type: "idea",
    subtopic: "Scale asymmetries",
  },
  {
    id: "idea-484",
    title: "Quote on scale",
    description:
      "“At scale, even your shrug becomes policy.” — Hester Jain, philosopher",
    timestamp: EXTRA_TIMESTAMPS_6[23],
    cluster: "philosophy",
    parentId: "idea-483",
    depth: 2,
    branchLabel: "Scale asymmetries",
    type: "quote",
    subtopic: "Scale asymmetries",
  },

  // Robotics — trunks in this block
  {
    id: "idea-485",
    title: "Robotic social cues",
    description:
      "Robots will need social cues — shrugs, nods, pauses — that let humans read uncertainty and intent.",
    timestamp: EXTRA_TIMESTAMPS_6[24],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Social cues",
    type: "idea",
    subtopic: "Social cues",
  },
  {
    id: "idea-486",
    title: "Repairable-by-design robots",
    description:
      "Robots whose parts, tools, and docs are explicitly designed to be usable by non-experts as they age.",
    timestamp: EXTRA_TIMESTAMPS_6[25],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Repairable design",
    type: "thought",
    subtopic: "Repairable design",
  },

  // Robotics — branches / twigs
  {
    id: "idea-487",
    title: "Uncertainty gestures",
    description:
      "A standard set of gestures robots use when unsure: backing up, signaling for help, or asking for clarification.",
    timestamp: EXTRA_TIMESTAMPS_6[26],
    cluster: "robotics",
    parentId: "idea-485",
    depth: 1,
    branchLabel: "Social cues",
    type: "idea",
    subtopic: "Social cues",
  },
  {
    id: "idea-488",
    title: "Snippet: 'Robots need body language before they need slogans.'",
    description: "Robots need body language before they need slogans.",
    timestamp: EXTRA_TIMESTAMPS_6[27],
    cluster: "robotics",
    parentId: "idea-487",
    depth: 2,
    branchLabel: "Social cues",
    type: "snippet",
    subtopic: "Social cues",
  },
  {
    id: "idea-489",
    title: "Exploded-view UIs",
    description:
      "Every robot ships with an exploded-view UI that shows how to open, swap, and reset major components safely.",
    timestamp: EXTRA_TIMESTAMPS_6[28],
    cluster: "robotics",
    parentId: "idea-486",
    depth: 1,
    branchLabel: "Repairable design",
    type: "idea",
    subtopic: "Repairable design",
  },
  {
    id: "idea-490",
    title: "Quote on repairable design",
    description:
      "“A device you can’t open is a promise you can’t keep.” — Ludo Frey, hardware hacker",
    timestamp: EXTRA_TIMESTAMPS_6[29],
    cluster: "robotics",
    parentId: "idea-489",
    depth: 2,
    branchLabel: "Repairable design",
    type: "quote",
    subtopic: "Repairable design",
  },

  // Creativity — trunks in this block
  {
    id: "idea-491",
    title: "Idea recycling plants",
    description:
      "Collect abandoned ideas from many creators and algorithmically suggest surprising recombinations.",
    timestamp: EXTRA_TIMESTAMPS_6[30],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Idea recycling",
    type: "idea",
    subtopic: "Idea recycling",
  },
  {
    id: "idea-492",
    title: "Creative sobriety",
    description:
      "Recognizing when your creative process has become dependent on a particular crutch — a tool, a vibe, a platform — and resetting.",
    timestamp: EXTRA_TIMESTAMPS_6[31],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Creative sobriety",
    type: "thought",
    subtopic: "Creative sobriety",
  },

  // Creativity — branches / twigs
  {
    id: "idea-493",
    title: "Remix residencies",
    description:
      "Residencies where the only rule is to remix others’ abandoned projects with consent.",
    timestamp: EXTRA_TIMESTAMPS_6[32],
    cluster: "creativity",
    parentId: "idea-491",
    depth: 1,
    branchLabel: "Idea recycling",
    type: "idea",
    subtopic: "Idea recycling",
  },
  {
    id: "idea-494",
    title: "Snippet: 'Old ideas don’t die; they compost.'",
    description: "Old ideas don’t die; they compost.",
    timestamp: EXTRA_TIMESTAMPS_6[33],
    cluster: "creativity",
    parentId: "idea-493",
    depth: 2,
    branchLabel: "Idea recycling",
    type: "snippet",
    subtopic: "Idea recycling",
  },
  {
    id: "idea-495",
    title: "Dependency fasts",
    description:
      "Short fasts where you deliberately stop using a favorite tool or platform to see what remains of your voice.",
    timestamp: EXTRA_TIMESTAMPS_6[34],
    cluster: "creativity",
    parentId: "idea-492",
    depth: 1,
    branchLabel: "Creative sobriety",
    type: "idea",
    subtopic: "Creative sobriety",
  },
  {
    id: "idea-496",
    title: "Quote on sobriety",
    description:
      "“Sometimes the bravest draft is the one you write without your usual armor.” — Talia Noor, poet",
    timestamp: EXTRA_TIMESTAMPS_6[35],
    cluster: "creativity",
    parentId: "idea-495",
    depth: 2,
    branchLabel: "Creative sobriety",
    type: "quote",
    subtopic: "Creative sobriety",
  },
  {
    id: "idea-497",
    title: "Snippet: 'A style is what survives when the props are gone.'",
    description: "A style is what survives when the props are gone.",
    timestamp: EXTRA_TIMESTAMPS_6[36],
    cluster: "creativity",
    parentId: "idea-492",
    depth: 2,
    branchLabel: "Creative sobriety",
    type: "snippet",
    subtopic: "Creative sobriety",
  },
  {
    id: "idea-498",
    title: "Shared scrap heaps",
    description:
      "Online spaces where creators post scraps they know they’ll never finish, tagged by mood and theme.",
    timestamp: EXTRA_TIMESTAMPS_6[37],
    cluster: "creativity",
    parentId: "idea-491",
    depth: 1,
    branchLabel: "Idea recycling",
    type: "idea",
    subtopic: "Idea recycling",
  },
  {
    id: "idea-499",
    title: "Snippet: 'Your scrap heap is a future library.'",
    description: "Your scrap heap is a future library.",
    timestamp: EXTRA_TIMESTAMPS_6[38],
    cluster: "creativity",
    parentId: "idea-498",
    depth: 2,
    branchLabel: "Idea recycling",
    type: "snippet",
    subtopic: "Idea recycling",
  },
  {
    id: "idea-500",
    title: "Closing loops",
    description:
      "A practice of periodically closing creative loops — sending the email, finishing the small draft, archiving the dead project — to make room for new work.",
    timestamp: EXTRA_TIMESTAMPS_6[39],
    cluster: "creativity",
    parentId: "idea-492",
    depth: 1,
    branchLabel: "Creative sobriety",
    type: "idea",
    subtopic: "Creative sobriety",
  },
];

const EXTRA_TIMESTAMPS_7 = makeExtraTimestamps(NOW);

// Fill remaining ID range 361–400 with new ideas
const EXTRA_ZETTEL_IDEAS_7: Idea[] = [
  // AI — trunks in this block
  {
    id: "idea-361",
    title: "Explanatory latency",
    description:
      "How quickly a model can explain itself may matter as much as how quickly it answers. Explanations have their own latency budget.",
    timestamp: EXTRA_TIMESTAMPS_7[0],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Explanation latency",
    type: "thought",
    subtopic: "Explanation latency",
  },
  {
    id: "idea-362",
    title: "Failure storytelling for agents",
    description:
      "Agents should be able to tell the story of a failure in plain language — not just error codes — so humans can actually learn from it.",
    timestamp: EXTRA_TIMESTAMPS_7[1],
    cluster: "ai",
    parentId: null,
    depth: 0,
    branchLabel: "Failure stories",
    type: "idea",
    subtopic: "Failure stories",
  },

  // AI — branches / twigs
  {
    id: "idea-363",
    title: "Answer vs. explanation tradeoffs",
    description:
      "Sometimes the best answer is slow with a good explanation. Interfaces should let users choose that tradeoff explicitly.",
    timestamp: EXTRA_TIMESTAMPS_7[2],
    cluster: "ai",
    parentId: "idea-361",
    depth: 1,
    branchLabel: "Explanation latency",
    type: "idea",
    subtopic: "Explanation latency",
  },
  {
    id: "idea-364",
    title: "Snippet: 'An answer without a story is hard to debug.'",
    description: "An answer without a story is hard to debug.",
    timestamp: EXTRA_TIMESTAMPS_7[3],
    cluster: "ai",
    parentId: "idea-363",
    depth: 2,
    branchLabel: "Explanation latency",
    type: "snippet",
    subtopic: "Explanation latency",
  },
  {
    id: "idea-365",
    title: "Postmortems in natural language",
    description:
      "Agents can auto-draft postmortems that humans then edit, building a shared library of how things went wrong.",
    timestamp: EXTRA_TIMESTAMPS_7[4],
    cluster: "ai",
    parentId: "idea-362",
    depth: 1,
    branchLabel: "Failure stories",
    type: "idea",
    subtopic: "Failure stories",
  },
  {
    id: "idea-366",
    title: "Quote on failure stories",
    description:
      "“If you can’t tell the story of a failure, you’ll live it again.” — Arun Das, SRE",
    timestamp: EXTRA_TIMESTAMPS_7[5],
    cluster: "ai",
    parentId: "idea-365",
    depth: 2,
    branchLabel: "Failure stories",
    type: "quote",
    subtopic: "Failure stories",
  },

  // Startups — trunks in this block
  {
    id: "idea-367",
    title: "Ritual design for teams",
    description:
      "Most cultures are held together by rituals more than policies. Treat ritual design as a first-class leadership skill.",
    timestamp: EXTRA_TIMESTAMPS_7[6],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Team rituals",
    type: "idea",
    subtopic: "Team rituals",
  },
  {
    id: "idea-368",
    title: "Narrative guardrails for hiring",
    description:
      "Hiring stories ('we only hire X') can quietly limit who even applies. Treat them as guardrails that need review.",
    timestamp: EXTRA_TIMESTAMPS_7[7],
    cluster: "startups",
    parentId: null,
    depth: 0,
    branchLabel: "Hiring narratives",
    type: "thought",
    subtopic: "Hiring narratives",
  },

  // Startups — branches / twigs
  {
    id: "idea-369",
    title: "Designing first-day rituals",
    description:
      "The first day sets the emotional tone for years. A single well-designed ritual can do more than a slide deck.",
    timestamp: EXTRA_TIMESTAMPS_7[8],
    cluster: "startups",
    parentId: "idea-367",
    depth: 1,
    branchLabel: "Team rituals",
    type: "idea",
    subtopic: "Team rituals",
  },
  {
    id: "idea-370",
    title: "Snippet: 'Rituals are culture you can schedule.'",
    description: "Rituals are culture you can schedule.",
    timestamp: EXTRA_TIMESTAMPS_7[9],
    cluster: "startups",
    parentId: "idea-369",
    depth: 2,
    branchLabel: "Team rituals",
    type: "snippet",
    subtopic: "Team rituals",
  },
  {
    id: "idea-371",
    title: "Auditing hiring myths",
    description:
      "Sit down once a year and list the myths about who 'thrives here.' Decide which ones to keep and which to dismantle.",
    timestamp: EXTRA_TIMESTAMPS_7[10],
    cluster: "startups",
    parentId: "idea-368",
    depth: 1,
    branchLabel: "Hiring narratives",
    type: "idea",
    subtopic: "Hiring narratives",
  },
  {
    id: "idea-372",
    title: "Quote on hiring narratives",
    description:
      "“You can’t diversify a team if you’re still telling the same hero story.” — Laila K., VP People",
    timestamp: EXTRA_TIMESTAMPS_7[11],
    cluster: "startups",
    parentId: "idea-371",
    depth: 2,
    branchLabel: "Hiring narratives",
    type: "quote",
    subtopic: "Hiring narratives",
  },

  // Journalism — trunks in this block
  {
    id: "idea-373",
    title: "Smaller front pages",
    description:
      "Homepages are overloaded. A smaller, more opinionated front page might build more trust than a maximalist one.",
    timestamp: EXTRA_TIMESTAMPS_7[12],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Minimal fronts",
    type: "idea",
    subtopic: "Minimal fronts",
  },
  {
    id: "idea-374",
    title: "Temporal transparency",
    description:
      "Readers rarely see when facts were added, corrected, or removed. Temporal transparency would surface that lifecycle.",
    timestamp: EXTRA_TIMESTAMPS_7[13],
    cluster: "journalism",
    parentId: null,
    depth: 0,
    branchLabel: "Timeline transparency",
    type: "thought",
    subtopic: "Timeline transparency",
  },

  // Journalism — branches / twigs
  {
    id: "idea-375",
    title: "Opinionated front-page slots",
    description:
      "Limit the number of front-page slots and decide in public what each one is for: breaking, slow, local, repair.",
    timestamp: EXTRA_TIMESTAMPS_7[14],
    cluster: "journalism",
    parentId: "idea-373",
    depth: 1,
    branchLabel: "Minimal fronts",
    type: "idea",
    subtopic: "Minimal fronts",
  },
  {
    id: "idea-376",
    title: "Snippet: 'Curation is also a kind of fact.'",
    description: "Curation is also a kind of fact.",
    timestamp: EXTRA_TIMESTAMPS_7[15],
    cluster: "journalism",
    parentId: "idea-375",
    depth: 2,
    branchLabel: "Minimal fronts",
    type: "snippet",
    subtopic: "Minimal fronts",
  },
  {
    id: "idea-377",
    title: "Visible change logs on stories",
    description:
      "Every update to a story shows up in a visible changelog, not just a single 'updated' tag.",
    timestamp: EXTRA_TIMESTAMPS_7[16],
    cluster: "journalism",
    parentId: "idea-374",
    depth: 1,
    branchLabel: "Timeline transparency",
    type: "idea",
    subtopic: "Timeline transparency",
  },
  {
    id: "idea-378",
    title: "Quote on time and truth",
    description:
      "“The truth of a story is partly about what it used to say.” — N. Alvarez, editor",
    timestamp: EXTRA_TIMESTAMPS_7[17],
    cluster: "journalism",
    parentId: "idea-377",
    depth: 2,
    branchLabel: "Timeline transparency",
    type: "quote",
    subtopic: "Timeline transparency",
  },

  // Philosophy — trunks in this block
  {
    id: "idea-379",
    title: "Ethics of defaults",
    description:
      "Most people accept whatever default is offered. Designing defaults is therefore one of the most powerful ethical levers.",
    timestamp: EXTRA_TIMESTAMPS_7[18],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Default ethics",
    type: "idea",
    subtopic: "Default ethics",
  },
  {
    id: "idea-380",
    title: "Moral posture drift",
    description:
      "Your 'moral posture' — cynical, hopeful, cautious — drifts over time with inputs. Tools could help you notice that drift.",
    timestamp: EXTRA_TIMESTAMPS_7[19],
    cluster: "philosophy",
    parentId: null,
    depth: 0,
    branchLabel: "Posture drift",
    type: "thought",
    subtopic: "Posture drift",
  },

  // Philosophy — branches / twigs
  {
    id: "idea-381",
    title: "Default maps",
    description:
      "Maps of where defaults live in your life: privacy settings, auto-renew toggles, notification patterns.",
    timestamp: EXTRA_TIMESTAMPS_7[20],
    cluster: "philosophy",
    parentId: "idea-379",
    depth: 1,
    branchLabel: "Default ethics",
    type: "idea",
    subtopic: "Default ethics",
  },
  {
    id: "idea-382",
    title: "Snippet: 'Show me your defaults, and I’ll show you your ethics.'",
    description: "Show me your defaults, and I’ll show you your ethics.",
    timestamp: EXTRA_TIMESTAMPS_7[21],
    cluster: "philosophy",
    parentId: "idea-381",
    depth: 2,
    branchLabel: "Default ethics",
    type: "snippet",
    subtopic: "Default ethics",
  },
  {
    id: "idea-383",
    title: "Posture check-ins",
    description:
      "Prompts that ask: have you become more cynical or more trusting this year, and why?",
    timestamp: EXTRA_TIMESTAMPS_7[22],
    cluster: "philosophy",
    parentId: "idea-380",
    depth: 1,
    branchLabel: "Posture drift",
    type: "idea",
    subtopic: "Posture drift",
  },
  {
    id: "idea-384",
    title: "Quote on posture",
    description:
      "“Your stance toward the world is the most contagious thing you carry.” — Ada K., philosopher",
    timestamp: EXTRA_TIMESTAMPS_7[23],
    cluster: "philosophy",
    parentId: "idea-383",
    depth: 2,
    branchLabel: "Posture drift",
    type: "quote",
    subtopic: "Posture drift",
  },

  // Robotics — trunks in this block
  {
    id: "idea-385",
    title: "Domestic uncertainty budgets",
    description:
      "Home environments are inherently uncertain. Robots need explicit uncertainty budgets for how much guesswork is acceptable around people.",
    timestamp: EXTRA_TIMESTAMPS_7[24],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Uncertainty budgets",
    type: "idea",
    subtopic: "Uncertainty budgets",
  },
  {
    id: "idea-386",
    title: "Neighborhood trust cues",
    description:
      "Visible cues (stickers, lighting, motion styles) that signal how robots behave in a neighborhood and what norms they follow.",
    timestamp: EXTRA_TIMESTAMPS_7[25],
    cluster: "robotics",
    parentId: null,
    depth: 0,
    branchLabel: "Trust cues",
    type: "thought",
    subtopic: "Trust cues",
  },

  // Robotics — branches / twigs
  {
    id: "idea-387",
    title: "No-guess zones",
    description:
      "Define 'no-guess' zones in homes where robots must ask for permission before acting.",
    timestamp: EXTRA_TIMESTAMPS_7[26],
    cluster: "robotics",
    parentId: "idea-385",
    depth: 1,
    branchLabel: "Uncertainty budgets",
    type: "idea",
    subtopic: "Uncertainty budgets",
  },
  {
    id: "idea-388",
    title: "Snippet: 'Uncertainty is fine until it involves someone’s body or memory.'",
    description:
      "Uncertainty is fine until it involves someone’s body or memory.",
    timestamp: EXTRA_TIMESTAMPS_7[27],
    cluster: "robotics",
    parentId: "idea-387",
    depth: 2,
    branchLabel: "Uncertainty budgets",
    type: "snippet",
    subtopic: "Uncertainty budgets",
  },
  {
    id: "idea-389",
    title: "Neighborhood robot signage",
    description:
      "Simple signs that explain what robots are active here, what they do, and how to get help if something goes wrong.",
    timestamp: EXTRA_TIMESTAMPS_7[28],
    cluster: "robotics",
    parentId: "idea-386",
    depth: 1,
    branchLabel: "Trust cues",
    type: "idea",
    subtopic: "Trust cues",
  },
  {
    id: "idea-390",
    title: "Quote on trust cues",
    description:
      "“People can live with a lot of complexity as long as they know what to expect.” — Renata Lee, urbanist",
    timestamp: EXTRA_TIMESTAMPS_7[29],
    cluster: "robotics",
    parentId: "idea-389",
    depth: 2,
    branchLabel: "Trust cues",
    type: "quote",
    subtopic: "Trust cues",
  },

  // Creativity — trunks in this block
  {
    id: "idea-391",
    title: "Feedback literacy",
    description:
      "Learning how to ask for, receive, and metabolize feedback is its own creative skill, distinct from the work itself.",
    timestamp: EXTRA_TIMESTAMPS_7[30],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Feedback literacy",
    type: "idea",
    subtopic: "Feedback literacy",
  },
  {
    id: "idea-392",
    title: "Creative pacing",
    description:
      "Finding a sustainable creative pace — not too slow to lose nerve, not too fast to lose depth — is underrated strategy.",
    timestamp: EXTRA_TIMESTAMPS_7[31],
    cluster: "creativity",
    parentId: null,
    depth: 0,
    branchLabel: "Pacing craft",
    type: "thought",
    subtopic: "Pacing craft",
  },

  // Creativity — branches / twigs
  {
    id: "idea-393",
    title: "Feedback request templates",
    description:
      "Templates that make feedback specific: 'tell me where you were bored', 'tell me where you were surprised.'",
    timestamp: EXTRA_TIMESTAMPS_7[32],
    cluster: "creativity",
    parentId: "idea-391",
    depth: 1,
    branchLabel: "Feedback literacy",
    type: "idea",
    subtopic: "Feedback literacy",
  },
  {
    id: "idea-394",
    title: "Snippet: 'Unskilled feedback can wound more than silence.'",
    description: "Unskilled feedback can wound more than silence.",
    timestamp: EXTRA_TIMESTAMPS_7[33],
    cluster: "creativity",
    parentId: "idea-393",
    depth: 2,
    branchLabel: "Feedback literacy",
    type: "snippet",
    subtopic: "Feedback literacy",
  },
  {
    id: "idea-395",
    title: "Pacing calendars",
    description:
      "Calendars that mark creative sprints and deliberate rest weeks so you don’t accidentally sprint all year.",
    timestamp: EXTRA_TIMESTAMPS_7[34],
    cluster: "creativity",
    parentId: "idea-392",
    depth: 1,
    branchLabel: "Pacing craft",
    type: "idea",
    subtopic: "Pacing craft",
  },
  {
    id: "idea-396",
    title: "Quote on pacing",
    description:
      "“A pace you can’t sustain is just a more impressive way of quitting.” — Jonah Rees, cartoonist",
    timestamp: EXTRA_TIMESTAMPS_7[35],
    cluster: "creativity",
    parentId: "idea-395",
    depth: 2,
    branchLabel: "Pacing craft",
    type: "quote",
    subtopic: "Pacing craft",
  },
  {
    id: "idea-397",
    title: "Snippet: 'Feedback is a skill, not a side-effect.'",
    description: "Feedback is a skill, not a side-effect.",
    timestamp: EXTRA_TIMESTAMPS_7[36],
    cluster: "creativity",
    parentId: "idea-391",
    depth: 2,
    branchLabel: "Feedback literacy",
    type: "snippet",
    subtopic: "Feedback literacy",
  },
  {
    id: "idea-398",
    title: "Micro-rest practices",
    description:
      "Tiny rest practices between creative pushes: a walk, a page of reading, a five-minute sketch with no purpose.",
    timestamp: EXTRA_TIMESTAMPS_7[37],
    cluster: "creativity",
    parentId: "idea-392",
    depth: 1,
    branchLabel: "Pacing craft",
    type: "idea",
    subtopic: "Pacing craft",
  },
  {
    id: "idea-399",
    title: "Snippet: 'Rest is part of the draft, not a break from it.'",
    description: "Rest is part of the draft, not a break from it.",
    timestamp: EXTRA_TIMESTAMPS_7[38],
    cluster: "creativity",
    parentId: "idea-398",
    depth: 2,
    branchLabel: "Pacing craft",
    type: "snippet",
    subtopic: "Pacing craft",
  },
  {
    id: "idea-400",
    title: "Closing critique loops",
    description:
      "After big feedback sessions, circle back later to show what changed — or didn’t — so feedback feels consequential.",
    timestamp: EXTRA_TIMESTAMPS_7[39],
    cluster: "creativity",
    parentId: "idea-391",
    depth: 1,
    branchLabel: "Feedback literacy",
    type: "idea",
    subtopic: "Feedback literacy",
  },
];

export const MOCK_IDEAS: Idea[] = [
  ...buildZettelIdeas(LEGACY_IDEAS),
  ...EXTRA_ZETTEL_IDEAS,
  ...EXTRA_ZETTEL_IDEAS_2,
  ...EXTRA_ZETTEL_IDEAS_3,
  ...EXTRA_ZETTEL_IDEAS_4,
  ...EXTRA_ZETTEL_IDEAS_5,
  ...EXTRA_ZETTEL_IDEAS_6,
  ...EXTRA_ZETTEL_IDEAS_7,
];

/** Cluster centers for layout (x, y) in flow space */
export const CLUSTER_CENTERS: Record<ThemeId, { x: number; y: number }> = {
  ai: { x: 0, y: 0 },
  startups: { x: 600, y: -200 },
  robotics: { x: -550, y: -150 },
  journalism: { x: 500, y: 400 },
  philosophy: { x: -450, y: 400 },
  creativity: { x: 100, y: 550 },
};

type LayoutNode = SimulationNodeDatum & {
  id: string;
  cluster: ThemeId;
};

type LayoutLink = SimulationLinkDatum<LayoutNode> & {
  source: string | LayoutNode;
  target: string | LayoutNode;
};

function computeForceLayout(ideas: Idea[]) {
  const nodes: LayoutNode[] = ideas.map((idea) => {
    const center = CLUSTER_CENTERS[idea.cluster];
    return {
      id: idea.id,
      cluster: idea.cluster,
      x: center.x,
      y: center.y,
    };
  });

  const links: LayoutLink[] = [];
  const idSet = new Set(ideas.map((i) => i.id));
  ideas.forEach((idea) => {
    if (!idea.parentId) return;
    if (!idSet.has(idea.parentId)) return;
    links.push({ source: idea.parentId, target: idea.id });
  });

  const collisionRadius = 35;

  const simulation = forceSimulation<LayoutNode>(nodes)
    .force("center", forceCenter(0, 0))
    .force(
      "cluster",
      () => {
        const strength = 0.3;
        return (alpha: number) => {
          nodes.forEach((node) => {
            const center = CLUSTER_CENTERS[node.cluster];
            const x = node.x ?? 0;
            const y = node.y ?? 0;
            node.vx = (node.vx ?? 0) + (center.x - x) * strength * alpha;
            node.vy = (node.vy ?? 0) + (center.y - y) * strength * alpha;
          });
        };
      }
    )
    .force("charge", forceManyBody().strength(-30))
    .force("collide", forceCollide(collisionRadius))
    .force(
      "link",
      forceLink<LayoutNode, LayoutLink>(links)
        .id((d) => d.id)
        .distance(60)
        .strength(0.4)
    );

  // Run the simulation synchronously for a fixed number of ticks
  for (let i = 0; i < 300; i += 1) {
    simulation.tick();
  }
  simulation.stop();

  const positions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((node) => {
    positions[node.id] = {
      x: node.x ?? 0,
      y: node.y ?? 0,
    };
  });

  return positions;
}

/** Build React Flow nodes with positions from a one-time d3-force layout */
export function getNodesFromIdeas(ideas: Idea[]) {
  const positions = computeForceLayout(ideas);

  return ideas.map((idea) => ({
    id: idea.id,
    type: "ideaNode",
    position: positions[idea.id] ?? { x: 0, y: 0 },
    data: idea,
  }));
}

/** Build React Flow edges from idea connections */
export function getEdgesFromIdeas(ideas: Idea[]) {
  const idSet = new Set(ideas.map((i) => i.id));
  const byId = new Map(ideas.map((i) => [i.id, i] as const));
  return ideas
    .filter((idea) => idea.parentId && idSet.has(idea.parentId))
    .map((idea) => ({
      id: `e-${idea.parentId}-${idea.id}`,
      source: idea.parentId as string,
      target: idea.id,
      data: {
        sourceCluster: byId.get(idea.parentId as string)?.cluster,
        targetCluster: idea.cluster,
      },
    }));
}
