import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Collectors Access | Megan Houssian Art',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OriginalsCollectorsAccessPage() {
  redirect('/originals');
}
