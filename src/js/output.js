// output.js — renders the full Step 4 results view into #wizard-content.

import { STRINGS, CONFIG, CALC } from "./config.js";
import { formatCurrency, formatRange, selectInsight } from "./calculator.js";

// Returns included roles (default + custom) with a positive headcount.
function includedRoles(state) {
  return [...state.roles, ...state.customRoles].filter(r => r.defaultIncluded && (r.defaultHeadcount ?? 0) >= 1);
}

// Returns average tool cost for selected tools or chatgpt fallback.
function avgToolCost(state) {
  if (!state.selectedTools.length) return CALC.toolCosts.chatgpt;
  return state.selectedTools.reduce((s, id) => s + (CALC.toolCosts[id] ?? 0), 0) / state.selectedTools.length;
}

// Estimates monthly cost for one role.
function roleMonthly(state, r) {
  return r.defaultHeadcount * avgToolCost(state) * CALC.adoptionToolCount[state.adoptionLevel] * (CALC.roleWeights[r.defaultWeight] ?? 1);
}

// Renders the full output view for Step 4.
export function renderOutput(state, estimate) {
  const c = document.getElementById("wizard-content");
  const roles = includedRoles(state);
  const totalPeople = roles.reduce((s, r) => s + r.defaultHeadcount, 0);
  const maxRole = Math.max(1, ...roles.map(r => roleMonthly(state, r)));
  const o = STRINGS.output;

  const breakdownRows = roles.map(r =>
    `<tr><td class="py-1">${r.name}</td><td class="text-right">${r.defaultHeadcount}</td><td class="text-right">${STRINGS.step1.weights[r.defaultWeight] || r.defaultWeight}</td><td class="text-right">${formatCurrency(roleMonthly(state, r))}</td></tr>`).join("");

  const chartRows = roles.map(r => {
    const m = roleMonthly(state, r);
    const pct = Math.round((m / maxRole) * 100);
    return `<div class="chart-row"><span class="chart-label">${r.name}</span><span class="chart-bar"><span class="chart-fill" style="width:${pct}%"></span></span><span class="chart-amt">${formatCurrency(m)}</span></div>`;
  }).join("");

  const flags = state.projectAnalysis?.key_risk_flags;
  const risk = Array.isArray(flags) && flags.length
    ? `<div class="card mt-4"><h3 class="text-sm text-secondary mb-2">${o.riskTitle}</h3>${flags.map(f => `<span class="risk-pill">⚠️ ${f}</span>`).join("")}</div>` : "";

  const typeLabel = STRINGS.step3.projectTypes[state.projectType] || state.projectType || "—";

  c.innerHTML = `
    <h2 class="text-xl font-semibold mb-1">${STRINGS.step4.title}</h2>
    <p class="text-secondary mb-5">${STRINGS.step4.subtitle}</p>
    <div class="card mb-4">
      <p class="text-secondary text-sm">${o.burnTitle}</p>
      <p class="text-4xl font-bold accent">${formatCurrency(estimate.monthlyBurn)}</p>
      <p class="text-secondary text-sm mb-3">${o.burnSubtitle}</p>
      <button id="toggle-breakdown" class="btn-ghost text-sm">${o.breakdownToggle}</button>
      <div id="breakdown" class="hidden mt-3"><table class="w-full text-sm">
        <thead><tr class="text-secondary"><th class="text-left">${o.colRole}</th><th class="text-right">${o.colHeadcount}</th><th class="text-right">${o.colWeight}</th><th class="text-right">${o.colMonthly}</th></tr></thead>
        <tbody>${breakdownRows}</tbody></table></div>
    </div>
    <div class="card mb-4">
      <p class="text-secondary text-sm">${o.projectTitle}</p>
      <p class="text-4xl font-bold">${formatCurrency(estimate.project.mid)}</p>
      <p class="text-secondary">${formatRange(estimate.project.low, estimate.project.high)}</p>
      <p class="text-sm mt-2">${o.projectFor.replace("{name}", state.projectName || "—").replace("{type}", typeLabel)}</p>
      <p class="text-secondary text-sm">${o.projectDuration.replace("{weeks}", state.projectDurationWeeks ?? 8).replace("{people}", totalPeople)}</p>
    </div>
    <div class="card mb-4"><h3 class="text-sm text-secondary mb-3">${o.chartTitle}</h3>${chartRows}</div>
    ${risk}
    <div class="card insight mb-4"><p class="text-sm text-secondary mb-1">${o.insightLabel}</p><p>${selectInsight(state)}</p></div>
    <div class="card pro mb-4"><h3 class="font-semibold accent">${o.proTitle}</h3><p class="text-secondary text-sm my-2">${o.proBody}</p><button id="waitlist" class="btn-ghost text-sm">${o.proCta}</button></div>
    <div class="card" id="email-card">
      <h3 class="font-semibold mb-2">${o.emailTitle}</h3>
      <form id="lead-form" name="${CONFIG.netlifyFormName}" data-netlify="true">
        <input type="hidden" name="form-name" value="${CONFIG.netlifyFormName}" />
        <input type="hidden" name="team_name" value="${state.teamName}" />
        <input type="hidden" name="project_name" value="${state.projectName}" />
        <input type="hidden" name="estimate_low" value="${Math.round(estimate.project.low)}" />
        <input type="hidden" name="estimate_high" value="${Math.round(estimate.project.high)}" />
        <input type="hidden" name="adoption_level" value="${state.adoptionLevel}" />
        <div class="flex gap-2"><input type="email" name="email" required placeholder="${o.emailPlaceholder}" class="input flex-1" /><button type="submit" class="btn-primary">${o.emailSubmit}</button></div>
        <p class="error hidden mt-2" id="email-error">${STRINGS.errors.emailFailed}</p>
        <p class="text-secondary text-xs mt-2">${o.emailSmallprint}</p>
      </form>
    </div>`;

  document.getElementById("toggle-breakdown").addEventListener("click", (e) => {
    const b = document.getElementById("breakdown");
    b.classList.toggle("hidden");
    e.target.textContent = b.classList.contains("hidden") ? o.breakdownToggle : o.breakdownHide;
  });
  document.getElementById("waitlist").addEventListener("click", () => document.getElementById("email-card").scrollIntoView({ behavior: "smooth" }));

  const form = document.getElementById("lead-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("email-error");
    const body = new URLSearchParams(new FormData(form)).toString();
    try {
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error();
      form.parentElement.innerHTML = `<p class="accent">${o.emailConfirm}</p>`;
    } catch (e2) {
      err.classList.remove("hidden");
    }
  });
}
