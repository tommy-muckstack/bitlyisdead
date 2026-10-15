// PR "links list": tags, filters, sort, hide/unhide, bulk actions, styled delete, plural copy. BASE=… node scripts/e2e-links.mjs
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const R = Date.now().toString(36);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|404)/.test(m.text())) errs.push(m.text()); });
const mk = async (url, extra = {}) => { const r = await p.request.post(B + "/api/links", { data: { url, ...extra } }); assert.equal(r.status(), 201, await r.text()); return (await r.json()).link; };
await p.goto(B + "/app"); await p.waitForURL(/\/app$/);
const a = await mk("https://example.com/a-" + R, { title: "Alpha " + R, tags: ["spring", "social"] }); const bb = await mk("https://example.com/b-" + R, { title: "Bravo " + R, backHalf: "bravo-" + R, tags: ["spring"] }); const cc = await mk("https://example.com/c-" + R, { title: "Charlie " + R });
await p.goto(B + "/app/links"); await p.waitForSelector("[data-testid=links] li[data-code]");
assert.match(await p.locator("h1").innerText(), /3 links · 0 clicks/);
// filters: tag → 2, link type custom → 1, clear
await p.getByRole("button", { name: "Add filters" }).click(); const ft = p.getByLabel("Tags", { exact: true }); await ft.fill("spring"); await ft.press("Enter"); assert.equal(await p.locator("li[data-code]").count(), 2);
await p.getByLabel("Link type").selectOption("custom"); assert.equal(await p.locator("li[data-code]").count(), 1); assert.equal(await p.locator("li[data-code]").getAttribute("data-code"), bb.code);
await p.getByRole("button", { name: "Clear all filters" }).click(); assert.equal(await p.locator("li[data-code]").count(), 3);
// sort oldest first → Alpha first; created-date filter (custom range in the future) → 0
await p.getByLabel("Sort").selectOption("oldest"); assert.match(await p.locator("li[data-code] .bl-row__t").first().innerText(), /Alpha/);
await p.getByLabel("Filter by created date").selectOption("custom"); await p.getByLabel("From date").fill("2099-01-01"); assert.equal(await p.locator("li[data-code]").count(), 0); await p.getByRole("button", { name: "Clear all filters" }).click();
// tag chip click filters; search by tag text
await p.locator(`li[data-code="${a.code}"] .bl-tag`, { hasText: "social" }).click(); assert.equal(await p.locator("li[data-code]").count(), 1); await p.getByRole("button", { name: "Clear all filters" }).click();
await p.getByLabel("Search links").fill("charlie"); assert.equal(await p.locator("li[data-code]").count(), 1); await p.getByLabel("Search links").fill("");
// ⋯ menu: hide → disappears from Active, appears under Hidden; unhide
await p.locator(`li[data-code="${cc.code}"]`).getByLabel("More actions").click(); await p.getByRole("menuitem", { name: "Hide link" }).click(); await p.waitForFunction((n) => document.querySelectorAll("li[data-code]").length === n, 2);
await p.getByLabel("Show active or hidden links").selectOption("hidden"); assert.equal(await p.locator("li[data-code]").count(), 1); await p.locator("li[data-code]").getByLabel("More actions").click(); await p.getByRole("menuitem", { name: "Show link" }).click(); await p.waitForFunction(() => document.querySelectorAll("li[data-code]").length === 0);
await p.getByLabel("Show active or hidden links").selectOption("active"); assert.equal(await p.locator("li[data-code]").count(), 3);
// bulk: select all → Add tags → every row has "bulk"; select two → Delete → styled confirm → gone
await p.getByLabel("Select all links").check(); await p.getByRole("button", { name: "Add tags" }).click(); const mt = p.getByLabel("Tags", { exact: true }).last(); await mt.fill("bulk"); await mt.press("Enter"); await p.getByRole("button", { name: "Save" }).click(); await p.waitForFunction(() => document.querySelectorAll(".bl-tag").length >= 6);
assert.equal(await p.locator(".bl-tag", { hasText: "bulk" }).count(), 3);
await p.getByLabel(`Select ${a.title}`).check(); await p.getByLabel(`Select ${bb.title}`).check(); assert.match(await p.locator(".bl-bulk label").innerText(), /2 links selected/); await p.getByRole("button", { name: "Delete", exact: true }).click();
const dlg = p.getByRole("dialog"); await dlg.waitFor(); assert.match(await dlg.innerText(), /Delete 2 links\?/); await dlg.getByRole("button", { name: "Delete" }).click(); await p.waitForFunction(() => document.querySelectorAll("li[data-code]").length === 1);
assert.match(await p.locator("h1").innerText(), /1 link · 0 clicks/);
// details: tags editor + styled delete confirm, singular click
await p.request.get(B + "/s/" + cc.code, { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" } });
await p.goto(B + "/app/l/" + cc.code); await p.getByTestId("total-clicks").waitFor(); assert.equal(await p.locator("[data-testid=total-clicks] + span").innerText(), "click");
const dt = p.getByLabel("Tags", { exact: true }); await dt.fill("edited"); await dt.press("Enter"); await p.getByRole("button", { name: "Save changes" }).click(); await p.getByText("Saved").waitFor();
await p.getByRole("button", { name: "Delete" }).click(); await p.getByRole("dialog").waitFor(); await p.getByRole("dialog").getByRole("button", { name: "Cancel" }).click(); assert.equal(await p.getByRole("dialog").count(), 0);
await p.getByRole("button", { name: "Delete" }).click(); await p.getByRole("dialog").getByRole("button", { name: "Delete" }).click(); await p.waitForURL(/\/app\/links$/);
assert.deepEqual(errs, []); await b.close(); console.log("e2e-links OK");
