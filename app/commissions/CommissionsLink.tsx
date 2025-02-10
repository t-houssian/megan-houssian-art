
"use client";

export default function CommissionsLink() {
  return (
    <section 
        id="contact"
        className="py-16 px-4 bg-gray-50 text-center"
        >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Interested in a Commission?
        </h2>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            I create custom artwork at a rate of <b>$0.33 per square inch</b>. 
            Let me know your desired style, size, and details, and we&apos;ll make it happen.
        </p>
        <a
            href="/commissions"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-semibold 
                        hover:bg-gray-700 transition-colors duration-300"
        >
            Commission a Piece
        </a>
    </section>
);
}