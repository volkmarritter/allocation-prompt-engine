# Portfolio Prompt Builder

Prompt-driven SAA engine for Private Banking – transforms structured investment parameters into consistent, testable strategic asset allocation proposals with ETF-based implementation.

A lightweight static prompt builder that turns configurable investor parameters into a structured portfolio-strategy prompt in English or German.

## Files

- `index.html` - page shell
- `config.js` - editable business configuration for strategy presets, exchange list, and default exchange per base currency
- `styles.css` - layout and visual styling
- `app.js` - app logic and prompt generation
- `tests/app.test.js` - Node-based regression tests
- `TEST_PLAYBOOK.md` - full manual and automated test playbook
- `LOGIC.md` - documented strategy, parameter, auto/manual, and validation logic
- `LOGIC_EN.md` - English version of the strategy, parameter, auto/manual, and validation logic
- `package.json` - test command

## Run locally

Open `index.html` in a modern browser.

## Run tests

```powershell
npm.cmd test
```

Run only the fast Node logic tests:

```powershell
npm.cmd run test:unit
```

Run only the browser tests:

```powershell
npm.cmd run test:e2e
```

The browser tests use Playwright Chromium.

## Configure strategies and exchanges

Edit `config.js` to adjust:

- investment strategy presets, including risk appetite, investment horizon, equity range, ETF count overrides, and selected asset classes
- strategy names via `label` and `deLabel`; `id` may also be changed if `defaultPresetId` and any references use the new id
- preset icon style via `icon`, using one of `conservative`, `balanced`, `growth`, or `aggressive`
- available exchanges shown in the preferred exchange selector
- default exchange per base currency
- default preset used for reset and initial load

When publishing the app to WordPress/Plesk, upload `config.js` together with `index.html`, `styles.css`, and `app.js`.

## What it does

The Portfolio Prompt Builder turns key investor parameters into a structured, ready-to-use prompt for strategic asset allocation analysis. It combines interactive inputs with additional logic for home bias, currency hedging, ETF look-through exposures, synthetic ETF assessment, and plausibility checks.
- Select base currency, risk appetite, investment horizon, equity allocation, ETF count, and preferred exchange
- Plausibility checks for risk appetite, investment horizon, and required minimum selections
- Automatically adjusts the equity allocation range to the selected risk appetite
- Applies dynamic home-bias logic based on the selected base currency
- Optional requirements for currency hedging, ETF look-through, and synthetic ETF assessment
- Selectable output sections such as target allocation, ETF implementation, currency overview, rebalancing, and TER estimate
- Choose between English and German for the generated prompt
- Ready-to-copy prompt for structured portfolio analysis
