import { useNavigate } from "react-router";
import { Mail, CheckCircle } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

export function StudentEnrollSuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Enrollment Submitted" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[460px]">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-10 text-center">
              <div className="w-16 h-16 rounded-full bg-[rgba(212,165,116,0.15)] flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-[#d4a574]" />
              </div>

              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", lineHeight: 1.3 }}>
                Enrollment Submitted!
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 8, lineHeight: 1.6 }}>
                Your enrollment has been received and is pending admin approval. Check your email or SMS for a password setup link.
              </p>

              <div className="bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.25)] rounded-lg px-4 py-4 mt-6 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={16} className="text-[#d4a574]" />
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                    What happens next?
                  </p>
                </div>
                <ol className="flex flex-col gap-2 ml-6" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5, listStyleType: "decimal" }}>
                  <li>You'll receive an email/SMS with a link to set your password</li>
                  <li>The admin will review your enrollment request</li>
                  <li>Once approved, you can log in and access your courses</li>
                </ol>
              </div>

              <button
                onClick={() => navigate("/student/password-setup")}
                className="w-full mt-6 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
              >
                Set Up Password
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
