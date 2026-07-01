// config.js — all UI strings, app config, and formula constants. i18n-ready.

// All UI copy lives here. No hardcoded strings elsewhere. Edit for translations.
// Use {symbol}, {code}, {defaultBaseRate} for currency-aware labels — resolved at load from CURRENCY.
const STRINGS_RAW = {
  nav: {
    steps: ["Team Profile", "Tools & Adoption", "Project", "Estimate"],
    stepIndicator: "Step {n} of {total} — {label}",
    back: "Back",
    next: "Next",
    finish: "See estimate",
    restart: "Start over",
  },
  step1: {
    title: "Who's on the team?",
    subtitle: "Tell us about the people who'll touch this project.",
    teamNameLabel: "Team or agency name",
    teamNamePlaceholder: "e.g. Acme Digital",
    rolesHeader: "Roles",
    colInclude: "Use",
    colRole: "Role",
    colHeadcount: "People",
    colWeight: "Usage",
    addRole: "Add custom role",
    customRolePlaceholder: "Role name",
    removeRole: "Remove",
    weights: { light: "Light", moderate: "Moderate", heavy: "Heavy", poweruser: "Power User" },
    advancedToggle: "Advanced: self-hosted models",
    selfHostedLabel: "Using self-hosted or local models?",
    selfHostedOptions: ["Ollama", "LM Studio", "Private cloud", "Other"],
    selfHostedCostLabel: "Estimated infra cost (GPU + ops) / month ({symbol})",
    selfHostedCostHint: "Self-hosted isn't free — GPU time and the engineer babysitting it cost real money. Add a rough monthly figure so it shows up in the burn.",
    selfHostedCostPlaceholder: "e.g. 400",
  },
  step2: {
    title: "Which tools, and how hard?",
    subtitle: "Start with how you want them priced.",
    costModeHeader: "How should we price your tools?",
    costModeRealName: "Enter what you actually pay",
    costModeRealBadge: "Most accurate",
    costModeRealDesc: "Real seats × price per tool — the one number we won't invent. Best if you have your invoices handy.",
    costModeEstName: "Estimate it for me",
    costModeEstDesc: "We'll price each tool at typical market rates for a quick ballpark you can sharpen later.",
    toolsHeader: "Tools",
    toolsHintReal: "Pick your tools, then enter real seats and {symbol}/seat for each.",
    toolsHintEstimate: "Pick the tools your team pays for — we'll price them at market rates.",
    addToolPlaceholder: "Your own tool",
    addTool: "Add tool",
    adoptionHeader: "How heavily is AI adopted?",
    adoptionHint: "Drives how token-hungry your project work is — it shapes the project estimate, not the monthly seat burn.",
    adoption: {
      light: { name: "Light", desc: "Occasional use, one tool, ad hoc." },
      moderate: { name: "Moderate", desc: "Daily use, a tool or two, growing." },
      heavy: { name: "Heavy", desc: "Core workflow, multiple tools, most people." },
      allin: { name: "All-in", desc: "Everything AI-first, stacked tools, every role." },
    },
    advancedToggle: "Advanced: direct API usage",
    directApiLabel: "Does your team use AI APIs directly?",
    tokensLabel: "Estimated tokens / month (optional)",
    tokensPlaceholder: "e.g. 5000000",
    seatsLabel: "seats",
    costPerSeatLabel: "{symbol}/seat",
    seatsPlaceholder: "seats",
    costPerSeatPlaceholder: "{symbol}/seat",
  },
  step3: {
    title: "Tell us about the project",
    subtitle: "The more we know, the sharper the estimate.",
    projectNameLabel: "Project name",
    projectNamePlaceholder: "e.g. Website rebuild",
    projectTypeLabel: "Project type",
    projectTypes: {
      cms_migration: "CMS migration",
      new_build: "New build",
      ai_feature: "AI feature",
      integration: "Integration",
      discovery: "Discovery",
      retainer: "Maintenance / retainer",
      other: "Other",
    },
    durationLabel: "Duration (weeks)",
    baseRateLabel: "Baseline AI spend per person / week ({symbol})",
    baseRateHint: "Default {defaultBaseRate} ≈ a Cursor seat plus daily ChatGPT/Claude use. This is the biggest lever on the project number — tune it to your team.",
    briefLabel: "Brief",
    briefPlaceholder: "Paste a short description, scope, or goals…",
    uploadLabel: "Upload a spec, RFP, or brief (optional)",
    processing: "🧅 Reading your brief...",
    analysed: "✓ Brief analysed — estimates adjusted",
    noKey: "AI analysis coming soon",
  },
  step4: {
    title: "Your estimate",
    subtitle: "Here's what the numbers look like.",
  },
  output: {
    burnTitle: "Monthly team AI cost",
    burnSubtitle: "estimated monthly team AI cost",
    perMonth: "/mo",
    annualLine: "{annual} / year",
    splitFixedLabel: "Seats & subscriptions",
    splitFixedTag: "fixed",
    splitVariableLabel: "API & infra usage",
    splitVariableTag: "variable",
    splitHint: "Seats are predictable. Usage is where the surprises hide.",
    breakdownToggle: "Show role breakdown",
    breakdownHide: "Hide role breakdown",
    colRole: "Role",
    colHeadcount: "People",
    colWeight: "Usage",
    colMonthly: "{symbol}/month",
    selfHostedRow: "Self-hosted infra (GPU + ops)",
    projectTitle: "AI cost for the project",
    projectFor: "for {name} ({type})",
    projectDuration: "Based on {weeks} weeks with {people} people",
    chartTitle: "Cost by role",
    riskTitle: "From your brief",
    insightLabel: "Cebula says",
    insightVariable: "{variable} of your {total}/mo ({pct}%) is variable usage — the part that scales with success and lands as surprise invoices. Seats you can predict; this you can't.",
    insightPower: "{amount} of your monthly seat burn sits in {n} power-user {seats} ({pct}%). Cost concentrates fast — watch where the heavy usage clusters.",
    insightAnnual: "That's {annual}/year in recurring AI cost, before the {project} of project work on top. Most teams never see it added up.",
    showFormula: "How we calculated this ▾",
    hideFormula: "How we calculated this ▴",
    formulaBurnTitle: "Monthly burn breakdown",
    formulaProjectTitle: "Project cost breakdown",
    fRole: "Role", fPeople: "People", fBasis: "Tool cost basis", fWeight: "Usage weight", fMonthly: "Monthly est.", fTotal: "Total",
    fInput: "Input", fValue: "Value",
    fTeamSize: "Team size", fDuration: "Duration", fBaseRate: "Base rate", fTypeMult: "Project type multiplier", fAdoptMult: "Adoption multiplier", fAiAdjust: "AI adjustment", fRange: "Estimated range",
    formulaNote: "All base rates and multipliers are in the open source config. Contribute real data at github.com/mzajkowski/cebula.",
    exportTitle: "Export & share",
    exportSubtitle: "Download a copy you can drop into a proposal, a spreadsheet, or send on. No email required.",
    exportCsv: "Download CSV",
    exportPdf: "Save as PDF",
    shareTitle: "Share the highlights",
    shareSubtitle: "A ready-made image with your headline numbers — post it, DM it, or drop it in a deck.",
    shareImageAlt: "Cebula AI cost estimate highlights card",
    shareDownload: "Download image",
    shareShare: "Share…",
    shareCopy: "Copy image",
    shareCopied: "✓ Copied",
    shareCardLabel: "AI Cost Estimate",
    shareCardMonthly: "Monthly team AI cost",
    shareCardAnnual: "≈ {annual}/year recurring",
    shareCardProject: "Project estimate",
    shareCardFooter: "cebula.tools · peel back what AI is really costing you",
    shareText: "Our estimated AI cost, peeled back by Cebula.",
    printTitle: "AI Cost Estimate",
    printPreparedFor: "Prepared for {team}",
    printFooter: "Made with Cebula · peel back what AI is really costing you · cebula.tools",
    waitlistTitle: "Be first to sharper estimates",
    waitlistBody: "We're building invoice import, real usage tracking, and peer benchmarks. Leave your email and we'll tell you the moment they land — that's it.",
    emailPlaceholder: "you@agency.com",
    emailSubmit: "Keep me posted",
    emailConfirm: "✓ Thanks — we'll ping you when there's something worth it.",
    emailSmallprint: "No newsletter, no spam, no sales calls. One email when it ships. Unsubscribe anytime.",
  },
  errors: {
    noRole: "Add at least one role with one person.",
    noTool: "Select at least one tool or add your own.",
    noProjectName: "Give the project a name.",
    noProjectType: "Pick a project type.",
    email: "Enter a valid email.",
    emailFailed: "Couldn't send — try again.",
  },
  banner: {
    text: "Brief analysis is coming soon. Stored only in your browser.",
    placeholder: "sk-or-...",
    save: "Save",
    saved: "✓ Key saved",
    learn: "What is this?",
  },
  // Contextual insight templates. {team} and {type} are substituted at render time.
  insights: {
    allin_devs: "All-in adoption with a big dev team means subscription burn that nobody sees on a single invoice — it adds up fast.",
    cms_migration: "CMS migrations hide their cost in content transformation — every page reworked is tokens spent. Budget for the long tail.",
    ai_feature: "AI features can explode in token usage once real users hit them. Your build cost is the small number here.",
    poweruser: "Power users concentrate cost. One heavy seat can outspend five light ones — watch where usage clusters.",
    self_hosted: "Self-hosted models look free until you count GPU time, ops hours, and the engineer babysitting them. The cost moved, it didn't vanish.",
    under_adoption: "Light adoption on a big team is opportunity cost — competitors moving faster are spending more on purpose.",
    discovery: "Discovery work drifts. Loose scope plus AI tooling makes estimates wander — revisit this number weekly.",
    direct_api: "Direct API usage gives you real cost visibility — use it. You can see exactly what each feature costs to run.",
    fallback: "AI cost rarely shows up as one line — it's scattered across seats, tools, and tokens. This is your starting picture.",
    allin_ai_feature: "All-in across {team} people building an {type} — token costs compound fastest here. Expect spend to climb as usage scales.",
    cms_heavy_adoption: "Content transformation plus heavy AI adoption is the most underestimated combination — every reworked page burns tokens twice.",
    real_costs_higher: "Your actual invoices already sit 30%+ above our formula estimate — the formula was conservative. Trust your real numbers.",
  },
};

// App configuration. Model selection and endpoints.
export const CONFIG = {
  model: "anthropic/claude-3.5-sonnet",
  openRouterEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  maxTokens: 500,
  netlifyFormName: "cebula-leads",
  netlifyFormAction: "/ai-cost-calculator/",
  storageKey: "cebula_or_key",
};

// Currency — pick a preset or set code/locale/fxFromEur manually. All CALC money values scale from EUR defaults.
export const CURRENCY_PRESETS = {
  EUR: { code: "EUR", locale: "en-IE", fxFromEur: 1 },
  USD: { code: "USD", locale: "en-US", fxFromEur: 1.08 },
  GBP: { code: "GBP", locale: "en-GB", fxFromEur: 0.86 },
  PLN: { code: "PLN", locale: "pl-PL", fxFromEur: 4.32 },
  CHF: { code: "CHF", locale: "de-CH", fxFromEur: 0.97 },
};

// Active currency for this deployment. Spread a preset: { ...CURRENCY_PRESETS.USD }
export const CURRENCY = { ...CURRENCY_PRESETS.USD };

// Returns the narrow currency symbol for a locale/code pair.
function currencySymbol(code, locale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" })
    .formatToParts(0).find(p => p.type === "currency")?.value ?? code;
}

// Scales a EUR-authored money constant to the active currency.
function scaleMoney(value, fx) {
  return fx === 1 ? value : Math.round(value * fx);
}

// Deep-resolves {symbol}, {code}, {defaultBaseRate} placeholders in STRINGS.
function resolveCurrencyCopy(value, tokens) {
  if (typeof value === "string") {
    return Object.entries(tokens).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), value);
  }
  if (Array.isArray(value)) return value.map(v => resolveCurrencyCopy(v, tokens));
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolveCurrencyCopy(v, tokens)]));
}

// Formula constants authored in EUR — see docs/CALCULATION.md. Scaled to CURRENCY on export.
const CALC_EUR = {
  // Monthly per-person tool subscription (EUR base values).
  toolCosts: {
    // GitHub Copilot Individual ~$10, Business ~$19 — using midpoint as agencies typically mix both tiers
    claude: 20, chatgpt: 20, copilot: 15, cursor: 20,
    gemini: 20, midjourney: 10, perplexity: 20, notionai: 10,
    grammarlyai: 12, codeium: 0, tabnine: 12, whisper: 5,
  },
  // Average number of tools actively used per adoption level.
  adoptionToolCount: { light: 1, moderate: 1.5, heavy: 2.5, allin: 3.5 },
  // Consumption multiplier per role weight setting.
  roleWeights: { light: 0.6, moderate: 1.0, heavy: 1.5, poweruser: 2.2 },
  // Multiplier applied to project cost by project type.
  projectTypeMultiplier: {
    cms_migration: 1.4, new_build: 1.0, ai_feature: 2.2,
    integration: 1.1, discovery: 0.6,
    // Retainer/maintenance — steady state, lower AI intensity than greenfield work
    retainer: 0.8, other: 1.0,
  },
  // Baseline weekly AI spend per person on a project (EUR base).
  baseWeeklyPerPerson: 35,
  // Blended per 1M tokens for direct-API usage (EUR base).
  tokenPricePerMillion: 8,
  // Low/high spread around the mid estimate.
  rangeMultipliers: { low: 0.8, high: 1.3 },
  // Default project length in weeks when none supplied.
  defaultDurationWeeks: 8,
  // Dev headcount above which a team counts as "many devs" for insights.
  insightDevThreshold: 3,
  // Total headcount above which a team counts as "large" for insights.
  insightTeamThreshold: 5,
  // Default role roster with usage weight, inclusion, and headcount.
  defaultRoles: [
    { id: "frontend", name: "Frontend Dev", defaultWeight: "heavy", defaultIncluded: true, defaultHeadcount: 2 },
    { id: "backend", name: "Backend Dev", defaultWeight: "heavy", defaultIncluded: true, defaultHeadcount: 2 },
    { id: "fullstack", name: "Full-stack Dev", defaultWeight: "heavy", defaultIncluded: true, defaultHeadcount: 0 },
    { id: "devops", name: "DevOps/Infra", defaultWeight: "moderate", defaultIncluded: true, defaultHeadcount: 1 },
    { id: "qa", name: "QA Engineer", defaultWeight: "moderate", defaultIncluded: true, defaultHeadcount: 1 },
    { id: "pm", name: "Product Manager", defaultWeight: "moderate", defaultIncluded: true, defaultHeadcount: 1 },
    { id: "pjm", name: "Project Manager", defaultWeight: "moderate", defaultIncluded: true, defaultHeadcount: 1 },
    { id: "ba", name: "Business Analyst", defaultWeight: "moderate", defaultIncluded: false, defaultHeadcount: 0 },
    { id: "designer", name: "UX/UI Designer", defaultWeight: "light", defaultIncluded: true, defaultHeadcount: 1 },
    { id: "content", name: "Content Strategist", defaultWeight: "light", defaultIncluded: false, defaultHeadcount: 0 },
    { id: "data", name: "Data Scientist", defaultWeight: "heavy", defaultIncluded: false, defaultHeadcount: 0 },
    { id: "mle", name: "AI/ML Engineer", defaultWeight: "poweruser", defaultIncluded: false, defaultHeadcount: 0 },
  ],
  // Tool roster built from toolCosts above.
  tools: [
    { id: "claude", name: "Claude", defaultCost: 20 },
    { id: "chatgpt", name: "ChatGPT", defaultCost: 20 },
    { id: "copilot", name: "GitHub Copilot", defaultCost: 15 },
    { id: "cursor", name: "Cursor", defaultCost: 20 },
    { id: "gemini", name: "Gemini", defaultCost: 20 },
    { id: "midjourney", name: "Midjourney", defaultCost: 10 },
    { id: "perplexity", name: "Perplexity", defaultCost: 20 },
    { id: "notionai", name: "Notion AI", defaultCost: 10 },
    { id: "grammarlyai", name: "Grammarly", defaultCost: 12 },
    { id: "codeium", name: "Codeium", defaultCost: 0 },
    { id: "tabnine", name: "Tabnine", defaultCost: 12 },
    { id: "whisper", name: "Whisper", defaultCost: 5 },
  ],
};

// Scales EUR-authored CALC money fields to the active currency.
function scaleCalc(calc, fx) {
  if (fx === 1) return calc;
  const toolCosts = Object.fromEntries(Object.entries(calc.toolCosts).map(([k, v]) => [k, scaleMoney(v, fx)]));
  return {
    ...calc,
    toolCosts,
    baseWeeklyPerPerson: scaleMoney(calc.baseWeeklyPerPerson, fx),
    tokenPricePerMillion: Math.round(calc.tokenPricePerMillion * fx * 100) / 100,
    tools: calc.tools.map(t => ({ ...t, defaultCost: toolCosts[t.id] ?? t.defaultCost })),
  };
}

export const CALC = scaleCalc(CALC_EUR, CURRENCY.fxFromEur);

export const STRINGS = resolveCurrencyCopy(STRINGS_RAW, {
  symbol: currencySymbol(CURRENCY.code, CURRENCY.locale),
  code: CURRENCY.code,
  defaultBaseRate: String(CALC.baseWeeklyPerPerson),
});
