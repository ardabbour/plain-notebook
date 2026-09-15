# Plain Notebook 1.0.0

Release-readiness pass completed on September 15, 2026.

## What changed

- Added the MIT license and a GitHub Actions workflow.
- Separated private feature-test fixtures from the owner's content. Replacing starter pages or removing their languages no longer invalidates demo-specific assertions.
- Added `npm run check` to validate the actual site's local links, assets, search indexes, heading anchors, IDs, and document structure.
- Added French-language, deeply nested, long-page, draft, failure-recovery, and large-notebook cases.
- Reserved page-control and footnote IDs when generating heading anchors.
- Added clearer configuration/frontmatter validation and preserved query strings when the preview server redirects directory URLs.
- Added Chromium, Firefox, and WebKit browser projects, plus a reusable live-deployment smoke test.
- Added an optional Cloudflare static-assets configuration and documented permanent deployment.

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

The successful Cloudflare deployment used Wrangler 4.132.0 and configuration `wrangler.preview.jsonc`. The preview URL was https://plain-notebook-preview.meteor-partridge.workers.dev. It belongs to a temporary preview account and may expire; its continued availability is not a release guarantee. Account claim credentials are deliberately excluded from this repository.

## Release boundaries

- This is a file-based personal-site template. A visual editor/CMS is outside the agreed v1 scope.
- WebKit is tested through Playwright; this is not a claim of testing every Safari version or physical iPhone. System font rendering varies between engines.
- Automated accessibility checks supplement keyboard and layout tests; they do not establish full accessibility conformance or replace assistive-technology user testing.
- The 197-page scenario establishes that tested size, not an unlimited capacity claim. Search loads a locale's whole index on demand.
- CI is configured and its build/test commands passed locally. This workspace has no GitHub repository/remote, so a hosted Actions run has not occurred. The workflow activates when the source is pushed to a GitHub repository with Actions enabled.
- Permanent hosting requires an authenticated host account and chosen site name/domain. The temporary public deployment fulfilled deployment verification; it is not a permanent production site.

See README.md for customization, commands, and hosting instructions. The distributable source archive includes the example content, tests, CI workflow, license, and documentation; installed dependencies, generated screenshots, build output, and credentials are excluded.
