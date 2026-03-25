import { useLocation, useNavigate } from "react-router";
import { Clock, ShieldAlert, Home, Mail, RefreshCw } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

export function ErrorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isExpired = location.pathname === "/invite/expired";

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: isExpired ? "Invitation Expired" : "Invalid Link" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-[480px] text-center">

          {/* Icon */}
          <div className="flex items-center justify-center mb-6">
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center ${
                isExpired ? "bg-orange-50 text-orange-400" : "bg-red-50 text-red-400"
              }`}
            >
              {isExpired ? <Clock size={40} /> : <ShieldAlert size={40} />}
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className={`h-1 w-full ${isExpired ? "bg-gradient-to-r from-orange-400 to-amber-400" : "bg-gradient-to-r from-red-400 to-rose-400"}`} />
            <div className="px-8 py-8">
              {/* Institution */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-8 h-8 bg-[#0a1628] rounded-lg flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 27 27" fill="none">
                    <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>SOMDA INSTITUTE</span>
              </div>

              {/* Title */}
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: "22px",
                  color: "#0a1628",
                  lineHeight: 1.3,
                  marginBottom: 12,
                }}
              >
                {isExpired ? "This invitation link has expired" : "This invitation link is invalid"}
              </h1>

              {/* Description */}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6c6c6c", lineHeight: 1.6, marginBottom: 24 }}>
                {isExpired
                  ? "The instructor invitation you clicked is no longer valid. Invitation links expire after 7 days for security reasons."
                  : "We couldn't verify this invitation link. It may have been copied incorrectly or the link may no longer exist."}
              </p>

              {/* Info box */}
              <div
                className={`rounded-xl p-4 mb-6 text-left ${
                  isExpired ? "bg-orange-50 border border-orange-100" : "bg-red-50 border border-red-100"
                }`}
              >
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: isExpired ? "#9a3412" : "#991b1b",
                    marginBottom: 6,
                  }}
                >
                  {isExpired ? "What can you do?" : "Need help?"}
                </p>
                <ul
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.8 }}
                  className="list-disc list-inside space-y-1"
                >
                  {isExpired ? (
                    <>
                      <li>Contact your administrator to request a new invitation</li>
                      <li>Reach out to: <span className="text-[#d4a574] font-medium">admin@somda.edu.gh</span></li>
                      <li>Phone: <span className="text-[#d4a574] font-medium">+233 30 123 4567</span></li>
                    </>
                  ) : (
                    <>
                      <li>Check your email for the correct invitation link</li>
                      <li>Make sure you copied the entire link from your email</li>
                      <li>Contact support at: <span className="text-[#d4a574] font-medium">support@somda.edu.gh</span></li>
                    </>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {isExpired && (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#d4a574] text-[#d4a574] hover:bg-[rgba(212,165,116,0.1)] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                  >
                    <Mail size={16} />
                    Contact Administrator
                  </button>
                )}
                {!isExpired && (
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#d4a574] text-[#d4a574] hover:bg-[rgba(212,165,116,0.1)] transition-colors"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                  >
                    <RefreshCw size={16} />
                    Try Again
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                >
                  <Home size={16} />
                  Back to Home
                </button>
              </div>
            </div>
          </div>

          {/* Additional context */}
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 16 }}>
            Having trouble?{" "}
            <a href="mailto:support@somda.edu.gh" className="text-[#d4a574] hover:underline font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
