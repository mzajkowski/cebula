# Contributing to Cebula

This is an early tool. The most valuable thing you can give it is **real-world data** — the formula constants are educated guesses until people who run agencies tighten them up.

## Ways to contribute

- **Tune `CALC` constants with real agency data** (most needed) — tool costs, role weights, adoption counts, project multipliers
- **Add missing tools** to `toolCosts` and the `tools` array in `config.js`
- **Improve role weight defaults**
- **Add insight templates** in `calculator.js`
- **Translations** via the `STRINGS` object in `config.js`
- **Bug fixes and UI polish**

## How to submit

1. Fork the repo
2. Create a branch
3. Open a PR — include your reasoning for any constant changes (where the number came from)

## Code style

- No frameworks
- All strings via `STRINGS` — no hardcoded copy in JS
- All constants via `CALC` — no magic numbers in formulas
- One-line comment on every function
- No TODO comments — implement or omit
