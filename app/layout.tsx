// app/layout.tsx
import './globals.css';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { ReactNode } from 'react';
import { lora } from './fonts'; // playfair is also available

export const metadata = {
  title: 'Megan Houssian Art',
  description: 'Official art portfolio of Megan Houssian',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      {/* 
        We'll set body to our Lora font (lora.className). 
        You can set headings to Playfair in individual components 
        using a className or do everything with a single font. 
      */}
      <body className={`${lora.className} bg-white text-gray-800 min-h-screen flex flex-col`}>
        <NavBar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
