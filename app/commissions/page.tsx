// app/commissions/page.tsx
"use client";

import { useState } from 'react';
import { playfair } from '../fonts';

export default function CommissionsPage() {
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [calcPrice, setCalcPrice] = useState<null | number>(null);

  function handleCalculate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Convert width/height to numbers; if either is NaN, ignore
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h)) {
      setCalcPrice(null);
      return;
    }

    // Price calculation: $.33 per sq inch
    const totalPrice = w * h * .33;
    setCalcPrice(totalPrice);
  }

  return (
    <section className="max-w-4xl mx-auto py-16 px-4 bg-white">
      <h1 className={`${playfair.className} text-4xl font-bold text-gray-900 mb-6`}>
        Commission a Custom Piece
      </h1>
      <p className="text-gray-700 mb-8 leading-relaxed">
        Thank you for your interest in a custom piece by Megan Houssian. 
        Commissions are available at a rate of <strong>$33 per square inch</strong>. 
        Please fill out the form below with your desired artwork details. 
        We will review your request and get back to you with next steps!
      </p>

      {/* Example "questionnaire" form */}
      <form onSubmit={handleCalculate} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-gray-800 font-semibold mb-1">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Your full name"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none 
                       focus:ring-2 focus:ring-gray-900"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-800 font-semibold mb-1">
            Your Email
          </label>
          <input
            type="email"
            id="email"
            placeholder="example@email.com"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none 
                       focus:ring-2 focus:ring-gray-900"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="width" className="block text-gray-800 font-semibold mb-1">
              Desired Width (inches)
            </label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="e.g. 10"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none 
                         focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="height" className="block text-gray-800 font-semibold mb-1">
              Desired Height (inches)
            </label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="e.g. 12"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none 
                         focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-gray-800 font-semibold mb-1">
            Artwork Description or Notes
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Tell us about your ideas (colors, style, subject)..."
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none 
                       focus:ring-2 focus:ring-gray-900"
          ></textarea>
        </div>

        {/* If you'd like to just show a calculated price on the client side: */}
        {calcPrice !== null && (
          <div className="text-green-800 font-semibold">
            Estimated price: ${calcPrice.toLocaleString()}
          </div>
        )}

        <button
          type="submit"
          className="inline-block bg-gray-900 text-white px-6 py-3 rounded-md font-semibold 
                     hover:bg-gray-700 transition-colors duration-300"
        >
          Calculate Estimated Price
        </button>
      </form>
    </section>
  );
}
