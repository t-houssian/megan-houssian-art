"use client";

import { FormEvent, useEffect, useState } from "react";
import { cormorant, lora } from "../fonts";

type SubscribeResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CollectorEarlyAccess() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.location.hash === "#collector-early-access") {
      setIsOpen(true);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();
    const trimmedFirstName = firstName.trim();

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedFirstName) {
      setErrorMessage("Please enter your first name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/kit/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: trimmedFirstName,
          email: trimmedEmail,
          referrer:
            typeof window !== "undefined"
              ? window.location.href
              : undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as SubscribeResponse | null;

      if (!response.ok || !payload?.success) {
        const message = payload?.error || payload?.message || "Unable to subscribe right now.";
        throw new Error(message);
      }

      setSuccessMessage(payload.message || "You're in. Watch your inbox for early access updates.");
      setFirstName("");
      setEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to subscribe right now.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="collector-early-access" className="py-16 px-4 bg-accent-cream text-center border-y border-tan">
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-medium text-brown mb-4`}>
        Collector Early Access
      </h2>
      <p className={`${lora.className} text-brown mb-8 max-w-2xl font-light mx-auto`}>
        Join my Collector List and I&apos;ll email you a private preview link 24 hours before new originals go live.
      </p>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-block bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-3 rounded-full font-medium shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 border border-paper/20 relative overflow-hidden group ${lora.className}`}
        >
          <span className="relative z-10">Get early access</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
        </button>
      ) : (
        <div className="max-w-xl mx-auto bg-white/80 backdrop-blur-sm border border-tan/40 rounded-2xl p-6 shadow-vintage-lg text-left">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="collector-first-name" className={`${lora.className} block text-brown font-medium mb-2`}>
                First Name
              </label>
              <input
                id="collector-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                placeholder="Your first name"
              />
            </div>
            <div>
              <label htmlFor="collector-email" className={`${lora.className} block text-brown font-medium mb-2`}>
                Email
              </label>
              <input
                id="collector-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                placeholder="you@example.com"
              />
            </div>
            {errorMessage && <p className="text-red-700 text-sm">{errorMessage}</p>}
            {successMessage && <p className="text-olive text-sm">{successMessage}</p>}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-block bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-6 py-2.5 rounded-full font-medium shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 border border-paper/20 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed ${lora.className}`}
              >
                <span className="relative z-10">{isSubmitting ? "Submitting..." : "Get early access"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setErrorMessage(null);
                }}
                className={`${lora.className} text-warm-gray hover:text-brown transition-colors text-sm`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <p className={`${lora.className} text-warm-gray/90 text-sm mt-6 max-w-2xl mx-auto`}>
        By signing up, you&apos;ll receive emails about new paintings and releases. Unsubscribe anytime.
      </p>
    </section>
  );
}
