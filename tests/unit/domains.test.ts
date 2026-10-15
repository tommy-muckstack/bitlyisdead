import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
let D: typeof import("@/lib/domainstore");
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "bl-dom-")); D = await import("@/lib/domainstore"); });
describe("custom domains", () => {
  it("validates hostnames, refuses our own, dedupes, and a real DNS check leaves it pending with a clear reason", async () => {
    expect((await D.addDomain("u1", "nope", "yourappisdead.com")).error).toMatch(/domain you own/); expect((await D.addDomain("u1", "yourappisdead.com", "yourappisdead.com")).error).toMatch(/already ours/);
    const a = await D.addDomain("u1", "HTTPS://Go.Example.com/path", "yourappisdead.com"); expect(a.domain!.host).toBe("go.example.com"); expect(a.domain!.status).toBe("pending"); expect(D.txtValue(a.domain!)).toMatch(/^bitlyisdead-verify=/);
    expect((await D.addDomain("u1", "go.example.com", "yourappisdead.com")).error).toMatch(/already added/);
    const v = await D.verifyDomain("u1", a.domain!.id, "yourappisdead.com"); expect(v!.status).toBe("pending"); expect(v!.lastError).toMatch(/TXT record/); expect(v!.lastCheckAt).toBeTruthy();
    expect(await D.verifyDomain("u2", a.domain!.id, "yourappisdead.com")).toBeNull(); expect(await D.deleteDomain("u1", a.domain!.id)).toBe(true);
  }, 20_000);
});
