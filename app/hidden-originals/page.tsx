import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Hidden Originals | Megan Houssian Art',
  robots: {
    index: false,
    follow: false,
  },
};

export const revalidate = 0;

export default function HiddenOriginalsPage() {
  redirect('/originals');
}
