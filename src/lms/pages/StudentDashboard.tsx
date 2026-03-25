import { useNavigate } from "react-router";
import {
  BookOpen,
  Calendar,
  Bell,
  ChevronRight,
  Clock,
  ClipboardList,
  ArrowRight,
  Video,
  ExternalLink,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { COURSES } from "../data/courses";
import { STUDENT_DEMO_ENROLLMENTS, getStudentEnrollmentCohort, type StudentEnrollmentCohort } from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";

const enrolledCourseIds = STUDENT_DEMO_ENROLLMENTS.map((e) => e.courseId);
const enrolledCourses = COURSES.filter((c) => enrolledCourseIds.includes(c.id)).map((c) => {
  const cohort = getStudentEnrollmentCohort(c.id) as StudentEnrollmentCohort;
  return { ...c, cohort };
});

const announcements = [
  { id: 1, title: "Mid-Term Exam Schedule Released", message: "The mid-term examinations will begin on March 24, 2026. Please check your individual course calendars for exact times.", time: "2 hours ago", urgent: true },
  { id: 2, title: "Week 4 Materials Available", message: "Financial Accounting Level 1 Week 4 lecture notes and video have been uploaded.", time: "Yesterday", urgent: false },
  { id: 3, title: "Assignment Deadline Extended", message: "The Case Study assignment for Management Accounting has been extended to March 15.", time: "2 days ago", urgent: false },
];

const upcomingClasses = [
  { course: "Financial Accounting Level 1 - Weekend", date: "Sat, Mar 7", time: "09:00 AM – 11:00 AM", room: "Hall A", hasZoom: true, cohort: "Weekend" },
  { course: "Management Accounting Level 1 - Weekday", date: "Wed, Mar 11", time: "10:00 AM – 12:00 PM", room: "Hall C", hasZoom: true, cohort: "Weekday" },
  { course: "Financial Accounting Level 2 - Weekend", date: "Sat, Mar 14", time: "01:00 PM – 03:00 PM", room: "Hall B", hasZoom: true, cohort: "Weekend" },
];

const pendingAssignments = [
  { id: 1, title: "Weekend Essay on Financial Statements", course: "FA L1", dueDate: "Mar 15, 2026", status: "Not Started" },
  { id: 2, title: "Weekend Case Study: Cost Analysis", course: "MA L1", dueDate: "Mar 18, 2026", status: "In Progress" },
  { id: 3, title: "Partnership Dissolution Exercise", course: "FA L2", dueDate: "Mar 22, 2026", status: "Not Started" },
];

export function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Student Dashboard" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Welcome */}
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "36px", color: "#0a1628" }}>
                Welcome Kojo,
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6c6c6c", marginTop: 6 }}>
                Here's what's happening with your courses today
              </p>
            </div>
          </div>

          {/* Announcements Banner */}
          {announcements.filter(a => a.urgent).map((a) => (
            <div key={a.id} className="bg-[rgba(212,165,116,0.1)] border border-[rgba(212,165,116,0.3)] rounded-xl px-5 py-3.5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#d4a574] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{a.title}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2, lineHeight: 1.5 }}>{a.message}</p>
              </div>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#d4a574", fontWeight: 500, whiteSpace: "nowrap" }}>{a.time}</span>
            </div>
          ))}

          {/* Enrolled Courses */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>My Courses</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                  className="bg-[#f8f8f9] rounded-xl p-4 text-left hover:shadow-md hover:border-[#d4a574] border border-transparent transition-all group"
                >
                  <div className="w-full h-[100px] rounded-lg overflow-hidden mb-3">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3 }}>
                    {studentCourseTitle(course, course.cohort ?? "All")}
                  </p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 3 }}>
                    {course.instructor}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>Progress</span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, color: "#d4a574" }}>{course.completionRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-[#d4a574] rounded-full transition-all" style={{ width: `${course.completionRate}%` }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Two-column: Upcoming + Pending Assignments */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-5">
            {/* Upcoming Classes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Upcoming Classes</h2>
                <button onClick={() => navigate("/student/calendar")} className="flex items-center gap-1 hover:underline" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#d4a574", fontWeight: 500 }}>
                  Calendar <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {upcomingClasses.map((cls, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f8f9]">
                    <div className="w-9 h-9 bg-[rgba(212,165,116,0.15)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-[#d4a574]" />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{cls.course}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                        {cls.date} • {cls.time}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                          {cls.room}
                        </span>
                        {cls.hasZoom && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0a1628] text-[#faf8f5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                            <Video size={9} /> Zoom
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Assignments */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Pending Assignments</h2>
              </div>
              <div className="flex flex-col gap-3">
                {pendingAssignments.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f8f9]">
                    <div className="w-9 h-9 bg-[rgba(212,165,116,0.15)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClipboardList size={16} className="text-[#d4a574]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{a.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                          {a.course}
                        </span>
                        <span className="flex items-center gap-1 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px" }}>
                          <Clock size={10} /> Due {a.dueDate}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full ${a.status === "In Progress" ? "bg-[rgba(212,165,116,0.15)] text-[#d4a574]" : "bg-gray-100 text-[#6c6c6c]"}`}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500, whiteSpace: "nowrap" }}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 14 }}>Announcements</h2>
            <div className="flex flex-col gap-3">
              {announcements.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f8f9]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${a.urgent ? "bg-[#d4a574]" : "bg-[rgba(212,165,116,0.15)]"}`}>
                    <Bell size={14} className={a.urgent ? "text-white" : "text-[#d4a574]"} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{a.title}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2, lineHeight: 1.4 }}>{a.message}</p>
                  </div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c", whiteSpace: "nowrap" }}>{a.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
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
