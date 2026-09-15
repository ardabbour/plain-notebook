# Plain Notebook 1.0.0

Released on September 15, 2026.

- [Permanent demo](https://plain-notebook.ardabbour.workers.dev/en/)
- [GitHub template](https://github.com/ardabbour/plain-notebook)
- [Version 1.0.0 and downloads](https://github.com/ardabbour/plain-notebook/releases/tag/v1.0.0)

## What changed

- Added the MIT license and a GitHub Actions workflow.
- Separated private feature-test fixtures from the owner's content. Replacing starter pages or removing their languages no longer invalidates demo-specific assertions.
- Added `npm run check` to validate the actual site's local links, assets, search indexes, heading anchors, IDs, and document structure.
- Added French-language, deeply nested, long-page, draft, failure-recovery, and large-notebook cases.
- Reserved page-control and footnote IDs when generating heading anchors.
- Added clearer configuration/frontmatter validation and preserved query strings when the preview server redirects directory URLs.
- Added Chromium, Firefox, and WebKit browser projects, plus a reusable live-deployment smoke test.
- Added an optional Cloudflare static-assets configuration and documented permanent deployment.
- Published the public GitHub template and permanent Cloudflare demo, with canonical URLs, language alternates, sitemap, and robots.txt. `SITE_URL` configures the deployment origin without hardcoding the demo's address into template copies.

## Verification

| Check | Result |
| --- | --- |
| Static/authoring suite | 14 tests passed on Node 24 |
| Supported runtime | Node 22 checks passed |
| Browser suite | 24 tests passed: 8 each in Chromium, Firefox, and WebKit |
| Real starter-site validation | 15 content pages; 19 HTML documents checked |
| Large notebook | 197 pages, four nested groups, a 30-section article |
| Clean installation | Fresh `npm ci`; all starter content replaced with a two-page French-only notebook at `/carnet`; static checks, content validation, and 8 Chromium feature tests passed |
| Automated accessibility | No axe WCAG 2 A/AA or 2.1 AA violations in the tested fixture states across the three engines |
| Live hosting | Cloudflare Workers Static Assets; 15 content pages, 21 page/asset/index URLs, MIME types, and localized 404s verified |
| Live browser smoke | Themes and persistence, search, mobile menus, both shipped languages, and no-JavaScript reading passed in all three engines |
| Hosted GitHub Actions | All five jobs passed: Node 22/24 and Chromium/Firefox/WebKit |
| Permanent deployment integrity | All 26 deployed files matched the validated release byte for byte; canonical URLs, sitemap, and robots.txt verified |

The permanent demo is hosted in the owner's Cloudflare account at https://plain-notebook.ardabbour.workers.dev. It uses Workers Static Assets without a Worker script or paid add-on. Its initial release was uploaded through the Cloudflare API using the asset routing settings in `wrangler.jsonc`; subsequent deployments can use Wrangler 4.132.0 as documented in README.md. The earlier temporary preview has been superseded. Credentials are excluded from the repository and release archives.

The [initial hosted CI run](https://github.com/ardabbour/plain-notebook/actions/runs/35019416002) passed all five jobs. Each subsequent source push runs the same checks.

## Release boundaries

- This is a file-based personal-site template. A visual editor/CMS is outside the agreed v1 scope.
- WebKit is tested through Playwright; this is not a claim of testing every Safari version or physical iPhone. System font rendering varies between engines.
- Automated accessibility checks supplement keyboard and layout tests; they do not establish full accessibility conformance or replace assistive-technology user testing.
- The 197-page scenario establishes that tested size, not an unlimited capacity claim. Search loads a locale's whole index on demand.
- Publishing updates is a documented manual command. Automatic redeployment is not enabled: the Cloudflare account's GitHub integration needs reconnection, and the connected API cannot create a deployment credential. This does not affect the permanent site's availability or GitHub's automated tests.

See README.md for customization, commands, and hosting instructions. The distributable source archive includes the example content, tests, CI workflow, license, and documentation; installed dependencies, generated screenshots, build output, and credentials are excluded.
