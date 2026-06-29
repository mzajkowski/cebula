# Cebula — Product Backlog

Derived from the product review panel. Ordered by trust impact and effort.
Roll out top-to-bottom. Each item is independently shippable.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · **C** Critical · **I** Important · **N** Nice-to-have

---

## Phase 0 — Stop breaking trust (ship first)

The cheapest, highest-trust wins. None require backend or auth.

- [x] **C — Make the project brief affect the estimate (no API key).**
  A local keyword heuristic (`analyzeBriefLocally` in `src/js/calculator.js`) now derives
  an `adjustment_multiplier` + `key_risk_flags` from the brief text, wired into step 4 in
  `src/js/wizard.js`. The formula row in `src/js/output.js` labels the source honestly
  ("from your brief" / "AI brief analysis" / "no brief").
  _Why:_ killed the #1 trust-breaker — typing a brief used to do nothing.
  _Done when:_ editing the brief visibly moves the project range and populates the
  "From your brief" card. ✅

- [ ] **C — Remove or make-real the self-hosted toggle.**
  Today the "Advanced: self-hosted models" checkbox affects only an insight string, not the
  math. Either drop it, or have it add a visible infra-cost line ("+ est. GPU/ops €X/mo, edit me").
  _Why:_ an input that silently does nothing is a credibility trap the moment a user tests it.
  _Done when:_ the toggle either disappears or changes a number the user can see and edit.

- [ ] **C — Reframe the project number as a range with an honest basis.**
  Surface the load-bearing constant (`baseWeeklyPerPerson = 35`) in the UI with a one-line
  "why this number" and let the user edit it. Widen/soften language: "first-draft estimate",
  not "real numbers".
  _Why:_ the project figure is currently precise-looking but indefensible.
  _Done when:_ the assumption is visible, editable, and the copy no longer over-claims precision.

- [ ] **I — Resolve overlapping intensity knobs.**
  `adoptionLevel` (1→3.5×) and per-role `roleWeight` (0.6→2.2×) both multiply the same cost and
  compound. Pick one as primary; demote or merge the other.
  _Why:_ two knobs for the same thing make the estimate swing wildly and feel arbitrary.
  _Done when:_ a user sets intensity once and understands what it does.

---

## Phase 1 — Make the output worth keeping

Turn a one-shot screen into something users save and share.

- [ ] **C — Real export (PDF + CSV).**
  Replace the email-gated "Get the full breakdown as a PDF" (which generates no PDF) with an
  actual client-ready one-pager and a CSV of the breakdown. Keep email optional, not a paywall.
  _Why:_ "send to client / show finance" is impossible today; this is the core artifact.
  _Done when:_ a user can download a branded summary without giving an email.

- [ ] **I — Promote real-cost ("override") mode to the primary path.**
  The seats × actual-price override is the only non-invented number in the product. Make it
  the default framing ("Enter what you actually pay — or estimate"), not a buried checkbox.
  _Why:_ accuracy beats estimation; this is the most-praised feature in the review.
  _Done when:_ real-cost entry is the first thing offered on the tools step.

- [ ] **I — Annualize and split seats vs usage.**
  Show €/year alongside €/month, and separate fixed seat cost from variable API/token cost.
  _Why:_ finance budgets annually; the scary surprise costs are usage-based, not seats.
  _Done when:_ output shows monthly + annual, seats + API as distinct lines.

- [ ] **N — Replace generic insight strings with number-aware insights.**
  The "Cebula says" card uses static templates. Make at least one reference the user's actual
  figures ("€X of your burn sits in 2 power users").
  _Why:_ currently reads as decoration.

---

## Phase 2 — Measure, don't just estimate (the pivot)

This is where a vitamin becomes a painkiller and a subscription becomes justifiable.

- [ ] **C — Invoice / CSV import for actual spend.**
  Let users upload provider invoices or a CSV and get their *real* current AI spend, categorized.
  _Why:_ replaces guessing with truth; the #1 "would make me buy" feature across reviewers.
  _Done when:_ a user sees their actual last-month AI spend from uploaded data.

- [ ] **I — Provider usage connectors (OpenAI / Anthropic / Cursor admin APIs).**
  Pull real seat + token usage automatically. Server-side, behind auth.
  _Why:_ recurring, accurate data is the reason to subscribe and return.
  _Done when:_ at least one provider connects and trends spend over time.

- [ ] **I — Save & compare scenarios (requires accounts).**
  Persist estimates/imports; compare months or project variants.
  _Why:_ budgeting is comparative; today nothing is saved (no retention loop).
  _Done when:_ a returning user can reopen and diff a prior estimate.

- [ ] **N — Monthly "AI spend report" email.**
  Auto-send deltas and anomalies ("Cursor up 40% MoM").
  _Why:_ the recurring reason to come back — the missing retention loop.

---

## Phase 3 — Moat & growth

Defensible assets and the viral loop.

- [ ] **I — Benchmark dataset + "vs peers" insight.**
  Aggregate anonymized estimates/imports into benchmarks ("agencies your size spend €X").
  _Why:_ the only thing ChatGPT/Excel can't replicate; powers sharing.
  _Done when:_ output shows a credible peer comparison.

- [ ] **N — Shareable benchmark artifact.**
  A surprising, link-shareable result card ("we spend 2.3× the median").
  _Why:_ the natural growth loop.

---

## Phase 4 — Commercial coherence

Do **not** ship paid tiers until Phase 1–2 land.

- [ ] **C — Fix the pricing model before charging.**
  Current tiers sell "AI-enhanced estimates" while the AI feature requires the *customer's own*
  OpenRouter key — incoherent. Either move LLM analysis server-side or drop it from the paid story.
  Tie price to *ongoing visibility* (import/connectors), not one-shot estimates.
  _Why:_ you can't charge for a feature the user must also pay a third party to run.
  _Done when:_ a single honest plan maps to a feature set the user can't trivially self-serve.

- [ ] **I — Unify branding & promise.**
  Landing tagline, calculator tagline, and product name currently tell three stories. Pick one.
  _Why:_ brand incoherence read as "pre-product" to every reviewer.

- [ ] **N — Trim the landing "coming soon" shelf.**
  Two of three tool cards are empty; collapse to one "more coming" line until they exist.

---

## Sequencing notes

- **Next two weeks:** finish Phase 0 (self-hosted toggle, honest project basis, intensity knobs)
  + start Phase 1 export. These are launch-blockers for any *paid* positioning; the free tool can
  ship now as a top-of-funnel lead magnet.
- **Do not** launch €149/mo or "real numbers" precision claims until Phase 1–2 exist.
- The strategic bet (per the panel): **measure real spend + own the benchmark.** Everything in
  Phase 2–3 should be prioritized over polishing the synthetic estimator.
