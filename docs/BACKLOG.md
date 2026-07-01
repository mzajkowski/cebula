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

- [x] **C — Remove or make-real the self-hosted toggle.**
  The "Advanced: self-hosted models" section now has an editable "infra cost (GPU + ops) / month"
  field that flows into the monthly burn and shows as its own line in both the burn breakdown and
  the formula table. The insight copy reinforces it ("the cost moved, it didn't vanish").
  _Done:_ the toggle changes a number the user can see and edit. ✅

- [x] **C — Reframe the project number as a range with an honest basis.**
  The load-bearing constant (`baseWeeklyPerPerson = 35`) is now a visible, editable field in step 3
  with a one-line "why this number" hint, persisted in state and driving the calculation + formula
  breakdown. Over-claiming copy ("real numbers — not vibes") removed in the language pass.
  _Done:_ the assumption is visible, editable, explained, and the copy no longer over-claims precision. ✅

- [x] **I — Resolve overlapping intensity knobs.**
  `adoptionLevel` and `roleWeight` used to both multiply the seat burn and compound (and the burn
  formula table hid the adoption factor, so the shown math didn't add up). Now **role weight drives
  the monthly seat burn** (per-role, makes the breakdown meaningful and self-consistent) and
  **adoption drives the project token estimate** only. A hint in step 2 explains the split.
  _Done:_ each knob drives one number; the burn breakdown now multiplies out correctly. ✅

---

## Phase 1 — Make the output worth keeping

Turn a one-shot screen into something users save and share.

- [x] **C — Real export (PDF + CSV).**
  Added an "Export & share" card with **Download CSV** (UTF-8 BOM, finance-friendly: summary,
  role breakdown incl. self-hosted infra, project range, and all assumptions) and **Save as PDF**
  (expands the breakdown + formula, then a print stylesheet strips the chrome to a clean one-pager).
  Both work with **no email**. The old email gate was reframed into an honest optional opt-in.
  _Done:_ a user can download a branded summary without giving an email. ✅

- [x] **I — Promote real-cost ("override") mode to the primary path.**
  The seats × actual-price override is the only non-invented number in the product. It's now
  the first thing on the tools step: a two-card chooser ("Enter what you actually pay — most
  accurate" vs "Estimate it for me") replaces the buried checkbox, and the tools hint + per-tool
  seats×€/seat inputs follow the chosen mode.
  _Why:_ accuracy beats estimation; this is the most-praised feature in the review.
  _Done:_ real-cost entry is the first thing offered on the tools step. ✅

- [x] **I — Annualize and split seats vs usage.**
  The monthly burn card now shows **€/year** under the headline and a two-cell split: **Seats &
  subscriptions (fixed)** vs **API & infra usage (variable)**, color-coded with a "seats are
  predictable, usage is where the surprises hide" note. Direct-API tokens now cost into the burn
  via `tokenPricePerMillion`, and CSV export carries the annual + split lines.
  _Why:_ finance budgets annually; the scary surprise costs are usage-based, not seats.
  _Done:_ output shows monthly + annual, seats + API as distinct lines. ✅

- [x] **N — Replace generic insight strings with number-aware insights.**
  The "Cebula says" card now leads with a number-aware line built from the user's own figures
  (variable-spend share, power-user concentration, or annualised total), with the qualitative
  template kept as a secondary note.
  _Why:_ currently reads as decoration.

---

## Phase 2 — Measure, don't just estimate (the pivot)

This is where the tool moves from estimate-only to measured, recurring visibility.

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

## Phase 4 — Packaging Coherence

Keep public packaging simple until Phase 1–2 land.

- [ ] **C — Keep any paid packaging tied to real ongoing value.**
  If paid features appear later, tie them to saved history, imports, connectors, reporting,
  and benchmark visibility rather than one-shot estimates.
  _Why:_ the open-source tool should stay useful on its own, while hosted features should solve
  problems the static tool cannot.
  _Done when:_ public messaging clearly separates the open-source toolkit from any hosted services.

- [~] **I — Unify branding & promise.**
  Landing tagline, calculator tagline, and product name currently tell three stories. Pick one.
  _Why:_ brand incoherence read as "pre-product" to every reviewer.
  _Progress:_ language pass done — adopted "estimate / clear picture / not guesswork" as the honest
  voice and removed the precision over-claim ("real numbers — not vibes") from the landing page.
  "Peel back what AI is really costing you." is the single tagline. The word "real" is now reserved
  for real-cost override mode (actual invoices). _Remaining:_ align page titles + any future tools.

- [ ] **N — Trim the landing "coming soon" shelf.**
  Two of three tool cards are empty; collapse to one "more coming" line until they exist.

---

## Sequencing notes

- **Next two weeks:** finish Phase 0 (self-hosted toggle, honest project basis, intensity knobs)
  + start Phase 1 export. These are launch-blockers for any hosted positioning; the free tool can
  ship now as a top-of-funnel lead magnet.
- **Do not** publish paid-package details or precision claims until Phase 1–2 exist.
- The strategic bet (per the panel): **measure real spend + own the benchmark.** Everything in
  Phase 2–3 should be prioritized over polishing the synthetic estimator.
