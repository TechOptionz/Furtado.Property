// Sends a sample enquiry to check mail delivery end to end.
//
//   npm run mail:test              posts to the running dev server (http://localhost:3000/api/enquiry)
//   npm run mail:test -- --direct  sends through lib/enquiry-mail.ts straight from .env.local, no dev server needed
//   npm run mail:test -- --preview writes the rendered email to scripts/.email-preview.html (git-ignored) and sends nothing
//   npm run mail:test -- --url https://www.furtadoproperty.com.au/api/enquiry   test a deployment
//   npm run mail:test -- --announce --url <deployed>/api/enquiry   "the new site is live" notice to the real recipients
//
// Reads RESEND_API_KEY / ENQUIRY_TO / ENQUIRY_FROM from .env.local (then .env) in the project root.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
for (const name of [".env.local", ".env"]) {
  let text;
  try {
    text = readFileSync(resolve(root, name), "utf8");
  } catch {
    continue;
  }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(["'])(.*)\1$/, "$2");
  }
}

const args = process.argv.slice(2);
const direct = args.includes("--direct");
const preview = args.includes("--preview");
const urlIndex = args.indexOf("--url");
const url = urlIndex >= 0 && args[urlIndex + 1] ? args[urlIndex + 1] : "http://localhost:3000/api/enquiry";

const to = (process.env.ENQUIRY_TO ?? "kylie@furtadoproperty.com.au,graham@furtadoproperty.com.au").split(",").map((s) => s.trim()).filter(Boolean);

const stamp = new Date().toLocaleString("en-AU", { timeZone: "Australia/Brisbane", dateStyle: "long", timeStyle: "short" });
const announce = args.includes("--announce"); // "the new site is live" notice to the real recipients
const enquiry = announce
  ? {
      firstName: "Website",
      lastName: "Go-live check",
      email: "arshmanali08@gmail.com",
      phone: "",
      interest: "General enquiry",
      message:
        "The new Furtado Property website is live.\n\n" +
        "This is a test enquiry sent through the live contact form to confirm that website enquiries reach this inbox. " +
        "From now on, every enquiry submitted on furtadoproperty.com.au will arrive as an email like this one, " +
        "and replying to it goes straight to the person who enquired.\n\n" +
        `Sent ${stamp} AEST. No action is needed.`,
      consent: "on",
    }
  : {
      firstName: "Jane",
      lastName: "Smith",
      email: to[0],
      phone: "0400 000 000",
      interest: "Mira Living, Bargara",
      message:
        "Hi, my husband and I are looking to downsize to Bargara next year and would love to know more about the " +
        "three-bedroom apartments at Mira Living, particularly the ocean-facing ones on the upper levels.\n\n" +
        "Could you send through the price list and let me know when we could arrange an inspection? " +
        `(Test enquiry sent ${stamp} AEST from scripts/send-test-mail.mjs.)`,
      consent: "on",
    };

if (preview || direct) {
  // Node 22.18+ / 24 runs .ts directly (type stripping), so the test uses the exact code the website uses.
  const mail = await import("../lib/enquiry-mail.ts");
  if (preview) {
    const { renderEnquiry } = mail;
    const { default: EMAIL_LOGO } = await import("../lib/enquiry-logo.json", { with: { type: "json" } });
    const { subject, html, text } = renderEnquiry(enquiry);
    const out = resolve(root, "scripts/.email-preview.html");
    writeFileSync(out, html.replace(/cid:[a-z-]+/g, `data:image/png;base64,${EMAIL_LOGO.base64}`));
    console.log(`Subject: ${subject}\n\n${text}\n\nPreview written to ${out}`);
  } else {
    if (!process.env.RESEND_API_KEY) fail("RESEND_API_KEY is empty. Paste your Resend key into .env.local first.");
    console.log(`Sending through Resend\n  from: ${mail.enquirySender()}\n  to:   ${to.join(", ")}`);
    const r = await mail.sendEnquiry(enquiry);
    if (!r.ok) fail(`Failed ${r.status}: ${r.detail}`);
    console.log(`OK: message id ${r.id}\nCheck the inbox for ${to.join(", ")} (and spam).`);
  }
} else {
  console.log(`Posting a sample enquiry to ${url}\n  (expected recipient: ${to.join(", ")})`);
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(enquiry),
    });
  } catch (err) {
    fail(`Could not reach ${url}: ${err.cause?.code ?? err.message}. Is \`npm run dev\` running? Or use --direct.`);
  }
  const body = await res.text();
  if (res.status === 503) fail("The API answered 503: RESEND_API_KEY is empty in .env.local (restart `next dev` after setting it).");
  if (!res.ok) fail(`Failed ${res.status}: ${body}`);
  console.log(`OK ${res.status}: ${body}\nCheck the inbox for ${to.join(", ")} (and spam).`);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}
