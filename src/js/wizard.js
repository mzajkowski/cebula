// wizard.js — controls step rendering, navigation, and validation.

import { STRINGS, CALC } from "./config.js";
import { getState, updateState, resetState } from "./state.js";
import { calculateMonthlyBurn, calculateProjectCost, analyzeBriefLocally } from "./calculator.js";
import { renderOutput } from "./output.js";

const TOTAL = 4;
let validationError = "";

// Escapes a value for safe HTML attribute insertion.
function esc(s) { return String(s).replace(/"/g, "&quot;").replace(/</g, "&lt;"); }


// Updates the progress bar width and step indicator text.
export function updateProgress(n) {
  document.getElementById("progress-fill").style.width = (n / TOTAL * 100) + "%";
  document.getElementById("step-indicator").textContent = STRINGS.nav.stepIndicator.replace("{n}", n).replace("{total}", TOTAL).replace("{label}", STRINGS.nav.steps[n - 1]);
}

// Renders navigation buttons for a step.
function navHtml(n) {
  const back = n > 1 ? `<button id="prev" class="btn-ghost">${STRINGS.nav.back}</button>` : "<span></span>";
  const next = n < TOTAL ? `<button id="next" class="btn-primary">${n === TOTAL - 1 ? STRINGS.nav.finish : STRINGS.nav.next}</button>` : `<button id="restart" class="btn-ghost">${STRINGS.nav.restart}</button>`;
  const err = validationError ? `<p class="error mt-2">${validationError}</p>` : "";
  return `${err}<div class="nav-row mt-6">${back}${next}</div>`;
}

// Clears content and renders step n, then wires navigation.
export function renderStep(n) {
  const c = document.getElementById("wizard-content");
  c.classList.remove("fade-in");
  if (n === 1) c.innerHTML = step1();
  else if (n === 2) c.innerHTML = step2();
  else if (n === 3) c.innerHTML = step3();
  else if (n === 4) { c.innerHTML = ""; const s = getState(); if (!s.projectAnalysis && (s.projectBrief || s.uploadedFileText)) { const local = analyzeBriefLocally(s.projectBrief || s.uploadedFileText); if (local) updateState("projectAnalysis", local); } const s2 = getState(); const monthlyBurn = calculateMonthlyBurn(s2); const project = calculateProjectCost(s2); updateState("estimate", { monthlyBurn, project }); renderOutput(getState(), getState().estimate); }
  if (n < 4) c.innerHTML += navHtml(n);
  void c.offsetWidth; c.classList.add("fade-in");
  if (n === 1) wire1(); else if (n === 2) wire2(); else if (n === 3) wire3();
  const prev = document.getElementById("prev"); if (prev) prev.addEventListener("click", prevStep);
  const next = document.getElementById("next"); if (next) next.addEventListener("click", nextStep);
  const restart = document.getElementById("restart"); if (restart) restart.addEventListener("click", () => { resetState(); updateProgress(1); renderStep(1); });
}

// Validates and advances to the next step.
export function nextStep() {
  const s = getState();
  validationError = validate(s.currentStep, s);
  if (validationError) { renderStep(s.currentStep); return; }
  validationError = "";
  const n = s.currentStep + 1; updateState("currentStep", n); renderStep(n); updateProgress(n);
}

// Returns to the previous step.
export function prevStep() {
  validationError = "";
  const n = getState().currentStep - 1; updateState("currentStep", n); renderStep(n); updateProgress(n);
}

// Returns an error string or empty if the step is valid.
function validate(n, s) {
  if (n === 1) return [...s.roles, ...s.customRoles].some(r => r.defaultIncluded && r.defaultHeadcount >= 1) ? "" : STRINGS.errors.noRole;
  if (n === 2) return (s.selectedTools.length || s.customTools.length) ? "" : STRINGS.errors.noTool;
  if (n === 3) { if (!s.projectName.trim()) return STRINGS.errors.noProjectName; if (!s.projectType) return STRINGS.errors.noProjectType; }
  return "";
}

// ---- Step 1 ----
function step1() {
  const s = getState(), t = STRINGS.step1;
  const opts = w => Object.entries(t.weights).map(([k, v]) => `<option value="${k}" ${w === k ? "selected" : ""}>${v}</option>`).join("");
  const rows = s.roles.map((r, i) => roleRow(r, i, false, opts)).join("");
  const custom = s.customRoles.map((r, i) => roleRow(r, i, true, opts)).join("");
  return `<h2 class="text-xl font-semibold mb-1">${t.title}</h2><p class="text-secondary mb-5">${t.subtitle}</p>
  <label class="block text-sm mb-1">${t.teamNameLabel}</label><input id="team" class="input w-full mb-5" value="${esc(s.teamName)}" placeholder="${t.teamNamePlaceholder}"/>
  <h3 class="text-sm text-secondary mb-2">${t.rolesHeader}</h3>
  <div class="role-head"><span>${t.colInclude}</span><span>${t.colRole}</span><span>${t.colHeadcount}</span><span>${t.colWeight}</span></div>
  <div id="roles">${rows}${custom}</div>
  <button id="add-role" class="btn-ghost text-sm mt-2">${t.addRole}</button>
  <details class="mt-5"><summary>${t.advancedToggle}</summary><div class="mt-3"><label class="block text-sm mb-2">${t.selfHostedLabel}</label>${t.selfHostedOptions.map(o => `<label class="chk"><input type="checkbox" class="sh" value="${o}" ${s.selfHostedOptions.includes(o) ? "checked" : ""}/> ${o}</label>`).join("")}</div></details>`;
}
// Builds one role row, default or custom.
function roleRow(r, i, custom, opts) {
  const name = custom ? `<input class="input rname" data-i="${i}" value="${esc(r.name)}" placeholder="${STRINGS.step1.customRolePlaceholder}"/>` : `<span>${r.name}</span>`;
  return `<div class="role-row" data-i="${i}" data-c="${custom}"><input type="checkbox" class="rinc" ${r.defaultIncluded ? "checked" : ""}/>${name}<input type="number" min="0" class="input rhc" value="${r.defaultHeadcount}"/><select class="input rwt">${opts(r.defaultWeight)}</select>${custom ? '<button class="rrm">✕</button>' : ""}</div>`;
}
function wire1() {
  document.getElementById("team").addEventListener("input", e => updateState("teamName", e.target.value));
  const read = () => {
    const s = getState();
    document.querySelectorAll("#roles .role-row").forEach(row => {
      const i = +row.dataset.i, c = row.dataset.c === "true", arr = c ? s.customRoles : s.roles;
      arr[i].defaultIncluded = row.querySelector(".rinc").checked;
      arr[i].defaultHeadcount = +row.querySelector(".rhc").value || 0;
      arr[i].defaultWeight = row.querySelector(".rwt").value;
      if (c) arr[i].name = row.querySelector(".rname").value;
    });
    updateState("roles", s.roles); updateState("customRoles", s.customRoles);
  };
  document.getElementById("roles").addEventListener("change", read);
  document.getElementById("roles").addEventListener("input", read);
  document.getElementById("add-role").addEventListener("click", () => { const s = getState(); s.customRoles.push({ id: "c" + Date.now(), name: "", defaultWeight: "moderate", defaultIncluded: true, defaultHeadcount: 1 }); updateState("customRoles", s.customRoles); renderStep(1); });
  document.querySelectorAll(".rrm").forEach(b => b.addEventListener("click", e => { const i = +e.target.closest(".role-row").dataset.i; const s = getState(); s.customRoles.splice(i, 1); updateState("customRoles", s.customRoles); renderStep(1); }));
  document.querySelectorAll(".sh").forEach(cb => cb.addEventListener("change", () => { const v = [...document.querySelectorAll(".sh:checked")].map(x => x.value); updateState("selfHostedOptions", v); updateState("selfHosted", v.length > 0); }));
}

// ---- Step 2 ----
function step2() {
  const s = getState(), t = STRINGS.step2;
  const headcount = [...s.roles, ...s.customRoles].filter(r => r.defaultIncluded).reduce((n, r) => n + (r.defaultHeadcount || 0), 0) || 1;
  const ov = (id, seed) => {
    if (!s.realCostsMode) return "";
    const o = s.toolOverrides[id] || { seats: headcount, costPerSeat: seed };
    return `<div class="override"><label>${t.seatsLabel}<input type="number" min="1" class="input ov-seats" data-id="${id}" value="${o.seats}" placeholder="${t.seatsPlaceholder}"/></label><label>${t.costPerSeatLabel}<input type="number" min="0" class="input ov-cost" data-id="${id}" value="${o.costPerSeat}" placeholder="${t.costPerSeatPlaceholder}"/></label></div>`;
  };
  const cards = CALC.tools.map(tl => `<div class="tool-card ${s.selectedTools.includes(tl.id) ? "sel" : ""}" data-id="${tl.id}">${tl.name}<small>€${tl.defaultCost}</small>${s.selectedTools.includes(tl.id) ? ov(tl.id, tl.defaultCost) : ""}</div>`).join("");
  const custom = s.customTools.map(tl => `<div class="tool-card sel">${esc(tl.name)}${ov(tl.id, CALC.toolCosts.chatgpt)}</div>`).join("");
  const adopt = Object.entries(t.adoption).map(([k, v]) => `<label class="adopt ${s.adoptionLevel === k ? "sel" : ""}"><input type="radio" name="adopt" value="${k}" ${s.adoptionLevel === k ? "checked" : ""}/><strong>${v.name}</strong><span class="text-secondary text-sm">${v.desc}</span></label>`).join("");
  return `<h2 class="text-xl font-semibold mb-1">${t.title}</h2><p class="text-secondary mb-5">${t.subtitle}</p>
  <h3 class="text-sm text-secondary mb-2">${t.toolsHeader}</h3><div class="tool-grid">${cards}${custom}</div>
  <div class="flex gap-2 mt-3"><input id="ct" class="input flex-1" placeholder="${t.addToolPlaceholder}"/><button id="ct-add" class="btn-ghost">${t.addTool}</button></div>
  <label class="chk mt-3"><input type="checkbox" id="realcosts" ${s.realCostsMode ? "checked" : ""}/> ${t.realCostsToggle}</label><p class="text-secondary text-sm">${t.realCostsHint}</p>
  <h3 class="text-sm text-secondary mt-6 mb-2">${t.adoptionHeader}</h3><div class="adopt-grid">${adopt}</div>
  <details class="mt-5"><summary>${t.advancedToggle}</summary><div class="mt-3"><label class="chk"><input type="checkbox" id="dapi" ${s.directApiUsage ? "checked" : ""}/> ${t.directApiLabel}</label><div id="tok" class="${s.directApiUsage ? "" : "hidden"} mt-2"><label class="block text-sm mb-1">${t.tokensLabel}</label><input id="tokens" type="number" class="input w-full" value="${s.estimatedTokensPerMonth ?? ""}" placeholder="${t.tokensPlaceholder}"/></div></div></details>`;
}
function wire2() {
  document.querySelectorAll(".tool-card[data-id]").forEach(c => c.addEventListener("click", e => { if (e.target.closest(".override")) return; const s = getState(); const id = c.dataset.id; const i = s.selectedTools.indexOf(id); if (i >= 0) { s.selectedTools.splice(i, 1); delete s.toolOverrides[id]; } else s.selectedTools.push(id); updateState("selectedTools", s.selectedTools); updateState("toolOverrides", s.toolOverrides); renderStep(2); }));
  document.getElementById("ct-add").addEventListener("click", () => { const v = document.getElementById("ct").value.trim(); if (!v) return; const s = getState(); s.customTools.push({ id: "ct" + Date.now(), name: v }); updateState("customTools", s.customTools); renderStep(2); });
  document.querySelectorAll('input[name=adopt]').forEach(r => r.addEventListener("change", () => { updateState("adoptionLevel", r.value); renderStep(2); }));
  document.getElementById("realcosts").addEventListener("change", e => { updateState("realCostsMode", e.target.checked); renderStep(2); });
  const writeOverride = (id) => { const s = getState(); const seats = +(document.querySelector(`.ov-seats[data-id="${id}"]`)?.value) || 0; const cost = +(document.querySelector(`.ov-cost[data-id="${id}"]`)?.value) || 0; s.toolOverrides[id] = { seats, costPerSeat: cost }; updateState("toolOverrides", s.toolOverrides); };
  document.querySelectorAll(".ov-seats, .ov-cost").forEach(el => el.addEventListener("input", () => writeOverride(el.dataset.id)));
  document.getElementById("dapi").addEventListener("change", e => { updateState("directApiUsage", e.target.checked); document.getElementById("tok").classList.toggle("hidden", !e.target.checked); });
  const tk = document.getElementById("tokens"); if (tk) tk.addEventListener("input", e => updateState("estimatedTokensPerMonth", +e.target.value || null));
}

// ---- Step 3 ----
function step3() {
  const s = getState(), t = STRINGS.step3;
  const types = Object.entries(t.projectTypes).map(([k, v]) => `<button class="seg ${s.projectType === k ? "sel" : ""}" data-t="${k}">${v}</button>`).join("");
  return `<h2 class="text-xl font-semibold mb-1">${t.title}</h2><p class="text-secondary mb-5">${t.subtitle}</p>
  <label class="block text-sm mb-1">${t.projectNameLabel}</label><input id="pname" class="input w-full mb-4" value="${esc(s.projectName)}" placeholder="${t.projectNamePlaceholder}"/>
  <label class="block text-sm mb-1">${t.projectTypeLabel}</label><div class="seg-grid mb-4">${types}</div>
  <label class="block text-sm mb-1">${t.durationLabel}</label><input id="dur" type="number" min="1" max="104" class="input w-full mb-4" value="${s.projectDurationWeeks}"/>
  <label class="block text-sm mb-1">${t.briefLabel}</label><textarea id="brief" class="input w-full mb-4" rows="4" placeholder="${t.briefPlaceholder}">${esc(s.projectBrief)}</textarea>`;
}
function wire3() {
  document.getElementById("pname").addEventListener("input", e => updateState("projectName", e.target.value));
  document.getElementById("dur").addEventListener("input", e => updateState("projectDurationWeeks", +e.target.value || 8));
  document.getElementById("brief").addEventListener("input", e => updateState("projectBrief", e.target.value));
  document.querySelectorAll(".seg").forEach(b => b.addEventListener("click", () => { updateState("projectType", b.dataset.t); document.querySelectorAll(".seg").forEach(x => x.classList.remove("sel")); b.classList.add("sel"); }));
}
