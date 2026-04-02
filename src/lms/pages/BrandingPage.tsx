import { useNavigate } from "react-router";
import { Settings, Palette, Type, Image, Upload, Check, ArrowLeft } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";

const accentColors = [
  { name: "Gold",    hex: "#d4a574" },
  { name: "Navy",    hex: "#0a1628" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Indigo",  hex: "#6366f1" },
  { name: "Rose",    hex: "#f43f5e" },
  { name: "Slate",   hex: "#475569" },
];

export function BrandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }, { label: "Branding" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 w-fit transition-colors hover:text-[#0a1628] text-[#6c6c6c]"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Header */}
          <div>
            <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>Branding</h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
              Customise how your profile and courses appear to students
            </p>
          </div>

          {/* Profile Image */}
          <div className="bg-white border border-gray-200 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Image size={16} className="text-[#d4a574]" />
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>Profile Photo</h2>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-[#0a1628] flex items-center justify-center flex-shrink-0">
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "24px", fontWeight: 700, color: "#d4a574" }}>MO</span>
              </div>
              <div>
                <button className="flex items-center gap-2 px-4 h-[40px] border border-black hover:bg-[#f5f5f5] transition-colors mb-2"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px", color: "#0a1628" }}>
                  <Upload size={14} strokeWidth={1.8} /> Upload Photo
                </button>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>
                  JPG or PNG, max 2 MB. Recommended size: 200×200 px.
                </p>
              </div>
            </div>
          </div>

          {/* Display Name & Bio */}
          <div className="bg-white border border-gray-200 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Type size={16} className="text-[#d4a574]" />
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>Display Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                  Display Name
                </label>
                <input
                  type="text"
                  defaultValue="Prof Mensah Oduro"
                  className="w-full px-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                  Title / Designation
                </label>
                <input
                  type="text"
                  defaultValue="Senior Lecturer, Financial Accounting"
                  className="w-full px-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                />
              </div>
            </div>
            <div>
              <label style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                Bio (shown on course pages)
              </label>
              <textarea
                rows={4}
                defaultValue="Prof Mensah Oduro is a senior lecturer at SOMDA Institute of Professional Studies with over 12 years of experience teaching financial accounting and management accounting at the ICAG professional level."
                className="w-full px-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574] transition-all resize-none"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.6 }}
              />
            </div>
          </div>

          {/* Accent Colour */}
          <div className="bg-white border border-gray-200 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-[#d4a574]" />
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>Accent Colour</h2>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
              Choose the highlight colour used across your instructor profile and course cards.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {accentColors.map((c) => (
                <button
                  key={c.hex}
                  title={c.name}
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: c.hex,
                    borderColor: c.hex === "#d4a574" ? "#0a1628" : "transparent",
                  }}
                >
                  {c.hex === "#d4a574" && <Check size={14} className="text-white" strokeWidth={3} />}
                </button>
              ))}
            </div>
          </div>

          {/* Institution Banner */}
          <div className="bg-white border border-gray-200 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Settings size={16} className="text-[#d4a574]" />
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>Institution Banner</h2>
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
              Upload a banner image displayed at the top of your public instructor profile.
            </p>
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 h-[120px] hover:border-[#d4a574] transition-colors cursor-pointer"
            >
              <Upload size={24} className="text-gray-300 mb-2" />
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c" }}>Click to upload or drag and drop</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 3 }}>PNG, JPG — recommended 1200×300 px</p>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button
              className="flex items-center gap-2 px-6 h-[47px] border border-black bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px" }}
            >
              <Check size={16} strokeWidth={2} /> Save Changes
            </button>
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex items-center justify-between mt-4">
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
