"use client";

import { cormorant, lora } from "../fonts";
import CollectorPasswordInput from "../originals-collectors-access/CollectorPasswordInput";

type CollectorAccessGateProps = {
  formAction?: string;
  error?: "invalid-password";
};

export default function CollectorAccessGate({ formAction = "/originals/unlock", error }: CollectorAccessGateProps) {
  return (
    <div id="collector-access" className="rounded-3xl border border-tan/30 bg-white/85 p-8 md:p-10 shadow-vintage-lg backdrop-blur-sm">
      <p className={`${lora.className} text-sm uppercase tracking-[0.22em] text-olive mb-4`}>
        Private collector preview
      </p>
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-light text-brown mb-4`}>
        Collector Access
      </h2>
      <p className={`${lora.className} text-warm-gray mb-6`}>
        Collectors have received the password via email. Need the password? Join the{' '}
        <a href="/#collector-early-access" className="text-olive underline underline-offset-4 hover:text-brown">
          Collector List
        </a>{' '}
        to receive it, then enter it below to open the private originals gallery.
      </p>

      <form action={formAction} method="post" className="space-y-4">
        <CollectorPasswordInput />

        {error === "invalid-password" && (
          <p className={`${lora.className} text-sm text-red-700`}>
            That password was incorrect. Please try again.
          </p>
        )}

        <button
          type="submit"
          className={`inline-flex items-center justify-center rounded-full border-2 border-black/80 bg-gradient-to-r from-btn-brown to-btn-brown-hover px-8 py-3 text-paper shadow-vintage transition-all duration-500 hover:-translate-y-0.5 hover:shadow-vintage-lg ${lora.className}`}
        >
          Open collector gallery
        </button>
      </form>
    </div>
  );
}
