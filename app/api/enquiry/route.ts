import { NextResponse } from "next/server";

// Enquiry delivery. Emails the enquiry through Resend (https://resend.com) when RESEND_API_KEY is set; until then it
// answers 503 and the form tells the visitor to phone or email instead. See .env.example.
const TO = process.env.ENQUIRY_TO ?? "info@furtadoproperty.com.au";
const FROM = process.env.ENQUIRY_FROM ?? "Furtado Property website <onboarding@resend.dev>";

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const enquiry = {
    firstName: clean(body.firstName, 100),
    lastName: clean(body.lastName, 100),
    email: clean(body.email, 200),
    phone: clean(body.phone, 50),
    interest: clean(body.interest, 100),
    message: clean(body.message, 5000),
  };
  if (!enquiry.firstName || !enquiry.lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) || !body.consent) {
    return NextResponse.json({ error: "Please complete the required fields." }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "Enquiry delivery is not configured." }, { status: 503 });

  const rows = Object.entries(enquiry)
    .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#666">${k}</td><td>${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: enquiry.email,
      subject: `Website enquiry — ${enquiry.firstName} ${enquiry.lastName} (${enquiry.interest || "General"})`,
      html: `<table style="font-family:sans-serif;font-size:14px">${rows}</table>`,
    }),
  });
  if (!res.ok) {
    console.error("Enquiry delivery failed", res.status, await res.text());
    return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
