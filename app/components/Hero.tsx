// components/Hero.tsx

export default function Hero() {
    return (
      <section className="relative w-full h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#f9e7dd] to-[#f1c9c0]">
        <div className="text-center max-w-3xl px-4">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-4">
            Megan Houssian Art
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Contemporary artwork that inspires, captivates, and elevates spaces.
          </p>
          <a
            href="#gallery"
            className="inline-block bg-gray-800 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-gray-700 transition-colors"
          >
            View Gallery
          </a>
        </div>
      </section>
    );
  }
  