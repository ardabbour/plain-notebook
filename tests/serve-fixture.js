import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createFixture } from './fixtures.js';
import { startServer } from '../src/server.js';

const directory = await mkdtemp(path.join(tmpdir(), 'notebook-browser-'));
const buildOptions = await createFixture(directory);
const server = await startServer({ port: 4322, watchFiles: false, buildOptions });
for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
  server.close(async () => { await rm(directory, { recursive: true, force: true }); process.exit(0); });
});
