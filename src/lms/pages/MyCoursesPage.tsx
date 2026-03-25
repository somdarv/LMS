import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Users,
  ClipboardList,
  Upload,
  PlusCircle,
  FileText,
  Search,
  LayoutGrid,
  List,
  Clock,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseDisplayTitleWithTrack } from "../lib/courseLabels";

const statusConfig: Record<string, { bg: string; text: string }> = {
  Active: { bg: "bg-green-50", text: "text-green-600" },
  Draft: { bg: "bg-gray-100", text: "text-gray-500" },
  Upcoming: { bg: "bg-blue-50", text: "text-blue-600" },
};

export function MyCoursesPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  const classes = COURSES.flatMap((c) =>
    c.tracks.map((t) => ({
      ...c,
      title: courseDisplayTitleWithTrack(c, t),
      track: t,
      classId: `${c.id}-${t}`,
    }))
  );

  const filtered = classes.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.track.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }, { label: "My Courses" }]} />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" institution="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 w-fit transition-colors hover:text-[#0a1628] text-[#6c6c6c]"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>My Courses</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
                Manage your assigned courses, content, and student activity
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("grid")}
                className={`p-2 border transition-colors ${view === "grid" ? "border-black bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-2 border transition-colors ${view === "list" ? "border-black bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 p-4">
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Upload, label: "Upload Content", path: "/instructor/upload-content" },
                { icon: PlusCircle, label: "Create Assignment", path: "/instructor/create-assignment" },
                { icon: FileText, label: "Create Quiz", path: "/instructor/create-quiz" },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 px-4 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
                >
                  <action.icon size={16} strokeWidth={1.8} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="bg-white border border-gray-200 p-4">
            <div className="relative max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Courses — Grid View */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {filtered.map((course) => (
                <div
                  key={course.classId}
                  onClick={() => navigate(`/instructor/courses/${course.id}?track=${course.track}`)}
                  className="bg-white border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#0a1628] transition-all group cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative h-[160px] overflow-hidden">
                    <img
                      src={course.imageUrl}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold ${statusConfig[course.status].bg} ${statusConfig[course.status].text}`}
                        style={{ fontFamily: "Inter, sans-serif" }}
                      >
                        {course.status}
                      </span>
                      <span className="px-2 py-0.5 bg-white/20 text-white text-xs" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
                        {course.level}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1 px-2 py-1 bg-white text-[#0a1628]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>
                        Open <ChevronRight size={11} />
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "15px", color: "#0a1628", marginBottom: 4 }}>
                      {course.title}
                    </h3>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5, marginBottom: 12 }}>
                      {course.subtitle}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-1.5">
                        <Users size={13} className="text-[#d4a574]" />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628", fontWeight: 500 }}>{course.students} Students</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BookOpen size={13} className="text-[#d4a574]" />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628", fontWeight: 500 }}>{course.modules} Modules</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <ClipboardList size={13} className="text-[#d4a574]" />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628", fontWeight: 500 }}>{course.assignments} Assignments</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>Course completion</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#0a1628" }}>{course.completionRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#d4a574] rounded-full"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[#6c6c6c]" />
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>{course.term}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="bg-white border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Course", "Level", "Term", "Students", "Completion", "Status"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((course) => {
                    const cfg = statusConfig[course.status];
                    return (
                      <tr
                        key={course.classId}
                        onClick={() => navigate(`/instructor/courses/${course.id}?track=${course.track}`)}
                        className="border-b border-gray-50 hover:bg-[#f5f6f8] cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 overflow-hidden flex-shrink-0 rounded">
                              <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="group-hover:text-[#d4a574] transition-colors">
                                  {course.title}
                                </p>
                              </div>
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 1 }}>{course.modules} modules · {course.assignments} assignments</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{course.level}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{course.term}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-[#6c6c6c]" />
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{course.students}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>{course.completionRate}%</span>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                              <div className="h-full bg-[#d4a574] rounded-full" style={{ width: `${course.completionRate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`} style={{ fontFamily: "Inter, sans-serif" }}>
                            {course.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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