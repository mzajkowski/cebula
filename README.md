# 🧅 Cebula — AI Cost Calculator

> Peel back what AI is really costing your team and projects.

![screenshot](docs/screenshot.png)

## What it does

- Wizard-style calculator: team profile → tools → project → cost estimate
- Formula-based estimates using real tool costs and role consumption weights
- AI-powered brief parsing via OpenRouter (bring your own key)
- Output: monthly team burn, project cost range, role breakdown, insight
- Email capture for PDF breakdown delivery

## Why it exists

I spent years running a digital agency, and AI cost was the quiet line item that kept ruining margins. A tool here, a few seats there, a token bill nobody flagged until the project was already underway. By the time finance noticed, we'd burned the budget and there was no clean way to explain where it went.

Cebula is the back-of-the-napkin model I wish I'd had. It won't be exact — no estimate is — but it makes the invisible visible before the work starts, so you can price it, plan it, and stop getting surprised mid-project.

## How to use

1. Clone the repo
2. Open `src/index.html` in a browser
3. Optionally add an OpenRouter API key for AI-enhanced estimates
4. Fill in the wizard, get your estimate

## Deploy to Netlify

Drag and drop the `src/` folder to [netlify.com/drop](https://app.netlify.com/drop). Done.

## Configuration

All constants in `src/js/config.js`:

- `STRINGS` — all UI copy, edit for translations
- `CONFIG` — model selection, endpoints
- `CALC` — formula constants, tune to your real data

## How the formula works

Monthly burn sums each role's headcount × average tool cost × tools-per-adoption × usage weight. Project cost scales team size × weekly base × duration × project-type and adoption multipliers, with a low/high range. Full detail in [docs/CALCULATION.md](docs/CALCULATION.md).

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Roadmap

- [ ] Per-tool API usage tracking
- [ ] CSV/PDF export
- [ ] Saved team profiles
- [ ] Multi-language support (STRINGS structure already in place)
- [ ] Backend + accounts for saved projects
- [ ] Credit-based Pro tier (€20/5, €100/20, €149/mo unlimited)
- [ ] White-label for agencies

## License

MIT

## Made by

Marcin Zajkowski — [rationalizehq.com](https://rationalizehq.com)