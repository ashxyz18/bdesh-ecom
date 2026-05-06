"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-neutral-400" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      // Role-based redirect: ADMIN → /admin, others → /dashboard
      if (redirectUrl && redirectUrl !== "/") {
        router.push(redirectUrl);
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError("Please enter your email");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send reset email");
      }

      setForgotSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="font-display text-xl font-bold text-neutral-900">BdeshShop</span>
          </Link>

          {!showForgot ? (
            <>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Sign in</h1>
              <p className="text-sm text-neutral-500 mb-8">
                Welcome back. Enter your credentials to access your account.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-neutral-500">
                Don't have an account?{" "}
                <Link href="/register" className="text-neutral-900 font-semibold hover:underline">
                  Create account
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password</h1>
              <p className="text-sm text-neutral-500 mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              {forgotSent ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Check your email</h3>
                  <p className="text-sm text-neutral-500 mb-6">
                    If an account with <span className="font-medium text-neutral-700">{forgotEmail}</span> exists, you'll receive a password reset link.
                  </p>
                  <button
                    onClick={() => { setShowForgot(false); setForgotSent(false); }}
                    className="text-sm text-neutral-900 font-semibold hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email" className="text-sm font-medium text-neutral-700">Email</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-neutral-900 transition-colors"
                    />
                  </div>

                  <Button type="submit" className="w-full py-3 bg-neutral-900 text-white rounded-lg font-semibold text-sm hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors" disabled={forgotLoading}>
                    {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowForgot(false)}
                    className="w-full py-3 text-neutral-600 text-sm font-medium hover:text-neutral-900 transition-colors"
                  >
                    Back to Sign In
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-neutral-900 font-bold text-3xl">B</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Launch Your Store in 60 Seconds
          </h2>
          <p className="text-neutral-400">
            BdeshShop gives you a complete, beautiful, modern e-commerce website.
            Pick a template, name your store, and start selling.
          </p>
        </div>
      </div>
    </div>
  );
}