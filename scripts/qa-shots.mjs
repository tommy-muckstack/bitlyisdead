// QA screenshots for docs/qa/<date>/<TAG>-NN-topic.png against a running server (BASE=http://localhost:3017/bitlyisdead TAG=before|after).
import fs from "node:fs";
import { chromium } from "@playwright/test";
const BASE = process.env.BASE || "http://localhost:3017/bitlyisdead", TAG = process.env.TAG || "after", DATE = process.env.DATE || "2026-10-15";
const dir = `docs/qa/${DATE}`; fs.mkdirSync(dir, { recursive: true });
const shot = (page, name, opts = {}) => page.screenshot({ path: `${dir}/${TAG}-${name}.png`, ...opts });
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
const errors = []; page.on("pageerror", e => errors.push(String(e))); page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
const settle = async (ms = 400) => page.waitForTimeout(ms);
await page.goto(BASE + "/"); await settle(); await shot(page, "01-landing");
await page.goto(BASE + "/pricing"); await settle(); await shot(page, "02-pricing", { fullPage: true });
await page.goto(BASE + "/login"); await settle(); await shot(page, "03-login");
await page.goto(BASE + "/login?mode=signup"); await settle(); await shot(page, "04-signup");
await page.goto(BASE + "/forgot-password"); await settle(); await shot(page, "05-forgot");
await page.goto(BASE + "/nope-404"); await settle(); await shot(page, "06-404");
// app as a guest
await page.goto(BASE + "/app"); await page.waitForURL(/\/app/); await settle(800); await shot(page, "07-app-home");
for (const r of ["links", "links/new", "qr", "pages", "analytics", "campaigns", "domains", "settings", "upgrade"]) { await page.goto(`${BASE}/app/${r}`); await settle(600); await shot(page, `10-app-${r.replace("/", "-")}`); }
// mobile
const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const mp = await m.newPage();
for (const [n, p] of [["landing", "/"], ["pricing", "/pricing"], ["login", "/login"], ["app", "/app"], ["app-links", "/app/links"]]) { await mp.goto(BASE + p); await mp.waitForTimeout(600); await mp.screenshot({ path: `${dir}/${TAG}-m-${n}.png` }); const ok = await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth); console.log(`390px ${n}: ${ok ? "no horizontal scroll" : "HORIZONTAL SCROLL"}`); }
console.log("console/page errors:", errors.length ? errors : "none");
await browser.close();
