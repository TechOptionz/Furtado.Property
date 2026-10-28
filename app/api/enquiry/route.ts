import { NextResponse } from "next/server";
import { sendEnquiry } from "@/lib/enquiry-mail";

// Enquiry delivery. Emails the enquiry through Resend (https://resend.com) when RESEND_API_KEY is set; until then it
// answers 503 and the form tells the visitor to phone or email instead. Addresses come from .env.local (see .env.example).

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

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

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Enquiry delivery is not configured." }, { status: 503 });
  }

  const result = await sendEnquiry(enquiry);
  if (!result.ok) {
    console.error("Enquiry delivery failed", result.status, result.detail);
    return NextResponse.json({ error: "Delivery failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, id: result.id });
}
