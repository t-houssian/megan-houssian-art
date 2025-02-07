// components/NavBar.tsx

import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">
          <Link href="/">
            Megan Houssian Art
          </Link>
        </div>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <a href="#about" className="hover:text-gray-900">
              About
            </a>
          </li>
          <li>
            <a href="#gallery" className="hover:text-gray-900">
              Gallery
            </a>
          </li>
          <li>
            <a href="#contact" className="hover:text-gray-900">
              Contact
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
