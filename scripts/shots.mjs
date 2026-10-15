// Drives the real app (production build, demo account) to capture product shots AND smoke-test the core flow.
import fs from "node:fs";
import assert from "node:assert/strict";
import { withApp, demoPage, out } from "./shotlib.mjs";
const dir = out("bitlyisdead"); const pub = new URL("../public/home/", import.meta.url).pathname; fs.mkdirSync(pub, { recursive: true });
const save = async (page, name, opts = {}) => { await page.screenshot({ path: `${dir}/${name}.png`, ...opts }); fs.copyFileSync(`${dir}/${name}.png`, `${pub}${name}.png`); };
await withApp("bitlyisdead", async ({ base, browser }) => {
  const root = base.replace("/bitlyisdead", "");
  const { ctx, page } = await demoPage(browser, base, { w: 1440, h: 900 });
  await page.waitForSelector('[data-testid="links"] li'); await page.waitForTimeout(300);
  // create a link with a custom back-half through the UI
  await page.getByLabel("Destination URL").fill("https://example.com/summer/sale?utm_source=poster&utm_campaign=summer-2026-very-long"); await page.getByRole("button", { name: /Title, custom back-half/ }).click();
  await page.getByLabel("Title").fill("Summer sale poster"); await page.getByLabel("Custom back-half").fill("summer-sale"); await page.getByRole("button", { name: "Shorten", exact: true }).click();
  await page.getByTestId("fresh").waitFor(); assert.match(await page.getByTestId("fresh-url").innerText(), /\/bitlyisdead\/s\/summer-sale$/);
  await page.getByRole("button", { name: "− Fewer options" }).click(); await page.waitForTimeout(200); await save(page, "links"); await page.getByRole("button", { name: /Title, custom back-half/ }).click();
  // errors
  await page.getByLabel("Destination URL").fill("javascript:alert(1)"); await page.getByRole("button", { name: "Shorten", exact: true }).click(); await page.locator(".bl-new [role=alert]").waitFor(); assert.match(await page.locator(".bl-new [role=alert]").innerText(), /http/);
  await page.getByLabel("Destination URL").fill("https://example.com/again"); await page.getByLabel("Custom back-half").fill("summer-sale"); await page.getByRole("button", { name: "Shorten", exact: true }).click(); await page.getByText("That back-half is taken.").waitFor();
  await page.getByLabel("Custom back-half").fill(""); await page.getByLabel("Destination URL").fill(""); await page.waitForTimeout(200);
  // the short link redirects (307) and counts a real browser visit; bots and expired/off links don't count
  const chromeUA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
  const hit = (ua, ref) => ctx.request.get(`${base}/s/summer-sale`, { maxRedirects: 0, headers: { "user-agent": ua, ...(ref ? { referer: ref } : {}) } });
  for (let i = 0; i < 3; i++) { const r = await hit(chromeUA, "https://news.ycombinator.com/item?id=1"); assert.equal(r.status(), 307); assert.equal(r.headers()["location"], "https://example.com/summer/sale?utm_source=poster&utm_campaign=summer-2026-very-long"); assert.equal(r.headers()["cache-control"], "no-store"); }
  await hit("Googlebot/2.1"); assert.equal((await ctx.request.get(`${base}/s/nope-nope`, { maxRedirects: 0 })).status(), 404);
  // details page
  await page.reload(); await page.getByRole("link", { name: "Summer sale poster" }).click(); await page.getByTestId("total-clicks").waitFor(); assert.equal(await page.getByTestId("total-clicks").innerText(), "3"); await page.getByText("news.ycombinator.com").waitFor();
  const qr = await ctx.request.get(`${base}/api/qr/summer-sale`); assert.equal(qr.headers()["content-type"], "image/svg+xml"); assert.match(await qr.text(), /^<svg/); const png = await ctx.request.get(`${base}/api/qr/summer-sale?format=png`); assert.equal(png.headers()["content-type"], "image/png"); assert.ok((await png.body()).length > 500);
  // edit destination and turn off
  await page.getByLabel("Destination").fill("example.com/winter"); await page.getByRole("button", { name: "Save changes" }).click(); await page.getByText("Saved").waitFor(); assert.equal((await hit(chromeUA)).headers()["location"], "https://example.com/winter");
  await page.getByRole("button", { name: "Turn off" }).click(); await page.getByText("Off", { exact: true }).waitFor(); assert.equal((await hit(chromeUA)).status(), 410); await page.getByRole("button", { name: "Turn on" }).click(); await page.getByText("Live", { exact: true }).waitFor();
  // richer shots from the seeded demo link
  await page.goto(base + "/app/l/launch26"); await page.getByTestId("total-clicks").waitFor(); await page.waitForTimeout(500); await save(page, "details");
  await page.locator(".bl-qr").screenshot({ path: `${dir}/qr.png` }); fs.copyFileSync(`${dir}/qr.png`, `${pub}qr.png`);
  await page.locator("section", { hasText: "Edit" }).last().screenshot({ path: `${dir}/edit.png` }); fs.copyFileSync(`${dir}/edit.png`, `${pub}edit.png`);
  // delete
  await page.goto(base + "/app"); await page.getByRole("button", { name: "Delete summer-sale" }).evaluate(() => {}); page.once("dialog", d => d.accept()); await page.getByRole("button", { name: "Delete summer-sale" }).click(); await page.waitForTimeout(400);
  assert.equal((await ctx.request.get(`${base}/s/summer-sale`, { maxRedirects: 0 })).status(), 404);
  // mobile
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const mp = await m.newPage();
  await mp.goto(base + "/login"); await mp.getByRole("button", { name: "Use the demo account" }).click(); await mp.waitForURL(/\/app/); await mp.waitForSelector('[data-testid="links"] li'); await mp.screenshot({ path: `${dir}/mobile-links.png` });
  assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on mobile links");
  await mp.goto(base + "/app/l/launch26"); await mp.getByTestId("total-clicks").waitFor(); await mp.screenshot({ path: `${dir}/mobile-details.png` }); assert.ok(await mp.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on mobile details"); await m.close(); await ctx.close();
  // marketing
  const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const p3 = await c3.newPage();
  await p3.goto(base); await p3.waitForTimeout(500); await p3.screenshot({ path: `${dir}/home-top.png` }); await p3.screenshot({ path: `${dir}/home-full.png`, fullPage: true });
  await p3.getByLabel("Paste a long link").fill("https://example.com/hello"); await p3.getByRole("button", { name: "Get your link" }).first().click(); await p3.waitForURL(/\/login/); assert.match(decodeURIComponent(p3.url()), /callbackUrl=\/app\?url=https%3A%2F%2Fexample.com%2Fhello/);
  await p3.goto(base + "/#pricing"); await p3.waitForTimeout(300); await p3.screenshot({ path: `${dir}/home-pricing.png` }); await p3.goto(base + "/login"); await p3.waitForTimeout(300); await p3.screenshot({ path: `${dir}/login.png` });
  const c4 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); const p4 = await c4.newPage();
  await p4.goto(base); await p4.waitForTimeout(500); await p4.screenshot({ path: `${dir}/mobile-home.png` }); assert.ok(await p4.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), "no horizontal scroll on the mobile homepage");
  const c5 = await browser.newContext(); const p5 = await c5.newPage(); await p5.goto(base + "/app"); assert.match(p5.url(), /\/login/);
  console.log("bitlyisdead smoke OK");
});
