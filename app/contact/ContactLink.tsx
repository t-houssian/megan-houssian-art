// ── ./contact/ContactLink.tsx ──
import { cormorant, lora } from '../fonts';
import type { HomepageContent } from '../../sanity/lib/siteContent';

type ContactLinkProps = {
  content: HomepageContent;
};

export default function ContactLink({ content }: ContactLinkProps) {
  return (
    <section 
      className="py-16 px-4 bg-paper text-center"
    >
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-medium text-brown mb-4`}>
        {content.contactHeading}
      </h2>
      <p className={`${lora.className} text-brown mb-8 max-w-2xl font-light mx-auto`}>
        {content.contactIntroText}{" "}
        <a 
          href={`mailto:${content.contactEmail}`} 
          className="underline text-olive hover:text-brown"
        >
          {content.contactEmail}
        </a>
      </p>
      <a
        href="/contact"
        className={`inline-block bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-3 rounded-full font-medium 
                   shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 
                   border-2 border-black/80 relative overflow-hidden group ${lora.className}`}
      >
        <span className="relative z-10">{content.contactButtonLabel}</span>
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent 
                        opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full 
                        group-hover:translate-x-full transition-all duration-700" />
      </a>
    </section>
  );
}
