import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Upload,
  ClipboardList,
  Star,
  CalendarCheck,
  MessageCircle,
  BookOpen,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";

const responsibilities = [
  {
    icon: Upload,
    title: "Upload Course Content",
    desc: "Share lecture materials, videos, PDFs, and resources with students",
  },
  {
    icon: ClipboardList,
    title: "Create Assignments",
    desc: "Design and manage assignments with clear deadlines and grading criteria",
  },
  {
    icon: Star,
    title: "Grade Submissions",
    desc: "Review and grade student work with constructive feedback",
  },
  {
    icon: CalendarCheck,
    title: "Track Attendance",
    desc: "Mark and monitor student attendance for each class session",
  },
  {
    icon: BookOpen,
    title: "Manage Quizzes",
    desc: "Create and grade quizzes to assess student understanding",
  },
  {
    icon: MessageCircle,
    title: "Communicate with Students",
    desc: "Respond to questions, send announcements, and provide support",
  },
];

export function RoleAcceptancePage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    if (!accepted) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/instructor/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        {/* Sidebar */}
        <InstructorSidebar />

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Congratulations Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[rgba(212,165,116,0.15)] mb-4">
              <CheckCircle2 size={32} className="text-[#d4a574]" />
            </div>
            <h1
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "36px", color: "#0a1628", lineHeight: 1.2 }}
            >
              Welcome to your instructor dashboard!
            </h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", color: "#6c6c6c", marginTop: 8 }}>
              You've been assigned as an instructor. Please review your course details and responsibilities below.
            </p>
          </div>

          {/* Course Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628", marginBottom: 16 }}>
              Your Assigned Course
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, label: "Course Name", value: "Financial Accounting Level 1" },
                { icon: Star, label: "Program", value: "ICAG Professional Program" },
                { icon: Calendar, label: "Term / Session", value: "May 2025 Sitting" },
                { icon: CalendarCheck, label: "Duration", value: "Feb 1 – May 30, 2025" },
                { icon: Users, label: "Students Enrolled", value: "42 students" },
                { icon: ClipboardList, label: "Course Code", value: "ICAG-FA-L1" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <item.icon size={13} className="text-[#d4a574]" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", fontWeight: 500 }}>
                      {item.label}
                    </span>
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628", fontWeight: 600 }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628", marginBottom: 4 }}>
              Your Instructor Responsibilities
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginBottom: 18 }}>
              As an instructor, you are expected to:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {responsibilities.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(212,165,116,0.1)] flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-[#d4a574]" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5, marginTop: 2 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Tutorial */}
          <div className="bg-[#0a1628] rounded-xl p-6 mb-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-[rgba(212,165,116,0.2)] flex items-center justify-center flex-shrink-0">
              <PlayCircle size={32} className="text-[#d4a574]" />
            </div>
            <div className="flex-1">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#faf8f5" }}>
                Quick Start Guide — Instructor Tutorial
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "rgba(250,248,245,0.6)", marginTop: 3 }}>
                Watch a 3-minute walkthrough to get familiar with your instructor dashboard, uploading content, and managing your course.
              </p>
            </div>
            <button
              className="flex-shrink-0 px-4 py-2 rounded-lg border border-[rgba(212,165,116,0.4)] text-[#d4a574] hover:bg-[rgba(212,165,116,0.1)] transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
            >
              Watch Now
            </button>
          </div>

          {/* Accept & CTA */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="flex items-start gap-3 cursor-pointer mb-5">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-0.5 accent-[#d4a574] w-4 h-4 flex-shrink-0"
              />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628", lineHeight: 1.6 }}>
                I understand my responsibilities as an instructor and agree to fulfill them in accordance with the institution's standards and guidelines.
              </span>
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleGetStarted}
                disabled={!accepted || loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
              >
                {loading ? (
                  <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <ArrowRight size={16} />
                )}
                {loading ? "Setting up…" : "Get Started"}
              </button>
              <a
                href="#"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#d4a574", fontWeight: 500, display: "flex", alignItems: "center", padding: "0 4px" }}
                className="hover:underline"
              >
                View Full Instructor Guide →
              </a>
            </div>
            {!accepted && (
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 8 }}>
                Please check the checkbox above to confirm you understand your responsibilities.
              </p>
            )}
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2 mt-6">
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
