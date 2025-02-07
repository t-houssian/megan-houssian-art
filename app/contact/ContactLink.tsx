// app/components/ContactLink.tsx
"use client";

export default function ContactLink() {
  return (
    <section 
      className="py-16 px-4 bg-white text-center"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Contact the Artist
      </h2>
      <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
        Fill out the form below or email me at{" "}
        <a 
          href="mailto:meganhoussian@gmail.com" 
          className="underline text-blue-600 hover:text-blue-800"
        >
          meganhoussian@gmail.com
        </a>
      </p>
      <a
        href="/contact"
        className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold 
                   hover:bg-gray-700 transition-colors duration-300"
      >
        Go to Contact Page
      </a>
    </section>
  );
}
