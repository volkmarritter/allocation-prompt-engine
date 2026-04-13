const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

const appUrl = pathToFileURL(path.resolve(__dirname, "..", "..", "index.html")).href;

async function openApp(page) {
  await page.goto(appUrl);
  await expect(page.locator("#root")).not.toBeEmpty();
  await expect(page.getByRole("heading", { name: /Shape the mandate|Mandat definieren/i })).toBeVisible();
}

async function getPrompt(page) {
  return page.locator(".output-box").innerText();
}

test.describe("Portfolio Prompt Builder browser flow", () => {
  test("renders the app and generates the default English prompt", async ({ page }) => {
    await openApp(page);

    await expect(page.locator('select[name="baseCurrency"]')).toHaveValue("CHF");
    await expect(page.locator('select[name="riskAppetite"]')).toHaveValue("High");
    await expect(page.locator('select[name="investmentHorizon"]')).toHaveValue(">=10 years");
    await expect(page.locator(".etf-count-group")).toBeVisible();
    await expect(page.locator(".range-group").first().locator(".status-pill")).toHaveText("Auto");
    await expect(page.locator(".etf-count-group").locator(".status-pill")).toHaveText("Auto");
    await page.locator(".range-group").first().locator(".status-info").click();
    await expect(page.locator(".status-info-wrap.is-open .status-tooltip")).toContainText("Automatically derived");
    await expect(page.locator(".asset-class-pill")).toContainText("6 asset classes");
    await expect(page.locator(".asset-pie")).toBeVisible();
    await expect(page.locator(".asset-pie")).toHaveAttribute("style", /conic-gradient/);
    await expect(page.locator(".equity-region-pill")).toContainText("5 equity regions");
    await expect(page.locator(".equity-region-pill .region-sparkline i")).toHaveCount(5);
    await expect(page.locator(".quality-card")).toHaveCount(0);
    await expect(page.locator(".logic-summary")).toContainText("Auto logic");
    await expect(page.locator(".strategy-context")).toContainText("Growth");
    await expect(page.locator(".mobile-jump")).toHaveAttribute("href", "#prompt-output");
    await expect(page.locator(".asset-section").locator("xpath=following-sibling::*[1]")).toHaveClass(/mobile-jump/);
    await expect(page.locator(".app-disclaimer")).toContainText("Disclaimer");
    await expect(page.locator(".version-note")).toContainText("Version 0.7");
    await page.locator('select[name="baseCurrency"]').selectOption("EUR");
    await expect(page.locator(".equity-region-pill")).toContainText("4 equity regions");
    await expect(page.locator(".equity-region-pill .region-sparkline i")).toHaveCount(4);
    await expect(page.locator(".hero-aside")).toContainText("Risk appetite");
    await expect(page.locator(".hero-aside")).toContainText("Investment horizon");
    await expect(page.locator(".hero-aside")).toContainText("Maximum equity weight");
    await expect(page.locator(".hero-aside")).not.toContainText("Exchange focus");
    await expect(page.locator(".hero-aside")).not.toContainText("Prompt mode");

    const prompt = await getPrompt(page);
    expect(prompt).toContain("Columns: Asset class | Target weight | ETF name | ISIN");
    expect(prompt).toContain("12. Include synthetic ETFs where they provide structural advantages");
    expect(prompt).toContain("13. Write the full answer in clear English.");
  });

  test("switches to German UI and German prompt output", async ({ page }) => {
    await openApp(page);

    await page.locator('select[name="outputLanguage"]').selectOption("German");

    await expect(page.locator(".field-label", { hasText: /^Risikoappetit$/ })).toBeVisible();
    await expect(page.locator(".field-label", { hasText: /^Anlagehorizont$/ })).toBeVisible();
    await expect(page.locator('select[name="outputLanguage"]')).toContainText("Englisch");
    await expect(page.locator('select[name="outputLanguage"]')).toContainText("Deutsch");
    await expect(page.locator('select[name="riskAppetite"]')).toContainText("Sehr hoch");
    await expect(page.locator('select[name="investmentHorizon"]')).toContainText(">=10 Jahre");

    const prompt = await getPrompt(page);
    expect(prompt).toContain("Spalten: Anlageklasse | Zielgewicht | ETF-Name | ISIN");
    expect(prompt).toContain("12. Beziehe synthetische ETFs ein");
    expect(prompt).toContain("13. Schreibe die vollständige Antwort in klarem Deutsch.");
  });

  test("updates equity allocation range when risk appetite changes", async ({ page }) => {
    await openApp(page);

    await page.locator('select[name="riskAppetite"]').selectOption("Low");
    await expect(page.locator(".range-group").first()).toContainText("25% to 45%");
    await expect(page.locator(".range-group").first().locator(".status-pill")).toHaveText("Auto");

    await page.locator('select[name="riskAppetite"]').selectOption("Balanced");
    await expect(page.locator(".range-group").first()).toContainText("55% to 75%");

    await page.locator('select[name="riskAppetite"]').selectOption("Very high");
    await expect(page.locator(".range-group").first()).toContainText("90% to 100%");
    await page.locator('button[data-step-target="equityMax"][data-step-direction="-5"]').click();
    await expect(page.locator(".range-group").first().locator(".status-pill")).toHaveText("Manual");

    await page.locator('select[name="riskAppetite"]').selectOption("Balanced");
    await expect(page.locator(".range-group").first()).toContainText("55% to 75%");
    await expect(page.locator(".range-group").first().locator(".status-pill")).toHaveText("Auto");

    await page.locator('button[data-step-target="equityMax"][data-step-direction="-5"]').click();
    await expect(page.locator(".range-group").first().locator(".status-pill")).toHaveText("Manual");
    await page.locator('button[data-action="restore-equity-auto"]').click();
    await expect(page.locator(".range-group").first()).toContainText("55% to 75%");
    await expect(page.locator(".range-group").first().locator(".status-pill")).toHaveText("Auto");
  });

  test("shows maximum equity warning only once until risk appetite changes", async ({ page }) => {
    const dialogs = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.accept();
    });

    await openApp(page);
    await page.locator('select[name="riskAppetite"]').selectOption("Low");

    await page.locator('button[data-step-target="equityMax"][data-step-direction="5"]').click();
    await expect.poll(() => dialogs.filter((message) => message.includes("appears too high")).length).toBe(1);

    await page.locator('button[data-step-target="equityMax"][data-step-direction="5"]').click();
    await page.waitForTimeout(250);
    expect(dialogs.filter((message) => message.includes("appears too high"))).toHaveLength(1);

    await page.locator('select[name="riskAppetite"]').selectOption("Moderate");
    await page.locator('button[data-step-target="equityMax"][data-step-direction="5"]').click();
    await expect.poll(() => dialogs.filter((message) => message.includes("appears too high")).length).toBe(2);
  });

  test("shows risk-horizon and empty-selection alerts", async ({ page }) => {
    const dialogs = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.accept();
    });

    await openApp(page);
    await page.locator('select[name="riskAppetite"]').selectOption("Very high");
    await page.locator('select[name="investmentHorizon"]').selectOption(">=5 years");
    await expect.poll(() => dialogs.some((message) => message.includes("Very high risk appetite"))).toBe(true);

    for (const checkbox of await page.locator('input[name^="asset:"]').all()) {
      if (await checkbox.isChecked()) await checkbox.click();
    }
    await expect.poll(() => dialogs.some((message) => message.includes("No asset classes selected"))).toBe(true);

    for (const checkbox of await page.locator('input[name^="section:"]').all()) {
      if (await checkbox.isChecked()) await checkbox.click();
    }
    await expect.poll(() => dialogs.some((message) => message.includes("No output sections selected"))).toBe(true);
  });

  test("USD hides home-bias guidance and removes the home-bias requirement", async ({ page }) => {
    await openApp(page);

    await page.locator('select[name="baseCurrency"]').selectOption("USD");

    await expect(page.locator('input[name="includeHomeBiasGuidance"]')).toHaveCount(0);
    const prompt = await getPrompt(page);
    expect(prompt).not.toContain("Address Swiss home bias");
    expect(prompt).toContain("- Base currency: USD");
  });

  test("updates preferred exchange in the prompt", async ({ page }) => {
    await openApp(page);

    await page.locator('select[name="exchange"]').selectOption("XETRA Deutsche Börse");
    await expect(page.locator(".hero-aside")).not.toContainText("XETRA Deutsche Börse");
    await expect(page.locator(".output-box")).toContainText("Prefer ETFs tradable on XETRA Deutsche Börse");

    await page.locator('select[name="exchange"]').selectOption("LSE London Stock Exchange");
    await expect(page.locator(".output-box")).toContainText("Prefer ETFs tradable on LSE London Stock Exchange");
  });

  test("reset restores defaults after parameter changes", async ({ page }) => {
    await openApp(page);

    await page.locator('select[name="baseCurrency"]').selectOption("USD");
    await page.locator('select[name="riskAppetite"]').selectOption("Low");
    await page.locator('select[name="exchange"]').selectOption("LSE London Stock Exchange");

    await page.locator('button[data-action="reset"]').click();

    await expect(page.locator('select[name="baseCurrency"]')).toHaveValue("CHF");
    await expect(page.locator('select[name="riskAppetite"]')).toHaveValue("High");
    await expect(page.locator('select[name="exchange"]')).toHaveValue("SIX Swiss Exchange");
    await expect(page.locator(".range-group").first()).toContainText("75% to 95%");
  });

  test("copy button writes the generated prompt to clipboard", async ({ page }) => {
    await page.addInitScript(() => {
      window.__copiedText = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            window.__copiedText = text;
          },
        },
      });
    });
    await openApp(page);

    await page.locator('button[data-action="copy"]').click();

    await expect(page.locator('button[data-action="copy"]')).toHaveText("Copied");
    const copiedText = await page.evaluate(() => window.__copiedText);
    expect(copiedText).toContain("Role:");
    expect(copiedText).toContain("Table 2: ETF implementation");
  });

  test("export buttons download txt and markdown prompt files", async ({ page }) => {
    await openApp(page);

    const txtDownloadPromise = page.waitForEvent("download");
    await page.locator('button[data-action="export-txt"]').click();
    const txtDownload = await txtDownloadPromise;
    expect(txtDownload.suggestedFilename()).toBe("portfolio-prompt-chf-high.txt");
    const txtPath = await txtDownload.path();
    expect(fs.readFileSync(txtPath, "utf8")).toContain("Role:");

    const mdDownloadPromise = page.waitForEvent("download");
    await page.locator('button[data-action="export-md"]').click();
    const mdDownload = await mdDownloadPromise;
    expect(mdDownload.suggestedFilename()).toBe("portfolio-prompt-chf-high.md");
    const mdPath = await mdDownload.path();
    expect(fs.readFileSync(mdPath, "utf8")).toContain("Table 2: ETF implementation");
  });

  test("ETF count buttons respect min/max boundaries in the UI and prompt", async ({ page }) => {
    await openApp(page);

    for (let index = 0; index < 8; index += 1) {
      await page.locator('button[data-step-target="maxEtfs"][data-step-direction="-1"]').click();
    }

    await expect(page.locator(".etf-count-group")).toContainText("8 to 8");
    await expect(page.locator(".output-box")).toContainText("Target exactly 8 positions");

    await page.locator('button[data-step-target="minEtfs"][data-step-direction="1"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("8 to 8");
  });

  test("ETF count auto-reduces with deselected asset classes until manual override", async ({ page }) => {
    await openApp(page);

    await page.locator('input[name="asset:cash"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("7 to 11");
    await expect(page.locator(".output-box")).toContainText("Target 7-11 positions");

    await page.locator('input[name="asset:bonds"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("6 to 10");
    await expect(page.locator(".output-box")).toContainText("Target 6-10 positions");

    await page.locator('input[name="asset:equities"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("1 to 5");
    await expect(page.locator(".output-box")).toContainText("Target 1-5 positions");

    await page.locator('button[data-step-target="minEtfs"][data-step-direction="1"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("2 to 5");
    await expect(page.locator(".etf-count-group").locator(".status-pill")).toHaveText("Manual");

    await page.locator('input[name="asset:crypto"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("2 to 5");

    await page.locator('button[data-action="restore-etf-auto"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("1 to 4");
    await expect(page.locator(".etf-count-group").locator(".status-pill")).toHaveText("Auto");

    await page.locator('button[data-action="reset"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("8 to 12");
    await expect(page.locator(".etf-count-group").locator(".status-pill")).toHaveText("Auto");

    await page.locator('input[name="asset:cash"]').click();
    await expect(page.locator(".etf-count-group")).toContainText("7 to 11");
  });

  test("uses exact wording when equity min and max are equal", async ({ page }) => {
    await openApp(page);

    for (let index = 0; index < 4; index += 1) {
      await page.locator('button[data-step-target="equityMax"][data-step-direction="-5"]').click();
    }

    await expect(page.locator(".range-group").first()).toContainText("75% to 75%");
    await expect(page.locator(".output-box")).toContainText("- Equity allocation: 75%");
    await expect(page.locator(".output-box")).not.toContainText("Equity allocation between 75% and 75%");
  });
});

test.describe("Responsive layout", () => {
  test("mobile viewport has usable controls without horizontal overflow", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only responsive smoke test.");

    await openApp(page);

    await expect(page.locator('button[data-step-target="minEtfs"][data-step-direction="-1"]')).toBeVisible();
    await expect(page.locator('button[data-step-target="maxEtfs"][data-step-direction="1"]')).toBeVisible();
    await expect(page.locator(".output-box")).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });
});
