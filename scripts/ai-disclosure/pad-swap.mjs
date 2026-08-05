// By Fable under dreev's direction.
// Surgical in-editor URL swap on an Etherpad pad, preserving authorship colors.
// See README.md in this directory for why the Etherpad HTTP API is NOT used.
// Usage: node pad-swap.mjs <padID> <oldURL> <newURL>
import { createRequire } from "module";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const require = createRequire(
  new URL("../../package.json", import.meta.url).pathname,
);
const puppeteer = require("puppeteer");
require("dotenv").config({
  path: new URL("../../.env", import.meta.url).pathname,
});

const DOMAIN = process.env.ETHERPAD_DOMAIN;
if (!DOMAIN) throw new Error("ETHERPAD_DOMAIN is not set (see .env)");

const [PAD, OLD_URL, NEW_URL] = process.argv.slice(2);
if (!PAD || !OLD_URL || !NEW_URL)
  throw new Error("usage: node pad-swap.mjs <padID> <oldURL> <newURL>");

const exportText = async () =>
  (await fetch(`https://${DOMAIN}/${PAD}/export/txt`)).text();

const before = await exportText();
const backupPath = join(tmpdir(), `${PAD}-pad-backup-${Date.now()}.txt`);
writeFileSync(backupPath, before);
const count = before.split(OLD_URL).length - 1;
if (count !== 1) throw new Error(`old URL count is ${count}, not 1 — aborting`);
console.log(`backup: ${backupPath} (${before.length} chars); URL unique — ok`);

const browser = await puppeteer.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.goto(`https://${DOMAIN}/${PAD}`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });
  // padeditor may be a window global (old versions) or a require.js module.
  await page.waitForFunction(
    () => {
      try {
        const pe =
          window.padeditor ||
          (window.require &&
            window.require("ep_etherpad-lite/static/js/pad_editor").padeditor);
        return !!(pe && pe.ace);
      } catch {
        return false;
      }
    },
    { timeout: 60000 },
  );

  const result = await page.evaluate(
    (OLD, NEW) =>
      new Promise((resolve, reject) => {
        try {
          const pe =
            window.padeditor ||
            window.require("ep_etherpad-lite/static/js/pad_editor").padeditor;
          pe.ace.callWithAce(
            (ace) => {
              const rep = ace.ace_getRep();
              const idx = rep.alltext.indexOf(OLD);
              if (idx < 0) return reject(new Error("old URL not found in rep"));
              const pre = rep.alltext.slice(0, idx);
              const line = (pre.match(/\n/g) || []).length;
              const col = idx - (pre.lastIndexOf("\n") + 1);
              ace.ace_performDocumentReplaceRange(
                [line, col],
                [line, col + OLD.length],
                NEW,
              );
              resolve({ line, col });
            },
            "swapurl",
            true,
          );
        } catch (e) {
          reject(e);
        }
      }),
    OLD_URL,
    NEW_URL,
  );
  console.log(`replaced in editor at line ${result.line}, col ${result.col}`);

  // Give the collab client time to commit the changeset to the server.
  await new Promise((r) => setTimeout(r, 5000));
} finally {
  await browser.close();
}

const after = await exportText();
const expected = before.replace(OLD_URL, NEW_URL);
if (after !== expected)
  throw new Error("post-edit export does not match expected text!");
console.log("verified: export matches original with only the URL replaced");
