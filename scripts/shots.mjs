// Drives the real app (production build, demo account) to capture product shots AND smoke-test the core flow.
import fs from "node:fs";
import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("bitlyisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name, opts = {}) => { await page.screenshot({ path: `${dir}/${name}.png`, ...opts }); fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
const chromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
await withApp("bitlyisdead", async ({ base, browser }) => {
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.getByRole("heading", { name: /Welcome back|connections platform/ }).waitFor();
  // Home quick create
  await page.getByLabel("Enter your destination URL").fill("https://example.com/quick"); await page.getByRole("button", { name: "Create your link" }).click(); await page.getByTestId("fresh").waitFor();
  // full create flow with a custom back-half, tags and UTMs
  await page.goto(base + "/app/links/new"); await page.getByLabel("Destination").fill("https://example.com/summer/sale?utm_source=poster&utm_campaign=summer-2026-very-long"); await page.getByLabel(/^Title/).fill("Summer sale poster"); await page.getByLabel(/Custom back-half/).fill("summer-sale");
  const tags = page.getByLabel(/^Tags/); await tags.fill("print"); await tags.press("Enter"); await page.getByRole("button", { name: "Create your link" }).click(); await page.waitForURL(/\/app\/l\/summer-sale/);
  // errors
  await page.goto(base + "/app/links/new"); await page.getByLabel("Destination").fill("javascript:alert(1)"); await page.getByRole("button", { name: "Create your link" }).click(); await page.getByRole("alert").filter({ hasText: /http/ }).waitFor();
  await page.getByLabel("Destination").fill("https://example.com/again"); await page.getByLabel(/Custom back-half/).fill("summer-sale"); await page.getByRole("button", { name: "Create your link" }).click(); await page.getByText("That back-half is taken.").waitFor();
  // the short link redirects (307) and counts a real browser visit; bots, expired/off links and QR scans are counted apart
  const hit = (ua, ref, q = "") => ctx.request.get(`${base}/s/summer-sale${q}`, { maxRedirects: 0, headers: { "user-agent": ua, ...(ref ? { referer: ref } : {}) } });
  for (let i = 0; i < 3; i++) { const r = await hit(chromeUA, "https://news.ycombinator.com/item?id=1"); assert.equal(r.status(), 307); assert.equal(r.headers()["location"], "https://example.com/summer/sale?utm_source=poster&utm_campaign=summer-2026-very-long"); assert.equal(r.headers()["cache-control"], "no-store"); }
  await hit("Googlebot/2.1"); await hit(chromeUA, null, "?r=qr"); assert.equal((await ctx.request.get(`${base}/s/nope-nope`, { maxRedirects: 0 })).status(), 404);
  // links list + details
  await page.goto(base + "/app/links"); await page.waitForSelector("[data-testid=links] li[data-code]"); await save(page, "links");
  await page.getByRole("link", { name: "Summer sale poster" }).click(); await page.getByTestId("total-clicks").waitFor(); assert.equal(await page.getByTestId("total-clicks").innerText(), "3"); assert.equal(await page.getByTestId("total-scans").innerText(), "1"); await page.getByText("news.ycombinator.com").waitFor();
  const qr = await ctx.request.get(`${base}/api/qr/summer-sale`); assert.equal(qr.headers()["content-type"], "image/svg+xml"); assert.match(await qr.text(), /^<svg/); const png = await ctx.request.get(`${base}/api/qr/summer-sale?format=png`); assert.equal(png.headers()["content-type"], "image/png"); assert.ok((await png.body()).length > 500);
  // edit destination and turn off
  await page.getByLabel("Destination").fill("example.com/winter"); await page.getByRole("button", { name: "Save changes" }).click(); await page.getByText("Saved").waitFor(); assert.equal((await hit(chromeUA)).headers()["location"], "https://example.com/winter");
  await page.getByRole("button", { name: "Turn off" }).click(); await page.getByText("Off", { exact: true }).waitFor(); assert.equal((await hit(chromeUA)).status(), 410); await page.getByRole("button", { name: "Turn on" }).click(); await page.getByText("Live", { exact: true }).waitFor();
  // richer shots from the seeded demo link
  await page.goto(base + "/app/l/launch26"); await page.getByTestId("total-clicks").waitFor(); await page.waitForTimeout(500); await save(page, "details");
  await page.locator(".bl-qr").screenshot({ path: `${dir}/qr.png` }); fs.copyFileSync(`${dir}/qr.png`, `${pub}qr.png`);
  await page.locator("section", { hasText: "Edit" }).last().screenshot({ path: `${dir}/edit.png` }); fs.copyFileSync(`${dir}/edit.png`, `${pub}edit.png`);
  // styled QR Code, analytics
  await page.goto(base + "/app/qr/new?link=launch26"); await page.getByRole("heading", { name: "Design your code" }).waitFor(); await page.getByRole("button", { name: "Orange" }).click(); await page.getByRole("button", { name: "Create your code" }).click(); await page.waitForURL(/\/app\/qr\/[A-Za-z0-9]+/);
  await page.goto(base + "/app/analytics"); await page.getByTestId("an-total").waitFor(); assert.notEqual(await page.getByTestId("an-total").innerText(), "0");
  // delete through the styled confirm
  await page.goto(base + "/app/links"); await page.locator('li[data-code="summer-sale"]').getByLabel("More actions").click(); await page.getByRole("menuitem", { name: "Delete" }).click(); await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click(); await page.waitForTimeout(500);
  assert.equal((await ctx.request.get(`${base}/s/summer-sale`, { maxRedirects: 0 })).status(), 404);
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const mp = await m.newPage();
  await mp.goto(base + "/login"); await mp.getByRole("button", { name: "Use the demo account" }).click(); await mp.waitForURL(/\/app/); await mp.goto(base + "/app/links"); await mp.waitForSelector("[data-testid=links] li"); await mp.screenshot({ path: `${dir}/mobile-links.png` });
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on mobile links");
  await mp.goto(base + "/app/l/launch26"); await mp.getByTestId("total-clicks").waitFor(); await mp.screenshot({ path: `${dir}/mobile-details.png` }); assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on mobile details"); await m.close(); await ctx.close();
  // marketing: hero shortener lands in the create flow with the URL kept (guest session minted on the way)
  const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p3 = await c3.newPage();
  await p3.goto(base); await p3.waitForLoadState("networkidle"); await p3.waitForTimeout(500); await p3.screenshot({ path: `${dir}/home-top.png` }); await p3.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await p3.getByLabel("Paste your long link here").fill("https://example.com/hello"); await p3.getByRole("button", { name: "Get your link for free" }).click(); await p3.waitForURL(/\/app\/links\/new\?url=/); assert.equal(await p3.getByLabel("Destination").inputValue(), "https://example.com/hello");
  await p3.goto(base + "/pricing"); await p3.waitForTimeout(300); await p3.screenshot({ path: `${dir}/home-pricing.png` }); await p3.goto(base + "/login"); await p3.waitForTimeout(300); await p3.screenshot({ path: `${dir}/login.png` });
  const c4 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p4 = await c4.newPage();
  await p4.goto(base); await p4.waitForTimeout(500); await p4.screenshot({ path: `${dir}/mobile-home.png` }); assert.ok(await p4.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile homepage");
  const c5 = await browser.newContext(); const p5 = await c5.newPage(); await p5.goto(base + "/app"); assert.match(p5.url(), /\/app$/); // guests land in the app (IsDead decision); /login still works for accounts
  const nf = await p5.goto(base + "/definitely-missing"); assert.equal(nf.status(), 404); await p5.getByText("Error 404 · Page not found").waitFor();
  console.log("bitlyisdead smoke OK");
});
