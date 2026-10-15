import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
let S: typeof import("@/lib/linkstore");
const chrome = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/126.0 Safari/537.36";
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "bl-")); S = await import("@/lib/linkstore"); });
describe("link store", () => {
  it("creates links with random or custom codes and rejects duplicates", async () => {
    const a = await S.createLink("u1", { url: "example.com/one" }, []); expect(a.link!.code).toHaveLength(6);
    const b = await S.createLink("u1", { url: "https://example.com/two", backHalf: "my-launch", title: " Two " }, []); expect(b.link).toMatchObject({ code: "my-launch", title: "Two" });
    expect((await S.createLink("u2", { url: "https://example.com", backHalf: "my-launch" }, [])).error).toMatch(/taken/);
    expect((await S.createLink("u1", { url: "javascript:1" }, [])).error).toBeTruthy(); expect((await S.createLink("u1", { url: "https://e.com", backHalf: "api" }, [])).error).toMatch(/reserved/);
    expect((await S.createLink("u1", { url: "https://e.com", expiresAt: "2001-01-01" }, [])).error).toMatch(/future/);
    expect((await S.listLinks("u1")).map(l => l.code)).toContain("my-launch"); expect(await S.listLinks("u2")).toEqual([]);
  });
  it("counts concurrent visits without losing any, and ignores bots", async () => {
    await Promise.all(Array.from({ length: 30 }, () => S.visit("my-launch", { ua: chrome, referer: "https://x.com/" }))); await S.visit("my-launch", { ua: "Googlebot/2.1", referer: null });
    const l = (await S.getLink("my-launch"))!; expect(l.stats.clicks).toBe(30); expect(l.stats.bots).toBe(1); expect(l.stats.referrers["x.com"]).toBe(30);
  });
  it("stops counting when off or expired, and only the owner can edit or delete", async () => {
    expect((await S.updateLink("u2", "my-launch", { disabled: true }, [])).error).toBe("Not found"); expect((await S.updateLink("u1", "my-launch", { disabled: true }, [])).link!.disabled).toBe(true);
    await S.visit("my-launch", { ua: chrome, referer: null }); expect((await S.getLink("my-launch"))!.stats.clicks).toBe(30);
    expect((await S.updateLink("u1", "my-launch", { disabled: false, url: "file:///x" }, [])).error).toBeTruthy();
    expect((await S.updateLink("u1", "my-launch", { url: "https://example.com/new" }, [])).link!.url).toBe("https://example.com/new");
    expect(await S.deleteLink("u2", "my-launch")).toBe(false); expect(await S.deleteLink("u1", "my-launch")).toBe(true); expect(await S.getLink("my-launch")).toBeNull(); expect(await S.visit("my-launch", { ua: chrome, referer: null })).toBeNull();
  });
  it("seeds demo links once", async () => { const a = await S.listLinks("demo", true); const b = await S.listLinks("demo", true); expect(a.length).toBe(4); expect(b.length).toBe(4); expect(a.find(l => l.code === "launch26")!.stats.clicks).toBe(1284); });
});
