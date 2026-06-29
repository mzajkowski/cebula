# OpenRouter integration

## What OpenRouter is

[OpenRouter](https://openrouter.ai) is a single API gateway to many AI models. Cebula uses it to read your project brief and adjust the estimate — bring your own key, no backend required.

## Why Cebula uses it

There's no server. Cebula is static files. To enable AI analysis without standing up infrastructure, it calls OpenRouter directly from the browser with a key you control.

## How to get a key

1. Go to [account.openrouter.ai](https://account.openrouter.ai)
2. Open **API Keys**
3. Click **Create** and copy the key (`sk-or-...`)

## How to add it

On first load, a banner appears. Paste your key and click Save. It's stored in `localStorage` only, under the key `cebula_or_key`. Refresh to use it.

## System prompt used

```
You are an expert technical project analyst. Read the provided project brief and
return a JSON object with the following fields: complexity (low/medium/high/very_high),
ai_intensity (low/medium/high/very_high), estimated_duration_weeks (number),
key_risk_flags (array of strings, max 3 items, each under 10 words),
adjustment_multiplier (float between 0.5 and 2.5, representing how much more or less
AI token usage this project requires vs a baseline medium complexity project where
1.0 = baseline). Return JSON only. No explanation. No markdown.
```

## Fields returned

- `complexity`, `ai_intensity` — descriptive
- `estimated_duration_weeks` — overrides your duration input
- `key_risk_flags` — shown as amber pills in output
- `adjustment_multiplier` — multiplies the project cost base

## Graceful degradation

No key = no analysis. Cebula falls back to formula-only estimates and shows a note. Everything still works.

## Swapping the model

Edit `CONFIG.model` in `src/js/config.js` (default `anthropic/claude-3.5-sonnet`).

## Privacy

The key never leaves your browser except to call OpenRouter directly over HTTPS. Cebula has no server and stores nothing about you.
