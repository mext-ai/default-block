import { createCatalogAssetResolver } from "@mexty/engine";

/** Same environment detection as the platform's preview page. */
export function apiBaseUrl(): string {
  const host = window.location.hostname;
  if (host.includes("localhost") || host === "127.0.0.1") return "http://localhost:3008";
  if (host.includes("dev.mexty.ai")) return "https://dev-api.mexty.ai";
  if (host.includes("future.mexty.ai") || host.includes("test.mexty.ai")) return "https://future-api.mexty.ai";
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
