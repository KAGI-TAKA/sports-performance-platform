import "server-only";
import { Resend } from "resend";
import { env } from "./env.server";
import { generateResetPasswordEmailTemplate } from "@/features/auth/templates/reset-password";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  from?: string;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

export interface SendPasswordResetEmailOptions {
  to: string;
  userName?: string | null;
  resetUrl: string;
  expiresInMinutes?: number;
}

/**
 * Lazy initialization of Resend client to avoid instantiation errors if key is missing in dev.
 */
function getResendClient(): Resend | null {
  if (!env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(env.RESEND_API_KEY);
}

/**
 * Generic, sanitized transactional email sender.
 * Enforces strict environment boundaries:
 * - Production: Never logs sensitive links/tokens. Fails safely if API key is missing.
 * - Development: Allows clean console logging fallback if API key is not configured yet.
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, subject, html, text, from = env.EMAIL_FROM } = options;
  const isProduction = process.env.NODE_ENV === "production";
  const resend = getResendClient();

  if (!resend) {
    if (isProduction) {
      console.error("[EMAIL_ERROR] RESEND_API_KEY is missing in production environment.");
      return {
        success: false,
        error: "Email transport is not configured for production delivery.",
      };
    }

    // Explicit Development fallback only
    console.info(`[DEV_EMAIL_FALLBACK] Simulated delivery to: ${Array.isArray(to) ? to.join(", ") : to} | Subject: "${subject}"`);
    return {
      success: true,
      id: "mock-dev-id",
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("[EMAIL_DELIVERY_ERROR] Resend returned an error:", {
        name: error.name,
        message: error.message,
      });
      return {
        success: false,
        error: error.message || "Failed to send email via Resend.",
      };
    }

    return {
      success: true,
      id: data?.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected email transport failure";
    console.error("[EMAIL_TRANSPORT_EXCEPTION] Sanitized error:", message);
    return {
      success: false,
      error: "An unexpected error occurred during email transmission.",
    };
  }
}

import { generateAssistantCoachInvitationEmailTemplate } from "@/features/auth/templates/assistant-coach-invitation";
import { generateParentInvitationEmailTemplate } from "@/features/auth/templates/parent-invitation";
import { generateAthleteActivationEmailTemplate } from "@/features/auth/templates/athlete-activation";
import { generateEmailVerificationEmailTemplate } from "@/features/auth/templates/email-verification";

export interface SendAssistantCoachInvitationOptions {
  to: string;
  recipientName?: string | null;
  inviterName?: string | null;
  organizationName?: string | null;
  inviteUrl: string;
  expiresInDays?: number;
}

export interface SendParentInvitationOptions {
  to: string;
  parentName?: string | null;
  athleteNames?: string[];
  organizationName?: string | null;
  activationUrl: string;
  expiresInDays?: number;
}

export interface SendAthleteActivationOptions {
  to: string;
  athleteName?: string | null;
  username: string;
  organizationName?: string | null;
  activationUrl: string;
  expiresInHours?: number;
}

export interface SendEmailVerificationOptions {
  to: string;
  userName?: string | null;
  verificationUrl: string;
  expiresInHours?: number;
}

/**
 * Dedicated transactional email helper for password reset requests.
 */
export async function sendPasswordResetEmail(
  options: SendPasswordResetEmailOptions
): Promise<SendEmailResult> {
  const { to, userName, resetUrl, expiresInMinutes = 60 } = options;
  const isProduction = process.env.NODE_ENV === "production";
  const resend = getResendClient();

  // If in development mode without API key, log the link for easy developer testing
  if (!resend && !isProduction) {
    console.info(`[DEV_AUTH] Password reset link for ${to}: ${resetUrl}`);
    return {
      success: true,
      id: "mock-dev-reset-id",
    };
  }

  const { subject, html, text } = generateResetPasswordEmailTemplate({
    userName,
    resetUrl,
    expiresInMinutes,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dedicated transactional email helper for Assistant Coach invitations.
 */
export async function sendAssistantCoachInvitationEmail(
  options: SendAssistantCoachInvitationOptions
): Promise<SendEmailResult> {
  const { to, recipientName, inviterName, organizationName, inviteUrl, expiresInDays = 7 } = options;
  const isProduction = process.env.NODE_ENV === "production";
  const resend = getResendClient();

  if (!resend && !isProduction) {
    console.info(`[DEV_AUTH] Assistant Coach invitation link for ${to}: ${inviteUrl}`);
    return {
      success: true,
      id: "mock-dev-invite-id",
    };
  }

  const { subject, html, text } = generateAssistantCoachInvitationEmailTemplate({
    recipientName,
    inviterName,
    organizationName,
    inviteUrl,
    expiresInDays,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dedicated transactional email helper for Parent portal invitations.
 */
export async function sendParentInvitationEmail(
  options: SendParentInvitationOptions
): Promise<SendEmailResult> {
  const { to, parentName, athleteNames, organizationName, activationUrl, expiresInDays = 7 } = options;
  const isProduction = process.env.NODE_ENV === "production";
  const resend = getResendClient();

  if (!resend && !isProduction) {
    console.info(`[DEV_AUTH] Parent invitation link for ${to}: ${activationUrl}`);
    return {
      success: true,
      id: "mock-dev-parent-id",
    };
  }

  const { subject, html, text } = generateParentInvitationEmailTemplate({
    parentName,
    athleteNames,
    organizationName,
    activationUrl,
    expiresInDays,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dedicated transactional email helper for Athlete account activation.
 */
export async function sendAthleteActivationEmail(
  options: SendAthleteActivationOptions
): Promise<SendEmailResult> {
  const { to, athleteName, username, organizationName, activationUrl, expiresInHours = 48 } = options;
  const isProduction = process.env.NODE_ENV === "production";
  const resend = getResendClient();

  if (!resend && !isProduction) {
    console.info(`[DEV_AUTH] Athlete activation link for ${to} (@${username}): ${activationUrl}`);
    return {
      success: true,
      id: "mock-dev-athlete-id",
    };
  }

  const { subject, html, text } = generateAthleteActivationEmailTemplate({
    athleteName,
    username,
    organizationName,
    activationUrl,
    expiresInHours,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Dedicated transactional email helper for Email Verification requests.
 */
export async function sendEmailVerificationEmail(
  options: SendEmailVerificationOptions
): Promise<SendEmailResult> {
  const { to, userName, verificationUrl, expiresInHours = 24 } = options;
  const isProduction = process.env.NODE_ENV === "production";
  const resend = getResendClient();

  if (!resend && !isProduction) {
    console.info(`[DEV_AUTH] Email verification link for ${to}: ${verificationUrl}`);
    return {
      success: true,
      id: "mock-dev-verify-id",
    };
  }

  const { subject, html, text } = generateEmailVerificationEmailTemplate({
    userName,
    verificationUrl,
    expiresInHours,
  });

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}
