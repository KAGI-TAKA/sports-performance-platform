import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock server-only package for Node test environment
vi.mock("server-only", () => ({}));

// Mock env.server to provide clean testing values
vi.mock("./env.server", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
    BETTER_AUTH_SECRET: "mock_better_auth_secret_minimum_32_chars_long",
    BETTER_AUTH_URL: "http://localhost:3000",
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role_key",
    RESEND_API_KEY: undefined as string | undefined,
    EMAIL_FROM: "Coach Zulfi Athletic Performance <onboarding@resend.dev>",
  },
}));

import { generateResetPasswordEmailTemplate } from "@/features/auth/templates/reset-password";
import { sendEmail, sendPasswordResetEmail } from "./email";
import * as envServer from "./env.server";

// Mock Resend SDK
const mockSend = vi.fn();
vi.mock("resend", () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      };
    },
  };
});

describe("Production Email Transport & Templates (P7-D1)", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe("1. generateResetPasswordEmailTemplate", () => {
    it("generates brand-consistent HTML and plain text with correct variables", () => {
      const template = generateResetPasswordEmailTemplate({
        userName: "Coach Budi",
        resetUrl: "https://app.coachzulfi.com/reset-password?token=secret123",
        expiresInMinutes: 60,
      });

      expect(template.subject).toContain("Atur Ulang Kata Sandi");
      expect(template.html).toContain("Coach Zulfi Athletic Performance");
      expect(template.html).toContain("Coach Budi");
      expect(template.html).toContain("https://app.coachzulfi.com/reset-password?token=secret123");
      expect(template.html).toContain("60 menit");

      expect(template.text).toContain("Halo Coach Budi");
      expect(template.text).toContain("https://app.coachzulfi.com/reset-password?token=secret123");
      expect(template.text).toContain("60 menit");
    });

    it("uses fallback greeting when userName is null or empty", () => {
      const template = generateResetPasswordEmailTemplate({
        userName: null,
        resetUrl: "https://app.coachzulfi.com/reset-password?token=xyz",
      });

      expect(template.html).toContain("Halo Coach,");
      expect(template.text).toContain("Halo Coach,");
    });
  });

  describe("2. sendEmail Environment Safety", () => {
    it("returns error safely in production when RESEND_API_KEY is not configured without logging secret", async () => {
      process.env.NODE_ENV = "production";
      vi.spyOn(envServer, "env", "get").mockReturnValue({
        ...envServer.env,
        RESEND_API_KEY: undefined,
      });

      const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await sendEmail({
        to: "coach@example.com",
        subject: "Test",
        html: "<p>Hello</p>",
        text: "Hello",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Email transport is not configured");
      expect(spyConsoleError).toHaveBeenCalledWith(
        "[EMAIL_ERROR] RESEND_API_KEY is missing in production environment."
      );
    });

    it("allows simulated dev fallback when in development without API key", async () => {
      process.env.NODE_ENV = "development";
      vi.spyOn(envServer, "env", "get").mockReturnValue({
        ...envServer.env,
        RESEND_API_KEY: undefined,
      });

      const spyConsoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

      const res = await sendEmail({
        to: "dev@example.com",
        subject: "Dev Subject",
        html: "<p>Dev</p>",
        text: "Dev",
      });

      expect(res.success).toBe(true);
      expect(res.id).toBe("mock-dev-id");
      expect(spyConsoleInfo).toHaveBeenCalled();
    });

    it("invokes Resend SDK when RESEND_API_KEY is provided", async () => {
      vi.spyOn(envServer, "env", "get").mockReturnValue({
        ...envServer.env,
        RESEND_API_KEY: "re_test_key_12345",
      });

      mockSend.mockResolvedValueOnce({
        data: { id: "resend_msg_999" },
        error: null,
      });

      const res = await sendEmail({
        to: "target@example.com",
        subject: "Welcome",
        html: "<p>Welcome</p>",
        text: "Welcome",
      });

      expect(mockSend).toHaveBeenCalledWith({
        from: envServer.env.EMAIL_FROM,
        to: "target@example.com",
        subject: "Welcome",
        html: "<p>Welcome</p>",
        text: "Welcome",
      });
      expect(res.success).toBe(true);
      expect(res.id).toBe("resend_msg_999");
    });

    it("handles Resend delivery errors sanitarily without throwing unhandled exceptions", async () => {
      vi.spyOn(envServer, "env", "get").mockReturnValue({
        ...envServer.env,
        RESEND_API_KEY: "re_test_key_12345",
      });

      mockSend.mockResolvedValueOnce({
        data: null,
        error: { name: "validation_error", message: "Domain is unverified" },
      });

      const spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});

      const res = await sendEmail({
        to: "unverified@example.com",
        subject: "Test",
        html: "<p>Test</p>",
        text: "Test",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Domain is unverified");
      expect(spyConsoleError).toHaveBeenCalled();
    });
  });

  describe("3. sendPasswordResetEmail", () => {
    it("generates full email and sends via Resend when configured", async () => {
      vi.spyOn(envServer, "env", "get").mockReturnValue({
        ...envServer.env,
        RESEND_API_KEY: "re_test_key_12345",
      });

      mockSend.mockResolvedValueOnce({
        data: { id: "resend_reset_777" },
        error: null,
      });

      const res = await sendPasswordResetEmail({
        to: "user@example.com",
        userName: "Coach Zulfi",
        resetUrl: "https://app.coachzulfi.com/reset-password?token=validToken",
      });

      expect(mockSend).toHaveBeenCalledTimes(1);
      const callArgs = mockSend.mock.calls[0][0];
      expect(callArgs.to).toBe("user@example.com");
      expect(callArgs.subject).toContain("Atur Ulang Kata Sandi");
      expect(callArgs.html).toContain("https://app.coachzulfi.com/reset-password?token=validToken");
      expect(res.success).toBe(true);
      expect(res.id).toBe("resend_reset_777");
    });
  });
});
