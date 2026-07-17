import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  if (!process.env.SMTP_HOST || !from) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return { success: true, mock: true };
  }

  await transporter.sendMail({ from, to, subject, html });
  return { success: true };
}

export function verificationEmailHtml(name: string, token: string): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome, ${name}!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Verify Email</a>
      <p>Or copy this link: ${url}</p>
    </div>
  `;
}

export function resetPasswordEmailHtml(name: string, token: string): string {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Password</h2>
      <p>Hi ${name}, click the button below to reset your password:</p>
      <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
    </div>
  `;
}

export function leadNotificationEmailHtml(lead: {
  customerName: string;
  email: string;
  phone: string;
  message: string;
}): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>New Lead Received</h2>
      <p><strong>Name:</strong> ${lead.customerName}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Phone:</strong> ${lead.phone}</p>
      <p><strong>Message:</strong> ${lead.message}</p>
    </div>
  `;
}
