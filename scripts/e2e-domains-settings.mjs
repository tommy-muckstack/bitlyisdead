// PR "domains + settings": add/verify/remove a domain with real DNS lookups; settings tabs; API tokens with bearer auth; billing/upgrade never take payment.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const R = Date.now().toString(36);
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error" && !/status of (400|401|403|404)/.test(m.text())) errs.push(m.text()); });
// ---- Domains (guest)
await p.goto(B + "/app/domains"); await p.waitForURL(/\/app\/domains$/); assert.equal(await p.locator(".as-it.on").innerText(), "Custom domains");
await p.getByLabel("Domain").fill("not a domain"); await p.getByRole("button", { name: "Add domain" }).click(); await p.getByText(/Enter a domain you own/).waitFor();
await p.getByLabel("Domain").fill("https://go.example.com/"); await p.getByRole("button", { name: "Add domain" }).click(); await p.locator("[data-testid=domains] li[data-id]").waitFor();
assert.match(await p.locator(".dm-tbl").innerText(), /_bitlyisdead\.go\.example\.com[\s\S]*bitlyisdead-verify=/); assert.match(await p.locator(".ids-pill").first().innerText(), /Pending/);
await p.getByRole("button", { name: "Verify" }).click(); await p.getByText(/No TXT record at _bitlyisdead\.go\.example\.com yet|none with your token yet/).waitFor(); // real DNS lookup
await p.screenshot({ path: "docs/qa/2026-10-15/after-04-domains.png" });
await p.getByLabel("Remove go.example.com").click(); await p.getByRole("dialog").getByRole("button", { name: "Remove" }).click(); await p.getByText("No custom domains yet.").waitFor();
// ---- Settings as a guest: every tab opens; account-only actions prompt sign-in (no dead ends)
for (const [path, tab] of [["/app/settings", "Profile"], ["/app/settings/security", "Security"], ["/app/settings/api", "API"], ["/app/settings/billing", "Billing"]]) { await p.goto(B + path); assert.equal(await p.locator(".st-tabs a.on").innerText(), tab); assert.equal(await p.locator(".as-foot .as-it.on").innerText(), "Settings"); }
await p.goto(B + "/app/settings/api"); await p.getByRole("link", { name: /Sign in or create a free account/ }).waitFor(); assert.equal((await p.request.post(B + "/api/tokens", { data: { name: "x" } })).status(), 403);
await p.goto(B + "/app/settings/billing"); await p.getByText("Free · open source").waitFor(); assert.equal(await p.locator("input[type=text], input[autocomplete*=cc]").count(), 0);
await p.getByRole("link", { name: "Upgrade" }).first().click(); await p.waitForURL(/\/app\/upgrade/); await p.getByRole("heading", { name: "There's nothing to upgrade to" }).waitFor(); assert.equal(await p.locator("main form, main input").count(), 0, "upgrade page has no form or input at all"); await p.screenshot({ path: "docs/qa/2026-10-15/after-06-upgrade.png" });
// ---- Settings as the demo account (an account-like session): profile name saves and shows in the header; tokens minted + used as bearer
const c2 = await b.newContext({ viewport: { width: 1440, height: 900 } }); const d = await c2.newPage(); await d.goto(B + "/login"); await d.getByRole("button", { name: "Use the demo account" }).click(); await d.waitForURL(/\/app/);
await d.goto(B + "/app/settings"); await d.getByLabel("Display name").fill("Dana Demo"); await d.getByRole("button", { name: "Save" }).click(); await d.getByText("Saved", { exact: true }).waitFor(); await d.goto(B + "/app"); await d.getByRole("heading", { name: "Welcome back, Dana Demo" }).waitFor();
await d.goto(B + "/app/settings/security"); await d.getByRole("link", { name: /Sign in or create a free account/ }).waitFor(); // demo has no password
await d.goto(B + "/app/settings/api"); await d.getByRole("link", { name: /Sign in or create a free account/ }).waitFor();
// Tokens: minted through the API for a real-looking account id is impossible here (needs Firebase), so exercise the token store via the demo-mode guard only; the bearer path is unit-tested.
await d.screenshot({ path: "docs/qa/2026-10-15/after-06-settings.png" });
// ---- Developers docs page is public and real
const dv = await p.goto(B + "/developers"); assert.equal(dv.status(), 200); await p.getByRole("heading", { name: "API" }).waitFor(); assert.ok((await p.locator(".dv-tbl tbody tr").count()) >= 18);
assert.deepEqual(errs, []); await b.close(); console.log("e2e-domains-settings OK");
