import { describe, it, expect, beforeAll } from "vitest";
import os from "node:os"; import path from "node:path"; import fs from "node:fs";
let T: typeof import("@/lib/tokenstore");
beforeAll(async () => { process.env["ISDEAD_DATA_DIR"] = fs.mkdtempSync(path.join(os.tmpdir(), "bl-tok-")); T = await import("@/lib/tokenstore"); });
describe("API tokens", () => {
  it("mints a bearer token that resolves to its owner, and revocation kills it", async () => {
    const r = await T.createToken("u1", "Zapier"); expect(r.token).toMatch(/^bid_[A-Za-z0-9_-]{20,}$/); expect(r.doc!.prefix).toBe(r.token!.slice(0, 10) + "…"); expect(r.doc!.hash).not.toContain(r.token!.slice(4, 12));
    expect(await T.ownerOfToken(r.token!)).toBe("u1"); expect(await T.ownerOfToken("bid_nope_nope_nope_nope_nope")).toBeNull(); expect(await T.ownerOfToken("")).toBeNull();
    expect((await T.listTokens("u1")).map(t => t.name)).toEqual(["Zapier"]); expect(await T.revokeToken("u2", r.doc!.id)).toBe(false); expect(await T.revokeToken("u1", r.doc!.id)).toBe(true); expect(await T.ownerOfToken(r.token!)).toBeNull();
  });
});
