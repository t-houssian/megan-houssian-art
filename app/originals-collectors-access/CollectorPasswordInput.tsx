"use client";

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { lora } from "../fonts";

type CollectorPasswordInputProps = {
  disabled?: boolean;
  placeholder?: string;
};

export default function CollectorPasswordInput({
  disabled = false,
  placeholder = "Enter password",
}: CollectorPasswordInputProps) {
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
          disabled={disabled}
          className="w-full rounded-xl border border-tan/50 bg-white py-3 pl-4 pr-12 text-brown transition-all duration-200 placeholder:text-warm-gray/60 focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/20 disabled:cursor-not-allowed disabled:bg-ivory disabled:text-warm-gray"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          disabled={disabled}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-olive transition-colors hover:bg-accent-cream hover:text-brown focus:outline-none focus:ring-2 focus:ring-olive/20 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent disabled:hover:text-olive"
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
