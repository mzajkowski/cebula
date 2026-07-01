// calculator.js — formula-based cost estimation and insight selection.

// Optional AI parsing (api.js) falls back to local formula-only analysis when no
// OpenRouter key is present. Keep commercial packaging out of the client code.

import { CALC, STRINGS, CURRENCY } from "./config.js";

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
// Seat burn is driven by per-role weight only; team-wide adoption drives the
// project token estimate instead, so the two knobs no longer compound here.
function multiplierBurn(state, toolIds) {
  const cost = avgToolCost(state, toolIds);
  return includedRoles(state).reduce((sum, r) => {
    const w = CALC.roleWeights[r.defaultWeight] ?? 1;
    return sum + r.defaultHeadcount * cost * w;
  }, 0);
}

// Sum of real per-tool overrides (seats × cost/seat).
function overridesTotal(state) {
  const o = state.toolOverrides || {};
  return Object.values(o).reduce((s, v) => s + (Number(v.seats) || 0) * (Number(v.costPerSeat) || 0), 0);
}

// Fixed seat-subscription burn (real overrides where given, modeled elsewhere).
function seatsCost(state) {
  const overrideIds = Object.keys(state.toolOverrides || {});
  if (state.realCostsMode && overrideIds.length) {
    const allTools = [...state.selectedTools, ...state.customTools.map(t => t.id)];
    const remaining = allTools.filter(id => !overrideIds.includes(id));
    return overridesTotal(state) + (remaining.length ? multiplierBurn(state, remaining) : 0);
  }
  return multiplierBurn(state);
}

// Variable monthly usage cost from direct-API tokens. Zero unless the user opted in.
function usageCost(state) {
  if (!state.directApiUsage) return 0;
  const tokens = Number(state.estimatedTokensPerMonth) || 0;
  return (tokens / 1_000_000) * CALC.tokenPricePerMillion;
}

// Splits the monthly burn into fixed (seats) vs variable (API usage + self-hosted infra).
export function monthlyBreakdown(state) {
  const seats = seatsCost(state);
  const usage = usageCost(state);
  const infra = state.selfHosted ? (Number(state.selfHostedMonthlyCost) || 0) : 0;
  const variable = usage + infra;
  const total = seats + variable;
  return { seats, usage, infra, variable, total, annual: total * 12 };
}

// Computes estimated monthly team AI subscription burn.
export function calculateMonthlyBurn(state) {
  return monthlyBreakdown(state).total;
}

// Returns total headcount across all included roles.
function totalHeadcount(state) {
  return includedRoles(state).reduce((s, r) => s + r.defaultHeadcount, 0);
}

// Keyword-based local brief analysis. Runs entirely client-side, no API key.
// Returns { adjustment_multiplier, key_risk_flags, source } or null for thin input.
export function analyzeBriefLocally(text) {
  const raw = (text || "").trim();
  if (raw.length < 25) return null;
  const t = raw.toLowerCase();
  const has = (words) => words.filter(w => t.includes(w));

  // Signals that push token usage above a baseline medium project.
  const aiHits = has(["ai ", "llm", "gpt", " rag", "chatbot", "agent", "embedding", "generative", "machine learning", "ml model", "nlp", "computer vision", "recommendation"]);
  // Signals that add complexity (and therefore tool/usage intensity).
  const complexHits = has(["migration", "legacy", "integration", "real-time", "realtime", "compliance", "hipaa", "gdpr", "soc2", "scale", "distributed", "microservice", "multi-tenant", "high availability"]);
  // Signals that the scope is genuinely small.
  const simpleHits = has(["landing page", "brochure", "prototype", "poc", "proof of concept", "mvp", "static site", "single page", "simple site"]);

  let mult = 1.0;
  mult += Math.min(aiHits.length, 4) * 0.18;      // AI-heavy work burns the most tokens
  mult += Math.min(complexHits.length, 4) * 0.10; // complexity raises usage
  mult -= Math.min(simpleHits.length, 3) * 0.12;  // light scope spends less
  mult = Math.min(2.5, Math.max(0.5, Number(mult.toFixed(2))));

  const flags = [];
  if (aiHits.length) flags.push("AI/LLM features drive token usage up");
  if (complexHits.length) flags.push("Complexity signals: " + complexHits.slice(0, 2).map(s => s.trim()).join(", "));
  if (simpleHits.length && !aiHits.length) flags.push("Scope reads light — costs may run lower");
  if (/asap|urgent|tight deadline|aggressive timeline/.test(t)) flags.push("Tight timeline — expect heavier tool reliance");

  return { adjustment_multiplier: mult, key_risk_flags: flags.slice(0, 3), source: "local" };
}

// Computes project AI cost as a low/mid/high range.
export function calculateProjectCost(state) {
  // Clamp to valid range — model responses can return values outside spec
  const adj = Math.min(2.5, Math.max(0.5, state.projectAnalysis?.adjustment_multiplier ?? 1.0));
  const base = totalHeadcount(state)
    * (state.baseWeeklyPerPerson ?? CALC.baseWeeklyPerPerson)
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

// Formats a number as a currency string for the active CURRENCY config.
export function formatCurrency(number) {
  return new Intl.NumberFormat(CURRENCY.locale, {
    style: "currency",
    currency: CURRENCY.code,
    maximumFractionDigits: 0,
  }).format(Math.round(number));
}

// Formats a currency amount followed by a unit suffix, e.g. "$38/person/week".
export function formatCurrencyUnit(number, unit) {
  return formatCurrency(number) + unit;
}

// Formats a low/high pair as a currency range string.
export function formatRange(low, high) {
  return formatCurrency(low) + " – " + formatCurrency(high);
}
