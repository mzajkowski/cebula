# How Cebula calculates costs

Cebula uses two intentionally rough formulas. They are based on observed agency patterns, not precise telemetry. Tune every constant in `src/js/config.js` (the `CALC` object) to match your own data.

## Formula 1 — Monthly team burn

For every included role with at least one person:

```
monthlyBurn = Σ ( headcount × avgToolCost × roleWeight[weight] ) + selfHostedMonthlyCost
```

- `avgToolCost` = average monthly cost of the selected tools, or `chatgpt` cost (€20) if none selected.
- `roleWeight[weight]` = consumption/seat multiplier for that role's intensity.
- `selfHostedMonthlyCost` = user-entered GPU + ops estimate for local/self-hosted models (0 if none).

Seat burn is flat-rate, so it is driven by **role weight only**. Team-wide adoption is *not* applied
here — it would double-count intensity. Adoption drives the project token estimate instead (Formula 2).

## Formula 2 — Project cost range

```
base = teamHeadcount × baseWeeklyPerPerson × durationWeeks
       × projectTypeMultiplier[type] × adoptionToolCount[level] × adjustmentMultiplier
low  = base × rangeMultipliers.low
high = base × rangeMultipliers.high
mid  = (low + high) / 2
```

`adjustmentMultiplier` comes from the OpenRouter brief analysis (default `1.0`).

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

### baseWeeklyPerPerson
`35` — baseline weekly € of project AI spend per person.

### rangeMultipliers
`low 0.8`, `high 1.3` — the spread shown around the mid estimate.

## adjustment_multiplier

When an OpenRouter key is present, Cebula sends the brief and receives a float between 0.5 and 2.5. `1.0` is a baseline medium-complexity project. Higher = more AI usage. It multiplies the project base directly.

## Worked example

6-person agency: 2 Frontend Dev (heavy), 1 PM (moderate), 1 Designer (light), 1 BA (moderate), 1 QA (moderate). Heavy adoption (2.5). CMS migration (1.4). 8 weeks.

**Monthly burn** — assume avgToolCost €20, no self-hosted infra:
- 2 devs heavy: `2 × 20 × 1.5 = 60`
- 1 PM moderate: `1 × 20 × 1.0 = 20`
- 1 designer light: `1 × 20 × 0.6 = 12`
- 1 BA moderate: `20`, 1 QA moderate: `20`
- **Total ≈ €132/month** (add `selfHostedMonthlyCost` if any)

**Project cost** — headcount 6, base 35, 8 weeks, type 1.4, adoption 2.5, adj 1.0:
- `base = 6 × 35 × 8 × 1.4 × 2.5 × 1.0 = 5,880`
- low `4,704`, high `7,644`, **mid €6,174**

Constants are intentionally rough. Contribute real numbers — see CONTRIBUTING.md.
