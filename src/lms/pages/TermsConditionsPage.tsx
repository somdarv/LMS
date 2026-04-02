import { Mail, FileText } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

const S = { fontFamily: "Inter, sans-serif" };

export function TermsConditionsPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Terms & Conditions" }]} />

      <div className="flex-1 px-6 py-10 max-w-[900px] mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,165,116,0.15)] flex items-center justify-center">
              <FileText className="text-[#d4a574]" size={22} />
            </div>
            <div>
              <h1 style={{ ...S, fontSize: "24px", fontWeight: 800, color: "#0a1628" }}>Terms & Conditions</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                This demo page outlines general terms for using the LMS.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.8 }}>
              By using this LMS, you agree to use the platform responsibly, follow course instructions, and respect
              intellectual property and academic integrity.
            </p>
            <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.8 }}>
              Instructors may publish assignments, group activities, and course materials. Submissions may be shared with
              authorized staff for grading and feedback.
            </p>
            <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.8 }}>
              For questions about these terms, contact{" "}
              <a href="mailto:support@somda.edu.gh" className="text-[#d4a574] hover:underline font-medium">
                support@somda.edu.gh
              </a>
              .
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-[#ededf0] bg-[#fafafb] p-5 flex items-start gap-3">
            <Mail size={18} className="text-[#d4a574] mt-0.5" />
            <div>
              <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>Support</p>
              <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4, lineHeight: 1.6 }}>
                We can help with access, account issues, and policy questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

