# Cebula

> Practical open-source tools for teams that want clearer costs, sharper scopes, and fewer project surprises.

[![GitHub stars](https://img.shields.io/github/stars/mzajkowski/cebula?style=social)](https://github.com/mzajkowski/cebula/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Open source](https://img.shields.io/badge/open%20source-tools-14BBA6)](https://github.com/mzajkowski/cebula)

<!-- screenshot coming soon -->

## What Cebula Is

Cebula is a small open-source toolkit for people who run, estimate, or deliver digital work. The first tool is an AI Cost Calculator; the wider idea is a set of practical calculators, validators, and audit tools that make hidden project risk visible before it eats the margin.

The tools are intentionally lightweight: static-first, transparent formulas, no forced account, and constants you can inspect or tune for your own market.

## Tools

### AI Cost Calculator

- Wizard-style calculator: team profile → tools → project → cost estimate
- Formula-based estimates using real tool costs and role consumption weights
- Local brief analysis, with optional OpenRouter-powered parsing if you bring your own key
- Output: monthly team burn, project cost range, role breakdown, insight
- CSV and print/PDF export without email

### Planned Open-Source Tools

- Scope Validator: stress-test a proposal or RFP before committing to it
- Team AI Audit: map actual AI adoption and usage patterns across a team
- More small tools where transparent defaults beat black-box spreadsheets

## Why it exists

I spent years running a digital agency, and AI cost was the quiet line item that kept ruining margins. A tool here, a few seats there, a token bill nobody flagged until the project was already underway. By the time finance noticed, we'd burned the budget and there was no clean way to explain where it went.

Cebula is the back-of-the-napkin model I wish I'd had, growing into a toolkit around the same principle. It won't be exact — no estimate is — but it makes the invisible visible before the work starts, so you can price it, plan it, and stop getting surprised mid-project.

## How to use

1. Clone the repo
2. Open `src/index.html` in a browser
3. Optionally add an OpenRouter API key for AI-enhanced estimates
4. Fill in the wizard, get your estimate

## Source

- GitHub: [github.com/mzajkowski/cebula](https://github.com/mzajkowski/cebula)
- Like the idea? A star helps other agency and product people find it.

## Deploy to Netlify

Drag and drop the `src/` folder to [netlify.com/drop](https://app.netlify.com/drop). Done.

## Configuration

All constants in `src/js/config.js`:

- `STRINGS` — all UI copy, edit for translations
- `CONFIG` — model selection, endpoints
- `CURRENCY` — currency code, locale, and FX scale for your market (see presets)
- `CALC` — formula constants, tune to your real data (auto-scaled from EUR when `fxFromEur` ≠ 1)

## How the formula works

Monthly burn sums each role's headcount × average tool cost × usage weight, then adds optional API usage and self-hosted infra. Project cost scales team size × weekly base × duration × project-type and adoption multipliers, with a low/high range. Full detail in [docs/CALCULATION.md](docs/CALCULATION.md).

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Roadmap

- [ ] Per-tool API usage tracking
- [ ] Saved team profiles
- [ ] Multi-language support (STRINGS structure already in place)
- [ ] Invoice/CSV import for actual spend
- [ ] Provider connectors for usage and seat data
- [ ] Benchmark dataset from anonymized real-world inputs
- [ ] More open-source tools around scope, usage, and delivery risk

## License

MIT

## Made by

Marcin Zajkowski — [rationalizehq.com](https://rationalizehq.com)
