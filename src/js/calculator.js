// calculator.js — formula-based cost estimation and insight selection.

// PRO FEATURE GATE
// AI parsing (api.js) is a Pro feature — not yet implemented in paid tier
// For now: falls back to formula-only if no OpenRouter key present
// Future: replace localStorage key with server-side auth + credit deduction
// Pricing model when implemented: €20/5 credits, €100/20, €149/mo unlimited

import { CALC, STRINGS } from "./config.js";

// Returns the average monthly cost across a list of tool ids, or chatgpt fallback.
function avgToolCost(state, ids) {
  const list = ids ?? state.selectedTools;
  if (!list || list.length === 0) return CALC.toolCosts.chatgpt;
  const total = list.reduce((s, id) => s + (CALC.toolCosts[id] ?? 0), 0);
  return total / list.length;
}

// Returns every included role with a positive headcount, default and custom.
function includedRoles(state) {
  const all = [...state.roles, ...state.customRoles];
  return all.filter(r => r.defaultIncluded && (r.defaultHeadcount ?? 0) >= 1);
}

// Multiplier-model burn over a given set of tools (subset of selectedTools).
function multiplierBurn(state, toolIds) {
  const cost = avgToolCost(state, toolIds);
  const tools = CALC.adoptionToolCount[state.adoptionLevel] ?? 1;
  return includedRoles(state).reduce((sum, r) => {
    const w = CALC.roleWeights[r.defaultWeight] ?? 1;
    return sum + r.defaultHeadcount * cost * tools * w;
  }, 0);
}

// Sum of real per-tool overrides (seats × cost/seat).
function overridesTotal(state) {
  const o = state.toolOverrides || {};
  return Object.values(o).reduce((s, v) => s + (Number(v.seats) || 0) * (Number(v.costPerSeat) || 0), 0);
}

// Computes estimated monthly team AI subscription burn.
export function calculateMonthlyBurn(state) {
  const overrideIds = Object.keys(state.toolOverrides || {});
  if (state.realCostsMode && overrideIds.length) {
    const allTools = [...state.selectedTools, ...state.customTools.map(t => t.id)];
    const remaining = allTools.filter(id => !overrideIds.includes(id));
    return overridesTotal(state) + (remaining.length ? multiplierBurn(state, remaining) : 0);
  }
  return multiplierBurn(state);
}

// Returns total headcount across all included roles.
function totalHeadcount(state) {
  return includedRoles(state).reduce((s, r) => s + r.defaultHeadcount, 0);
}

// Computes project AI cost as a low/mid/high range.
export function calculateProjectCost(state) {
  // Clamp to valid range — model responses can return values outside spec
  const adj = Math.min(2.5, Math.max(0.5, state.projectAnalysis?.adjustment_multiplier ?? 1.0));
  const base = totalHeadcount(state)
    * CALC.baseWeeklyPerPerson
    * (state.projectDurationWeeks ?? CALC.defaultDurationWeeks)
    * CALC.projectTypeMultiplier[state.projectType ?? "other"]
    * CALC.adoptionToolCount[state.adoptionLevel]
    * adj;
  const low = base * CALC.rangeMultipliers.low;
  const high = base * CALC.rangeMultipliers.high;
  return { low, mid: (low + high) / 2, high };
}

// Selects a contextual insight by evaluating combined signals in priority order.
export function selectInsight(state) {
  const ins = STRINGS.insights;
  const devs = state.roles.filter(r => ["frontend", "backend", "fullstack"].includes(r.id) && r.defaultIncluded).reduce((s, r) => s + r.defaultHeadcount, 0);
  const team = totalHeadcount(state);
  const power = [...state.roles, ...state.customRoles].some(r => r.defaultIncluded && r.defaultWeight === "poweruser");
  const heavyish = ["heavy", "allin"].includes(state.adoptionLevel);
  const fmt = (s) => s.replace("{team}", team).replace("{type}", STRINGS.step3.projectTypes[state.projectType] || "AI feature");
  // Priority 1: triple threat — all-in, many devs, AI feature.
  if (state.adoptionLevel === "allin" && devs > CALC.insightDevThreshold && state.projectType === "ai_feature") return fmt(ins.allin_ai_feature);
  // Priority 2: CMS migration with heavy/all-in adoption.
  if (state.projectType === "cms_migration" && heavyish) return ins.cms_heavy_adoption;
  // Priority 3: real costs already 30%+ above formula estimate.
  if (state.realCostsMode) {
    const real = overridesTotal(state);
    const mult = multiplierBurn(state);
    if (real > mult * 1.3) return ins.real_costs_higher;
  }
  // Priority 4: existing single-signal insights.
  if (state.adoptionLevel === "allin" && devs > CALC.insightDevThreshold) return ins.allin_devs;
  if (state.projectType === "cms_migration") return ins.cms_migration;
  if (state.projectType === "ai_feature") return ins.ai_feature;
  if (power) return ins.poweruser;
  if (state.selfHosted) return ins.self_hosted;
  if (state.adoptionLevel === "light" && team > CALC.insightTeamThreshold) return ins.under_adoption;
  if (state.projectType === "discovery") return ins.discovery;
  if (state.directApiUsage) return ins.direct_api;
  // Priority 5: fallback.
  return ins.fallback;
}

// Formats a number as a euro currency string.
export function formatCurrency(number) {
  return "€" + Math.round(number).toLocaleString("en-IE");
}

// Formats a low/high pair as a euro range string.
export function formatRange(low, high) {
  return formatCurrency(low) + " – " + formatCurrency(high);
}
