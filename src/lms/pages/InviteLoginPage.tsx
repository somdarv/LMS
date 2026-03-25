import { useState } from "react";
import { useNavigate } from "react-router";
import { Phone, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

export function InviteLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate token validation + role assignment
    setTimeout(() => {
      setLoading(false);
      navigate("/instructor/welcome");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Instructor Invitation" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          {/* Back button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[#6c6c6c] hover:text-[#0a1628] mb-6 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={15} /> Back to overview
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-8">
              {/* Logo + Institution */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-14 h-14 bg-[#0a1628] rounded-xl flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 27 27" fill="none">
                    <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", textAlign: "center", letterSpacing: "0.5px" }}
                >
                  SOMDA INSTITUTE OF PROFESSIONAL STUDIES
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>Accra, Ghana</p>
              </div>

              {/* Welcome message */}
              <div className="mb-6 text-center">
                <h1
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", lineHeight: 1.3 }}
                >
                  Welcome back!
                </h1>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6, lineHeight: 1.5 }}>
                  Please log in to accept your instructor role
                </p>
              </div>

              {/* Invitation badge */}
              <div className="bg-[rgba(212,165,116,0.1)] border border-[rgba(212,165,116,0.3)] rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#d4a574] mt-1.5 flex-shrink-0" />
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                    Instructor Invitation
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                    You've been invited to teach <strong>Financial Accounting Level 1</strong> — May 2025 Sitting
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                {/* Phone */}
                <div>
                  <label
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                    <input
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] hover:text-[#0a1628]"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="text-right -mt-1">
                  <a
                    href="#"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#d4a574", fontWeight: 500 }}
                    className="hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {loading ? "Logging in…" : "Login"}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-[#f8f8f9] border-t border-gray-100 px-8 py-4 text-center">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                Don't have an account?{" "}
                <span style={{ color: "#d4a574", fontWeight: 500 }}>
                  The link may have expired.
                </span>
              </p>
              <p className="mt-1">
                <button
                  onClick={() => navigate("/invite/instructor/setup")}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628", fontWeight: 500 }}
                  className="hover:underline"
                >
                  New instructor? Set up your account →
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page Footer */}
      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3 text-sm" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
