"use client";

import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await loginAction(new FormData(e.currentTarget));
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // On success, redirect() in the server action takes over — no client handling needed.
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-[11px] text-txt-3 uppercase tracking-widest"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={loading}
          placeholder="you@company.com"
          className="bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-txt-4 focus:border-accent focus:outline-none disabled:opacity-50 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="password"
          className="text-[11px] text-txt-3 uppercase tracking-widest"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={loading}
          placeholder="••••••••"
          className="bg-transparent border border-line rounded-md px-3 py-2.5 text-sm text-foreground placeholder:text-txt-4 focus:border-accent focus:outline-none disabled:opacity-50 transition-colors"
        />
      </div>

      {error && <p className="text-sm text-alert">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 w-full bg-accent text-black text-sm font-semibold rounded-md py-2.5 hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
