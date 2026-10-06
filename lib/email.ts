import { Resend } from "resend";

type VerificationEmail = {
  email: string;
  subject: string;
  title: string;
  text: string;
  actionLabel?: string;
  actionUrl?: string;
  otp?: string;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getFromEmail() {
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL is not configured.");
  }

  return fromEmail;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendVerificationEmail({
  email,
  subject,
  title,
  text,
  actionLabel,
  actionUrl,
  otp,
}: VerificationEmail) {
  const action = actionUrl && actionLabel
    ? `<p><a href="${escapeHtml(actionUrl)}" style="display:inline-block;border-radius:10px;background:#ea580c;color:#fff;padding:12px 18px;text-decoration:none">${escapeHtml(actionLabel)}</a></p>`
    : "";
  const code = otp
    ? `<p style="font-size:32px;font-weight:700;letter-spacing:8px">${escapeHtml(otp)}</p>`
    : "";

  const { error } = await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#17202a">
        <p style="font-weight:700;color:#ea580c">nicogpg</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(text)}</p>
        ${code}
        ${action}
        <p style="color:#667085;font-size:14px">Si no solicitaste esto, puedes ignorar este correo.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
}
