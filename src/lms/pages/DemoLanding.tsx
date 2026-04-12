import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Info,
} from "lucide-react";

export function DemoLanding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <header className="bg-[#0a1628] px-6 py-4 flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 27 27" fill="none">
          <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
          <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: "20px", color: "#FAF8F5" }}>
          SOMDA INSTITUTE OF PROFESSIONAL STUDIES
        </span>
      </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="text-center max-w-lg mb-10">
          <h1 style={{ fontWeight: 700, fontSize: "32px", color: "#0a1628", lineHeight: 1.2 }}>
            LMS Platform Demo
          </h1>
          <p className="mt-3 text-[#6c6c6c]" style={{ fontSize: "15px", lineHeight: 1.6 }}>
            Choose a role to explore the platform.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl">
          {/* Instructor */}
          <button
            onClick={() => navigate("/instructor/dashboard")}
            className="bg-white rounded-2xl border border-gray-200 p-8 text-left hover:shadow-lg hover:border-[#d4a574] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0a1628] flex items-center justify-center mb-5">
              <LayoutDashboard size={22} className="text-[#d4a574]" />
            </div>
            <h2 className="font-semibold text-[#0a1628] text-lg mb-1">Instructor Dashboard</h2>
            <p className="text-[#6c6c6c] text-sm mb-4" style={{ lineHeight: 1.5 }}>
              Manage courses, assignments, attendance, and grades.
            </p>
            <div className="flex items-center gap-1 text-[#d4a574] group-hover:gap-2 transition-all text-sm font-semibold">
              Enter as Instructor <ArrowRight size={15} />
            </div>
          </button>

          {/* Student */}
          <button
            onClick={() => navigate("/student/dashboard")}
            className="bg-white rounded-2xl border border-gray-200 p-8 text-left hover:shadow-lg hover:border-[#d4a574] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#d4a574] flex items-center justify-center mb-5">
              <GraduationCap size={22} className="text-white" />
            </div>
            <h2 className="font-semibold text-[#0a1628] text-lg mb-1">Student Dashboard</h2>
            <p className="text-[#6c6c6c] text-sm mb-4" style={{ lineHeight: 1.5 }}>
              View courses, submit assignments, and track your progress.
            </p>
            <div className="flex items-center gap-1 text-[#d4a574] group-hover:gap-2 transition-all text-sm font-semibold">
              Enter as Student <ArrowRight size={15} />
            </div>
          </button>

          {/* Admin */}
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-white rounded-2xl border border-gray-200 p-8 text-left hover:shadow-lg hover:border-[#d4a574] transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#0a1628] flex items-center justify-center mb-5">
              <ShieldCheck size={22} className="text-[#d4a574]" />
            </div>
            <h2 className="font-semibold text-[#0a1628] text-lg mb-1">Admin Dashboard</h2>
            <p className="text-[#6c6c6c] text-sm mb-4" style={{ lineHeight: 1.5 }}>
              Manage enrollments, programs, courses, and platform settings.
            </p>
            <div className="flex items-center gap-1 text-[#d4a574] group-hover:gap-2 transition-all text-sm font-semibold">
              Enter as Admin <ArrowRight size={15} />
            </div>
          </button>
        </div>

        {/* Demo Disclaimer */}
        <div className="mt-10 max-w-3xl w-full bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.25)] rounded-xl px-5 py-4 flex items-start gap-3">
          <Info size={18} className="text-[#d4a574] mt-0.5 shrink-0" />
          <p className="text-[#6c6c6c] text-xs leading-relaxed">
            <span className="font-semibold text-[#0a1628]">Demo Mode.</span>{" "}
            This is a front-end prototype for demonstration purposes only. Authentication,
            data persistence, and role-based access will be handled by the full-stack
            implementation. All screens use mock data.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-200 flex items-center justify-center">
        <p className="text-[#6c6c6c] text-xs">
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All rights reserved.
        </p>
      </footer>
    </div>
  );
}