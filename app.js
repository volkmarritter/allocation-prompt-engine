const assetClassOptions = [
  { id: "cash", label: "Cash / Money Market", description: "Liquidity reserve and portfolio ballast.", deLabel: "Cash / Geldmarkt", deDescription: "Liquiditätsreserve und stabilisierender Portfolio-Baustein." },
  { id: "bonds", label: "Bonds", description: "Stability and diversification versus equities.", deLabel: "Anleihen", deDescription: "Stabilität und Diversifikation gegenüber Aktien." },
  { id: "equities", label: "Equities by region", description: "USA, Europe ex-CH, Switzerland, Japan, and Emerging Markets.", deLabel: "Aktien nach Regionen", deDescription: "USA, Europa ex CH, Schweiz, Japan und Emerging Markets." },
  { id: "commodities", label: "Commodities / Precious Metals", description: "Inflation-sensitive diversifier with low equity correlation.", deLabel: "Rohstoffe / Edelmetalle", deDescription: "Inflationssensitiver Diversifikator mit niedriger Aktienkorrelation." },
  { id: "realEstate", label: "Listed Real Estate", description: "Income-sensitive real asset exposure through REITs.", deLabel: "Immobilien (kotiert)", deDescription: "Ertragsorientierte Real-Asset-Exponierung über REITs." },
  { id: "crypto", label: "Crypto Assets", description: "High-volatility satellite allocation if justified.", deLabel: "Krypto-Assets", deDescription: "Volatile Satellitenallokation, falls begründbar." },
];

const outputSections = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
  { id: "d" },
  { id: "e" },
  { id: "f" },
  { id: "g" },
];

const appVersion = "0.7";
const appUpdated = "April 2026";
const promptBuilderConfig = typeof window !== "undefined" && window.PROMPT_BUILDER_CONFIG
  ? window.PROMPT_BUILDER_CONFIG
  : {};
const fallbackBaseCurrencyOptions = ["CHF", "EUR", "USD", "GBP"];
const baseCurrencyOptions = Array.isArray(promptBuilderConfig.baseCurrencies) && promptBuilderConfig.baseCurrencies.length
  ? promptBuilderConfig.baseCurrencies
  : fallbackBaseCurrencyOptions;
const fallbackExchangeOptions = ["SIX Swiss Exchange", "XETRA Deutsche Börse", "LSE London Stock Exchange"];
const exchangeOptions = Array.isArray(promptBuilderConfig.exchanges) && promptBuilderConfig.exchanges.length
  ? promptBuilderConfig.exchanges
  : fallbackExchangeOptions;
const defaultExchangeByCurrency = {
  CHF: "SIX Swiss Exchange",
  EUR: "XETRA Deutsche Börse",
  USD: "SIX Swiss Exchange",
  GBP: "LSE London Stock Exchange",
  ...(promptBuilderConfig.defaultExchangeByCurrency || {}),
};
const defaultPresetId = promptBuilderConfig.defaultPresetId || "growth";

const uiText = {
  English: {
    eyebrow: "Portfolio Prompt Builder",
    headline: "Shape the mandate. Generate the prompt.",
    heroCopy: "Configure the investor profile and implementation constraints, then generate a structured prompt for strategic asset allocation work.",
    promptMode: "Prompt mode",
    baseCurrency: "Base currency",
    exchangeFocus: "Exchange focus",
    parameters: "Parameters",
    investorSetup: "Investor setup",
    setupCopy: "Choose the values that should flow into the generated prompt, then copy the result directly into your workflow.",
    assetClasses: "asset classes",
    equityRegions: "equity regions",
    jumpToPrompt: "Jump to prompt",
    autoLogic: "Auto logic",
    autoLogicCopy: "What the builder adjusted from your inputs.",
    noAutoLogic: "No automatic overrides are currently active.",
    presetContext: "Current strategy",
    customStrategy: "Custom setup",
    details: "Details",
    hideDetails: "Hide details",
    versionLabel: "Version",
    updatedLabel: "Updated",
    language: "Language",
    riskAppetite: "Risk appetite",
    investmentHorizon: "Investment horizon",
    preferredExchange: "Preferred exchange",
    equityRange: "Equity allocation range",
    minEquity: "Minimum equity weight",
    maxEquity: "Maximum equity weight",
    decreaseMinEquity: "Decrease minimum equity weight",
    increaseMinEquity: "Increase minimum equity weight",
    decreaseMaxEquity: "Decrease maximum equity weight",
    increaseMaxEquity: "Increase maximum equity weight",
    minEtfCount: "Minimum ETF count",
    maxEtfCount: "Maximum ETF count",
    decreaseMinEtf: "Decrease minimum ETF count",
    increaseMinEtf: "Increase minimum ETF count",
    decreaseMaxEtf: "Decrease maximum ETF count",
    increaseMaxEtf: "Increase maximum ETF count",
    eligibleAssetClasses: "Eligible asset classes",
    requiredOutputSections: "Required output sections",
    promptInstructions: "Prompt instructions",
    includeHomeBias: "Include home-bias guidance",
    includeHomeBiasDescription: "Currency-specific home-bias guidance for CHF, EUR, or GBP.",
    includeHedging: "Include hedging discussion",
    includeHedgingDescription: "Currency hedging discussion: whether, where, and why.",
    includeLookThrough: "Include look-through exposure assessment",
    includeLookThroughDescription: "Assess underlying ETF exposures, especially for broad market indices.",
    includeSyntheticEtfs: "Include synthetic ETF assessment",
    includeSyntheticEtfsDescription: "Consider synthetic ETFs where structural advantages, including US tax withholding efficiency, may matter.",
    generatedPrompt: "Generated prompt",
    readyToPaste: "Ready to paste",
    outputCopy: "The prompt updates instantly from the selected parameters.",
    words: "words",
    copyPrompt: "Copy prompt",
    exportTxt: "Export .txt",
    exportMd: "Export .md",
    copied: "Copied",
    copyFailed: "Copy failed",
    resetDefaults: "Reset defaults: Growth CHF",
    promptOutput: "Prompt output",
    outputSectionsIncluded: "output sections included",
    targetEtfPositions: "target ETF positions",
    portfolioBaseCurrency: "portfolio base currency",
    disclaimerTitle: "Disclaimer",
    disclaimerText: "This does not constitute investment advice, an investment recommendation, or a solicitation to buy or sell financial instruments.",
    riskCheckOk: "Risk/horizon check passed",
    riskCheckWarning: "Risk/horizon warning",
    presets: "Investment Strategy Presets",
    presetCopy: "Start from a portfolio profile, then fine-tune any parameter.",
    demoTitle: "How to use the generated prompt",
    demoCopy: "Copy the prompt into your AI workspace, review the assumptions, and ask for refinements if your mandate changes.",
    demoSteps: ["Choose the investor profile and eligible asset classes.", "Check the structured prompt preview.", "Copy the prompt and use it as the starting point for the portfolio analysis."],
    marketingTitle: "Structured portfolio prompts for faster investment research",
    marketingCopy: "This tool turns investor preferences, ETF implementation constraints, and required output sections into a clear prompt for strategic asset allocation work.",
    marketingBullets: ["Configurable base currency, risk appetite, horizon, exchange focus, equity range, and ETF count.", "Built-in plausibility checks for risk/horizon alignment, selected sections, asset classes, and equity limits.", "Bilingual prompt output in English or German with currency-aware home-bias, hedging, look-through, and synthetic ETF instructions."],
    outputSections: {
      a: { label: "Target allocation", description: "Strategic asset allocation table." },
      b: { label: "ETF implementation", description: "ETF shortlist with the required metadata." },
      c: { label: "Assumptions summary", description: "Key design decisions in concise bullets." },
      d: { label: "Currency overview", description: "Consolidated portfolio currency exposure after hedging." },
      e: { label: "Top 10 look-through holdings", description: "Largest equity positions across the full portfolio." },
      f: { label: "Rebalancing concept", description: "Trigger rules, review frequency, and drift bands." },
      g: { label: "Weighted TER estimate", description: "Rough blended portfolio cost estimate." },
    },
  },
  German: {
    eyebrow: "Portfolio-Prompt-Builder",
    headline: "Mandat definieren. Prompt generieren.",
    heroCopy: "Konfiguriere das Anlegerprofil und die Umsetzungsrestriktionen, um einen strukturierten Prompt für strategische Asset Allocation zu generieren.",
    promptMode: "Prompt-Sprache",
    baseCurrency: "Basiswährung",
    exchangeFocus: "Börsenfokus",
    parameters: "Parameter",
    investorSetup: "Anlegerprofil",
    setupCopy: "Wähle die Werte, die in den generierten Prompt einfliessen sollen, und kopiere das Ergebnis direkt in deinen Workflow.",
    assetClasses: "Anlageklassen",
    equityRegions: "Aktienregionen",
    jumpToPrompt: "Zum Prompt",
    autoLogic: "Auto-Logik",
    autoLogicCopy: "Was der Builder aus deinen Eingaben abgeleitet hat.",
    noAutoLogic: "Aktuell sind keine automatischen Anpassungen aktiv.",
    presetContext: "Aktuelle Strategie",
    customStrategy: "Individuelles Setup",
    details: "Details",
    hideDetails: "Details ausblenden",
    versionLabel: "Version",
    updatedLabel: "Aktualisiert",
    language: "Sprache",
    riskAppetite: "Risikoappetit",
    investmentHorizon: "Anlagehorizont",
    preferredExchange: "Bevorzugte Börse",
    equityRange: "Aktienquote",
    minEquity: "Minimale Aktienquote",
    maxEquity: "Maximale Aktienquote",
    decreaseMinEquity: "Minimale Aktienquote senken",
    increaseMinEquity: "Minimale Aktienquote erhöhen",
    decreaseMaxEquity: "Maximale Aktienquote senken",
    increaseMaxEquity: "Maximale Aktienquote erhöhen",
    minEtfCount: "Minimale ETF-Anzahl",
    maxEtfCount: "Maximale ETF-Anzahl",
    decreaseMinEtf: "Minimale ETF-Anzahl senken",
    increaseMinEtf: "Minimale ETF-Anzahl erhöhen",
    decreaseMaxEtf: "Maximale ETF-Anzahl senken",
    increaseMaxEtf: "Maximale ETF-Anzahl erhöhen",
    eligibleAssetClasses: "Zulässige Anlageklassen",
    requiredOutputSections: "Gewünschte Ausgabeabschnitte",
    promptInstructions: "Prompt-Anweisungen",
    includeHomeBias: "Home-Bias-Hinweis einbeziehen",
    includeHomeBiasDescription: "Währungsspezifischer Home-Bias-Hinweis für CHF, EUR oder GBP.",
    includeHedging: "Währungsabsicherung einbeziehen",
    includeHedgingDescription: "Diskussion zur Währungsabsicherung: ob, wo und warum.",
    includeLookThrough: "Look-through-Exposures einbeziehen",
    includeLookThroughDescription: "Beurteilung zugrunde liegender ETF-Exposures, besonders bei breiten Marktindizes.",
    includeSyntheticEtfs: "Synthetische ETFs einbeziehen",
    includeSyntheticEtfsDescription: "Synthetische ETFs prüfen, wenn strukturelle Vorteile inklusive US-Steuereffizienz relevant sein können.",
    generatedPrompt: "Generierter Prompt",
    readyToPaste: "Bereit zum Kopieren",
    outputCopy: "Der Prompt aktualisiert sich sofort anhand der gewählten Parameter.",
    words: "Wörter",
    copyPrompt: "Prompt kopieren",
    exportTxt: "Export .txt",
    exportMd: "Export .md",
    copied: "Kopiert",
    copyFailed: "Kopieren fehlgeschlagen",
    resetDefaults: "Zurücksetzen: Wachstum CHF",
    promptOutput: "Prompt-Ausgabe",
    outputSectionsIncluded: "Ausgabeabschnitte enthalten",
    targetEtfPositions: "Zielanzahl\nETF-Positionen",
    portfolioBaseCurrency: "Basiswährung des Portfolios",
    disclaimerTitle: "Hinweis",
    disclaimerText: "Dies stellt keine Anlageberatung, Anlageempfehlung oder Aufforderung zum Kauf oder Verkauf von Finanzinstrumenten dar.",
    riskCheckOk: "Risiko-/Horizont-Prüfung bestanden",
    riskCheckWarning: "Risiko-/Horizont-Warnung",
    presets: "Investment Strategy Presets",
    presetCopy: "Starte mit einem Portfolio-Profil und verfeinere danach einzelne Parameter.",
    demoTitle: "So nutzt du den generierten Prompt",
    demoCopy: "Kopiere den Prompt in deinen KI-Workspace, prüfe die Annahmen und verfeinere ihn, falls sich das Mandat ändert.",
    demoSteps: ["Anlegerprofil und zulässige Anlageklassen wählen.", "Strukturierte Prompt-Vorschau prüfen.", "Prompt kopieren und als Ausgangspunkt für die Portfolioanalyse verwenden."],
    marketingTitle: "Strukturierte Portfolio-Prompts für schnellere Investment Research",
    marketingCopy: "Dieses Tool übersetzt Anlegerpräferenzen, ETF-Restriktionen und gewünschte Ausgabeformate in einen klaren Prompt für strategische Asset-Allocation-Arbeit.",
    marketingBullets: ["Konfigurierbare Basiswährung, Risikoappetit, Anlagehorizont, Börsenfokus, Aktienquote und ETF-Anzahl.", "Integrierte Plausibilitätschecks für Risiko-/Horizont-Abgleich, ausgewählte Abschnitte, Anlageklassen und Aktienlimiten.", "Zweisprachige Prompt-Ausgabe auf Englisch oder Deutsch mit währungsabhängigen Hinweisen zu Home Bias, Hedging, Look-through und synthetischen ETFs."],
    outputSections: {
      a: { label: "Zielallokation", description: "Tabelle zur strategischen Asset Allocation." },
      b: { label: "ETF-Umsetzung", description: "ETF-Auswahl mit den erforderlichen Metadaten." },
      c: { label: "Annahmen-Zusammenfassung", description: "Zentrale Design-Entscheidungen in knappen Bullet Points." },
      d: { label: "Währungsübersicht", description: "Konsolidierte Währungsexponierung nach Hedging." },
      e: { label: "Top-10-Look-through-Positionen", description: "Grösste Aktienpositionen über das Gesamtportfolio hinweg." },
      f: { label: "Rebalancing-Konzept", description: "Trigger, Frequenz und Bandbreiten." },
      g: { label: "Gewichtete TER-Schätzung", description: "Grobe Kostenindikation für das Gesamtportfolio." },
    },
  },
};

const defaults = {
  baseCurrency: "CHF",
  riskAppetite: "High",
  investmentHorizon: ">=10 years",
  equityMin: 75,
  equityMax: 95,
  equityRangeManuallyAdjusted: false,
  exchange: defaultExchangeByCurrency.CHF || exchangeOptions[0] || "SIX Swiss Exchange",
  exchangeManuallyAdjusted: false,
  minEtfs: 8,
  maxEtfs: 12,
  etfCountManuallyAdjusted: false,
  outputLanguage: "English",
  includeHomeBiasGuidance: true,
  includeHedgingQuestion: true,
  includeLookThrough: true,
  includeSyntheticEtfs: true,
  assetClasses: Object.fromEntries(assetClassOptions.map((option) => [option.id, true])),
  sections: Object.fromEntries(outputSections.map((section) => [section.id, true])),
};

const fallbackPortfolioPresets = [
  { id: "conservative", label: "Conservative", deLabel: "Konservativ", riskAppetite: "Low", investmentHorizon: ">=3 years", equityMin: 25, equityMax: 45, minEtfs: 6, maxEtfs: 10, assetClasses: { cash: true, bonds: true, equities: true, commodities: true, realEstate: false, crypto: false } },
  { id: "balanced", label: "Balanced", deLabel: "Ausgewogen", riskAppetite: "Balanced", investmentHorizon: ">=5 years", equityMin: 55, equityMax: 75, assetClasses: { cash: true, bonds: true, equities: true, commodities: true, realEstate: false, crypto: false } },
  { id: "growth", label: "Growth", deLabel: "Wachstum", riskAppetite: "High", investmentHorizon: ">=10 years", equityMin: 75, equityMax: 95, assetClasses: { cash: true, bonds: true, equities: true, commodities: true, realEstate: false, crypto: true } },
  { id: "aggressive", label: "Aggressive", deLabel: "Aggressiv", riskAppetite: "Very high", investmentHorizon: ">=10 years", equityMin: 90, equityMax: 100, assetClasses: { cash: true, bonds: false, equities: true, commodities: true, realEstate: true, crypto: true } },
];
const portfolioPresets = Array.isArray(promptBuilderConfig.presets) && promptBuilderConfig.presets.length
  ? promptBuilderConfig.presets
  : fallbackPortfolioPresets;

let state = createDefaultState();
let copyResetTimer = null;
let lastRiskHorizonAlertKey = "";
let lastSelectionAlertKey = "";
let lastEquityRiskAlertKey = "";
let lastDefensiveAssetAlertKey = "";
let lastEquityAssetAlertKey = "";
let lastAdditionalLogicAlertKey = "";
let activeStatusInfoKey = "";
let showPresetDetails = false;
let activePresetId = defaultPresetId;

document.addEventListener("DOMContentLoaded", () => {
  render();
  bindEvents();
});

function createDefaultState() {
  const next = JSON.parse(JSON.stringify(defaults));
  const defaultPreset = portfolioPresets.find((preset) => preset.id === defaultPresetId);
  if (defaultPreset) {
    Object.assign(next, {
      riskAppetite: defaultPreset.riskAppetite,
      investmentHorizon: defaultPreset.investmentHorizon,
      equityMin: defaultPreset.equityMin,
      equityMax: defaultPreset.equityMax,
    });
    if (defaultPreset.assetClasses) {
      Object.assign(next.assetClasses, defaultPreset.assetClasses);
    }
    const [minEtfs, maxEtfs] = getAutomaticEtfCount(next.assetClasses);
    next.minEtfs = minEtfs;
    next.maxEtfs = maxEtfs;
  }
  return next;
}

function isGerman() {
  return state.outputLanguage === "German";
}

function getSelectedAssetClasses() {
  return assetClassOptions.filter((option) => state.assetClasses[option.id]);
}

function getSelectedSections() {
  return outputSections.filter((section) => state.sections[section.id]);
}

function getEquityRegions(german = isGerman()) {
  if (state.baseCurrency === "CHF") {
    return german
      ? ["USA", "Europa ex CH", "Schweiz", "Japan", "EM"]
      : ["USA", "Europe ex-CH", "Switzerland", "Japan", "EM"];
  }

  return german
    ? ["USA", "Europa inkl. CH", "Japan", "EM"]
    : ["USA", "Europe incl. CH", "Japan", "EM"];
}

function getPromptStats(prompt) {
  return {
    assetClasses: getSelectedAssetClasses().length,
    equityRegions: state.assetClasses.equities ? getEquityRegions().length : 0,
    sections: getSelectedSections().length,
    words: prompt.trim().split(/\s+/).filter(Boolean).length,
  };
}

function getActivePreset() {
  return portfolioPresets.find((preset) => preset.id === activePresetId) || null;
}

function getPresetContextText() {
  return getPresetContextParts().join(", ");
}

function getPresetContextParts() {
  const german = isGerman();
  const t = uiText[state.outputLanguage];
  const preset = getActivePreset();
  const label = preset ? (german ? preset.deLabel : preset.label) : t.customStrategy;
  const equitySuffix = german ? "Aktien" : "equity";
  const etfText = german ? "ETFs" : "ETFs";
  return [`${label}:`, `${state.equityMin}-${state.equityMax}% ${equitySuffix}`, `${state.minEtfs}-${state.maxEtfs} ${etfText}`, state.exchange];
}

function getAutoLogicItems() {
  const german = isGerman();
  const items = [];

  items.push(state.exchangeManuallyAdjusted
    ? german ? "Börsenfokus manuell festgelegt." : "Exchange focus manually set."
    : german ? `Börsenfokus automatisch aus ${state.baseCurrency} abgeleitet.` : `Exchange focus automatically derived from ${state.baseCurrency}.`);

  if (!state.assetClasses.equities) {
    items.push(german ? "Aktien deaktiviert: Aktienquote automatisch auf 0-0% gesetzt." : "Equities disabled: equity range automatically set to 0-0%.");
  } else {
    items.push(state.equityRangeManuallyAdjusted
      ? german ? "Aktienquote manuell angepasst." : "Equity range manually adjusted."
      : german ? `Aktienquote automatisch aus Risikoappetit ${translateRisk(state.riskAppetite, true)} abgeleitet.` : `Equity range automatically derived from ${state.riskAppetite} risk appetite.`);
  }

  const disabledAssetClasses = assetClassOptions.filter((option) => !state.assetClasses[option.id]);
  if (state.etfCountManuallyAdjusted) {
    items.push(german ? "ETF-Zielanzahl manuell angepasst." : "Target ETF count manually adjusted.");
  } else if (disabledAssetClasses.length) {
    const labels = disabledAssetClasses.map((option) => german ? option.deLabel : option.label).join(", ");
    items.push(german ? `ETF-Zielanzahl automatisch reduziert wegen: ${labels}.` : `Target ETF count automatically reduced because these asset classes are disabled: ${labels}.`);
  } else {
    items.push(german ? "ETF-Zielanzahl folgt dem Standardbereich." : "Target ETF count follows the default range.");
  }

  if (state.baseCurrency === "USD") {
    items.push(german ? "Home-Bias-Hinweis wird bei USD automatisch ausgeblendet." : "Home-bias guidance is automatically hidden for USD.");
  }

  return items;
}

function getHorizonYears() {
  if (state.investmentHorizon === ">=10 years") return 10;
  if (state.investmentHorizon === ">=5 years") return 5;
  return 3;
}

function getRiskHorizonCheck() {
  const german = isGerman();
  const years = getHorizonYears();

  if (state.riskAppetite === "Very high" && years < 10) {
    return {
      ok: false,
      key: `${state.riskAppetite}-${state.investmentHorizon}`,
      message: german
        ? "Sehr hoher Risikoappetit passt in der Regel besser zu einem Anlagehorizont von mindestens 10 Jahren."
        : "Very high risk appetite is usually better aligned with an investment horizon of at least 10 years.",
    };
  }

  if (state.riskAppetite === "High" && years < 5) {
    return {
      ok: false,
      key: `${state.riskAppetite}-${state.investmentHorizon}`,
      message: german
        ? "Hoher Risikoappetit passt in der Regel besser zu einem Anlagehorizont von mindestens 5 Jahren."
        : "High risk appetite is usually better aligned with an investment horizon of at least 5 years.",
    };
  }

  return {
    ok: true,
    key: "ok",
    message: german
      ? "Risikoappetit und Anlagehorizont wirken plausibel aufeinander abgestimmt."
      : "Risk appetite and investment horizon appear reasonably aligned.",
  };
}

function maybeShowRiskHorizonAlert() {
  const riskCheck = getRiskHorizonCheck();
  if (riskCheck.ok || riskCheck.key === lastRiskHorizonAlertKey) return;
  lastRiskHorizonAlertKey = riskCheck.key;
  window.alert(riskCheck.message);
}

function maybeShowEquityRiskAlert() {
  const range = getEquityRangeForRisk(state.riskAppetite);
  if (!range || state.equityMax <= range[1]) {
    return;
  }

  const alertKey = state.riskAppetite;
  if (alertKey === lastEquityRiskAlertKey) return;
  lastEquityRiskAlertKey = alertKey;
  window.alert(
    isGerman()
      ? `Die maximale Aktienquote von ${state.equityMax}% wirkt für den gewählten Risikoappetit ${translateRisk(state.riskAppetite, true)} zu hoch. Vorgeschlagene Obergrenze: ${range[1]}%.`
      : `The maximum equity weight of ${state.equityMax}% appears too high for the selected risk appetite (${state.riskAppetite}). Suggested upper limit: ${range[1]}%.`
  );
}

function maybeShowDefensiveAssetAlert(changedName = "") {
  if (!["Low", "Moderate"].includes(state.riskAppetite)) {
    lastDefensiveAssetAlertKey = "";
    return;
  }

  if (getSelectedAssetClasses().length === 0) return;

  const changedDefensiveAsset = changedName === "asset:cash" || changedName === "asset:bonds";
  const defensiveAssetWasRemoved = changedName === "asset:cash"
    ? !state.assetClasses.cash
    : changedName === "asset:bonds"
      ? !state.assetClasses.bonds
      : false;
  const riskProfileChanged = changedName === "riskAppetite";

  if (!riskProfileChanged && (!changedDefensiveAsset || !defensiveAssetWasRemoved)) return;

  const missingDefensiveAssets = [
    state.assetClasses.cash ? null : "cash",
    state.assetClasses.bonds ? null : "bonds",
  ].filter(Boolean);

  if (!missingDefensiveAssets.length) {
    lastDefensiveAssetAlertKey = "";
    return;
  }

  const alertKey = `${state.riskAppetite}-${missingDefensiveAssets.join("-")}`;
  if (alertKey === lastDefensiveAssetAlertKey) return;
  lastDefensiveAssetAlertKey = alertKey;

  const german = isGerman();
  const missingLabels = missingDefensiveAssets.map((asset) => {
    if (asset === "cash") return german ? "Cash / Geldmarkt" : "Cash / Money Market";
    return german ? "Anleihen" : "Bonds";
  });
  const missingText = missingLabels.join(german ? " und " : " and ");

  window.alert(
    german
      ? `Beim Risikoappetit ${translateRisk(state.riskAppetite, true)} sollte ${missingText} in der Regel bewusst geprüft werden, bevor diese Anlageklasse ausgeschlossen wird.`
      : `For ${state.riskAppetite.toLowerCase()} risk appetite, ${missingText} should usually be reviewed carefully before excluding this asset class.`
  );
}

function maybeShowEquityAssetAlert(changedName = "") {
  if (!["Balanced", "High", "Very high"].includes(state.riskAppetite)) {
    lastEquityAssetAlertKey = "";
    return;
  }

  const equitiesWereRemoved = changedName === "asset:equities" && !state.assetClasses.equities;
  const riskProfileChanged = changedName === "riskAppetite";
  if (!equitiesWereRemoved && !riskProfileChanged) return;

  if (state.assetClasses.equities) {
    lastEquityAssetAlertKey = "";
    return;
  }

  const alertKey = `${state.riskAppetite}-equities-excluded`;
  if (alertKey === lastEquityAssetAlertKey) return;
  lastEquityAssetAlertKey = alertKey;

  window.alert(
    isGerman()
      ? `Beim Risikoappetit ${translateRisk(state.riskAppetite, true)} sollte ein vollständiger Ausschluss von Aktien bewusst geprüft werden, da die gewählte Strategie normalerweise eine Aktienquote enthält.`
      : `For ${state.riskAppetite.toLowerCase()} risk appetite, fully excluding equities should be reviewed carefully because the selected strategy usually includes equity exposure.`
  );
}

function maybeShowAdditionalLogicAlerts(changedName = "") {
  const alerts = getAdditionalLogicAlerts(changedName);
  if (!alerts.length) {
    if (shouldResetAdditionalLogicAlertKey(changedName)) {
      lastAdditionalLogicAlertKey = "";
    }
    return;
  }

  const alert = alerts[0];
  if (alert.key === lastAdditionalLogicAlertKey) return;
  lastAdditionalLogicAlertKey = alert.key;
  window.alert(alert.message);
}

function getAdditionalLogicAlerts(changedName = "") {
  const german = isGerman();
  const alerts = [];
  const minEtfs = Math.min(state.minEtfs, state.maxEtfs);
  const cryptoSelected = state.assetClasses.crypto;
  const realEstateSelected = state.assetClasses.realEstate;
  const equitiesSelected = state.assetClasses.equities;
  const rebalancingSelected = state.sections.f;
  const lookThroughSectionSelected = state.sections.e;
  const selectedAssetClasses = getSelectedAssetClasses();
  const minEtfsForAssetClasses = getMinimumEtfsForSelectedAssetClasses();
  const selectedAssetClassLabels = selectedAssetClasses.map((option) => german ? option.deLabel : option.label).join(", ");
  const usesChEquityAddOn = state.baseCurrency === "CHF" && state.assetClasses.equities;
  const chEquityAddOnText = usesChEquityAddOn
    ? german
      ? " Bei CHF mit Aktien wird wegen der separaten Schweiz-Allokation eine zusätzliche Position eingerechnet."
      : " For CHF portfolios with equities, one additional position is counted because Swiss equities are treated as a separate allocation."
    : "";

  if (["Low", "Moderate"].includes(state.riskAppetite) && cryptoSelected && ["asset:crypto", "riskAppetite"].includes(changedName)) {
    alerts.push({
      key: `crypto-defensive-${state.riskAppetite}`,
      message: german
        ? `Beim Risikoappetit ${translateRisk(state.riskAppetite, true)} sollte Krypto als volatile Satellitenallokation besonders bewusst begründet werden.`
        : `For ${state.riskAppetite.toLowerCase()} risk appetite, crypto should be justified especially carefully as a high-volatility satellite allocation.`,
    });
  }

  if (cryptoSelected && !rebalancingSelected && ["asset:crypto", "section:f"].includes(changedName)) {
    alerts.push({
      key: "crypto-without-rebalancing",
      message: german
        ? "Wenn Krypto-Assets ausgewählt sind, ist ein Rebalancing-Konzept besonders wichtig, weil die Allokation stark schwanken kann."
        : "When crypto assets are selected, a rebalancing concept is especially important because the allocation can drift materially.",
    });
  }

  if (!state.assetClasses.bonds && state.investmentHorizon === ">=3 years" && ["asset:bonds", "investmentHorizon"].includes(changedName)) {
    alerts.push({
      key: "no-bonds-short-horizon",
      message: german
        ? "Bei einem Anlagehorizont von mindestens 3 Jahren sollte der Ausschluss von Anleihen bewusst geprüft werden, da Stabilitätsbausteine bei kürzerem Horizont besonders wichtig sein können."
        : "With an investment horizon of at least 3 years, excluding bonds should be reviewed carefully because stabilizing assets can be especially important at shorter horizons.",
    });
  }

  if (lookThroughSectionSelected && !state.includeLookThrough && ["includeLookThrough", "section:e"].includes(changedName)) {
    alerts.push({
      key: "look-through-section-without-instruction",
      message: german
        ? "Die Look-through-Ausgabesektion ist aktiv, aber die Look-through-Anweisung ist deaktiviert. Das kann die erwartete Ausgabe weniger eindeutig machen."
        : "The look-through output section is selected, but the look-through instruction is disabled. This can make the expected response less explicit.",
    });
  }

  if (state.includeSyntheticEtfs && !equitiesSelected && ["includeSyntheticEtfs", "asset:equities"].includes(changedName)) {
    alerts.push({
      key: "synthetic-etfs-without-equities",
      message: german
        ? "Die Beurteilung synthetischer ETFs ist vor allem bei Aktienexposure, insbesondere US-Aktien, relevant. Ohne Aktien kann diese Anforderung weniger passend sein."
        : "Synthetic ETF assessment is mainly relevant for equity exposure, especially US equities. Without equities, this requirement may be less useful.",
    });
  }

  if (selectedAssetClasses.length && minEtfs < minEtfsForAssetClasses && shouldCheckEtfCoverage(changedName)) {
    alerts.push({
      key: `etf-coverage-${state.baseCurrency}-${minEtfs}-${minEtfsForAssetClasses}-${selectedAssetClasses.map((option) => option.id).join("-")}`,
      message: german
        ? `Die Mindestanzahl ETFs sollte mindestens der Zahl der ausgewählten Anlageklassen entsprechen.${chEquityAddOnText} Ausgewählt: ${selectedAssetClassLabels}. Aktuelle Mindestanzahl: ${minEtfs}; sinnvolle Mindestanzahl: ${minEtfsForAssetClasses}.`
        : `The minimum ETF count should at least match the number of selected asset classes.${chEquityAddOnText} Selected asset classes: ${selectedAssetClassLabels}. Current minimum: ${minEtfs}; suggested minimum: ${minEtfsForAssetClasses}.`,
    });
  }

  if (realEstateSelected && minEtfs <= 5 && ["asset:realEstate", "minEtfs", "maxEtfs"].includes(changedName)) {
    alerts.push({
      key: `real-estate-low-etf-count-${minEtfs}`,
      message: german
        ? "Bei sehr wenigen ETF-Positionen kann eine separate Immobilien-/REIT-Allokation schwer sauber umsetzbar sein."
        : "With very few ETF positions, a separate listed real estate / REIT allocation may be difficult to implement cleanly.",
    });
  }

  if (cryptoSelected && minEtfs <= 5 && ["asset:crypto", "minEtfs", "maxEtfs"].includes(changedName)) {
    alerts.push({
      key: `crypto-low-etf-count-${minEtfs}`,
      message: german
        ? "Bei sehr wenigen ETF-Positionen kann eine separate Krypto-Satellitenallokation schwer sauber umsetzbar sein."
        : "With very few ETF positions, a separate crypto satellite allocation may be difficult to implement cleanly.",
    });
  }

  return alerts;
}

function shouldResetAdditionalLogicAlertKey(changedName = "") {
  return changedName.startsWith("asset:") || ["section:f", "section:e", "includeLookThrough", "includeSyntheticEtfs", "minEtfs", "maxEtfs", "riskAppetite", "investmentHorizon", "baseCurrency"].includes(changedName);
}

function shouldCheckEtfCoverage(changedName = "") {
  return changedName.startsWith("asset:") || ["minEtfs", "maxEtfs", "baseCurrency"].includes(changedName);
}

function getMinimumEtfsForSelectedAssetClasses() {
  const selectedCount = getSelectedAssetClasses().length;
  const chEquityAddOn = state.baseCurrency === "CHF" && state.assetClasses.equities ? 1 : 0;
  return selectedCount + chEquityAddOn;
}

function maybeShowSelectionAlert(changedName) {
  let alertKey = "";
  let message = "";

  if (changedName.startsWith("asset:")) {
    if (getSelectedAssetClasses().length === 0) {
      alertKey = "asset-empty";
      message = isGerman()
        ? "Keine Anlageklassen ausgewählt. Wähle mindestens eine zulässige Anlageklasse aus."
        : "No asset classes selected. Add at least one eligible asset class.";
    } else if (lastSelectionAlertKey === "asset-empty") {
      lastSelectionAlertKey = "";
    }
  }

  if (changedName.startsWith("section:")) {
    if (getSelectedSections().length === 0) {
      alertKey = "section-empty";
      message = isGerman()
        ? "Keine Ausgabeabschnitte ausgewählt. Wähle mindestens einen Abschnitt für die Antwort aus."
        : "No output sections selected. Specify at least one section in the response.";
    } else if (lastSelectionAlertKey === "section-empty") {
      lastSelectionAlertKey = "";
    }
  }

  if (!alertKey) return;
  if (lastSelectionAlertKey === alertKey) return;
  lastSelectionAlertKey = alertKey;
  window.alert(message);
}

function buildPrompt() {
  const german = isGerman();
  const selectedAssetClasses = getSelectedAssetClasses();
  const selectedSections = getSelectedSections();
  const clampedMin = Math.min(state.equityMin, state.equityMax);
  const clampedMax = Math.max(state.equityMin, state.equityMax);
  const minEtfs = Math.min(state.minEtfs, state.maxEtfs);
  const maxEtfs = Math.max(state.minEtfs, state.maxEtfs);
  const equityAllocationLine = formatEquityAllocationLine(clampedMin, clampedMax, german);
  const etfTargetRequirement = formatEtfTargetRequirement(minEtfs, maxEtfs, german);
  const portfolioStyle = german
    ? "breit diversifiziertes, renditeorientiertes Referenzportfolio"
    : "broadly diversified, return-oriented reference portfolio";
  const languageInstruction = german
    ? "Schreibe die vollständige Antwort in klarem Deutsch."
    : "Write the full answer in clear English.";
  const assetClassLines = selectedAssetClasses.length
    ? selectedAssetClasses.map((option) => `- ${getAssetClassPromptLabel(option, german)}`).join("\n")
    : german
      ? "- Keine Anlageklassen ausgewählt. Wähle mindestens eine zulässige Anlageklasse aus."
      : "- No asset classes selected. Add at least one eligible asset class.";
  const sectionLines = selectedSections.length
    ? selectedSections.map((section, index) => renderSectionInstruction(section, german, index)).join("\n\n")
    : german
      ? "Kein Ausgabeabschnitt ausgewählt. Wähle mindestens einen Abschnitt für die Antwort aus."
      : "No output sections selected. Specify at least one section in the response.";
  const numberedRequirements = [
    german ? "Die Zielgewichte müssen in Summe genau 100% ergeben." : "Target weights must add up to exactly 100%.",
    german ? "Verwende ausschliesslich ETFs zur Umsetzung." : "Use ETFs only for implementation.",
    german
      ? `Bevorzuge ETFs, die an ${state.exchange} handelbar sind. Falls dies nicht möglich ist, nenne die nächstbeste Alternative und begründe die Ausnahme.`
      : `Prefer ETFs tradable on ${state.exchange}. If this is not possible, name the next-best alternative and explain the exception.`,
    etfTargetRequirement,
    german ? "Priorisiere Kosteneffizienz, Diversifikation und praktische Umsetzbarkeit." : "Prioritize cost efficiency, diversification, and practical implementability.",
    german ? "Keine Prognosen, kein Market-Timing und keine kurzfristigen Marktausblicke." : "Do not make forecasts, do not market-time, and do not include short-term market views.",
    german ? "Entscheide regelbasiert anhand von Diversifikation, Risikokontrolle, Kosten und Umsetzbarkeit." : "Decide using rules and portfolio design principles such as diversification, risk control, costs, and implementability.",
    german ? "Triff sinnvolle Standardannahmen, falls Informationen fehlen, und kennzeichne Unsicherheiten transparent statt Scheingenauigkeit zu erzeugen." : "Make sensible standard assumptions if information is missing, and flag uncertainty transparently instead of pretending to be precise.",
    getHomeBiasInstruction(german),
    state.includeHedgingQuestion
      ? german
        ? "Lege klar dar, ob eine Währungsabsicherung verwendet werden soll, wo sie eingesetzt werden soll und warum."
        : "State clearly whether currency hedging should be used, where it should be applied, and why."
      : null,
    state.includeLookThrough
      ? german
        ? "Falls sinnvoll, führe einen Look-through der gewählten ETFs durch, um zugrunde liegende Exposures zu beurteilen, insbesondere wenn breite Marktindizes (z. B. globale Aktienindizes) für die Asset Allocation verwendet werden. Falls relevant, füge nach Tabelle 1 eine Look-through-Asset-Allocation-Übersicht ein, um die zugrunde liegenden Exposures abzubilden."
        : "Where relevant, perform a look-through of the selected ETFs to assess underlying exposures, particularly when broad market indices (e.g. global equity indices) are used for asset allocation. If relevant, include a look-through asset allocation overview after Table 1 to reflect underlying exposures."
      : null,
    state.includeSyntheticEtfs
      ? german
        ? "Beziehe synthetische ETFs ein, wenn sie strukturelle Vorteile bieten, insbesondere in Bezug auf Markteffizienz und reduzierte Quellensteuer-Leakage (z. B. bei US-Aktienexposure), und stelle dabei Transparenz und Robustheit sicher. Reflektiere und erkläre deren Einsatz klar in Abschnitt C) Zusammenfassung der wichtigsten Design-Entscheidungen, z. B. wo sie eingesetzt werden und warum."
        : "Include synthetic ETFs where they provide structural advantages, particularly in terms of market efficiency and reduced withholding tax leakage (e.g., for US equity exposure), while ensuring transparency and robustness. Reflect and explain their use clearly in section C) Summary of Key Design Decisions (e.g., where they are applied and why)."
      : null,
    languageInstruction,
  ].filter(Boolean);
  const requirementsLines = numberedRequirements.map((line, index) => `${index + 1}. ${line}`).join("\n");

  if (german) {
    return `Rolle:
Du agierst als unabhängiger Portfolio-Stratege auf CFA-Niveau.

Ziel:
Erstelle ein ${portfolioStyle} für einen Investor mit:
- Basiswährung: ${state.baseCurrency}
- Risikoappetit: ${translateRisk(state.riskAppetite, true)}
- Anlagehorizont: ${translateHorizon(state.investmentHorizon, true)}
${equityAllocationLine}

Zulässige Anlageklassen:
${assetClassLines}

Vorgaben und Restriktionen:
${requirementsLines}

Ausgabeformat:
${sectionLines}`;
  }

  return `Role:
You act as an independent CFA-level portfolio strategist.

Objective:
Create a ${portfolioStyle} for an investor with:
- Base currency: ${state.baseCurrency}
- Risk appetite: ${translateRisk(state.riskAppetite, false)}
- Investment horizon: ${translateHorizon(state.investmentHorizon, false)}
${equityAllocationLine}

Eligible asset classes:
${assetClassLines}

Requirements and constraints:
${requirementsLines}

Output format:
${sectionLines}`;
}

function translateRisk(risk, german) {
  if (!german) return risk;
  const mapping = { Low: "niedrig", Moderate: "moderat", Balanced: "ausgewogen", High: "hoch", "Very high": "sehr hoch" };
  return mapping[risk] || risk;
}

function translateHorizon(horizon, german) {
  if (!german) return horizon;
  const mapping = { ">=3 years": ">=3 Jahre", ">=5 years": ">=5 Jahre", ">=10 years": ">=10 Jahre" };
  return mapping[horizon] || horizon;
}

function formatEquityAllocationLine(minWeight, maxWeight, german) {
  if (minWeight === maxWeight) {
    return german
      ? `- Aktienquote: ${minWeight}%`
      : `- Equity allocation: ${minWeight}%`;
  }

  return german
    ? `- Aktienquote zwischen ${minWeight}% und ${maxWeight}%`
    : `- Equity allocation between ${minWeight}% and ${maxWeight}%`;
}

function formatEtfTargetRequirement(minEtfs, maxEtfs, german) {
  if (minEtfs === maxEtfs) {
    return german
      ? `Verwende möglichst wenige ETFs. Ziel: genau ${minEtfs} Positionen insgesamt, ohne Diversifikation unnötig zu opfern.`
      : `Use as few ETFs as possible. Target exactly ${minEtfs} positions in total without sacrificing diversification unnecessarily.`;
  }

  return german
    ? `Verwende möglichst wenige ETFs. Ziel: ${minEtfs}-${maxEtfs} Positionen insgesamt, ohne Diversifikation unnötig zu opfern.`
    : `Use as few ETFs as possible. Target ${minEtfs}-${maxEtfs} positions in total without sacrificing diversification unnecessarily.`;
}

function getHomeBiasInstruction(german) {
  if (!state.includeHomeBiasGuidance) return null;
  if (state.baseCurrency === "CHF") {
    return german ? "Gehe explizit auf einen Schweizer Home Bias ein und erkläre, ob er gerechtfertigt ist oder begrenzt werden sollte." : "Address Swiss home bias explicitly and explain whether it is warranted or should be limited.";
  }
  if (state.baseCurrency === "EUR") {
    return german ? "Gehe explizit auf einen europäischen Home Bias ein und erkläre, ob er gerechtfertigt ist oder begrenzt werden sollte." : "Address European home bias explicitly and explain whether it is warranted or should be limited.";
  }
  if (state.baseCurrency === "GBP") {
    return german ? "Gehe explizit auf einen britischen Home Bias ein und erkläre, ob er gerechtfertigt ist oder begrenzt werden sollte." : "Address British home bias explicitly and explain whether it is warranted or should be limited.";
  }
  return null;
}

function getAssetClassPromptLabel(option, german) {
  if (option.id !== "equities") {
    return german ? option.deLabel : option.label;
  }

  if (state.baseCurrency === "CHF") {
    return german
      ? "Aktien nach Regionen: USA, Europa ex CH, Schweiz (CH), Japan und Emerging Markets"
      : "Equities by region: USA, Europe ex-CH, Switzerland (CH), Japan, and Emerging Markets";
  }

  return german
    ? "Aktien nach Regionen: USA, Europa inkl. Schweiz, Japan und Emerging Markets"
    : "Equities by region: USA, Europe incl. Switzerland, Japan, and Emerging Markets";
}

function getAssetClassDescription(option, german) {
  if (option.id !== "equities") {
    return german ? option.deDescription : option.description;
  }

  if (state.baseCurrency === "CHF") {
    return german
      ? "USA, Europa ex CH, Schweiz separat, Japan und Emerging Markets."
      : "USA, Europe ex-CH, Switzerland shown separately, Japan, and Emerging Markets.";
  }

  return german
    ? "USA, Europa inklusive Schweiz, Japan und Emerging Markets."
    : "USA, Europe including Switzerland, Japan, and Emerging Markets.";
}

function renderSectionInstruction(section, german, index = outputSections.findIndex((item) => item.id === section.id)) {
  const prefix = String.fromCharCode(65 + index);

  switch (section.id) {
    case "a":
      return german ? `${prefix}) Tabelle 1: Zielallokation\nSpalten: Anlageklasse | Zielgewicht | Zweck / Rolle im Portfolio (1-2 Sätze).` : `${prefix}) Table 1: Target allocation\nColumns: Asset class | Target weight | Purpose / role in the portfolio (1-2 sentences).`;
    case "b":
      return german ? `${prefix}) Tabelle 2: Umsetzung mit ETFs (pro Position)\nSpalten: Anlageklasse | Zielgewicht | ETF-Name | ISIN | Ticker (Börse) | TER | Domizil | Replikation | Ausschüttung / Thesaurierung | Anteilsklassenwährung | Kurzkommentar (1 Satz zu Passung, Liquidität oder Tracking).` : `${prefix}) Table 2: ETF implementation (for each position)\nColumns: Asset class | Target weight | ETF name | ISIN | Ticker (exchange) | TER | Domicile | Replication | Distribution / accumulation | Share class currency | Short comment (1 sentence on fit, liquidity, or tracking quality).`;
    case "c":
      return german ? `${prefix}) Kurze Zusammenfassung (ca. 10 Bullet Points) zu den wichtigsten Annahmen und Design-Entscheidungen, inklusive Aktienquote, Regionalmix, Konzentrationsrisiken, Home Bias, ausgeschlossene Anlageklassen, Rohstoffe / Edelmetalle, Immobilien und Krypto-Assets, wo relevant.` : `${prefix}) Brief summary (around 10 bullet points) covering the key assumptions and design decisions, including equity exposure, regional mix, concentration risks, home bias, excluded asset classes, commodities / precious metals, listed real estate, and crypto assets where relevant.`;
    case "d":
      return german ? `${prefix}) Konsolidierte Währungsübersicht des Gesamtportfolios nach Hedging.` : `${prefix}) Consolidated currency overview of the total portfolio after hedging.`;
    case "e":
      return state.includeLookThrough
        ? german ? `${prefix}) Die zehn grössten Aktienpositionen auf Look-through-Basis und deren Gewichte.` : `${prefix}) The ten largest equity holdings on a look-through basis and their portfolio weights.`
        : german ? `${prefix}) Grösste zugrunde liegende Aktienpositionen, falls die gewählte Umsetzung eine sinnvolle Look-through-Sicht erlaubt.` : `${prefix}) Largest underlying equity holdings if the selected implementation allows a meaningful look-through view.`;
    case "f":
      return german ? `${prefix}) Rebalancing-Konzept inklusive Trigger, Frequenz und Bandbreiten.` : `${prefix}) Rebalancing concept including trigger, frequency, and tolerance bands.`;
    case "g":
      return german ? `${prefix}) Grobe Kostenschätzung als gewichtete TER für das Gesamtportfolio.` : `${prefix}) Rough cost estimate expressed as weighted TER for the full portfolio.`;
    default:
      return "";
  }
}

function render() {
  const prompt = buildPrompt();
  const stats = getPromptStats(prompt);
  const t = uiText[state.outputLanguage];
  const riskCheck = getRiskHorizonCheck();
  const root = document.getElementById("root");

  root.innerHTML = `
    <main class="app-shell">
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">${escapeHtml(t.eyebrow)}</span>
          <h1>${escapeHtml(t.headline)}</h1>
          <p>${escapeHtml(t.heroCopy)}</p>
        </div>
        <aside class="hero-aside">
          <div class="hero-stat"><span>${escapeHtml(t.baseCurrency)}</span><strong>${escapeHtml(state.baseCurrency)}</strong></div>
          <div class="hero-stat"><span>${escapeHtml(t.riskAppetite)}</span><strong>${escapeHtml(translateRisk(state.riskAppetite, isGerman()))}</strong></div>
          <div class="hero-stat"><span>${escapeHtml(t.investmentHorizon)}</span><strong>${escapeHtml(translateHorizon(state.investmentHorizon, isGerman()))}</strong></div>
          <div class="hero-stat"><span>${escapeHtml(t.maxEquity)}</span><strong>${escapeHtml(`${state.equityMax}%`)}</strong></div>
        </aside>
      </section>

      <section class="workspace">
        <section class="panel controls-panel">
          <div class="panel-header">
            <div class="panel-title">
              <div class="panel-label">${escapeHtml(t.parameters)}</div>
              <h2>${escapeHtml(t.investorSetup)}</h2>
              <p>${escapeHtml(t.setupCopy)}</p>
            </div>
            <div class="panel-badges">
              ${renderAssetClassBadge(stats)}
              ${renderEquityRegionBadge(stats)}
            </div>
          </div>

          <div class="form-grid">
            <div class="dual-grid triple-grid-mobile">
              <label class="field-group">
                <span class="field-label">${escapeHtml(t.language)}</span>
                <select class="select" name="outputLanguage">${renderOptions(["English", "German"], state.outputLanguage, getLanguageOptionLabels())}</select>
              </label>
              <label class="field-group">
                <span class="field-label">${escapeHtml(t.baseCurrency)}</span>
                <select class="select" name="baseCurrency">${renderOptions(baseCurrencyOptions, state.baseCurrency)}</select>
              </label>
            </div>

            <div class="field-group preset-section ${showPresetDetails ? "show-preset-details" : ""}">
              <div class="preset-section-head">
                <div>
                  <span class="field-label">${escapeHtml(t.presets)}</span>
                  <p class="field-help">${escapeHtml(t.presetCopy)}</p>
                </div>
                <button class="details-toggle" type="button" data-action="toggle-preset-details" aria-expanded="${showPresetDetails ? "true" : "false"}">${escapeHtml(showPresetDetails ? t.hideDetails : t.details)}</button>
              </div>
              <div class="preset-grid">${portfolioPresets.map(renderPresetButton).join("")}</div>
              <div class="strategy-context"><span>${escapeHtml(t.presetContext)}</span><strong>${renderStrategyContextValue()}</strong></div>
            </div>

            <div class="dual-grid triple-grid-mobile">
              <label class="field-group">
                <span class="field-label">${escapeHtml(t.riskAppetite)}</span>
                <select class="select" name="riskAppetite">${renderOptions(["Low", "Moderate", "Balanced", "High", "Very high"], state.riskAppetite, getRiskOptionLabels())}</select>
              </label>
              <label class="field-group">
                <span class="field-label">${escapeHtml(t.investmentHorizon)}</span>
                <select class="select" name="investmentHorizon">${renderOptions([">=3 years", ">=5 years", ">=10 years"], state.investmentHorizon, getHorizonOptionLabels())}</select>
              </label>
            </div>

            <div class="dual-grid exchange-grid triple-grid-mobile">
              <div class="field-group exchange-group">
                <div class="range-header">
                  <span class="field-label">${escapeHtml(t.preferredExchange)}</span>
                  <div class="range-status">
                    ${renderAdjustmentStatus(state.exchangeManuallyAdjusted, "restore-exchange-auto")}
                  </div>
                </div>
                <select class="select" name="exchange">${renderOptions(exchangeOptions, state.exchange)}</select>
              </div>
            </div>

            <div class="field-group range-group">
              <div class="range-header">
                <span class="field-label">${escapeHtml(t.equityRange)}</span>
                <div class="range-status">
                  ${renderAdjustmentStatus(state.equityRangeManuallyAdjusted, "restore-equity-auto")}
                  <span class="pill">${formatUiRange(Math.min(state.equityMin, state.equityMax), Math.max(state.equityMin, state.equityMax), "%")}</span>
                </div>
              </div>
              <div class="range-grid">
                <div class="range-card">
                  <span class="field-help">${escapeHtml(t.minEquity)}</span>
                  <div class="counter-box">
                    <button class="stepper" type="button" data-step-target="equityMin" data-step-direction="-5" aria-label="${escapeAttribute(t.decreaseMinEquity)}">-</button>
                    <strong>${state.equityMin}%</strong>
                    <button class="stepper" type="button" data-step-target="equityMin" data-step-direction="5" aria-label="${escapeAttribute(t.increaseMinEquity)}">+</button>
                  </div>
                </div>
                <div class="range-card">
                  <span class="field-help">${escapeHtml(t.maxEquity)}</span>
                  <div class="counter-box">
                    <button class="stepper" type="button" data-step-target="equityMax" data-step-direction="-5" aria-label="${escapeAttribute(t.decreaseMaxEquity)}">-</button>
                    <strong>${state.equityMax}%</strong>
                    <button class="stepper" type="button" data-step-target="equityMax" data-step-direction="5" aria-label="${escapeAttribute(t.increaseMaxEquity)}">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="field-group range-group etf-count-group">
              <div class="range-header">
                <span class="field-label">${escapeHtml(t.targetEtfPositions)}</span>
                <div class="range-status">
                  ${renderAdjustmentStatus(state.etfCountManuallyAdjusted, "restore-etf-auto")}
                  <span class="pill">${formatUiRange(Math.min(state.minEtfs, state.maxEtfs), Math.max(state.minEtfs, state.maxEtfs))}</span>
                </div>
              </div>
              <div class="range-grid">
                <div class="range-card compact-counter-card">
                  <span class="field-help">${escapeHtml(t.minEtfCount)}</span>
                  <div class="counter-box">
                    <button class="stepper" type="button" data-step-target="minEtfs" data-step-direction="-1" aria-label="${escapeAttribute(t.decreaseMinEtf)}">-</button>
                    <strong>${state.minEtfs}</strong>
                    <button class="stepper" type="button" data-step-target="minEtfs" data-step-direction="1" aria-label="${escapeAttribute(t.increaseMinEtf)}">+</button>
                  </div>
                </div>
                <div class="range-card compact-counter-card">
                  <span class="field-help">${escapeHtml(t.maxEtfCount)}</span>
                  <div class="counter-box">
                    <button class="stepper" type="button" data-step-target="maxEtfs" data-step-direction="-1" aria-label="${escapeAttribute(t.decreaseMaxEtf)}">-</button>
                    <strong>${state.maxEtfs}</strong>
                    <button class="stepper" type="button" data-step-target="maxEtfs" data-step-direction="1" aria-label="${escapeAttribute(t.increaseMaxEtf)}">+</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="field-group option-section asset-section"><span class="field-label">${escapeHtml(t.eligibleAssetClasses)}</span><div class="toggle-grid">${assetClassOptions.map(renderAssetClassToggle).join("")}</div></div>
            <a class="mobile-jump" href="#prompt-output">${escapeHtml(t.jumpToPrompt)}</a>
            <div class="field-group option-section output-section"><span class="field-label">${escapeHtml(t.requiredOutputSections)}</span><div class="toggle-grid">${outputSections.map(renderSectionToggle).join("")}</div></div>
            <div class="field-group option-section instruction-section"><span class="field-label">${escapeHtml(t.promptInstructions)}</span><div class="toggle-grid">
              ${state.baseCurrency === "USD" ? "" : renderCheckboxCard("includeHomeBiasGuidance", state.includeHomeBiasGuidance, t.includeHomeBias, t.includeHomeBiasDescription)}
              ${renderCheckboxCard("includeHedgingQuestion", state.includeHedgingQuestion, t.includeHedging, t.includeHedgingDescription)}
              ${renderCheckboxCard("includeLookThrough", state.includeLookThrough, t.includeLookThrough, t.includeLookThroughDescription)}
              ${renderCheckboxCard("includeSyntheticEtfs", state.includeSyntheticEtfs, t.includeSyntheticEtfs, t.includeSyntheticEtfsDescription)}
            </div></div>
          </div>
        </section>

        <section class="panel output-panel" id="prompt-output">
          <div class="panel-header">
            <div class="panel-title">
              <div class="panel-label">${escapeHtml(t.generatedPrompt)}</div>
              <h3>${escapeHtml(t.readyToPaste)}</h3>
              <p>${escapeHtml(t.outputCopy)}</p>
            </div>
            <span class="pill">${stats.words} ${escapeHtml(t.words)}</span>
          </div>
          <div class="risk-check ${riskCheck.ok ? "risk-check-ok" : "risk-check-warning"}">
            <strong>${escapeHtml(riskCheck.ok ? t.riskCheckOk : t.riskCheckWarning)}</strong>
            <span>${escapeHtml(riskCheck.message)}</span>
          </div>
          ${renderAutoLogicSummary()}
          <div class="action-row">
            <button class="button" type="button" data-action="copy">${escapeHtml(t.copyPrompt)}</button>
            <button class="button-ghost" type="button" data-action="export-txt">${escapeHtml(t.exportTxt)}</button>
            <button class="button-ghost" type="button" data-action="export-md">${escapeHtml(t.exportMd)}</button>
            <button class="button-ghost" type="button" data-action="reset">${escapeHtml(t.resetDefaults)}</button>
          </div>
          <div class="output-meta">${escapeHtml(t.promptOutput)}</div>
          <div class="output-box structured-output">${renderPromptPreview(prompt)}</div>
          <div class="summary-grid">
            <div class="summary-item"><strong>${stats.sections}</strong><span>${escapeHtml(t.outputSectionsIncluded)}</span></div>
            <div class="summary-item"><strong>${Math.min(state.minEtfs, state.maxEtfs)}-${Math.max(state.minEtfs, state.maxEtfs)}</strong><span>${escapeHtml(t.targetEtfPositions)}</span></div>
            <div class="summary-item"><strong>${escapeHtml(state.baseCurrency)}</strong><span>${escapeHtml(t.portfolioBaseCurrency)}</span></div>
          </div>
          <div class="app-disclaimer"><span class="disclaimer-mark">i</span><div><strong>${escapeHtml(t.disclaimerTitle)}</strong><span>${escapeHtml(t.disclaimerText)}</span></div></div>

        </section>
      </section>
      <section class="support-section">
        <article class="support-block demo-block">
          <div class="panel-label">${escapeHtml(t.demoTitle)}</div>
          <p>${escapeHtml(t.demoCopy)}</p>
          <ol>${t.demoSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
        </article>
        <article class="support-block marketing-block">
          <div class="panel-label">${escapeHtml(t.marketingTitle)}</div>
          <p>${escapeHtml(t.marketingCopy)}</p>
          <ul>${t.marketingBullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>
        </article>
      </section>
      <div class="version-note">${escapeHtml(t.versionLabel)} ${escapeHtml(appVersion)} · ${escapeHtml(t.updatedLabel)} ${escapeHtml(appUpdated)}</div>
    </main>
  `;
}

function renderOptions(options, selected, labels = {}) {
  return options
    .map((option) => `<option value="${escapeAttribute(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(labels[option] || option)}</option>`)
    .join("");
}

function getLanguageOptionLabels() {
  return isGerman() ? { English: "Englisch", German: "Deutsch" } : {};
}

function getRiskOptionLabels() {
  return isGerman()
    ? { Low: "Niedrig", Moderate: "Moderat", Balanced: "Ausgewogen", High: "Hoch", "Very high": "Sehr hoch" }
    : {};
}

function getHorizonOptionLabels() {
  return isGerman()
    ? { ">=3 years": ">=3 Jahre", ">=5 years": ">=5 Jahre", ">=10 years": ">=10 Jahre" }
    : {};
}

function getAdjustmentLabel(isManual) {
  if (isGerman()) return isManual ? "Manuell" : "Automatisch";
  return isManual ? "Manual" : "Auto";
}

function getAdjustmentInfoLabel(isManual) {
  if (isGerman()) {
    return isManual
      ? "Manuell angepasst. Klicke auf Manuell, um wieder zur automatischen Logik zurückzukehren."
      : "Automatisch aus den gewählten Parametern abgeleitet.";
  }

  return isManual
    ? "Manually adjusted. Click Manual to return to automatic logic."
    : "Automatically derived from the selected parameters.";
}

function renderAdjustmentStatus(isManual, action) {
  const info = getAdjustmentInfoLabel(isManual);
  const isOpen = activeStatusInfoKey === action;
  return `
    <button class="status-pill ${isManual ? "status-manual" : "status-auto"}" type="button" data-action="${escapeAttribute(action)}" ${isManual ? "" : "disabled"}>${escapeHtml(getAdjustmentLabel(isManual))}</button>
    <span class="status-info-wrap ${isOpen ? "is-open" : ""}">
      <button class="status-info" type="button" data-action="toggle-status-info" data-info-key="${escapeAttribute(action)}" aria-label="${escapeAttribute(info)}" aria-expanded="${isOpen ? "true" : "false"}">(i)</button>
      <span class="status-tooltip" role="tooltip">${escapeHtml(info)}</span>
    </span>
  `;
}

function renderAssetClassToggle(option) {
  const german = isGerman();
  return renderCheckboxCard(`asset:${option.id}`, state.assetClasses[option.id], german ? option.deLabel : option.label, getAssetClassDescription(option, german));
}

function renderStrategyContextValue() {
  const parts = getPresetContextParts();
  return parts
    .map((part, index) => `<span class="strategy-segment">${escapeHtml(part)}${index === 0 ? "" : index < parts.length - 1 ? "," : ""}</span>`)
    .join(" ");
}

function renderAssetClassBadge(stats) {
  const t = uiText[state.outputLanguage];
  const german = isGerman();
  const selected = getSelectedAssetClasses();
  const labels = selected.map((option) => german ? option.deLabel : option.label);
  const title = labels.length ? labels.join(", ") : german ? "Keine Anlageklassen ausgewählt" : "No asset classes selected";
  const style = getAssetClassPieStyle(selected.length);

  return `
    <span class="pill asset-class-pill" title="${escapeAttribute(title)}" aria-label="${escapeAttribute(`${stats.assetClasses} ${t.assetClasses}: ${title}`)}">
      <span class="asset-pie" style="${escapeAttribute(style)}" aria-hidden="true"></span>
      <span>${stats.assetClasses} ${escapeHtml(t.assetClasses)}</span>
    </span>
  `;
}

function getAssetClassPieStyle(count) {
  if (!count) {
    return "--asset-pie: conic-gradient(rgba(24, 24, 24, 0.14) 0 100%);";
  }

  const colors = ["#8b6f47", "#537a5f", "#2f5f7a", "#c08a4b", "#a65f4e", "#6f5d8f"];
  const step = 100 / count;
  const segments = Array.from({ length: count }, (_, index) => {
    const start = (index * step).toFixed(2);
    const end = ((index + 1) * step).toFixed(2);
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  return `--asset-pie: conic-gradient(${segments.join(", ")});`;
}

function renderEquityRegionBadge(stats) {
  if (!stats.equityRegions) return "";

  const t = uiText[state.outputLanguage];
  const regions = getEquityRegions();
  const regionList = regions.join(", ");
  return `
    <span class="pill equity-region-pill" title="${escapeAttribute(regionList)}" aria-label="${escapeAttribute(`${stats.equityRegions} ${t.equityRegions}: ${regionList}`)}">
      <span>${stats.equityRegions} ${escapeHtml(t.equityRegions)}</span>
      <span class="region-sparkline" aria-hidden="true">
        ${regions.map((region) => `<i title="${escapeAttribute(region)}"></i>`).join("")}
      </span>
    </span>
  `;
}

function renderAutoLogicSummary() {
  const t = uiText[state.outputLanguage];
  const items = getAutoLogicItems();
  return `
    <details class="logic-summary">
      <summary><span>${escapeHtml(t.autoLogic)}</span><small>${escapeHtml(t.autoLogicCopy)}</small></summary>
      <ul>${(items.length ? items : [t.noAutoLogic]).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </details>
  `;
}

function renderPresetButton(preset) {
  const german = isGerman();
  const label = german ? preset.deLabel : preset.label;
  const summaryContext = german
    ? `${translateRisk(preset.riskAppetite, true)} · ${translateHorizon(preset.investmentHorizon, true)} ·`
    : `${preset.riskAppetite} · ${preset.investmentHorizon} ·`;
  const equityBand = german
    ? `${preset.equityMin}-${preset.equityMax}% Aktien`
    : `${preset.equityMin}-${preset.equityMax}% equity`;
  return `<button class="preset-button" type="button" data-preset="${escapeAttribute(preset.id)}">${renderPresetIcon(preset.id)}<span class="preset-title">${escapeHtml(label)}</span> <span class="preset-summary"><span class="preset-context">${escapeHtml(summaryContext)}</span><span class="preset-equity">${escapeHtml(equityBand)}</span></span></button>`;
}

function renderPresetIcon(id) {
  const icons = {
    conservative: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="14"></rect><path class="soft" d="M26 40h28"></path><path class="soft muted-line" d="M40 26v28"></path></svg>`,
    balanced: `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="30"></circle><path class="soft" d="M17 40h46"></path><circle class="dot" cx="40" cy="40" r="4"></circle></svg>`,
    growth: `<svg viewBox="0 0 80 80" aria-hidden="true"><path class="soft no-fill" d="M18 58C34 51 45 39 60 24"></path><circle class="dot" cx="18" cy="58" r="5.5"></circle><circle class="dot faded" cx="40" cy="43" r="5.5"></circle><circle class="dot faint" cx="62" cy="24" r="5.5"></circle></svg>`,
    aggressive: `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M16 58L44 24l28 34"></path><path class="soft muted-line" d="M44 24v42"></path><circle class="dot" cx="44" cy="24" r="4"></circle></svg>`,
  };

  return `<span class="preset-icon preset-icon-${escapeAttribute(id)}">${icons[id] || icons.growth}</span>`;
}

function renderSectionToggle(section) {
  const text = uiText[state.outputLanguage].outputSections[section.id];
  return renderCheckboxCard(`section:${section.id}`, state.sections[section.id], text.label, text.description);
}

function renderCheckboxCard(name, checked, title, description) {
  return `<label class="toggle"><input type="checkbox" name="${escapeAttribute(name)}" ${checked ? "checked" : ""} /><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></div></label>`;
}

function formatUiRange(minValue, maxValue, suffix = "") {
  const separator = isGerman() ? " bis " : " to ";
  return `${minValue}${suffix}${separator}${maxValue}${suffix}`;
}

function renderPromptPreview(prompt) {
  return getPromptPreviewSections(prompt)
    .map((section) => `
      <article class="prompt-section">
        <h4>${escapeHtml(section.heading)}</h4>
        <pre>${escapeHtml(section.content)}</pre>
      </article>
    `)
    .join("");
}

function getPromptPreviewSections(prompt) {
  const lines = prompt.split("\n");
  const headingIndexes = lines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => isPromptTopLevelHeading(line));

  if (!headingIndexes.length) {
    return [{ heading: uiText[state.outputLanguage].promptOutput, content: prompt }];
  }

  return headingIndexes.map((heading, itemIndex) => {
    const start = heading.index + 1;
    const end = headingIndexes[itemIndex + 1]?.index ?? lines.length;
    return {
      heading: heading.line.replace(/:$/, ""),
      content: lines.slice(start, end).join("\n").trim(),
    };
  });
}

function isPromptTopLevelHeading(line) {
  return [
    /^Role:$/,
    /^Objective:$/,
    /^Eligible asset classes:$/,
    /^Requirements and constraints:$/,
    /^Output format:$/,
    /^Rolle:$/,
    /^Ziel:$/,
    /^Zul.+ Anlageklassen:$/,
    /^Vorgaben und Restriktionen:$/,
    /^Ausgabeformat:$/,
  ].some((pattern) => pattern.test(line));
}

function bindEvents() {
  document.addEventListener("input", handleInputChange);
  document.addEventListener("change", handleInputChange);
  document.addEventListener("click", handleClick);
}

function handleInputChange(event) {
  const { name, type, value, checked } = event.target;
  if (!name) return;
  activeStatusInfoKey = "";
  activePresetId = null;
  if (name.startsWith("asset:")) {
    state.assetClasses[name.slice(6)] = checked;
    applyAutomaticEtfCountFromAssetClasses();
    applyAutomaticEquityRangeFromAssetClasses(name);
  } else if (name.startsWith("section:")) {
    state.sections[name.slice(8)] = checked;
  } else if (["includeHomeBiasGuidance", "includeHedgingQuestion", "includeLookThrough", "includeSyntheticEtfs"].includes(name)) {
    state[name] = checked;
  } else if (["minEtfs", "maxEtfs"].includes(name)) {
    state.etfCountManuallyAdjusted = true;
    state[name] = getNextEtfCount(name, value);
  } else if (type === "checkbox") {
    state[name] = checked;
  } else {
    state[name] = value;
    if (name === "riskAppetite") {
      lastEquityRiskAlertKey = "";
      state.equityRangeManuallyAdjusted = false;
      applyEquityRangeForRisk(value);
    }
    if (name === "baseCurrency") {
      if (!state.exchangeManuallyAdjusted) {
        applyExchangeForBaseCurrency(value);
      }
    }
    if (name === "exchange") {
      state.exchangeManuallyAdjusted = true;
    }
  }
  render();
  maybeShowSelectionAlert(name);
  maybeShowRiskHorizonAlert();
  maybeShowEquityRiskAlert();
  maybeShowDefensiveAssetAlert(name);
  maybeShowEquityAssetAlert(name);
  maybeShowAdditionalLogicAlerts(name);
}

function handleClick(event) {
  const action = event.target.getAttribute("data-action");
  const presetId = event.target.closest("[data-preset]")?.getAttribute("data-preset");
  const stepTarget = event.target.getAttribute("data-step-target");
  const stepDirection = Number.parseInt(event.target.getAttribute("data-step-direction"), 10);
  if (action === "toggle-status-info") {
    const infoKey = event.target.getAttribute("data-info-key");
    activeStatusInfoKey = activeStatusInfoKey === infoKey ? "" : infoKey;
    render();
    return;
  }
  if (action === "toggle-preset-details") {
    showPresetDetails = !showPresetDetails;
    activeStatusInfoKey = "";
    render();
    return;
  }
  if (presetId) {
    activeStatusInfoKey = "";
    applyPreset(presetId);
    render();
    maybeShowRiskHorizonAlert();
    maybeShowEquityRiskAlert();
    maybeShowDefensiveAssetAlert("riskAppetite");
    maybeShowEquityAssetAlert("riskAppetite");
    maybeShowAdditionalLogicAlerts("riskAppetite");
    return;
  }
  if (stepTarget && !Number.isNaN(stepDirection)) {
    activeStatusInfoKey = "";
    activePresetId = null;
    if (["minEtfs", "maxEtfs"].includes(stepTarget)) {
      state.etfCountManuallyAdjusted = true;
    } else if (["equityMin", "equityMax"].includes(stepTarget)) {
      state.equityRangeManuallyAdjusted = true;
    }
    state[stepTarget] = ["minEtfs", "maxEtfs"].includes(stepTarget)
      ? getNextEtfCount(stepTarget, state[stepTarget] + stepDirection)
      : getNextEquityWeight(stepTarget, stepDirection);
    render();
    maybeShowRiskHorizonAlert();
    maybeShowEquityRiskAlert();
    maybeShowAdditionalLogicAlerts(stepTarget);
    return;
  }
  if (action === "reset") {
    activeStatusInfoKey = "";
    activePresetId = defaultPresetId;
    state = createDefaultState();
    render();
  }
  if (action === "restore-equity-auto") {
    activeStatusInfoKey = "";
    activePresetId = null;
    state.equityRangeManuallyAdjusted = false;
    applyEquityRangeForRisk(state.riskAppetite);
    render();
    maybeShowRiskHorizonAlert();
    maybeShowEquityRiskAlert();
  }
  if (action === "restore-etf-auto") {
    activeStatusInfoKey = "";
    activePresetId = null;
    state.etfCountManuallyAdjusted = false;
    applyAutomaticEtfCountFromAssetClasses();
    render();
  }
  if (action === "restore-exchange-auto") {
    activeStatusInfoKey = "";
    activePresetId = null;
    state.exchangeManuallyAdjusted = false;
    applyExchangeForBaseCurrency(state.baseCurrency);
    render();
  }
  if (action === "export-txt") exportPrompt("txt");
  if (action === "export-md") exportPrompt("md");
  if (action === "copy") copyPrompt();
}

function applyPreset(presetId) {
  const preset = portfolioPresets.find((item) => item.id === presetId);
  if (!preset) return;

  activePresetId = presetId;
  state.riskAppetite = preset.riskAppetite;
  state.investmentHorizon = preset.investmentHorizon;
  state.equityMin = preset.equityMin;
  state.equityMax = preset.equityMax;
  state.equityRangeManuallyAdjusted = false;
  if (preset.assetClasses) {
    Object.assign(state.assetClasses, preset.assetClasses);
  }
  applyAutomaticEquityRangeFromAssetClasses();
  if (Number.isInteger(preset.minEtfs) && Number.isInteger(preset.maxEtfs)) {
    state.minEtfs = preset.minEtfs;
    state.maxEtfs = preset.maxEtfs;
    state.etfCountManuallyAdjusted = false;
  } else if (!state.etfCountManuallyAdjusted) {
    applyAutomaticEtfCountFromAssetClasses();
  }
  lastEquityRiskAlertKey = "";
}

function applyExchangeForBaseCurrency(baseCurrency) {
  state.exchange = getDefaultExchangeForBaseCurrency(baseCurrency);
}

function getDefaultExchangeForBaseCurrency(baseCurrency) {
  if (defaultExchangeByCurrency[baseCurrency]) return defaultExchangeByCurrency[baseCurrency];
  return defaults.exchange;
}

function getNextEtfCount(key, value) {
  const parsed = Math.max(1, Number.parseInt(value, 10) || 1);

  if (key === "minEtfs") {
    return Math.min(parsed, state.maxEtfs);
  }

  if (key === "maxEtfs") {
    return Math.max(parsed, state.minEtfs);
  }

  return parsed;
}

function applyAutomaticEtfCountFromAssetClasses() {
  if (state.etfCountManuallyAdjusted) return;

  const [minEtfs, maxEtfs] = getAutomaticEtfCount(state.assetClasses);
  state.minEtfs = minEtfs;
  state.maxEtfs = maxEtfs;
}

function getAutomaticEtfCount(assetClasses) {
  const reduction = assetClassOptions.reduce((total, option) => {
    if (assetClasses[option.id]) return total;
    return total + (option.id === "equities" ? 5 : 1);
  }, 0);
  const minEtfs = Math.max(1, defaults.minEtfs - reduction);
  const maxEtfs = Math.max(minEtfs, defaults.maxEtfs - reduction);
  return [minEtfs, maxEtfs];
}

function applyAutomaticEquityRangeFromAssetClasses(changedName = "") {
  if (!state.assetClasses.equities) {
    state.equityMin = 0;
    state.equityMax = 0;
    state.equityRangeManuallyAdjusted = false;
    return;
  }

  if (changedName === "asset:equities" && !state.equityRangeManuallyAdjusted) {
    applyEquityRangeForRisk(state.riskAppetite);
  }
}

function getNextEquityWeight(key, direction) {
  if (!state.assetClasses.equities) return 0;
  const nextValue = clampPercent(state[key] + direction);
  if (key === "equityMin") return Math.min(nextValue, state.equityMax);
  if (key === "equityMax") return Math.max(nextValue, state.equityMin);
  return nextValue;
}

function applyEquityRangeForRisk(riskAppetite) {
  if (!state.assetClasses.equities) {
    state.equityMin = 0;
    state.equityMax = 0;
    return;
  }
  const range = getEquityRangeForRisk(riskAppetite);
  if (!range) return;
  [state.equityMin, state.equityMax] = range;
}

function getEquityRangeForRisk(riskAppetite) {
  const ranges = {
    Low: [25, 45],
    Moderate: [40, 60],
    Balanced: [55, 75],
    High: [75, 95],
    "Very high": [90, 100],
  };
  return ranges[riskAppetite] || null;
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, value));
}

async function copyPrompt() {
  const prompt = buildPrompt();
  const button = document.querySelector('[data-action="copy"]');
  const t = uiText[state.outputLanguage];
  try {
    await navigator.clipboard.writeText(prompt);
    if (button) {
      button.textContent = t.copied;
      window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(() => {
        const latestButton = document.querySelector('[data-action="copy"]');
        if (latestButton) latestButton.textContent = uiText[state.outputLanguage].copyPrompt;
      }, 1800);
    }
  } catch {
    if (button) {
      button.textContent = t.copyFailed;
      window.clearTimeout(copyResetTimer);
      copyResetTimer = window.setTimeout(() => {
        const latestButton = document.querySelector('[data-action="copy"]');
        if (latestButton) latestButton.textContent = uiText[state.outputLanguage].copyPrompt;
      }, 1800);
    }
  }
}

function exportPrompt(format) {
  const prompt = buildPrompt();
  const blob = new Blob([prompt], { type: getPromptExportMimeType(format) });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getPromptExportFilename(format);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getPromptExportFilename(format) {
  const extension = format === "md" ? "md" : "txt";
  const currency = String(state.baseCurrency || defaults.baseCurrency).toLowerCase();
  const risk = String(state.riskAppetite || defaults.riskAppetite)
    .toLowerCase()
    .replaceAll(" ", "-");
  return `portfolio-prompt-${currency}-${risk}.${extension}`;
}

function getPromptExportMimeType(format) {
  return format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}




















