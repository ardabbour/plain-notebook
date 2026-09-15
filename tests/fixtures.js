import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function writePage(contentDir, relative, data, content = 'A useful thought.') {
  const file = path.join(contentDir, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `---\n${JSON.stringify(data)}\n---\n${content}\n`);
  return file;
}

// Private test content. Never depends on, or gets published with, the owner's pages.
export async function createFixture(directory, { count = 0 } = {}) {
  const contentDir = path.join(directory, 'content');
  const publicDir = path.join(directory, 'public');
  const configFile = path.join(directory, 'site.config.mjs');
  const outDir = path.join(directory, 'dist');
  await mkdir(publicDir, { recursive: true });
  await writeFile(path.join(publicDir, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>');
  const locale = (label, dir, name) => ({ label, dir, name, tagline: 'A test notebook.', description: 'Test content.', footer: 'Fixture content.' });
  const config = { defaultLocale: 'en', url: '', basePath: '', locales: {
    en: locale('English', 'ltr', 'Fixture notebook'),
    ar: locale('العربية', 'rtl', 'دفتر الاختبار'),
    fr: { ...locale('Français', 'ltr', 'Le carnet'), ui: { home: 'Accueil', pages: 'Pages', search: 'Rechercher', language: 'Langue', appearance: 'Apparence', dark: 'Sombre', light: 'Clair', system: 'Système' } },
  } };
  await writeFile(configFile, `export default ${JSON.stringify(config, null, 2)};\n`);
  for (const code of ['en', 'ar', 'fr']) {
    await writePage(contentDir, `${code}/technical.md`, { title: 'Technical notes', translationKey: 'technical' }, String.raw`## Equations
Inline $x^2$ and a matrix:

$$
\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}
$$

## Diagrams

~~~mermaid A decision
flowchart LR
 A[Write] --> B{Ready?}
 B -->|Yes| C[Publish]
 B -->|No| A
~~~

~~~mermaid Conversation
sequenceDiagram
 Reader->>Host: Request
 Host-->>Reader: HTML
~~~
`);
    await writePage(contentDir, `${code}/index.md`, { title: code === 'fr' ? 'Bonjour' : 'Home', translationKey: 'home' }, '[About](./about.md)\n\n## Start\nAn introduction.\n\n## More\nAnother thought.');
    await writePage(contentDir, `${code}/about.md`, { title: 'About', translationKey: 'about' }, '## Bio\nA biography.');
    await writePage(contentDir, `${code}/notebook/index.md`, { title: 'The notebook', navTitle: 'Notebook', translationKey: 'notebook', order: 20 });
    await writePage(contentDir, `${code}/notebook/markdown.md`, { title: 'The writing guide', navTitle: 'Writing guide', translationKey: 'markdown', description: 'Plain text and useful structure.' }, `## Start a page
[About](../about.md?from=guide#bio)

## Structure
| Thing | Reason |
| --- | --- |
| A table | Compare |

- [x] Start
- [x] Write
- [ ] Continue

::: note A note
A useful aside.
:::

::: details More context
Native disclosure content.
:::

A thought[^a]. Another reference[^a].

[^a]: A little more detail.

## Code
Inline \`::: note\`, \`public/images/\`, and \`dist/\`.

~~~js
const notebook = { title: 'Ideas' };
~~~

## Content
Reserved shell ID.

## fn1
Reserved footnote ID.
`);
  }
  await writePage(contentDir, 'en/notebook/small-web.md', { title: 'A quieter web', translationKey: 'small-web' });
  await writePage(contentDir, 'en/draft.md', { title: 'Private draft', translationKey: 'draft', draft: true }, 'Never publish this draft.');
  for (const [index, slug] of ['notebook/research', 'notebook/research/books', 'notebook/research/books/essays'].entries()) {
    await writePage(contentDir, `en/${slug}/index.md`, { title: `Level ${index + 1}`, translationKey: `depth-${index}` });
  }
  await writePage(contentDir, 'en/notebook/research/books/essays/long-note.md', { title: 'A long and deeply nested note', translationKey: 'long-note' }, Array.from({ length: 30 }, (_, i) => `## Section ${i + 1}\n${'A useful observation with room to explain the idea. '.repeat(12)}`).join('\n\n'));
  for (let i = 0; i < count; i++) await writePage(contentDir, `en/notebook/note-${i}.md`, { title: `Note ${i}`, translationKey: `note-${i}`, order: i }, `A searchable observation ${i}.`);
  return { contentDir, publicDir, configFile, outDir };
}
