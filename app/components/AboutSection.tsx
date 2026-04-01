import Link from 'next/link';
import { cormorant, lora } from "../fonts";
import type { HomepageContent } from '../../sanity/lib/siteContent';

type AboutSectionProps = {
  content: HomepageContent;
};

export default function AboutSection({ content }: AboutSectionProps) {
  return (
    <section className="py-14 px-4 bg-paper text-center border-y border-tan/30">
      <h2 className={`${cormorant.className} text-3xl md:text-4xl font-medium text-brown mb-2`}>
        {content.aboutHeading}
      </h2>
      <p className={`${lora.className} text-olive text-sm md:text-base tracking-wide mb-4 italic`}>
        {content.aboutLocation}
      </p>
      <p className={`${lora.className} text-brown/80 max-w-2xl mx-auto mb-6 leading-relaxed`}>
        {content.aboutDescription}
      </p>
      <Link
        href="/about"
        className={`inline-block bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-3 rounded-full font-medium 
                   shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 
                   border-2 border-black/80 relative overflow-hidden group ${lora.className}`}
      >
        {content.aboutButtonLabel}
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent 
                        opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full 
                        group-hover:translate-x-full transition-all duration-700" />
      </Link>
    </section>
  );
}
