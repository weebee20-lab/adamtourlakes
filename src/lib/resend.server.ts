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

  const thanksHtml = `
    <div style="margin:0;padding:32px 24px;background:#08090c;color:#f4f1ea">
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;color:#c9a227;margin:0 0 16px">Adam Tourlakes</p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;color:#c9a227;margin:0 0 18px">Thank you for your inquiry.</p>
      <p style="font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.6;color:#f4f1ea;margin:0 0 14px">
        Hi ${escapeHtml(first)},
      </p>
      <p style="font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.6;color:#d8d4cc;margin:0 0 14px">
        I received your note from the site. I will review it and follow up personally — I am the point of contact from the first call through after the install.
      </p>
      <p style="font-family:system-ui,-apple-system,sans-serif;font-size:16px;line-height:1.6;color:#d8d4cc;margin:0 0 22px">
        If you would rather talk now, call the Cape Coral office at ${COMPANY.phoneDisplay} and ask for Adam.
      </p>
      <p style="font-family:system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.55;color:#9a958c;margin:0">
        ${COMPANY.name}<br/>
        ${COMPANY.addressLine}<br/>
        ${COMPANY.cityStateZip}
      </p>
      <p style="font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#c9a227;margin:28px 0 0">— Adam</p>
    </div>
  `;
  const thanksText = `Thank you for your inquiry.\n\nHi ${first},\n\nI received your note from the site. I will review it and follow up personally — I am the point of contact from the first call through after the install.\n\nIf you would rather talk now, call the Cape Coral office at ${COMPANY.phoneDisplay} and ask for Adam.\n\n${COMPANY.name}\n${COMPANY.addressLine}\n${COMPANY.cityStateZip}\n\n— Adam\n`;

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
