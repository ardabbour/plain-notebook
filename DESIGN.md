---
name: Personal Notebook
description: Quiet paper surfaces, linked prose, and native navigation.
colors:
  paper: "#fdfcf9"
  sidebar: "#f5f4ef"
  ink: "#282b25"
  muted: "#696c62"
  line: "#e2e3da"
  accent: "#3e6244"
  selected: "#e8ece2"
  code: "#f0f0e9"
  focus: "#54713c"
  syntax: "#845328"
  dark-paper: "#1c1f1b"
  dark-sidebar: "#171a16"
  dark-ink: "#e4e7dd"
  dark-muted: "#a5ae9f"
  dark-line: "#363c32"
  dark-accent: "#adc99b"
  dark-selected: "#303b2b"
  dark-code: "#262c23"
  dark-focus: "#bdd8a4"
  dark-syntax: "#d9ad82"
typography:
  display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(34px, 3.5vw, 48px)"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-.035em"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans Arabic", Arial, sans-serif'
    fontSize: "16px"
    lineHeight: 1.85
  headline:
    fontSize: "21px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-.025em"
  title:
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.25
  label:
    fontSize: "12px"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "13px"
    lineHeight: 1.8
rounded:
  focus: "2px"
  inline-code: "3px"
  panel: "4px"
components:
  navigation-link:
    textColor: "{colors.muted}"
    rounded: "{rounded.panel}"
    padding: "7px 10px"
  navigation-link-current:
    backgroundColor: "{colors.selected}"
    textColor: "{colors.ink}"
  search-input:
    typography: "{typography.label}"
    padding: "7px 3px"
  callout:
    backgroundColor: "{colors.sidebar}"
    rounded: "{rounded.panel}"
    padding: "18px 21px"
  code-block:
    backgroundColor: "{colors.code}"
    typography: "{typography.mono}"
    rounded: "{rounded.panel}"
    padding: "19px 21px"
  prose-disclosure:
    padding: "14px 20px"
  child-page-link:
    padding: "17px 0"
---

# Design System: Personal Notebook

## Overview

**Creative North Star: "Personal Notebook"**

A quiet, text-first personal notebook uses paper surfaces, linked prose, and a page tree. Native fonts and controls keep it portable; modest hierarchy and thin separators help readers find their place. The user approved this restrained visual direction and native serif titles.

**Key Characteristics:**

- Warm paper and restrained green links.
- A readable document column beside nested navigation.
- Native disclosures, visible focus, and mirrored reading direction.
- Light, dark, and system appearance without authored animation.

## Colors

The palette pairs warm neutral surfaces with a muted green accent; dark mode preserves the same roles with lighter text and accents.

### Primary

- **Notebook green — accent:** prose links, identity icon, callout titles, and syntax keywords.
- **Focus green — focus:** keyboard outlines.
- **Warm syntax — syntax:** strings, numbers, attributes, and code titles; this is a code role, not a second interface accent.

### Neutral

- **Paper — paper:** reading surface and open preference/search panels.
- **Sidebar paper — sidebar:** navigation, callouts, and table headings.
- **Ink — ink; muted ink — muted:** main content versus supporting navigation, metadata, and descriptions.
- **Pencil line — line:** separators, panel borders, and table rows.
- **Selected wash — selected:** selected and hovered navigation, language choices, and text selection.
- **Code paper — code:** inline and block code backgrounds.

Each `dark-` token is the dark appearance counterpart. System mode follows `prefers-color-scheme`; an explicit light or dark preference overrides it and persists when storage is available.

## Typography

Native serif page titles sit above system sans-serif reading text and compact interface labels. Code uses the system monospace stack; no font download is required.

- **Display:** page title; at the compact breakpoint its size is 38px. RTL titles inherit the sans-serif stack, use weight 500, normal tracking, and line height 1.55.
- **Headline / title:** second- and third-level prose headings. Compact second-level headings use 20px. Fourth-level headings use 15px.
- **Body:** prose uses the body token; interface text inherits a root line height of 1.7. Strong text uses weight 600.
- **Label:** common search and preference text. Tree links use 13px; secondary metadata and outlines use 11px.
- **Mono:** block code; inline code uses .85em of its surrounding text.

**The Reading Direction Rule.** Use logical spacing and borders; isolate inline code left-to-right with `direction: ltr` and `unicode-bidi: isolate` inside RTL prose.

## Layout

Desktop uses a 244px sticky navigation column with a viewport-height scroll area, a toolbar, and a centered reading column capped at 70ch. Pages with multiple second-level headings can add a 145px outline separated by 58px. The outline disappears at 1190px and below.

At 800px and below, the shell becomes one column and the page tree becomes a native disclosure; JavaScript initially collapses it. Reading gutters are 26px and toolbar gutters are 24px. Desktop reading gutters are 56px, changing to 42px at the intermediate breakpoint and 80px from 1500px. The toolbar wraps when needed. Logical layout properties mirror the shell and nesting for RTL.

Prose paragraphs have 19px trailing space; second-level sections begin with 43px above their headings, reduced to 35px on compact screens. Code and tables scroll horizontally within the reading column. Print hides navigation and preferences and expands the document into the page.

## Elevation & Depth

No shadows or authored transitions are used. Surface tone and thin borders distinguish navigation, code, and callouts. Search and language panels overlay adjacent content using stacking order and borders.

## Shapes

The document remains rectangular. Small panel corners recur on navigation highlights, callouts, code blocks, and popup panels. Inline code and shortcut hints have slightly smaller corners. Separators and container borders are one pixel.

## Components

### Navigation

Tree links combine small outlined SVG icons with text. Hover and current-page states share the selected wash and ink color; the current page also uses weight 600. Nested pages use native disclosures, a CSS chevron, and an indented rule. Compact tree rows have a 40px minimum height. Breadcrumbs and page outlines use muted links with underline on hover.

### Search and preferences

Search is a transparent, borderless input with an outlined search icon and a small `/` shortcut hint. Results appear in a bordered paper panel with separated rows; loading, empty, and error states use status text. The language disclosure uses the same paper-panel vocabulary and explicitly labels unavailable translations. Appearance uses a native select. Search and appearance are progressive enhancements.

### Reading containers

Callouts use sidebar paper, a thin border, and a green title. Quotes use a single accent rule on the inline start side. Native prose disclosures sit between horizontal rules. Tables use thin row separators and a sidebar-paper header.

### Code

Blocks use code paper, a border, and horizontal overflow. Inline code uses a compact tonal background and the reading-direction isolation rule. Syntax coloring reuses accent and muted ink plus the dedicated warm syntax token.

### Child-page links

Related pages appear as full-width separated rows with an underlined title, muted description, and small SVG arrow. The arrow mirrors in RTL.

### Interaction states

Links retain visible underlines in prose; hover increases underline thickness. Keyboard focus uses a two-pixel focus outline with a four-pixel offset. Disclosures retain native keyboard behavior. No animation is required for state changes.

## Do's and Don'ts

### Do:

- **Do** preserve native fonts, controls, and semantic navigation.
- **Do** keep reading text within the established column and let code and tables scroll locally.
- **Do** use logical spacing and isolate inline code in RTL content.
- **Do** carry the complete palette roles through light, dark, and system appearance.

### Don't:

- **Don't** require JavaScript for reading or ordinary page navigation.
- **Don't** add unnecessary decoration or motion to this plain notebook.
- **Don't** substitute fixed physical directions for mirrored navigation and prose spacing.
