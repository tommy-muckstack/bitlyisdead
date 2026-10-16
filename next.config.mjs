const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/bitlyisdead";
export default {
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // /f/<id> style public routes live under the same basePath.
  poweredByHeader: false,
  outputFileTracingRoot: new URL(".", import.meta.url).pathname, // two lockfiles up the tree; keep tracing to this repo
};
