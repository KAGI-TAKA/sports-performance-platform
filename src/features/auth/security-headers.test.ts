import { describe, it, expect, vi } from "vitest";

// Mock server-only for testing environment
vi.mock("server-only", () => ({}));

vi.mock("@/lib/env.server", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
    BETTER_AUTH_SECRET: "mock_better_auth_secret_minimum_32_chars_long",
    BETTER_AUTH_URL: "http://localhost:3000",
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role_key",
    RESEND_API_KEY: "re_mock_12345678",
    EMAIL_FROM: "Coach Zulfi Athletic Performance <onboarding@resend.dev>",
  },
}));

import nextConfig, { cspHeader, securityHeaders } from "../../../next.config";
import { auth } from "@/lib/auth";

describe("P7-D4: Security Headers & CSP Configuration", () => {
  describe("1. HTTP Security Headers", () => {
    it("exports nextConfig with headers() mapping to all routes (/:path*)", async () => {
      expect(nextConfig.headers).toBeDefined();
      if (nextConfig.headers) {
        const headerMappings = await nextConfig.headers();
        expect(headerMappings).toHaveLength(1);
        expect(headerMappings[0].source).toBe("/:path*");
      }
    });

    it("enforces X-Frame-Options: DENY to prevent clickjacking", () => {
      const xFrame = securityHeaders.find((h) => h.key === "X-Frame-Options");
      expect(xFrame).toBeDefined();
      expect(xFrame?.value).toBe("DENY");
    });

    it("enforces X-Content-Type-Options: nosniff to prevent MIME sniffing", () => {
      const xContentType = securityHeaders.find((h) => h.key === "X-Content-Type-Options");
      expect(xContentType).toBeDefined();
      expect(xContentType?.value).toBe("nosniff");
    });

    it("enforces Referrer-Policy: origin-when-cross-origin", () => {
      const referrer = securityHeaders.find((h) => h.key === "Referrer-Policy");
      expect(referrer).toBeDefined();
      expect(referrer?.value).toBe("origin-when-cross-origin");
    });

    it("enforces Permissions-Policy disabling unused hardware features", () => {
      const permissions = securityHeaders.find((h) => h.key === "Permissions-Policy");
      expect(permissions).toBeDefined();
      expect(permissions?.value).toBe("camera=(), microphone=(), geolocation=()");
    });

    it("includes Content-Security-Policy in security headers list", () => {
      const csp = securityHeaders.find((h) => h.key === "Content-Security-Policy");
      expect(csp).toBeDefined();
      expect(csp?.value).toBe(cspHeader);
    });
  });

  describe("2. Content Security Policy (CSP) Directives", () => {
    it("contains least-privilege base restrictions (default-src 'self', object-src 'none', frame-ancestors 'none')", () => {
      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("object-src 'none'");
      expect(cspHeader).toContain("frame-ancestors 'none'");
      expect(cspHeader).toContain("base-uri 'self'");
      expect(cspHeader).toContain("form-action 'self'");
    });

    it("whitelists Supabase storage for images and API connect-src", () => {
      expect(cspHeader).toContain("img-src 'self' data: blob: https://*.supabase.co");
      expect(cspHeader).toContain("connect-src 'self' https://*.supabase.co");
    });

    it("whitelists blob workers for @react-pdf/renderer", () => {
      expect(cspHeader).toContain("worker-src 'self' blob:");
    });

    it("supports Next.js client hydration and ECharts canvas rendering safely", () => {
      expect(cspHeader).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(cspHeader).toContain("style-src 'self' 'unsafe-inline'");
    });

    it("does NOT whitelist unnecessary external domains (no google fonts runtime or resend client endpoints)", () => {
      expect(cspHeader).not.toContain("fonts.googleapis.com");
      expect(cspHeader).not.toContain("fonts.gstatic.com");
      expect(cspHeader).not.toContain("api.resend.com");
    });
  });

  describe("3. Better Auth Rate Limiting Configuration", () => {
    it("configures native Better Auth rateLimit on the auth instance", () => {
      expect(auth.options.rateLimit).toBeDefined();
      expect(auth.options.rateLimit?.enabled).toBe(true);
      expect(auth.options.rateLimit?.window).toBe(60);
      expect(auth.options.rateLimit?.max).toBe(100);
    });

    it("defines hardened customRules for sign-in, forget-password, and reset-password", () => {
      const customRules = auth.options.rateLimit?.customRules;
      expect(customRules).toBeDefined();

      // Login: 5 requests / 300s
      const signInRule = customRules?.["/sign-in/email"];
      expect(signInRule).toEqual({ window: 300, max: 5 });

      // Forgot Password: 3 requests / 900s
      const forgotPasswordRule = customRules?.["/forget-password"];
      expect(forgotPasswordRule).toEqual({ window: 900, max: 3 });

      // Reset Password: 5 requests / 900s
      const resetPasswordRule = customRules?.["/reset-password"];
      expect(resetPasswordRule).toEqual({ window: 900, max: 5 });
    });
  });
});
