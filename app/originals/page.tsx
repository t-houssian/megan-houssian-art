import Link from 'next/link';
import { cormorant, lora } from '../fonts';
import { fetchOriginalsPageSettings } from '../../lib/originals-page-settings';

export const revalidate = 60;

type SectionCardProps = {
  title: string;
  description: string;
  showEarlyAccessButton?: boolean;
};

function SectionCard({ title, description, showEarlyAccessButton = false }: SectionCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-7 shadow-vintage h-full">
      <h2 className={`${cormorant.className} text-2xl text-brown mb-3`}>
        {title}
      </h2>
      <p className={`${lora.className} text-warm-gray leading-relaxed mb-5`}>
        {description}
      </p>
      <p className={`${lora.className} text-sm font-medium text-olive mb-4`}>
        Coming soon
      </p>
      {showEarlyAccessButton && (
        <Link
          href="/#collector-early-access"
          className={`inline-block bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-6 py-2.5 rounded-full font-medium shadow-vintage hover:shadow-vintage-lg transition-all duration-500 hover:-translate-y-0.5 border border-paper/20 relative overflow-hidden group ${lora.className}`}
        >
          <span className="relative z-10">Get early access</span>
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
        </Link>
      )}
    </div>
  );
}

export default async function OriginalsPage() {
  const settings = await fetchOriginalsPageSettings();

  return (
    <section className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-7xl mx-auto py-16 px-6">
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light mb-6 text-brown tracking-wide`}>
            {settings.pageTitle}
          </h1>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-olive to-transparent mx-auto mb-6"></div>
          <p className={`${lora.className} text-lg text-warm-gray max-w-3xl mx-auto leading-relaxed`}>
            {settings.pageIntro}
          </p>
        </div>

        <div className="text-center mb-10">
          <h2 className={`${cormorant.className} text-3xl md:text-4xl text-brown mb-4`}>
            {settings.availableOriginalsAnnouncement}
          </h2>
          <p className={`${lora.className} text-warm-gray max-w-3xl mx-auto leading-relaxed`}>
            {settings.availableOriginalsDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-7 shadow-vintage h-full">
            <h2 className={`${cormorant.className} text-2xl text-brown mb-3`}>
              {settings.availableOriginalsLabel}
            </h2>
            <p className={`${lora.className} text-warm-gray leading-relaxed mb-5`}>
              {settings.availableOriginalsCardDescription}
            </p>
            <p className={`${lora.className} text-sm font-medium text-olive mb-4`}>
              Coming soon
            </p>
          </div>

          <SectionCard
            title={settings.collectionsLabel}
            description={settings.collectionsDescription}
            showEarlyAccessButton
          />

          <SectionCard
            title={settings.printsLabel}
            description={settings.printsDescription}
          />
        </div>
      </div>
    </section>
  );
}
