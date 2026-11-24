// app/about/page.tsx
import ArtworkImage from '../components/ArtworkImage';
import { getImageAssetDimensions, urlFor } from '../../sanity/lib/image';
import { cormorant, lora } from "../fonts";
import { fetchAboutPageSettings } from '../../lib/about-page-settings';
import SanityRichText from '../components/SanityRichText';

export const metadata = {
  title: 'About - Megan Houssian Art',
  description: 'Learn about artist Megan Houssian and her artistic journey',
};

export default async function AboutPage() {
  const settings = await fetchAboutPageSettings();
  const image = settings.aboutPageImage;
  const dimensions = image?.asset ? getImageAssetDimensions(image) : undefined;
  let aboutImageUrl = '/images/about.JPEG';
  if (image?.asset) {
    let builder = urlFor(image);
    // Both portrait frames center the photo horizontally. Trim the invisible
    // sides of a wider upload so object-cover gets full-resolution pixels.
    if (dimensions && dimensions.width / dimensions.height > 4 / 5) {
      const width = Math.round(dimensions.height * 4 / 5);
      builder = builder.rect(Math.round((dimensions.width - width) / 2), 0, width, dimensions.height);
    }
    aboutImageUrl = builder.url();
  }
  const aboutImageAlt = settings.aboutPageImage?.alt?.trim() || 'Megan Houssian';

  return (
    <section className="py-16 px-4 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-6`}>
              {settings.pageTitle}
            </h1>
            <SanityRichText
              value={settings.content}
              paragraphClassName={`${lora.className} text-brown leading-relaxed text-lg`}
            />
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="group relative w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
              <figure className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden bg-paper shadow-[0_28px_48px_-32px_var(--shadow-color-strong)]">
                <ArtworkImage
                  src={aboutImageUrl}
                  alt={aboutImageAlt}
                  fill
                  quality={90}
                  className="object-cover transition-transform duration-[1600ms] ease-out group-hover:scale-[1.02]"
                  style={{ objectPosition: 'center top' }}
                  sizes="(min-width: 1232px) 576px, (min-width: 768px) calc(50vw - 40px), (min-width: 640px) 448px, min(410px, calc(100vw - 8px))"
                />
              </figure>
            </div>
          </div>
        </div>

        {/* Additional content section */}
        {/* <div className="bg-ivory border border-tan rounded-lg p-8">
          <h2 className={`${cormorant.className} text-3xl font-medium text-brown mb-6`}>
            My Artistic Journey
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className={`${lora.className} text-xl font-medium text-brown mb-3`}>
                Inspiration & Process
              </h3>
              <p className={`${lora.className} text-brown leading-relaxed`}>
                My artistic process begins with observation of the natural world around me. 
                Living in the Texas Hill Country provides endless inspiration through changing seasons, 
                wildflower blooms, and the interplay of light and shadow across the landscape.
              </p>
            </div>
            <div>
              <h3 className={`${lora.className} text-xl font-medium text-brown mb-3`}>
                Medium & Technique
              </h3>
              <p className={`${lora.className} text-brown leading-relaxed`}>
                I work primarily with acrylics and mixed media, allowing for both spontaneous expression 
                and careful detail work. Each piece evolves organically, with layers building upon each other 
                to create depth and visual interest.
              </p>
            </div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
