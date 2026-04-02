import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  Users,
  ClipboardList,
  Search,
  ArrowRight,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
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

  const activeCourses = filtered.filter((c) => c.status === "Active");
  const pastCourses = filtered.filter((c) => c.status !== "Active");
  const activeCards = activeCourses.slice(0, 6);
  const activeOverflow = activeCourses.slice(6);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }, { label: "My Courses" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Header with search */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>My Courses</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
                {activeCourses.length} active • {pastCourses.length} past
              </p>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-[260px] pl-8 pr-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              />
            </div>
          </div>

          {/* Active courses: first 6 as cards */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "16px", color: "#0a1628" }}>Active Courses</h2>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{activeCourses.length} total</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeCards.map((course) => (
                <button
                  key={course.classId}
                  onClick={() => navigate(`/instructor/courses/${course.id}?track=${course.track}`)}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden text-left hover:shadow-md hover:border-[#d4a574] transition-all group flex flex-col"
                >
                  <div className="w-full h-[140px] overflow-hidden">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>
                        {course.code}
                      </span>
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3, marginBottom: 4 }}>
                      {course.title}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginBottom: 8 }}>
                      Prof Mensah Oduro • {course.term}
                    </p>
                    <div className="mt-auto pt-3 flex items-center justify-between text-[#6c6c6c] border-t border-gray-100">
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
                      className="mt-3 flex items-center justify-center gap-1 w-full py-2 text-[#d4a574] hover:bg-[rgba(212,165,116,0.05)] transition-colors"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                    >
                      View Course <ArrowRight size={12} />
                    </button>
                  </div>
                </button>
              ))}
            </div>

            {activeOverflow.length > 0 && (
              <div className="mt-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: "#6c6c6c", marginBottom: 8 }}>
                  Remaining Active Courses
                </p>
                <div className="bg-white border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["Course", "Track", "Term", "Students", "Status"].map((h) => (
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
                      {activeOverflow.map((course) => {
                        const cfg = statusConfig[course.status];
                        return (
                          <tr
                            key={course.classId}
                            onClick={() => navigate(`/instructor/courses/${course.id}?track=${course.track}`)}
                            className="border-b border-gray-50 hover:bg-[#f5f6f8] cursor-pointer transition-colors group"
                          >
                            <td className="px-4 py-4">
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                                {course.title}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{course.track}</span>
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
              </div>
            )}
          </div>

          {/* Past courses: table */}
          <div className="bg-white border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "16px", color: "#0a1628" }}>Past Courses</h2>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{pastCourses.length} total</span>
            </div>
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
                  {pastCourses.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#8e8e96" }}>
                        No past courses found.
                      </td>
                    </tr>
                  )}
                  {pastCourses.map((course) => {
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