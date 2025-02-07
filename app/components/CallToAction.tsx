// components/CallToAction.tsx
"use client";

export default function CallToAction() {
  return (
    <section 
      id="contact" 
      className="py-16 px-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Stay Connected
        </h2>
        <p className="text-gray-100 mb-8">
          Be the first to know about new artwork, upcoming exhibitions, and exclusive offers.
        </p>
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-1/2 px-4 py-3 rounded-md text-gray-800 
                       focus:outline-none focus:ring-2 focus:ring-white/60"
            required
          />
          <button
            type="submit"
            className="inline-block bg-white text-gray-900 px-6 py-3 rounded-md font-semibold 
                       hover:bg-gray-200 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
