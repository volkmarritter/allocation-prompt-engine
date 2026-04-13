# Portfolio Prompt Builder

A lightweight static prompt builder that turns configurable investor parameters into a structured portfolio-strategy prompt in English or German.

## Files

- `index.html` - page shell
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

## What it does

- Lets users configure the bracketed portfolio parameters from the original source prompt
- Generates the final prompt in English or German
- Supports toggling eligible asset classes and output sections
- Supports prompt instructions for home bias, hedging, ETF look-through, and synthetic ETFs
- Keeps the implementation static with no backend or database dependency
