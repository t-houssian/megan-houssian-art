// app/contact/page.tsx
"use client";

import { useState } from 'react';

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // For now, just log the data or do something with it
    console.log({
      firstName,
      lastName,
      email,
      subject,
      message
    });

    // In production, you'd send this to your email server, API route, etc.
    alert("Thank you! Your message has been submitted.");
  }

  return (
    <section className="max-w-4xl mx-auto py-16 px-4 bg-white">
      <h1 className="text-4xl font-bold mb-6 text-gray-900">Contact the Artist</h1>
      <p className="text-gray-700 mb-8">
        Fill out the form below or email me at{" "}
        <a 
          href="mailto:meganhoussian@gmail.com" 
          className="underline text-blue-600 hover:text-blue-800"
        >
          meganhoussian@gmail.com
        </a>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          {/* First Name */}
          <div className="sm:w-1/2 mb-4 sm:mb-0">
            <label 
              htmlFor="firstName" 
              className="block text-gray-800 font-semibold mb-1"
            >
              First Name (required)
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>

          {/* Last Name */}
          <div className="sm:w-1/2">
            <label 
              htmlFor="lastName" 
              className="block text-gray-800 font-semibold mb-1"
            >
              Last Name (required)
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label 
            htmlFor="email" 
            className="block text-gray-800 font-semibold mb-1"
          >
            Email (required)
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 
                       focus:outline-none focus:ring-2 focus:ring-gray-900"
            required
          />
        </div>

        {/* Subject */}
        <div>
          <label 
            htmlFor="subject" 
            className="block text-gray-800 font-semibold mb-1"
          >
            Subject (required)
          </label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 
                       focus:outline-none focus:ring-2 focus:ring-gray-900"
            required
          />
        </div>

        {/* Message */}
        <div>
          <label 
            htmlFor="message" 
            className="block text-gray-800 font-semibold mb-1"
          >
            Message (required)
          </label>
          <textarea
            id="message"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-4 py-2 
                       focus:outline-none focus:ring-2 focus:ring-gray-900"
            required
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-gray-900 text-white px-6 py-3 rounded-md font-semibold 
                     hover:bg-gray-700 transition-colors duration-300"
        >
          Send
        </button>
      </form>
    </section>
  );
}
