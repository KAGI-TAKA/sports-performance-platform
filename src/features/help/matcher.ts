import { HELP_REGISTRY, DEFAULT_FALLBACK_HELP } from "./registry";
import { HelpArticle } from "./types";

/**
 * Normalizes a pathname and resolves the best matching HelpArticle.
 * Handles exact paths and dynamic routes safely.
 */
export function getHelpArticleForPath(pathname: string): HelpArticle {
  if (!pathname) return DEFAULT_FALLBACK_HELP;

  // Clean path (remove query, hash, trailing slashes)
  const clean = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  // 1. Direct exact match
  if (HELP_REGISTRY[clean]) {
    return HELP_REGISTRY[clean];
  }

  // 2. Dynamic route matches
  // /assessments/[id] (exclude /assessments/new)
  if (clean.startsWith("/assessments/") && clean !== "/assessments/new") {
    return HELP_REGISTRY["/assessments/[id]"] ?? DEFAULT_FALLBACK_HELP;
  }

  // 3. Fallback to base route if parent exists in registry (e.g. /users/...)
  const segments = clean.split("/").filter(Boolean);
  if (segments.length > 1) {
    const parentPath = "/" + segments[0];
    if (HELP_REGISTRY[parentPath]) {
      return HELP_REGISTRY[parentPath];
    }
  }

  return DEFAULT_FALLBACK_HELP;
}
