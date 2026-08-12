# a11y-gate-template

A template repository for a **merge-blocking accessibility CI gate**: axe-core
WCAG 2.1 A/AA scans at four viewports plus keyboard operability e2e, wired as
a required GitHub Actions check.

Use the **"Use this template"** button, point the specs at your pages, and
mark the `gate` job required on your default branch. A second job shows the
same axe battery as a single step via the packaged
[`blogcastAI/a11y-gate-action`](https://github.com/blogcastAI/a11y-gate-action)
— use that shape if you don't need the keyboard layer or the Node tooling.

## What this does NOT do

Read this section first, because the biggest failure mode of accessibility
tooling is overclaiming.

- **Automated checks catch only a fraction of WCAG failures.** Widely cited
  studies put automated coverage at somewhere around a third to a half of
  success criteria, and even "covered" criteria are only partially detectable.
  A green run means *no violations the tools can detect on the pages you
  listed* — nothing more.
- **A green gate does not make your site accessible**, does not make it
  WCAG-conformant, and is not evidence for any legal-compliance claim (ADA,
  EAA, Section 508, or otherwise). Never cite this gate in marketing or legal
  copy.
- **It cannot judge quality of meaning**: whether alt text is *useful*,
  whether headings *describe* their sections, whether the reading order makes
  *sense*, whether captions are *accurate*. Only humans — ideally including
  assistive-technology users — can.
- **What it IS for:** blocking a class of *regressions*. Once your pages pass,
  nobody can merge a change that reintroduces a detectable violation, a
  keyboard trap, or an invisible focus state. That guarantee is narrow, real,
  and worth enforcing.

## Why this shape

### Why four viewports (320 / 768 / 1280 / 4K)

Most CI a11y scans run once, at a laptop-ish viewport. But accessibility
failures are frequently **viewport-specific**:

- **320×568** — reflow (WCAG 1.4.10). Content that overflows horizontally,
  controls that overlap or leave the layout, tap targets that collide — all
  invisible at 1280px.
- **768×1024** — breakpoint switches. Nav collapses into disclosure widgets
  here; focus order and name/role/value of the collapsed variant are
  frequently broken while the desktop variant is fine.
- **1280×800** — the size everyone already tests. Necessary, not sufficient.
- **3840×2160** — density. Layouts spread out; focus indicators become tiny
  in a huge field, related controls drift apart, spacing bugs appear.

Every spec in this template runs at all four sizes. A violation at **any**
size fails the gate.

### Why keyboard e2e is co-equal with axe

axe inspects the accessibility tree of a rendered page. It **cannot see**:

- keyboard traps (focus enters a widget and never leaves),
- broken focus order,
- focus indicators that exist in CSS but are visually imperceptible,
- controls that respond to click but not to Enter/Space,
- skip links that don't actually move focus.

Those are exactly the failures that make a page *unusable* for keyboard and
switch users, and they need a real browser walking the tab ring. That is
`e2e/keyboard.spec.js`. Treat it as a peer of the axe scan, not an add-on.

### Why merge-blocking beats advisory

An advisory report is read once and ignored forever; the tenth "12 violations
(same as last week)" comment trains everyone to scroll past it. A **required
status check** changes the default: the violation is fixed in the PR that
introduced it, while the author still has context. If your pages currently
fail, fix them first or start the gate as advisory (`continue-on-error: true`)
with a dated commitment to flip — but flip.

## Quick start

```bash
# 1. Create your repo from this template (GitHub: "Use this template")
# 2. Install and run locally
npm ci
npx playwright install chromium
npm test
```

Then:

1. **Point the server at your site.** `e2e/serve.mjs` serves the bundled
   `demo/` page. Set `SERVE_DIR` to your build output, or replace
   `webServer.command` in `playwright.config.js` with your dev server.
2. **List your pages** in `e2e/a11y.spec.js` — every route AND every
   meaningfully distinct state (open dialog, error summary, empty state).
3. **Adapt the keyboard spec** — keep the three categories: tab-ring
   integrity, control operability, visible focus.
4. **Make it required:** Settings → Branches → protect your default branch →
   require the `a11y gate (axe 4-viewport + keyboard)` check.
5. *(React only, optional)* enable the jsx-a11y static lint layer — see
   `eslint.config.example.mjs`.

## What's in the box

| File | Purpose |
|---|---|
| `.github/workflows/a11y-gate.yml` | The gate: axe 4-viewport + keyboard e2e, report artifact on failure |
| `playwright.config.js` | The four viewport projects + webServer wiring |
| `e2e/a11y.spec.js` | axe WCAG 2.1 A/AA scan loop over your page list |
| `e2e/keyboard.spec.js` | Keyboard trap / skip-link / operability / visible-focus checks |
| `e2e/serve.mjs` | Dependency-free static server (replace with your own) |
| `demo/index.html` | Self-contained demo page so the template's own CI is green |
| `eslint.config.example.mjs` | Optional jsx-a11y static layer (React only) |

## Excluding third-party content

If a page embeds cross-origin iframes (video players, maps, payment widgets),
exclude them from the scan — axe cannot audit documents you don't control:

```js
new AxeBuilder({ page }).exclude("iframe[src*='youtube']")
```

Excluding your OWN components to get to green defeats the gate. Don't.

## Provenance

Extracted from the accessibility CI gate developed for perks.locker
(WCAG 2 AA + keyboard + 320px–4K as a PR-blocking check) and generalized.
Related: an upstream contribution bringing the same methodology to
[Able Player](https://github.com/ableplayer/ableplayer)'s demo pages.

## License

MIT — see [LICENSE](LICENSE).
