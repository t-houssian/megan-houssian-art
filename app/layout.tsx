// app/layout.tsx
import "./globals.css";
import { ReactNode } from 'react';
import Footer from './components/Footer';
import NavBar from './components/NavBar';

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
      <body className="relative min-h-screen flex flex-col">
        {/* Sticky top NavBar */}
        <NavBar />

        {/* Page Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
