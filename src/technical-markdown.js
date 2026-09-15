import { tex } from '@mdit/plugin-tex';
import katex from 'katex';
import { renderMermaidSVG } from 'beautiful-mermaid';
import { load } from 'cheerio';

// Keep diagrams inert. The renderer's embedded styles import remote fonts and
// target global SVG elements; use our own scoped styles instead.
const svgTags = new Set(['svg', 'g', 'defs', 'marker', 'path', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'text', 'tspan']);
const svgAttributes = new Set(['xmlns', 'viewBox', 'width', 'height', 'id', 'class', 'x', 'y', 'x1', 'x2', 'y1', 'y2', 'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'fill-opacity', 'stroke-opacity', 'transform', 'text-anchor', 'dominant-baseline', 'alignment-baseline', 'font-size', 'font-weight', 'dx', 'dy', 'marker-start', 'marker-end', 'markerWidth', 'markerHeight', 'markerUnits', 'refX', 'refY', 'orient']);

export function technicalMarkdown(md, { ui, escapeHtml }) {
  md.use(tex, {
    delimiters: 'dollars', mathFence: true,
    render(content, displayMode) {
      // Native MathML needs no client library, stylesheet or downloaded fonts.
      const math = katex.renderToString(content, {
        output: 'mathml', displayMode, throwOnError: true, trust: false,
        strict: code => ['unknownSymbol', 'unicodeTextInMathMode'].includes(code) ? 'ignore' : 'error',
        maxExpand: 1000, maxSize: 20,
      });
      return displayMode
        ? `<div class="math-block" dir="ltr" tabindex="0" role="region" aria-label="${escapeHtml(ui.equation)}">${math}</div>\n`
        : `<span class="math-inline" dir="ltr">${math}</span>`;
    },
  });

  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    if (!/^mermaid(?:\s|$)/.test(token.info.trim())) return fence(tokens, idx, options, env, self);
    const source = token.content.trim();
    const first = source.split('\n').find(line => line.trim() && !line.trim().startsWith('%%'))?.trim();
    if (!/^(?:(?:graph|flowchart)\s+(?:TD|TB|BT|LR|RL)\b|stateDiagram-v2\b|sequenceDiagram\b|classDiagram\b|erDiagram\b)/.test(first || '')) {
      throw new Error('Unsupported Mermaid diagram. Use flowchart, sequenceDiagram, stateDiagram-v2, classDiagram or erDiagram.');
    }
    if (/(?:^|[;\n])\s*(?:click|style|classDef|linkStyle)\s|%%\s*\{/m.test(source) || (!first.startsWith('classDiagram') && /(?:^|[;\n])\s*class\s/m.test(source))) {
      throw new Error('Diagram interactions, directives and custom styles are not supported. Use plain nodes and connections.');
    }
    const title = token.info.trim().slice('mermaid'.length).trim() || ui.diagram;
    const prefix = `diagram-${env.diagramCount = (env.diagramCount || 0) + 1}-`;
    const $ = load(renderMermaidSVG(source.replace(/^\s*%%[^\n]*(?:\n|$)/gm, ''), { font: 'system-ui', transparent: true }), { xml: true });
    $('*').each((_, element) => {
      if (!svgTags.has(element.name)) { $(element).remove(); return; }
      for (const [name, value] of Object.entries(element.attribs)) {
        if (!svgAttributes.has(name) || /(?:javascript:|https?:|data:|url\(\s*[^#])/i.test(value) && name !== 'xmlns') $(element).removeAttr(name);
      }
    });
    const ids = new Map();
    $('[id]').each((_, element) => {
      const id = $(element).attr('id');
      const renamed = `${prefix}${ids.size}`;
      ids.set(id, renamed);
      $(element).attr('id', renamed);
    });
    $('*').each((_, element) => {
      for (const [name, value] of Object.entries(element.attribs)) {
        $(element).attr(name, value.replace(/url\(#([^)]*)\)/g, (_, id) => `url(#${ids.get(id) || ''})`));
      }
    });
    $('svg').attr({ role: 'img', 'aria-label': title, focusable: 'false' });
    const markdownSource = `\`\`\`mermaid ${title}\n${source}\n\`\`\``;
    return `<figure class="diagram"><div class="diagram-scroll" dir="ltr" tabindex="0" role="region" aria-label="${escapeHtml(title)}">${$.xml()}</div><figcaption>${escapeHtml(title)}</figcaption><details class="prose-details"><summary>${escapeHtml(ui.diagramSource)}<span class="sr-only">: ${escapeHtml(title)}</span></summary><pre tabindex="0" dir="ltr"><code>${escapeHtml(markdownSource)}</code></pre></details></figure>\n`;
  };
}
