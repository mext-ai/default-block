import { createCatalogAssetResolver } from "@mexty/engine";

declare global {
  interface Window {
    /** Set by the platform (preview page, editor sandbox) so a block need not guess its API from a host name. */
    __MEXTY_API_URL__?: string;
  }
}

/** The API origin for one of Mexty's host names, or null for a host that is not Mexty's. */
function apiForHost(host: string): string | null {
  if (host === "localhost" || host.endsWith(".localhost") || host === "127.0.0.1") return "http://localhost:3008";
  if (host === "dev.mexty.ai" || host.endsWith(".dev.mexty.ai")) return "https://dev-api.mexty.ai";
  if (/(^|\.)(future|test)\.mexty\.ai$/.test(host)) return "https://future-api.mexty.ai";
  if (host === "mexty.ai" || host.endsWith(".mexty.ai")) return "https://api.mexty.ai";
  return null;
}

/**
 * Where the platform's API is, for the page this block runs in.
 *
 * The platform says so when it can (`window.__MEXTY_API_URL__`, set by the
 * preview page and by the editor's sandbox). Failing that, the page's own host
 * decides; and when the page runs on a foreign origin — the editor's sandboxed
 * preview, a standalone export — the host that embedded it does, read from the
 * referrer. Production is the last resort, never the first guess.
 */
export function apiBaseUrl(): string {
  const hinted = typeof window !== "undefined" ? window.__MEXTY_API_URL__ : undefined;
  if (typeof hinted === "string" && /^https?:\/\//.test(hinted)) return hinted.replace(/\/+$/, "");
  const own = apiForHost(window.location.hostname);
  if (own) return own;
  try {
    if (document.referrer) {
      const parent = apiForHost(new URL(document.referrer).hostname);
      if (parent) return parent;
    }
  } catch {
    // an unparsable referrer says nothing
  }
  return "https://api.mexty.ai";
}

/**
 * Answers the `asset:<id>` references this preview's definition carries.
 *
 * A primitive's standalone props are a game definition like any other, so a
 * preview can dress the primitive with catalog assets — the same references a
 * game host would resolve, resolved the same way.
 */
export const resolveAssets = createCatalogAssetResolver({ apiBase: apiBaseUrl() });
