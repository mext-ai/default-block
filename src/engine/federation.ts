import { createWebpackRemoteLoader, type RemoteEntryInfo } from "@mexty/engine";

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

/** Same environment detection as the platform's preview page. */
export function apiBaseUrl(): string {
  const host = window.location.hostname;
  if (host.includes("localhost") || host === "127.0.0.1") return "http://localhost:3008";
  if (host.includes("dev.mexty.ai")) return "https://dev-api.mexty.ai";
  if (host.includes("future.mexty.ai") || host.includes("test.mexty.ai")) return "https://future-api.mexty.ai";
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
