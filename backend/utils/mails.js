import nodemailer from "nodemailer";

let transporterInstance = null;

const getTransporter = () => {
    if (transporterInstance) return transporterInstance;
    transporterInstance = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth:
            process.env.SMTP_USER && process.env.SMTP_PASS
                ? {
                      user: process.env.SMTP_USER,
                      pass: process.env.SMTP_PASS,
                  }
                : undefined,
    });
    return transporterInstance;
};

const baseLayout = (title, body) => `
<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f6f8;padding:24px;">
  <div style="max-width:560px;margin:auto;background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.06);">
    <h2 style="color:#1f3b73;margin-top:0;">${title}</h2>
    ${body}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
    <p style="font-size:12px;color:#888;">Event Management System &mdash; automated message, do not reply.</p>
  </div>
</body></html>`;

export const sendMail = async ({ to, subject, html, text }) => {
    try {
        const info = await getTransporter().sendMail({
            from: process.env.SMTP_FROM || "no-reply@eventmgmt.local",
            to,
            subject,
            html,
            text,
        });
        return info;
    } catch (err) {
        console.error("Mail send failed:", err.message);
        return null;
    }
};

export const sendVerificationEmail = (to, name, link) =>
    sendMail({
        to,
        subject: "Verify your Event Management account",
        html: baseLayout(
            "Verify your email",
            `<p>Hi ${name || "there"},</p>
             <p>Click the button below to verify your email. This link expires shortly.</p>
             <p><a href="${link}" style="background:#1f3b73;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Verify Email</a></p>
             <p>Or paste this URL: <br><code>${link}</code></p>`,
        ),
    });

export const sendPasswordResetEmail = (to, name, link) =>
    sendMail({
        to,
        subject: "Reset your Event Management password",
        html: baseLayout(
            "Reset your password",
            `<p>Hi ${name || "there"},</p>
             <p>We received a request to reset your password. This link expires shortly.</p>
             <p><a href="${link}" style="background:#c0392b;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">Reset Password</a></p>
             <p>If you didn't request this, you can ignore this email.</p>`,
        ),
    });

export const sendOrderConfirmationEmail = (to, name, order) =>
    sendMail({
        to,
        subject: `Order Confirmation #${order._id}`,
        html: baseLayout(
            "Order Confirmed",
            `<p>Hi ${name || "there"},</p>
             <p>Your order <strong>#${order._id}</strong> totalling
             <strong>₹${order.totalAmount}</strong> has been received.</p>
             <p>Status: <strong>${order.status}</strong></p>`,
        ),
    });

export const sendMembershipEmail = (to, name, membership) =>
    sendMail({
        to,
        subject: "Vendor Membership Update",
        html: baseLayout(
            "Membership Update",
            `<p>Hi ${name || "there"},</p>
             <p>Your membership plan <strong>${membership.plan}</strong> is
             now <strong>${membership.status}</strong>.</p>
             <p>Valid until: <strong>${new Date(membership.endDate).toDateString()}</strong></p>`,
        ),
    });
