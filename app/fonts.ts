// app/fonts.ts
import { Playfair_Display, Lora } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '700', '900'], // choose the weights you want
});

export const lora = Lora({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '700'], // normal and bold
});
