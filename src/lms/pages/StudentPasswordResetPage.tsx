import { useState } from "react";
import { useNavigate } from "react-router";
import { Phone, Lock, Eye, EyeOff, ArrowLeft, Check, Mail } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

type Step = "request" | "sent" | "new-password" | "success";

export function StudentPasswordResetPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter your phone number.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("sent");
    }, 1200);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8 || password !== confirm) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Password Reset" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          <button
            onClick={() => (step === "request" ? navigate("/student/login") : setStep("request"))}
            className="flex items-center gap-1.5 text-[#6c6c6c] hover:text-[#0a1628] mb-6 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={15} /> Back to login
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-8">
              {step === "request" && (
                <>
                  <div className="text-center mb-6">
                    <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>Reset Password</h1>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6 }}>
                      Enter your phone number and we'll send you a reset link
                    </p>
                  </div>

                  <form onSubmit={handleRequest} className="flex flex-col gap-4">
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>Phone Number</label>
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
                      {error && <p className="mt-1 text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>{error}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                    >
                      {loading ? "Sending…" : "Send Reset Link"}
                    </button>
                  </form>
                </>
              )}

              {step === "sent" && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[rgba(212,165,116,0.15)] flex items-center justify-center mx-auto mb-5">
                    <Mail size={24} className="text-[#d4a574]" />
                  </div>
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>Check Your SMS</h2>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6, lineHeight: 1.6 }}>
                    We've sent a password reset link to <strong>{phone}</strong>. Click the link in the SMS to proceed.
                  </p>
                  <button
                    onClick={() => setStep("new-password")}
                    className="w-full mt-6 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                  >
                    I've Received the Link
                  </button>
                </div>
              )}

              {step === "new-password" && (
                <>
                  <div className="text-center mb-6">
                    <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>New Password</h1>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6 }}>
                      Enter your new password below
                    </p>
                  </div>

                  <form onSubmit={handleReset} className="flex flex-col gap-4">
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>New Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="New password"
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
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>Confirm Password</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || password.length < 8 || password !== confirm}
                      className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                    >
                      {loading ? "Resetting…" : "Reset Password"}
                    </button>
                  </form>
                </>
              )}

              {step === "success" && (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[rgba(212,165,116,0.15)] flex items-center justify-center mx-auto mb-5">
                    <Check size={24} className="text-[#d4a574]" />
                  </div>
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>Password Updated!</h2>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6, lineHeight: 1.6 }}>
                    Your password has been updated successfully. You can now log in with your new password.
                  </p>
                  <button
                    onClick={() => navigate("/student/login")}
                    className="w-full mt-6 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                  >
                    Go to Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
