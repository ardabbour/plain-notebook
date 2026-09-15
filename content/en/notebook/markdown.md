---
title: The writing guide
navTitle: Writing guide
translationKey: markdown
description: Plain text, with a few useful possibilities.
order: 20
---
Every page begins as a Markdown file. Write in any text editor, add it to the content folder, and build your site. The sidebar, breadcrumbs, and page outline follow along.

Explore the [Markdown playground](./playground.md) for examples with source, or try [equations and diagrams](./technical-notes.md).

## Start a page

Create `content/en/notebook/my-first-note.md`:

```markdown
---
title: My first note
translationKey: first-note
description: Something worth remembering.
order: 30
---
A thought, written down.

## A little more detail

Follow it wherever it goes.
```

The title is the page heading. `order` sets its position in the sidebar. To group pages, create a folder with an `index.md` inside it. Add `draft: true` to keep a page out of the published site.

## Connect your thoughts

**Bold** for emphasis. *Italics* for a little nuance. ~~A crossed-out thought~~ for a change of mind. Use [ordinary links](../about.md) to send a reader somewhere useful.

```markdown
[About me](../about.md)
[A section on this page](#start-a-page)
```

Relative links to `.md` files become website links when you build. A missing page makes the build fail so you can fix the link before publishing.

## Lists and small plans

- A notebook can hold an unfinished idea.
- A list can be a useful page all by itself.
  - Nested thoughts work, too.

- [x] Make a place to write.
- [x] Add a first page.
- [ ] See where it goes.

Task lists reflect what you wrote in Markdown. Change the source file to check an item off.

## A little structure

| Use this | For this |
| --- | --- |
| A heading | A new part of the thought |
| A list | A few related things |
| A table | A comparison worth scanning |
| A footnote | A useful aside[^aside] |

[^aside]: Footnotes keep the main thought moving while leaving room for a little more detail.

::: note Worth remembering
A page doesn’t have to use every feature. Start with the words, then add what helps.
:::

Write a callout using `::: note`, `::: tip`, or `::: warning`, an optional title, the text, and a closing `:::`.

::: details What about expandable sections?
These use native HTML details. They work with a keyboard and without JavaScript.

```markdown
::: details A question or a little more context
The longer explanation goes here.
:::
```
:::

## Code and images

Add a language after the opening triple backticks to highlight code. Highlighting happens during the build.

```js
const notebook = {
  title: 'A place to think',
  pages: ['A beginning', 'Another thought'],
};
```

Put your images in `public/images/` and link to them with meaningful alternative text:

```markdown
![Describe what matters in the image](/images/your-photo.jpg)
```

Keep images reasonably sized. Everything in `public/` is copied to the published site. Raw HTML in Markdown is displayed as text; use the supported Markdown features for formatting.

## Another language

Add a translation under `content/ar/`, using the **same `translationKey`**. Its filename and title can be different. The language menu will connect the two pages.

Arabic pages read from right to left. Navigation and spacing follow the reading direction, while code stays left to right. If a translation doesn’t exist, the menu says so and offers that language’s homepage.

To add another language, add its identity, reading direction, and translated interface labels in `site.config.js`, then create its homepage.

## Make it yours

Change your name, description, and languages in `site.config.js`. Replace these example pages. Then run:

```sh
npm install
npm run dev
npm run build
```

The built site lives in `dist/`. It can be served by an ordinary static web host. See the project README for configuration, subdirectory hosting, and deployment details.
