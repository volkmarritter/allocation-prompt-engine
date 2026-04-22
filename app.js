const assetClassOptions = [
  { id: "cash", label: "Cash / Money Market", description: "Liquidity reserve and portfolio ballast.", deLabel: "Cash / Geldmarkt", deDescription: "Liquiditätsreserve und stabilisierender Portfolio-Baustein." },
  { id: "bonds", label: "Bonds", description: "Stability and diversification versus equities.", deLabel: "Anleihen", deDescription: "Stabilität und Diversifikation gegenüber Aktien." },
  { id: "equities", label: "Equities by region", description: "USA, Europe ex-CH, Switzerland, Japan, and Emerging Markets.", deLabel: "Aktien nach Regionen", deDescription: "USA, Europa ex CH, Schweiz, Japan und Emerging Markets." },
  { id: "commodities", label: "Commodities / Precious Metals", description: "Inflation-sensitive diversifier with low equity correlation.", deLabel: "Rohstoffe / Edelmetalle", deDescription: "Inflationssensitiver Diversifikator mit niedriger Aktienkorrelation." },
  { id: "realEstate", label: "Listed Real Estate", description: "Income-sensitive real asset exposure through REITs.", deLabel: "Immobilien (kotiert)", deDescription: "Ertragsorientierte Real-Asset-Exponierung über REITs." },
  { id: "crypto", label: "Crypto Assets", description: "High-volatility satellite allocation if justified.", deLabel: "Krypto-Assets", deDescription: "Volatile Satellitenallokation, falls begründbar." },
];

const assetClassGroups = [
  { id: "core", assetIds: ["cash", "bonds", "equities", "commodities"], label: "Core Asset Classes", deLabel: "Kernanlageklassen" },
  { id: "satellites", assetIds: ["realEstate", "crypto"], label: "Satellites", deLabel: "Satelliten" },
];

const outputSections = [
  { id: "a" },
  { id: "b" },
  { id: "c" },
  { id: "d" },
  { id: "e" },
  { id: "f" },
  { id: "g" },
  { id: "h" },
];

const appVersion = "2.0";
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
  USD: "LSE London Stock Exchange",
  GBP: "LSE London Stock Exchange",
  ...(promptBuilderConfig.defaultExchangeByCurrency || {}),
};
const defaultBaseCurrency = promptBuilderConfig.defaultBaseCurrency || baseCurrencyOptions[0] || "CHF";
const defaultPresetId = promptBuilderConfig.defaultPresetId || "growth";
const configuredEtfCountBase = promptBuilderConfig.etfCountBase || {};
const defaultMinEtfs = Number.isInteger(configuredEtfCountBase.min) ? configuredEtfCountBase.min : 8;
const defaultMaxEtfs = Number.isInteger(configuredEtfCountBase.max) && configuredEtfCountBase.max >= defaultMinEtfs
  ? configuredEtfCountBase.max
  : Math.max(defaultMinEtfs, 12);

const uiText = {
  English: {
    eyebrow: "Portfolio Prompt Builder",
    headline: "Shape the mandate. Generate the prompt.",
    heroCopy: "Configure the investor profile and implementation constraints, then generate a structured prompt for strategic asset allocation work.",
    promptMode: "Prompt mode",
    baseCurrency: "Base currency",
    exchangeFocus: "Exchange focus",
    parameters: "Parameters",
    quickStartTitle: "Quick start",
    quickStartCopy: "Answer three questions and start from a sensible strategy preset. You can refine everything afterwards.",
    quickBaseCurrency: "1. Base currency",
    quickInvestmentHorizon: "2. Investment horizon",
    quickRiskAppetite: "3. Risk appetite",
    quickAppMode: "4. App mode",
    quickRecommended: "Recommended strategy",
    quickStartButton: "Open builder directly",
    educationButton: "Start with the 5-minute guide",
    educationHint: "New here? Start with the guide. Know your profile? Open the builder directly.",
    appMode: "App mode",
    basicMode: "Basic",
    proMode: "Pro",
    basicModeSummary: "Basic mode keeps advanced parameters automatic.",
    basicRiskAppetite: "Risk appetite",
    basicInvestmentHorizon: "Investment horizon",
    allSelected: "All selected",
    equityShort: "Equity",
    etfsShort: "ETFs",
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
    copyrightText: "© BICon | Business & IT Consulting – Strategy. Technology. Financial Services.",
    biconLinkLabel: "bicon.li",
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
    executionMode: "Execution mode",
    fastExecution: "Fast",
    strictExecution: "Strict",
    fastExecutionDescription: "Pragmatic, concise portfolio construction.",
    strictExecutionDescription: "Structured reasoning with internal validation.",
    generatedPrompt: "Generated prompt",
    readyToPaste: "Ready to paste",
    outputCopy: "The prompt updates instantly from the selected parameters.",
    words: "words",
    copyPrompt: "Copy prompt",
    exportTxt: "Export .txt",
    exportMd: "Export .md",
    openInstalledApps: "Open Installed AI Apps",
    installedAppsDisclaimer: "App buttons use local links and only work when the app is installed and your browser allows opening it. WhatsApp opens WhatsApp, not a guaranteed Meta AI chat.",
    copied: "Copied",
    copyFailed: "Copy failed",
    resetDefaults: "Reset original strategy:",
    promptOutput: "Prompt output",
    outputSectionsIncluded: "output sections included",
    targetEtfPositions: "target ETF positions",
    portfolioBaseCurrency: "portfolio base currency",
    disclaimerTitle: "Disclaimer",
    disclaimerText: "The Portfolio Prompt Builder is a tool for generating structured prompts for use with AI language models. It does not constitute investment advice, investment recommendations, or a solicitation to buy or sell any financial instrument. All outputs should be reviewed by qualified financial professionals before use with clients.",
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
      h: { label: "Portfolio construction rationale", description: "Efficient Frontier perspective on diversification and risk-return trade-offs." },
    },
  },
  German: {
    eyebrow: "Portfolio-Prompt-Builder",
    headline: "Mandat definieren. Prompt generieren.",
    heroCopy: "Konfiguriere das Anlegerprofil und die Umsetzungsrestriktionen, um einen strukturierten Prompt für strategische Asset Allocation zu generieren.",
    promptMode: "Modus",
    baseCurrency: "Basiswährung",
    exchangeFocus: "Börsenfokus",
    parameters: "Parameter",
    quickStartTitle: "Schnellstart",
    quickStartCopy: "Beantworte drei Fragen und starte mit einem passenden Strategie-Preset. Danach kannst du alles verfeinern.",
    quickBaseCurrency: "1. Basiswährung",
    quickInvestmentHorizon: "2. Anlagehorizont",
    quickRiskAppetite: "3. Risikoappetit",
    quickAppMode: "4. App Mode",
    quickRecommended: "Empfohlene Strategie",
    quickStartButton: "Builder direkt öffnen",
    educationButton: "Mit dem 5-Minuten-Guide starten",
    educationHint: "Neu hier? Starte mit dem Guide. Profil bekannt? Öffne den Builder direkt.",
    appMode: "App Mode",
    basicMode: "Basic",
    proMode: "Pro",
    basicModeSummary: "Basic-Modus hält erweiterte Parameter automatisch.",
    basicRiskAppetite: "Risiko-\nAppetit",
    basicInvestmentHorizon: "Anlage-\nHorizont",
    allSelected: "Alle ausgewählt",
    equityShort: "Aktien",
    etfsShort: "ETFs",
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
    copyrightText: "© BICon | Business & IT Consulting – Strategy. Technology. Financial Services.",
    biconLinkLabel: "bicon.li",
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
    executionMode: "Ausführungsmodus",
    fastExecution: "Schnell",
    strictExecution: "Strikt",
    fastExecutionDescription: "Pragmatische, knappe Portfolio-Konstruktion.",
    strictExecutionDescription: "Strukturierte Herleitung mit interner Validierung.",
    generatedPrompt: "Generierter Prompt",
    readyToPaste: "Bereit zum Kopieren",
    outputCopy: "Der Prompt aktualisiert sich sofort anhand der gewählten Parameter.",
    words: "Wörter",
    copyPrompt: "Prompt kopieren",
    exportTxt: "Export .txt",
    exportMd: "Export .md",
    openInstalledApps: "Installierte AI-Apps öffnen",
    installedAppsDisclaimer: "App-Buttons nutzen lokale Links und funktionieren nur, wenn die App installiert ist und der Browser das Öffnen erlaubt. WhatsApp öffnet WhatsApp, aber nicht garantiert einen Meta-AI-Chat.",
    copied: "Kopiert",
    copyFailed: "Kopieren fehlgeschlagen",
    resetDefaults: "Originalstrategie zurücksetzen:",
    promptOutput: "Prompt-Ausgabe",
    outputSectionsIncluded: "Ausgabeabschnitte enthalten",
    targetEtfPositions: "Zielanzahl\nETF-Positionen",
    portfolioBaseCurrency: "Basiswährung des Portfolios",
    disclaimerTitle: "Hinweis",
    disclaimerText: "Der Portfolio Prompt Builder ist ein Tool zur Erstellung strukturierter Prompts für die Nutzung mit KI-Sprachmodellen. Dies stellt keine Anlageberatung, Anlageempfehlung oder Aufforderung zum Kauf oder Verkauf von Finanzinstrumenten dar. Alle Ergebnisse sollten vor der Verwendung mit Kundinnen und Kunden von qualifizierten Finanzfachleuten geprüft werden.",
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
      h: { label: "Portfolio-Konstruktionslogik", description: "Efficient-Frontier-Perspektive auf Diversifikation und Risiko-Rendite-Abwägungen." },
    },
  },
};

const defaults = {
  baseCurrency: defaultBaseCurrency,
  riskAppetite: "High",
  investmentHorizon: ">=10 years",
  equityMin: 60,
  equityMax: 80,
  equityRangeManuallyAdjusted: false,
  exchange: defaultExchangeByCurrency[defaultBaseCurrency] || exchangeOptions[0] || "SIX Swiss Exchange",
  exchangeManuallyAdjusted: false,
  minEtfs: defaultMinEtfs,
  maxEtfs: defaultMaxEtfs,
  etfCountManuallyAdjusted: false,
  promptMode: "pro",
  quickStart: {
    baseCurrency: defaultBaseCurrency,
    investmentHorizon: ">=10 years",
    riskAppetite: "High",
    promptMode: "basic",
  },
  builderStarted: false,
  outputLanguage: "English",
  includeHomeBiasGuidance: true,
  includeHedgingQuestion: true,
  includeLookThrough: true,
  includeSyntheticEtfs: true,
  executionMode: "strict",
  assetClasses: Object.fromEntries(assetClassOptions.map((option) => [option.id, true])),
  sections: Object.fromEntries(outputSections.map((section) => [section.id, true])),
};

const fallbackPortfolioPresets = [
  { id: "conservative", label: "Conservative", deLabel: "Konservativ", riskAppetite: "Low", investmentHorizon: ">=3 years", equityMin: 20, equityMax: 40, assetClasses: { cash: true, bonds: true, equities: true, commodities: true, realEstate: false, crypto: false } },
  { id: "balanced", label: "Balanced", deLabel: "Ausgewogen", riskAppetite: "Moderate", investmentHorizon: ">=5 years", equityMin: 40, equityMax: 60, assetClasses: { cash: true, bonds: true, equities: true, commodities: true, realEstate: false, crypto: false } },
  { id: "growth", label: "Growth", deLabel: "Wachstum", riskAppetite: "High", investmentHorizon: ">=10 years", equityMin: 60, equityMax: 80, assetClasses: { cash: true, bonds: true, equities: true, commodities: true, realEstate: false, crypto: true } },
  { id: "aggressive", label: "Aggressive", deLabel: "Aggressiv", riskAppetite: "Very high", investmentHorizon: ">=10 years", equityMin: 80, equityMax: 100, assetClasses: { cash: true, bonds: false, equities: true, commodities: true, realEstate: true, crypto: true } },
];
const portfolioPresets = Array.isArray(promptBuilderConfig.presets) && promptBuilderConfig.presets.length
  ? promptBuilderConfig.presets
  : fallbackPortfolioPresets;
const installedAiAppLinks = [
  { label: "ChatGPT app", url: "chatgpt://" },
  { label: "Claude app", url: "claude://" },
  { label: "WhatsApp", url: "whatsapp://send" },
];
const quickStartStorageKey = "allocationPromptBuilder.quickStart.v1";

let sessionDefaultPresetId = defaultPresetId;
let sessionDefaultBaseCurrency = defaultBaseCurrency;
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
let lastChosenPresetId = defaultPresetId;

document.addEventListener("DOMContentLoaded", () => {
  applyUrlParams();
  render();
  bindEvents();
});

function createDefaultState() {
  const next = JSON.parse(JSON.stringify(defaults));
  const defaultPreset = portfolioPresets.find((preset) => preset.id === sessionDefaultPresetId);
  next.baseCurrency = sessionDefaultBaseCurrency;
  next.exchange = defaultExchangeByCurrency[sessionDefaultBaseCurrency] || exchangeOptions[0] || defaults.exchange;
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
    const [minEtfs, maxEtfs] = getAutomaticEtfCount(next.assetClasses, next.baseCurrency);
    next.minEtfs = minEtfs;
    next.maxEtfs = maxEtfs;
  }
  next.quickStart = {
    baseCurrency: next.baseCurrency,
    investmentHorizon: next.investmentHorizon,
    riskAppetite: next.riskAppetite,
    promptMode: "basic",
  };
  const savedQuickStart = getStoredQuickStartSelection();
  if (savedQuickStart) {
    next.outputLanguage = savedQuickStart.outputLanguage || next.outputLanguage;
    next.quickStart = { ...next.quickStart, ...savedQuickStart.quickStart };
  }
  return next;
}

function getStoredQuickStartSelection() {
  try {
    const storage = window?.localStorage;
    if (!storage) return null;
    const rawValue = storage.getItem(quickStartStorageKey);
    if (!rawValue) return null;
    return normalizeQuickStartSelection(JSON.parse(rawValue));
  } catch {
    return null;
  }
}

function normalizeQuickStartSelection(saved) {
  if (!saved || typeof saved !== "object") return null;
  const quickStart = saved.quickStart && typeof saved.quickStart === "object" ? saved.quickStart : {};
  const normalized = {};
  if (baseCurrencyOptions.includes(quickStart.baseCurrency)) normalized.baseCurrency = quickStart.baseCurrency;
  if ([">=3 years", ">=5 years", ">=10 years"].includes(quickStart.investmentHorizon)) normalized.investmentHorizon = quickStart.investmentHorizon;
  if (["Low", "Moderate", "High", "Very high"].includes(quickStart.riskAppetite)) normalized.riskAppetite = quickStart.riskAppetite;
  if (["basic", "pro"].includes(quickStart.promptMode)) normalized.promptMode = quickStart.promptMode;
  const outputLanguage = ["English", "German"].includes(saved.outputLanguage) ? saved.outputLanguage : "";
  if (!outputLanguage && Object.keys(normalized).length === 0) return null;
  return { outputLanguage, quickStart: normalized };
}

function saveQuickStartSelection() {
  try {
    const storage = window?.localStorage;
    if (!storage) return;
    const quickStart = state.quickStart || defaults.quickStart;
    storage.setItem(quickStartStorageKey, JSON.stringify({
      outputLanguage: state.outputLanguage,
      quickStart: {
        baseCurrency: quickStart.baseCurrency,
        investmentHorizon: quickStart.investmentHorizon,
        riskAppetite: quickStart.riskAppetite,
        promptMode: quickStart.promptMode,
      },
    }));
  } catch {
    // Storage can be unavailable in private modes or restrictive embeds.
  }
}

function applyUrlParams() {
  const search = window?.location?.search || "";
  const params = new URLSearchParams(search);
  if (params.get("src") !== "why-journey") return false;

  const nextQuickStart = {
    ...(state.quickStart || defaults.quickStart),
  };
  const profile = params.get("profile");
  const preset = portfolioPresets.find((item) => item.id === profile);
  if (preset) {
    sessionDefaultPresetId = preset.id;
    lastChosenPresetId = preset.id;
    activePresetId = preset.id;
    nextQuickStart.riskAppetite = preset.riskAppetite;
    nextQuickStart.investmentHorizon = preset.investmentHorizon;
  }

  const horizonMap = {
    1: ">=3 years",
    2: ">=5 years",
    3: ">=10 years",
    4: ">=10 years",
  };
  const horizon = horizonMap[params.get("horizon")];
  if (horizon) {
    nextQuickStart.investmentHorizon = horizon;
  }

  const riskMap = {
    1: "Low",
    2: "Moderate",
    3: "High",
    4: "Very high",
  };
  const risk = riskMap[params.get("risk")];
  if (risk) {
    nextQuickStart.riskAppetite = risk;
  }

  const lang = params.get("lang");
  if (lang === "de") state.outputLanguage = "German";
  if (lang === "en") state.outputLanguage = "English";

  state.quickStart = nextQuickStart;
  state.builderStarted = false;
  saveQuickStartSelection();
  return true;
}

function isGerman() {
  return state.outputLanguage === "German";
}

function isBasicMode() {
  return state.promptMode === "basic";
}

function getSelectedAssetClasses() {
  return assetClassOptions.filter((option) => state.assetClasses[option.id]);
}

function getSelectedSections() {
  return outputSections.filter((section) => state.sections[section.id]);
}

function getPromptOutputSections() {
  return getSelectedSections();
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
    sections: getPromptOutputSections().length,
    words: prompt.trim().split(/\s+/).filter(Boolean).length,
  };
}

function getActivePreset() {
  return portfolioPresets.find((preset) => preset.id === activePresetId) || null;
}

function getDefaultPreset() {
  return portfolioPresets.find((preset) => preset.id === sessionDefaultPresetId) || portfolioPresets[0] || null;
}

function getResetDefaultsLabel() {
  const t = uiText[state.outputLanguage];
  const preset = getDefaultPreset();
  const presetLabel = preset ? (isGerman() ? preset.deLabel : preset.label) : t.customStrategy;
  return `${t.resetDefaults} ${presetLabel} ${sessionDefaultBaseCurrency}`;
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
  if (state.riskAppetite !== "Low") {
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
  if (!["Moderate", "High", "Very high"].includes(state.riskAppetite)) {
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
  const cryptoSelected = state.assetClasses.crypto;
  const equitiesSelected = state.assetClasses.equities;
  const rebalancingSelected = state.sections.f;
  const lookThroughSectionSelected = state.sections.e;
  const selectedAssetClasses = getSelectedAssetClasses();
  const minEtfs = Math.min(state.minEtfs, state.maxEtfs);
  const minEtfsForAssetClasses = getMinimumEtfsForSelectedAssetClasses();
  const selectedAssetClassLabels = selectedAssetClasses.map((option) => german ? option.deLabel : option.label).join(", ");
  const usesChEquityAddOn = state.baseCurrency === "CHF" && state.assetClasses.equities;
  const chEquityAddOnText = usesChEquityAddOn
    ? german
      ? " Bei CHF mit Aktien wird wegen der separaten Schweiz-Allokation eine zusaetzliche Position eingerechnet."
      : " For CHF portfolios with equities, one additional position is counted because Swiss equities are treated as a separate allocation."
    : "";
  if (state.riskAppetite === "Low" && cryptoSelected && ["asset:crypto", "riskAppetite"].includes(changedName)) {
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

  if (selectedAssetClasses.length && minEtfs < minEtfsForAssetClasses && shouldCheckEtfCoverage(changedName)) {
    alerts.push({
      key: `etf-coverage-${state.baseCurrency}-${minEtfs}-${minEtfsForAssetClasses}-${selectedAssetClasses.map((option) => option.id).join("-")}`,
      message: german
        ? `Die Mindestanzahl ETFs sollte mindestens der Zahl der ausgewaehlten Anlageklassen entsprechen.${chEquityAddOnText} Ausgewaehlt: ${selectedAssetClassLabels}. Aktuelle Mindestanzahl: ${minEtfs}; sinnvolle Mindestanzahl: ${minEtfsForAssetClasses}.`
        : `The minimum ETF count should at least match the number of selected asset classes.${chEquityAddOnText} Selected asset classes: ${selectedAssetClassLabels}. Current minimum: ${minEtfs}; suggested minimum: ${minEtfsForAssetClasses}.`,
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

function getMinimumEtfsForSelectedAssetClasses(assetClasses = state.assetClasses, baseCurrency = state.baseCurrency) {
  const selectedCount = assetClassOptions.filter((option) => assetClasses[option.id]).length;
  const chEquityAddOn = baseCurrency === "CHF" && assetClasses.equities ? 1 : 0;
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
  const selectedSections = getPromptOutputSections();
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
  const disclaimerInstruction = german
    ? "Füge am Ende der Antwort einen Anlagehinweis nach anerkannten Best-Practice-Standards hinzu."
    : "Add an investment disclaimer at the end of the answer according to recognized best-practice standards.";
  const assetClassLines = renderAssetClassPromptLines(selectedAssetClasses, german);
  const executionModeInstruction = getExecutionModeInstruction(german);
  const constructionMethodology = getPortfolioConstructionMethodology(german);
  const sectionLines = selectedSections.length
    ? selectedSections.map((section, index) => renderSectionInstruction(section, german, index)).join("\n\n")
    : german
      ? "Kein Ausgabeabschnitt ausgewählt. Wähle mindestens einen Abschnitt für die Antwort aus."
      : "No output sections selected. Specify at least one section in the response.";
  const numberedRequirements = [
    german ? "Verwende ausschliesslich ETFs zur Umsetzung." : "Use ETFs only for implementation.",
    german
      ? "Überschreibe die angegebenen Restriktionen nicht. Falls eine Restriktion nicht erfüllbar ist, erkläre warum und nenne die nächstbeste praktikable Alternative."
      : "Do not override the stated constraints. If a constraint cannot be met, explain why and propose the closest feasible alternative.",
    german
      ? `Bevorzuge ETFs, die an ${state.exchange} handelbar sind. Falls dies nicht möglich ist, nenne die nächstbeste Alternative und begründe die Ausnahme.`
      : `Prefer ETFs tradable on ${state.exchange}. If this is not possible, name the next-best alternative and explain the exception.`,
    german
      ? "Bevorzuge liquide, kostengünstige und breit diversifizierte ETFs. Bevorzuge UCITS-konforme ETFs, sofern sie verfügbar und mit dem gewählten Börsenplatz vereinbar sind. Vermeide Nischenprodukte, sofern sie nicht klar begründet sind."
      : "Prefer liquid, low-cost, broad ETFs. Prefer UCITS-compliant ETFs where they are available and consistent with the selected exchange. Avoid niche products unless clearly justified.",
    etfTargetRequirement,
    german ? "Priorisiere Kosteneffizienz, Diversifikation und praktische Umsetzbarkeit." : "Prioritize cost efficiency, diversification, and practical implementability.",
    german ? "Keine taktischen Marktprognosen, kein Market-Timing und keine kurzfristigen Renditeprognosen." : "Do not make tactical market forecasts, market-timing calls, or short-term return predictions.",
    german ? "Entscheide regelbasiert anhand von Diversifikation, Risikokontrolle, Kosten und Umsetzbarkeit." : "Decide using rules and portfolio design principles such as diversification, risk control, costs, and implementability.",
    german ? "Triff sinnvolle, explizite und minimale Standardannahmen, falls Informationen fehlen, und kennzeichne Unsicherheiten transparent statt Scheingenauigkeit zu erzeugen." : "Make sensible, explicit, and minimal standard assumptions if information is missing, and flag uncertainty transparently instead of pretending to be precise.",
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
        ? "Beziehe synthetische ETFs ein, wenn sie strukturelle Vorteile bieten, insbesondere in Bezug auf Markteffizienz und reduzierte Quellensteuer-Leakage (z. B. bei US-Aktienexposure). Stelle dabei Transparenz und Robustheit sicher. Reflektiere und erkläre ihren Einsatz klar in Abschnitt C) Zusammenfassung der wichtigsten Design-Entscheidungen, z. B. wo sie eingesetzt werden und warum."
        : "Include synthetic ETFs where they provide structural advantages, particularly in terms of market efficiency and reduced withholding tax leakage (e.g., for US equity exposure). Ensure transparency and robustness. Reflect and explain their use clearly in section C) Summary of Key Design Decisions (e.g., where they are applied and why)."
      : null,
    getEfficientFrontierRequirement(german),
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

${executionModeInstruction}

${constructionMethodology}

Zulässige Anlageklassen:
${assetClassLines}

Vorgaben und Restriktionen:
${requirementsLines}

Ausgabeformat:
${sectionLines}

Abschluss:
${disclaimerInstruction}`;
  }

  return `Role:
You act as an independent CFA-level portfolio strategist.

Objective:
Create a ${portfolioStyle} for an investor with:
- Base currency: ${state.baseCurrency}
- Risk appetite: ${translateRisk(state.riskAppetite, false)}
- Investment horizon: ${translateHorizon(state.investmentHorizon, false)}
${equityAllocationLine}

${executionModeInstruction}

${constructionMethodology}

Eligible asset classes:
${assetClassLines}

Requirements and constraints:
${requirementsLines}

Output format:
${sectionLines}

Closing instruction:
${disclaimerInstruction}`;
}

function getPortfolioConstructionMethodology(german) {
  if (getEffectiveExecutionMode() === "fast") {
    return german
      ? `Portfolio-Konstruktionsansatz:
Konstruiere ein gut diversifiziertes Portfolio mit soliden Portfolio-Design-Prinzipien.
- Kombiniere Anlageklassen mit unterschiedlichen Risiko- und Renditeeigenschaften.
- Nutze Diversifikation, um das gesamte Risiko-Rendite-Profil zu verbessern.
- Vermeide unnötige Überschneidungen und Konzentrationen.
- Strebe eine ausgewogene Mischung aus Wachstumstreibern und stabilisierenden Elementen an.`
      : `Portfolio construction approach:
Construct a well-diversified portfolio using sound portfolio design principles.
- Combine asset classes with different risk and return characteristics.
- Use diversification to improve the overall risk-return profile.
- Avoid unnecessary overlap and concentration.
- Aim for a balanced mix of growth drivers and stabilising elements.`;
  }

  return german
    ? `Portfolio-Konstruktionsmethodik (VERPFLICHTEND):
Konstruiere das Portfolio mit einer Mean-Variance-Optimierungslogik, die mit der Efficient Frontier vereinbar ist.
- Stütze die Allokation auf langfristige Annahmen zu erwarteter Rendite (qualitativ), Volatilität und Korrelation zwischen Anlageklassen.
- Beziehe eine Anlageklasse nur ein, wenn sie das Risiko-Rendite-Profil des Portfolios verbessert.
- Stelle sicher, dass die Allokationen Diversifikationsvorteile und den Beitrag zum Gesamtrisiko des Portfolios widerspiegeln.
- Nähere die Optimierung konzeptionell an, indem du niedrig korrelierte Anlageklassen kombinierst, redundante Exposures vermeidest und Risikobeiträge über Anlageklassen ausbalancierst.
- Wende die Logik konzeptionell an: Risiko für eine gegebene Rendite minimieren und Rendite für ein gegebenes Risikoniveau maximieren.`
    : `Portfolio construction methodology (MANDATORY):
Construct the portfolio using a mean-variance optimisation logic consistent with the efficient frontier.
- Base the allocation on long-term assumptions for expected return (qualitative), volatility, and correlation between asset classes.
- Include each asset class only if it improves the portfolio's risk-return profile.
- Ensure allocations reflect diversification benefits and contribution to total portfolio risk.
- Approximate optimisation by combining low-correlated assets, avoiding redundant exposures, and balancing risk contributions across asset classes.
- Apply the following logic conceptually: minimise risk for a given return and maximise return for a given level of risk.`;
}

function getEfficientFrontierRequirement(german) {
  if (getEffectiveExecutionMode() === "fast") {
    return german
      ? "Stelle sicher, dass das Portfolio über Anlageklassen und Risikotreiber gut diversifiziert ist, und vermeide Konzentration in einer einzelnen Risikoquelle."
      : "Ensure the portfolio is well diversified across asset classes and risk drivers, and avoid concentration in a single source of risk.";
  }

  return german
    ? "Beurteile den Beitrag jeder Anlageklasse zum Gesamtrisiko des Portfolios und vermeide Konzentration in einem einzelnen dominanten Risikofaktor. Vergleiche das Portfolio mit einer einfachen globalen Benchmark und erkläre Abweichungen kurz mit Blick auf Risiko-Rendite-Verbesserung."
    : "Assess the contribution of each asset class to overall portfolio risk and avoid concentration in a single dominant risk factor. Compare the portfolio to a simple global benchmark, and briefly explain deviations in terms of risk-return improvement.";
}

function translateRisk(risk, german) {
  if (!german) return risk;
  const mapping = { Low: "niedrig", Moderate: "moderat", High: "hoch", "Very high": "sehr hoch" };
  return mapping[risk] || risk;
}

function translateHorizon(horizon, german) {
  if (!german) return horizon;
  const mapping = { ">=3 years": ">=3 Jahre", ">=5 years": ">=5 Jahre", ">=10 years": ">=10 Jahre" };
  return mapping[horizon] || horizon;
}

function getEffectiveExecutionMode() {
  return isBasicMode() ? "fast" : (state.executionMode === "fast" ? "fast" : "strict");
}

function getExecutionModeInstruction(german) {
  if (getEffectiveExecutionMode() === "fast") {
    return german
      ? `Ausführungsmodus:
- Fokus auf Geschwindigkeit und Klarheit.
- Wende einen pragmatischen, heuristischen Portfolio-Konstruktionsansatz an.
- Halte die Begründung knapp und vermeide unnötige Komplexität.
- Führe keine umfangreichen internen Validierungsschleifen durch.
- Priorisiere ein klares, intuitives und umsetzbares Ergebnis.`
      : `Execution mode:
- Focus on speed and clarity.
- Apply a pragmatic, heuristic portfolio construction approach.
- Keep reasoning concise and avoid unnecessary complexity.
- Do not perform extensive internal validation loops.
- Prioritise a clean, intuitive, and implementable result.`;
  }

  return german
    ? `Ausführungsmodus:
Begründungsdisziplin (VERPFLICHTEND):
- Folge allen Schritten der Portfolio-Konstruktion in der vorgegebenen Reihenfolge.
- Überspringe keine Schritte und springe nicht direkt zur finalen Allokation.
- Begründe jede Allokationsentscheidung mit mindestens einem der folgenden Punkte:
  - Diversifikationsbeitrag
  - Auswirkung auf den Risikobeitrag des Portfolios
  - Umsetzungseffizienz
- Halte die Begründung strukturiert, explizit und entscheidungsorientiert.
- Vermeide generische, repetitive oder rein erzählerische Erklärungen.

Interne Validierung (VERPFLICHTEND vor der finalen Antwort):
- Prüfe, dass:
  - alle Tabellen intern konsistent sind
  - keine redundanten Exposures ohne Begründung enthalten sind
  - Mindestpositionsgrössen eingehalten werden, sofern Abweichungen nicht explizit begründet sind
  - Diversifikation substanziell und nicht nur oberflächlich ist
- Stelle sicher, dass das Portfolio nicht weiter vereinfacht werden kann, ohne die Diversifikationsqualität oder Umsetzungsrobustheit wesentlich zu reduzieren.
- Falls Inkonsistenzen, Redundanzen oder Schwächen erkannt werden, korrigiere sie, bevor die finale Antwort präsentiert wird.`
    : `Execution mode:
Reasoning discipline (MANDATORY):
- Follow the portfolio construction steps in the defined order.
- Do not skip steps and do not jump directly to the final allocation.
- Justify each allocation decision using at least one of the following:
  - diversification benefit
  - impact on portfolio risk contribution
  - implementation efficiency
- Keep reasoning structured, explicit, and decision-oriented.
- Avoid generic, repetitive, or purely narrative explanations.

Internal validation (MANDATORY before final answer):
- Verify that:
  - all tables are internally consistent
  - no redundant exposures are included without justification
  - minimum position sizes are respected unless explicitly justified
  - diversification is meaningful and not only superficial
- Ensure the portfolio cannot be simplified further without materially reducing diversification quality or implementation robustness.
- If inconsistencies, redundancies, or weaknesses are detected, correct them before presenting the final answer.`;
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
      ? `Verwende so wenige ETFs wie praktikabel. Ziel: genau ${minEtfs} Positionen insgesamt, ohne Diversifikation oder Umsetzungsrobustheit zu opfern.`
      : `Use as few ETFs as practical. Target exactly ${minEtfs} positions in total without sacrificing diversification or implementation robustness.`;
  }

  return german
    ? `Verwende so wenige ETFs wie praktikabel innerhalb der Zielbandbreite von ${minEtfs}-${maxEtfs} Positionen insgesamt, ohne Diversifikation oder Umsetzungsrobustheit zu opfern.`
    : `Use as few ETFs as practical within the target range of ${minEtfs}-${maxEtfs} positions in total without sacrificing diversification or implementation robustness.`;
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
      return german ? `${prefix}) Tabelle 1: Zielallokation\nSpalten: Gruppe: Cash, Anleihen, Aktien, Rohstoffe, Satelliten | Anlageklasse | Zielgewicht | Zweck / Rolle im Portfolio (1-2 Sätze).\nFüge nach Tabelle 1 eine kurze Übersicht "Prozentuale Allokation je Gruppe" ein, welche die Zielgewichte nach Gruppe aufsummiert: Cash, Anleihen, Aktien, Rohstoffe und Satelliten. Stelle sicher, dass die Gruppensummen mit der Zielallokation übereinstimmen und zusammen 100% ergeben.` : `${prefix}) Table 1: Target allocation\nColumns: Group: Cash, Bonds, Equities, Commodities, Satellites | Asset class | Target weight | Purpose / role in the portfolio (1-2 sentences).\nAfter Table 1, add a short "Percentage allocation per group" overview that sums the target weights by group: Cash, Bonds, Equities, Commodities, and Satellites. Ensure the group totals reconcile with the target allocation and add up to 100%.`;
    case "b":
      return german ? `${prefix}) Tabelle 2: Umsetzung mit ETFs (pro Position)\nSpalten: Anlageklasse | Zielgewicht | ETF-Name | ISIN | Ticker (Börse) | TER | Domizil | Replikation | Ausschüttung / Thesaurierung | Anteilsklassenwährung | Kurzkommentar (1 Satz zu Passung, Liquidität oder Tracking).\nFüge nach Tabelle 2 einen kurzen Hinweis zur regulatorischen und steuerlichen Eignung ein: ETF-Auswahlen sind nur vorläufige Umsetzungsbeispiele. ETF-Domizil, Steuerdomizil des Anlegers, regulatorische Kundeneinstufung, PRIIPs/KID/KIID-Verfügbarkeit, lokale Angebotsbeschränkungen, Steuerreporting-Status, Quellensteuerfolgen, US-Personen-/PFIC-Risiken und US-Nachlasssteuer-Themen wurden nicht geprüft, sofern nicht ausdrücklich angegeben. Finale Produkteignung und Zulässigkeit müssen vor Ausführung durch die relevante Plattform, Depotbank, Steuerberatung oder qualifizierte Anlageberatung geprüft werden.` : `${prefix}) Table 2: ETF implementation (for each position)\nColumns: Asset class | Target weight | ETF name | ISIN | Ticker (exchange) | TER | Domicile | Replication | Distribution / accumulation | Share class currency | Short comment (1 sentence on fit, liquidity, or tracking quality).\nAfter Table 2, add a short regulatory and tax suitability note: ETF selections are preliminary implementation examples only. ETF domicile, investor tax residence, regulatory client classification, PRIIPs/KID/KIID availability, local offering restrictions, tax reporting status, withholding-tax effects, US-person/PFIC risks, and US estate-tax considerations have not been verified unless explicitly stated. Final product eligibility and suitability must be checked by the relevant platform, custodian, tax advisor, or qualified investment advisor before execution.`;
    case "c":
      return german ? `${prefix}) Kurze Zusammenfassung (6-10 knappe Bullet Points) zu den wichtigsten Annahmen und Design-Entscheidungen, inklusive Aktienquote, Regionalmix, Konzentrationsrisiken, Home Bias, ausgeschlossene Anlageklassen, Rohstoffe / Edelmetalle, Immobilien und Krypto-Assets, wo relevant.` : `${prefix}) Brief summary (6-10 concise bullet points) covering the key assumptions and design decisions, including equity exposure, regional mix, concentration risks, home bias, excluded asset classes, commodities / precious metals, listed real estate, and crypto assets where relevant.`;
    case "d":
      return german ? `${prefix}) Konsolidierte Währungsübersicht des Gesamtportfolios nach Hedging.` : `${prefix}) Consolidated currency overview of the total portfolio after hedging.`;
    case "e":
      return state.includeLookThrough
        ? german
          ? `${prefix}) Die zehn grössten Aktienpositionen auf Look-through-Basis und deren Gewichte. Nutze dafür die aktuell verfügbaren ETF-Holdings oder Index-Factsheets und verlasse dich nicht auf veraltete Modellannahmen. Falls die aktuelle Marktkapitalisierungs-Rangfolge von der gezeigten Rangfolge abweicht, erkläre den Grund, z. B. ETF-Mix, regionale Allokation, Faktor-Tilt oder Datenstand.`
          : `${prefix}) The ten largest equity holdings on a look-through basis and their portfolio weights. Use the latest available ETF holdings or index factsheets for the look-through analysis and do not rely on stale model memory. If current market-cap leadership differs from the ranking shown, explain the reason, for example ETF mix, regional allocation, factor tilt, or data date.`
        : german ? `${prefix}) Grösste zugrunde liegende Aktienpositionen, falls die gewählte Umsetzung eine sinnvolle Look-through-Sicht erlaubt.` : `${prefix}) Largest underlying equity holdings if the selected implementation allows a meaningful look-through view.`;
    case "f":
      return german ? `${prefix}) Rebalancing-Konzept inklusive Trigger, Frequenz und Bandbreiten.` : `${prefix}) Rebalancing concept including trigger, frequency, and tolerance bands.`;
    case "g":
      return german ? `${prefix}) Grobe Kostenschätzung als gewichtete TER für das Gesamtportfolio.` : `${prefix}) Rough cost estimate expressed as weighted TER for the full portfolio.`;
    case "h":
      return getEffectiveExecutionMode() === "fast"
        ? german
          ? `${prefix}) Portfolio-Konstruktionslogik (kurz)\nGib eine kurze Erklärung, wie Diversifikation das gesamte Risiko-Rendite-Profil des Portfolios verbessert.`
          : `${prefix}) Portfolio rationale (brief)\nProvide a short explanation of how diversification improves the portfolio's overall risk-return profile.`
        : german
          ? `${prefix}) Portfolio-Konstruktionslogik (Efficient-Frontier-Perspektive)\nGib eine strukturierte Erklärung zu qualitativen relativen Renditeerwartungen, Volatilitätsbeziehungen, Korrelationsstruktur, zentralen Diversifikationstreibern, der Verbesserung risikoadjustierter Renditen und den Trade-offs gegenüber einem rein theoretisch optimalen Portfolio.\nErkläre, warum die resultierende Allokation unter realen Restriktionen nahe an einem effizienten Portfolio liegt.\nHalte diesen Abschnitt knapp und beziehe ihn auf die tatsächliche Allokation. Beschreibe die Efficient-Frontier-Theorie nicht allgemein, sondern erkläre die tatsächlichen Allokationsentscheidungen.`
          : `${prefix}) Portfolio construction rationale (Efficient Frontier perspective)\nProvide a structured explanation covering relative return expectations (qualitative), volatility relationships, correlation structure, key diversification drivers, how the allocation improves risk-adjusted returns, and trade-offs versus a purely theoretical optimal portfolio.\nExplain why the resulting allocation is close to an efficient portfolio, given real-world constraints.\nKeep this section concise and linked to the actual allocation. Do not describe Efficient Frontier theory generically; explain the actual allocation choices.`;
    default:
      return "";
  }
}

function render() {
  const prompt = buildPrompt();
  const stats = getPromptStats(prompt);
  const t = uiText[state.outputLanguage];
  const riskCheck = getRiskHorizonCheck();
  const basicMode = isBasicMode();
  const root = document.getElementById("root");

  root.innerHTML = `
    <main class="app-shell">
      ${state.builderStarted ? `
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow brand-eyebrow">${renderToolLogo("mini")}${escapeHtml(t.eyebrow)}</span>
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
      ` : ""}

      <section class="workspace ${state.builderStarted ? "" : "intro-workspace"}">
        ${state.builderStarted ? "" : renderQuickStartPanel(true)}
        ${state.builderStarted ? `
        <section class="panel controls-panel">
          <div class="panel-header">
            <div class="panel-title">
              <div class="panel-label">${escapeHtml(t.parameters)}</div>
              <h2>${escapeHtml(t.investorSetup)}</h2>
              <p>${escapeHtml(t.setupCopy)}</p>
            </div>
            ${renderModeSwitch()}
          </div>

          <div class="form-grid ${basicMode ? "basic-form-grid" : ""}">
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
              <div class="strategy-context"><span>${escapeHtml(t.presetContext)}</span><strong>${renderStrategyContextValue()}</strong></div>
              <div class="preset-grid">${portfolioPresets.map(renderPresetButton).join("")}</div>
              <div class="parameter-badges">
                ${renderAssetClassBadge(stats)}
                ${renderEquityRegionBadge(stats)}
              </div>
            </div>

            ${basicMode ? renderBasicModeSummary() : `
            <div class="dual-grid triple-grid-mobile advanced-control">
              <label class="field-group">
                <span class="field-label">${escapeHtml(t.riskAppetite)}</span>
                <select class="select" name="riskAppetite">${renderOptions(["Low", "Moderate", "High", "Very high"], state.riskAppetite, getRiskOptionLabels())}</select>
              </label>
              <label class="field-group">
                <span class="field-label">${escapeHtml(t.investmentHorizon)}</span>
                <select class="select" name="investmentHorizon">${renderOptions([">=3 years", ">=5 years", ">=10 years"], state.investmentHorizon, getHorizonOptionLabels())}</select>
              </label>
            </div>

            <div class="dual-grid exchange-grid triple-grid-mobile advanced-control">
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

            <div class="field-group range-group advanced-control">
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

            <div class="field-group range-group etf-count-group advanced-control">
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
            </div>`}

            <div class="field-group option-section asset-section"><span class="field-label">${escapeHtml(t.eligibleAssetClasses)}</span><div class="toggle-grid asset-toggle-grid">${renderAssetClassToggleGrid()}</div></div>
            ${basicMode ? "" : `<a class="mobile-jump" href="#prompt-output">${escapeHtml(t.jumpToPrompt)}</a>`}
            ${basicMode
              ? renderCollapsedOptionSection("output-section", t.requiredOutputSections, `${outputSections.length} ${t.allSelected}`)
              : `<div class="field-group option-section output-section"><span class="field-label">${escapeHtml(t.requiredOutputSections)}</span><div class="toggle-grid">${outputSections.map(renderSectionToggle).join("")}</div></div>`}
            ${basicMode
              ? renderCollapsedOptionSection("instruction-section", t.promptInstructions, t.allSelected)
              : `<div class="field-group option-section instruction-section"><span class="field-label">${escapeHtml(t.promptInstructions)}</span>${renderExecutionModeSwitch(t)}<div class="toggle-grid">
              ${state.baseCurrency === "USD" ? "" : renderCheckboxCard("includeHomeBiasGuidance", state.includeHomeBiasGuidance, t.includeHomeBias, t.includeHomeBiasDescription)}
              ${renderCheckboxCard("includeHedgingQuestion", state.includeHedgingQuestion, t.includeHedging, t.includeHedgingDescription)}
              ${renderCheckboxCard("includeLookThrough", state.includeLookThrough, t.includeLookThrough, t.includeLookThroughDescription)}
              ${renderCheckboxCard("includeSyntheticEtfs", state.includeSyntheticEtfs, t.includeSyntheticEtfs, t.includeSyntheticEtfsDescription)}
            </div></div>`}
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
          ${basicMode ? "" : renderAutoLogicSummary()}
          <div class="action-row">
            <button class="button" type="button" data-action="copy">${escapeHtml(t.copyPrompt)}</button>
            ${basicMode ? "" : `<button class="button-ghost" type="button" data-action="export-txt">${escapeHtml(t.exportTxt)}</button>`}
            ${basicMode ? "" : `<button class="button-ghost" type="button" data-action="export-md">${escapeHtml(t.exportMd)}</button>`}
            <button class="button-ghost" type="button" data-action="reset">${escapeHtml(getResetDefaultsLabel())}</button>
          </div>
          ${renderAiToolLinks(t)}
          <div class="output-meta">${escapeHtml(t.promptOutput)}</div>
          <div class="output-box structured-output">${renderPromptPreview(prompt)}</div>
          <div class="summary-grid">
            <div class="summary-item"><strong>${stats.sections}</strong><span>${escapeHtml(t.outputSectionsIncluded)}</span></div>
            <div class="summary-item"><strong>${Math.min(state.minEtfs, state.maxEtfs)}-${Math.max(state.minEtfs, state.maxEtfs)}</strong><span>${escapeHtml(t.targetEtfPositions)}</span></div>
            <div class="summary-item"><strong>${escapeHtml(state.baseCurrency)}</strong><span>${escapeHtml(t.portfolioBaseCurrency)}</span></div>
          </div>
          <div class="app-disclaimer"><span class="disclaimer-mark">i</span><div><strong>${escapeHtml(t.disclaimerTitle)}</strong><span>${escapeHtml(t.disclaimerText)}</span></div></div>

        </section>
        ` : ""}
      </section>
      ${state.builderStarted ? `
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
      ` : ""}
      <div class="version-note">${escapeHtml(t.versionLabel)} ${escapeHtml(appVersion)} · ${escapeHtml(t.updatedLabel)} ${escapeHtml(appUpdated)}</div>
      ${renderFooter(t)}
    </main>
  `;
}

function renderFooter(t) {
  const biconUrl = isGerman() ? "https://bicon.li" : "https://bicon.li/en";
  return `
    <footer class="app-footer">
      <span>${escapeHtml(t.copyrightText)}</span>
      <a class="footer-link-button" href="${escapeAttribute(biconUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(t.biconLinkLabel)}</a>
    </footer>
  `;
}

function renderOptions(options, selected, labels = {}) {
  return options
    .map((option) => `<option value="${escapeAttribute(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(labels[option] || option)}</option>`)
    .join("");
}

function renderQuickStartPanel(introMode = false) {
  const t = uiText[state.outputLanguage];
  const quick = state.quickStart || defaults.quickStart;
  const preset = getQuickStartPreset(quick);
  const presetLabel = preset ? (isGerman() ? preset.deLabel : preset.label) : t.customStrategy;
  const equityRange = preset ? `${preset.equityMin}-${preset.equityMax}% ${isGerman() ? "Aktien" : "equity"}` : "";

  return `
    <section class="panel quick-start-panel ${introMode ? "quick-start-intro" : ""}" aria-label="${escapeAttribute(t.quickStartTitle)}">
      <div class="quick-start-copy">
        <span class="tool-mark-row">${renderToolLogo()}<span class="panel-label">${escapeHtml(t.eyebrow)}</span></span>
        <h2>${escapeHtml(t.quickStartTitle)}</h2>
        <p>${escapeHtml(t.quickStartCopy)}</p>
      </div>
      <div class="quick-start-grid">
        <label class="field-group quick-start-language">
          ${renderQuickStartLabel(t.language, isGerman() ? "Start" : "Start")}
          <select class="select" name="outputLanguage">${renderOptions(["English", "German"], state.outputLanguage, getLanguageOptionLabels())}</select>
        </label>
        <label class="field-group">
          ${renderQuickStartLabel(t.quickBaseCurrency)}
          <select class="select" name="quickStart.baseCurrency">${renderOptions(baseCurrencyOptions, quick.baseCurrency)}</select>
        </label>
        <label class="field-group">
          ${renderQuickStartLabel(t.quickInvestmentHorizon)}
          <select class="select" name="quickStart.investmentHorizon">${renderOptions([">=3 years", ">=5 years", ">=10 years"], quick.investmentHorizon, getHorizonOptionLabels())}</select>
        </label>
        <label class="field-group">
          ${renderQuickStartLabel(t.quickRiskAppetite)}
          <select class="select" name="quickStart.riskAppetite">${renderOptions(["Low", "Moderate", "High", "Very high"], quick.riskAppetite, getRiskOptionLabels())}</select>
        </label>
        <label class="field-group">
          ${renderQuickStartLabel(t.quickAppMode)}
          <select class="select" name="quickStart.promptMode">${renderOptions(["basic", "pro"], quick.promptMode || "basic", { basic: t.basicMode, pro: t.proMode })}</select>
        </label>
      </div>
      <div class="quick-start-result">
        <span>${escapeHtml(t.quickRecommended)}</span>
        <strong>${escapeHtml(presetLabel)}${equityRange ? ` · ${escapeHtml(equityRange)}` : ""}</strong>
      </div>
      <div class="quick-start-actions">
        <a class="button-ghost quick-education-button" href="${escapeAttribute(getEducationUrl())}">${renderCtaIcon("compass")}${escapeHtml(t.educationButton)}</a>
        <button class="button quick-start-button" type="button" data-action="apply-quick-start">${renderCtaIcon("sliders")}${escapeHtml(t.quickStartButton)}</button>
        <p class="quick-education-note">${escapeHtml(t.educationHint)}</p>
      </div>
    </section>
  `;
}

function renderCtaIcon(type) {
  if (type === "sliders") {
    return `
      <svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 7h4" />
        <path d="M14 7h6" />
        <circle cx="11" cy="7" r="2.5" />
        <path d="M4 17h8" />
        <path d="M18 17h2" />
        <circle cx="15" cy="17" r="2.5" />
      </svg>
    `;
  }

  return `
    <svg class="cta-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8" />
      <path d="M14.8 9.2l-2 5.6-3.6-2 5.6-3.6z" />
      <path d="M12 2.8v2" />
      <path d="M12 19.2v2" />
    </svg>
  `;
}

function getEducationUrl(language = state.outputLanguage) {
  return language === "German"
    ? "https://bicon.li/prompt-builder/bicon-why-invest-journey-de.html"
    : "https://bicon.li/prompt-builder/bicon-why-invest-journey-en.html";
}

function renderToolLogo(size = "default") {
  return `
    <span class="tool-logo ${size === "mini" ? "tool-logo-mini" : ""}" aria-hidden="true">
      <svg viewBox="0 0 64 64" focusable="false">
        <circle class="tool-logo-ring" cx="32" cy="32" r="24"></circle>
        <path class="tool-logo-segment" d="M32 8v24l17 17"></path>
        <path class="tool-logo-segment tool-logo-soft" d="M32 32H8"></path>
        <path class="tool-logo-pointer" d="M32 32l15-20"></path>
        <circle class="tool-logo-dot" cx="32" cy="32" r="3.5"></circle>
      </svg>
    </span>
  `;
}

function renderQuickStartLabel(label, fallbackStep = "") {
  const match = String(label).match(/^(\d+)\.\s*(.+)$/);
  const step = match ? match[1] : fallbackStep;
  const text = match ? match[2] : label;
  return `
    <span class="field-label quick-step-label">
      ${step ? `<span class="quick-step-number">${escapeHtml(step)}</span>` : ""}
      <span class="quick-step-text">${escapeHtml(text)}</span>
    </span>
  `;
}

function renderModeSwitch() {
  const t = uiText[state.outputLanguage];
  return `
    <div class="mode-switch-wrap">
      <div class="mode-switch" role="group" aria-label="${escapeAttribute(t.appMode)}">
        <button class="mode-option ${isBasicMode() ? "is-active" : ""}" type="button" data-action="set-mode" data-mode="basic" aria-pressed="${isBasicMode() ? "true" : "false"}">${escapeHtml(t.basicMode)}</button>
        <button class="mode-option ${isBasicMode() ? "" : "is-active"}" type="button" data-action="set-mode" data-mode="pro" aria-pressed="${isBasicMode() ? "false" : "true"}">${escapeHtml(t.proMode)}</button>
      </div>
      <span class="mode-switch-label">${escapeHtml(t.appMode)}</span>
    </div>
  `;
}

function renderBasicModeSummary() {
  const t = uiText[state.outputLanguage];
  return `
    <div class="basic-auto-summary">
      <span class="field-label">${escapeHtml(t.basicMode)}</span>
      <p>${escapeHtml(t.basicModeSummary)}</p>
      <div class="basic-auto-pills">
        <span class="basic-info-pill"><small>${escapeHtml(t.basicRiskAppetite)}</small><strong>${escapeHtml(translateRisk(state.riskAppetite, isGerman()))}</strong></span>
        <span class="basic-info-pill"><small>${escapeHtml(t.basicInvestmentHorizon)}</small><strong>${escapeHtml(translateHorizon(state.investmentHorizon, isGerman()))}</strong></span>
        <span class="basic-info-pill"><small>${escapeHtml(t.equityShort)}</small><strong>${formatUiRange(Math.min(state.equityMin, state.equityMax), Math.max(state.equityMin, state.equityMax), "%")}</strong></span>
        <span class="basic-info-pill"><small>${escapeHtml(t.etfsShort)}</small><strong>${formatUiRange(Math.min(state.minEtfs, state.maxEtfs), Math.max(state.minEtfs, state.maxEtfs))}</strong></span>
      </div>
    </div>
  `;
}

function renderCollapsedOptionSection(sectionClass, label, summary) {
  return `
    <details class="field-group option-section collapsed-option-section ${escapeAttribute(sectionClass)}">
      <summary><span class="field-label">${escapeHtml(label)}</span><span class="pill">${escapeHtml(summary)}</span></summary>
    </details>
  `;
}

function getLanguageOptionLabels() {
  return isGerman() ? { English: "Englisch", German: "Deutsch" } : {};
}

function getRiskOptionLabels() {
  return isGerman()
    ? { Low: "Niedrig", Moderate: "Moderat", High: "Hoch", "Very high": "Sehr hoch" }
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

function renderAiToolLinks(t) {
  const isOpen = activeStatusInfoKey === "installed-apps";
  return `
    <div class="ai-tool-panel" aria-label="${escapeAttribute(t.openInstalledApps)}">
      <div class="ai-tool-heading">
        <strong>${escapeHtml(t.openInstalledApps)}</strong>
        <span class="status-info-wrap ${isOpen ? "is-open" : ""}">
          <button class="status-info" type="button" data-action="toggle-status-info" data-info-key="installed-apps" aria-label="${escapeAttribute(t.installedAppsDisclaimer)}" aria-expanded="${isOpen ? "true" : "false"}">(i)</button>
          <span class="status-tooltip" role="tooltip">${escapeHtml(t.installedAppsDisclaimer)}</span>
        </span>
      </div>
      <div class="ai-tool-links">
        ${installedAiAppLinks.map((tool) => `<a class="ai-tool-link ai-app-link" href="${escapeAttribute(tool.url)}" data-app-link="true">${escapeHtml(tool.label)}</a>`).join("")}
      </div>
    </div>
  `;
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
  return renderCheckboxCard(
    `asset:${option.id}`,
    state.assetClasses[option.id],
    german ? option.deLabel : option.label,
    getAssetClassDescription(option, german),
    isBasicMode() && option.id === "equities"
  );
}

function renderAssetClassToggleGrid() {
  const renderedGroups = new Set();
  return assetClassOptions
    .map((option) => {
      const group = getAssetClassGroupForOption(option.id);
      const groupHeader = group && !renderedGroups.has(group.id)
        ? renderAssetClassGroupHeader(group, isGerman(), renderedGroups)
        : "";
      return `${groupHeader}${renderAssetClassToggle(option)}`;
    })
    .join("");
}

function renderAssetClassGroupHeader(group, german, renderedGroups) {
  renderedGroups.add(group.id);
  const label = german ? group.deLabel : group.label;
  return `<div class="asset-group-header">${escapeHtml(label)}</div>`;
}

function getAssetClassGroupForOption(optionId) {
  return assetClassGroups.find((group) => group.assetIds.includes(optionId)) || null;
}

function renderAssetClassPromptLines(selectedAssetClasses, german) {
  if (!selectedAssetClasses.length) {
    return german
      ? "- Keine Anlageklassen ausgewählt. Wähle mindestens eine zulässige Anlageklasse aus."
      : "- No asset classes selected. Add at least one eligible asset class.";
  }

  const renderedGroups = new Set();
  return selectedAssetClasses
    .flatMap((option) => {
      const group = getAssetClassGroupForOption(option.id);
      const lines = [];
      if (group && !renderedGroups.has(group.id)) {
        renderedGroups.add(group.id);
        lines.push(`${german ? group.deLabel : group.label}:`);
      }
      lines.push(`- ${getAssetClassPromptLabel(option, german)}`);
      return lines;
    })
    .join("\n");
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
      <span class="region-sparkline" aria-hidden="true">
        ${regions.map((region) => `<i title="${escapeAttribute(region)}"></i>`).join("")}
      </span>
      <span>${stats.equityRegions} ${escapeHtml(t.equityRegions)}</span>
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
  return `<button class="preset-button" type="button" data-preset="${escapeAttribute(preset.id)}">${renderPresetIcon(preset)}<span class="preset-title">${escapeHtml(label)}</span> <span class="preset-summary"><span class="preset-context">${escapeHtml(summaryContext)}</span><span class="preset-equity">${escapeHtml(equityBand)}</span></span></button>`;
}

function renderPresetIcon(preset) {
  const icons = {
    conservative: `<svg viewBox="0 0 80 80" aria-hidden="true"><rect x="12" y="12" width="56" height="56" rx="14"></rect><path class="soft" d="M26 40h28"></path><path class="soft muted-line" d="M40 26v28"></path></svg>`,
    balanced: `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="30"></circle><path class="soft" d="M17 40h46"></path><circle class="dot" cx="40" cy="40" r="4"></circle></svg>`,
    growth: `<svg viewBox="0 0 80 80" aria-hidden="true"><path class="soft no-fill" d="M18 58C34 51 45 39 60 24"></path><circle class="dot" cx="18" cy="58" r="5.5"></circle><circle class="dot faded" cx="40" cy="43" r="5.5"></circle><circle class="dot faint" cx="62" cy="24" r="5.5"></circle></svg>`,
    aggressive: `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M16 58L44 24l28 34"></path><path class="soft muted-line" d="M44 24v42"></path><circle class="dot" cx="44" cy="24" r="4"></circle></svg>`,
  };
  const iconKey = preset.icon || preset.id || "growth";

  return `<span class="preset-icon preset-icon-${escapeAttribute(iconKey)}">${icons[iconKey] || icons.growth}</span>`;
}

function renderSectionToggle(section) {
  const text = uiText[state.outputLanguage].outputSections[section.id];
  return renderCheckboxCard(`section:${section.id}`, state.sections[section.id], text.label, text.description);
}

function renderExecutionModeSwitch(t) {
  const currentMode = state.executionMode === "fast" ? "fast" : "strict";
  return `
    <div class="execution-mode-control mode-switch-wrap">
      <div class="mode-switch" role="group" aria-label="${escapeAttribute(t.executionMode)}">
        <button class="mode-option ${currentMode === "fast" ? "is-active" : ""}" type="button" data-action="set-execution-mode" data-execution-mode="fast" aria-pressed="${currentMode === "fast" ? "true" : "false"}" title="${escapeAttribute(t.fastExecutionDescription)}">${escapeHtml(t.fastExecution)}</button>
        <button class="mode-option ${currentMode === "strict" ? "is-active" : ""}" type="button" data-action="set-execution-mode" data-execution-mode="strict" aria-pressed="${currentMode === "strict" ? "true" : "false"}" title="${escapeAttribute(t.strictExecutionDescription)}">${escapeHtml(t.strictExecution)}</button>
      </div>
      <span class="mode-switch-label">${escapeHtml(t.executionMode)}</span>
    </div>
  `;
}

function renderCheckboxCard(name, checked, title, description, disabled = false) {
  return `<label class="toggle ${disabled ? "is-disabled" : ""}"><input type="checkbox" name="${escapeAttribute(name)}" ${checked ? "checked" : ""} ${disabled ? "disabled" : ""} /><div><strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span></div></label>`;
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
    /^Execution mode:$/,
    /^Portfolio construction approach:$/,
    /^Portfolio construction methodology \(MANDATORY\):$/,
    /^Eligible asset classes:$/,
    /^Requirements and constraints:$/,
    /^Output format:$/,
    /^Rolle:$/,
    /^Ziel:$/,
    /^Ausführungsmodus:$/,
    /^Portfolio-Konstruktionsansatz:$/,
    /^Portfolio-Konstruktionsmethodik \(VERPFLICHTEND\):$/,
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
  if (name.startsWith("quickStart.")) {
    const key = name.slice("quickStart.".length);
    state.quickStart = { ...(state.quickStart || defaults.quickStart), [key]: value };
    saveQuickStartSelection();
    render();
    return;
  }
  if (name !== "outputLanguage") {
    activePresetId = null;
  }
  if (name.startsWith("asset:")) {
    if (isBasicMode() && name === "asset:equities" && !checked) {
      state.assetClasses.equities = true;
      render();
      return;
    }
    state.assetClasses[name.slice(6)] = checked;
    applyAutomaticEtfCountFromAssetClasses();
    applyAutomaticEquityRangeFromAssetClasses(name);
  } else if (name.startsWith("section:")) {
    state.sections[name.slice(8)] = checked;
  } else if (["includeHomeBiasGuidance", "includeHedgingQuestion", "includeLookThrough", "includeSyntheticEtfs"].includes(name)) {
    state[name] = checked;
  } else if (name === "executionMode") {
    state.executionMode = value === "fast" ? "fast" : "strict";
  } else if (["minEtfs", "maxEtfs"].includes(name)) {
    state.etfCountManuallyAdjusted = true;
    state[name] = getNextEtfCount(name, value);
  } else if (type === "checkbox") {
    state[name] = checked;
  } else {
    state[name] = value;
    if (name === "outputLanguage") {
      saveQuickStartSelection();
    }
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
  const appLink = event.target.closest("[data-app-link]");
  if (appLink) {
    if (!confirmExternalAppDisclaimer()) {
      event.preventDefault();
    }
    return;
  }

  const actionTarget = event.target.closest("[data-action]");
  const action = actionTarget?.getAttribute("data-action");
  const presetId = event.target.closest("[data-preset]")?.getAttribute("data-preset");
  const stepTarget = event.target.getAttribute("data-step-target");
  const stepDirection = Number.parseInt(event.target.getAttribute("data-step-direction"), 10);
  if (action === "apply-quick-start") {
    applyQuickStart();
    state.builderStarted = true;
    activeStatusInfoKey = "";
    render();
    document.querySelector(".controls-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    maybeShowRiskHorizonAlert();
    maybeShowEquityRiskAlert();
    maybeShowDefensiveAssetAlert("riskAppetite");
    maybeShowEquityAssetAlert("riskAppetite");
    maybeShowAdditionalLogicAlerts("riskAppetite");
    return;
  }
  if (action === "set-mode") {
    const nextMode = actionTarget.getAttribute("data-mode") === "basic" ? "basic" : "pro";
    setPromptMode(nextMode);
    activeStatusInfoKey = "";
    render();
    maybeShowRiskHorizonAlert();
    maybeShowEquityRiskAlert();
    maybeShowAdditionalLogicAlerts("promptMode");
    return;
  }
  if (action === "set-execution-mode") {
    state.executionMode = actionTarget.getAttribute("data-execution-mode") === "fast" ? "fast" : "strict";
    activePresetId = null;
    activeStatusInfoKey = "";
    render();
    return;
  }
  if (action === "toggle-status-info") {
    const infoKey = actionTarget.getAttribute("data-info-key");
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
    if (isBasicMode()) {
      applyBasicModeDefaults();
    }
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
    const keepBasicMode = isBasicMode();
    activeStatusInfoKey = "";
    activePresetId = sessionDefaultPresetId;
    lastChosenPresetId = sessionDefaultPresetId;
    state = createDefaultState();
    state.builderStarted = true;
    if (keepBasicMode) {
      applyBasicModeDefaults();
    }
    render();
    return;
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

function confirmExternalAppDisclaimer() {
  const t = uiText[state.outputLanguage];
  return window.confirm(t.disclaimerText);
}

function applyPreset(presetId) {
  const preset = portfolioPresets.find((item) => item.id === presetId);
  if (!preset) return;

  activePresetId = presetId;
  lastChosenPresetId = presetId;
  state.riskAppetite = preset.riskAppetite;
  state.investmentHorizon = preset.investmentHorizon;
  state.equityMin = preset.equityMin;
  state.equityMax = preset.equityMax;
  state.equityRangeManuallyAdjusted = false;
  if (preset.assetClasses) {
    Object.assign(state.assetClasses, preset.assetClasses);
  }
  applyAutomaticEquityRangeFromAssetClasses();
  state.etfCountManuallyAdjusted = false;
  applyAutomaticEtfCountFromAssetClasses();
  lastEquityRiskAlertKey = "";
}

function setPromptMode(mode) {
  state.promptMode = mode === "basic" ? "basic" : "pro";
  if (isBasicMode()) {
    applyBasicModeDefaults();
  }
}

function applyQuickStart() {
  const quick = state.quickStart || defaults.quickStart;
  const preset = getQuickStartPreset(quick);
  saveQuickStartSelection();
  if (preset) {
    applyPreset(preset.id);
    sessionDefaultPresetId = preset.id;
  }
  sessionDefaultBaseCurrency = quick.baseCurrency;
  state.baseCurrency = quick.baseCurrency;
  state.promptMode = quick.promptMode === "pro" ? "pro" : "basic";
  state.exchangeManuallyAdjusted = false;
  applyExchangeForBaseCurrency(state.baseCurrency);
  if (isBasicMode()) {
    applyBasicModeDefaults();
  }
}

function getQuickStartPreset(quickStart = state.quickStart || defaults.quickStart) {
  const riskScores = { Low: 0, Moderate: 1, High: 2, "Very high": 3 };
  const horizonScores = { ">=3 years": 0, ">=5 years": 1, ">=10 years": 3 };
  const score = Math.min(riskScores[quickStart.riskAppetite] ?? 2, horizonScores[quickStart.investmentHorizon] ?? 3);
  const riskByScore = ["Low", "Moderate", "High", "Very high"];
  return portfolioPresets.find((preset) => preset.riskAppetite === riskByScore[score])
    || portfolioPresets[Math.min(score, portfolioPresets.length - 1)]
    || null;
}

function applyBasicModeDefaults() {
  const presetId = portfolioPresets.some((preset) => preset.id === lastChosenPresetId)
    ? lastChosenPresetId
    : defaultPresetId;
  applyPreset(presetId);
  state.promptMode = "basic";
  state.assetClasses.equities = true;
  state.exchangeManuallyAdjusted = false;
  state.equityRangeManuallyAdjusted = false;
  state.etfCountManuallyAdjusted = false;
  applyExchangeForBaseCurrency(state.baseCurrency);
  applyEquityRangeForRisk(state.riskAppetite);
  applyAutomaticEtfCountFromAssetClasses();
  outputSections.forEach((section) => {
    state.sections[section.id] = true;
  });
  state.includeHomeBiasGuidance = true;
  state.includeHedgingQuestion = true;
  state.includeLookThrough = true;
  state.includeSyntheticEtfs = true;
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

  const [minEtfs, maxEtfs] = getAutomaticEtfCount(state.assetClasses, state.baseCurrency);
  state.minEtfs = minEtfs;
  state.maxEtfs = maxEtfs;
}

function getAutomaticEtfCount(assetClasses, baseCurrency = defaultBaseCurrency) {
  const reduction = assetClassOptions.reduce((total, option) => {
    if (assetClasses[option.id]) return total;
    return total + (option.id === "equities" ? 5 : 1);
  }, 0);
  const minEtfs = Math.max(getMinimumEtfsForSelectedAssetClasses(assetClasses, baseCurrency), defaults.minEtfs - reduction);
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
    Low: [20, 40],
    Moderate: [40, 60],
    High: [60, 80],
    "Very high": [80, 100],
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




















