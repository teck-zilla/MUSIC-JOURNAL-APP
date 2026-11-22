import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { gzipSync } from 'node:zlib';

const LIMIT_BYTES = 150 * 1024;
const nextDir = '.next';
const appDir = join(nextDir, 'server', 'app');

function listHtml(dir) {
  if (!existsSync(dir)) return [];

  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listHtml(path));
    } else if (entry.name.endsWith('.html')) {
      files.push(path);
    }
  }

  return files;
}

function check(label, paths) {
  const unique = new Set(paths.filter((path) => path.endsWith('.js')));
  let total = 0;

  for (const path of unique) {
    if (!existsSync(path)) continue;
    total += gzipSync(readFileSync(path)).length;
  }

  const status = total > LIMIT_BYTES ? 'FAIL' : 'OK';
  process.stdout.write(`${status} ${label} ${total} bytes gzipped (limit ${LIMIT_BYTES})\n`);

  if (total > LIMIT_BYTES) failed = true;
}

let failed = false;
const htmlFiles = listHtml(appDir);

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const tags = html.match(/<script\b[^>]*>/g) ?? [];
  const paths = tags
    .filter((tag) => !/\bnoModule\b/i.test(tag))
    .map((tag) => tag.match(/\bsrc="(\/_next\/static\/[^"]+\.js)"/)?.[1])
    .filter((src) => typeof src === 'string')
    .map((src) => join(nextDir, src.replace(/^\/_next\//, '')));
  const rel = relative(appDir, file).replace(/\\/g, '/');
  const label = rel === 'index.html' ? '/' : `/${rel.replace(/\.html$/, '')}`;

  check(label, paths);
}

if (htmlFiles.length === 0) {
  const manifestPath = join(nextDir, 'build-manifest.json');
  if (!existsSync(manifestPath)) {
    process.stderr.write('Route size check: no built routes found. Run next build first.\n');
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const shared = manifest.rootMainFiles ?? [];
  const groups = manifest.pagesChunkGroupBootstrapParams ?? {};

  for (const [route, group] of Object.entries(groups)) {
    check(route, [...shared, ...(group?.otherChunks ?? [])].map((file) => join(nextDir, file)));
  }
}

if (failed) process.exit(1);
