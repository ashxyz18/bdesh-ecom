"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f172a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float 8s ease-in-out infinite",
        pointerEvents: "none",
        top: "-100px",
        right: "-100px",
        zIndex: 1
      }}></div>
      <div style={{
        position: "absolute",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
        filter: "blur(60px)",
        animation: "float 8s ease-in-out infinite",
        pointerEvents: "none",
        bottom: "-100px",
        left: "-100px",
        zIndex: 1
      }}></div>

      <div style={{
        width: "100%",
        maxWidth: "1200px",
        height: "700px",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(17, 24, 39, 0.95))",
        borderRadius: "24px",
        overflow: "hidden",
        display: "flex",
        boxShadow: "0 25px 60px rgba(0,0,0,0.45), 0 0 100px rgba(37, 99, 235, 0.1)",
        position: "relative",
        border: "1px solid rgba(59, 130, 246, 0.1)"
      }}>
        <div style={{
          flex: 1,
          position: "relative",
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px",
          minHeight: "700px"
        }}>
          <div style={{
            position: "absolute",
            top: "-50%",
            left: "-50%",
            right: "-50%",
            bottom: "-50%",
            background: "radial-gradient(circle at 30% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 40%)",
            animation: "float 10s ease-in-out infinite",
            zIndex: 0
          }}></div>

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "auto" }}>
              <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "24px", fontWeight: 700, color: "#60a5fa", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #2563eb, #3b82f6)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "18px", color: "#e2e8f0", boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)" }}>B</div>
                <span>BdeshShop</span>
              </div>
              <Link href="/" style={{
                padding: "8px 20px",
                borderRadius: "50px",
                background: "rgba(37, 99, 235, 0.1)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                color: "#60a5fa",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 0.3s ease",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textDecoration: "none"
              }}>
                Back to website →
              </Link>
            </div>

            <div style={{ marginTop: "auto", marginBottom: "20px" }}>
              <h2 style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "48px",
                fontWeight: 700,
                color: "#93c5fd",
                lineHeight: 1.2,
                marginBottom: "16px",
                textShadow: "0 0 40px rgba(59, 130, 246, 0.5)"
              }}>
                LAUNCH YOUR ONLINE<br />
                STORE TODAY AND<br />
                TURN YOUR IDEAS<br />
                INTO A POWERFUL<br />
                DIGITAL BUSINESS.
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", justifyContent: "center", position: "relative", zIndex: 2 }}>
            <div style={{ width: "24px", height: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}></div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(96, 165, 250, 0.3)" }}></div>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "rgba(96, 165, 250, 0.3)" }}></div>
          </div>
        </div>

        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 50px",
          position: "relative",
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(20px)"
        }}>
          <div style={{ width: "100%", maxWidth: "420px" }}>
            <h1 style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "32px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #93c5fd, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "8px"
            }}>
              Create an account
            </h1>
            <p style={{ fontSize: "14px", color: "rgba(96, 165, 250, 0.7)", marginBottom: "32px" }}>
              Already have an account? <Link href="/login" style={{ color: "#60a5fa", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
            </p>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: "12px", color: "#fca5a5", fontSize: "13px", marginBottom: "16px" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    background: "rgba(30, 58, 138, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <input
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    background: "rgba(30, 58, 138, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    background: "rgba(30, 58, 138, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <input
                  type="tel"
                  placeholder="+880 1XXX-XXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    background: "rgba(30, 58, 138, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px", position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    paddingRight: "50px",
                    background: "rgba(30, 58, 138, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "rgba(96, 165, 250, 0.4)",
                    cursor: "pointer",
                    padding: "4px"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div style={{ marginBottom: "16px", position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  style={{
                    width: "100%",
                    height: "56px",
                    padding: "0 16px",
                    background: "rgba(30, 58, 138, 0.2)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                    borderRadius: "12px",
                    color: "#e2e8f0",
                    fontSize: "14px",
                    outline: "none"
                  }}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", cursor: "pointer" }} onClick={() => setAgreed(!agreed)}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "6px",
                  border: agreed ? "none" : "2px solid rgba(59, 130, 246, 0.3)",
                  background: agreed ? "linear-gradient(135deg, #2563eb, #3b82f6)" : "rgba(30, 58, 138, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                  boxShadow: agreed ? "0 2px 8px rgba(37, 99, 235, 0.4)" : "none"
                }}>
                  {agreed && <Check size={14} color="white" />}
                </div>
                <span style={{ fontSize: "13px", color: "rgba(96, 165, 250, 0.7)", lineHeight: "1.4" }}>
                  I agree to the <a href="/terms" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>Terms of Service</a> and <a href="/privacy" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>Privacy Policy</a>
                </span>
              </label>

              <button
                type="submit"
                disabled={loading || !agreed}
                style={{
                  width: "100%",
                  height: "58px",
                  background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                  border: "none",
                  borderRadius: "14px",
                  color: "#e2e8f0",
                  fontSize: "16px",
                  fontWeight: 600,
                  cursor: loading || !agreed ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  opacity: loading || !agreed ? 0.6 : 1
                }}
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Creating account...' : 'Create account & start selling'}
              </button>
            </form>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", margin: "24px 0" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(59, 130, 246, 0.2)" }}></div>
              <span style={{ fontSize: "13px", color: "rgba(96, 165, 250, 0.5)", whiteSpace: "nowrap" }}>Or register with</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(59, 130, 246, 0.2)" }}></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              <button type="button" style={{
                height: "50px",
                background: "rgba(37, 99, 235, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                color: "#93c5fd",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" style={{
                height: "50px",
                background: "rgba(37, 99, 235, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                borderRadius: "12px",
                color: "#93c5fd",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#93c5fd">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.52-3.23 0-1.44.62-2.2.44-3.06-.4C2.79 16.25 3.51 9.17 9.05 9.12c1.04.01 1.81.45 2.45.47.91-.18 1.8-.66 2.8-.57 1.12.1 1.97.52 2.56 1.32-2.32 1.42-1.74 4.54.39 5.37-.46 1.13-.66 1.66-1.2 2.66-.97 1.67-.24 3.73 1.05 4.91zM12.03 9.06c-.26-2.23 1.5-4.14 3.72-4.37.34 2.47-2.06 4.56-3.72 4.37z"/>
                </svg>
                Apple
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @media (max-width: 1024px) {
          div[class="auth-container"] {
            flex-direction: column !important;
            height: auto !important;
            max-width: 480px !important;
          }
        }
        @media (max-width: 640px) {
          div[class="auth-container"] {
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default RegisterForm;
