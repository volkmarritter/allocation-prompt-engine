# Portfolio Prompt Builder

Version: `2.0`

A lightweight static web app for building structured strategic asset allocation prompts. It guides users through a short Quick Start workflow, applies portfolio logic, and generates a ready-to-copy prompt in English or German.

The app is designed for Private Banking / Wealth Management use cases where investment parameters should be translated into a consistent, testable portfolio-strategy prompt with ETF-based implementation requirements.

## What The App Does

- Starts with a short Quick Start workflow for language, base currency, investment horizon, risk appetite, and app mode.
- Recommends a strategy preset from the selected risk/horizon profile.
- Supports Basic mode for fast use and Pro mode for advanced configuration.
- Generates a structured portfolio prompt in English or German.
- Applies rule-based logic for equity ranges, ETF count, preferred exchange, home bias, currency hedging, ETF look-through, and synthetic ETF assessment.
- Provides validation pop-ups for inconsistent or incomplete parameter combinations.
- Supports copy-to-clipboard plus `.txt` and `.md` exports in Pro mode.
- Runs as a static site without a backend, database, payment system, or build step.

## Logic Documentation

The detailed business logic, configuration-driven defaults, auto/manual rules, validation checks, and generated prompt structure are documented in:

- `LOGIC_EN.md` - English logic documentation.
- `LOGIC.md` - German logic documentation.

## Current Defaults

- Default strategy: `Growth`
- Default base currency: `CHF`
- Default ETF count base: `8-12`
- Default app version: `2.0`
- Base currency order: `CHF / EUR / USD / GBP`

Default exchange by currency:

| Currency | Default exchange |
| --- | --- |
| CHF | SIX Swiss Exchange |
| EUR | XETRA Deutsche Boerse |
| USD | LSE London Stock Exchange |
| GBP | LSE London Stock Exchange |

Strategy presets:

| Preset | Risk appetite | Horizon | Equity range | Default exclusions |
| --- | --- | --- | --- | --- |
| Conservative | Low | >=3 years | 20-40% | Listed Real Estate, Crypto Assets |
| Balanced | Moderate | >=5 years | 40-60% | Listed Real Estate, Crypto Assets |
| Growth | High | >=10 years | 60-80% | Listed Real Estate |
| Aggressive | Very high | >=10 years | 80-100% | Bonds |

## Files

- `index.html` - static page shell.
- `config.js` - editable business configuration for currencies, strategy presets, exchanges, exchange defaults, and ETF count base.
- `styles.css` - layout and visual styling.
- `app.js` - app logic, state handling, prompt generation, validation checks, and export helpers.
- `allocation-compass-logo.svg` - standalone logo signet file.
- `allocation-compass-logo-with-name.svg` - logo signet plus `Portfolio Prompt Builder` wordmark.
- `tests/app.test.js` - Node-based regression tests for logic, rendering, configuration, prompt text, and static assets.
- `tests/e2e/prompt-builder.spec.js` - Playwright browser tests for desktop and mobile flows.
- `TEST_PLAYBOOK.md` - full manual and automated test playbook.
- `LOGIC.md` - German documentation of strategy, parameter, auto/manual, and validation logic.
- `LOGIC_EN.md` - English documentation of strategy, parameter, auto/manual, and validation logic.
- `.github/workflows/tests.yml` - GitHub Actions test workflow.
- `package.json` - test scripts and development dependencies.

## Local Setup

Use the GitHub-backed working folder outside Dropbox:

```powershell
cd "C:\Users\volkm\Documents\Code\allocation-prompt-engine"
```

Install dependencies if needed:

```powershell
npm.cmd install
```

PowerShell can block `npm.ps1` on some Windows setups. Use `npm.cmd` instead of `npm`.

## Run Locally

Start a local static server:

```powershell
cd "C:\Users\volkm\Documents\Code\allocation-prompt-engine"
npx.cmd --yes http-server -p 5173
```

Open:

```text
http://localhost:5173/index.html
```

The app can also be opened directly via `index.html`, but the local server is better for browser testing and deployment-like behavior.

## Run Tests

Run the complete local test suite:

```powershell
npm.cmd test
```

Run only the fast Node/unit tests:

```powershell
npm.cmd run test:unit
```

Run only the Playwright browser tests:

```powershell
npm.cmd run test:e2e
```

Current expected local results:

- Unit tests: `68/68 passed`
- E2E tests: `43 passed`, `1 skipped`

The skipped E2E test is intentional for the desktop Playwright project because it is mobile-only.

## Git Workflow

Before changing code:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' -C 'C:\Users\volkm\Documents\Code\allocation-prompt-engine' status --short --branch
& 'C:\Program Files\Git\cmd\git.exe' -C 'C:\Users\volkm\Documents\Code\allocation-prompt-engine' pull --ff-only origin main
```

Before pushing:

```powershell
npm.cmd run test:unit
npm.cmd run test:e2e
& 'C:\Program Files\Git\cmd\git.exe' status --short --branch
```

After pushing, check GitHub Actions:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' run list --repo volkmarritter/allocation-prompt-engine --limit 3
```

## GitHub Actions

The repository runs tests on every push and pull request to `main`.

Workflow:

```text
.github/workflows/tests.yml
```

CI installs dependencies, installs Playwright Chromium, and runs:

```bash
npm test
```

A GitHub warning about Node.js 20 deprecation can appear for upstream Actions. Treat the build as successful if the `Tests` workflow completes successfully.

## Configure Strategies And Exchanges

Edit `config.js` to adjust:

- Base currency list and order.
- Default base currency.
- Available exchanges in the preferred exchange selector.
- Default exchange per base currency.
- ETF count base.
- Default strategy preset.
- Strategy preset names via `label` and `deLabel`.
- Strategy preset ids, if `defaultPresetId` and references are updated consistently.
- Strategy icon style via `icon`, using `conservative`, `balanced`, `growth`, or `aggressive`.
- Preset risk appetite, investment horizon, equity range, and selected asset classes.

When `config.js` changes, upload it together with the app files during deployment.

## Main Logic Areas

The app includes logic for:

- Quick Start strategy recommendation.
- Basic vs Pro mode behavior.
- Auto/manual state for equity range, ETF count, and exchange.
- Equity range defaults by selected strategy/risk profile.
- ETF count reduction when asset classes are deselected.
- ETF count coverage floor based on selected asset classes.
- CHF-specific extra ETF position when Swiss equities are treated separately.
- Currency-specific home-bias logic.
- Currency-specific exchange defaults.
- Output-section re-lettering when sections are omitted.
- Equal target wording when min/max equity or ETF counts are identical.
- Validation checks for empty selections, risk/horizon mismatch, defensive asset exclusions, equity exclusions, and low-count implementation issues.

For detailed logic documentation, see:

- `LOGIC.md`
- `LOGIC_EN.md`
- `TEST_PLAYBOOK.md`

## Prompt Output

The generated prompt can include:

- Role and objective.
- Investor parameters.
- Eligible asset classes.
- Requirements and constraints.
- Target allocation table.
- ETF implementation table with `Target weight` as the second column.
- Summary of design decisions.
- Currency overview after hedging.
- ETF look-through exposure assessment.
- Rebalancing concept.
- Weighted TER estimate.

The app disclaimer remains visible in the entry mask, but the generated prompt does not include the disclaimer text.

## Deployment To WordPress / Plesk

For `https://bicon.li/prompt-builder/`, upload changed static files to the prompt-builder folder:

- `index.html`
- `config.js`
- `app.js`
- `styles.css`
- logo SVG files if used externally

Do not upload development folders such as:

- `node_modules`
- `test-results`
- `playwright-report`

After upload:

- Hard refresh with `Ctrl + F5`.
- Test in an incognito/private browser window.
- Open `/prompt-builder/app.js`, `/prompt-builder/config.js`, or `/prompt-builder/styles.css` directly if a change does not appear.
- Clear WordPress, Jetpack, CDN, or browser cache if stale files are served.

## Logo Assets

The app uses an inline SVG signet for speed and crisp rendering.

Standalone SVG assets are also included:

- `allocation-compass-logo.svg` - signet only.
- `allocation-compass-logo-with-name.svg` - signet plus wordmark.

These can be used for WordPress, flyers, screenshots, favicon experiments, or LinkedIn visuals.

## Notes

- The app is static and does not store user data.
- There is no backend, payment integration, or database.
- CDN-hosted React modules are not used in the current implementation.
- GitHub is the source of truth for development.
- The Dropbox prompt-builder folder should not be used as the active Git workspace.
