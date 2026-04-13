# Test Playbook

This playbook covers the practical test set for the Portfolio Prompt Builder. The app is static HTML/CSS/JavaScript, so the goal is to catch prompt regressions, UI wiring issues, browser problems, and deployment/cache mistakes.

## Quick Smoke Test

Run this after every change:

```powershell
cd "D:\Dropbox\Dropbox\Backup\Documents\Codex\Projects\prompt-builder"
node --check app.js
node --check tests/app.test.js
npm.cmd test
```

Expected result:

```text
All unit tests and Playwright browser tests pass.
```

If PowerShell blocks `npm`, use `npm.cmd` instead of `npm`.

To run only the fast Node logic tests:

```powershell
npm.cmd run test:unit
```

To run only the Playwright browser tests:

```powershell
npm.cmd run test:e2e
```

## Automated Tests

The automated test file is `tests/app.test.js`.

It currently checks:

- `index.html` contains the app root and loads `styles.css` and `app.js`.
- Source files do not contain broken replacement characters.
- English prompt output includes the current Table 2 format.
- German prompt output includes the current Table 2 format.
- Table 2 includes `Target weight` / `Zielgewicht` as the second column.
- Look-through text includes the asset allocation overview after Table 1.
- Synthetic ETF requirement is present and numbered correctly.
- Synthetic ETF wording includes US tax / US-Steuereffizienz references.
- Prompt-instruction checkbox descriptions do not say `Adds a numbered requirement`.
- Equity allocation ranges are mapped correctly by risk appetite.
- Maximum equity warning appears once per risk appetite.
- Empty asset-class and output-section pop-ups trigger.
- Risk/horizon warning triggers.
- ETF count fields use the framed range-group UI.
- Section color hooks exist for asset classes, output sections, and prompt instructions.
- Base currency controls home-bias and equity-region logic for `CHF`, `EUR`, `GBP`, and `USD`.
- Selected output sections are re-lettered alphabetically.
- Min/max ETF counts cannot cross.
- Min/max equity weights cannot cross and stay within `0-100%`.
- Risk/horizon warning matrix is enforced.

## Automated Browser Tests

The Playwright browser test file is `tests/e2e/prompt-builder.spec.js`.

It currently checks:

- The app renders in Chromium.
- The default English prompt includes the current Table 2 and synthetic ETF wording.
- German UI and German prompt generation work.
- Equity allocation changes when risk appetite changes.
- Maximum equity warning appears once per risk appetite.
- Risk/horizon pop-up appears.
- Empty asset-class and output-section pop-ups appear.
- USD hides the home-bias checkbox and removes the home-bias requirement.
- Preferred exchange changes update the generated prompt.
- Reset restores default values.
- Copy writes the generated prompt to the clipboard.
- ETF count buttons respect min/max boundaries in the UI and prompt.
- The ETF count frame is visible.
- Mobile viewport keeps ETF plus/minus controls usable.
- Mobile viewport has no unexpected horizontal overflow.

One responsive test is intentionally skipped for the desktop project because it is mobile-only.

## Manual Browser Test

Open the app locally:

```powershell
cd "D:\Dropbox\Dropbox\Backup\Documents\Codex\Projects\prompt-builder"
start .\index.html
```

Then check:

- The app is not blank.
- The header and two-column layout render correctly on desktop.
- The app still works after a browser hard refresh.
- The copy button copies the generated prompt.
- No browser console errors appear.
- The layout is usable on a narrow/mobile-width window.

## Parameter Test Matrix

Check these core dropdowns:

- Language: `English`, `German`
- Base currency: `CHF`, `EUR`, `USD`, `GBP`
- Risk appetite: `Low`, `Moderate`, `Balanced`, `High`, `Very high`
- Investment horizon: `>=3 years`, `>=5 years`, `>=10 years`
- Preferred exchange: `SIX Swiss Exchange`, `XETRA Deutsche Börse`, `LSE London Stock Exchange`

For each language, verify:

- UI labels switch language.
- Dropdown option labels switch language where intended.
- Generated prompt switches language.
- German text displays umlauts correctly.

## Equity Range Tests

Changing risk appetite should reset the equity range:

- `Low`: `25-45%`
- `Moderate`: `40-60%`
- `Balanced`: `55-75%`
- `High`: `75-95%`
- `Very high`: `90-100%`

Also test:

- Minimum equity cannot exceed maximum equity.
- Maximum equity cannot go below minimum equity.
- Plus/minus buttons move in 5 percentage point steps.
- If the maximum equity weight is manually moved above the suggested upper limit, the warning appears once.
- The warning does not repeat while the same risk appetite remains selected.
- The warning can appear again after changing risk appetite.

## ETF Count Tests

Check:

- ETF count fields have a frame similar to Equity allocation range.
- Minimum ETF count cannot exceed maximum ETF count.
- Maximum ETF count cannot go below minimum ETF count.
- Mobile plus/minus controls remain visible and usable.
- The prompt updates the ETF count target, for example `8-12 positions`.

## Prompt Instruction Tests

Toggle each Prompt instruction checkbox:

- Home-bias guidance
- Hedging discussion
- Look-through exposure assessment
- Synthetic ETF assessment

Verify:

- Toggling each option adds/removes only the relevant requirement.
- Requirement numbering stays sequential.
- With default CHF settings, synthetic ETFs are requirement `12` and language is requirement `13`.
- Checkbox descriptions are written as user-facing descriptions, not implementation notes.

## Currency/Home-Bias Tests

For base currency:

- `CHF`: Home-bias checkbox is visible; prompt addresses Swiss home bias; equities use Switzerland separately.
- `EUR`: Home-bias checkbox is visible; prompt addresses European home bias; equities include Switzerland in Europe.
- `GBP`: Home-bias checkbox is visible; prompt addresses British home bias; equities include Switzerland in Europe.
- `USD`: Home-bias checkbox is hidden; home-bias requirement is skipped.

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
- Section letters are re-numbered alphabetically when sections are omitted.
- If no output section is selected, a pop-up appears.
- The generated fallback text says at least one section is required.

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

## Table/Prompt Content Tests

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

## Responsive Layout Tests

Desktop:

- Hero/header spans well across the page.
- Control and output panels align cleanly.
- Equity and ETF count cards do not overlap.
- Section blocks are visually distinguishable.

Mobile:

- Dropdowns are readable.
- Plus/minus buttons are tappable.
- Equity and ETF count cards stack cleanly.
- Output prompt remains readable.
- No horizontal scrolling unless caused by the prompt text itself.

## WordPress/Plesk Deployment Tests

After upload to `https://bicon.li/prompt-builder/`:

- Upload/replace `index.html`, `app.js`, and `styles.css` if changed.
- If only logic changed, upload `app.js`.
- If layout changed, upload `styles.css`.
- Do not upload local test/development folders such as `node_modules`, `test-results`, or `playwright-report`.
- Hard refresh with `Ctrl + F5`.
- Test in an incognito/private window.
- Confirm browser developer tools show the newest `app.js`.
- If the live site is blank, check the first red console error.

## Cache Busting Check

If a change is missing online:

- Confirm the changed file was uploaded to the correct folder.
- Hard refresh with `Ctrl + F5`.
- Open the file URL directly, for example `/prompt-builder/app.js`, and search for the new text.
- If the old text still appears, the server or browser is serving a cached file.

## Pre-Release Checklist

Before publishing:

- Run `npm.cmd test`.
- Open `index.html` locally.
- Test English and German prompt generation.
- Test one low-risk and one very-high-risk scenario.
- Test CHF and USD home-bias behavior.
- Copy the generated prompt once.
- Upload changed files.
- Hard refresh live page.
- Run a final live smoke test.
