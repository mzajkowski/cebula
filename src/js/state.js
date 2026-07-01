// state.js — single source of truth for the wizard, persisted to sessionStorage.

import { CALC } from "./config.js";

const SESSION_KEY = "cebula_state";

// Build the default state object from config constants.
function makeDefault() {
  return {
    currentStep: 1,
    teamName: "",
    roles: JSON.parse(JSON.stringify(CALC.defaultRoles)),
    customRoles: [],
    selfHosted: false,
    selfHostedOptions: [],
    selfHostedMonthlyCost: null,
    selectedTools: [],
    customTools: [],
    adoptionLevel: "moderate",
    directApiUsage: false,
    realCostsMode: false,
    toolOverrides: {},
    estimatedTokensPerMonth: null,
    projectName: "",
    projectType: null,
    projectDurationWeeks: 8,
    projectBrief: "",
    uploadedFileText: "",
    projectAnalysis: null,
    estimate: null,
    email: "",
  };
}

let STATE = makeDefault();

// Returns a deep copy of the current state.
export function getState() {
  return JSON.parse(JSON.stringify(STATE));
}

// Updates one key and persists the whole state.
export function updateState(key, value) {
  STATE[key] = value;
  persistState();
}

// Resets state to defaults and clears storage.
export function resetState() {
  STATE = makeDefault();
  sessionStorage.removeItem(SESSION_KEY);
}

// Serialises state to sessionStorage.
export function persistState() {
  try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(STATE)); } catch (e) { /* ignore quota */ }
}

// Restores state from sessionStorage if present.
export function hydrateState() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) STATE = Object.assign(makeDefault(), JSON.parse(raw));
  } catch (e) { /* ignore parse errors */ }
}

hydrateState();
