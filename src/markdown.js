import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';
import container from 'markdown-it-container';
import hljs from 'highlight.js/lib/common';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function createMarkdown(ui) {
  const md = new MarkdownIt({
    html: false, linkify: true, typographer: true,
    highlight(code, language) {
      const text = language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language, ignoreIllegals: true }).value : escapeHtml(code);
      return `<pre tabindex="0" dir="ltr" aria-label="${escapeHtml(ui.code)}"><code class="hljs">${text}</code></pre>`;
    },
  }).use(footnote);

  for (const kind of ['note', 'tip', 'warning', 'details']) {
    md.use(container, kind, {
      render(tokens, idx) {
        if (tokens[idx].nesting === -1) return kind === 'details' ? '</details>\n' : '</aside>\n';
        const title = tokens[idx].info.trim().slice(kind.length).trim() || ui[kind];
        return kind === 'details'
          ? `<details class="prose-details"><summary>${escapeHtml(title)}</summary>\n`
          : `<aside class="callout"><p class="callout-title">${escapeHtml(title)}</p>\n`;
      },
    });
  }

  md.core.ruler.push('headings-and-tasks', state => {
    // Avoid collisions with the shell and footnote anchors when authors choose headings.
    const used = new Set(['top', 'content', 'theme', 'search-input', 'search-status', 'search-results']);
    state.env.headings = [];
    for (let i = 0; i < state.tokens.length; i++) {
      const token = state.tokens[i];
      if (token.type === 'heading_open') {
        // The page title owns h1. Markdown headings start at h2.
        if (token.tag === 'h1') {
          token.tag = 'h2';
          state.tokens[i + 2].tag = 'h2';
        }
        const inline = state.tokens[i + 1];
        const title = inline.children.filter(t => ['text', 'code_inline'].includes(t.type)).map(t => t.content).join('');
        const base = title.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-') || 'section';
        let id = base, n = 2;
        while (used.has(id) || /^fn(?:ref)?\d+(?::\d+)?$/.test(id)) id = `${base}-${n++}`;
        used.add(id);
        token.attrSet('id', id);
        state.env.headings.push({ id, title, level: Number(token.tag.slice(1)) });
      }
      if (token.type === 'inline' && state.tokens[i - 2]?.type === 'list_item_open' && /^\[[ xX]\] /.test(token.content)) {
        const checked = /^\[[xX]\]/.test(token.content);
        const first = token.children[0];
        if (first?.type === 'text') {
          first.content = first.content.slice(4);
          const box = new state.Token('html_inline', '', 0);
          box.content = `<input type="checkbox" disabled${checked ? ' checked' : ''} aria-label="${escapeHtml(token.content.slice(4))}"> `;
          token.children.unshift(box);
          state.tokens[i - 2].attrJoin('class', 'task-item');
        }
      }
    }
  });
  md.renderer.rules.table_open = () => `<div class="table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(ui.table)}"><table>\n`;
  md.renderer.rules.table_close = () => '</table></div>\n';
  md.renderer.rules.footnote_block_open = () => `<section class="footnotes" aria-label="${escapeHtml(ui.footnotes)}"><ol>\n`;
  md.renderer.rules.footnote_anchor = (tokens, idx) => `<a href="#fnref${tokens[idx].meta.id + 1}${tokens[idx].meta.subId > 0 ? `:${tokens[idx].meta.subId}` : ''}" class="footnote-backref" aria-label="${escapeHtml(ui.footnoteBack)}">↩</a>`;
  const image = md.renderer.rules.image;
  md.renderer.rules.image = (tokens, idx, ...args) => {
    tokens[idx].attrSet('loading', 'lazy');
    tokens[idx].attrSet('decoding', 'async');
    return image(tokens, idx, ...args);
  };
  return md;
}
