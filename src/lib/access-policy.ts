/**
 * Single Source of Truth for Role-Based Routing, Access Policy & Guards.
 * Controls default landing routes, allowed routes per role, and server-side authorization.
 */

export type UserRole = "admin" | "head_coach" | "coach" | "assistant_coach" | "parent" | "athlete";

export const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  admin: "/dashboard",
  head_coach: "/dashboard",
  coach: "/dashboard",
  assistant_coach: "/schedule",
  parent: "/portal",
  athlete: "/portal",
};

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
  admin: "Admin / Owner",
  head_coach: "Head Coach",
  coach: "Head Coach",
  assistant_coach: "Asisten Pelatih",
  parent: "Orang Tua / Wali",
  athlete: "Atlet",
};

/**
 * Returns the default authenticated landing route for a given user role.
 */
export function getDefaultRouteForRole(role?: string | null): string {
  if (!role) return "/login";
  const normalized = role.toLowerCase().trim();
  return ROLE_DEFAULT_ROUTES[normalized] || "/dashboard";
}

/**
 * Route access whitelist per role.
 * Exact paths or prefix paths allowed for each role.
 */
export const ROLE_ALLOWED_ROUTES: Record<string, string[]> = {
  admin: [
    "/dashboard",
    "/schedule",
    "/athletes",
    "/training-plans",
    "/assessments",
    "/session-logs",
    "/progress",
    "/compare",
    "/reports",
    "/portal",
    "/users",
    "/benchmarks",
    "/settings",
  ],
  head_coach: [
    "/dashboard",
    "/schedule",
    "/athletes",
    "/training-plans",
    "/assessments",
    "/session-logs",
    "/progress",
    "/compare",
    "/reports",
    "/portal",
  ],
  coach: [
    "/dashboard",
    "/schedule",
    "/athletes",
    "/training-plans",
    "/assessments",
    "/session-logs",
    "/progress",
    "/compare",
    "/reports",
    "/portal",
  ],
  assistant_coach: [
    "/schedule",
    "/session-logs",
    "/athletes",
    "/portal",
  ],
  parent: [
    "/portal",
  ],
  athlete: [
    "/portal",
  ],
};

/**
 * Evaluates whether a given pathname is authorized for the provided role.
 */
export function isRouteAllowedForRole(role?: string | null, pathname?: string | null): boolean {
  if (!pathname) return false;
  if (!role) return false;

  const normalizedRole = role.toLowerCase().trim();
  const allowedPrefixes = ROLE_ALLOWED_ROUTES[normalizedRole];

  if (!allowedPrefixes) {
    return false;
  }

  // Exact or sub-route prefix match
  return allowedPrefixes.some((prefix) => {
    if (pathname === prefix) return true;
    if (pathname.startsWith(`${prefix}/`)) return true;
    return false;
  });
}
