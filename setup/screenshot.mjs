#!/usr/bin/env node
/**
 * Headless screenshots without sudo.
 *
 * This box has Playwright's browser binaries cached but not the `playwright`
 * package, and installing system libs needs a password. `playwright-core`
 * plus an explicit executablePath sidesteps both.
 *
 *   npm --prefix setup run shot -- <file-or-url> [options]
 *   node setup/screenshot.mjs <file-or-url> [options]
 *
 *   --out <path>        output PNG (default: shot.png)
 *   --width <px>        viewport width (default 1180)
 *   --height <px>       viewport height (default 900)
 *   --phone             390x844 viewport
 *   --full              full-page capture
 *   --theme <t>         light | dark | both  (default light)
 *   --wait <ms>         settle time before capture (default 400)
 *
 * With --theme both, "-light"/"-dark" are appended to the output name.
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const SHELL = `${process.env.HOME}/.cache/ms-playwright/` +
  'chromium_headless_shell-1234/chrome-headless-shell-linux64/chrome-headless-shell';

const argv = process.argv.slice(2);
if (!argv.length || argv[0].startsWith('-')) {
  console.error('usage: node setup/screenshot.mjs <file-or-url> [--out x.png] [--full] [--theme both]');
  process.exit(2);
}
const flag = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? dflt : argv[i + 1];
};
const has = (name) => argv.includes(`--${name}`);

// npm runs scripts with cwd set to the package dir (setup/), so relative paths
// would otherwise resolve against setup/ rather than wherever you typed the
// command. INIT_CWD is where npm was actually invoked from.
const base = process.env.INIT_CWD || process.cwd();
const resolve = (p) => path.resolve(base, p);

const input = argv[0];
const target = /^https?:\/\//.test(input) ? input : 'file://' + resolve(input);
const out = resolve(flag('out', 'shot.png'));
const phone = has('phone');
const width = Number(flag('width', phone ? 390 : 1180));
const height = Number(flag('height', phone ? 844 : 900));
const fullPage = has('full');
const wait = Number(flag('wait', 400));
const theme = flag('theme', 'light');
const themes = theme === 'both' ? ['light', 'dark'] : [theme];

if (!fs.existsSync(SHELL)) {
  console.error(`No headless shell at ${SHELL}\nInstalled browsers:`);
  console.error(fs.readdirSync(`${process.env.HOME}/.cache/ms-playwright`).join('\n'));
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: SHELL, args: ['--no-sandbox'] });
for (const colorScheme of themes) {
  const page = await browser.newPage({ viewport: { width, height }, colorScheme });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(target, { waitUntil: 'load' });
  await page.waitForTimeout(wait);
  const file = themes.length > 1
    ? out.replace(/(\.png)?$/, `-${colorScheme}.png`)
    : out;
  await page.screenshot({ path: file, fullPage });
  const { width: w, height: h } = await page.evaluate(
    () => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
  console.log(`${file}  ${w}x${h}${errors.length ? `  JS ERRORS: ${errors.join('; ')}` : ''}`);
  await page.close();
}
await browser.close();
