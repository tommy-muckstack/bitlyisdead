const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bitlyisdead";
export default {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // /f/<id> style public routes live under the same basePath.
  poweredByHeader: false,
  // PostHog reverse proxy (<basePath>/ingest → PostHog), see docs/ANALYTICS.md.
  skipTrailingSlashRedirect: true,
  async rewrites() { return [{ source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" }, { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" }]; },
  outputFileTracingRoot: new URL(".", import.meta.url).pathname, // two lockfiles up the tree; keep tracing to this repo
};
