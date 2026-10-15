// PR "app shell": real routes, Home dashboard, create flow, global search, branded 404. BASE=http://localhost:3017/bitlyisdead node scripts/e2e-shell.mjs
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const BH = "docs-" + Date.now().toString(36); // back-halves are global, so make a unique one per run
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|404)/.test(m.text())) errs.push(m.text()); }); // validation 400s and probed 404s are expected;
await p.goto(B + "/app"); await p.waitForURL(/\/app$/); await p.getByRole("heading", { name: /connections platform|Welcome back/ }).waitFor();
// Home quick create
await p.getByLabel("Enter your destination URL").fill("https://example.com/launch?x=1"); await p.getByRole("button", { name: "Create your link" }).click(); await p.getByTestId("fresh").waitFor(); assert.match(await p.getByTestId("fresh-url").innerText(), /\/bitlyisdead\/s\/[A-Za-z0-9]{6}$/);
// Create-link page with title, back-half and tags → lands on details
await p.getByRole("link", { name: "Create new" }).click(); await p.waitForURL(/\/app\/links\/new/);
await p.getByLabel("Destination").fill("example.com/docs"); await p.getByLabel(/^Title/).fill("Docs page"); await p.getByLabel(/Custom back-half/).fill(BH);
const tags = p.getByLabel(/^Tags/); await tags.fill("docs"); await tags.press("Enter"); await tags.fill("guide"); await tags.press("Enter"); assert.equal(await p.locator(".tg-chip").count(), 2);
await p.getByRole("button", { name: "Create your link" }).click(); await p.waitForURL(new RegExp("/app/l/" + BH)); await p.getByTestId("total-clicks").waitFor();
// taken back-half + invalid URL errors still there
await p.goto(B + "/app/links/new"); await p.getByLabel("Destination").fill("https://example.com/x"); await p.getByLabel(/Custom back-half/).fill(BH); await p.getByRole("button", { name: "Create your link" }).click(); await p.getByText("That back-half is taken.").waitFor();
await p.getByLabel(/Custom back-half/).fill(""); await p.getByLabel("Destination").fill("not a url"); await p.getByRole("button", { name: "Create your link" }).click(); await p.getByText("That doesn't look like a valid link.").waitFor();
// Global search: live hits + Enter → /app/links?q=
await p.goto(B + "/app"); const sb = p.getByRole("textbox", { name: "Search" }); await sb.fill("guide"); await p.locator(".as-hits").waitFor(); assert.equal(await p.locator('.as-hit:not(.as-hit--all):not(.as-hit--none)').count(), 1, "tag search hit");
await sb.press("Enter"); await p.waitForURL(/\/app\/links\?q=guide/); assert.equal(await p.locator("[data-testid=links] li[data-code]").count(), 1);
await p.locator(".as-hit b").first().isVisible().catch(() => {});
// Active nav + singular copy
await p.goto(B + "/app/links"); assert.equal(await p.locator(".as-it.on").innerText(), "Links"); assert.match(await p.locator(".bl-head h2").innerText(), /2 links · 0 clicks/);
await p.goto(B + "/app/l/" + BH); assert.equal(await p.locator(".as-it.on").innerText(), "Links");
// Branded 404 for unknown URLs (marketing and app)
for (const u of ["/no-such-page", "/app/nope"]) { const r = await p.goto(B + u); assert.equal(r.status(), 404); await p.getByText("Error 404 · Page not found").waitFor(); }
// Sign out → landing; the next /app visit is a fresh guest workspace (0 links)
await p.goto(B + "/app"); await p.getByRole("button", { name: "Sign out" }).click(); await p.waitForURL(u => !u.pathname.includes("/app"), { waitUntil: "commit" }); await p.waitForTimeout(800); assert.match(p.url(), /\/bitlyisdead\/?$/);
await p.goto(B + "/app/links"); await p.waitForURL(/\/app\/links/); assert.match(await p.locator(".bl-head h2").innerText(), /0 links/);
assert.deepEqual(errs, []); await b.close(); console.log("e2e-shell OK");
