import { Mail, ShieldCheck } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";

const S = { fontFamily: "Inter, sans-serif" };

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Privacy Policy" }]} />

      <div className="flex-1 px-6 py-10 max-w-[900px] mx-auto w-full">
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[rgba(212,165,116,0.15)] flex items-center justify-center">
              <ShieldCheck className="text-[#d4a574]" size={22} />
            </div>
            <div>
              <h1 style={{ ...S, fontSize: "24px", fontWeight: 800, color: "#0a1628" }}>Privacy Policy</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                This demo page describes how your data is handled within the LMS.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.8 }}>
              We collect and process information needed to provide course access, assignments, grading, and communications.
              Your account details are used to display enrollment, groups, and submission history.
            </p>
            <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.8 }}>
              Data access is limited to authorized staff and systems required for the LMS to function.
            </p>
            <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.8 }}>
              For support or privacy questions, contact us at{" "}
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
                Reach out to our support team for data requests, account issues, or general privacy inquiries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

