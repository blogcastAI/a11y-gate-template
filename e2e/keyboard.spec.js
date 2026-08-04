import { test, expect } from "@playwright/test";

/**
 * Keyboard operability — the half axe cannot do.
 *
 * axe inspects the accessibility tree of a static render. It cannot detect
 * keyboard traps, broken focus order, invisible focus indicators, or
 * controls that respond to click but not to Enter/Space. Those need a real
 * browser walking the tab ring — which is what this spec does.
 *
 * The assertions below run against the bundled demo page. Adapt the
 * selectors and the interactive-control test to your own UI; keep the three
 * categories: (1) tab-ring integrity, (2) control operability, (3) visible
 * focus.
 */

/** The active element's identity, read synchronously (never auto-waits). */
async function activeInfo(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { tag: "body", text: "" };
    return {
      tag: el.tagName.toLowerCase(),
      text: (el.textContent || el.getAttribute("aria-label") || "").trim(),
    };
  });
}

/** True when the focused element renders a visible outline or shadow ring. */
async function focusedHasVisibleRing(page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const style = getComputedStyle(el);
    const outlineVisible =
      style.outlineStyle !== "none" &&
      parseFloat(style.outlineWidth) > 0 &&
      style.outlineColor !== "transparent" &&
      !/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)$/.test(style.outlineColor);
    const shadowVisible = style.boxShadow !== "none" && style.boxShadow !== "";
    return outlineVisible || shadowVisible;
  });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("tab ring is walkable end to end — no keyboard trap", async ({ page }) => {
  // Walk up to 50 stops. Every stop must be a real element; returning to
  // <body> is the legitimate end of the ring. Revisiting the same element
  // forever (a trap) exhausts the budget and fails.
  const seen = [];
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press("Tab");
    const info = await activeInfo(page);
    if (info.tag === "body") break;
    seen.push(`${info.tag}:${info.text}`);
  }
  expect(seen.length, "the page must expose at least one focusable element").toBeGreaterThan(0);
  expect(seen.length, "tab walk must terminate (no keyboard trap)").toBeLessThan(50);
});

test("first Tab lands on the skip link", async ({ page }) => {
  await page.keyboard.press("Tab");
  const info = await activeInfo(page);
  expect(info.text, "the first focus stop should be the skip link").toContain("Skip to main content");
});

test("interactive controls are operable with the keyboard", async ({ page }) => {
  // The demo form: fill the email field, activate Subscribe with Enter, and
  // require the status region to announce the result. Replace with your own
  // primary user action.
  await page.locator("#email").focus();
  await page.keyboard.type("user@example.com");
  await page.locator("button[type=submit]").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#form-status")).toContainText("subscribed");
});

test("every focusable element shows a visible focus indicator", async ({ page }) => {
  const failures = [];
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press("Tab");
    const info = await activeInfo(page);
    if (info.tag === "body") break;
    if (!(await focusedHasVisibleRing(page))) {
      failures.push(`${info.tag}: "${info.text}"`);
    }
  }
  expect(failures, "elements missing a visible focus ring").toEqual([]);
});
