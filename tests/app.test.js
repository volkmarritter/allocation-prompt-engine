const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const configCode = fs.readFileSync(path.join(projectRoot, "config.js"), "utf8");
const appCode = fs.readFileSync(path.join(projectRoot, "app.js"), "utf8");
const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
const css = fs.readFileSync(path.join(projectRoot, "styles.css"), "utf8");
const packageJson = fs.readFileSync(path.join(projectRoot, "package.json"), "utf8");
const workflow = fs.readFileSync(path.join(projectRoot, ".github", "workflows", "tests.yml"), "utf8");

function createContext() {
  return createContextWithConfig(configCode);
}

function createContextWithConfig(configSource) {
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
      alert(message) {
        this.__alerts.push(String(message));
      },
      clearTimeout,
      setTimeout,
    },
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
      window.__alerts = [];
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

test("source files have no replacement characters", () => {
  assert.equal(configCode.includes("\uFFFD"), false);
  assert.equal(appCode.includes("\uFFFD"), false);
  assert.equal(css.includes("\uFFFD"), false);
  assert.equal(html.includes("\uFFFD"), false);
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
  ]);
});

test("English prompt includes current Table 2 and instruction requirements", () => {
  const context = createContext();
  reset(context);

  const prompt = run(context, "buildPrompt()");

  assert.match(prompt, /Columns: Asset class \| Target weight \| ETF name \| ISIN/);
  assert.match(prompt, /Where relevant, perform a look-through/);
  assert.match(prompt, /If relevant, include a look-through asset allocation overview after Table 1/);
  assert.match(prompt, /12\. Include synthetic ETFs where they provide structural advantages/);
  assert.match(prompt, /US equity exposure/);
  assert.match(prompt, /13\. Write the full answer in clear English\./);
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

  assert.match(prompt, /Spalten: Anlageklasse \| Zielgewicht \| ETF-Name \| ISIN/);
  assert.match(prompt, /12\. Beziehe synthetische ETFs ein/);
  assert.match(prompt, /US-Aktienexposure/);
  assert.match(prompt, /13\. Schreibe die vollständige Antwort in klarem Deutsch\./);
});

test("prompt instruction checkbox copy is user-facing and neutral", () => {
  assert.equal(appCode.includes("Adds a numbered requirement"), false);
  assert.equal(appCode.includes("Fügt eine nummerierte Anforderung"), false);
  assert.match(appCode, /US tax withholding efficiency/);
  assert.match(appCode, /US-Steuereffizienz/);
});

test("equity allocation range follows risk appetite", () => {
  const context = createContext();
  reset(context);

  const expectedRanges = {
    Low: [25, 45],
    Moderate: [40, 60],
    Balanced: [55, 75],
    High: [75, 95],
    "Very high": [90, 100],
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
        state.equityMax = 50;
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
        state.equityMax = 55;
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
        state.riskAppetite = "Moderate";
        lastEquityRiskAlertKey = "";
        state.equityMax = 65;
        maybeShowEquityRiskAlert();
        window.__alerts.length;
      `
    ),
    2
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

test("low and moderate risk profiles warn when cash or bonds are deselected", () => {
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
      const moderateBondAlert = window.__alerts.at(-1);
      state.riskAppetite = "High";
      maybeShowDefensiveAssetAlert("riskAppetite");
      const afterHighRisk = window.__alerts.length;
      [lowCashAlert, afterDuplicateAttempt, afterCashAddedBack, lowCashBondAlert, moderateBondAlert, afterHighRisk];
    `
  );

  assert.match(result[0], /Cash \/ Money Market/);
  assert.equal(result[1], 1);
  assert.equal(result[2], 1);
  assert.match(result[3], /Cash \/ Money Market and Bonds/);
  assert.match(result[4], /Bonds/);
  assert.equal(result[5], 3);
});

test("balanced and higher risk profiles warn when equities are deselected", () => {
  const context = createContext();
  reset(context);

  const result = run(
    context,
    `
      state.riskAppetite = "Balanced";
      state.assetClasses.equities = false;
      maybeShowEquityAssetAlert("asset:equities");
      const balancedAlert = window.__alerts.at(-1);
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
      [balancedAlert, afterDuplicateAttempt, afterEquitiesAddedBack, afterLowRisk, highAlert, window.__alerts.length];
    `
  );

  assert.match(result[0], /fully excluding equities/);
  assert.equal(result[1], 1);
  assert.equal(result[2], 1);
  assert.equal(result[3], 1);
  assert.match(result[4], /high risk appetite/);
  assert.equal(result[5], 2);
});

test("additional logic checks warn for crypto, bond, look-through, synthetic ETF, real estate, and low ETF count conflicts", () => {
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

      state.includeSyntheticEtfs = true;
      state.assetClasses.equities = false;
      alerts = getAdditionalLogicAlerts("asset:equities").map((alert) => alert.key);
      const syntheticWithoutEquities = alerts.includes("synthetic-etfs-without-equities");

      state.assetClasses.realEstate = true;
      state.minEtfs = 4;
      state.maxEtfs = 5;
      alerts = getAdditionalLogicAlerts("minEtfs").map((alert) => alert.key);
      const realEstateLowEtfCount = alerts.includes("real-estate-low-etf-count-4");
      const cryptoLowEtfCount = alerts.includes("crypto-low-etf-count-4");

      [cryptoDefensive, cryptoNoRebalancing, noBondsShortHorizon, lookThroughMismatch, syntheticWithoutEquities, realEstateLowEtfCount, cryptoLowEtfCount];
    `
  );

  assert.deepEqual(Array.from(result), [true, true, true, true, true, true, true]);
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
  assert.doesNotMatch(prompt, /ETF implementation/);
  assert.doesNotMatch(prompt, /Consolidated currency overview/);
  assert.doesNotMatch(prompt, /Rebalancing concept/);
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
  assert.deepEqual(Array.from(result[2]), [1, 4]);
  assert.deepEqual(Array.from(result[3]), [1, 4]);
  assert.deepEqual(Array.from(result[4]), [6, 10, false]);
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
  assert.deepEqual(Array.from(result[3]), [90, 100]);
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

  assert.deepEqual(Array.from(result[0]), ["Low", ">=3 years", 25, 45, 6, 10, false, false, true, true, true, true, false, false]);
  assert.deepEqual(Array.from(result[1]), ["Balanced", ">=5 years", 55, 75, 6, 10, false, false, true, true, true, true, false, false]);
  assert.deepEqual(Array.from(result[2]), ["High", ">=10 years", 75, 95, 7, 11, false, false, true, true, true, true, false, true]);
  assert.deepEqual(Array.from(result[3]), ["Very high", ">=10 years", 90, 100, 7, 11, false, false, true, false, true, true, true, true]);
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

  assert.deepEqual(Array.from(result), ["CHF", "High", ">=10 years", 75, 95, 7, 11, true, false, true, 5]);
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

  assert.deepEqual(Array.from(result), ["Reset defaults: Balanced EUR", "Zurücksetzen: Ausgewogen EUR"]);
});

test("render includes presets, demo, and marketing sections", () => {
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

  assert.match(html, /data-preset="conservative"/);
  assert.doesNotMatch(html, /Auto \/ Manual logic/);
  assert.match(html, /data-action="export-txt"/);
  assert.match(html, /data-action="export-md"/);
  assert.match(html, /class="status-info"/);
  assert.match(html, /Automatically derived from the selected parameters\./);
  assert.match(html, /asset-class-pill/);
  assert.match(html, /asset-pie/);
  assert.match(html, /conic-gradient/);
  assert.match(html, /Auto logic/);
  assert.match(html, /Current strategy/);
  assert.match(html, /strategy-context/);
  assert.match(html, /strategy-segment/);
  assert.match(html, /7-11 ETFs/);
  assert.match(html, /data-action="toggle-preset-details"/);
  assert.match(html, /preset-icon-conservative/);
  assert.match(html, /preset-icon-balanced/);
  assert.match(html, /preset-icon-growth/);
  assert.match(html, /preset-icon-aggressive/);
  assert.doesNotMatch(html, /show-preset-details/);
  assert.equal(html.indexOf("preset-grid") < html.indexOf("strategy-context"), true);
  assert.equal(html.indexOf("strategy-context") < html.indexOf("riskAppetite"), true);
  assert.match(html, /Jump to prompt/);
  assert.equal(html.indexOf("asset-section") < html.indexOf("mobile-jump"), true);
  assert.equal(html.indexOf("mobile-jump") < html.indexOf("output-section"), true);
  assert.doesNotMatch(html, /quality-card/);
  assert.match(html, /Version 0\.7/);
  assert.match(html, /How to use the generated prompt/);
  assert.match(html, /Structured portfolio prompts for faster investment research/);
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
      const englishEquity = formatUiRange(55, 75, "%");
      const englishEtfs = formatUiRange(8, 12);
      state.outputLanguage = "German";
      const germanEquity = formatUiRange(55, 75, "%");
      const germanEtfs = formatUiRange(8, 12);
      [englishEquity, englishEtfs, germanEquity, germanEtfs];
    `
  );

  assert.deepEqual(Array.from(result), ["55% to 75%", "8 to 12", "55% bis 75%", "8 bis 12"]);
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
      state.riskAppetite = "Balanced";
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
