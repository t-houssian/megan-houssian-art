// components/Footer.tsx
export default function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 text-sm mb-3 md:mb-0">
            &copy; {new Date().getFullYear()} Megan Houssian. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#8a6d3b] transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[#8a6d3b] transition-colors"
            >
              Facebook
            </a>
            <a
              href="mailto:someone@example.com"
              className="text-gray-600 hover:text-[#8a6d3b] transition-colors"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    );
  }
  