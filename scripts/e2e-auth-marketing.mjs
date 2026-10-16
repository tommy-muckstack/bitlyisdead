// PR "auth + marketing": hero shortener → app with the URL, 'Add tracking' route, real pricing + working toggle, every footer link resolves,
// login/signup without dead providers, forgot-password on its own URL, clean console.
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
const B = process.env.BASE || "http://localhost:3017/bitlyisdead"; const ORIGIN = new URL(B).origin;
const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
const errs = []; p.on("pageerror", e => errs.push(String(e))); p.on("console", m => { if (m.type() === "error") errs.push(m.text()); });
// #13 hero shortener: pending URL survives into the app (fresh visitor → guest session → create page pre-filled)
await p.goto(B + "/"); await p.getByLabel("Paste your long link here").fill("https://example.com/hero?x=1"); await p.getByRole("button", { name: "Get your link for free" }).click();
await p.waitForURL(/\/app\/links\/new\?url=/); assert.equal(await p.getByLabel("Destination").inputValue(), "https://example.com/hero?x=1");
// QR tab goes to the QR flow
await p.goto(B + "/"); await p.getByRole("button", { name: "QR Code" }).first().click(); await p.getByLabel("Enter your QR Code destination").fill("example.com/menu"); await p.getByRole("button", { name: "Get your QR Code for free" }).click(); await p.waitForURL(/\/app\/qr\/new\?url=/);
// #14 'Add tracking to your link' is a real route
await p.goto(B + "/"); const trk = await p.getByRole("link", { name: "Add tracking to your link" }).getAttribute("href"); assert.match(trk, /^\/bitlyisdead\/app\/links\/new/);
// landing nav + promo + use-case + footer: every internal link resolves (no 404s, no /login dead ends)
await p.goto(B + "/"); const hrefs = await p.locator(".bz a[href]").evaluateAll(as => Array.from(new Set(as.map(a => a.getAttribute("href")))));
const internal = hrefs.filter(h => h.startsWith("/bitlyisdead")); assert.ok(internal.length >= 20, "footer+nav links present: " + internal.length);
for (const h of internal) { const r = await p.request.get(ORIGIN + h.split("#")[0], { maxRedirects: 5 }); assert.ok(r.status() < 400, `${h} → ${r.status()}`); }
assert.equal(internal.filter(h => h.endsWith("/login")).length, 1, "only the real Log in link points at /login"); assert.equal(await p.locator(".bz-soc, .bz-badges, .bz-lang").count(), 0);
await p.screenshot({ path: "docs/qa/2026-10-15/after-15-footer.png", fullPage: true });
// #16 pricing: real prices, Free has 2 QR Codes, toggle changes to monthly
await p.goto(B + "/pricing"); await p.getByTestId("price-CORE").waitFor(); const txt = async id => (await p.getByTestId(`price-${id}`).innerText()).replace(/\s+/g, "");
assert.equal(await txt("FREE"), "$0/month"); assert.equal(await txt("CORE"), "$10/month"); assert.equal(await txt("GROWTH"), "$29/month"); assert.equal(await txt("PREMIUM"), "$199/month");
assert.match(await p.locator("[data-plan=FREE]").innerText(), /2 QR Codes\/month/); assert.match(await p.locator("[data-plan=CORE]").innerText(), /Annual charge of \$120/); assert.match(await p.locator("[data-plan=GROWTH]").innerText(), /\$348/);
await p.getByRole("button", { name: "Pay Monthly" }).click(); assert.equal(await txt("CORE"), "AnnualOnly"); assert.equal(await txt("GROWTH"), "$35/month"); assert.equal(await txt("PREMIUM"), "$300/month");
await p.getByRole("button", { name: "Pay annually" }).click(); assert.equal(await txt("GROWTH"), "$29/month"); await p.screenshot({ path: "docs/qa/2026-10-15/after-16-pricing.png" });
// #17/#18 login + signup: Google + email/password only; legal links real; signup visible
await p.goto(B + "/login"); assert.equal(await p.getByRole("button", { name: /Apple|Single Sign On/ }).count(), 0); assert.equal(await p.getByRole("button", { name: "Continue with Google" }).count(), 1);
for (const l of ["Terms of Service", "Privacy Policy", "Acceptable Use Policy"]) { const h = await p.getByRole("link", { name: l }).getAttribute("href"); assert.ok(!h.startsWith("#"), l); }
await p.screenshot({ path: "docs/qa/2026-10-15/after-17-login.png" });
await p.getByRole("link", { name: "Sign up" }).click(); await p.getByRole("button", { name: "Create free account" }).waitFor(); assert.equal(await p.getByText("Log in with SSO").count(), 0); await p.screenshot({ path: "docs/qa/2026-10-15/after-18-signup.png" });
// #19 forgot password has its own URL
await p.goto(B + "/login"); await p.getByRole("link", { name: "Forgot your password?" }).click(); await p.waitForURL(/\/forgot-password$/); await p.getByRole("heading", { name: "Reset your password" }).waitFor(); assert.equal(await p.getByRole("button", { name: "Reset" }).count(), 1); await p.screenshot({ path: "docs/qa/2026-10-15/after-19-forgot.png" });
// info pages render with real content
for (const s of ["help", "privacy", "terms", "acceptable-use", "about", "accessibility", "developers"]) { await p.goto(`${B}/${s}`); assert.ok((await p.locator("main h2").count()) >= 2, s); }
// #21 (documented exception): guest workspace by design; sign-out lands on the marketing site
await p.goto(B + "/app"); await p.waitForURL(/\/app$/); await p.getByRole("button", { name: "Sign out" }).click(); await p.waitForURL(u => !u.pathname.includes("/app"), { waitUntil: "commit" });
// #23 console: no errors anywhere above (400/404s from probes are not triggered in this script)
assert.deepEqual(errs, []); await b.close(); console.log("e2e-auth-marketing OK");
