import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, symlink, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { root } from '../src/build.js';

test('editing a running development copy preserves the production build', { timeout: 20000 }, async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'notebook-onboarding-'));
  let server;
  try {
    for (const item of ['src', 'package.json']) await cp(path.join(root, item), path.join(directory, item), { recursive: true });
    const { createFixture } = await import('./fixtures.js');
    const fixture = await createFixture(directory);
    await cp(fixture.configFile, path.join(directory, 'site.config.js'));
    await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'junction');
    const env = { ...process.env, PORT: '0', SITE_URL: '' };
    server = spawn(process.execPath, ['src/server.js'], { cwd: directory, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    server.stdout.on('data', chunk => { stdout += chunk; });
    server.stderr.on('data', chunk => { stderr += chunk; });
    const waitFor = async check => {
      const deadline = Date.now() + 10000;
      while (!await check()) {
        assert.ok(server.exitCode === null && Date.now() < deadline, `Development server did not become ready: ${stderr}`);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    };
    await waitFor(() => stdout.includes('Notebook:'));
    const origin = stdout.match(/http:\/\/localhost:\d+/)[0].replace('localhost', '127.0.0.1');
    // Use the same config edit an owner makes while customizing their site.
    const config = await readFile(path.join(directory, 'site.config.js'), 'utf8');
    await writeFile(path.join(directory, 'site.config.js'), config.replace('"url": ""', '"url": "https://owner.example"'));
    await waitFor(() => stdout.includes('Rebuilt'));
    execFileSync(process.execPath, ['src/check.js'], { cwd: directory, env, stdio: 'pipe' });
    const production = path.join(directory, 'dist/en/index.html');
    const before = await readFile(production, 'utf8');
    assert.ok(before.includes('https://owner.example/en/'));
    await writeFile(path.join(directory, 'content/en/index.md'), '---\ntitle: Updated home\ntranslationKey: home\n---\nA newly written page.\n');
    await waitFor(async () => (await (await fetch(`${origin}/en/`)).text()).includes('Updated home'));
    assert.equal(await readFile(production, 'utf8'), before, 'Development edits must not alter deployable output');
    assert.ok((await readFile(path.join(directory, '.notebook-dev/en/index.html'), 'utf8')).includes('Updated home'));
  } finally {
    if (server && server.exitCode === null) { const stopped = once(server, 'exit'); server.kill(); await stopped; }
    await rm(directory, { recursive: true, force: true });
  }
});
