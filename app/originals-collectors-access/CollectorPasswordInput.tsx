"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { lora } from "../fonts";

export default function CollectorPasswordInput() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor="collector-password" className={`${lora.className} mb-2 block text-brown font-medium`}>
        Password
      </label>
      <div className="relative">
        <input
          id="collector-password"
          name="password"
          type={showPassword ? "text" : "password"}
          required
          className="w-full rounded-xl border border-tan/50 bg-white py-3 pl-4 pr-12 text-brown focus:outline-none focus:ring-2 focus:ring-olive/20 focus:border-olive transition-all duration-200"
          placeholder="Enter password"
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-olive transition-colors hover:bg-accent-cream hover:text-brown focus:outline-none focus:ring-2 focus:ring-olive/20"
          aria-controls="collector-password"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
        >
          {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
