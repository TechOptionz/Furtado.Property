// Sends a website enquiry through Resend's REST API (https://resend.com/docs/api-reference/emails/send-email) as a
// branded lead card: wordmark header, the visitor's details, their message, and reply/call buttons. Configured by
// RESEND_API_KEY (required), ENQUIRY_TO and ENQUIRY_FROM (optional, defaults below) in .env.local or the Vercel project env. The logo travels with the email as an
// inline (cid) attachment from lib/enquiry-logo.json, so it shows in Gmail and Outlook without loading anything remote.
import EMAIL_LOGO from "./enquiry-logo.json" with { type: "json" };

export type Enquiry = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
};

export type SendResult = { ok: true; id: string } | { ok: false; status: number; detail: string };

// Brand palette, mirrored from app/globals.css
const C = {
  green: "#26443F",
  greenDeep: "#1C2F2B",
  gold: "#D3B995",
  goldDeep: "#B59168",
  ink: "#20231F",
  ink2: "#444640",
  ink3: "#6E706A",
  ink4: "#9A9C96",
  paper: "#FCFAF6",
  paper2: "#F2EEE5",
  canvas: "#EDE8DE",
  line: "#E4DFD4",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const LOGO_CID = "furtado-property-logo";
const LOGO_WIDTH = 240;
const SITE = "furtadoproperty.com.au";
// Where leads go when ENQUIRY_TO is not set: Kylie and Graham at Furtado Property.
const DEFAULT_TO = "kylie@furtadoproperty.com.au,graham@furtadoproperty.com.au";
// Sender on the domain verified in Resend (furtadoproperty.com.au).
const DEFAULT_FROM = "Furtado Property website <website@furtadoproperty.com.au>";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl2br = (s: string) => escapeHtml(s).replace(/\r?\n/g, "<br>");

export function enquiryRecipients() {
  return (process.env.ENQUIRY_TO ?? DEFAULT_TO)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function enquirySender() {
  return process.env.ENQUIRY_FROM ?? DEFAULT_FROM;
}

function receivedAt(date: Date) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Brisbane",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")} ${get("dayPeriod").toLowerCase()} AEST`;
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

// Table-based layout with inline styles only: that is what survives Gmail, Outlook and Apple Mail.
export function renderEnquiry(enquiry: Enquiry, now = new Date()) {
  const name = `${enquiry.firstName} ${enquiry.lastName}`.trim();
  const interest = enquiry.interest || "General enquiry";
  const received = receivedAt(now);
  const subject = `New enquiry · ${name} · ${interest}`;
  const replySubject = encodeURIComponent(`Re: your enquiry to Furtado Property`);

  const text = [
    `FURTADO PROPERTY — NEW WEBSITE ENQUIRY`,
    ``,
    `${name}`,
    `Interested in: ${interest}`,
    `Received: ${received}`,
    ``,
    `Email:  ${enquiry.email}`,
    `Phone:  ${enquiry.phone || "Not provided"}`,
    ``,
    `Message:`,
    enquiry.message || "(No message)",
    ``,
    `—`,
    `Submitted through the contact form at ${SITE}. The visitor consented to be contacted about this enquiry.`,
    `Reply to this email to respond directly to ${enquiry.firstName}.`,
  ].join("\n");

  const label = (t: string) =>
    `<td style="padding:14px 24px 14px 0;font-family:${FONT};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;` +
    `color:${C.ink3};vertical-align:top;white-space:nowrap;width:120px">${t}</td>`;
  const value = (inner: string) =>
    `<td style="padding:14px 0;font-family:${FONT};font-size:15px;line-height:1.5;color:${C.ink};vertical-align:top">${inner}</td>`;
  const row = (l: string, v: string, last = false) =>
    `<tr><td colspan="2" style="padding:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" ` +
    `style="border-bottom:${last ? "0" : `1px solid ${C.line}`}"><tr>${label(l)}${value(v)}</tr></table></td></tr>`;

  const link = (href: string, t: string) =>
    `<a href="${href}" style="color:${C.green};text-decoration:none;font-weight:600;border-bottom:1px solid ${C.gold}">${escapeHtml(t)}</a>`;

  const button = (href: string, t: string, filled: boolean) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;margin:0 10px 10px 0"><tr>` +
    `<td style="border-radius:999px;background:${filled ? C.green : C.paper};border:1px solid ${filled ? C.green : C.ink4}">` +
    `<a href="${href}" style="display:inline-block;padding:13px 26px;font-family:${FONT};font-size:14px;font-weight:600;` +
    `letter-spacing:.2px;color:${filled ? C.paper : C.ink};text-decoration:none;border-radius:999px">${escapeHtml(t)}</a></td></tr></table>`;

  const buttons =
    button(`mailto:${encodeURIComponent(enquiry.email)}?subject=${replySubject}`, `Reply to ${enquiry.firstName}`, true) +
    (enquiry.phone ? button(telHref(enquiry.phone), `Call ${enquiry.phone}`, false) : "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.canvas};-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(`${name} is interested in ${interest}. ${enquiry.message.slice(0, 110)}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas}">
<tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

<!-- Header -->
<tr><td align="center" style="background:${C.green};border-radius:14px 14px 0 0;padding:34px 40px 30px">
  <img src="cid:${LOGO_CID}" width="${LOGO_WIDTH}" height="${Math.round((EMAIL_LOGO.height / EMAIL_LOGO.width) * LOGO_WIDTH)}" alt="Furtado Property" style="display:block;width:${LOGO_WIDTH}px;height:auto;border:0;outline:none">
</td></tr>
<tr><td style="background:${C.gold};height:3px;line-height:3px;font-size:3px">&nbsp;</td></tr>

<!-- Lead summary -->
<tr><td style="background:${C.paper};padding:36px 40px 8px">
  <p style="margin:0 0 10px;font-family:${FONT};font-size:11px;letter-spacing:2.4px;text-transform:uppercase;color:${C.goldDeep};font-weight:600">New website enquiry</p>
  <h1 style="margin:0 0 10px;font-family:${SERIF};font-size:30px;line-height:1.2;font-weight:400;color:${C.ink}">${escapeHtml(name)}</h1>
  <p style="margin:0;font-family:${FONT};font-size:14px;line-height:1.6;color:${C.ink2}">
    Interested in <strong style="color:${C.ink};font-weight:600">${escapeHtml(interest)}</strong><br>
    <span style="color:${C.ink3}">Received ${escapeHtml(received)}</span>
  </p>
</td></tr>

<!-- Details -->
<tr><td style="background:${C.paper};padding:18px 40px 8px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid ${C.line}">
    ${row("Name", escapeHtml(name))}
    ${row("Email", link(`mailto:${encodeURIComponent(enquiry.email)}`, enquiry.email))}
    ${row("Phone", enquiry.phone ? link(telHref(enquiry.phone), enquiry.phone) : `<span style="color:${C.ink4}">Not provided</span>`)}
    ${row("Interest", escapeHtml(interest), true)}
  </table>
</td></tr>

<!-- Message -->
<tr><td style="background:${C.paper};padding:14px 40px 10px">
  <p style="margin:0 0 10px;font-family:${FONT};font-size:11px;letter-spacing:1.6px;text-transform:uppercase;color:${C.ink3}">Message</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:#FFFFFF;border:1px solid ${C.line};border-left:3px solid ${C.gold};border-radius:0 10px 10px 0;padding:18px 22px;font-family:${FONT};font-size:15px;line-height:1.65;color:${C.ink}">${
      enquiry.message ? nl2br(enquiry.message) : `<span style="color:${C.ink4};font-style:italic">No message was left.</span>`
    }</td></tr>
  </table>
</td></tr>

<!-- Actions -->
<tr><td style="background:${C.paper};padding:22px 40px 34px">
  ${buttons}
  <p style="margin:6px 0 0;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.ink3}">Replying to this email also goes straight to ${escapeHtml(enquiry.firstName)}.</p>
</td></tr>

<!-- Footer -->
<tr><td style="background:${C.paper2};border-top:1px solid ${C.line};border-radius:0 0 14px 14px;padding:20px 40px 24px">
  <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;line-height:1.6;color:${C.ink3}">
    Submitted through the contact form at <a href="https://www.${SITE}" style="color:${C.green};text-decoration:none;font-weight:600">${SITE}</a>.
    The visitor consented to Furtado Property contacting them about this enquiry.
  </p>
  <p style="margin:0;font-family:${FONT};font-size:11px;line-height:1.6;color:${C.ink4}">Furtado Property · Bargara, Queensland</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}

export async function sendEnquiry(enquiry: Enquiry): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, status: 0, detail: "RESEND_API_KEY is not set" };

  const { subject, text, html } = renderEnquiry(enquiry);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: enquirySender(),
        to: enquiryRecipients(),
        reply_to: enquiry.email,
        subject,
        text,
        html,
        attachments: [{ filename: "furtado-property.png", content: EMAIL_LOGO.base64, content_id: LOGO_CID }],
        tags: [{ name: "type", value: "enquiry" }],
      }),
      signal: controller.signal,
    });
    const detail = await res.text();
    if (!res.ok) return { ok: false, status: res.status, detail };
    let id = "";
    try {
      id = (JSON.parse(detail) as { id?: string }).id ?? "";
    } catch {}
    return { ok: true, id };
  } catch (err) {
    return { ok: false, status: 0, detail: String(err) };
  } finally {
    clearTimeout(timer);
  }
}
