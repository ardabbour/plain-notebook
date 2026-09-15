# Plain notebook

A personal website that reads like a public notebook. Write Markdown, connect pages, publish ordinary HTML.

[Live demo](https://plain-notebook.ardabbour.workers.dev/en/) · [Use this template](https://github.com/new?template_name=plain-notebook&template_owner=ardabbour) · [Releases](https://github.com/ardabbour/plain-notebook/releases)

Includes nested navigation, breadcrumbs, page outlines, optional page search, light/dark/system themes, and English/Arabic example content. Reading, navigation, language switching, and expandable sections work without JavaScript. No framework, account, database, external font, or hosting service is required at runtime.

## Start

Install [Node.js](https://nodejs.org/) 22 or newer. Choose **Use this template** above to create your own repository, then clone it and run these commands inside it:

```sh
npm ci
npm run dev
```

Open **http://localhost:4321**. Changes to content, styles, configuration, and public assets rebuild the site; refresh the browser to see them. A broken Markdown link fails the build with the source filename, while the development server keeps the last successful output.

```sh
npm run build    # Generate dist/
npm run preview  # Serve the built site locally
npm test         # Check pages, links, translations, Markdown, and base paths
npm run check    # Build and validate your actual content, assets, and anchors
```

Set `PORT=3000` if port 4321 is already in use. The local server listens on loopback only.

For browser checks, run `npx playwright install chromium firefox webkit`, then `npm run test:browser`. These exercise navigation, themes, search, RTL, no-JavaScript use, mobile layout, and automated accessibility checks in all three engines. They start a temporary test notebook on port 4322; your local site on port 4321 is untouched. To run one engine, use `npm run test:browser -- --project=firefox`.

## Make it yours

1. Edit **site.config.js**: name, tagline, description, footer, and languages.
2. Replace the example files in **content/** with your own Markdown.
3. Put images and downloads in **public/**. Everything there is published.
4. Set `url` to your public origin (e.g. `https://example.com`), or set the `SITE_URL` environment variable when building, for canonical URLs, language alternates, a sitemap, and robots.txt.
5. Build and publish **dist/** to any static host.

All biographical and project copy is labeled example content. No personal details are assumed. This is a file-based template; editing requires a text editor and a local build or build-capable host. A visual CMS is not included.

## Pages and navigation

```text
content/
  en/
    index.md                  → /en/
    about.md                  → /en/about/
    notebook/
      index.md                → /en/notebook/
      my-note.md              → /en/notebook/my-note/
  ar/
    index.md                  → /ar/
    ...
```

Every folder containing nested pages needs an `index.md`. A folder becomes an expandable navigation group. Navigation order is determined by `order`, then title. `/` points to the configured default language.

```yaml
---
title: My first note
navTitle: First note          # Optional short sidebar label
translationKey: first-note    # Required stable identity across translations
description: An idea worth keeping.
order: 30                    # Smaller numbers come first; default 100
date: 2026-09-15              # Optional publication date
toc: true                    # Optional; false hides the page outline
showChildren: true            # Optional; false hides child-page links
draft: false                 # Set true to exclude this file from publication
---
```

Keep frontmatter dates explicit. An omitted date produces no date label; builds do not invent an update date. The page title supplies the single `h1`; Markdown headings start at `h2`. Drafts are omitted from pages, navigation, search, and the sitemap. Links to drafts fail the build.

Use letters, digits, hyphens, or underscores in filenames. Paths can be non-Latin. A page's URL follows its filename, so changing a filename changes its URL. Add host-level redirects when moving published pages. Do not give `index.md` and a neighboring page the same resulting URL or translation key.

## Markdown

Supports headings, links, images, emphasis, strikethrough, tables, nested lists, read-only task lists, footnotes, syntax-highlighted code, and these containers:

```markdown
::: note Optional title
A useful aside. `tip` and `warning` work too.
:::

::: details Expand this section
The longer explanation.
:::
```

Relative links such as `[My note](./my-note.md)` are resolved at build time. Link to page sections with `#heading-text`. Heading anchors support Unicode, and duplicate headings get numeric suffixes. Reference an image with `![Meaningful description](/images/photo.jpg)` after putting it in `public/images/`.

Headings that would collide with page controls or footnotes also receive numeric suffixes (for example, `Content` becomes `content-2`). Use `npm run check` before publishing to catch broken heading links and missing local images, in addition to missing pages.

Raw HTML is escaped; arbitrary MDX/JavaScript components are intentionally outside this Markdown format. Syntax highlighting happens during the build. External images and links remain external. Optimize your images before publishing. The writing guide in the example notebook demonstrates the rendered features.

## Languages and RTL

Translations share a `translationKey`, not a filename. The language menu keeps the current page when a translation exists. When one is missing, the menu labels it unavailable and separately offers that language's homepage. The English-only “A quieter web” page demonstrates this state.

To add a language:

1. Add an entry under `locales` in **site.config.js**, with `label`, `dir` (`ltr` or `rtl`), `name`, `tagline`, `description`, and `footer`.
2. Add a `ui` object overriding the keys listed in **src/i18n.js**. Unspecified interface labels fall back to English.
3. Create `content/<locale>/index.md` and the pages you want translated.

The document sets `lang` and `dir`; logical CSS mirrors navigation, padding, and borders. Code blocks stay LTR, language names use their own direction, and dates and search counts use the current locale. English and Arabic ship with translated interface labels. Content is never automatically machine-translated at runtime.

## Themes and search

System mode follows the browser's color-scheme preference automatically. An explicit light or dark choice is saved in localStorage. If storage is blocked, the choice still works during that page visit. Without JavaScript, the system theme works through CSS and the theme selector is hidden.

On mobile, JavaScript initially collapses the page menu. Without JavaScript it starts expanded, and its native disclosure still lets readers collapse it.

Search is a small optional enhancement. Each locale's index loads only after a visitor enters a query. It searches titles, descriptions, and content; title matches rank first. Press `/` to focus search, `ArrowDown` to move to the first result, and `Escape` to dismiss it. Loading, no-results, and failure messages are localized. For a very large notebook, replace the whole-index search with a dedicated static search tool.

## Hosting

Publish the **contents of dist/**. On a host with build settings, use `npm ci && npm run build` and output directory `dist`. No server process is needed in production.

For a subdirectory such as `https://example.com/notes/`:

```js
url: 'https://example.com',
basePath: '/notes',
```

Navigation, assets, search, content links, canonical links, and the sitemap all use that prefix. Configure the host to serve the output at the same path. Your host should serve directory `index.html` files and use **404.html** for missing pages. Localized error documents also exist at **en/404.html** and **ar/404.html**; locale-specific routing depends on your host.

Hashed CSS and JavaScript filenames support asset caching. Set cache headers at the host; the included local preview server deliberately avoids caching. There is no analytics or remote tracking code.

### Cloudflare example

The optional **wrangler.jsonc** serves `dist/` with directory URLs and localized 404 documents. It was tested with Wrangler 4.132.0. Choose a worker name in that file, then:

```sh
SITE_URL=https://your-worker.your-account.workers.dev npm run check
npx wrangler@4.132.0 login
npx wrangler@4.132.0 deploy
```

After the first login, publish future changes by repeating the check and deploy commands. The bundled CI workflow validates changes; it does not deploy them. For automatic publishing, connect your repository through Cloudflare's Git integration and configure `npm run check` as the build command, `npx wrangler@4.132.0 deploy` as the deploy command, and `SITE_URL` as your site's origin. That integration requires a separate GitHub connection in your Cloudflare account.

The demo uses a permanent `workers.dev` address and static assets only. No paid plan or domain purchase is needed for this setup. [Static asset requests are free and unlimited](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), subject to file limits. [Standard GitHub Actions runners are free for public repositories](https://docs.github.com/en/actions/concepts/billing-and-usage). Private repositories and optional services have their own allowances.

The provided Cloudflare configuration assumes `basePath: ''`. For subdirectory deployment, mount the output at the corresponding directory on the host. The template's URL-prefix behavior is covered by the build checks.

To smoke-test a deployed copy of the current local build:

```sh
npm run test:deployment -- https://your-host.example
```

This checks each page and referenced asset/index, MIME types, localized 404s, then themes, search, mobile navigation, and no-JavaScript reading in all three browser engines. Install the Playwright browsers first. The deployed content must match the current local `dist/`.

Cloudflare also offers [temporary preview accounts](https://developers.cloudflare.com/workers/platform/claim-deployments/), which expire unless claimed within 60 minutes. These are useful for deployment verification; use an authenticated account for permanent hosting. Never put an account claim URL or deployment credentials in this repository.

## Tests and CI

Feature tests generate their own private fixture content under the operating system's temporary directory. You can delete or replace every example page, change the default language, or remove English and Arabic without breaking tests that expect the demo's titles. A separate generic check validates the content you actually intend to publish.

The suite covers a French third language, a French-only customized installation, a 197-page fixture, deep navigation, long articles, draft exclusion, missing translations, code-direction isolation, and failed-build recovery. The complete release evidence and test limits are in **RELEASE.md**.

**.github/workflows/ci.yml** runs on pushes, pull requests, and manual dispatch after this template is placed in a GitHub repository with Actions enabled. It checks Node 22 and 24, builds and validates your content, and runs Chromium, Firefox, and WebKit in separate jobs. Failed browser checks upload diagnostic artifacts. No deployment secrets are needed; the workflow does not publish your site.

## License

The template code and supplied example content use the [MIT license](LICENSE). Keep its notice when distributing the template. Your own writing and images can have their own license; third-party dependencies retain theirs.

## Project map

| File | Purpose |
| --- | --- |
| `site.config.js` | Owner identity, languages, public URL |
| `content/` | Your Markdown pages |
| `public/` | Assets copied to the site |
| `src/build.js` | Content validation, routes, static output |
| `src/markdown.js` | Markdown rendering and extensions |
| `src/template.js` | Semantic page shell and navigation |
| `src/styles.css` | Layout, themes, typography, print styles |
| `src/client.js` | Theme preference and optional search |
| `src/i18n.js` | Default interface translations |
| `src/check.js` | Generic release validation for your own content |
| `tests/fixtures.js` | Private example-independent feature-test content |
| `.github/workflows/ci.yml` | Node and browser CI checks |
| `wrangler.jsonc` | Optional static Cloudflare deployment configuration |

Rendering uses [Markdown-it](https://github.com/markdown-it/markdown-it), its footnote/container plugins, and build-time [Highlight.js](https://highlightjs.org/). See **package-lock.json** for exact dependency versions. The design takes the readability and lightweight principles discussed at [Motherfucking Website](https://motherfuckingwebsite.com/).
