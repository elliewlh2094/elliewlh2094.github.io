import { execFileSync, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.PREVIEW_PORT ?? 4327);
const baseUrl = `http://127.0.0.1:${port}`;
const startupTimeoutMs = 15_000;
const requestTimeoutMs = 5_000;

const requiredFiles = [
  'dist/index.html',
  'dist/about/index.html',
  'dist/projects/index.html',
  'dist/projects/personal-brand-site/index.html',
  'dist/projects/project-gallery/index.html',
  'dist/projects/work-notes-hub/index.html',
  'dist/blog/index.html',
  'dist/blog/markdown-content-workflow/index.html',
  'dist/blog/project-writing-template/index.html',
  'dist/images/hero-workspace.png',
  'dist/images/projects/personal-brand-site.png',
  'dist/images/projects/project-gallery.png',
  'dist/images/projects/work-notes-hub.png'
];

const forbiddenFiles = [
  'dist/blog/draft-note/index.html',
  'dist/projects/draft-project/index.html'
];

const previewPaths = [
  '/',
  '/about/',
  '/projects/',
  '/projects/personal-brand-site/',
  '/blog/',
  '/blog/markdown-content-workflow/'
];

function assertStaticOutput() {
  const missing = requiredFiles.filter((file) => !existsSync(file));
  const leakedDrafts = forbiddenFiles.filter((file) => existsSync(file));

  if (missing.length > 0) {
    throw new Error(`Missing expected build output: ${missing.join(', ')}`);
  }

  if (leakedDrafts.length > 0) {
    throw new Error(`Draft output should not exist: ${leakedDrafts.join(', ')}`);
  }

  console.log(`Static output check passed (${requiredFiles.length} files).`);
}

async function fetchWithTimeout(pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(`${baseUrl}${pathname}`, {
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`Unexpected ${response.status} for ${pathname}`);
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function waitForPreview() {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < startupTimeoutMs) {
    try {
      await fetchWithTimeout('/');
      return;
    } catch (error) {
      lastError = error;
      await delay(500);
    }
  }

  throw new Error(`Preview server was not ready within ${startupTimeoutMs / 1000}s. Last error: ${lastError?.message}`);
}

function stopProcessTree(processToStop) {
  if (!processToStop || processToStop.killed) return;

  if (process.platform === 'win32') {
    try {
      execFileSync('taskkill', ['/PID', String(processToStop.pid), '/T', '/F'], {
        stdio: 'ignore'
      });
      return;
    } catch {}
  }

  processToStop.kill('SIGTERM');
}

async function verifyPreview() {
  const child = spawn(process.execPath, [
    './node_modules/astro/astro.js',
    'preview',
    '--host',
    '127.0.0.1',
    '--port',
    String(port)
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  const stdout = [];
  const stderr = [];
  child.stdout.on('data', (chunk) => stdout.push(chunk.toString()));
  child.stderr.on('data', (chunk) => stderr.push(chunk.toString()));

  try {
    await waitForPreview();

    for (const pathname of previewPaths) {
      await fetchWithTimeout(pathname);
      console.log(`Preview check passed: ${pathname}`);
    }
  } catch (error) {
    console.error(stdout.join(''));
    console.error(stderr.join(''));
    throw error;
  } finally {
    stopProcessTree(child);
  }
}

assertStaticOutput();
await verifyPreview();
console.log('Site verification passed.');
