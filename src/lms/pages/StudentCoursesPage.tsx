import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { BookOpen, ClipboardList, ArrowRight, Search } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { COURSES } from "../data/courses";
import {
  STUDENT_DEMO_COURSE_ENROLLMENTS,
  type StudentEnrollmentCohort,
} from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";

type CourseRow = (typeof COURSES)[number] & {
  enrollmentId: string;
  enrolledCohort: StudentEnrollmentCohort;
  enrollmentStatus: "Active" | "Past";
  enrolledTerm: string;
  finalGrade?: number;
  completedOn?: string;
};

export function StudentCoursesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const rows = useMemo<CourseRow[]>(() => {
    return STUDENT_DEMO_COURSE_ENROLLMENTS.map((enr) => {
      const c = COURSES.find((x) => x.id === enr.courseId) ?? COURSES[0];
      return {
        ...c,
        enrollmentId: enr.enrollmentId,
        enrolledCohort: enr.cohort,
        enrollmentStatus: enr.status,
        enrolledTerm: enr.term,
        finalGrade: enr.finalGrade,
        completedOn: enr.completedOn,
      };
    });
  }, []);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      r.shortCode.toLowerCase().includes(q) ||
      r.instructor.toLowerCase().includes(q)
    );
  });

  const activeCourses = filtered.filter((c) => c.enrollmentStatus === "Active");
  const pastCourses = filtered.filter((c) => c.enrollmentStatus === "Past");
  const activeCards = activeCourses.slice(0, 6);
  const activeOverflow = activeCourses.slice(6);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>My Courses</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                {activeCourses.length} active • {pastCourses.length} past
              </p>
            </div>
            <div className="relative w-full max-w-sm">
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

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "16px", color: "#0a1628" }}>Active Courses</h2>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{activeCourses.length} total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCards.map((course) => (
              <button
                key={course.enrollmentId}
                onClick={() => navigate(`/student/courses/${course.id}`)}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-md hover:border-[#d4a574] transition-all group"
              >
                <div className="w-full h-[140px] overflow-hidden">
                  <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>
                      {course.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#0a1628] text-[#faf8f5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                      Active
                    </span>
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3 }}>
                    {studentCourseTitle(course, course.enrolledCohort)}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 4 }}>
                    {course.instructor} • {course.enrolledTerm}
                  </p>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                      <BookOpen size={12} /> {course.modules} modules
                    </span>
                    <span className="flex items-center gap-1 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                      <ClipboardList size={12} /> {course.assignments} assignments
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-[#d4a574] group-hover:gap-2 transition-all" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}>
                    Continue Learning <ArrowRight size={13} />
                  </div>
                </div>
              </button>
            ))}
          </div>

            {activeOverflow.length > 0 && (
              <div className="mt-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700, color: "#6c6c6c", marginBottom: 8 }}>
                  Remaining Active Courses
                </p>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#f8f8f9] border-b border-gray-100">
                        {["Course", "Track", "Term", "Instructor", "Action"].map((h) => (
                          <th key={h} className="text-left px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeOverflow.map((c) => (
                        <tr key={c.enrollmentId} className="border-b border-gray-50">
                          <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628", fontWeight: 600 }}>
                            {c.title}
                          </td>
                          <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{c.enrolledCohort}</td>
                          <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{c.enrolledTerm}</td>
                          <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{c.instructor}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => navigate(`/student/courses/${c.id}`)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#0a1628]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "16px", color: "#0a1628" }}>Past Courses</h2>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{pastCourses.length} total</span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f8f9] border-b border-gray-100">
                    {["Course", "Track", "Term", "Final Grade", "Completed", "Action"].map((h) => (
                      <th key={h} className="text-left px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
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
                  {pastCourses.map((c) => (
                    <tr key={c.enrollmentId} className="border-b border-gray-50">
                      <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628", fontWeight: 600 }}>
                        {c.title}
                      </td>
                      <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{c.enrolledCohort}</td>
                      <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{c.enrolledTerm}</td>
                      <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628", fontWeight: 700 }}>
                        {c.finalGrade ?? "—"}
                      </td>
                      <td className="px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                        {c.completedOn ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/student/courses/${c.id}`)} className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-[#0a1628]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
