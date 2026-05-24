/**
 * Prepends `"use client";` to the built ESM output.
 *
 * tsup's `banner` option goes through rollup which strips module-level
 * directives. The cleanest fix is to prepend it after the build.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const targets = [resolve(__dirname, '..', 'dist', 'index.js')];

const DIRECTIVE = '"use client";\n';

for (const file of targets) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  if (content.startsWith(DIRECTIVE) || content.startsWith("'use client'")) continue;
  writeFileSync(file, DIRECTIVE + content);
  console.log(`[animato/react] Injected "use client" into ${file}`);
}
