// PR "analytics": global Analytics page with date range, top links, referrers, devices, locations; link details show countries/cities from geo headers.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const R = Date.now().toString(36);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|404)/.test(m.text())) errs.push(m.text()); });
await p.goto(B + "/app"); await p.waitForURL(/\/app$/);
const a = (await (await p.request.post(B + "/api/links", { data: { url: "https://example.com/a-" + R, title: "Alpha" } })).json()).link; const bb = (await (await p.request.post(B + "/api/links", { data: { url: "https://example.com/b-" + R, title: "Bravo" } })).json()).link;
const ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";
for (let i = 0; i < 3; i++) await p.request.get(`${B}/s/${a.code}`, { maxRedirects: 0, headers: { "user-agent": ua, referer: "https://instagram.com/x", "x-vercel-ip-country": "US", "x-vercel-ip-city": "Portland" } });
await p.request.get(`${B}/s/${bb.code}`, { maxRedirects: 0, headers: { "user-agent": ua, "x-vercel-ip-country": "GB", "x-vercel-ip-city": "London" } }); await p.request.get(`${B}/s/${bb.code}?r=qr`, { maxRedirects: 0, headers: { "user-agent": ua, "x-vercel-ip-country": "GB", "x-vercel-ip-city": "London" } });
await p.request.get(`${B}/s/${a.code}`, { maxRedirects: 0, headers: { "user-agent": "Googlebot/2.1" } }); // bot: not counted
await p.goto(B + "/app/analytics"); await p.waitForURL(/\/app\/analytics/); assert.equal(await p.locator(".as-it.on").innerText(), "Analytics"); await p.getByTestId("an-total").waitFor();
assert.equal(await p.getByTestId("an-total").innerText(), "5"); assert.match(await p.locator("[data-testid=an-top] tbody tr").first().innerText(), /Alpha/);
for (const t of ["instagram.com", "mobile", "Safari", "US", "GB", "Portland, US", "London, GB"]) await p.getByText(t, { exact: true }).first().waitFor();
await p.screenshot({ path: "docs/qa/2026-10-15/after-07-analytics.png", fullPage: true });
await p.getByLabel("Date range").selectOption("7"); await p.waitForURL(/days=7/); await p.getByTestId("an-total").waitFor(); assert.equal(await p.getByTestId("an-total").innerText(), "5");
await p.getByLabel("Date range").selectOption("custom"); await p.waitForURL(/from=/); await p.getByLabel("From date").fill("2020-01-01"); await p.waitForURL(/from=2020-01-01/); await p.getByLabel("To date").fill("2020-01-02"); await p.waitForURL(/to=2020-01-02/); await p.getByText("No engagements in this range yet.").waitFor();
const [dl] = await Promise.all([p.waitForEvent("download"), p.getByRole("button", { name: "Export CSV" }).click()]); assert.match(dl.suggestedFilename(), /\.csv$/);
// per-link locations (finding #7)
await p.goto(`${B}/app/l/${bb.code}`); await p.getByTestId("total-clicks").waitFor(); await p.getByText("London, GB").waitFor(); assert.equal(await p.getByTestId("total-scans").innerText(), "1");
assert.deepEqual(errs, []); await b.close(); console.log("e2e-analytics OK");
