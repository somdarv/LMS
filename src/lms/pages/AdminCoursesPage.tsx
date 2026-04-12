import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  ClipboardList,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { AdminSidebar } from "../components/AdminSidebar";
import { COURSES } from "../data/courses";
import { courseTitleWithTracks, formatCourseTracks } from "../lib/courseLabels";

export function AdminCoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredCourses = COURSES.filter((c) => {
    const matchSearch =
      !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[
          { label: "Home" },
          { label: "Course Management" },
          { label: "All Courses" },
        ]}
        instituteName="ALMS"
        showAvatar
      />

      {/* Banner */}
      <div className="relative w-full h-[140px] bg-[#0a1628] overflow-hidden flex items-end">
        <div
          className="absolute inset-0 opacity-40 mix-blend-luminosity"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 100% at 85% 50%, rgba(42,58,92,0.85) 0%, transparent 60%)",
          }}
        />
        <div className="absolute right-0 top-0 w-[340px] h-[340px] rounded-full border border-[#2a3a5c] opacity-30" style={{ transform: "translate(40%, -40%)" }} />
        <div className="absolute right-0 top-0 w-[220px] h-[220px] rounded-full border border-[#2a3a5c] opacity-40" style={{ transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 px-6 pb-6 max-w-[1200px] mx-auto w-full">
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px", color: "#faf8f5", opacity: 0.7, letterSpacing: "0.5px" }}>
            SOMDA INSTITUTE OF PROFESSIONAL STUDIES
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#faf8f5" }}>
            Courses Management
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Header + Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 max-w-[320px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#0a1628] outline-none focus:border-[#d4a574]"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/admin/courses/create")}
                className="flex items-center gap-2 px-4 py-2 bg-[#d4a574] hover:bg-[#c39463] text-[#0a1628] rounded-lg transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                <Plus size={16} />
                Create Course
              </button>
              <button
                onClick={() => navigate("/admin/courses/create-custom")}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] hover:bg-[#0d1e35] text-[#faf8f5] rounded-lg transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                <Plus size={16} />
                Custom Course
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#d4a574] transition-all group flex flex-col"
              >
                <div className="w-full h-[130px] overflow-hidden relative">
                  <img
                    src={course.imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-white ${
                      course.status === "Active"
                        ? "bg-green-500"
                        : course.status === "Draft"
                        ? "bg-gray-400"
                        : "bg-blue-500"
                    }`}
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}
                  >
                    {course.status}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}
                    >
                      {course.code}
                    </span>
                    {formatCourseTracks(course) && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#6c6c6c]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}
                      >
                        {formatCourseTracks(course)}
                      </span>
                    )}
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3 }}>
                    {course.title}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                    {course.instructor}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                    {course.term}
                  </p>
                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-3 text-[#6c6c6c]">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{course.students}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{course.modules}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ClipboardList size={12} />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{course.assignments}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/courses/${course.id}`)}
                      className="text-[#d4a574] hover:underline flex items-center gap-1"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}
                    >
                      View <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
          <a href="/terms-conditions" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">|</span>
          <a href="/privacy-policy" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
        <div className="flex items-center gap-3">
          {["facebook", "instagram", "twitter", "youtube", "linkedin"].map((s) => (
            <button key={s} className="w-7 h-7 rounded-full bg-[#0a1628] flex items-center justify-center hover:bg-[#d4a574] transition-colors">
              <span className="text-[#faf8f5] text-[10px] font-bold">{s[0].toUpperCase()}</span>
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
