// components/CallToAction.tsx
"use client";

export default function CallToAction() {
  return (
    <section 
      id="contact" 
      className="py-16 px-4 bg-[#f5f2ec] text-gray-900"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Stay Connected
        </h2>
        <p className="text-gray-700 mb-8">
          Be the first to know about new artwork, upcoming exhibitions, and exclusive offers.
        </p>
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-1/2 px-4 py-3 rounded-sm text-gray-800 
                       focus:outline-none focus:ring-2 focus:ring-gray-500"
            required
          />
          <button
            type="submit"
            className="inline-block border border-gray-800 bg-gray-800 text-white px-6 py-3 rounded-sm font-semibold 
                       hover:bg-white hover:text-gray-800 transition-colors duration-300"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
