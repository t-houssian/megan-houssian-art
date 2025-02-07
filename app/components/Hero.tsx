// components/Hero.tsx

export default function Hero() {
  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#f9e7dd] via-[#f1c9c0] to-[#ecafa4]">
      <div className="text-center max-w-3xl px-4">
        <h1 className="text-5xl sm:text-7xl font-bold text-gray-800 mb-6">
          Discover the Art of <br className="hidden sm:block" />
          <span className="text-gray-700">Megan Houssian</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          A journey through contemporary expression, capturing the essence 
          of beauty and emotion in every piece.
        </p>
        <a
          href="#gallery"
          className="inline-block bg-gray-800 text-white px-8 py-3 rounded-md text-base font-semibold hover:bg-gray-700 transition-colors"
        >
          Explore the Gallery
        </a>
      </div>
    </section>
  );
}
