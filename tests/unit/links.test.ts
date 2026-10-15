import { describe, it, expect } from "vitest";
import * as L from "@/lib/links";
describe("validateTarget", () => {
  it("adds https and normalises", () => expect(L.validateTarget("example.com/a b").url).toBe("https://example.com/a%20b"));
  it("accepts http(s) with ports and queries", () => { expect(L.validateTarget("http://example.com:8080/x?y=1#z").url).toBe("http://example.com:8080/x?y=1#z"); });
  it("rejects dangerous or unreachable targets", () => { for (const u of ["javascript:alert(1)", "data:text/html,x", "file:///etc/passwd", "ftp://example.com", "http://localhost:3000", "http://127.0.0.1/a", "http://192.168.1.4", "http://10.0.0.1", "http://172.16.0.9", "http://[::1]/", "https://user:pw@example.com", "intranet", "", "   "]) expect(L.validateTarget(u).error, u).toBeTruthy(); });
  it("refuses to shorten our own short links", () => expect(L.validateTarget("https://yourappisdead.com/bitlyisdead/s/abc123", ["yourappisdead.com"]).error).toMatch(/already/));
  it("caps length", () => expect(L.validateTarget("https://example.com/" + "a".repeat(2100)).error).toMatch(/too long/));
});
describe("back-halves and codes", () => {
  it("validates back-halves", () => { expect(L.validateBackHalf("spring-sale_26")).toBeNull(); for (const b of ["ab", "has space", "a/b", "api", "APP"]) expect(L.validateBackHalf(b), b).toBeTruthy(); });
  it("generates codes from an unambiguous alphabet", () => { const c = L.genCode(); expect(c).toMatch(/^[a-km-zA-HJ-NP-Z2-9]{6}$/); expect(L.genCode(8)).toHaveLength(8); expect(L.genCode(4, () => 0)).toBe("aaaa"); });
  it("produces unique codes in bulk", () => { const s = new Set(Array.from({ length: 5000 }, () => L.genCode())); expect(s.size).toBeGreaterThan(4990); });
});
describe("click classification", () => {
  const chrome = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
  it("detects bots and previews", () => { for (const ua of ["", "Googlebot/2.1", "Slackbot-LinkExpanding 1.0", "facebookexternalhit/1.1", "curl/8.1", "WhatsApp/2.23"]) expect(L.isBot(ua), ua).toBe(true); expect(L.isBot(chrome)).toBe(false); });
  it("detects device and browser", () => { expect(L.device(chrome)).toBe("desktop"); expect(L.device(iphone)).toBe("mobile"); expect(L.device("Mozilla/5.0 (iPad; CPU OS 17_0)")).toBe("tablet"); expect(L.browser(chrome)).toBe("Chrome"); expect(L.browser(iphone)).toBe("Safari"); expect(L.browser("Mozilla/5.0 Firefox/120.0")).toBe("Firefox"); expect(L.browser(chrome + " Edg/126.0")).toBe("Edge"); });
  it("extracts referrer hosts", () => { expect(L.refHost("https://www.news.ycombinator.com/item?id=1")).toBe("news.ycombinator.com"); expect(L.refHost(null)).toBe("Direct"); expect(L.refHost("not a url")).toBe("Direct"); expect(L.refHost("https://yourappisdead.com/x", "yourappisdead.com")).toBe("Direct"); });
});
describe("recordVisit and summaries", () => {
  it("counts humans, separates bots, buckets by day", () => {
    const st = L.emptyStats(); const now = new Date("2026-10-14T12:00:00Z");
    L.recordVisit(st, { ua: "Mozilla/5.0 Chrome/126 Safari/537", referer: "https://x.com/a", now }); L.recordVisit(st, { ua: "Googlebot/2.1", now }); L.recordVisit(st, { ua: "Mozilla/5.0 (iPhone) Mobile Safari", now: new Date("2026-10-13T08:00:00Z") });
    expect(st).toMatchObject({ clicks: 2, bots: 1 }); expect(st.daily).toEqual({ "2026-10-14": 1, "2026-10-13": 1 }); expect(st.referrers).toEqual({ "x.com": 1, Direct: 1 });
    const s = L.series(st, 3, now); expect(s.map(x => x.count)).toEqual([0, 1, 1]); expect(L.top(st.referrers)[0]!.count).toBe(1);
  });
  it("caps bucket growth", () => { const st = L.emptyStats(); for (let i = 0; i < 200; i++) L.recordVisit(st, { ua: "Mozilla/5.0 Chrome", referer: `https://site${i}.com/` }); expect(Object.keys(st.referrers).length).toBeLessThanOrEqual(L.LIMITS.bucket + 1); expect(st.clicks).toBe(200); });
  it("isLive honours disabled and expiry", () => { const now = new Date("2026-10-14T00:00:00Z"); expect(L.isLive({ disabled: false, expiresAt: null }, now)).toBe(true); expect(L.isLive({ disabled: true, expiresAt: null }, now)).toBe(false); expect(L.isLive({ disabled: false, expiresAt: "2026-10-13T00:00:00Z" }, now)).toBe(false); expect(L.isLive({ disabled: false, expiresAt: "2026-10-15T00:00:00Z" }, now)).toBe(true); });
});
