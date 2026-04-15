# Test Playbook

This playbook documents the practical test set for the Allocation Prompt Engine / Portfolio Prompt Builder. The app is a static HTML/CSS/JavaScript web app, so the tests focus on prompt correctness, UI wiring, parameter logic, browser behavior, deployment safety, and cache mistakes.

Current app version covered by this playbook: `2.0`.

## Working Folder

Use the GitHub-backed workspace outside Dropbox:

```powershell
cd "C:\Users\volkm\Documents\Code\allocation-prompt-engine"
```

Do not use the Dropbox `prompt-builder` folder as the active Git workspace.

Before changing code or tests:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' status --short --branch
& 'C:\Program Files\Git\cmd\git.exe' pull --ff-only origin main
```

## Quick Smoke Test

Run this after every app or test change:

```powershell
cd "C:\Users\volkm\Documents\Code\allocation-prompt-engine"
node --check app.js
node --check config.js
node --check tests/app.test.js
npm.cmd run test:unit
npm.cmd run test:e2e
```

Expected result:

```text
Unit tests: 53/53 passed
Playwright tests: 37 passed, 1 skipped
```

If PowerShell blocks `npm`, use `npm.cmd` instead of `npm`.

To run everything through the package script:

```powershell
npm.cmd test
```

To run only the fast Node logic tests:

```powershell
npm.cmd run test:unit
```

To run only the Playwright browser tests:

```powershell
npm.cmd run test:e2e
```

## Automated Unit Tests

The Node test file is `tests/app.test.js`.

It currently checks:

- Static entry points are wired in `index.html`.
- Source files do not contain replacement characters or known mojibake markers.
- Portfolio presets, default base currency, default exchange mapping, and ETF count base are loaded from `config.js`.
- English and German prompt output include the current Table 2 format.
- Table 2 includes `Target weight` / `Zielgewicht` as the second column.
- Look-through wording includes the asset allocation overview after Table 1.
- Synthetic ETF assessment wording includes market efficiency and US tax / US tax-efficiency logic.
- Prompt instruction checkbox copy is user-facing and does not say `Adds a numbered requirement`.
- Equity allocation ranges follow risk appetite and strategy presets.
- Maximum equity warning appears once per risk appetite.
- Empty asset-class and empty output-section warnings are shown.
- Low-risk profiles warn when cash or bonds are deselected.
- Moderate and higher profiles warn when equities are deselected.
- Additional logic checks cover crypto, bonds, real estate / REITs, look-through, synthetic ETFs, and ETF-count coverage.
- ETF coverage compares minimum ETF count with selected asset classes, including the CHF Swiss-equity add-on.
- Risk/horizon warning matrix is enforced.
- ETF count frame and section color hooks are present.
- Base currency controls home-bias and equity-region logic for `CHF`, `EUR`, `GBP`, and `USD`.
- Equity region badge follows currency and equity selection.
- Currency changes set preferred exchange unless exchange is manual.
- Preferred exchange can be restored to auto mode.
- Selected output sections are re-lettered alphabetically.
- Minimum/maximum ETF counts and equity weights cannot cross.
- Equity allocation range becomes `0-0%` when equities are deselected.
- Equal equity and equal ETF targets use exact wording in generated prompts.
- Prompt preview splits prompts into top-level sections.
- Portfolio presets set profile values and default asset-class exclusions.
- Portfolio presets reset manually adjusted ETF counts.
- Default state is Growth CHF with current asset exclusions.
- Quick start recommends a coherent preset and applies it.
- Quick start App Mode controls whether the opened builder is Basic or Pro.
- Quick start strategy becomes the reset default for the current builder session.
- Quick start defaults follow configured default preset and base currency.
- Basic mode auto-selects required defaults, locks equities, hides advanced controls, and restores the last chosen strategy.
- Current strategy follows explicit preset state instead of value matching.
- Reset button label follows configured default preset and base currency.
- Language changes do not switch current strategy to custom.
- Render includes presets, demo, marketing sections, and `Version 2.0`.
- Initial render shows Quick start before the builder.
- Installed app links ask for disclaimer confirmation before opening.
- Preset ids can differ from configured icon style.
- Auto logic summary reflects current state.
- GitHub Actions test workflow is configured.
- Asset-class pie badge follows selected asset classes.
- Prompt export helpers create stable `.txt` and `.md` filenames and MIME types.
- UI range labels use localized separators: English `to`, German `bis`.

## Automated Browser Tests

The Playwright test file is `tests/e2e/prompt-builder.spec.js`.

It runs in:

- `chromium-desktop`
- `chromium-mobile`

It currently checks:

- The app renders and generates the default English prompt.
- The app shows `Version 2.0`.
- German UI and German prompt output work.
- Equity allocation range updates when risk appetite changes.
- Current strategy changes only through preset and reset actions.
- Quick start recommends and applies a coherent strategy.
- Quick start opens Basic mode by default.
- Basic mode collapses advanced controls and keeps required options selected.
- German Basic mode breaks long summary labels cleanly.
- Maximum equity warning appears only once until risk appetite changes.
- Risk/horizon and empty-selection alerts appear.
- USD hides home-bias guidance and removes the home-bias requirement.
- Preferred exchange changes update the prompt.
- Reset restores defaults after parameter changes.
- Copy button writes the generated prompt to clipboard.
- Export buttons download `.txt` and `.md` prompt files.
- ETF count buttons respect min/max boundaries in the UI and prompt.
- ETF count auto-reduces with deselected asset classes until manual override.
- Equal equity and equal ETF targets use exact wording.
- Mobile viewport has usable controls without horizontal overflow.

One responsive test is intentionally skipped in the desktop Playwright project because it is mobile-only.

## GitHub Actions

CI runs on every push and pull request to `main`.

Workflow file:

```text
.github/workflows/tests.yml
```

CI steps:

- Check out repository.
- Set up Node.js.
- Install dependencies with `npm ci`.
- Install Playwright Chromium.
- Run `npm test`.

A GitHub warning about Node.js 20 deprecation in Actions can appear. The repository currently forces JavaScript Actions to Node 24 and uses Node 22 for the test runtime. Treat the run as good if the `Tests` workflow completes successfully.

## Manual Local Browser Test

Start a local static server:

```powershell
cd "C:\Users\volkm\Documents\Code\allocation-prompt-engine"
npx.cmd --yes http-server -p 5173
```

Open:

```text
http://localhost:5173/index.html
```

Then check:

- The Quick start intro appears first and the builder is hidden.
- The intro field headers show separate numbering (`START`, `1`, `2`, `3`, `4`) with normal label styling.
- Switching intro language updates the intro labels without layout jump.
- Basic mode is selected by default in the intro.
- Applying Quick start opens the builder with the selected Basic/Pro mode.
- The app is not blank after a hard refresh.
- The header and two-column layout render correctly on desktop after the builder opens.
- The copy button copies the generated prompt.
- Export `.txt` and `.md` buttons work in Pro mode.
- No browser console errors appear.
- The layout is usable on a narrow/mobile-width window.

## Intro / Quick Start Test Matrix

Check these combinations manually when changing the intro:

- Language: `English`, `German`
- Base currency: `CHF`, `EUR`, `USD`, `GBP`
- Investment horizon: `>=3 years`, `>=5 years`, `>=10 years`
- Risk appetite: `Low`, `Moderate`, `High`, `Very high`
- App Mode: `Basic`, `Pro`

Expected strategy recommendation logic:

- `Low` risk or short horizon should recommend Conservative.
- `Moderate` risk with suitable horizon should recommend Balanced.
- `High` risk with `>=10 years` should recommend Growth.
- `Very high` risk with `>=10 years` should recommend Aggressive.
- The recommendation text includes the equity range, e.g. `60-80% equity` or `60-80% Aktien`.
- The selected Quick start strategy becomes the session reset default.
- Changing language must not switch the current strategy to Custom.

## Strategy Preset Matrix

Current preset defaults from `config.js`:

| Preset | Risk appetite | Horizon | Equity range | Default asset-class exclusions |
| --- | --- | --- | --- | --- |
| Conservative | Low | >=3 years | 20-40% | Listed Real Estate, Crypto Assets |
| Balanced | Moderate | >=5 years | 40-60% | Listed Real Estate, Crypto Assets |
| Growth | High | >=10 years | 60-80% | Listed Real Estate |
| Aggressive | Very high | >=10 years | 80-100% | Bonds |

Default app state:

- Default preset: `Growth`
- Default base currency: `CHF`
- Default ETF count base: `8-12`
- Current app version: `2.0`

When presets change:

- Risk appetite, investment horizon, equity range, asset classes, exchange auto/default, and ETF counts should update coherently.
- Strategy names and labels should follow `config.js`.
- Current strategy should return from Custom to a preset only through explicit preset/reset logic.

## Currency / Exchange Matrix

Base currency order:

```text
CHF / EUR / USD / GBP
```

Default exchange by base currency:

| Currency | Default exchange |
| --- | --- |
| CHF | SIX Swiss Exchange |
| EUR | XETRA Deutsche Boerse |
| USD | NYSE American Stock Exchange |
| GBP | LSE London Stock Exchange |

Check:

- Currency changes update the exchange while exchange is Auto.
- If exchange was changed manually, currency changes do not override it.
- Clicking the Auto/Manual exchange status restores the currency default.
- Exchange selector has enough width on desktop.

## Currency / Home-Bias / Equity Region Tests

For base currency:

- `CHF`: Home-bias guidance is visible; prompt addresses Swiss home bias; Swiss equities are separate; ETF coverage adds one position for Swiss equities.
- `EUR`: Home-bias guidance is visible; prompt addresses European home bias; Swiss equities are included in Europe.
- `GBP`: Home-bias guidance is visible; prompt addresses British home bias; Swiss equities are included in Europe.
- `USD`: Home-bias guidance is hidden and the home-bias requirement is skipped.

Check the badges:

- Asset-class bubble shows selected asset-class count.
- Asset-class pie chart changes when classes are selected/deselected.
- Equity-region bubble appears when equities are selected.
- Equity-region sparkline aligns cleanly and has no lower white-background artifact.

## Basic Mode Tests

In Basic mode:

- Advanced fields collapse: risk appetite, horizon, exchange, equity range, ETF positions, output sections, prompt instructions, and auto logic.
- Required output sections are all selected.
- Prompt instructions are all selected.
- Equities are selected and cannot be unselected after switching into Basic.
- Jump-to-prompt button is hidden.
- Reset defaults/original strategy button is hidden.
- Export `.txt` and `.md` buttons are hidden.
- Auto logic section on the right is hidden.
- Summary pills explain the automatic values.
- German summary labels break cleanly, e.g. `Risiko- Appetit` and `Anlage- Horizont`.

## Pro Mode Tests

In Pro mode:

- All advanced controls are visible.
- Output sections can be selected/deselected.
- Prompt instructions can be selected/deselected.
- Export `.txt` and `.md` buttons are visible.
- Reset original strategy button is visible.
- Jump-to-prompt button is visible.
- Auto/Manual status buttons are visible for equity range, ETF positions, and exchange.

## Equity Range Tests

Check preset equity ranges:

- Conservative / Low: `20-40%`
- Balanced / Moderate: `40-60%`
- Growth / High: `60-80%`
- Aggressive / Very high: `80-100%`

Also test:

- Minimum equity cannot exceed maximum equity.
- Maximum equity cannot go below minimum equity.
- Plus/minus buttons move in 5 percentage point steps.
- If equities are deselected, the range becomes `0-0%`.
- If minimum and maximum are equal, the prompt uses exact single-value wording.
- If maximum equity is too high for the chosen risk appetite, a warning appears once.
- The warning does not repeat while the same risk appetite remains selected.
- The warning can appear again after changing risk appetite.
- Changing risk appetite resets equity range to Auto and clears the manual flag.

## ETF Count Tests

Check:

- ETF count fields have a frame similar to Equity allocation range.
- Minimum ETF count cannot exceed maximum ETF count.
- Maximum ETF count cannot go below minimum ETF count.
- Mobile plus/minus controls remain visible and usable.
- The prompt updates the ETF count target, for example `7-11 positions`.
- If minimum and maximum ETF counts are equal, the prompt uses exact single-value wording.
- ETF counts auto-reduce when asset classes are deselected until the user manually changes the ETF count.
- Deselecting equities reduces ETF count by five while still respecting the coverage floor.
- Reset original strategy returns ETF count to automatic behavior.
- ETF coverage warnings list selected asset classes when the minimum count is too low.
- For CHF portfolios with equities, the Swiss-equity add-on explanation appears only for CHF.

## Asset Class Tests

Toggle asset classes:

- Cash / Money Market
- Bonds
- Equities by region
- Commodities / Precious Metals
- Listed Real Estate
- Crypto Assets

Verify:

- The generated prompt includes only selected asset classes.
- If no asset class is selected, a pop-up appears.
- The generated fallback text says at least one eligible asset class is required.
- Low-risk profiles warn when Cash / Money Market or Bonds are deselected.
- Balanced and higher profiles warn when equities are deselected.
- Real estate and crypto warnings appear when ETF count is too low for clean implementation.
- Synthetic ETF assessment does not warn when equities are deselected.

## Output Section Tests

Toggle each output section:

- A) Target allocation
- B) ETF implementation
- C) Assumptions summary
- D) Currency overview
- E) Top 10 look-through holdings
- F) Rebalancing concept
- G) Weighted TER estimate

Verify:

- The generated prompt includes only selected sections.
- Section letters are re-lettered alphabetically when sections are omitted.
- If no output section is selected, a pop-up appears.
- The generated fallback text says at least one section is required.
- Table 2 keeps `Target weight` as the second column when included.

## Prompt Instruction Tests

Toggle each Prompt instruction checkbox:

- Home-bias guidance
- Hedging discussion
- ETF look-through exposure assessment
- Synthetic ETF assessment

Verify:

- Toggling each option adds/removes only the relevant requirement.
- Requirement numbering stays sequential.
- With default CHF settings, synthetic ETFs are requirement `12` and language is requirement `13`.
- Checkbox descriptions are user-facing, not implementation notes.
- Synthetic ETF text mentions structural advantages, market efficiency, and US tax / withholding-tax leakage.
- Look-through text says to assess underlying exposures and, if relevant, include a look-through asset allocation overview after Table 1.

## Table / Prompt Content Tests

Check the generated prompt includes:

- Role/objective block.
- Investor parameters.
- Eligible asset classes.
- Requirements and constraints.
- Output format sections.
- Table 1 columns: `Asset class | Target weight | Purpose / role`.
- Table 2 columns: `Asset class | Target weight | ETF name | ISIN | Ticker (exchange) | TER | Domicile | Replication | Distribution / accumulation | Share class currency | Short comment`.
- German equivalents for German mode.
- No investment disclaimer inside the generated prompt.
- Disclaimer remains visible in the app entry mask.
- Final language requirement matches selected output language.

## Copy / Export Tests

Check:

- Copy button writes the current generated prompt to the clipboard.
- `.txt` export downloads a plain text file.
- `.md` export downloads a markdown file.
- Export filenames are stable and include useful prompt-builder naming.
- Export buttons are visible only in Pro mode.

## Responsive Layout Tests

Desktop:

- Quick start intro keeps stable width when switching language.
- Builder hero/header spans well after the builder opens.
- Control and output panels align cleanly.
- Strategy preset details can collapse/expand.
- Equity and ETF count cards do not overlap.
- Exchange field is wide enough.
- Section blocks are visually distinguishable.

Mobile:

- App Mode switch remains visible on the top-right area of the builder header.
- Dropdowns are readable.
- Plus/minus buttons are tappable.
- Equity and ETF count cards stack cleanly.
- Output prompt remains readable.
- No horizontal scrolling unless caused by prompt text itself.
- Tooltip/info buttons remain usable.

## WordPress / Plesk Deployment Tests

After upload to `https://bicon.li/prompt-builder/`:

- Upload/replace `index.html`, `config.js`, `app.js`, and `styles.css` if changed.
- If only config values changed, upload `config.js`.
- If only logic changed, upload `app.js`.
- If layout changed, upload `styles.css`.
- Do not upload local test/development folders such as `node_modules`, `test-results`, or `playwright-report`.
- Hard refresh with `Ctrl + F5`.
- Test in an incognito/private window.
- Confirm browser developer tools show the newest `app.js`, `config.js`, and `styles.css`.
- If the live site is blank, check the first red console error.

## Cache Busting Check

If a change is missing online:

- Confirm the changed file was uploaded to the correct folder.
- Hard refresh with `Ctrl + F5`.
- Open the file URL directly, for example `/prompt-builder/app.js`, and search for the new text.
- Open `/prompt-builder/config.js` directly if presets, exchanges, currency defaults, or ETF count defaults changed.
- If the old text still appears, the server, WordPress, Jetpack, CDN, or browser is serving a cached file.

## Pre-Push Checklist

Before pushing to GitHub:

```powershell
cd "C:\Users\volkm\Documents\Code\allocation-prompt-engine"
npm.cmd run test:unit
npm.cmd run test:e2e
& 'C:\Program Files\Git\cmd\git.exe' status --short --branch
```

Then commit and push:

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add <changed-files>
& 'C:\Program Files\Git\cmd\git.exe' commit -m "Short meaningful message"
& 'C:\Program Files\Git\cmd\git.exe' push origin main
```

After pushing:

```powershell
& 'C:\Program Files\GitHub CLI\gh.exe' run list --repo volkmarritter/allocation-prompt-engine --limit 3
```

Wait for the newest `Tests` workflow to complete successfully.

## Pre-Release Checklist

Before publishing to bicon.li:

- Pull latest `main` from GitHub.
- Run `npm.cmd run test:unit`.
- Run `npm.cmd run test:e2e`.
- Start local server with `npx.cmd --yes http-server -p 5173`.
- Test Quick start in English and German.
- Test Basic and Pro mode once.
- Test one Conservative, one Growth, and one Aggressive scenario.
- Test CHF and USD home-bias behavior.
- Test one EUR or GBP exchange default.
- Copy the generated prompt once.
- Export `.txt` and `.md` once in Pro mode.
- Upload changed files.
- Hard refresh live page.
- Run a final live smoke test.
