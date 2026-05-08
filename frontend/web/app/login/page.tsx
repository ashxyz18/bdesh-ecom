"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import "../auth.css";

function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email, password }
        : { email, password, firstName, lastName };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Authentication failed");
        return;
      }

      if (isLogin) {
        if (data.user?.role === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
      } else {
        setIsLogin(true);
        setError("");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="ambient-glow ambient-glow-1"></div>
      <div className="ambient-glow ambient-glow-2"></div>

      <div className="auth-container">
        <div className="left-panel">
          <div className="left-content">
            <div className="top-bar">
              <div className="logo">
                <div className="logo-icon">B</div>
                <span>BdeshShop</span>
              </div>
              <Link href="/" className="back-button">
                Back to website →
              </Link>
            </div>

            <div className="hero-section">
              <h2 className="hero-text">
                LAUNCH YOUR ONLINE<br />
                STORE TODAY AND<br />
                TURN YOUR IDEAS<br />
                INTO A POWERFUL<br />
                DIGITAL BUSINESS.
              </h2>
            </div>
          </div>

          <div className="slider-dots">
            <div className="slider-dot active"></div>
            <div className="slider-dot"></div>
            <div className="slider-dot"></div>
          </div>
        </div>

        <div className="right-panel">
          <div className="glass-card">
            <h1 className="form-title">
              {isLogin ? 'Welcome back' : 'Create an account'}
            </h1>
            <p className="form-subtitle">
              {isLogin ? (
                <>Don't have an account? <button onClick={() => { setIsLogin(false); setError(''); }} className="toggle-button">Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setIsLogin(true); setError(''); }} className="toggle-button">Sign in</button></>
              )}
            </p>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-row">
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
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
                <div className="input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="input-field"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isLogin ? "current-password" : "new-password"}
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

              {!isLogin && (
                <label className="checkbox-wrapper" onClick={() => setAgreed(!agreed)}>
                  <div className={`checkbox ${agreed ? 'checked' : ''}`}>
                    {agreed && <Check size={14} color="white" />}
                  </div>
                  <span className="checkbox-label">
                    I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                  </span>
                </label>
              )}

              <button
                type="submit"
                className="submit-button"
                disabled={loading || (!isLogin && !agreed)}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign in' : 'Create account')}
              </button>
            </form>

            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">Or register with</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
              <button type="button" className="social-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="social-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#93c5fd">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 16.25 3.51 9.17 9.05 9.12c1.04.01 1.81.45 2.45.47.91-.18 1.8-.66 2.8-.57 1.12.1 1.97.52 2.56 1.32-2.32 1.42-1.74 4.54.39 5.37-.46 1.13-.66 1.66-1.2 2.66-.97 1.67-.24 3.73 1.05 4.91zM12.03 9.06c-.26-2.23 1.5-4.14 3.72-4.37.34 2.47-2.06 4.56-3.72 4.37z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
