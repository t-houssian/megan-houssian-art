// components/Footer.tsx

export default function Footer() {
    return (
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-600 text-sm">
            &copy; {new Date().getFullYear()} Megan Houssian. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600"
            >
              Facebook
            </a>
            <a
              href="mailto:someone@example.com"
              className="text-gray-400 hover:text-gray-600"
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    );
  }
  