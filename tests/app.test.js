const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const configCode = fs.readFileSync(path.join(projectRoot, "config.js"), "utf8");
const appCode = fs.readFileSync(path.join(projectRoot, "app.js"), "utf8");
const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
const css = fs.readFileSync(path.join(projectRoot, "styles.css"), "utf8");
const logoSvg = fs.readFileSync(path.join(projectRoot, "allocation-compass-logo.svg"), "utf8");
const logoWithNameSvg = fs.readFileSync(path.join(projectRoot, "allocation-compass-logo-with-name.svg"), "utf8");
const packageJson = fs.readFileSync(path.join(projectRoot, "package.json"), "utf8");
const workflow = fs.readFileSync(path.join(projectRoot, ".github", "workflows", "tests.yml"), "utf8");

function createContext() {
  return createContextWithConfig(configCode);
}

function createContextWithConfig(configSource, initialStorage = {}) {
  const storage = new Map(Object.entries(initialStorage));
  const context = {
    console,
    setTimeout,
    clearTimeout,
    document: {
      addEventListener() {},
      getElementById() {
        return { innerHTML: "" };
      },
      querySelector() {
        return null;
      },
    },
    navigator: {
      clipboard: {
        writeText: async () => {},
      },
    },
    window: {
      __alerts: [],
      location: {
        search: "",
      },
      alert(message) {
        this.__alerts.push(String(message));
      },
      localStorage: {
        getItem(key) {
          return storage.has(key) ? storage.get(key) : null;
        },
        setItem(key, value) {
          storage.set(key, String(value));
        },
        removeItem(key) {
          storage.delete(key);
        },
      },
      clearTimeout,
      setTimeout,
    },
    URLSearchParams,
  };

  vm.createContext(context);
  vm.runInContext(configSource, context, { filename: "config.js" });
  vm.runInContext(appCode, context, { filename: "app.js" });
  return context;
}

function run(context, code) {
  return vm.runInContext(code, context);
}

function reset(context) {
  run(
    context,
    `
      state = createDefaultState();
      lastRiskHorizonAlertKey = "";
      lastSelectionAlertKey = "";
      lastEquityRiskAlertKey = "";
      lastDefensiveAssetAlertKey = "";
      lastEquityAssetAlertKey = "";
      lastAdditionalLogicAlertKey = "";
      activePresetId = defaultPresetId;
      lastChosenPresetId = defaultPresetId;
      window.__alerts = [];
      sessionDefaultPresetId = defaultPresetId;
      sessionDefaultBaseCurrency = defaultBaseCurrency;
    `
  );
}

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test("static entry points are wired", () => {
  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /href="\.\/styles\.css"/);
  assert.match(html, /src="\.\/config\.js"[\s\S]*src="\.\/app\.js"/);
  assert.match(html, /src="\.\/app\.js"/);
});

test("allocation compass logo file is available", () => {
  assert.match(logoSvg, /<svg[^>]+viewBox="0 0 64 64"/);
  assert.match(logoSvg, /Allocation Compass logo/);
  assert.match(logoSvg, /M32 32l15-20/);
  assert.match(logoWithNameSvg, /<svg[^>]+viewBox="0 0 420 96"/);
  assert.match(logoWithNameSvg, /Portfolio Prompt Builder logo/);
  assert.match(logoWithNameSvg, />Portfolio Prompt</);
  assert.match(logoWithNameSvg, />BUILDER</);
});

test("source files have no replacement characters", () => {
  assert.equal(configCode.includes("\uFFFD"), false);
  assert.equal(appCode.includes("\uFFFD"), false);
  assert.equal(css.includes("\uFFFD"), false);
  assert.equal(html.includes("\uFFFD"), false);
  assert.equal(logoSvg.includes("\uFFFD"), false);
  assert.equal(logoWithNameSvg.includes("\uFFFD"), false);
});

test("source files have no mojibake markers", () => {
  const mojibakePattern = /Ã.|Â.|â[€™€œ€“€”]/;
  assert.equal(mojibakePattern.test(configCode), false);
  assert.equal(mojibakePattern.test(appCode), false);
  assert.equal(mojibakePattern.test(css), false);
  assert.equal(mojibakePattern.test(html), false);
});

test("portfolio strategy and exchange defaults are loaded from config", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      [
        window.PROMPT_BUILDER_CONFIG.presets.length,
        portfolioPresets === window.PROMPT_BUILDER_CONFIG.presets,
        exchangeOptions.join("|"),
        defaultBaseCurrency,
        defaultExchangeByCurrency.EUR,
        defaultPresetId,
        defaultMinEtfs,
        defaultMaxEtfs,
        window.PROMPT_BUILDER_CONFIG.presets.every((preset) => !("minEtfs" in preset) && !("maxEtfs" in preset)),
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    4,
    true,
    "SIX Swiss Exchange|XETRA Deutsche Börse|NYSE American Stock Exchange|LSE London Stock Exchange",
    "CHF",
    "XETRA Deutsche Börse",
    "growth",
    8,
    12,
    true,
  ]);
});

test("ETF count base is loaded from config and drives automatic strategy ranges", () => {
  const customConfigCode = configCode.replace("min: 8,", "min: 10,").replace("max: 12,", "max: 14,");
  const context = createContextWithConfig(customConfigCode);
  reset(context);

  const result = run(
    context,
    `
      applyPreset("growth");
      const growth = [state.minEtfs, state.maxEtfs, state.etfCountManuallyAdjusted];
      applyPreset("balanced");
      const balanced = [state.minEtfs, state.maxEtfs, state.etfCountManuallyAdjusted];
      [defaults.minEtfs, defaults.maxEtfs, growth, balanced];
    `
  );

  assert.deepEqual(Array.from(result, (item) => Array.isArray(item) ? Array.from(item) : item), [
    10,
    14,
    [9, 13, false],
    [8, 12, false],
  ]);
});

test("English prompt includes current Table 2 and instruction requirements", () => {
  const context = createContext();
  reset(context);

  const prompt = run(context, "buildPrompt()");

  assert.match(prompt, /Columns: Group: Cash, Bonds, Equities, Commodities, Satellites \| Asset class \| Target weight \| Purpose \/ role in the portfolio/);
  assert.match(prompt, /After Table 1, add a short "Percentage allocation per group" overview/);
  assert.match(prompt, /Ensure the group totals reconcile with the target allocation and add up to 100%/);
  assert.match(prompt, /Columns: Asset class \| Target weight \| ETF name \| ISIN/);
  assert.match(prompt, /Where relevant, perform a look-through/);
  assert.match(prompt, /If relevant, include a look-through asset allocation overview after Table 1/);
  assert.match(prompt, /Portfolio construction methodology \(MANDATORY\):/);
  assert.match(prompt, /Execution mode:\nReasoning discipline \(MANDATORY\):/);
  assert.match(prompt, /Internal validation \(MANDATORY before final answer\):/);
  assert.match(prompt, /minimum position sizes respected/);
  assert.match(prompt, /mean-variance optimisation logic consistent with the efficient frontier/);
  assert.match(prompt, /Assess the contribution of each asset class to overall portfolio risk/);
  assert.match(prompt, /Compare the portfolio to a simple global benchmark/);
  assert.match(prompt, /Portfolio construction rationale \(Efficient Frontier perspective\)/);
  assert.match(prompt, /risk-adjusted returns/);
  assert.match(prompt, /12\. Include synthetic ETFs where they provide structural advantages/);
  assert.match(prompt, /US equity exposure/);
  assert.match(prompt, /14\. Write the full answer in clear English\./);
  assert.match(prompt, /Closing instruction:\nAdd an investment disclaimer at the end of the answer according to recognized best-practice standards\./);
  assert.match(prompt, /Core Asset Classes:[\s\S]*- Cash \/ Money Market[\s\S]*- Bonds[\s\S]*- Equities by region[\s\S]*- Commodities \/ Precious Metals/);
  assert.match(prompt, /Satellites:[\s\S]*- Crypto Assets/);
});

test("basic prompt uses a light portfolio construction approach", () => {
  const context = createContext();
  reset(context);

  const prompt = run(
    context,
    `
      setPromptMode("basic");
      buildPrompt();
    `
  );

  assert.match(prompt, /Portfolio construction approach:/);
  assert.match(prompt, /Execution mode:\n- Focus on speed and clarity\./);
  assert.match(prompt, /Do not perform extensive internal validation loops\./);
  assert.match(prompt, /sound portfolio design principles/);
  assert.match(prompt, /Use diversification to improve the overall risk-return profile/);
  assert.match(prompt, /Ensure the portfolio is well diversified across asset classes and risk drivers/);
  assert.match(prompt, /Portfolio rationale \(brief\)/);
  assert.match(prompt, /how diversification improves the portfolio's overall risk-return profile/);
  assert.doesNotMatch(prompt, /Portfolio construction methodology \(MANDATORY\)/);
  assert.doesNotMatch(prompt, /Reasoning discipline \(MANDATORY\)/);
});

test("Pro prompt execution mode can switch from strict to fast", () => {
  const context = createContext();
  reset(context);

  const prompt = run(
    context,
    `
      state.executionMode = "fast";
      buildPrompt();
    `
  );

  assert.match(prompt, /Execution mode:\n- Focus on speed and clarity\./);
  assert.match(prompt, /Apply a pragmatic, heuristic portfolio construction approach\./);
  assert.doesNotMatch(prompt, /Internal validation \(MANDATORY before final answer\)/);
});

test("German prompt includes current Table 2 and instruction requirements", () => {
  const context = createContext();
  reset(context);

  const prompt = run(
    context,
    `
      state.outputLanguage = "German";
      buildPrompt();
    `
  );

  assert.match(prompt, /Spalten: Gruppe: Cash, Anleihen, Aktien, Rohstoffe, Satelliten \| Anlageklasse \| Zielgewicht \| Zweck \/ Rolle im Portfolio/);
  assert.match(prompt, /Füge nach Tabelle 1 eine kurze Übersicht "Prozentuale Allokation je Gruppe" ein/);
  assert.match(prompt, /Stelle sicher, dass die Gruppensummen mit der Zielallokation übereinstimmen und zusammen 100% ergeben/);
  assert.match(prompt, /Spalten: Anlageklasse \| Zielgewicht \| ETF-Name \| ISIN/);
  assert.match(prompt, /Ausführungsmodus:\nBegründungsdisziplin \(VERPFLICHTEND\):/);
  assert.match(prompt, /Interne Validierung \(VERPFLICHTEND vor der finalen Antwort\):/);
  assert.match(prompt, /Mindestpositionsgrössen eingehalten/);
  assert.match(prompt, /Portfolio-Konstruktionsmethodik \(VERPFLICHTEND\):/);
  assert.match(prompt, /Mean-Variance-Optimierungslogik/);
  assert.match(prompt, /Beurteile den Beitrag jeder Anlageklasse zum Gesamtrisiko/);
  assert.match(prompt, /Portfolio-Konstruktionslogik \(Efficient-Frontier-Perspektive\)/);
  assert.match(prompt, /12\. Beziehe synthetische ETFs ein/);
  assert.match(prompt, /US-Aktienexposure/);
  assert.match(prompt, /Abschluss:[\s\S]*Anlagehinweis nach anerkannten Best-Practice-Standards/);
  assert.match(prompt, /14\. Schreibe die vollständige Antwort in klarem Deutsch\./);
  assert.match(prompt, /Kernanlageklassen:[\s\S]*- Cash \/ Geldmarkt[\s\S]*- Anleihen[\s\S]*- Aktien nach Regionen[\s\S]*- Rohstoffe \/ Edelmetalle/);
  assert.match(prompt, /Satelliten:[\s\S]*- Krypto-Assets/);
});

test("prompt instruction checkbox copy is user-facing and neutral", () => {
  assert.equal(appCode.includes("Adds a numbered requirement"), false);
  assert.equal(appCode.includes("Fügt eine nummerierte Anforderung"), false);
  assert.match(appCode, /US tax withholding efficiency/);
  assert.match(appCode, /US-Steuereffizienz/);
});

test("asset class controls show core and satellite group headers", () => {
  const context = createContext();
  reset(context);

  const html = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.builderStarted = true;
      render();
      root.innerHTML;
    `
  );

  assert.match(html, /asset-toggle-grid/);
  assert.match(html, /asset-group-header">Core Asset Classes/);
  assert.match(html, /Core Asset Classes[\s\S]*Cash \/ Money Market[\s\S]*Bonds[\s\S]*Equities by region[\s\S]*Commodities \/ Precious Metals/);
  assert.match(html, /asset-group-header">Satellites/);
  assert.match(html, /Satellites[\s\S]*Listed Real Estate[\s\S]*Crypto Assets/);
});

test("equity allocation range follows risk appetite", () => {
  const context = createContext();
  reset(context);

  const expectedRanges = {
    Low: [20, 40],
    Moderate: [40, 60],
    High: [60, 80],
    "Very high": [80, 100],
  };

  for (const [risk, expected] of Object.entries(expectedRanges)) {
    const actual = run(
      context,
      `
        applyEquityRangeForRisk(${JSON.stringify(risk)});
        [state.equityMin, state.equityMax];
      `
    );
    assert.deepEqual(Array.from(actual), expected);
  }
});

test("maximum equity warning appears once per risk appetite", () => {
  const context = createContext();
  reset(context);

  assert.equal(
    run(
      context,
      `
        state.riskAppetite = "Low";
        state.equityMax = 45;
        maybeShowEquityRiskAlert();
        window.__alerts.length;
      `
    ),
    1
  );

  assert.equal(
    run(
      context,
      `
        state.equityMax = 50;
        maybeShowEquityRiskAlert();
        window.__alerts.length;
      `
    ),
    1
  );

  assert.deepEqual(
    Array.from(run(
      context,
      `
        state.riskAppetite = "Moderate";
        lastEquityRiskAlertKey = "";
        state.equityMax = 60;
        maybeShowEquityRiskAlert();
        const atModerateLimit = window.__alerts.length;
        state.equityMax = 65;
        maybeShowEquityRiskAlert();
        [atModerateLimit, window.__alerts.length];
      `
    )),
    [1, 2]
  );
});

test("empty selection warnings are shown", () => {
  const context = createContext();
  reset(context);

  const assetAlert = run(
    context,
    `
      for (const option of assetClassOptions) {
        state.assetClasses[option.id] = false;
      }
      maybeShowSelectionAlert("asset:cash");
      window.__alerts.at(-1);
    `
  );
  assert.match(assetAlert, /No asset classes selected/);

  const sectionAlert = run(
    context,
    `
      for (const section of outputSections) {
        state.sections[section.id] = false;
      }
      maybeShowSelectionAlert("section:a");
      window.__alerts.at(-1);
    `
  );
  assert.match(sectionAlert, /No output sections selected/);
});

test("low risk profiles warn when cash or bonds are deselected", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.riskAppetite = "Low";
      state.assetClasses.cash = false;
      maybeShowDefensiveAssetAlert("asset:cash");
      const lowCashAlert = window.__alerts.at(-1);
      maybeShowDefensiveAssetAlert("asset:cash");
      const afterDuplicateAttempt = window.__alerts.length;
      state.assetClasses.cash = true;
      maybeShowDefensiveAssetAlert("asset:cash");
      const afterCashAddedBack = window.__alerts.length;
      state.assetClasses.cash = false;
      state.assetClasses.bonds = false;
      maybeShowDefensiveAssetAlert("asset:bonds");
      const lowCashBondAlert = window.__alerts.at(-1);
      state.riskAppetite = "Moderate";
      state.assetClasses.cash = true;
      state.assetClasses.bonds = false;
      maybeShowDefensiveAssetAlert("riskAppetite");
      const afterModerateRisk = window.__alerts.length;
      state.riskAppetite = "High";
      maybeShowDefensiveAssetAlert("riskAppetite");
      const afterHighRisk = window.__alerts.length;
      [lowCashAlert, afterDuplicateAttempt, afterCashAddedBack, lowCashBondAlert, afterModerateRisk, afterHighRisk];
    `
  );

  assert.match(result[0], /Cash \/ Money Market/);
  assert.equal(result[1], 1);
  assert.equal(result[2], 1);
  assert.match(result[3], /Cash \/ Money Market and Bonds/);
  assert.equal(result[4], 2);
  assert.equal(result[5], 2);
});

test("moderate and higher risk profiles warn when equities are deselected", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.riskAppetite = "Moderate";
      state.assetClasses.equities = false;
      maybeShowEquityAssetAlert("asset:equities");
      const moderateAlert = window.__alerts.at(-1);
      maybeShowEquityAssetAlert("asset:equities");
      const afterDuplicateAttempt = window.__alerts.length;
      state.assetClasses.equities = true;
      maybeShowEquityAssetAlert("asset:equities");
      const afterEquitiesAddedBack = window.__alerts.length;
      state.riskAppetite = "Low";
      state.assetClasses.equities = false;
      maybeShowEquityAssetAlert("asset:equities");
      const afterLowRisk = window.__alerts.length;
      state.riskAppetite = "High";
      maybeShowEquityAssetAlert("riskAppetite");
      const highAlert = window.__alerts.at(-1);
      [moderateAlert, afterDuplicateAttempt, afterEquitiesAddedBack, afterLowRisk, highAlert, window.__alerts.length];
    `
  );

  assert.match(result[0], /fully excluding equities/);
  assert.equal(result[1], 1);
  assert.equal(result[2], 1);
  assert.equal(result[3], 1);
  assert.match(result[4], /high risk appetite/);
  assert.equal(result[5], 2);
});

test("additional logic checks warn for crypto, bond, and look-through conflicts", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.riskAppetite = "Low";
      state.assetClasses.crypto = true;
      let alerts = getAdditionalLogicAlerts("riskAppetite").map((alert) => alert.key);
      const cryptoDefensive = alerts.includes("crypto-defensive-Low");

      state.sections.f = false;
      alerts = getAdditionalLogicAlerts("section:f").map((alert) => alert.key);
      const cryptoNoRebalancing = alerts.includes("crypto-without-rebalancing");

      state.assetClasses.bonds = false;
      state.investmentHorizon = ">=3 years";
      alerts = getAdditionalLogicAlerts("asset:bonds").map((alert) => alert.key);
      const noBondsShortHorizon = alerts.includes("no-bonds-short-horizon");

      state.sections.e = true;
      state.includeLookThrough = false;
      alerts = getAdditionalLogicAlerts("includeLookThrough").map((alert) => alert.key);
      const lookThroughMismatch = alerts.includes("look-through-section-without-instruction");

      [cryptoDefensive, cryptoNoRebalancing, noBondsShortHorizon, lookThroughMismatch];
    `
  );

  assert.deepEqual(Array.from(result), [true, true, true, true]);
});

test("deselecting equities does not warn about synthetic ETF assessment", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.includeSyntheticEtfs = true;
      state.assetClasses.equities = false;
      getAdditionalLogicAlerts("asset:equities").map((alert) => alert.key);
    `
  );

  assert.equal(Array.from(result).includes("synthetic-etfs-without-equities"), false);
});

test("ETF coverage check compares minimum ETF count with selected asset classes and CHF add-on", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.baseCurrency = "CHF";
      state.minEtfs = 5;
      state.maxEtfs = 7;
      let alerts = getAdditionalLogicAlerts("minEtfs");
      const chAlert = alerts.find((alert) => alert.key.startsWith("etf-coverage-"));

      state.baseCurrency = "EUR";
      state.minEtfs = 4;
      alerts = getAdditionalLogicAlerts("baseCurrency");
      const eurAlert = alerts.find((alert) => alert.key.startsWith("etf-coverage-"));

      state.outputLanguage = "German";
      state.baseCurrency = "CHF";
      alerts = getAdditionalLogicAlerts("baseCurrency");
      const germanAlert = alerts.find((alert) => alert.key.startsWith("etf-coverage-"));

      [chAlert?.message, eurAlert?.message || "", germanAlert?.message];
    `
  );

  assert.match(result[0], /suggested minimum: 6/);
  assert.match(result[0], /Cash \/ Money Market, Bonds, Equities by region/);
  assert.match(result[0], /For CHF portfolios with equities/);
  assert.match(result[1], /suggested minimum: 5/);
  assert.doesNotMatch(result[1], /For CHF portfolios with equities/);
  assert.match(result[2], /sinnvolle Mindestanzahl: 6/);
  assert.match(result[2], /separaten Schweiz-Allokation/);
});

test("risk and horizon warning is shown", () => {
  const context = createContext();
  reset(context);

  const alert = run(
    context,
    `
      state.riskAppetite = "Very high";
      state.investmentHorizon = ">=5 years";
      maybeShowRiskHorizonAlert();
      window.__alerts[0];
    `
  );

  assert.match(alert, /Very high risk appetite/);
});

test("ETF count frame and section color hooks are present", () => {
  assert.match(appCode, /field-group range-group etf-count-group/);
  assert.match(appCode, /Math\.min\(state\.minEtfs, state\.maxEtfs\).*Math\.max\(state\.minEtfs, state\.maxEtfs\)/s);
  assert.match(css, /\.asset-section/);
  assert.match(css, /\.output-section/);
  assert.match(css, /\.instruction-section/);
});

test("quick start recommendation and action buttons align cleanly", () => {
  assert.match(css, /\.quick-start-intro \.quick-start-result\s*{[^}]*align-self: start;/s);
  assert.match(css, /\.quick-start-intro \.quick-start-actions\s*{[^}]*align-self: start;[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/s);
  assert.match(css, /\.quick-start-intro \.quick-start-button,\s*\.quick-start-intro \.quick-education-button\s*{[^}]*width: 100%;[^}]*min-height: 54px;/s);
});

test("base currency controls home-bias and equity region logic", () => {
  const context = createContext();
  reset(context);

  const cases = {
    CHF: {
      include: "Address Swiss home bias",
      equity: "Europe ex-CH, Switzerland (CH)",
    },
    EUR: {
      include: "Address European home bias",
      equity: "Europe incl. Switzerland",
    },
    GBP: {
      include: "Address British home bias",
      equity: "Europe incl. Switzerland",
    },
    USD: {
      exclude: "home bias",
      equity: "Europe incl. Switzerland",
    },
  };

  for (const [currency, expected] of Object.entries(cases)) {
    const prompt = run(
      context,
      `
        state = createDefaultState();
        state.baseCurrency = ${JSON.stringify(currency)};
        buildPrompt();
      `
    );

    assert.match(prompt, new RegExp(`- Base currency: ${currency}`));
    assert.match(prompt, new RegExp(expected.equity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

    if (expected.include) {
      assert.match(prompt, new RegExp(expected.include));
    } else {
      assert.doesNotMatch(prompt, /Address .* home bias/);
    }
  }
});

test("equity region badge follows base currency and equity selection", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.builderStarted = true;
      render();
      const chfHtml = root.innerHTML;
      state.baseCurrency = "EUR";
      render();
      const eurHtml = root.innerHTML;
      state.assetClasses.equities = false;
      render();
      const noEquitiesHtml = root.innerHTML;
      [chfHtml, eurHtml, noEquitiesHtml];
    `
  );

  assert.match(result[0], /5 equity regions/);
  assert.match(result[0], /Switzerland/);
  assert.match(result[1], /4 equity regions/);
  assert.match(result[1], /Europe incl\. CH/);
  assert.doesNotMatch(result[2], /equity-region-pill/);
});

test("base currency sets the preferred exchange for every currency change", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.exchange = "SIX Swiss Exchange";
      applyExchangeForBaseCurrency("EUR");
      const eurExchange = state.exchange;
      applyExchangeForBaseCurrency("GBP");
      const gbpExchange = state.exchange;
      applyExchangeForBaseCurrency("CHF");
      const afterChfExchange = state.exchange;
      state.exchange = "LSE London Stock Exchange";
      applyExchangeForBaseCurrency("USD");
      const usdExchange = state.exchange;
      [eurExchange, gbpExchange, afterChfExchange, usdExchange];
    `
  );

  assert.deepEqual(Array.from(result), ["XETRA Deutsche Börse", "LSE London Stock Exchange", "SIX Swiss Exchange", "NYSE American Stock Exchange"]);
});

test("preferred exchange stays fixed while manual and restores to currency default", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      handleInputChange({ target: { name: "exchange", type: "select-one", value: "LSE London Stock Exchange" } });
      const afterManualExchange = [state.exchange, state.exchangeManuallyAdjusted];
      handleInputChange({ target: { name: "baseCurrency", type: "select-one", value: "EUR" } });
      const afterManualCurrencyChange = [state.exchange, state.exchangeManuallyAdjusted];
      state.exchangeManuallyAdjusted = false;
      applyExchangeForBaseCurrency(state.baseCurrency);
      const afterRestoreAuto = [state.exchange, state.exchangeManuallyAdjusted];
      [afterManualExchange, afterManualCurrencyChange, afterRestoreAuto];
    `
  );

  assert.deepEqual(Array.from(result[0]), ["LSE London Stock Exchange", true]);
  assert.deepEqual(Array.from(result[1]), ["LSE London Stock Exchange", true]);
  assert.deepEqual(Array.from(result[2]), ["XETRA Deutsche Börse", false]);
});

test("selected output sections are re-lettered alphabetically", () => {
  const context = createContext();
  reset(context);

  const prompt = run(
    context,
    `
      state.sections.b = false;
      state.sections.d = false;
      state.sections.f = false;
      buildPrompt();
    `
  );

  assert.match(prompt, /A\) Table 1: Target allocation/);
  assert.match(prompt, /B\) Brief summary/);
  assert.match(prompt, /C\) The ten largest equity holdings/);
  assert.match(prompt, /D\) Rough cost estimate/);
  assert.match(prompt, /E\) Portfolio construction rationale \(Efficient Frontier perspective\)/);
  assert.doesNotMatch(prompt, /ETF implementation/);
  assert.doesNotMatch(prompt, /Consolidated currency overview/);
  assert.doesNotMatch(prompt, /Rebalancing concept/);
});

test("pro prompt hides construction rationale when the output section is disabled", () => {
  const context = createContext();
  reset(context);

  const prompt = run(
    context,
    `
      state.sections.h = false;
      buildPrompt();
    `
  );

  assert.match(prompt, /Portfolio construction methodology \(MANDATORY\):/);
  assert.match(prompt, /Assess the contribution of each asset class to overall portfolio risk/);
  assert.doesNotMatch(prompt, /Portfolio construction rationale \(Efficient Frontier perspective\)/);
});

test("min and max ETF counts are bounded against each other", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.minEtfs = 8;
      state.maxEtfs = 12;
      const minCannotExceedMax = getNextEtfCount("minEtfs", 20);
      const maxCannotGoBelowMin = getNextEtfCount("maxEtfs", 3);
      const minimumFloor = getNextEtfCount("minEtfs", -4);
      [minCannotExceedMax, maxCannotGoBelowMin, minimumFloor];
    `
  );

  assert.deepEqual(Array.from(result), [12, 8, 1]);
});

test("ETF count follows deselected asset classes until manually changed", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.assetClasses.cash = false;
      applyAutomaticEtfCountFromAssetClasses();
      const afterOneDeselected = [state.minEtfs, state.maxEtfs];

      state.assetClasses.bonds = false;
      applyAutomaticEtfCountFromAssetClasses();
      const afterTwoDeselected = [state.minEtfs, state.maxEtfs];

      state.assetClasses.equities = false;
      applyAutomaticEtfCountFromAssetClasses();
      const afterTwoPlusEquitiesDeselected = [state.minEtfs, state.maxEtfs];

      state.etfCountManuallyAdjusted = true;
      state.assetClasses.crypto = false;
      applyAutomaticEtfCountFromAssetClasses();
      const afterManualOverride = [state.minEtfs, state.maxEtfs];

      state = createDefaultState();
      state.assetClasses.cash = false;
      applyAutomaticEtfCountFromAssetClasses();
      const afterResetAndDeselected = [state.minEtfs, state.maxEtfs, state.etfCountManuallyAdjusted];

      [afterOneDeselected, afterTwoDeselected, afterTwoPlusEquitiesDeselected, afterManualOverride, afterResetAndDeselected];
    `
  );

  assert.deepEqual(Array.from(result[0]), [6, 10]);
  assert.deepEqual(Array.from(result[1]), [5, 9]);
  assert.deepEqual(Array.from(result[2]), [2, 4]);
  assert.deepEqual(Array.from(result[3]), [2, 4]);
  assert.deepEqual(Array.from(result[4]), [6, 10, false]);
});

test("ETF count keeps a coverage floor when equities are deselected from strategies", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      portfolioPresets.map((preset) => {
        applyPreset(preset.id);
        state.assetClasses.equities = false;
        applyAutomaticEtfCountFromAssetClasses();
        return [preset.id, state.minEtfs, state.maxEtfs, state.etfCountManuallyAdjusted];
      });
    `
  );

  assert.deepEqual(Array.from(result, (item) => Array.from(item)), [
    ["conservative", 3, 5, false],
    ["balanced", 3, 5, false],
    ["growth", 4, 6, false],
    ["aggressive", 4, 6, false],
  ]);
});

test("min and max equity weights are bounded against each other", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.equityMin = 75;
      state.equityMax = 95;
      const minCannotExceedMax = getNextEquityWeight("equityMin", 30);
      const maxCannotGoBelowMin = getNextEquityWeight("equityMax", -30);
      state.equityMin = 0;
      state.equityMax = 100;
      const minFloor = getNextEquityWeight("equityMin", -10);
      const maxCeiling = getNextEquityWeight("equityMax", 10);
      [minCannotExceedMax, maxCannotGoBelowMin, minFloor, maxCeiling];
    `
  );

  assert.deepEqual(Array.from(result), [95, 75, 0, 100]);
});

test("equity allocation range is zero while equities are deselected", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.equityMin = 75;
      state.equityMax = 95;
      state.assetClasses.equities = false;
      applyAutomaticEquityRangeFromAssetClasses("asset:equities");
      const afterDeselected = [state.equityMin, state.equityMax, state.equityRangeManuallyAdjusted];
      state.riskAppetite = "Very high";
      applyEquityRangeForRisk(state.riskAppetite);
      const afterRiskChangeWhileDeselected = [state.equityMin, state.equityMax];
      state.equityMax = getNextEquityWeight("equityMax", 5);
      const afterStepperWhileDeselected = [state.equityMin, state.equityMax];
      state.assetClasses.equities = true;
      applyAutomaticEquityRangeFromAssetClasses("asset:equities");
      const afterReselected = [state.equityMin, state.equityMax];
      [afterDeselected, afterRiskChangeWhileDeselected, afterStepperWhileDeselected, afterReselected];
    `
  );

  assert.deepEqual(Array.from(result[0]), [0, 0, false]);
  assert.deepEqual(Array.from(result[1]), [0, 0]);
  assert.deepEqual(Array.from(result[2]), [0, 0]);
  assert.deepEqual(Array.from(result[3]), [80, 100]);
});

test("equal equity and ETF targets use exact wording in prompts", () => {
  const context = createContext();
  reset(context);

  const englishPrompt = run(
    context,
    `
      state.equityMin = 75;
      state.equityMax = 75;
      state.minEtfs = 8;
      state.maxEtfs = 8;
      buildPrompt();
    `
  );

  assert.match(englishPrompt, /- Equity allocation: 75%/);
  assert.doesNotMatch(englishPrompt, /Equity allocation between 75% and 75%/);
  assert.match(englishPrompt, /Target exactly 8 positions in total/);
  assert.doesNotMatch(englishPrompt, /Target 8-8 positions/);

  const germanPrompt = run(
    context,
    `
      state.outputLanguage = "German";
      buildPrompt();
    `
  );

  assert.match(germanPrompt, /- Aktienquote: 75%/);
  assert.doesNotMatch(germanPrompt, /Aktienquote zwischen 75% und 75%/);
  assert.match(germanPrompt, /Ziel: genau 8 Positionen insgesamt/);
  assert.doesNotMatch(germanPrompt, /Ziel: 8-8 Positionen/);
});

test("prompt preview splits prompts into top-level sections", () => {
  const context = createContext();
  reset(context);

  const englishSections = run(
    context,
    `
      getPromptPreviewSections(buildPrompt()).map((section) => section.heading);
    `
  );

  assert.deepEqual(Array.from(englishSections), [
    "Role",
    "Objective",
    "Execution mode",
    "Portfolio construction methodology (MANDATORY)",
    "Eligible asset classes",
    "Requirements and constraints",
    "Output format",
  ]);

  const germanSections = run(
    context,
    `
      state.outputLanguage = "German";
      getPromptPreviewSections(buildPrompt()).map((section) => section.heading);
    `
  );

  assert.deepEqual(Array.from(germanSections), [
    "Rolle",
    "Ziel",
    "Ausführungsmodus",
    "Portfolio-Konstruktionsmethodik (VERPFLICHTEND)",
    "Zulässige Anlageklassen",
    "Vorgaben und Restriktionen",
    "Ausgabeformat",
  ]);
});

test("portfolio presets set profile and default asset class exclusions", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.minEtfs = 6;
      state.maxEtfs = 9;
      state.etfCountManuallyAdjusted = true;
      applyPreset("aggressive");
      applyPreset("conservative");
      const conservative = [state.riskAppetite, state.investmentHorizon, state.equityMin, state.equityMax, state.minEtfs, state.maxEtfs, state.equityRangeManuallyAdjusted, state.etfCountManuallyAdjusted, state.assetClasses.cash, state.assetClasses.bonds, state.assetClasses.equities, state.assetClasses.commodities, state.assetClasses.realEstate, state.assetClasses.crypto];
      applyPreset("balanced");
      const balanced = [state.riskAppetite, state.investmentHorizon, state.equityMin, state.equityMax, state.minEtfs, state.maxEtfs, state.equityRangeManuallyAdjusted, state.etfCountManuallyAdjusted, state.assetClasses.cash, state.assetClasses.bonds, state.assetClasses.equities, state.assetClasses.commodities, state.assetClasses.realEstate, state.assetClasses.crypto];
      applyPreset("growth");
      const growth = [state.riskAppetite, state.investmentHorizon, state.equityMin, state.equityMax, state.minEtfs, state.maxEtfs, state.equityRangeManuallyAdjusted, state.etfCountManuallyAdjusted, state.assetClasses.cash, state.assetClasses.bonds, state.assetClasses.equities, state.assetClasses.commodities, state.assetClasses.realEstate, state.assetClasses.crypto];
      applyPreset("aggressive");
      const aggressive = [state.riskAppetite, state.investmentHorizon, state.equityMin, state.equityMax, state.minEtfs, state.maxEtfs, state.equityRangeManuallyAdjusted, state.etfCountManuallyAdjusted, state.assetClasses.cash, state.assetClasses.bonds, state.assetClasses.equities, state.assetClasses.commodities, state.assetClasses.realEstate, state.assetClasses.crypto];
      [conservative, balanced, growth, aggressive];
    `
  );

  assert.deepEqual(Array.from(result[0]), ["Low", ">=3 years", 20, 40, 6, 10, false, false, true, true, true, true, false, false]);
  assert.deepEqual(Array.from(result[1]), ["Moderate", ">=5 years", 40, 60, 6, 10, false, false, true, true, true, true, false, false]);
  assert.deepEqual(Array.from(result[2]), ["High", ">=10 years", 60, 80, 7, 11, false, false, true, true, true, true, false, true]);
  assert.deepEqual(Array.from(result[3]), ["Very high", ">=10 years", 80, 100, 7, 11, false, false, true, false, true, true, true, true]);
});

test("portfolio presets reset manually adjusted ETF counts", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      portfolioPresets.map((preset) => {
        state = createDefaultState();
        state.minEtfs = 5;
        state.maxEtfs = 9;
        state.etfCountManuallyAdjusted = true;
        applyPreset(preset.id);
        return [preset.id, state.minEtfs, state.maxEtfs, state.etfCountManuallyAdjusted];
      });
    `
  );

  assert.deepEqual(Array.from(result, (item) => Array.from(item)), [
    ["conservative", 6, 10, false],
    ["balanced", 6, 10, false],
    ["growth", 7, 11, false],
    ["aggressive", 7, 11, false],
  ]);
});

test("default state is the Growth CHF preset with its asset exclusions", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      [
        state.baseCurrency,
        state.riskAppetite,
        state.investmentHorizon,
        state.equityMin,
        state.equityMax,
        state.minEtfs,
        state.maxEtfs,
        state.assetClasses.bonds,
        state.assetClasses.realEstate,
        state.assetClasses.crypto,
        getSelectedAssetClasses().length,
      ];
    `
  );

  assert.deepEqual(Array.from(result), ["CHF", "High", ">=10 years", 60, 80, 7, 11, true, false, true, 5]);
});

test("quick start recommends a coherent preset and applies it", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.quickStart = { baseCurrency: "EUR", investmentHorizon: ">=5 years", riskAppetite: "High" };
      const recommended = getQuickStartPreset().id;
      applyQuickStart();
      [
        recommended,
        state.baseCurrency,
        state.exchange,
        activePresetId,
        lastChosenPresetId,
        state.riskAppetite,
        state.investmentHorizon,
        state.equityMin,
        state.equityMax,
        state.exchangeManuallyAdjusted,
        getResetDefaultsLabel(),
        state.promptMode,
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    "balanced",
    "EUR",
    "XETRA Deutsche Börse",
    "balanced",
    "balanced",
    "Moderate",
    ">=5 years",
    40,
    60,
    false,
    "Reset original strategy: Balanced EUR",
    "basic",
  ]);
});

test("quick start app mode controls the opened builder mode", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.quickStart = { baseCurrency: "CHF", investmentHorizon: ">=10 years", riskAppetite: "High", promptMode: "basic" };
      applyQuickStart();
      const basicResult = [
        state.promptMode,
        state.assetClasses.equities,
        getSelectedSections().length,
        state.includeLookThrough,
      ];
      state = createDefaultState();
      activePresetId = defaultPresetId;
      lastChosenPresetId = defaultPresetId;
      state.quickStart = { baseCurrency: "CHF", investmentHorizon: ">=10 years", riskAppetite: "High", promptMode: "pro" };
      applyQuickStart();
      [basicResult, state.promptMode, state.equityMin, state.equityMax];
    `
  );

  assert.deepEqual(Array.from(result[0]), ["basic", true, 8, true]);
  assert.deepEqual(Array.from(result.slice(1)), ["pro", 60, 80]);
});

test("quick start strategy becomes the reset default for the builder session", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.quickStart = { baseCurrency: "EUR", investmentHorizon: ">=5 years", riskAppetite: "High" };
      applyQuickStart();
      state.baseCurrency = "USD";
      state.riskAppetite = "Low";
      state.exchange = "LSE London Stock Exchange";
      state.equityMin = 20;
      state.equityMax = 40;
      activePresetId = null;
      state = createDefaultState();
      [
        state.baseCurrency,
        state.exchange,
        activePresetId,
        getDefaultPreset().id,
        state.riskAppetite,
        state.investmentHorizon,
        state.equityMin,
        state.equityMax,
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    "EUR",
    "XETRA Deutsche Börse",
    null,
    "balanced",
    "Moderate",
    ">=5 years",
    40,
    60,
  ]);
});

test("quick start defaults follow the configured default preset", () => {
  const customConfig = configCode.replace('defaultPresetId: "growth"', 'defaultPresetId: "balanced"').replace('defaultBaseCurrency: "CHF"', 'defaultBaseCurrency: "EUR"');
  const context = createContextWithConfig(customConfig);
  reset(context);

  const result = run(
    context,
    `
      [
        state.baseCurrency,
        state.riskAppetite,
        state.investmentHorizon,
        state.quickStart.baseCurrency,
        state.quickStart.riskAppetite,
        state.quickStart.investmentHorizon,
        state.quickStart.promptMode,
        getQuickStartPreset().id,
      ];
    `
  );

  assert.deepEqual(Array.from(result), ["EUR", "Moderate", ">=5 years", "EUR", "Moderate", ">=5 years", "basic", "balanced"]);
});

test("quick start selection is restored from localStorage", () => {
  const context = createContextWithConfig(configCode, {
    "allocationPromptBuilder.quickStart.v1": JSON.stringify({
      outputLanguage: "German",
      quickStart: {
        baseCurrency: "GBP",
        investmentHorizon: ">=5 years",
        riskAppetite: "Moderate",
        promptMode: "pro",
      },
    }),
  });
  reset(context);

  const result = run(
    context,
    `
      [
        state.outputLanguage,
        state.quickStart.baseCurrency,
        state.quickStart.investmentHorizon,
        state.quickStart.riskAppetite,
        state.quickStart.promptMode,
        getQuickStartPreset().id,
        getEducationUrl(),
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    "German",
    "GBP",
    ">=5 years",
    "Moderate",
    "pro",
    "balanced",
    "https://bicon.li/prompt-builder/bicon-why-invest-journey-de.html",
  ]);
});

test("quick start changes are saved to localStorage", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      handleInputChange({ target: { name: "quickStart.baseCurrency", type: "select-one", value: "EUR" } });
      handleInputChange({ target: { name: "quickStart.riskAppetite", type: "select-one", value: "Moderate" } });
      handleInputChange({ target: { name: "outputLanguage", type: "select-one", value: "German" } });
      JSON.parse(window.localStorage.getItem("allocationPromptBuilder.quickStart.v1"));
    `
  );

  assert.equal(result.outputLanguage, "German");
  assert.equal(result.quickStart.baseCurrency, "EUR");
  assert.equal(result.quickStart.riskAppetite, "Moderate");
  assert.equal(result.quickStart.investmentHorizon, ">=10 years");
  assert.equal(result.quickStart.promptMode, "basic");
});

test("why-journey URL parameters prefill quick start without opening the builder", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      window.location.search = "?src=why-journey&profile=aggressive&horizon=2&risk=2&lang=de";
      const applied = applyUrlParams();
      const saved = JSON.parse(window.localStorage.getItem("allocationPromptBuilder.quickStart.v1"));
      [
        applied,
        activePresetId,
        sessionDefaultPresetId,
        lastChosenPresetId,
        state.outputLanguage,
        state.builderStarted,
        state.quickStart.riskAppetite,
        state.quickStart.investmentHorizon,
        getQuickStartPreset().id,
        saved.outputLanguage,
        saved.quickStart.riskAppetite,
        saved.quickStart.investmentHorizon,
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    true,
    "aggressive",
    "aggressive",
    "aggressive",
    "German",
    false,
    "Moderate",
    ">=5 years",
    "balanced",
    "German",
    "Moderate",
    ">=5 years",
  ]);
});

test("URL parameters are ignored without why-journey source", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      window.location.search = "?profile=aggressive&horizon=1&risk=1&lang=de";
      const applied = applyUrlParams();
      [
        applied,
        activePresetId,
        state.outputLanguage,
        state.riskAppetite,
        state.investmentHorizon,
        state.builderStarted,
      ];
    `
  );

  assert.deepEqual(Array.from(result), [false, "growth", "English", "High", ">=10 years", false]);
});

test("basic mode auto-selects required defaults and locks equities", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      activePresetId = null;
      state.assetClasses.equities = false;
      state.exchange = "LSE London Stock Exchange";
      state.exchangeManuallyAdjusted = true;
      state.equityMin = 0;
      state.equityMax = 0;
      state.equityRangeManuallyAdjusted = true;
      state.minEtfs = 2;
      state.maxEtfs = 3;
      state.etfCountManuallyAdjusted = true;
      state.sections.a = false;
      state.sections.g = false;
      state.includeHedgingQuestion = false;
      state.includeLookThrough = false;
      setPromptMode("basic");
      const afterBasic = [
        state.promptMode,
        activePresetId,
        lastChosenPresetId,
        state.assetClasses.equities,
        state.exchangeManuallyAdjusted,
        state.equityRangeManuallyAdjusted,
        state.etfCountManuallyAdjusted,
        getSelectedSections().length,
        state.includeHomeBiasGuidance,
        state.includeHedgingQuestion,
        state.includeLookThrough,
        state.includeSyntheticEtfs,
        state.equityMin,
        state.equityMax,
        state.minEtfs,
        state.maxEtfs,
      ];
      state.assetClasses.equities = false;
      const event = { target: { name: "asset:equities", type: "checkbox", checked: false } };
      handleInputChange(event);
      const lockedEquities = state.assetClasses.equities;
      setPromptMode("pro");
      [afterBasic, lockedEquities, state.promptMode];
    `
  );

  assert.deepEqual(Array.from(result[0]), ["basic", "growth", "growth", true, false, false, false, 8, true, true, true, true, 60, 80, 7, 11]);
  assert.equal(result[1], true);
  assert.equal(result[2], "pro");
});

test("basic mode restores the last chosen strategy", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      applyPreset("balanced");
      state.riskAppetite = "Very high";
      activePresetId = null;
      state.equityMin = 10;
      state.equityMax = 20;
      setPromptMode("basic");
      const afterBasic = [activePresetId, lastChosenPresetId, state.riskAppetite, state.investmentHorizon, state.equityMin, state.equityMax, state.promptMode];
      setPromptMode("pro");
      applyPreset("conservative");
      state.riskAppetite = "High";
      activePresetId = null;
      setPromptMode("basic");
      const afterSecondBasic = [activePresetId, lastChosenPresetId, state.riskAppetite, state.investmentHorizon, state.equityMin, state.equityMax, state.promptMode];
      [afterBasic, afterSecondBasic];
    `
  );

  assert.deepEqual(Array.from(result[0]), ["balanced", "balanced", "Moderate", ">=5 years", 40, 60, "basic"]);
  assert.deepEqual(Array.from(result[1]), ["conservative", "conservative", "Low", ">=3 years", 20, 40, "basic"]);
});

test("reset keeps the builder in basic mode", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.builderStarted = true;
      applyPreset("balanced");
      setPromptMode("basic");
      handleClick({
        target: {
          closest(selector) {
            if (selector === "[data-action]") {
              return { getAttribute: () => "reset" };
            }
            return null;
          },
          getAttribute() {
            return null;
          },
        },
      });
      [
        state.promptMode,
        activePresetId,
        lastChosenPresetId,
        state.builderStarted,
        state.riskAppetite,
        state.investmentHorizon,
        state.equityMin,
        state.equityMax,
        getSelectedSections().length,
        root.innerHTML.includes('data-mode="basic" aria-pressed="true"'),
        root.innerHTML.includes('name="riskAppetite"'),
      ];
    `
  );

  assert.deepEqual(Array.from(result), ["basic", "growth", "growth", true, "High", ">=10 years", 60, 80, 8, true, false]);
});

test("basic mode render hides jump and auto logic while labeling summary pills", () => {
  const context = createContext();
  reset(context);

  const html = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.builderStarted = true;
      setPromptMode("basic");
      render();
      root.innerHTML;
    `
  );

  assert.match(html, /basic-auto-summary/);
  assert.match(html, /Risk appetite/);
  assert.match(html, /Investment horizon/);
  assert.match(html, /Equity/);
  assert.match(html, /ETFs/);
  assert.match(html, /set-mode/);
  assert.doesNotMatch(html, /mobile-jump/);
  assert.doesNotMatch(html, /logic-summary/);
  assert.doesNotMatch(html, /data-action="export-txt"/);
  assert.doesNotMatch(html, /data-action="export-md"/);
  assert.match(html, /data-action="reset"/);
  assert.match(html, /Reset original strategy: Growth CHF/);
});

test("current strategy follows explicit preset state instead of matching values", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      const defaultLabel = getPresetContextParts()[0];
      activePresetId = null;
      state.riskAppetite = "High";
      state.investmentHorizon = ">=10 years";
      state.equityMin = 75;
      state.equityMax = 95;
      state.minEtfs = 8;
      state.maxEtfs = 12;
      const customLabel = getPresetContextParts()[0];
      applyPreset("growth");
      const presetLabel = getPresetContextParts()[0];
      [defaultLabel, customLabel, presetLabel];
    `
  );

  assert.deepEqual(Array.from(result), ["Growth:", "Custom setup:", "Growth:"]);
});

test("reset button label follows configured default preset and base currency", () => {
  const customConfigCode = `
    window.PROMPT_BUILDER_CONFIG = {
      ...window.PROMPT_BUILDER_CONFIG,
      defaultBaseCurrency: "EUR",
      defaultPresetId: "balanced",
    };
  `;
  const context = createContextWithConfig(`${configCode}\n${customConfigCode}`);
  reset(context);

  const result = run(
    context,
    `
      state.outputLanguage = "English";
      const englishLabel = getResetDefaultsLabel();
      state.outputLanguage = "German";
      const germanLabel = getResetDefaultsLabel();
      [englishLabel, germanLabel];
    `
  );

  assert.deepEqual(Array.from(result), ["Reset original strategy: Balanced EUR", "Originalstrategie zurücksetzen: Ausgewogen EUR"]);
});

test("language changes do not switch the current strategy to custom", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      applyPreset("growth");
      const before = getPresetContextParts()[0];
      handleInputChange({ target: { name: "outputLanguage", type: "select-one", value: "German" } });
      const afterGerman = getPresetContextParts()[0];
      handleInputChange({ target: { name: "outputLanguage", type: "select-one", value: "English" } });
      const afterEnglish = getPresetContextParts()[0];
      [before, afterGerman, afterEnglish];
    `
  );

  assert.deepEqual(Array.from(result), ["Growth:", "Wachstum:", "Growth:"]);
});

test("render includes presets, demo, and marketing sections", () => {
  const context = createContext();
  reset(context);

  const html = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.builderStarted = true;
      render();
      root.innerHTML;
    `
  );

  assert.match(html, /data-preset="conservative"/);
  assert.doesNotMatch(html, /quick-start-panel/);
  assert.doesNotMatch(html, /Auto \/ Manual logic/);
  assert.match(html, /data-action="export-txt"/);
  assert.match(html, /data-action="export-md"/);
  assert.match(html, /class="ai-tool-panel"/);
  assert.match(html, /Open Installed AI Apps/);
  assert.match(html, /chatgpt:\/\//);
  assert.match(html, /claude:\/\//);
  assert.match(html, /whatsapp:\/\/send/);
  assert.match(html, /not a guaranteed Meta AI chat/);
  assert.match(html, /data-info-key="installed-apps"/);
  assert.match(html, /data-app-link="true"/);
  assert.match(html, /brand-eyebrow/);
  assert.match(html, /tool-logo-mini/);
  assert.match(html, /class="status-info"/);
  assert.match(html, /Automatically derived from the selected parameters\./);
  assert.match(html, /asset-class-pill/);
  assert.match(html, /parameter-badges/);
  assert.match(html, /asset-pie/);
  assert.match(html, /conic-gradient/);
  assert.match(html, /Auto logic/);
  assert.match(html, /Current strategy/);
  assert.match(html, /strategy-context/);
  assert.match(html, /strategy-segment/);
  assert.doesNotMatch(html, /<option value="Balanced"/);
  assert.match(html, /7-11 ETFs/);
  assert.match(html, /data-action="toggle-preset-details"/);
  assert.match(html, /preset-icon-conservative/);
  assert.match(html, /preset-icon-balanced/);
  assert.match(html, /preset-icon-growth/);
  assert.match(html, /preset-icon-aggressive/);
  assert.match(html, /Low · &gt;=3 years ·/);
  assert.match(html, /20-40% equity/);
  assert.match(html, /Moderate · &gt;=5 years ·/);
  assert.match(html, /40-60% equity/);
  assert.match(html, /High · &gt;=10 years ·/);
  assert.match(html, /60-80% equity/);
  assert.match(html, /Very high · &gt;=10 years ·/);
  assert.match(html, /80-100% equity/);
  assert.doesNotMatch(html, /show-preset-details/);
  assert.equal(html.indexOf("strategy-context") < html.indexOf("preset-grid"), true);
  assert.equal(html.indexOf("strategy-context") < html.indexOf("parameter-badges"), true);
  assert.equal(html.indexOf("parameter-badges") < html.indexOf('name="riskAppetite"'), true);
  assert.match(html, /Jump to prompt/);
  assert.equal(html.indexOf("asset-section") < html.indexOf("mobile-jump"), true);
  assert.equal(html.indexOf("mobile-jump") < html.indexOf("output-section"), true);
  assert.doesNotMatch(html, /quality-card/);
  assert.match(html, /Version 2\.0/);
  assert.match(html, /© BICon \| Business &amp; IT Consulting – Strategy\. Technology\. Financial Services\./);
  assert.match(html, /href="https:\/\/bicon\.li\/en"/);
  assert.match(html, /How to use the generated prompt/);
  assert.match(html, /Structured portfolio prompts for faster investment research/);
});

test("initial render shows quick start before the builder", () => {
  const context = createContext();
  reset(context);

  const html = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      render();
      root.innerHTML;
    `
  );

  assert.match(html, /class="workspace intro-workspace"/);
  assert.match(html, /class="panel quick-start-panel quick-start-intro"/);
  assert.match(html, /tool-mark-row/);
  assert.match(html, /tool-logo/);
  assert.match(html, /tool-logo-pointer/);
  assert.match(html, /Portfolio Prompt Builder/);
  assert.match(html, /Quick start/);
  assert.match(html, /Start with the 5-minute guide/);
  assert.match(html, /Open builder directly/);
  assert.match(html, /New here\? Start with the guide\. Know your profile\? Open the builder directly\./);
  assert.match(html, /class="cta-icon"/);
  assert.match(html, /circle cx="12" cy="12" r="8"/);
  assert.match(html, /circle cx="11" cy="7" r="2\.5"/);
  assert.match(html, /href="https:\/\/bicon\.li\/prompt-builder\/bicon-why-invest-journey-en\.html"/);
  assert.doesNotMatch(html, /quick-education-button"[^>]*target=/);
  assert.doesNotMatch(html, /quick-education-button"[^>]*rel=/);
  assert.match(html, /data-action="apply-quick-start"/);
  assert.doesNotMatch(html, /data-action="open-builder"/);
  assert.match(html, /name="outputLanguage"/);
  assert.match(html, /English/);
  assert.match(html, /German/);
  assert.match(html, /name="quickStart\.baseCurrency"/);
  assert.match(html, /name="quickStart\.investmentHorizon"/);
  assert.match(html, /name="quickStart\.riskAppetite"/);
  assert.match(html, /name="quickStart\.promptMode"/);
  assert.match(html, /<option value="basic" selected>Basic<\/option>/);
  assert.doesNotMatch(html, /class="hero"/);
  assert.doesNotMatch(html, /hero-aside/);
  assert.doesNotMatch(html, /controls-panel/);
  assert.doesNotMatch(html, /output-panel/);
  assert.doesNotMatch(html, /support-section/);
  assert.match(html, /© BICon \| Business &amp; IT Consulting – Strategy\. Technology\. Financial Services\./);
  assert.match(html, /href="https:\/\/bicon\.li\/en"/);
});

test("quick start education link follows the selected language", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      [
        getEducationUrl("English"),
        getEducationUrl("German"),
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    "https://bicon.li/prompt-builder/bicon-why-invest-journey-en.html",
    "https://bicon.li/prompt-builder/bicon-why-invest-journey-de.html",
  ]);
});

test("footer link follows the selected language", () => {
  const context = createContext();
  reset(context);

  const html = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.outputLanguage = "German";
      render();
      root.innerHTML;
    `
  );

  assert.match(html, /© BICon \| Business &amp; IT Consulting – Strategy\. Technology\. Financial Services\./);
  assert.match(html, /href="https:\/\/bicon\.li"/);
  assert.doesNotMatch(html, /href="https:\/\/bicon\.li\/en"/);
});

test("installed app links ask for the disclaimer before opening", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      let prevented = false;
      const confirmMessages = [];
      window.confirm = (message) => {
        confirmMessages.push(message);
        return false;
      };
      handleClick({
        target: {
          closest(selector) {
            return selector === "[data-app-link]" ? {} : null;
          },
        },
        preventDefault() {
          prevented = true;
        },
      });
      [prevented, confirmMessages];
    `
  );

  assert.equal(result[0], true);
  assert.deepEqual(Array.from(result[1]), [
    "The Portfolio Prompt Builder is a tool for generating structured prompts for use with AI language models. It does not constitute investment advice, investment recommendations, or a solicitation to buy or sell any financial instrument. All outputs should be reviewed by qualified financial professionals before use with clients.",
  ]);
});

test("preset ids can differ from their configured icon style", () => {
  const context = createContext();
  reset(context);

  const html = run(
    context,
    `
      const preset = { ...portfolioPresets[2], id: "long-term-growth", icon: "growth", label: "Long-Term Growth", deLabel: "Langfristiges Wachstum" };
      renderPresetButton(preset);
    `
  );

  assert.match(html, /data-preset="long-term-growth"/);
  assert.match(html, /preset-icon-growth/);
  assert.match(html, /Long-Term Growth/);
});

test("auto logic reflects current state", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.assetClasses.equities = false;
      applyAutomaticEquityRangeFromAssetClasses("asset:equities");
      const logic = getAutoLogicItems();
      logic;
    `
  );

  assert.match(result.join(" "), /Equities disabled/);
});

test("GitHub Actions test workflow is configured", () => {
  assert.match(packageJson, /"test": "npm run test:unit && npm run test:e2e"/);
  assert.match(workflow, /actions\/checkout@v4/);
  assert.match(workflow, /actions\/setup-node@v4/);
  assert.match(workflow, /FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm test/);
});

test("asset class pie badge follows selected asset classes", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      const root = { innerHTML: "" };
      document.getElementById = () => root;
      state.builderStarted = true;
      render();
      const defaultHtml = root.innerHTML;
      Object.keys(state.assetClasses).forEach((key) => {
        state.assetClasses[key] = true;
      });
      render();
      const allSelectedHtml = root.innerHTML;
      Object.keys(state.assetClasses).forEach((key) => {
        state.assetClasses[key] = false;
      });
      render();
      const noneSelectedHtml = root.innerHTML;
      [defaultHtml, allSelectedHtml, noneSelectedHtml];
    `
  );

  assert.match(result[0], /5 asset classes/);
  assert.match(result[0], /#a65f4e 80\.00% 100\.00%/);
  assert.match(result[1], /6 asset classes/);
  assert.match(result[1], /#6f5d8f 83\.33% 100\.00%/);
  assert.match(result[2], /0 asset classes/);
  assert.match(result[2], /rgba\(24, 24, 24, 0\.14\) 0 100%/);
  assert.doesNotMatch(result[2], /equity-region-pill/);
});

test("prompt export helpers create stable filenames and mime types", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.baseCurrency = "EUR";
      state.riskAppetite = "Very high";
      [
        getPromptExportFilename("txt"),
        getPromptExportFilename("md"),
        getPromptExportMimeType("txt"),
        getPromptExportMimeType("md"),
      ];
    `
  );

  assert.deepEqual(Array.from(result), [
    "portfolio-prompt-eur-very-high.txt",
    "portfolio-prompt-eur-very-high.md",
    "text/plain;charset=utf-8",
    "text/markdown;charset=utf-8",
  ]);
});

test("UI range labels use localized separators", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      const englishEquity = formatUiRange(40, 60, "%");
      const englishEtfs = formatUiRange(8, 12);
      state.outputLanguage = "German";
      const germanEquity = formatUiRange(40, 60, "%");
      const germanEtfs = formatUiRange(8, 12);
      [englishEquity, englishEtfs, germanEquity, germanEtfs];
    `
  );

  assert.deepEqual(Array.from(result), ["40% to 60%", "8 to 12", "40% bis 60%", "8 bis 12"]);
});

test("risk and horizon warning matrix is enforced", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      const checks = [];
      state.riskAppetite = "Very high";
      state.investmentHorizon = ">=5 years";
      checks.push(getRiskHorizonCheck().ok);
      state.investmentHorizon = ">=10 years";
      checks.push(getRiskHorizonCheck().ok);
      state.riskAppetite = "High";
      state.investmentHorizon = ">=3 years";
      checks.push(getRiskHorizonCheck().ok);
      state.investmentHorizon = ">=5 years";
      checks.push(getRiskHorizonCheck().ok);
      state.riskAppetite = "Moderate";
      state.investmentHorizon = ">=3 years";
      checks.push(getRiskHorizonCheck().ok);
      checks;
    `
  );

  assert.deepEqual(Array.from(result), [false, true, false, true, true]);
});

let failed = 0;

for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}`);
    console.error(error);
  }
}

if (failed > 0) {
  console.error(`\n${failed}/${tests.length} tests failed`);
  process.exit(1);
}

console.log(`\n${tests.length}/${tests.length} tests passed`);
