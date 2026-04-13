import type { Metadata } from 'next';
import OriginalsGalleryPage from '../components/OriginalsGalleryPage';

export const metadata: Metadata = {
  title: 'Hidden Originals | Megan Houssian Art',
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 60;

export default function HiddenOriginalsPage() {
  return <OriginalsGalleryPage sourcePath="/hidden-originals" />;
}
