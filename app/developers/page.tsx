import Link from "next/link";
import { Mark } from "@/components/Mark";
import { BP } from "@/lib/basepath";
export const metadata = { title: "BitlyIsDead API", description: "REST API for links, QR Codes, Pages and Campaigns. Bearer tokens from Settings → API." };
const base = `https://yourappisdead.com${BP}/api`;
const EP: [string, string, string][] = [
  ["GET", "/links", "List your links (with stats)."], ["POST", "/links", "Create a link: { url, title?, backHalf?, tags?, expiresAt?, campaignId? }"], ["GET", "/links/:code", "One link."], ["PATCH", "/links/:code", "Edit: { url?, title?, tags?, disabled?, hidden?, expiresAt?, campaignId? }"], ["DELETE", "/links/:code", "Delete a link."], ["POST", "/links/bulk", "{ codes, patch } or { codes, delete: true }"],
  ["GET", "/qrcodes", "List QR Codes with their links."], ["POST", "/qrcodes", "{ code } for an existing link, or { url, title?, backHalf?, style? }"], ["PATCH", "/qrcodes/:id", "{ title?, style?, hidden? }"], ["GET", "/qrcodes/:id/image", "The styled SVG."], ["DELETE", "/qrcodes/:id", "Delete a QR Code."],
  ["GET", "/pages", "List pages."], ["POST", "/pages", "{ title?, slug? }"], ["PATCH", "/pages/:id", "{ title?, bio?, emoji?, theme?, blocks?, slug?, published? }"], ["DELETE", "/pages/:id", "Delete a page."],
  ["GET", "/campaigns", "List campaigns."], ["POST", "/campaigns", "{ name, description?, utm? }"], ["PATCH", "/campaigns/:id", "{ name?, description?, utm?, addLinks?, removeLinks? }"], ["DELETE", "/campaigns/:id", "Delete a campaign (links stay)."],
  ["GET", "/search?q=", "Search links, QR Codes and pages."],
];
export default function Developers() {
  return <main className="dv"><Link href="/" className="nf-logo" style={{ marginBottom: 8 }}><Mark size={34} />bitlyisdead</Link>
    <h1>API</h1><p className="dv-lede">Everything the app does, over plain JSON. Create a token in <Link href="/app/settings/api">Settings → API</Link> and send it as a bearer token. Short links keep working at <code>{BP}/s/&lt;code&gt;</code>; QR scans are counted when the URL carries <code>?r=qr</code>.</p>
    <h2>Authentication</h2><pre>{`curl ${base}/links \\\n  -H "Authorization: Bearer bid_…"`}</pre>
    <h2>Create a link</h2><pre>{`curl -X POST ${base}/links \\\n  -H "Authorization: Bearer bid_…" -H "content-type: application/json" \\\n  -d '{"url":"https://example.com/launch","title":"Launch","backHalf":"launch-26","tags":["launch"]}'`}</pre>
    <p>Responses: <code>201 {"{ link }"}</code>, or <code>400 {"{ error }"}</code> for an invalid destination or a taken back-half. Every route answers <code>401</code> without a valid token or session.</p>
    <h2>Endpoints</h2><table className="dv-tbl"><thead><tr><th>Method</th><th>Path</th><th>Body / notes</th></tr></thead><tbody>{EP.map(([m, p, d]) => <tr key={m + p}><td><code>{m}</code></td><td><code>{p}</code></td><td>{d}</td></tr>)}</tbody></table>
    <h2>Limits</h2><ul><li>300 links, 50 pages, 100 campaigns, 20 domains and 10 tokens per account.</li><li>Destinations must be public http(s) URLs; private networks, credentials and other short links are refused.</li><li>Bulk calls take up to 200 codes.</li></ul>
    <p className="ids-muted">The API has no versioning yet; breaking changes are announced in the <a href="https://github.com/tommy-muckstack/bitlyisdead">repository</a>.</p></main>;
}
