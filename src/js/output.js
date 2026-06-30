// output.js — renders the full Step 4 results view into #wizard-content.

import { STRINGS, CONFIG, CALC } from "./config.js";
import { formatCurrency, formatRange, selectInsight, monthlyBreakdown } from "./calculator.js";

// Returns included roles (default + custom) with a positive headcount.
function includedRoles(state) {
  return [...state.roles, ...state.customRoles].filter(r => r.defaultIncluded && (r.defaultHeadcount ?? 0) >= 1);
}

// Returns average tool cost for selected tools or chatgpt fallback.
function avgToolCost(state) {
  if (!state.selectedTools.length) return CALC.toolCosts.chatgpt;
  return state.selectedTools.reduce((s, id) => s + (CALC.toolCosts[id] ?? 0), 0) / state.selectedTools.length;
}

// Estimates monthly cost for one role. Seat burn = headcount × avg tool cost × role weight.
function roleMonthly(state, r) {
  return r.defaultHeadcount * avgToolCost(state) * (CALC.roleWeights[r.defaultWeight] ?? 1);
}

// Renders the full output view for Step 4.
export function renderOutput(state, estimate) {
  const c = document.getElementById("wizard-content");
  const roles = includedRoles(state);
  const totalPeople = roles.reduce((s, r) => s + r.defaultHeadcount, 0);
  const maxRole = Math.max(1, ...roles.map(r => roleMonthly(state, r)));
  const o = STRINGS.output;
  const infra = state.selfHosted ? (Number(state.selfHostedMonthlyCost) || 0) : 0;
  const mb = monthlyBreakdown(state);
  const printDate = new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  // Number-aware "Cebula says" headline — leads with the user's own figures.
  const sub = (str, map) => Object.entries(map).reduce((s, [k, v]) => s.split(`{${k}}`).join(v), str);
  const variablePct = mb.total > 0 ? Math.round((mb.variable / mb.total) * 100) : 0;
  const powerRoles = roles.filter(r => r.defaultWeight === "poweruser");
  const powerHeads = powerRoles.reduce((s, r) => s + r.defaultHeadcount, 0);
  const powerBurn = powerRoles.reduce((s, r) => s + roleMonthly(state, r), 0);
  const powerPct = mb.seats > 0 ? Math.round((powerBurn / mb.seats) * 100) : 0;
  let smartInsight;
  if (mb.variable > 0 && variablePct >= 20) {
    smartInsight = sub(o.insightVariable, { variable: formatCurrency(mb.variable), total: formatCurrency(mb.total), pct: variablePct });
  } else if (powerHeads > 0 && powerPct >= 30) {
    smartInsight = sub(o.insightPower, { amount: formatCurrency(powerBurn), n: powerHeads, seats: powerHeads > 1 ? "seats" : "seat", pct: powerPct });
  } else {
    smartInsight = sub(o.insightAnnual, { annual: formatCurrency(mb.annual), project: formatCurrency(estimate.project.mid) });
  }
  const infraBreakdownRow = infra > 0 ? `<tr><td class="py-1">${o.selfHostedRow}</td><td class="text-right">—</td><td class="text-right">—</td><td class="text-right">${formatCurrency(infra)}</td></tr>` : "";
  const infraFormulaRow = infra > 0 ? `<tr><td class="py-1">${o.selfHostedRow}</td><td class="text-right">—</td><td class="text-right">—</td><td class="text-right">—</td><td class="text-right">${formatCurrency(infra)}</td></tr>` : "";

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
  const adoptMult = CALC.adoptionToolCount[state.adoptionLevel] ?? 1;
  const typeMult = CALC.projectTypeMultiplier[state.projectType ?? "other"];
  const aiAdj = Math.min(2.5, Math.max(0.5, state.projectAnalysis?.adjustment_multiplier ?? 1.0));
  const adjSource = state.projectAnalysis?.source === "local" ? "from your brief"
    : state.projectAnalysis?.adjustment_multiplier ? "AI brief analysis"
    : "no brief";

  const formulaBurnRows = roles.map(r =>
    `<tr><td class="py-1">${r.name}</td><td class="text-right">${r.defaultHeadcount}</td><td class="text-right">${formatCurrency(avgToolCost(state))}</td><td class="text-right">${CALC.roleWeights[r.defaultWeight] ?? 1}×</td><td class="text-right">${formatCurrency(roleMonthly(state, r))}</td></tr>`).join("");
  const formulaBurn = `<table class="w-full text-sm"><thead><tr class="text-secondary"><th class="text-left">${o.fRole}</th><th class="text-right">${o.fPeople}</th><th class="text-right">${o.fBasis}</th><th class="text-right">${o.fWeight}</th><th class="text-right">${o.fMonthly}</th></tr></thead><tbody>${formulaBurnRows}${infraFormulaRow}<tr class="font-semibold"><td class="py-1">${o.fTotal}</td><td></td><td></td><td></td><td class="text-right">${formatCurrency(estimate.monthlyBurn)}</td></tr></tbody></table>`;
  const formulaProject = `<table class="w-full text-sm"><thead><tr class="text-secondary"><th class="text-left">${o.fInput}</th><th class="text-right">${o.fValue}</th></tr></thead><tbody>
    <tr><td>${o.fTeamSize}</td><td class="text-right">${totalPeople} people</td></tr>
    <tr><td>${o.fDuration}</td><td class="text-right">${state.projectDurationWeeks ?? CALC.defaultDurationWeeks} weeks</td></tr>
    <tr><td>${o.fBaseRate}</td><td class="text-right">€${state.baseWeeklyPerPerson ?? CALC.baseWeeklyPerPerson}/person/week</td></tr>
    <tr><td>${o.fTypeMult}</td><td class="text-right">${typeMult}× (${typeLabel})</td></tr>
    <tr><td>${o.fAdoptMult}</td><td class="text-right">${adoptMult}× (${STRINGS.step2.adoption[state.adoptionLevel]?.name || state.adoptionLevel})</td></tr>
    <tr><td>${o.fAiAdjust}</td><td class="text-right">${aiAdj}× (${adjSource})</td></tr>
    <tr class="font-semibold"><td>${o.fRange}</td><td class="text-right">${formatRange(estimate.project.low, estimate.project.high)}</td></tr>
  </tbody></table>`;
  const formula = `<div class="card mt-4 mb-4"><button id="toggle-formula" class="btn-ghost text-sm">${o.showFormula}</button><div id="formula" class="hidden mt-3"><h3 class="text-sm text-secondary mb-2">${o.formulaBurnTitle}</h3>${formulaBurn}<h3 class="text-sm text-secondary mt-4 mb-2">${o.formulaProjectTitle}</h3>${formulaProject}<p class="text-secondary text-xs mt-3">${o.formulaNote}</p></div></div>`;

  c.innerHTML = `
    <div class="print-only print-header">
      <img class="print-logo" src="../assets/logo-calculator.png" alt="Cebula AI Cost Calculator" />
      <div class="print-meta">
        <p class="print-meta-title">${o.printTitle}</p>
        <p class="print-meta-sub">${o.printPreparedFor.replace("{team}", state.teamName || "your team")}${state.projectName ? " · " + state.projectName : ""}</p>
        <p class="print-meta-date">${printDate}</p>
      </div>
    </div>
    <h2 class="text-xl font-semibold mb-1">${STRINGS.step4.title}</h2>
    <p class="text-secondary mb-5">${STRINGS.step4.subtitle}</p>
    <div class="card mb-4">
      <p class="text-secondary text-sm">${o.burnTitle}</p>
      <p class="text-4xl font-bold accent">${formatCurrency(estimate.monthlyBurn)}<span class="text-lg text-secondary font-normal"> ${o.perMonth}</span></p>
      <p class="text-secondary text-sm mb-3">${o.annualLine.replace("{annual}", formatCurrency(mb.annual))}</p>
      <div class="split mb-3">
        <div class="split-cell"><span class="split-label">${o.splitFixedLabel} <em class="split-tag">${o.splitFixedTag}</em></span><strong>${formatCurrency(mb.seats)}<span class="split-per"> ${o.perMonth}</span></strong></div>
        <div class="split-cell"><span class="split-label">${o.splitVariableLabel} <em class="split-tag">${o.splitVariableTag}</em></span><strong>${formatCurrency(mb.variable)}<span class="split-per"> ${o.perMonth}</span></strong></div>
      </div>
      <p class="text-secondary text-xs mb-3">${o.splitHint}</p>
      <button id="toggle-breakdown" class="btn-ghost text-sm">${o.breakdownToggle}</button>
      <div id="breakdown" class="hidden mt-3"><table class="w-full text-sm">
        <thead><tr class="text-secondary"><th class="text-left">${o.colRole}</th><th class="text-right">${o.colHeadcount}</th><th class="text-right">${o.colWeight}</th><th class="text-right">${o.colMonthly}</th></tr></thead>
        <tbody>${breakdownRows}${infraBreakdownRow}</tbody></table></div>
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
    <div class="card insight mb-4"><p class="text-sm text-secondary mb-1">${o.insightLabel}</p><p>${smartInsight}</p><p class="text-secondary text-sm mt-2">${selectInsight(state)}</p></div>
    <div class="card mb-4" id="export-card">
      <h3 class="font-semibold mb-2">${o.exportTitle}</h3>
      <p class="text-secondary text-sm mb-3">${o.exportSubtitle}</p>
      <div class="action-row"><button id="dl-csv" class="btn-primary">${o.exportCsv}</button><button id="dl-pdf" class="btn-ghost">${o.exportPdf}</button></div>
    </div>
    <div class="card" id="email-card">
      <h3 class="font-semibold accent mb-1">${o.waitlistTitle}</h3>
      <p class="text-secondary text-sm mb-3">${o.waitlistBody}</p>
      <form id="lead-form" name="${CONFIG.netlifyFormName}" method="POST" action="${CONFIG.netlifyFormAction}" data-netlify="true">
        <input type="hidden" name="form-name" value="${CONFIG.netlifyFormName}" />
        <input type="hidden" name="team_name" value="${state.teamName}" />
        <input type="hidden" name="project_name" value="${state.projectName}" />
        <input type="hidden" name="estimate_low" value="${Math.round(estimate.project.low)}" />
        <input type="hidden" name="estimate_high" value="${Math.round(estimate.project.high)}" />
        <input type="hidden" name="adoption_level" value="${state.adoptionLevel}" />
        <div class="form-row"><input type="email" name="email" required placeholder="${o.emailPlaceholder}" class="input" /><button type="submit" class="btn-primary">${o.emailSubmit}</button></div>
        <p class="error hidden mt-2" id="email-error">${STRINGS.errors.emailFailed}</p>
        <p class="text-secondary text-xs mt-2">${o.emailSmallprint}</p>
      </form>
    </div>
    ${formula}
    <div class="print-only print-footer">${o.printFooter}</div>
    <div class="restart-wrap"><button id="restart" class="btn-ghost">${STRINGS.nav.restart}</button><p class="text-secondary text-xs mt-2">Your estimate is not saved — export it before restarting</p></div>`;

  const csvEscape = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const buildCSV = () => {
    const rows = [
      ["Cebula AI Cost Estimate"],
      ["Team", state.teamName || "—"],
      ["Project", state.projectName || "—"],
      ["Project type", typeLabel],
      ["Duration (weeks)", state.projectDurationWeeks ?? CALC.defaultDurationWeeks],
      ["People", totalPeople],
      [],
      ["Monthly team AI cost (EUR)", Math.round(estimate.monthlyBurn)],
      ["Annual team AI cost (EUR)", Math.round(mb.annual)],
      ["  Seats & subscriptions / month (fixed)", Math.round(mb.seats)],
      ["  API & infra usage / month (variable)", Math.round(mb.variable)],
      [],
      ["Role breakdown"],
      ["Role", "People", "Usage", "Monthly (EUR)"],
      ...roles.map(r => [r.name, r.defaultHeadcount, STRINGS.step1.weights[r.defaultWeight] || r.defaultWeight, Math.round(roleMonthly(state, r))]),
    ];
    if (infra > 0) rows.push([o.selfHostedRow, "—", "—", Math.round(infra)]);
    rows.push([], ["Project AI cost (EUR)"], ["Low", "Mid", "High"], [Math.round(estimate.project.low), Math.round(estimate.project.mid), Math.round(estimate.project.high)]);
    rows.push([], ["Assumptions"],
      ["Base rate (EUR/person/week)", state.baseWeeklyPerPerson ?? CALC.baseWeeklyPerPerson],
      ["Adoption", STRINGS.step2.adoption[state.adoptionLevel]?.name || state.adoptionLevel],
      ["Project type multiplier", typeMult],
      ["Adoption multiplier", adoptMult],
      ["AI adjustment", aiAdj + " (" + adjSource + ")"]);
    return rows.map(r => r.map(csvEscape).join(",")).join("\n");
  };
  const slug = (state.projectName || "cebula-estimate").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "cebula-estimate";
  document.getElementById("dl-csv").addEventListener("click", () => {
    const blob = new Blob(["\ufeff" + buildCSV()], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = slug + "-ai-cost.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  document.getElementById("dl-pdf").addEventListener("click", () => {
    document.getElementById("breakdown")?.classList.remove("hidden");
    document.getElementById("formula")?.classList.remove("hidden");
    window.print();
  });

  document.getElementById("toggle-breakdown").addEventListener("click", (e) => {
    const b = document.getElementById("breakdown");
    b.classList.toggle("hidden");
    e.target.textContent = b.classList.contains("hidden") ? o.breakdownToggle : o.breakdownHide;
  });
  document.getElementById("toggle-formula").addEventListener("click", (e) => {
    const f = document.getElementById("formula");
    f.classList.toggle("hidden");
    e.target.textContent = f.classList.contains("hidden") ? o.showFormula : o.hideFormula;
  });

  const form = document.getElementById("lead-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = document.getElementById("email-error");
    const body = new URLSearchParams(new FormData(form)).toString();
    try {
      const res = await fetch(form.action, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error();
      form.parentElement.innerHTML = `<p class="accent">${o.emailConfirm}</p>`;
    } catch (e2) {
      err.classList.remove("hidden");
    }
  });
}
