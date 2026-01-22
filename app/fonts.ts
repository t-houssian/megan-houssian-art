import { Cormorant_Garamond, Lora } from 'next/font/google';

export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'],
});

export const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '700'],
});
