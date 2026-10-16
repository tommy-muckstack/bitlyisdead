// PR "QR Codes": builder (two steps, presets, pattern/corners/colours/frame/logo), list with scans, downloads PNG/SVG/JPEG, scan tracking.
import assert from "node:assert/strict";
import fs from "node:fs";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const R = Date.now().toString(36);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|404)/.test(m.text())) errs.push(m.text()); });
await p.goto(B + "/app/qr"); await p.waitForURL(/\/app\/qr$/); await p.getByText("No QR Codes yet.").waitFor();
await p.getByRole("link", { name: "Create QR Code" }).click(); await p.waitForURL(/\/app\/qr\/new/);
await p.getByLabel("Destination URL").fill("https://example.com/menu"); await p.getByLabel(/^Title/).fill("Menu " + R); await p.getByLabel(/back-half/).fill("menu-" + R); await p.getByRole("button", { name: "Design your code" }).click();
await p.getByRole("heading", { name: "Design your code" }).waitFor(); const before = await p.getByTestId("qr-live").innerHTML();
await p.getByRole("radio", { name: "Dots" }).click(); await p.getByRole("radio", { name: "Circle" }).click(); await p.getByRole("radio", { name: "Label" }).click(); await p.getByLabel("Frame text").fill("SCAN FOR MENU");
await p.getByLabel("Code color").fill("#1b5cf5"); await p.getByRole("button", { name: "Orange" }).click(); // preset overrides pattern/colours, keeps frame
const after = await p.getByTestId("qr-live").innerHTML(); assert.notEqual(before, after); assert.match(after, /SCAN FOR MENU/); assert.match(after, /#F36600/i);
// logo upload (tiny PNG) → image element in the preview
fs.writeFileSync("/tmp/logo.png", Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
await p.getByLabel("Upload logo").setInputFiles("/tmp/logo.png"); await p.waitForFunction(() => document.querySelector('[data-testid="qr-live"] image'));
await p.screenshot({ path: "docs/qa/2026-10-15/after-02-qr-builder.png", fullPage: true });
await p.getByRole("button", { name: "Create your code" }).click(); await p.waitForURL(/\/app\/qr\/[A-Za-z0-9]+\?created=1/); await p.getByTestId("qr-image").waitFor(); assert.match(await p.getByTestId("qr-image").innerHTML(), /SCAN FOR MENU/);
const id = p.url().match(/\/app\/qr\/([A-Za-z0-9]+)/)[1];
// downloads in all three formats
for (const [name, ext] of [["Download PNG", "png"], ["SVG", "svg"], ["JPEG", "jpg"]]) { const [d] = await Promise.all([p.waitForEvent("download"), p.getByRole("button", { name, exact: true }).click()]); assert.match(d.suggestedFilename(), new RegExp(`Menu-${R}-qr\\.${ext}$`)); const path = await d.path(); assert.ok(fs.statSync(path).size > 300, name + " non-empty"); }
// scan tracking: visiting the short link with ?r=qr counts a scan, a plain visit counts a click
const ua = { "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1" };
assert.equal((await p.request.get(`${B}/s/menu-${R}?r=qr`, { maxRedirects: 0, headers: ua })).status(), 307); await p.request.get(`${B}/s/menu-${R}?r=qr`, { maxRedirects: 0, headers: ua }); await p.request.get(`${B}/s/menu-${R}`, { maxRedirects: 0, headers: ua });
await p.reload(); await p.getByTestId("total-scans").waitFor(); assert.equal(await p.getByTestId("total-scans").innerText(), "2");
// list shows it with scans; search finds it; link details links to it
await p.goto(B + "/app/qr"); await p.waitForSelector("[data-testid=qrcodes] li[data-id]"); assert.match(await p.locator("h1").innerText(), /1 QR Code · 2 scans/); await p.screenshot({ path: "docs/qa/2026-10-15/after-02-qr-list.png" });
await p.getByRole("textbox", { name: "Search", exact: true }).fill("menu"); await p.locator(".as-hits").waitFor(); assert.ok((await p.locator(".as-hit em", { hasText: "QR Code" }).count()) >= 1, "qr in global search");
await p.goto(`${B}/app/l/menu-${R}`); await p.getByRole("link", { name: "Customize QR Code" }).waitFor(); assert.equal(await p.getByTestId("total-clicks").innerText(), "1");
// a second QR for the same link is refused; a QR from an existing link via the create-flow handoff works
const r2 = await p.request.post(B + "/api/qrcodes", { data: { code: "menu-" + R } }); assert.equal(r2.status(), 400);
const lk = (await (await p.request.post(B + "/api/links", { data: { url: "https://example.com/flyer-" + R, title: "Flyer" } })).json()).link; await p.goto(`${B}/app/qr/new?link=${lk.code}`); await p.getByRole("heading", { name: "Design your code" }).waitFor(); await p.getByRole("button", { name: "Create your code" }).click(); await p.waitForURL(/\/app\/qr\/[A-Za-z0-9]+\?created=1/);
// edit the design on the detail page, then delete
await p.getByRole("button", { name: "Customize" }).click(); await p.getByRole("radio", { name: "Rounded" }).first().click(); await p.getByRole("button", { name: "Save design" }).click(); await p.getByText("Saved").waitFor();
await p.getByRole("button", { name: "Delete" }).click(); await p.getByRole("dialog").getByRole("button", { name: "Delete" }).click(); await p.waitForURL(/\/app\/qr$/);
await p.goto(`${B}/app/qr/${id}`); assert.equal(await p.getByTestId("qr-image").count(), 1);
assert.deepEqual(errs, []); await b.close(); console.log("e2e-qr OK");
