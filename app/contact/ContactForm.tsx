"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitEnquiry } from "@/lib/site";
import styles from "./contact.module.css";

// The contact page's enquiry form. Same fields, names and delivery as components/EnquiryForm.tsx (POST /api/enquiry);
// the success state is shown only when the API confirms delivery. While no mail provider is configured the API answers
// 503 and the visitor is asked to phone or email instead.
type Status = "idle" | "sending" | "sent" | "error" | "unconnected";
type FieldName = "firstName" | "lastName" | "email" | "consent";

const ORDER: FieldName[] = ["firstName", "lastName", "email", "consent"];

function validate(data: FormData) {
  const text = (k: string) => String(data.get(k) ?? "").trim();
  const errors: Partial<Record<FieldName, string>> = {};
  if (!text("firstName")) errors.firstName = "Please enter your first name.";
  if (!text("lastName")) errors.lastName = "Please enter your last name.";
  if (!text("email")) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text("email")))
    errors.email = "Please enter a valid email address, for example jane@example.com.";
  if (!data.get("consent")) errors.consent = "Please tick the box so we can reply to your enquiry.";
  return errors;
}

export default function ContactForm({ endpoint = "/api/enquiry" }: { endpoint?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "sent") successRef.current?.focus();
  }, [status]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const found = validate(new FormData(form));
    setErrors(found);
    const first = ORDER.find((k) => found[k]);
    if (first) {
      (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    setStatus("sending");
    const r = await submitEnquiry(form, endpoint);
    setStatus(r.ok ? "sent" : r.unconnected ? "unconnected" : "error");
  };

  // Clear a field's message as soon as the visitor starts correcting it.
  const clear = (name: FieldName) => () => {
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };
  const invalid = (name: FieldName) => ({
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const message = (name: FieldName) =>
    errors[name] && (
      <p id={`contact-${name}-error`} className={styles.error}>
        {errors[name]}
      </p>
    );

  if (status === "sent") {
    return (
      <div ref={successRef} tabIndex={-1} role="status" className={styles.success}>
        <span className={styles.tick} aria-hidden="true">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path
              d="M2 8.5 8 14 20 2"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <h3 className={styles.successTitle}>Thank you.</h3>
        <p className={styles.successText}>Your enquiry has been received and we&rsquo;ll be in touch shortly.</p>
        <button type="button" className={styles.again} onClick={() => setStatus("idle")}>
          Send another enquiry
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-busy={sending}>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="contact-firstName">
          First name
        </label>
        <input
          id="contact-firstName"
          className={styles.control}
          name="firstName"
          type="text"
          required
          autoComplete="given-name"
          autoCapitalize="words"
          onInput={clear("firstName")}
          {...invalid("firstName")}
        />
        {message("firstName")}
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="contact-lastName">
          Last name
        </label>
        <input
          id="contact-lastName"
          className={styles.control}
          name="lastName"
          type="text"
          required
          autoComplete="family-name"
          autoCapitalize="words"
          onInput={clear("lastName")}
          {...invalid("lastName")}
        />
        {message("lastName")}
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="contact-email">
          Email
        </label>
        <input
          id="contact-email"
          className={styles.control}
          name="email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          onInput={clear("email")}
          {...invalid("email")}
        />
        {message("email")}
      </div>
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="contact-phone">
          Phone <span className={styles.optional}>(optional)</span>
        </label>
        <input
          id="contact-phone"
          className={styles.control}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </div>
      <div className={`${styles.field} ${styles.full}`}>
        <label className={styles.fieldLabel} htmlFor="contact-interest">
          I am interested in
        </label>
        <select id="contact-interest" className={styles.control} name="interest">
          <option>Mira Living, Bargara</option>
          <option>Future developments</option>
          <option>General enquiry</option>
          <option>Media or partnership</option>
        </select>
      </div>
      <div className={`${styles.field} ${styles.full}`}>
        <label className={styles.fieldLabel} htmlFor="contact-message">
          Message <span className={styles.optional}>(optional)</span>
        </label>
        <textarea
          id="contact-message"
          className={styles.control}
          name="message"
          rows={5}
          placeholder="Tell us about your enquiry"
        />
      </div>
      <div className={`${styles.field} ${styles.full}`}>
        <label className={styles.consent}>
          <input
            className={styles.checkbox}
            name="consent"
            type="checkbox"
            required
            onChange={clear("consent")}
            {...invalid("consent")}
          />
          <span>
            I consent to Furtado Property contacting me about my enquiry. Your details are handled in line with our
            Privacy &amp; Disclaimer and sent to info@furtadoproperty.com.au.
          </span>
        </label>
        {message("consent")}
      </div>
      {(status === "error" || status === "unconnected") && (
        <p role="alert" className={`${styles.notice} ${styles.full}`}>
          <strong>
            {status === "error" ? "Your enquiry could not be sent." : "This form is not delivering enquiries yet."}
          </strong>
          {status === "error" ? "Please try again, or email " : "Please email "}
          <a href="mailto:info@furtadoproperty.com.au">info@furtadoproperty.com.au</a>
          {" or call "}
          <a href="tel:0418982517">0418 982 517</a>
          {status === "error" ? "." : " and we will be in touch within one business day."}
        </p>
      )}
      <div className={`${styles.actions} ${styles.full}`}>
        <button className={styles.submit} type="submit" disabled={sending}>
          {sending ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Sending…
            </>
          ) : (
            <>
              Enquire now
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </>
          )}
        </button>
        <p className={styles.orCall}>
          Or call <a href="tel:0418982517">0418 982 517</a>
        </p>
      </div>
    </form>
  );
}
