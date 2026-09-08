import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

function getTransporter() {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    });
  }
  return transporter;
}

/**
 * Sends an email if SMTP is configured; otherwise logs it. Never throws —
 * a failed/absent email should never break the request that triggered it.
 */
export async function sendEmail({ to, subject, text }) {
  try {
    const t = getTransporter();
    if (!t) {
      console.log(`[email:dev] to=${to} subject="${subject}" — ${text}`);
      return { delivered: false, reason: "SMTP not configured" };
    }
    await t.sendMail({ from: env.smtp.from, to, subject, text });
    return { delivered: true };
  } catch (err) {
    console.error("[email] send failed", err.message);
    return { delivered: false, reason: err.message };
  }
}
