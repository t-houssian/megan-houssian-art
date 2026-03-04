"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cormorant, lora } from '../fonts';

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  // Move useRouter here at the top-level of your component.
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = { firstName, lastName, email, subject, message };

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        throw new Error('Failed to send email');
      }
      console.log('Email sent successfully');
      router.push('/success');
    } catch (error) {
      console.error('Error sending email:', error);
      alert("There was an error sending your message. Please try again later.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-paper to-accent-cream">
      <div className="max-w-4xl mx-auto py-16 px-6">
        {/* Elegant Header */}
        <div className="text-center mb-12">
          <h1 className={`${cormorant.className} text-4xl md:text-5xl font-light text-brown mb-4 tracking-wide`}>
            Contact the Artist
          </h1>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-olive to-transparent mx-auto mb-6"></div>
          <p className={`${lora.className} text-lg text-warm-gray max-w-2xl mx-auto leading-relaxed`}>
            Fill out the form below or email me directly at{" "}
            <a 
              href="mailto:meganhoussianart@gmail.com" 
              className="underline text-olive hover:text-brown transition-colors duration-200 font-medium"
            >
              meganhoussianart@gmail.com
            </a>
          </p>
          <p className={`${lora.className} text-sm text-warm-gray mt-3`}>
            Want first access to new originals and studio updates?{" "}
            <Link href="/#collector-early-access" className="underline text-olive hover:text-brown transition-colors duration-200 font-medium">
              Join my Collector List.
            </Link>
          </p>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/80 backdrop-blur-sm border border-tan/30 rounded-2xl p-8 shadow-vintage-lg">
          <h2 className={`${cormorant.className} text-2xl font-medium mb-6 text-brown flex items-center`}>
            Your Message
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* First Name */}
            <div>
              <label 
                htmlFor="firstName" 
                className={`block text-brown font-medium mb-2 ${lora.className}`}
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label 
                htmlFor="lastName" 
                className={`block text-brown font-medium mb-2 ${lora.className}`}
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label 
              htmlFor="email" 
              className={`block text-brown font-medium mb-2 ${lora.className}`}
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
              required
            />
          </div>

          {/* Subject */}
          <div className="mb-6">
            <label 
              htmlFor="subject" 
              className={`block text-brown font-medium mb-2 ${lora.className}`}
            >
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label 
              htmlFor="message" 
              className={`block text-brown font-medium mb-2 ${lora.className}`}
            >
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border border-tan/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive bg-white/90 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="text-center">
          <button
            type="submit"
            className={`bg-gradient-to-r from-btn-brown to-btn-brown-hover text-paper px-8 py-4 rounded-lg hover:from-btn-brown-hover hover:to-brown transition-all duration-500 font-serif text-lg shadow-vintage hover:shadow-vintage-lg transform hover:-translate-y-1 border border-opacity-20 border-paper relative overflow-hidden group ${lora.className}`}
          >
            <span className="relative z-10">Send Message</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-paper to-transparent opacity-0 group-hover:opacity-10 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
