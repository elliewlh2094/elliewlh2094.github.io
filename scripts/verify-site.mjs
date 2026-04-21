import { execFileSync, spawn } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.PREVIEW_PORT ?? 4327);
const baseUrl = `http://127.0.0.1:${port}`;
const startupTimeoutMs = 15_000;
const requestTimeoutMs = 5_000;

const corePages = [
  { file: 'dist/index.html', previewPath: '/' },
  { file: 'dist/about/index.html', previewPath: '/about/' },
  { file: 'dist/projects/index.html', previewPath: '/projects/' },
  { file: 'dist/blog/index.html', previewPath: '/blog/' }
];

const collections = [
  {
    name: 'projects',
    contentDir: path.join('src', 'content', 'projects'),
    distPrefix: 'projects'
  },
  {
    name: 'blog',
    contentDir: path.join('src', 'content', 'blog'),
    distPrefix: 'blog'
  }
];

function listMarkdownFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  return match?.[1] ?? '';
}

function parseBooleanField(frontmatter, fieldName, defaultValue = false) {
  const match = frontmatter.match(new RegExp(`^${fieldName}:\\s*(true|false)\\s*$`, 'm'));

  if (!match) {
    return defaultValue;
  }

  return match[1] === 'true';
}

function parseStringField(frontmatter, fieldName) {
  const match = frontmatter.match(
    new RegExp(`^${fieldName}:\\s*(?:"([^"\\r\\n]+)"|'([^'\\r\\n]+)'|([^#\\r\\n]+))\\s*$`, 'm')
  );

  if (!match) {
    return undefined;
  }

  return (match[1] ?? match[2] ?? match[3] ?? '').trim() || undefined;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function toSlug(baseDir, filePath) {
  const relativePath = path.relative(baseDir, filePath);
  return toPosixPath(relativePath).replace(/\.md$/i, '').toLowerCase();
}

function toDistHtmlPath(prefix, slug) {
  return path.join('dist', ...prefix.split('/'), ...slug.split('/'), 'index.html');
}

function toPreviewPath(prefix, slug) {
  return `/${[prefix, slug].filter(Boolean).join('/')}/`;
}

function toDistAssetPath(assetPath) {
  return path.join('dist', ...assetPath.replace(/^\/+/, '').split('/'));
}

function collectEntries() {
  return collections.flatMap((collection) => {
    const files = listMarkdownFiles(collection.contentDir);

    return files.map((filePath) => {
      const source = readFileSync(filePath, 'utf8');
      const frontmatter = extractFrontmatter(source);
      const slug = toSlug(collection.contentDir, filePath);
      const draft = parseBooleanField(frontmatter, 'draft', false);
      const cover = parseStringField(frontmatter, 'cover');

      return {
        collection: collection.name,
        slug,
        draft,
        cover,
        distFile: toDistHtmlPath(collection.distPrefix, slug),
        previewPath: toPreviewPath(collection.distPrefix, slug)
      };
    });
  });
}

function buildVerificationTargets(entries) {
  const publicEntries = entries.filter((entry) => !entry.draft);
  const draftEntries = entries.filter((entry) => entry.draft);

  const requiredFiles = [
    ...corePages.map((page) => page.file),
    ...publicEntries.map((entry) => entry.distFile)
  ];

  const requiredAssets = publicEntries
    .filter((entry) => entry.cover)
    .map((entry) => toDistAssetPath(entry.cover));

  const forbiddenFiles = draftEntries.map((entry) => entry.distFile);
  const previewPaths = [
    ...corePages.map((page) => page.previewPath),
    ...publicEntries.map((entry) => entry.previewPath)
  ];

  return {
    publicEntries,
    draftEntries,
    requiredFiles: [...new Set(requiredFiles)],
    requiredAssets: [...new Set(requiredAssets)],
    forbiddenFiles: [...new Set(forbiddenFiles)],
    previewPaths: [...new Set(previewPaths)]
  };
}

function assertStaticOutput(targets) {
  const missingFiles = targets.requiredFiles.filter((file) => !existsSync(file));
  const missingAssets = targets.requiredAssets.filter((file) => !existsSync(file));
  const leakedDrafts = targets.forbiddenFiles.filter((file) => existsSync(file));

  if (missingFiles.length > 0 || missingAssets.length > 0 || leakedDrafts.length > 0) {
    const messages = [];

    if (missingFiles.length > 0) {
      messages.push(`缺少預期頁面輸出：${missingFiles.join(', ')}`);
    }

    if (missingAssets.length > 0) {
      messages.push(`缺少公開內容封面資源：${missingAssets.join(', ')}`);
    }

    if (leakedDrafts.length > 0) {
      messages.push(`草稿內容不應輸出：${leakedDrafts.join(', ')}`);
    }

    throw new Error(messages.join('\n'));
  }

  const publicProjects = targets.publicEntries.filter((entry) => entry.collection === 'projects').length;
  const publicPosts = targets.publicEntries.filter((entry) => entry.collection === 'blog').length;

  console.log(
    `靜態輸出檢查通過：公開專案 ${publicProjects} 篇，公開文章 ${publicPosts} 篇，草稿排除 ${targets.forbiddenFiles.length} 篇，封面資源 ${targets.requiredAssets.length} 個。`
  );
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

async function verifyPreview(previewPaths) {
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
      console.log(`預覽檢查通過：${pathname}`);
    }
  } catch (error) {
    console.error(stdout.join(''));
    console.error(stderr.join(''));
    throw error;
  } finally {
    stopProcessTree(child);
  }
}

const entries = collectEntries();
const targets = buildVerificationTargets(entries);

assertStaticOutput(targets);
await verifyPreview(targets.previewPaths);
console.log('網站驗證通過。');
