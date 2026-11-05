
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, ArrowRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
      const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        callbackURL: "/admin",
      });

      if (result.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }

      router.push("/admin");
router.refresh();
    } catch {
      setError("Unable to sign in. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-[#3B4A40] bg-[#101713] px-4 py-3.5 text-base text-[#F5F7F5] outline-none transition placeholder:text-[#718077] hover:border-[#526458] focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-[#D2DED5]"
        >
          Email address
        </label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          disabled={loading}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#D2DED5]"
          >
            Password
          </label>
          <span className="text-xs text-[#718077]">Keep it private</span>
        </div>

        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            disabled={loading}
            className={`${inputClass} pr-12`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            disabled={loading}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-[#A7B3AA] outline-none transition hover:text-[#34D399] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34D399] disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff size={18} aria-hidden="true" />
            ) : (
              <Eye size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          id="login-error"
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-[#FCA5A5]/30 bg-[#FCA5A5]/10 px-4 py-3 text-sm leading-5 text-[#FCA5A5]"
        >
          {error}
        </div>
      )}


<button
  type="submit"
  disabled={loading || !email.trim() || !password}
  className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#34D399] px-4 py-3.5 text-sm font-semibold text-[#062C20] outline-none transition hover:bg-[#6EE7B7] focus-visible:ring-2 focus-visible:ring-[#6EE7B7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#17221B] disabled:cursor-not-allowed disabled:opacity-50"
>
  {loading ? (
    <>
      <LoaderCircle
        size={18}
        className="animate-spin"
        aria-hidden="true"
      />
      Signing in...
    </>
  ) : (
    <>
      Sign in to dashboard
      <ArrowRight
        size={17}
        className="transition-transform group-hover:translate-x-1"
        aria-hidden="true"
      />
    </>
  )}
</button>


      <p className="text-center text-xs leading-5 text-[#718077]">
        Forgot your password? Password recovery will be available once we
        configure the recovery workflow.
      </p>
    </form>
  );
}
