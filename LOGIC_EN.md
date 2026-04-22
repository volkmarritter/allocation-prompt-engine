# Portfolio Prompt Builder: Strategy and Parameter Logic

This file documents the app's business logic for strategy presets, selected parameters, automatic adjustments, and validation pop-ups.

## Default State

- `Base currency`: `CHF`
- `Risk appetite`: `High`
- `Investment horizon`: `>=10 years`
- `Equity allocation range`: `60% to 80%`
- `Preferred exchange`: `SIX Swiss Exchange`
- `Target ETF positions`: `7 to 11`
- `Language`: `English`
- All asset classes except `Listed Real Estate` are selected by default, in line with the `Growth` preset.
- All output sections `A` to `H` are selected by default.
- Prompt instructions for home bias, hedging, look-through, and synthetic ETFs are enabled by default.
- Execution mode defaults to `Strict` in Pro; Basic always uses `Fast`.

The reset button is labelled `Reset defaults: Growth CHF` or, in German, `Zurücksetzen: Wachstum CHF`.

## Investment Strategy Presets

The presets set risk appetite, investment horizon, equity allocation range, and asset classes; the ETF target count is then strictly derived in Auto mode from the configured base value.
These values are maintained in `config.js` so they can be adjusted without editing the core app logic.

| Preset | Risk appetite | Investment horizon | Equity allocation range | Special logic |
| --- | --- | --- | --- | --- |
| Conservative / Konservativ | `Low` | `>=3 years` | `20% to 40%` | `Cash`, `Bonds`, `Equities`, and `Commodities` are enabled; `Listed Real Estate` and `Crypto Assets` are deselected; ETF target count is derived from `etfCountBase` as `6 to 10`; ETF status remains `Auto`. |
| Balanced / Ausgewogen | `Moderate` | `>=5 years` | `40% to 60%` | `Crypto Assets` and `Listed Real Estate` are deselected; ETF target count is derived from `etfCountBase` as `6 to 10`; ETF status remains `Auto`. |
| Growth / Wachstum | `High` | `>=10 years` | `60% to 80%` | `Listed Real Estate` is deselected while `Crypto Assets` remains enabled; ETF target count is derived from `etfCountBase` as `7 to 11`; ETF status remains `Auto`. |
| Aggressive / Aggressiv | `Very high` | `>=10 years` | `80% to 100%` | `Bonds` are deselected while `Listed Real Estate` and `Crypto Assets` remain enabled; ETF target count is derived from `etfCountBase` as `7 to 11`; ETF status remains `Auto`. |

The preset description explicitly shows the equity allocation range as `XX-XX% equity` or `XX-XX% Aktien`.

## Configuration in `config.js`

`config.js` contains the editable business configuration:

- `presets`: strategy profiles including risk appetite, investment horizon, equity allocation range, and asset classes.
- `etfCountBase`: ETF target count when all asset classes are selected; currently `8 to 12`.
- `label` and `deLabel`: visible strategy names; `id` can also be changed if `defaultPresetId` and references use the new id.
- `icon`: preset icon style (`conservative`, `balanced`, `growth`, `aggressive`).
- `exchanges`: exchanges available in the `Preferred exchange` selector.
- `defaultBaseCurrency`: base currency used for initial load and reset.
- `defaultExchangeByCurrency`: default exchange per base currency.
- `defaultPresetId`: preset used for initial load and reset.

When publishing the app to WordPress/Plesk, upload `config.js` together with `index.html`, `styles.css`, and `app.js`.

## Risk Appetite and Equity Allocation Range

If `Equities` is selected, the equity allocation range is set automatically by risk appetite:

| Risk appetite | Equity allocation range |
| --- | --- |
| `Low` | `20% to 40%` |
| `Moderate` | `40% to 60%` |
| `High` | `60% to 80%` |
| `Very high` | `80% to 100%` |

If `Equities` is deselected:

- The equity allocation range is automatically set to `0% to 0%`.
- The status remains `Auto`.
- Plus/minus controls cannot increase the equity allocation while `Equities` is deselected.
- Changing the risk appetite also cannot increase the equity allocation while `Equities` is deselected.
- When `Equities` is reselected, the equity allocation range is restored to the current risk appetite's Auto range.

If the user changes the equity allocation range with the plus/minus controls:

- The status changes to `Manual`.
- Changing the risk appetite resets the equity allocation range to the relevant Auto range and switches the status back to `Auto`.
- Clicking `Manual` also restores the relevant Auto range.

## ETF Target Count

Base value for the Auto calculation in `config.js`:

- `etfCountBase.min`: `8`
- `etfCountBase.max`: `12`

Because the default state follows the `Growth` preset and `Listed Real Estate` is deselected, the app effectively starts with:

- `7 to 11` ETF positions.

As long as the user has not manually changed the ETF target count:

- Each deselected non-equity asset class reduces both minimum and maximum by `1`.
- Deselecting `Equities` reduces both minimum and maximum by `5`.
- The minimum ETF count is never set below the number of selected asset classes; for `CHF` portfolios with equities, one additional Swiss equity position is included in that minimum.
- The maximum is never smaller than the minimum.

If the user changes the ETF target count with the plus/minus controls:

- The status changes to `Manual`.
- Further asset-class changes no longer automatically adjust the ETF target count.
- Clicking `Manual` switches back to Auto and recalculates the ETF target count based on the currently selected asset classes.

For the `Conservative` preset:

- `Listed Real Estate` and `Crypto Assets` are deselected.
- `Cash`, `Bonds`, `Equities`, and `Commodities` are enabled.
- ETF target count is automatically derived from `etfCountBase` as `6 to 10`.
- ETF status remains `Auto`.

If `Balanced`, `Growth`, or `Aggressive` is selected afterwards:

- `Balanced` enables `Bonds` and `Equities`, while `Listed Real Estate` and `Crypto Assets` remain deselected.
- `Growth` enables `Bonds`, `Equities`, and `Crypto Assets`, while `Listed Real Estate` remains deselected.
- `Aggressive` enables `Equities`, `Listed Real Estate`, and `Crypto Assets`, while `Bonds` remains deselected.
- `Balanced` derives the ETF target count `6 to 10` from the base value.
- `Growth` derives the ETF target count `7 to 11` from the base value.
- `Aggressive` derives the ETF target count `7 to 11` from the base value.
- ETF status remains `Auto` in each case.

## Base Currency and Preferred Exchange

In Auto mode, the preferred exchange is derived from the base currency:

| Base currency | Auto exchange |
| --- | --- |
| `CHF` | `SIX Swiss Exchange` |
| `EUR` | `XETRA Deutsche Börse` |
| `USD` | `SIX Swiss Exchange` |
| `GBP` | `LSE London Stock Exchange` |

If the user manually changes `Preferred exchange`:

- The status changes to `Manual`.
- Later base-currency changes no longer adjust the exchange automatically.
- Clicking `Manual` restores `Auto` and sets the exchange according to the current base currency.

## Home Bias and Equity Regions

Home-bias logic depends on the base currency:

| Base currency | Home-bias logic |
| --- | --- |
| `CHF` | Swiss home bias is addressed; equity regions include `Europe ex-CH` and `Switzerland (CH)` separately. |
| `EUR` | European home bias is addressed; Europe includes Switzerland within Europe. |
| `GBP` | British home bias is addressed; Europe includes Switzerland within Europe. |
| `USD` | The home-bias checkbox is hidden; no home-bias requirement is written into the prompt. |

## Language and Range Display

The UI and prompt language can be set to `English` or `German`.

Range displays use:

- English: `40% to 60%`, `8 to 12`
- German: `40% bis 60%`, `8 bis 12`

If minimum and maximum are identical:

- English: `Equity allocation: 75%` or `Target exactly 8 positions`
- German: `Aktienquote: 75%` or `Ziel: genau 8 Positionen`

## Output Sections

Output sections `A` to `H` can be enabled or disabled individually.

If sections are omitted:

- The remaining sections are re-lettered alphabetically.
- If no output sections are selected, a pop-up appears.

## Prompt Instructions

Optional prompt instructions:

- Home-bias guidance
- Currency hedging discussion
- Look-through exposure assessment
- Synthetic ETF assessment

Execution mode controls the reasoning depth in the generated prompt:

- `Fast`: focuses on speed, clarity, and pragmatic portfolio construction.
- `Strict`: requires structured reasoning discipline, ordered decision steps, and internal validation before the final answer.

In Basic mode, the prompt-instructions area is collapsed and execution mode is always written into the prompt as `Fast`.
In Pro mode, execution mode can be switched between `Fast` and `Strict` in the prompt-instructions area; the default is `Strict`.

The home-bias instruction is hidden for `USD`.

The synthetic ETF instruction mentions structural advantages, especially market efficiency and reduced withholding-tax leakage for US equity exposure, and asks for this to be explained in the summary.

## Validation Checks and Pop-Ups

All pop-ups are warnings, not blockers.

### Risk Appetite and Investment Horizon

- `Very high` + investment horizon below `>=10 years`: warning.
- `High` + investment horizon below `>=5 years`: warning.

### Maximum Equity Allocation

If the maximum equity allocation is above the Auto upper bound for the selected risk appetite, a warning appears.

This warning appears only once per risk appetite until the risk appetite is changed.

### No Asset Classes or No Output Sections

- If no asset class is selected: pop-up.
- If no output section is selected: pop-up.

### Low Without Cash or Bonds

If `Risk appetite` is `Low`:

- Warning when `Cash / Money Market` is deselected.
- Warning when `Bonds` are deselected.
- If Cash or Bonds are added back, no new warning appears.
- If the user later switches to `Low` while Cash/Bonds are already missing, a warning also appears.

### Moderate and Higher Without Equities

If `Risk appetite` is `Moderate`, `High`, or `Very high`:

- Warning when `Equities` are deselected.
- If `Equities` are added back, no new warning appears.
- If the user later switches to `Moderate`, `High`, or `Very high` while `Equities` are already missing, a warning also appears.

### Crypto With Low Risk Appetite

If `Crypto Assets` is selected and `Risk appetite` is `Low`:

- Warning that crypto should be justified especially carefully as a high-volatility satellite allocation.

### Crypto Without Rebalancing Concept

If `Crypto Assets` is selected and output section `F) Rebalancing concept` is disabled:

- Warning that a rebalancing concept is especially important for crypto because allocations may drift materially.

### Bonds Deselected With Short Horizon

If `Bonds` are deselected and `Investment horizon` is `>=3 years`:

- Warning that excluding bonds should be reviewed carefully because stabilizing assets can be especially important at shorter horizons.

### Look-through Section Without Look-through Instruction

If output section `E) Top 10 look-through holdings` is active but the look-through instruction is disabled:

- Warning that the expected response may become less explicit.

### Minimum ETF Count Relative to Asset Classes

If the minimum ETF target count is lower than the number of selected asset classes:

- Pop-up listing the selected asset classes.
- Warning that the minimum ETF count should at least match the number of selected asset classes.
- For `CHF` with selected `Equities`, `+1` is counted because Swiss equities are treated as a separate equity allocation.
- Example: 5 selected asset classes including equities in `CHF` imply a suggested minimum of `6` ETFs.

## Copy and Export

The generated prompt can be:

- copied to the clipboard,
- exported as `.txt`,
- exported as `.md`.

The export uses the same prompt text as the copy button. Filenames follow this pattern:

- `portfolio-prompt-chf-high.txt`
- `portfolio-prompt-chf-high.md`
