"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import type { CollectorSignupSettings } from "../../lib/collector-signup-settings";
import { useFormReady } from "../../lib/use-form-ready";
import { cormorant, lora } from "../fonts";

type CollectorSignupProps = {
  settings: CollectorSignupSettings;
  className?: string;
};

type SubscribeResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECTION_ID = "collector-list";
const LEGACY_SECTION_ID = "collector-early-access";

export default function CollectorSignup({ settings, className = "" }: CollectorSignupProps) {
  const isReady = useFormReady();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const submissionInFlight = useRef(false);

  useEffect(() => {
    const openLinkedForm = () => {
      if ([`#${SECTION_ID}`, `#${LEGACY_SECTION_ID}`].includes(window.location.hash)) {
        setIsOpen(true);
      }
    };

    openLinkedForm();
    window.addEventListener("hashchange", openLinkedForm);
    return () => window.removeEventListener("hashchange", openLinkedForm);
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady || submissionInFlight.current) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    const trimmedFirstName = firstName.trim();
    const trimmedEmail = email.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage(settings.emailValidationMessage);
      return;
    }
    if (!trimmedFirstName) {
      setErrorMessage(settings.firstNameValidationMessage);
      return;
    }

    submissionInFlight.current = true;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/kit/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimmedFirstName,
          email: trimmedEmail,
          referrer: window.location.href,
        }),
      });
      const payload = (await response.json().catch(() => null)) as SubscribeResponse | null;

      if (!response.ok || !payload?.success) {
        const message = [payload?.error, payload?.message].find(
          (value): value is string => typeof value === "string" && value.trim().length > 0
        );
        throw new Error(message || settings.errorMessage);
      }

      setSuccessMessage(settings.successMessage);
      setFirstName("");
      setEmail("");
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : settings.errorMessage);
    } finally {
      submissionInFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id={SECTION_ID}
      aria-labelledby="collector-signup-heading"
      className={`relative py-16 px-4 bg-accent-cream text-center border-y border-tan ${className}`.trim()}
    >
      <span id={LEGACY_SECTION_ID} aria-hidden="true" className="absolute left-0 top-0 h-px w-px" />
      <h2 id="collector-signup-heading" className={`${cormorant.className} break-words text-3xl md:text-4xl font-medium text-brown mb-4`}>
        {settings.heading}
      </h2>
      <p className={`${lora.className} break-words text-brown mb-8 max-w-2xl font-light mx-auto`}>
        {settings.description}
      </p>

      {!isOpen ? (
        <button
          type="button"
          disabled={!isReady}
          onClick={() => setIsOpen(true)}
          className={`inline-block max-w-full min-w-0 whitespace-normal break-words bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-3 rounded-full font-medium shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 border-2 border-black/80 relative overflow-hidden group disabled:opacity-70 disabled:cursor-wait ${lora.className}`}
        >
          <span className="relative z-10">{settings.buttonLabel}</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
        </button>
      ) : (
        <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-tan/40 rounded-2xl p-6 shadow-vintage-lg text-left">
          <form onSubmit={handleSubmit} noValidate aria-busy={!isReady || isSubmitting}>
            <fieldset disabled={!isReady || isSubmitting} className="min-w-0 space-y-4">
              <div>
                <label htmlFor="collector-first-name" className={`${lora.className} block break-words text-brown font-medium mb-2`}>
                  {settings.firstNameLabel}
                </label>
                <input
                  id="collector-first-name"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  maxLength={100}
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  className="w-full min-w-0 border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                  placeholder={settings.firstNamePlaceholder}
                />
              </div>
              <div>
                <label htmlFor="collector-email" className={`${lora.className} block break-words text-brown font-medium mb-2`}>
                  {settings.emailLabel}
                </label>
                <input
                  id="collector-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full min-w-0 border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                  placeholder={settings.emailPlaceholder}
                />
              </div>
              {errorMessage && <p role="alert" className="break-words text-red-700 text-sm">{errorMessage}</p>}
              {successMessage && <p role="status" className="break-words text-olive text-sm">{successMessage}</p>}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className={`inline-block max-w-full min-w-0 whitespace-normal break-words bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-6 py-2.5 rounded-full font-medium shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 border-2 border-black/80 relative overflow-hidden group disabled:opacity-70 disabled:cursor-wait ${lora.className}`}
                >
                  <span className="relative z-10">{isSubmitting ? settings.submittingLabel : settings.buttonLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`${lora.className} max-w-full min-w-0 break-words text-warm-gray hover:text-brown transition-colors text-sm disabled:opacity-70 disabled:cursor-wait`}
                >
                  {settings.cancelLabel}
                </button>
              </div>
            </fieldset>
          </form>
        </div>
      )}

      <p className={`${lora.className} break-words text-warm-gray/90 text-sm mt-6 max-w-2xl mx-auto`}>
        {settings.finePrint}
      </p>
    </section>
  );
}
