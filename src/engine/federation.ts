import { createCatalogAssetResolver, createWebpackRemoteLoader, type RemoteEntryInfo } from "@mexty/engine";

// Webpack runtime globals — present in the platform build, absent in `vite dev`.
declare const __webpack_init_sharing__: ((scope: string) => Promise<void>) | undefined;
declare const __webpack_share_scopes__: { default: unknown } | undefined;

const hasShareRuntime = () =>
  typeof __webpack_init_sharing__ === "function" && typeof __webpack_share_scopes__ !== "undefined";

/** Loads remote primitives into this bundle's share scope (one React, one three). */
export const loadRemote = createWebpackRemoteLoader({
  initSharing: async (scope = "default") => {
    if (!hasShareRuntime()) throw new Error("Remote primitives need the platform build (webpack Module Federation); they are unavailable in vite dev.");
    await __webpack_init_sharing__!(scope);
  },
  shareScope: () => __webpack_share_scopes__!.default,
});

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

const resolved = new Map<string, Promise<RemoteEntryInfo | null>>();

/** Where a primitive block's federation entry lives, from the platform. */
export function resolvePrimitive(blockId: string): Promise<RemoteEntryInfo | null> {
  let p = resolved.get(blockId);
  if (!p) {
    p = fetch(`${apiBaseUrl()}/api/engine/primitives/resolve?ids=${encodeURIComponent(blockId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`resolve failed: HTTP ${r.status}`))))
      .then((body: { primitives?: Array<{ blockId: string; federationUrl: string; containerName: string }> }) => {
        const hit = body.primitives?.find((x) => x.blockId === blockId);
        return hit ? { federationUrl: hit.federationUrl, containerName: hit.containerName } : null;
      });
    resolved.set(blockId, p);
  }
  return p;
}

/**
 * Answers the `asset:<id>` references a definition carries.
 *
 * An asset picked from the catalog is stored as a reference, not a URL, so the
 * game reads the file, its scale, its rig and its clip names from the catalog
 * at run time — correcting a shared asset fixes every game using it. A plain
 * URL in the same field still works and needs none of this.
 */
export const resolveAssets = createCatalogAssetResolver({ apiBase: apiBaseUrl() });
