import { envFileValue } from "@/lib/solar/guard.server";
import { COMPANY } from "@/lib/site";

const FROM = "Adam Tourlakes <adam@adamtourlakes.com>";

function envStr(key: string) {
  return String(process.env[key] ?? "").trim() || envFileValue(key);
}

function apiKey() {
  return envStr("RESEND_API_KEY");
}

function notifyTo() {
  return envStr("ADAM_NOTIFY_EMAIL") || "atourlakes@yahoo.com";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&")
    .replaceAll("<", "<")
    .replaceAll(">", ">")
    .replaceAll('"', """);
}

async function sendEmail(payload: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}) {
  const key = apiKey();
  if (!key) return { ok: false as const, error: "missing_key" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "User-Agent": "AdamTourlakesSite/1.0",
    },
    body: JSON.stringify({
      from: FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.replyTo,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("resend_failed", res.status, body.slice(0, 400));
    return { ok: false as const, error: "send_failed" };
  }
  return { ok: true as const };
}

export async function sendContactEmails(lead: {
  name: string;
  email: string;
  phone: string;
  address: string;
  zip: string;
  bill: string;
  backup: boolean;
  message: string;
}) {
  const first = lead.name.trim().split(/\s+/)[0] || "there";
  const bill = lead.bill ? `$${lead.bill}` : "—";
  const backup = lead.backup ? "Yes" : "No";
  const rows = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone || "—"],
    ["Address / ZIP", lead.address || lead.zip || "—"],
    ["Average bill", bill],
    ["Backup batteries", backup],
    ["Note", lead.message || "—"],
  ];

  const notifyHtml = `
    <p style="font-family:Georgia,serif;font-size:20px;color:#c9a227;margin:0 0 12px">New contact form</p>
    <p style="font-family:system-ui,sans-serif;font-size:14px;color:#111;line-height:1.5">
      Someone used the form on adamtourlakes.com.
    </p>
    <table style="font-family:system-ui,sans-serif;font-size:14px;color:#111;border-collapse:collapse">
      ${rows
        .map(
          ([k, v]) =>
            `<tr><td style="padding:6px 16px 6px 0;color:#666;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0;vertical-align:top">${escapeHtml(v)}</td></tr>`,
        )
        .join("")}
    </table>
    <p style="font-family:system-ui,sans-serif;font-size:13px;color:#666;margin-top:20px">
      Inbox: adamtourlakes.com/admin1776
    </p>
  `;
  const notifyText = `New contact form\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n`;

  const thanksHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Outfit:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Cormorant+Garamond:ital,wght@0,600;1,500&family=Outfit:wght@400;500&display=swap");
  </style>
</head>
<body style="margin:0;padding:0;background:#08090c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#08090c;margin:0;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#11141a;border:1px solid #2a2418;">
          <tr>
            <td style="height:3px;background:#c9a44a;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 40px 40px;">
              <p style="margin:0 0 18px;font-family:Cinzel,Times New Roman,serif;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a44a;">
                Adam Tourlakes
              </p>
              <h1 style="margin:0 0 22px;font-family:'Cormorant Garamond',Georgia,Times New Roman,serif;font-size:36px;line-height:1.15;font-weight:600;color:#f3efe6;">
                Thank you for your inquiry.
              </h1>
              <p style="margin:0 0 16px;font-family:Outfit,system-ui,Segoe UI,sans-serif;font-size:16px;line-height:1.65;color:#f3efe6;">
                Hi ${escapeHtml(first)},
              </p>
              <p style="margin:0 0 16px;font-family:Outfit,system-ui,Segoe UI,sans-serif;font-size:16px;line-height:1.65;color:#c4bfb4;">
                I have your inquiry. I will review what you sent and reach out to you within 24 hours — you will hear from me personally.
              </p>
              <p style="margin:0 0 28px;font-family:Outfit,system-ui,Segoe UI,sans-serif;font-size:16px;line-height:1.65;color:#c4bfb4;">
                I stay the point of contact from the first conversation through months after the install. If you would rather talk sooner, call the Cape Coral office and ask for Adam.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#c9a44a;">
                    <a href="${COMPANY.phoneHref}" style="display:inline-block;padding:12px 22px;font-family:Outfit,system-ui,sans-serif;font-size:14px;font-weight:500;letter-spacing:0.04em;color:#16120a;text-decoration:none;">
                      Call ${COMPANY.phoneDisplay}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;font-family:'Cormorant Garamond',Georgia,serif;font-size:22px;font-style:italic;color:#c9a44a;">
                — Adam
              </p>
              <p style="margin:10px 0 0;font-family:Outfit,system-ui,sans-serif;font-size:13px;line-height:1.6;color:#9a958a;">
                Sales Manager<br/>
                ${COMPANY.name}<br/>
                ${COMPANY.addressLine}, ${COMPANY.cityStateZip}
              </p>
            </td>
          </tr>
          <tr>
            <td style="height:1px;background:#c9a44a;opacity:0.45;font-size:0;line-height:0;">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  const thanksText = `Thank you for your inquiry.\n\nHi ${first},\n\nI have your inquiry. I will review what you sent and reach out to you within 24 hours — you will hear from me personally.\n\nI stay the point of contact from the first conversation through months after the install. If you would rather talk sooner, call the Cape Coral office at ${COMPANY.phoneDisplay} and ask for Adam.\n\n— Adam\nSales Manager\n${COMPANY.name}\n${COMPANY.addressLine}, ${COMPANY.cityStateZip}\n`;

  const results = await Promise.allSettled([
    sendEmail({
      to: notifyTo(),
      subject: `New solar inquiry — ${lead.name || "contact form"}`,
      html: notifyHtml,
      text: notifyText,
      replyTo: lead.email,
    }),
    sendEmail({
      to: lead.email,
      subject: "Thank You For Your Inquiry — Adam Tourlakes",
      html: thanksHtml,
      text: thanksText,
      replyTo: "adam@adamtourlakes.com",
    }),
  ]);

  return results.every((r) => r.status === "fulfilled" && r.value.ok);
}
