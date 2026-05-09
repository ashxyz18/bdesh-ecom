"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import "../auth.css";

function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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
        setError(data.message || "Authentication failed");
        return;
      }

      if (data.user?.role === "ADMIN") {
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

  const handleGoogleLogin = () => {
    const callbackUrl = `${window.location.origin}/api/auth/callback/google`;
    const googleAuthUrl = `/api/auth/google?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    window.location.href = googleAuthUrl;
  };

  const handleFacebookLogin = () => {
    const callbackUrl = `${window.location.origin}/api/auth/callback/facebook`;
    const facebookAuthUrl = `/api/auth/facebook?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    window.location.href = facebookAuthUrl;
  };

  return (
    <div className="auth-page-container">
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>

      <div className="auth-container">
        {/* Left Panel - Brand */}
        <div className="left-panel">
          <div className="left-content">
            <div className="top-bar">
              <div className="logo">
                <div className="logo-icon">B</div>
                <span>BdeshShop</span>
              </div>
            </div>

            <div className="hero-section">
              <h2 className="hero-text">
                Launch Your<br />
                Online Store<br />
                Today.
              </h2>
              <p className="hero-description">
                Build your ecommerce empire with our powerful store builder and AI-driven tools. From idea to launch in minutes.
              </p>
            </div>
          </div>

          <div className="slider-dots">
            <div className="slider-dot active"></div>
            <div className="slider-dot"></div>
            <div className="slider-dot"></div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="right-panel">
          <div className="form-card">
            <div className="form-header">
              <h1 className="form-title">Welcome back</h1>
              <p className="form-subtitle">
                Don't have an account?{" "}
                <Link href="/register" className="form-link">Sign up</Link>
              </p>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label">Email address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-wrapper" onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`checkbox ${rememberMe ? 'checked' : ''}`}>
                    {rememberMe && <Check size={14} color="white" />}
                  </div>
                  <span className="checkbox-label">Remember me</span>
                </label>
                <Link href="/forgot-password" className="forgot-link">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">OR</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-button" onClick={handleGoogleLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button type="button" className="social-button" onClick={handleFacebookLogin}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.355c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
