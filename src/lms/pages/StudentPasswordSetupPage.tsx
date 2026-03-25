import { useState } from "react";
import { useNavigate } from "react-router";
import { Lock, Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

export function StudentPasswordSetupPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Passwords match", met: password.length > 0 && password === confirm },
  ];
  const allMet = requirements.every((r) => r.met);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allMet) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/student/pending");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Create Password" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-[#6c6c6c] hover:text-[#0a1628] mb-6 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-8">
              <div className="flex flex-col items-center mb-7">
                <div className="w-14 h-14 bg-[#0a1628] rounded-xl flex items-center justify-center mb-3">
                  <Lock size={24} className="text-[#faf8f5]" />
                </div>
                <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>
                  Create Your Password
                </h1>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                  Set a secure password for your student account
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] hover:text-[#0a1628]">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div className="flex flex-col gap-1.5">
                  {requirements.map((req) => (
                    <div key={req.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? "bg-[#d4a574]" : "border border-gray-300"}`}>
                        {req.met && <Check size={10} className="text-white" />}
                      </div>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: req.met ? "#0a1628" : "#6c6c6c" }}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading || !allMet}
                  className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {loading ? "Setting up…" : "Create Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
