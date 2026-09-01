import { describe, it, expect } from "vitest";
import {
  getDefaultRouteForRole,
  isRouteAllowedForRole,
  ROLE_DEFAULT_ROUTES,
  ROLE_ALLOWED_ROUTES,
} from "./access-policy";

describe("Role-Based Access Policy & Route Routing", () => {
  describe("Default Route Resolution", () => {
    it("should resolve /dashboard for admin role", () => {
      expect(getDefaultRouteForRole("admin")).toBe("/dashboard");
    });

    it("should resolve /dashboard for head_coach and coach roles", () => {
      expect(getDefaultRouteForRole("head_coach")).toBe("/dashboard");
      expect(getDefaultRouteForRole("coach")).toBe("/dashboard");
    });

    it("should resolve /schedule for assistant_coach role", () => {
      expect(getDefaultRouteForRole("assistant_coach")).toBe("/schedule");
    });

    it("should resolve /portal for parent role", () => {
      expect(getDefaultRouteForRole("parent")).toBe("/portal");
    });

    it("should resolve /portal for athlete role", () => {
      expect(getDefaultRouteForRole("athlete")).toBe("/portal");
    });

    it("should fallback gracefully for null or unknown roles", () => {
      expect(getDefaultRouteForRole(null)).toBe("/login");
      expect(getDefaultRouteForRole("unknown_role")).toBe("/dashboard");
    });
  });

  describe("Route Permission Whitelist Enforcement", () => {
    it("admin should have access to all operational and administrative routes", () => {
      expect(isRouteAllowedForRole("admin", "/dashboard")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/users")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/settings")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/benchmarks")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/schedule")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/athletes")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/training-plans")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/assessments")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/session-logs")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/progress")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/compare")).toBe(true);
      expect(isRouteAllowedForRole("admin", "/reports")).toBe(true);
    });

    it("head_coach should have access to coaching modules but NOT administrative settings/users", () => {
      expect(isRouteAllowedForRole("head_coach", "/dashboard")).toBe(true);
      expect(isRouteAllowedForRole("head_coach", "/schedule")).toBe(true);
      expect(isRouteAllowedForRole("head_coach", "/assessments")).toBe(true);
      expect(isRouteAllowedForRole("head_coach", "/training-plans")).toBe(true);
      expect(isRouteAllowedForRole("head_coach", "/users")).toBe(false);
      expect(isRouteAllowedForRole("head_coach", "/settings")).toBe(false);
      expect(isRouteAllowedForRole("head_coach", "/benchmarks")).toBe(false);
    });

    it("assistant_coach should ONLY have access to field operations (schedule, session-logs, athletes)", () => {
      expect(isRouteAllowedForRole("assistant_coach", "/schedule")).toBe(true);
      expect(isRouteAllowedForRole("assistant_coach", "/schedule/123/execute")).toBe(true);
      expect(isRouteAllowedForRole("assistant_coach", "/session-logs")).toBe(true);
      expect(isRouteAllowedForRole("assistant_coach", "/athletes")).toBe(true);

      // Denied routes
      expect(isRouteAllowedForRole("assistant_coach", "/dashboard")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/users")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/settings")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/benchmarks")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/training-plans")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/assessments")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/progress")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/compare")).toBe(false);
      expect(isRouteAllowedForRole("assistant_coach", "/reports")).toBe(false);
    });

    it("parent should ONLY have access to portal", () => {
      expect(isRouteAllowedForRole("parent", "/portal")).toBe(true);
      expect(isRouteAllowedForRole("parent", "/dashboard")).toBe(false);
      expect(isRouteAllowedForRole("parent", "/users")).toBe(false);
      expect(isRouteAllowedForRole("parent", "/schedule")).toBe(false);
      expect(isRouteAllowedForRole("parent", "/athletes")).toBe(false);
      expect(isRouteAllowedForRole("parent", "/settings")).toBe(false);
    });

    it("athlete should ONLY have access to portal", () => {
      expect(isRouteAllowedForRole("athlete", "/portal")).toBe(true);
      expect(isRouteAllowedForRole("athlete", "/dashboard")).toBe(false);
      expect(isRouteAllowedForRole("athlete", "/users")).toBe(false);
      expect(isRouteAllowedForRole("athlete", "/schedule")).toBe(false);
      expect(isRouteAllowedForRole("athlete", "/athletes")).toBe(false);
      expect(isRouteAllowedForRole("athlete", "/settings")).toBe(false);
    });
  });
});
