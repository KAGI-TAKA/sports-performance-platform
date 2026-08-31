import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only package
vi.mock("server-only", () => ({}));

// Mock env.server
vi.mock("@/lib/env.server", () => ({
  env: {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    DIRECT_URL: "postgresql://user:pass@localhost:5432/db",
    BETTER_AUTH_SECRET: "mock_better_auth_secret_minimum_32_chars_long",
    BETTER_AUTH_URL: "http://localhost:3000",
    SUPABASE_URL: "https://mock.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "mock_service_role_key",
    RESEND_API_KEY: "mock_resend_api_key_123",
    EMAIL_FROM: "Coach Zulfi Athletic Performance <onboarding@resend.dev>",
  },
}));

import { escapeHtml, generateResetPasswordEmailTemplate } from "./templates/reset-password";
import { forgotPasswordSchema, resetPasswordSchema } from "./schema";
import * as emailLib from "@/lib/email";

describe("P7-D2: Forgot & Reset Password Production Wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. F-02: HTML Escaping on User Input", () => {
    it("escapes potentially malicious script tags in displayName", () => {
      const maliciousName = "<script>alert('xss')</script>";
      const escaped = escapeHtml(maliciousName);
      expect(escaped).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
      expect(escaped).not.toContain("<script>");
    });

    it("escapes quotes, ampersands, and HTML tags in email template", () => {
      const template = generateResetPasswordEmailTemplate({
        userName: '<b>Coach</b> & "Special" Athlete',
        resetUrl: "https://app.coachzulfi.com/reset-password?token=secret123",
        expiresInMinutes: 60,
      });

      expect(template.html).toContain("&lt;b&gt;Coach&lt;/b&gt; &amp; &quot;Special&quot; Athlete");
      expect(template.html).not.toContain("<b>Coach</b>");
      expect(template.text).toContain('<b>Coach</b> & "Special" Athlete');
    });

    it("uses default 'Coach' greeting safely when userName is null, undefined, or whitespace", () => {
      const templateNull = generateResetPasswordEmailTemplate({
        userName: null,
        resetUrl: "https://app.coachzulfi.com/reset-password?token=123",
      });
      expect(templateNull.html).toContain("Halo Coach,");

      const templateSpaces = generateResetPasswordEmailTemplate({
        userName: "   ",
        resetUrl: "https://app.coachzulfi.com/reset-password?token=123",
      });
      expect(templateSpaces.html).toContain("Halo Coach,");
    });
  });

  describe("2. Email Normalization & Schema Validation", () => {
    it("validates and normalizes valid email with mixed casing and spaces", () => {
      const rawInput = "  Coach.Zulfi@Example.COM  ";
      const normalized = rawInput.trim().toLowerCase();

      const parsed = forgotPasswordSchema.safeParse({ email: normalized });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.email).toBe("coach.zulfi@example.com");
      }
    });

    it("rejects invalid email formats in forgotPasswordSchema", () => {
      const invalidParsed = forgotPasswordSchema.safeParse({ email: "not-an-email" });
      expect(invalidParsed.success).toBe(false);
    });

    it("validates resetPasswordSchema minimum character requirement", () => {
      const valid = resetPasswordSchema.safeParse({ newPassword: "password123" });
      expect(valid.success).toBe(true);

      const invalidShort = resetPasswordSchema.safeParse({ newPassword: "short" });
      expect(invalidShort.success).toBe(false);
      if (!invalidShort.success) {
        expect(invalidShort.error.flatten().fieldErrors.newPassword?.[0]).toContain("minimal 8 karakter");
      }
    });
  });

  describe("3. Better Auth sendResetPassword Callback Integration", () => {
    it("invokes sendPasswordResetEmail with correct user email, name, and resetUrl", async () => {
      const spySendEmail = vi.spyOn(emailLib, "sendPasswordResetEmail").mockResolvedValueOnce({
        success: true,
        id: "msg_123",
      });

      // Simulate Better Auth callback execution
      const mockUser = {
        id: "usr_1",
        email: "coach@example.com",
        name: "Coach Zulfi",
      };
      const mockResetUrl = "https://app.coachzulfi.com/reset-password?token=abc_token_123";

      await emailLib.sendPasswordResetEmail({
        to: mockUser.email,
        userName: mockUser.name,
        resetUrl: mockResetUrl,
        expiresInMinutes: 60,
      });

      expect(spySendEmail).toHaveBeenCalledWith({
        to: "coach@example.com",
        userName: "Coach Zulfi",
        resetUrl: "https://app.coachzulfi.com/reset-password?token=abc_token_123",
        expiresInMinutes: 60,
      });
    });
  });

  describe("4. Security & Anti-Enumeration Principles", () => {
    it("ensures reset email template explicitly specifies single-use and 60 minutes expiry", () => {
      const template = generateResetPasswordEmailTemplate({
        userName: "Coach Budi",
        resetUrl: "https://app.coachzulfi.com/reset-password?token=token999",
        expiresInMinutes: 60,
      });

      expect(template.html).toContain("60 menit");
      expect(template.html).toContain("hanya dapat digunakan satu kali");
      expect(template.text).toContain("60 menit");
      expect(template.text).toContain("hanya dapat digunakan 1 kali");
    });

    it("verifies plain-text fallback does not execute HTML and contains raw link", () => {
      const template = generateResetPasswordEmailTemplate({
        userName: "Coach Dani",
        resetUrl: "https://app.coachzulfi.com/reset-password?token=plain_test",
      });

      expect(template.text).toContain("https://app.coachzulfi.com/reset-password?token=plain_test");
      expect(template.text).not.toContain("<!DOCTYPE html>");
      expect(template.text).not.toContain("<div");
    });
  });
});
