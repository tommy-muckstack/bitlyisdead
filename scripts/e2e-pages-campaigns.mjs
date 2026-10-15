// PR "pages + campaigns": link-in-bio builder → publish at /p/<slug> with views + block clicks; campaigns with UTM defaults + rolled-up analytics.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const R = Date.now().toString(36);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|404)/.test(m.text())) errs.push(m.text()); });
// ---- Pages
await p.goto(B + "/app/pages"); await p.waitForURL(/\/app\/pages$/); await p.getByRole("button", { name: "Create page" }).click(); await p.waitForURL(/\/app\/pages\/[A-Za-z0-9]+$/);
await p.getByLabel("Title").fill("Sunny Bakes"); await p.getByLabel("Bio").fill("Sourdough, pastries and coffee in Portland."); await p.getByLabel(/Avatar emoji/).fill("🥐"); await p.getByRole("radio", { name: "Sunset" }).click(); await p.getByLabel("Page URL").fill("sunny-" + R);
await p.getByRole("button", { name: "+ Link" }).click(); await p.getByLabel("Block 1 title").fill("Order online"); await p.getByLabel("Block 1 URL").fill("example.com/order");
await p.getByRole("button", { name: "+ Heading" }).click(); await p.getByLabel("Block 2 title").fill("Find us"); await p.getByRole("button", { name: "+ Link" }).click(); await p.getByLabel("Block 3 title").fill("Map"); await p.getByLabel("Block 3 URL").fill("https://maps.example.com/sunny");
await p.getByLabel("Move block 3 up").click(); assert.equal(await p.getByLabel("Block 2 title").inputValue(), "Map"); // reorder
assert.match(await p.locator(".pe-phone .pg-t").innerText(), /Sunny Bakes/); assert.equal(await p.locator(".pe-phone .pg-link").count(), 2); // live preview
await p.screenshot({ path: "docs/qa/2026-10-15/after-03-pages-editor.png", fullPage: true });
await p.getByRole("button", { name: "Save changes" }).click(); await p.getByText("Saved", { exact: true }).first().waitFor();
// draft is not public; publish → public page renders, counts a view, link block redirects + counts a click
assert.equal((await p.request.get(`${B}/p/sunny-${R}`)).status(), 404);
await p.getByRole("button", { name: "Publish" }).click(); await p.getByRole("link", { name: "View live page" }).waitFor();
const pc = await b.newContext({ userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1", viewport: { width: 390, height: 844 } }); const pub = await pc.newPage(); const pr = await pub.goto(`${B}/p/sunny-${R}`); assert.equal(pr.status(), 200); await pub.getByRole("heading", { name: "Sunny Bakes" }).waitFor(); assert.equal(await pub.locator(".pg-link").count(), 2); await pub.screenshot({ path: "docs/qa/2026-10-15/after-03-pages-public.png" });
const blk = await pub.locator(".pg-link").first().getAttribute("href"); const rr = await pub.request.get("http://localhost:3017" + blk, { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (iPhone) AppleWebKit Mobile Safari" } }); assert.equal(rr.status(), 307); assert.equal(rr.headers().location, "https://example.com/order"); await pc.close();
await p.reload(); await p.getByText(/1 view so far/).waitFor(); assert.match(await p.locator(".pe-block").first().innerText(), /1 click/);
// taken slug error; global search finds the page
const other = await p.request.post(B + "/api/pages", { data: { title: "Other" } }); const oid = (await other.json()).page.id; const dup = await p.request.patch(`${B}/api/pages/${oid}`, { data: { slug: "sunny-" + R } }); assert.equal(dup.status(), 400); assert.match((await dup.json()).error, /taken/);
await p.getByRole("textbox", { name: "Search", exact: true }).fill("sunny"); await p.locator(".as-hits").waitFor(); assert.ok((await p.locator(".as-hit em", { hasText: "Page" }).count()) >= 1);
// ---- Campaigns
await p.goto(B + "/app/campaigns"); await p.getByRole("link", { name: "Create campaign" }).click(); await p.waitForURL(/\/app\/campaigns\/new/);
await p.getByLabel("Name").fill("Spring launch " + R); await p.getByLabel("Source").fill("newsletter"); await p.getByLabel("Medium").fill("email"); await p.getByLabel("Campaign").fill("spring-" + R); await Promise.all([p.waitForURL(/\/app\/campaigns\/(?!new$)[A-Za-z0-9]+$/, { waitUntil: "commit" }), p.getByRole("button", { name: "Create campaign" }).click()]); await p.getByRole("button", { name: "Add existing links" }).waitFor(); const cid = p.url().split("/").pop();
// create a link inside the campaign: UTM defaults pre-filled, link lands in the campaign
await p.getByRole("link", { name: "Create link" }).click(); await p.waitForURL(u => u.pathname.endsWith("/app/links/new") && u.searchParams.get("campaign") === cid, { waitUntil: "commit" }); await p.getByLabel("Destination").waitFor(); assert.equal(await p.getByLabel("Source").inputValue(), "newsletter");
await p.getByLabel("Destination").fill("https://example.com/spring"); await p.getByLabel(/^Title/).fill("Spring hero"); await p.getByRole("button", { name: "Create your link" }).click(); await p.waitForURL(/\/app\/l\//); assert.match(await p.locator(".bl-row__u").first().innerText(), /utm_source=newsletter&utm_medium=email&utm_campaign=spring-/);
await p.getByRole("link", { name: "In a campaign →" }).click(); await p.waitForURL(new RegExp(`/app/campaigns/${cid}$`)); assert.equal(await p.locator("[data-testid=cp-links] li").count(), 1);
// add an existing link via the picker, click one, analytics roll up
const extra = (await (await p.request.post(B + "/api/links", { data: { url: "https://example.com/extra-" + R, title: "Extra" } })).json()).link;
await p.reload(); await p.getByRole("button", { name: "Add existing links" }).click(); await p.getByRole("dialog").getByLabel(/Extra/).check(); await p.getByRole("button", { name: "Add 1 link" }).click(); await p.waitForFunction(() => document.querySelectorAll("[data-testid=cp-links] li").length === 2);
await p.request.get(`${B}/s/${extra.code}`, { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (Macintosh) Chrome/126.0 Safari/537.36", referer: "https://news.ycombinator.com/" } }); await p.reload(); await p.getByTestId("cp-clicks").waitFor(); assert.equal(await p.getByTestId("cp-clicks").innerText(), "1"); await p.getByText("news.ycombinator.com").waitFor();
await p.screenshot({ path: "docs/qa/2026-10-15/after-05-campaign.png", fullPage: true });
await p.getByLabel("Remove Extra from campaign").click(); await p.waitForFunction(() => document.querySelectorAll("[data-testid=cp-links] li").length === 1);
assert.deepEqual(errs, []); await b.close(); console.log("e2e-pages-campaigns OK");
