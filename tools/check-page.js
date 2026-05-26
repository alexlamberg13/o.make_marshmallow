const fs = require("fs/promises");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const screenshotDir = path.join(root, "screenshots");
const url = "http://127.0.0.1:4173/index.html?v=14";

async function checkViewport(browser, name, width, height) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: width < 600,
  });

  const messages = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) {
      messages.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));

  await page.goto(url, { waitUntil: "load", timeout: 15000 });
  await page.waitForTimeout(900);

  const metrics = await page.evaluate(() => {
    const strip = document.querySelector(".gift-strip");
    const hero = document.querySelector(".hero");
    const buttons = [...document.querySelectorAll(".button, .header-cta, .selector-group button")];
    const stripRect = strip.getBoundingClientRect();
    const heroRect = hero.getBoundingClientRect();

    return {
      viewport: {
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      },
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      loadedImages: [...document.images].filter((image) => image.complete && image.naturalWidth > 0).length,
      totalImages: document.images.length,
      nextHintVisible: stripRect.top < window.innerHeight && stripRect.bottom > 0,
      stripTop: Math.round(stripRect.top),
      heroHeight: Math.round(heroRect.height),
      heroStageVisible: !!document.querySelector(".hero-stage") && document.querySelector(".hero-stage").getBoundingClientRect().height > 120,
      depthCards: document.querySelectorAll(".depth-card").length,
      overflowingButtons: buttons
        .filter((button) => button.scrollWidth > button.clientWidth + 1)
        .map((button) => button.textContent.trim()),
    };
  });

  const screenshotPath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: false });

  const sectionScreenshots = {};
  if (name === "desktop-1440") {
    await page.locator("#collections").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    sectionScreenshots.collections = path.join(screenshotDir, "desktop-collections.png");
    await page.screenshot({ path: sectionScreenshots.collections, fullPage: false });
  }

  const interactions = {};
  if (width < 600) {
    await page.locator("[data-menu-toggle]").click();
    interactions.mobileMenuOpens = await page.evaluate(() => document.body.classList.contains("menu-open"));
    await page.locator("[data-mobile-nav] a[href='#gift-finder']").click();
    interactions.mobileMenuCloses = await page.evaluate(() => !document.body.classList.contains("menu-open"));
  }

  await page.locator(".selector-group[data-group='format'] button[data-value='вечірній букет']").click();
  interactions.giftFinderUpdates = await page.evaluate(() =>
    document.querySelector("[data-result-title]").textContent.includes("Вечірній букет"),
  );

  await page.close();

  return { name, width, height, metrics, interactions, messages, screenshotPath, sectionScreenshots };
}

async function main() {
  await fs.mkdir(screenshotDir, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--disable-background-networking", "--disable-component-update", "--disable-sync", "--no-first-run"],
  });

  const checks = [
    await checkViewport(browser, "desktop-1440", 1440, 900),
    await checkViewport(browser, "laptop-1280", 1280, 720),
    await checkViewport(browser, "tablet-768", 768, 1024),
    await checkViewport(browser, "mobile-390", 390, 844),
    await checkViewport(browser, "mobile-430", 430, 932),
  ];

  await browser.close();
  console.log(JSON.stringify(checks, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
