// PR "create flow": title, domain, back-half, UTM builder with preview, QR toggle, create speed. BASE=… node scripts/e2e-create.mjs
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const R = Date.now().toString(36);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|404)/.test(m.text())) errs.push(m.text()); });
await p.goto(B + "/app/links/new"); await p.waitForURL(/\/app\/links\/new/);
await p.getByLabel("Destination").fill("https://example.com/spring?ref=1"); await p.getByLabel(/^Title/).fill("Spring " + R); await p.getByLabel(/Custom back-half/).fill("spring-" + R);
assert.match(await p.locator("#c-dom option").first().innerText(), /bitlyisdead\/s\//);
// UTM builder: toggle, fill, preview merges with existing query
await p.getByRole("switch", { name: "Add UTM parameters" }).check(); await p.getByLabel("Source").fill("newsletter"); await p.getByLabel("Medium").fill("email"); await p.getByLabel("Campaign").fill("spring 26");
await p.getByRole("button", { name: "Add custom URL parameter" }).click(); await p.getByLabel("Custom parameter 1 name").fill("promo"); await p.getByLabel("Custom parameter 1 value").fill("A1");
assert.equal(await p.getByTestId("utm-preview").innerText(), "https://example.com/spring?ref=1&utm_source=newsletter&utm_medium=email&utm_campaign=spring+26&promo=A1");
await p.screenshot({ path: "docs/qa/2026-10-15/after-09-create-utm.png", fullPage: true });
const t0 = Date.now(); await p.getByRole("button", { name: "Create your link" }).click(); await p.waitForURL(new RegExp(`/app/l/spring-${R}`)); const ms = Date.now() - t0; console.log(`create → details in ${ms} ms`); assert.ok(ms < 4000, "create under 4 s locally");
assert.match(await p.locator(".bl-row__u").first().innerText(), /utm_campaign=spring\+26&promo=A1/);
// QR toggle changes the CTA and lands on the QR flow (route added by the QR Codes PR; here we only assert the handoff URL)
await p.goto(B + "/app/links/new?url=https%3A%2F%2Fexample.com%2Fqr"); assert.equal(await p.getByLabel("Destination").inputValue(), "https://example.com/qr");
await p.getByRole("switch", { name: /QR Code/ }).check(); assert.equal(await p.getByRole("button", { name: "Continue to QR Code" }).count(), 1);
await p.getByRole("button", { name: "Continue to QR Code" }).click(); await p.waitForURL(/\/app\/qr\/new\?link=/);
assert.deepEqual(errs, []); await b.close(); console.log("e2e-create OK");
