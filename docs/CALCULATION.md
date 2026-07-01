# How Cebula calculates costs

Cebula uses two intentionally rough formulas. They are based on observed agency patterns, not precise telemetry. Tune every constant in `src/js/config.js` (the `CALC` object) to match your own data.

## Formula 1 — Monthly team burn

For every included role with at least one person:

```
seats = Σ ( headcount × avgToolCost × roleWeight[weight] )   # fixed
usage = directApiUsage ? (estimatedTokensPerMonth / 1e6 × tokenPricePerMillion) : 0   # variable
infra = selfHostedMonthlyCost   # variable (0 if none)

monthlyBurn = seats + usage + infra
annualBurn  = monthlyBurn × 12
```

The output splits this into **fixed** (`seats`) vs **variable** (`usage + infra`) so finance can
see the predictable subscription floor separately from the usage-driven costs that surprise people.

- `avgToolCost` = average monthly cost of the selected tools, or `chatgpt` cost (€20) if none selected.
- `roleWeight[weight]` = consumption/seat multiplier for that role's intensity.
- `tokenPricePerMillion` = blended € per 1M direct-API tokens (default €8).
- `selfHostedMonthlyCost` = user-entered GPU + ops estimate for local/self-hosted models (0 if none).

In **real-cost mode**, tools with a seats × €/seat override use those real figures; any remaining
selected tools fall back to the modeled seat burn above.

Seat burn is flat-rate, so it is driven by **role weight only**. Team-wide adoption is *not* applied
here — it would double-count intensity. Adoption drives the project token estimate instead (Formula 2).

## Formula 2 — Project cost range

The project baseline is **derived from the monthly team burn** (Formula 1) — not a
separate fixed rate — so the project number always moves with the team/tools
configuration. Duration scales it out; the type/adoption/adjustment multipliers scale
for how token-hungry the work is.

```
weeklyTeamBurn = monthlyBurn / weeksPerMonth          # monthlyBurn from Formula 1
base = weeklyTeamBurn × durationWeeks
       × projectTypeMultiplier[type] × adoptionToolCount[level] × adjustmentMultiplier
low  = base × rangeMultipliers.low
high = base × rangeMultipliers.high
mid  = (low + high) / 2
```

`adjustmentMultiplier` comes from local brief analysis or optional OpenRouter brief analysis (default `1.0`).

## Constants reference

### toolCosts (monthly € per person)
| Constant | Default | Meaning | Tuning |
|---|---|---|---|
| claude/chatgpt/cursor/gemini/perplexity | 20 | Paid seat | Match your plan |
| copilot | 19 | Seat | — |
| midjourney/notionai | 10 | Seat | — |
| grammarlyai/tabnine | 12 | Seat | — |
| whisper | 5 | Usage est. | Raise if heavy |
| codeium | 0 | Free tier | Raise if Pro |

### adoptionToolCount
Usage-intensity proxy per level: `light 1`, `moderate 1.5`, `heavy 2.5`, `allin 3.5`. Applied to the
**project** formula only (token-hungriness of the work). Raise if your teams stack more tools.

### roleWeights
Consumption multiplier: `light 0.6`, `moderate 1.0`, `heavy 1.5`, `poweruser 2.2`.

### projectTypeMultiplier
`cms_migration 1.4`, `new_build 1.0`, `ai_feature 2.2`, `integration 1.1`, `discovery 0.6`, `other 1.0`. AI features burn the most tokens; discovery the least.

### weeksPerMonth
`52 / 12` (≈4.33) — converts the monthly team burn into the weekly project baseline.

### tokenPricePerMillion
`8` — blended € per 1M direct-API tokens (input/output mix, mid-tier models). Drives the variable
usage line when "direct API usage" is enabled. Raise for frontier models, lower for batch/cheap tiers.

### rangeMultipliers
`low 0.8`, `high 1.3` — the spread shown around the mid estimate.

## adjustment_multiplier

Cebula can derive this locally from brief keywords, or from OpenRouter when a user brings their own key. The value is a float between 0.5 and 2.5. `1.0` is a baseline medium-complexity project. Higher = more AI usage. It multiplies the project base directly.

## Worked example

6-person agency: 2 Frontend Dev (heavy), 1 PM (moderate), 1 Designer (light), 1 BA (moderate), 1 QA (moderate). Heavy adoption (2.5). CMS migration (1.4). 8 weeks.

**Monthly burn** — assume avgToolCost €20, no self-hosted infra:
- 2 devs heavy: `2 × 20 × 1.5 = 60`
- 1 PM moderate: `1 × 20 × 1.0 = 20`
- 1 designer light: `1 × 20 × 0.6 = 12`
- 1 BA moderate: `20`, 1 QA moderate: `20`
- **Total ≈ €132/month** (add `selfHostedMonthlyCost` if any)

**Project cost** — derived from the €132/mo burn, 8 weeks, type 1.4, adoption 2.5, adj 1.0:
- `weeklyTeamBurn = 132 / 4.33 = 30.5`
- `base = 30.5 × 8 × 1.4 × 2.5 × 1.0 = 854`
- low `683`, high `1,110`, **mid €897**

Note how the project number now tracks the monthly burn: raise seats, tool costs, or add
self-hosted infra and both figures move together.

Constants are intentionally rough. Contribute real numbers — see CONTRIBUTING.md.
