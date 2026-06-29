// calculator.js — formula-based cost estimation and insight selection.

// PRO FEATURE GATE
// AI parsing (api.js) is a Pro feature — not yet implemented in paid tier
// For now: falls back to formula-only if no OpenRouter key present
// Future: replace localStorage key with server-side auth + credit deduction
// Pricing model when implemented: €20/5 credits, €100/20, €149/mo unlimited

import { CALC } from "./config.js";

// Returns the average monthly cost across selected tools, or chatgpt fallback.
function avgToolCost(state) {
  if (!state.selectedTools || state.selectedTools.length === 0) return CALC.toolCosts.chatgpt;
  const total = state.selectedTools.reduce((s, id) => s + (CALC.toolCosts[id] ?? 0), 0);
  return total / state.selectedTools.length;
}

// Returns every included role with a positive headcount, default and custom.
function includedRoles(state) {
  const all = [...state.roles, ...state.customRoles];
  return all.filter(r => r.defaultIncluded && (r.defaultHeadcount ?? 0) >= 1);
}

// Computes estimated monthly team AI subscription burn.
export function calculateMonthlyBurn(state) {
  const cost = avgToolCost(state);
  const tools = CALC.adoptionToolCount[state.adoptionLevel] ?? 1;
  return includedRoles(state).reduce((sum, r) => {
    const w = CALC.roleWeights[r.defaultWeight] ?? 1;
    return sum + r.defaultHeadcount * cost * tools * w;
  }, 0);
}

// Returns total headcount across all included roles.
function totalHeadcount(state) {
  return includedRoles(state).reduce((s, r) => s + r.defaultHeadcount, 0);
}

// Computes project AI cost as a low/mid/high range.
export function calculateProjectCost(state) {
  const base = totalHeadcount(state)
    * CALC.baseWeeklyPerPerson
    * (state.projectDurationWeeks ?? 8)
    * CALC.projectTypeMultiplier[state.projectType ?? "other"]
    * CALC.adoptionToolCount[state.adoptionLevel]
    * (state.projectAnalysis?.adjustment_multiplier ?? 1.0);
  const low = base * CALC.rangeMultipliers.low;
  const high = base * CALC.rangeMultipliers.high;
  return { low, mid: (low + high) / 2, high };
}

// Selects a contextual insight string by dominant state.
export function selectInsight(state) {
  const devs = state.roles.filter(r => ["frontend", "backend", "fullstack"].includes(r.id) && r.defaultIncluded).reduce((s, r) => s + r.defaultHeadcount, 0);
  const team = totalHeadcount(state);
  const power = [...state.roles, ...state.customRoles].some(r => r.defaultIncluded && r.defaultWeight === "poweruser");
  if (state.adoptionLevel === "allin" && devs > 3) return "All-in adoption with a big dev team means subscription burn that nobody sees on a single invoice — it adds up fast.";
  if (state.projectType === "cms_migration") return "CMS migrations hide their cost in content transformation — every page reworked is tokens spent. Budget for the long tail.";
  if (state.projectType === "ai_feature") return "AI features can explode in token usage once real users hit them. Your build cost is the small number here.";
  if (power) return "Power users concentrate cost. One heavy seat can outspend five light ones — watch where usage clusters.";
  if (state.selfHosted) return "Self-hosted models look free until you count GPU time, ops hours, and the engineer babysitting them. The cost moved, it didn't vanish.";
  if (state.adoptionLevel === "light" && team > 5) return "Light adoption on a big team is opportunity cost — competitors moving faster are spending more on purpose.";
  if (state.projectType === "discovery") return "Discovery work drifts. Loose scope plus AI tooling makes estimates wander — revisit this number weekly.";
  if (state.directApiUsage) return "Direct API usage gives you real cost visibility — use it. You can see exactly what each feature costs to run.";
  return "AI cost rarely shows up as one line — it's scattered across seats, tools, and tokens. This is your starting picture.";
}

// Formats a number as a euro currency string.
export function formatCurrency(number) {
  return "€" + Math.round(number).toLocaleString("en-IE");
}

// Formats a low/high pair as a euro range string.
export function formatRange(low, high) {
  return formatCurrency(low) + " – " + formatCurrency(high);
}
