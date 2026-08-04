import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * axe-core WCAG 2.1 A/AA scans.
 *
 * List every page (and every meaningfully distinct STATE of a page — open
 * dialog, expanded menu, error summary, empty state) here. Scanning only
 * the default render of the homepage is how regressions slip through.
 *
 * If a page embeds third-party iframes (video players, maps, payment
 * widgets), exclude them: axe cannot audit cross-origin documents, and
 * their violations are not yours to fix from this repo. Example:
 *   new AxeBuilder({ page }).exclude("iframe[src*='youtube']")
 */
const PAGES = [
  { path: "/", name: "demo page" },
  // Add your routes here:
  // { path: "/pricing", name: "pricing" },
  // { path: "/signup?state=error", name: "signup with error summary" },
];

for (const { path, name } of PAGES) {
  test(`${name} (${path}) — zero axe WCAG 2.1 A/AA violations`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok(), `expected ${path} to serve 2xx`).toBeTruthy();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    // Fail with a compact, reviewable summary instead of a JSON dump.
    const summary = results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s) — ${v.help}`,
    );
    expect(summary, `axe violations on ${path}`).toEqual([]);
  });
}
