import { defineConfig, devices } from "@playwright/test";

/**
 * Four viewport projects — the core of the methodology.
 *
 * Accessibility failures are frequently viewport-specific:
 * - 320×568  — the smallest supported phone. Reflow failures (WCAG 1.4.10),
 *              horizontal scroll, overlapping tap targets, and controls
 *              pushed out of the layout appear ONLY here.
 * - 768×1024 — tablet. Layout-switch breakpoints often drop focus order or
 *              hide controls behind disclosure widgets.
 * - 1280×800 — the laptop size most single-viewport scans use. Necessary,
 *              not sufficient.
 * - 3840×2160 — 4K. Low-density layouts spread content: focus indicators
 *              get visually lost, hover-only affordances drift far from
 *              their triggers, spacing bugs surface.
 *
 * A violation at ANY size fails the gate.
 */
const PORT = Number(process.env.A11Y_PORT ?? 8901);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    { name: "mobile-320", use: { ...devices["Desktop Chrome"], viewport: { width: 320, height: 568 } } },
    { name: "tablet-768", use: { ...devices["Desktop Chrome"], viewport: { width: 768, height: 1024 } } },
    { name: "laptop-1280", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "uhd-3840", use: { ...devices["Desktop Chrome"], viewport: { width: 3840, height: 2160 } } },
  ],

  // Swap this for your real server: a framework dev server, a preview build,
  // anything that answers on baseURL before tests start.
  webServer: {
    command: "node e2e/serve.mjs",
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
    env: { A11Y_PORT: String(PORT) },
  },
});
