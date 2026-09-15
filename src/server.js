import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { build, loadConfig, root } from './build.js';

export async function startServer({ preview = false, watchFiles = !preview, port = Number(process.env.PORT || 4321), buildOptions = {} } = {}) {
  const { outDir = path.join(root, preview ? 'dist' : '.notebook-dev'), configFile = path.join(root, 'site.config.js') } = buildOptions;
  buildOptions = { ...buildOptions, outDir };
  let result = preview ? { config: await loadConfig(configFile, buildOptions.configOverride) } : await build(buildOptions);
  const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf' };
  const server = createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    let pathname, requestUrl;
    try { requestUrl = new URL(request.url, 'http://localhost'); pathname = decodeURIComponent(requestUrl.pathname); }
    catch { response.writeHead(400).end('Bad URL'); return; }
    const base = result.config.basePath.replace(/\/$/, '');
    if (base && pathname !== base && !pathname.startsWith(`${base}/`)) { response.writeHead(302, { Location: `${base}/` }).end(); return; }
    pathname = pathname.slice(base.length) || '/';
    const filePath = path.resolve(outDir, `.${pathname}`);
    if (!filePath.startsWith(`${outDir}${path.sep}`) && filePath !== outDir) { response.writeHead(403).end(); return; }
    try {
      const info = await stat(filePath);
      if (info.isDirectory() && !pathname.endsWith('/')) { response.writeHead(308, { Location: `${base}${pathname}/${requestUrl.search}` }).end(); return; }
      const target = info.isDirectory() ? path.join(filePath, 'index.html') : filePath;
      const data = await readFile(target);
      response.writeHead(200, { 'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch {
      const locale = pathname.split('/')[1];
      const target = Object.hasOwn(result.config.locales, locale) ? path.join(outDir, locale, '404.html') : path.join(outDir, '404.html');
      response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(request.method === 'HEAD' ? undefined : await readFile(target).catch(() => 'Not found. Run npm run build first.'));
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
  console.log(`Notebook: http://localhost:${server.address().port}${result.config.basePath}/`);

  const watchers = [];
  if (watchFiles) {
    let timer, running = false, pending = false;
    async function rebuild() {
      if (running) { pending = true; return; }
      running = true;
      try { result = await build(buildOptions); console.log(`Rebuilt ${result.pages.length} pages. Refresh your browser.`); }
      catch (error) { console.error(`Build failed; keeping the last good output.\n${error.message}`); }
      finally { running = false; if (pending) { pending = false; rebuild(); } }
    }
    for (const target of ['content', 'public', 'src', 'site.config.js']) {
      watchers.push(watch(path.join(root, target), { recursive: target !== 'site.config.js' }, () => {
        clearTimeout(timer); timer = setTimeout(rebuild, 100);
      }));
    }
  }
  server.once('close', () => watchers.forEach(watcher => watcher.close()));
  return server;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  await startServer({ preview: process.argv.includes('--preview') });
}
