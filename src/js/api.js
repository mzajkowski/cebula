// api.js — OpenRouter key management, file text extraction, and brief parsing.

import { CONFIG } from "./config.js";
import { updateState } from "./state.js";

// Returns the stored OpenRouter key or null.
export function getOpenRouterKey() {
  return localStorage.getItem(CONFIG.storageKey) || null;
}

// Saves the OpenRouter key to localStorage.
export function setOpenRouterKey(key) {
  localStorage.setItem(CONFIG.storageKey, key);
}

// Removes the OpenRouter key from localStorage.
export function clearOpenRouterKey() {
  localStorage.removeItem(CONFIG.storageKey);
}

// Extracts plain text from a PDF or DOCX file, empty string on failure.
export async function extractTextFromFile(file) {
  try {
    const name = (file.name || "").toLowerCase();
    if (name.endsWith(".pdf") && window.pdfjsLib) {
      const buf = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(it => it.str).join(" ") + "\n";
      }
      return text;
    }
    if (name.endsWith(".docx") && window.mammoth) {
      const buf = await file.arrayBuffer();
      const res = await window.mammoth.extractRawText({ arrayBuffer: buf });
      return res.value || "";
    }
    return "";
  } catch (e) {
    return "";
  }
}

// Parses a project brief via OpenRouter, returns analysis object or null.
export async function parseProjectBrief(text) {
  const key = getOpenRouterKey();
  if (!key || !text) return null;
  const system = "You are an expert technical project analyst. Read the provided project brief and return a JSON object with the following fields: complexity (low/medium/high/very_high), ai_intensity (low/medium/high/very_high), estimated_duration_weeks (number), key_risk_flags (array of strings, max 3 items, each under 10 words), adjustment_multiplier (float between 0.5 and 2.5, representing how much more or less AI token usage this project requires vs a baseline medium complexity project where 1.0 = baseline). Return JSON only. No explanation. No markdown.";
  try {
    const res = await fetch(CONFIG.openRouterEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({
        model: CONFIG.model,
        max_tokens: CONFIG.maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
      }),
    });
    const data = await res.json();
    let raw = data?.choices?.[0]?.message?.content?.trim() || "";
    raw = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(raw);
    updateState("projectAnalysis", parsed);
    if (typeof parsed.estimated_duration_weeks === "number") updateState("projectDurationWeeks", parsed.estimated_duration_weeks);
    return parsed;
  } catch (e) {
    return null;
  }
}
