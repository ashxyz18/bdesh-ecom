interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

interface SMSOptions {
  to: string;
  message: string;
}

// Simple email sending function (configure with your SMTP provider)
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "noreply@bdesh.shop";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log("Email not sent (SMTP not configured):", { to, subject, html });
    return;
  }

  try {
    // Dynamic require to avoid build errors
    const nodemailer = require("nodemailer");
    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transport.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html?.replace(/<[^>]*>?/g, ""),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

// Simple SMS sending function (configure with bKash/Nagad SMS API)
export async function sendSMS({ to, message }: SMSOptions): Promise<void> {
  const smsApiKey = process.env.SMS_API_KEY;
  const smsApiUrl = process.env.SMS_API_URL;

  if (!smsApiKey || !smsApiUrl) {
    console.log("SMS not sent (SMS not configured):", { to, message });
    return;
  }

  try {
    await fetch(smsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${smsApiKey}`,
      },
      body: JSON.stringify({
        to,
        message,
      }),
    });
  } catch (error) {
    console.error("Failed to send SMS:", error);
  }
}

// Order confirmation notification
export async function sendOrderConfirmation(
  email: string,
  orderNumber: string,
  total: number,
  items: { name: string; quantity: number; price: number }[],
) {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order!</p>
    <p><strong>Order #:</strong> ${orderNumber}</p>
    <p><strong>Total:</strong> ৳${total.toFixed(2)}</p>
    <h3>Items:</h3>
    <ul>
      ${items.map(item => `<li>${item.name} x ${item.quantity} - ৳${item.price}</li>`).join("")}
    </ul>
    <p>We'll notify you when your order ships.</p>
  `;

  await sendEmail({
    to: email,
    subject: `Order Confirmation #${orderNumber}`,
    html,
  });
}

// Password reset notification
export async function sendPasswordReset(
  email: string,
  resetUrl: string,
) {
  const html = `
    <h2>Password Reset</h2>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetUrl}">${resetUrl}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  await sendEmail({
    to: email,
    subject: "Reset Your Password - BdeshShop",
    html,
  });
}
