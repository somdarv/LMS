import { useNavigate } from "react-router";
import { BookOpen, Users, ClipboardList, ArrowRight } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort, type StudentEnrollmentCohort } from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";

const enrolledCourseIds = [1, 2, 3];
const enrolledCourses = COURSES.filter((c) => enrolledCourseIds.includes(c.id)).map((c) => ({
  ...c,
  enrolledCohort: getStudentEnrollmentCohort(c.id) as StudentEnrollmentCohort,
}));

export function StudentCoursesPage() {
  const navigate = useNavigate();

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
                {enrolledCourses.length} courses enrolled • May 2025 Sitting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledCourses.map((course) => (
              <button
                key={course.id}
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
                      {course.status}
                    </span>
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3 }}>
                    {studentCourseTitle(course, course.enrolledCohort)}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 4 }}>{course.instructor}</p>

                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                      <BookOpen size={12} /> {course.modules} modules
                    </span>
                    <span className="flex items-center gap-1 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                      <ClipboardList size={12} /> {course.assignments} assignments
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>Progress</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, color: "#d4a574" }}>{course.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#d4a574] rounded-full" style={{ width: `${course.completionRate}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mt-3 text-[#d4a574] group-hover:gap-2 transition-all" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}>
                    Continue Learning <ArrowRight size={13} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
