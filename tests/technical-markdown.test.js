import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { createMarkdown } from '../src/markdown.js';
import { messages } from '../src/i18n.js';

const fence = (source, title = 'An example') => `\n\n\`\`\`mermaid ${title}\n${source}\n\`\`\`\n`;

test('math becomes native MathML in prose, tables and fences; currency and code stay literal', () => {
  const md = createMarkdown(messages.ar);
  const $ = load(md.render(String.raw`Inline $x^2$ and $\text{مساحة} = x$.

$$
\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}
$$

| Formula |
| --- |
| $\frac{1}{2}$ |

~~~math
\sum_{k=1}^{n} k
~~~

Costs $20 and $30. Escaped: \$x\$. Code: ` + '`$x$`'));
  assert.equal($('math').length, 5);
  assert.equal($('math[display="block"]').length, 2);
  assert.equal($('mfrac').length, 1);
  assert.equal($('mtable').length, 1);
  assert.match($('mtext').text(), /مساحة/);
  assert.match($('body').text(), /Costs \$20 and \$30/);
  assert.equal($('code').text(), '$x$');
  assert.equal($('.math-block[dir="ltr"]').length, 2);
  assert.equal($('script, link, style').length, 0);
});

test('invalid math fails, HTML commands and untrusted math links cannot execute', () => {
  const md = createMarkdown(messages.en);
  assert.throws(() => md.render(String.raw`$\notACommand{x}$`), /KaTeX parse error/);
  assert.throws(() => md.render(String.raw`$\htmlClass{bad}{x}$`), /HTML extension/);
  const $ = load(md.render(String.raw`$\href{javascript:alert(1)}{x}$`));
  assert.equal($('a, script, [href], [onclick]').length, 0);
});

test('five diagram types render without remote resources, duplicate IDs or executable markup', () => {
  const sources = [
    'flowchart LR\n A[Start] --> B[Finish]',
    'sequenceDiagram\n Alice->>Bob: Hello',
    'stateDiagram-v2\n [*] --> Draft\n Draft --> Published',
    'classDiagram\n class Page {\n +String title\n }\n Notebook --> Page',
    'erDiagram\n AUTHOR ||--o{ NOTE : writes',
  ];
  const md = createMarkdown(messages.en);
  const $ = load(md.render('## diagram-1-0\n' + [...sources, sources[0]].map(s => fence(s)).join('')));
  assert.equal($('.diagram svg[role="img"]').length, 6);
  assert.equal($('.diagram figcaption').length, 6);
  assert.equal($('.diagram details').length, 6);
  assert.equal($('svg style, svg script, svg foreignObject, svg [href], svg [style]').length, 0);
  const ids = $('[id]').map((_, e) => $(e).attr('id')).get();
  assert.equal(new Set(ids).size, ids.length);
  for (const e of $('[marker-end], [marker-start]').toArray()) {
    const value = $(e).attr('marker-end') || $(e).attr('marker-start');
    assert.ok(ids.includes(value.match(/url\(#(.+)\)/)[1]));
  }
});

test('diagram captions and labels escape markup; unsupported types and directives fail clearly', () => {
  const md = createMarkdown(messages.en);
  const $ = load(md.render(fence('flowchart LR\n A["<script>alert(1)</script>"] --> B[Done]', '<img src=x onerror=alert(1)>')));
  assert.equal($('script, img, [onerror]').length, 0);
  assert.equal($('figcaption').text(), '<img src=x onerror=alert(1)>');
  assert.throws(() => md.render(fence('pie\n "A" : 2')), /Unsupported Mermaid/);
  assert.throws(() => md.render(fence('flowchart LR\n A --> B\n click A "https://example.com"')), /interactions/);
  assert.throws(() => md.render(fence('%%{init: {}}%%\nflowchart LR\n A --> B')), /directives/);
  assert.throws(() => md.render(fence('flowchart LR\n A --> B\nstyle A fill:red')), /styles/);
});
