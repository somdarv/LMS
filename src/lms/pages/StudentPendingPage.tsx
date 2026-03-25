import { useNavigate } from "react-router";
import { Clock, RefreshCw } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

export function StudentPendingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Pending Approval" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(212,165,116,0.15)] flex items-center justify-center mx-auto mb-5">
                <Clock size={32} className="text-[#d4a574]" />
              </div>

              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", lineHeight: 1.3 }}>
                Enrollment Pending Approval
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 8, lineHeight: 1.6, maxWidth: 360, marginInline: "auto" }}>
                Your password has been set successfully. Your enrollment is currently being reviewed by the admin. You'll be notified once it's approved.
              </p>

              <div className="bg-[#f8f8f9] rounded-lg p-4 mt-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-[rgba(212,165,116,0.15)] flex items-center justify-center flex-shrink-0">
                    <RefreshCw size={14} className="text-[#d4a574]" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>Status: Pending Review</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>Submitted today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-[#d4a574] rounded-full" style={{ width: "40%" }} />
                </div>
                <div className="flex justify-between mt-2">
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#d4a574", fontWeight: 600 }}>Submitted</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>Under Review</span>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b0" }}>Approved</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/student/login")}
                className="w-full mt-6 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
              >
                Go to Login
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full mt-3 py-2.5 rounded-lg border border-gray-200 text-[#0a1628] hover:bg-[#f5f5f5] transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 500 }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
