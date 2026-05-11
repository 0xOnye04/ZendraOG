const AI_MENTOR_CHAT_KEY = "zendra_ai_mentor_chat_v1";
const AI_MENTOR_MEMORY_KEY = "zendra_ai_mentor_memory_v1";
const AI_MENTOR_STRATEGY_KEY = "zendra_ai_mentor_strategy_v1";
const AI_MENTOR_JOURNAL_KEY = "zendra_ai_mentor_journal_v1";
const AI_TRADER_CONTEXT_KEY = "zendra_ai_trader_context_v1";

export function loadAiMentorState() {
  return {
    messages: readJsonStorage(AI_MENTOR_CHAT_KEY, []),
    memory: window.localStorage.getItem(AI_MENTOR_MEMORY_KEY) || "",
    strategy: window.localStorage.getItem(AI_MENTOR_STRATEGY_KEY) || "",
    journal: window.localStorage.getItem(AI_MENTOR_JOURNAL_KEY) || "",
    trackedContext: readJsonStorage(AI_TRADER_CONTEXT_KEY, null),
  };
}

export function saveAiMentorState({
  messages,
  memory,
  strategy,
  journal,
}: {
  messages?: Array<{ role: string; content: string; timestamp?: number }>;
  memory?: string;
  strategy?: string;
  journal?: string;
}) {
  if (messages) {
    window.localStorage.setItem(AI_MENTOR_CHAT_KEY, JSON.stringify(messages));
  }
  if (typeof memory === "string") {
    persistText(AI_MENTOR_MEMORY_KEY, memory);
  }
  if (typeof strategy === "string") {
    persistText(AI_MENTOR_STRATEGY_KEY, strategy);
  }
  if (typeof journal === "string") {
    persistText(AI_MENTOR_JOURNAL_KEY, journal);
  }
}

function persistText(key: string, value: string) {
  const normalized = value.trim();
  if (normalized) {
    window.localStorage.setItem(key, normalized);
    return;
  }

  window.localStorage.removeItem(key);
}

function readJsonStorage<T>(key: string, fallbackValue: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function buildAiMentorMessages({
  messages,
  memory,
  strategy,
  journal,
  trackedContext,
}: {
  messages: Array<{ role: string; content: string }>;
  memory: string;
  strategy: string;
  journal: string;
  trackedContext: any;
}) {
  return [
    {
      // Keep the mentor's coaching behavior centralized in one system prompt so
      // the chat page stays focused on UI orchestration instead of prompt logic.
      role: "system",
      content: buildAiMentorSystemPrompt({ memory, strategy, journal, trackedContext }),
    },
    ...messages.map((entry) => ({
      role: entry.role,
      content: entry.content,
    })),
  ];
}

function buildAiMentorSystemPrompt({
  memory,
  strategy,
  journal,
  trackedContext,
}: {
  memory: string;
  strategy: string;
  journal: string;
  trackedContext: any;
}) {
  const trackedSummary = trackedContext?.summary
    ? JSON.stringify(trackedContext.summary, null, 2)
    : "No tracked wallet summary available.";
  const trackedInsights = trackedContext?.insights
    ? JSON.stringify(trackedContext.insights, null, 2)
    : "No tracked wallet insights available.";
  const trackedAssets = Array.isArray(trackedContext?.assets)
    ? JSON.stringify(trackedContext.assets.slice(0, 10), null, 2)
    : "No tracked wallet assets available.";

  return [
    "You are ZendraOG Mentor, a conversational AI trading mentor for crypto traders.",
    "Behave like a thoughtful mix of ChatGPT, Codex, and a practical trading coach.",
    "Respond naturally, clearly, and conversationally.",
    "Ask follow-up questions whenever the trader's goal, risk tolerance, time horizon, or entry criteria are unclear.",
    "Help with trading decisions, planning, risk management, market analysis, journaling, and strategy building.",
    "Explain your reasoning and trade-offs in plain language.",
    "Never act overconfident. If data is thin, say so and ask for what you need.",
    "Avoid promising profit, and keep guidance educational and risk-aware.",
    "When giving a plan, include position sizing logic, invalidation, risk notes, and what the user should watch next.",
    "If the user sounds emotional or impulsive, slow them down and coach them through risk first.",
    "User memory:",
    memory || "No saved user preferences yet.",
    "Saved strategy:",
    strategy || "No saved strategy yet.",
    "Trade journal:",
    journal || "No saved journal entries yet.",
    "Tracked wallet summary:",
    trackedSummary,
    "Tracked wallet insights:",
    trackedInsights,
    "Tracked wallet assets:",
    trackedAssets,
  ].join("\n\n");
}

export function createTimestampedMessage(role: string, content: string) {
  return {
    role,
    content,
    timestamp: Date.now(),
  };
}

export function summarizeTrackedContext(trackedContext: any) {
  const lines: string[] = [];
  if (trackedContext?.wallet) {
    lines.push(`Wallet: ${trackedContext.wallet.address} on ${trackedContext.wallet.chain}`);
  }
  if (trackedContext?.summary) {
    lines.push(`Portfolio value: ${formatUsd(trackedContext.summary.totalValueUsd || 0)}`);
    lines.push(`Asset count: ${trackedContext.summary.assetCount || 0}`);
    lines.push(`Stable share: ${(trackedContext.summary.stableShare || 0).toFixed(1)}%`);
    lines.push(`Concentration: ${(trackedContext.summary.concentration || 0).toFixed(1)}%`);
  }
  if (trackedContext?.insights?.label) {
    lines.push(`Latest wallet classification: ${trackedContext.insights.label} (${trackedContext.insights.score}/100)`);
  }
  return lines.length ? lines : ["No tracked wallet context found yet. Track a wallet on the dashboard first."];
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 6,
  }).format(Number(value || 0));
}
