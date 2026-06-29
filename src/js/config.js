// config.js — all UI strings, app config, and formula constants. i18n-ready.

// All UI copy lives here. No hardcoded strings elsewhere. Edit for translations.
export const STRINGS = {
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
  },
  step2: {
    title: "Which tools, and how hard?",
    subtitle: "Pick the AI tools your team actually pays for.",
    toolsHeader: "Tools",
    addToolPlaceholder: "Your own tool",
    addTool: "Add tool",
    adoptionHeader: "How heavily is AI adopted?",
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
      other: "Other",
    },
    durationLabel: "Duration (weeks)",
    briefLabel: "Brief",
    briefPlaceholder: "Paste a short description, scope, or goals…",
    uploadLabel: "Upload a spec, RFP, or brief (optional)",
    processing: "🧅 Reading your brief...",
    analysed: "✓ Brief analysed — estimates adjusted",
    noKey: "Add an OpenRouter key to enable AI analysis",
  },
  step4: {
    title: "Your estimate",
    subtitle: "Here's what the numbers look like.",
  },
  output: {
    burnTitle: "Monthly team AI cost",
    burnSubtitle: "estimated monthly team AI cost",
    breakdownToggle: "Show role breakdown",
    breakdownHide: "Hide role breakdown",
    colRole: "Role",
    colHeadcount: "People",
    colWeight: "Usage",
    colMonthly: "€/month",
    projectTitle: "Project cost",
    projectFor: "for {name} ({type})",
    projectDuration: "Based on {weeks} weeks with {people} people",
    chartTitle: "Cost by role",
    riskTitle: "From your brief",
    insightLabel: "Cebula says",
    proTitle: "Want AI-powered analysis?",
    proBody: "Upload your brief and get adjusted estimates, risk flags from your actual spec, and a detailed PDF breakdown — coming soon.",
    proCta: "Join the waitlist",
    emailTitle: "Get the full breakdown as a PDF",
    emailPlaceholder: "you@agency.com",
    emailSubmit: "Send it",
    emailConfirm: "✓ We'll send it shortly. No spam.",
    emailSmallprint: "No spam. No sales calls. Just the numbers.",
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
    text: "Add an OpenRouter key to unlock AI-powered brief analysis. Stored only in your browser.",
    placeholder: "sk-or-...",
    save: "Save",
    saved: "✓ Key saved",
    learn: "What is this?",
  },
};

// App configuration. Model selection and endpoints.
export const CONFIG = {
  model: "anthropic/claude-3.5-sonnet",
  openRouterEndpoint: "https://openrouter.ai/api/v1/chat/completions",
  maxTokens: 500,
  netlifyFormName: "cebula-leads",
  storageKey: "cebula_or_key",
};

// Formula constants. Tune these based on your real data — see docs/CALCULATION.md
export const CALC = {
  // Monthly € per person per tool subscription.
  toolCosts: {
    claude: 20, chatgpt: 20, copilot: 19, cursor: 20,
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
    integration: 1.1, discovery: 0.6, other: 1.0,
  },
  // Baseline weekly € of AI spend per person on a project.
  baseWeeklyPerPerson: 35,
  // Low/high spread around the mid estimate.
  rangeMultipliers: { low: 0.8, high: 1.3 },
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
    { id: "copilot", name: "GitHub Copilot", defaultCost: 19 },
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
