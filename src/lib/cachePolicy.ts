import env from "./env";

// One decision drives two caches: the node-fetch-cache backend used when
// fetching pads (in `fetchPost`) and the processed-posts disk cache (in
// `getPosts`). The question both ask is the same — can we trust caches that
// persist across builds?
//
// On Render the build directory can persist across deploys, so a stale cache
// would silently serve old pad content; `FILE_SYSTEM_CACHE=false` is a manual
// local override for the same situation (e.g. regenerating snapshots after a
// pad edit). In both cases we must NOT trust persistent caches.
export function isPersistentCacheEnabled(): boolean {
  return !env("RENDER") && env("FILE_SYSTEM_CACHE") !== "false";
}
