import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, Phone, User, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (password.length === 0) return { level: 0, label: "", color: "" };
    if (password.length < 6) return { level: 1, label: "Weak", color: "bg-red-400" };
    if (password.length < 8) return { level: 2, label: "Fair", color: "bg-orange-400" };
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const extras = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    if (extras >= 2) return { level: 4, label: "Strong", color: "bg-green-500" };
    if (extras >= 1) return { level: 3, label: "Good", color: "bg-yellow-400" };
    return { level: 2, label: "Fair", color: "bg-orange-400" };
  };

  const { level, label, color } = getStrength();
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${i <= level ? color : "bg-gray-200"}`}
          />
        ))}
      </div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: level >= 3 ? "#16a34a" : level === 2 ? "#ea580c" : "#dc2626" }}>
        Password strength: {label}
      </p>
    </div>
  );
}

export function AccountSetupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "richard.mensah@example.com",
    phone: "+233 24 123 4567",
    name: "Prof. Richard Mensah",
    tempPassword: "",
    password: "",
    confirmPassword: "",
  });
  const [showTemp, setShowTemp]         = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [agreed, setAgreed]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.tempPassword.trim()) newErrors.tempPassword = "Enter the temporary password sent to your email.";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required.";
    if (!form.name.trim()) newErrors.name = "Name is required.";
    if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (!agreed) newErrors.agreed = "You must accept the terms to continue.";
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/instructor/welcome");
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Instructor Invitation" }, { label: "Account Setup" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-[520px]">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[#6c6c6c] hover:text-[#0a1628] mb-6 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={15} /> Back to overview
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-8">
              {/* Institution */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 bg-[#0a1628] rounded-xl flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 27 27" fill="none">
                    <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", textAlign: "center", letterSpacing: "0.5px" }}>
                  SOMDA INSTITUTE OF PROFESSIONAL STUDIES
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>Accra, Ghana</p>
              </div>

              {/* Welcome */}
              <div className="mb-6 text-center">
                <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", lineHeight: 1.3 }}>
                  Welcome to SOMDA!
                </h1>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6, lineHeight: 1.5 }}>
                  Let's set up your instructor account to get started
                </p>
              </div>

              {/* Invite info — no sitting/term period */}
              <div className="bg-[rgba(212,165,116,0.1)] border border-[rgba(212,165,116,0.3)] rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-[#d4a574] mt-1.5 flex-shrink-0" />
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>You're invited to teach</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                    <strong>Financial Accounting Level 1</strong> • 42 students enrolled
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Pre-filled section */}
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Pre-filled from Invitation
                  </p>
                  <div className="flex flex-col gap-3">
                    {/* Email - read only */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 5 }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="email"
                          value={form.email}
                          readOnly
                          className="w-full pl-9 pr-9 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-[#6c6c6c] cursor-not-allowed"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                        <CheckCircle2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                      </div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 3 }}>Email is locked and verified from your invitation</p>
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 5 }}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => update("phone", e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                      {errors.phone && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#dc2626", marginTop: 3 }}>{errors.phone}</p>}
                    </div>

                    {/* Name */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 5 }}>
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update("name", e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                      {errors.name && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#dc2626", marginTop: 3 }}>{errors.name}</p>}
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1" />

                {/* Password section */}
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                    Set Your New Password
                  </p>

                  {/* Temp password notice */}
                  <div className="flex items-start gap-2 bg-[#f8f8f9] border border-gray-200 rounded-lg px-3 py-2.5 mb-4">
                    <ShieldCheck size={14} className="text-[#6c6c6c] flex-shrink-0 mt-0.5" />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>
                      A <strong style={{ color: "#0a1628" }}>temporary password</strong> was sent to{" "}
                      <strong style={{ color: "#0a1628" }}>richard.mensah@example.com</strong>. Enter it below, then create your own password.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Temporary password */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 5 }}>
                        Temporary Password
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type={showTemp ? "text" : "password"}
                          placeholder="Enter the password from your email"
                          value={form.tempPassword}
                          onChange={(e) => update("tempPassword", e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                        <button type="button" onClick={() => setShowTemp(!showTemp)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] hover:text-[#0a1628]">
                          {showTemp ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.tempPassword && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#dc2626", marginTop: 3 }}>{errors.tempPassword}</p>}
                    </div>

                    {/* New password */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 5 }}>
                        New Password
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 8 characters"
                          value={form.password}
                          onChange={(e) => update("password", e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] hover:text-[#0a1628]">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <PasswordStrength password={form.password} />
                      {errors.password && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#dc2626", marginTop: 3 }}>{errors.password}</p>}
                    </div>

                    {/* Confirm new password */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 5 }}>
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type={showConfirm ? "text" : "password"}
                          placeholder="Re-enter your new password"
                          value={form.confirmPassword}
                          onChange={(e) => update("confirmPassword", e.target.value)}
                          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] hover:text-[#0a1628]">
                          {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#dc2626", marginTop: 3 }}>{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }}
                      className="mt-1 accent-[#d4a574]"
                    />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5 }}>
                      I agree to the{" "}
                      <a href="#" className="text-[#d4a574] hover:underline">Terms of Service</a>{" "}and{" "}
                      <a href="#" className="text-[#d4a574] hover:underline">Privacy Policy</a>
                    </span>
                  </label>
                  {errors.agreed && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#dc2626", marginTop: 3 }}>{errors.agreed}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60 mt-1"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                >
                  {loading ? (
                    <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {loading ? "Creating account…" : "Create Account & Continue"}
                </button>
              </form>
            </div>

            <div className="bg-[#f8f8f9] border-t border-gray-100 px-8 py-4 text-center">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                Already have an account?{" "}
                <button onClick={() => navigate("/invite/instructor")} style={{ color: "#d4a574", fontWeight: 500 }} className="hover:underline">
                  Log in instead
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

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