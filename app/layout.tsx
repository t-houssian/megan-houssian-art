// app/layout.tsx
import "./globals.css";
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Megan Houssian Art',
  description: 'Official art portfolio of Megan Houssian',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 min-h-screen flex flex-col">
        <NavBar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
