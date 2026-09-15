# Product

<!-- impeccable:product-schema 1 -->

## Platform
web

## Stack
The user approved the proposed Markdown-to-static-HTML approach and implementation. Implementation choice: Node.js build scripts, Markdown-it, plain HTML/CSS, and small progressive-enhancement scripts. No runtime framework or required hosting service.

## Users
People publishing a personal homepage, portfolio, writing, or public notebook; visitors reading and navigating those pages. File-based authoring assumes basic familiarity with files and Markdown. A visual editor is a future option.

## Product Purpose
A reusable personal website that reads like a public notebook. Make pages easy to publish, find, and read.

## Capabilities and Constraints
Nested navigation, breadcrumbs, page outlines, enriched Markdown, translations with stable identities, RTL, and light/dark/system preferences. Static reading and navigation must work without JavaScript. Configuration and example content must be replaceable. English and Arabic demonstrate localization. Missing translations must be explicit.

## Brand Commitments
The user approved restrained system typography, visible links, subtle separators, a desktop navigation column, and collapsible mobile navigation. The reference is https://motherfuckingwebsite.com/: prioritize speed, legibility, semantic HTML, and useful simplicity. Avoid unnecessary decoration and motion.

## Evidence on Hand
No personal biography or real portfolio material was supplied. All starter content must be clearly identified as example/template content.

## Product Principles
- Every feature should help someone publish, find, or read a page.
- Plain files and portable output.
- Content and navigation before enhancement.
- Treat reading direction and translation as foundational.

## Release
Version 1.0.0 is published as the public GitHub template https://github.com/ardabbour/plain-notebook with a permanent demo at https://plain-notebook.ardabbour.workers.dev/en/. Each owner supplies their own identity and content. Visual editing remains an optional future feature outside v1.
