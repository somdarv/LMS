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
  Users,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { COURSES } from "../data/courses";
import { GROUPS } from "../data/groups";
import { STUDENT_DEMO_ENROLLMENTS, getStudentEnrollmentCohort, type StudentEnrollmentCohort } from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";

const enrolledCourseIds = STUDENT_DEMO_ENROLLMENTS.map((e) => e.courseId);
const enrolledCourses = COURSES.filter((c) => enrolledCourseIds.includes(c.id) && c.status === "Active").map((c) => {
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

          {/* Two-panel dashboard: courses (main) + pending assignments (sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
            <div className="flex flex-col gap-5">
              {/* Enrolled Courses */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>My Courses</h2>
                  <button
                    onClick={() => navigate("/student/courses")}
                    className="flex items-center gap-1 hover:underline"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#d4a574", fontWeight: 600 }}
                  >
                    View All Courses <ArrowRight size={12} />
                  </button>
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
                    </button>
                  ))}
                </div>
              </div>

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
            </div>

            {/* Right sidebar: Pending Assignments + Announcements */}
            <div className="flex flex-col gap-5">
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

              {/* Group enrollment notification — self-enrollment courses where student has no group */}
              {(() => {
                const DEMO_STUDENT_ID = 7;
                const openCourses = enrolledCourses.filter((c) => {
                  const courseGroups = GROUPS.filter((g) => g.courseId === c.id);
                  if (courseGroups.length === 0) return false;
                  const inGroup = courseGroups.some((g) => g.members.some((m) => m.studentId === DEMO_STUDENT_ID));
                  if (inGroup) return false;
                  const hasOpenSpots = courseGroups.some((g) => g.status === "open" && g.members.length < g.maxSize);
                  return hasOpenSpots;
                });
                if (openCourses.length === 0) return null;
                const spotsAvailable = openCourses.reduce((sum, c) => {
                  const cg = GROUPS.filter((g) => g.courseId === c.id && g.status === "open" && g.members.length < g.maxSize);
                  return sum + cg.length;
                }, 0);
                return (
                  <div className="bg-[#fdf3e7] rounded-xl border border-[#d4a574]/30 p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#d4a574] rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users size={16} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>Group Enrollment Open</p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 4, lineHeight: 1.4 }}>
                          {spotsAvailable} group{spotsAvailable !== 1 ? "s" : ""} with open spots across {openCourses.length} course{openCourses.length !== 1 ? "s" : ""}.
                        </p>
                        <div className="flex flex-col gap-2 mt-3">
                          {openCourses.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => navigate(`/student/courses/${c.id}?tab=groups`)}
                              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white/70 border border-[#d4a574]/20 hover:bg-white transition-colors text-left"
                            >
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#0a1628" }}>
                                {studentCourseTitle(c, c.cohort ?? "All")}
                              </span>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#d4a574" }}>View &amp; Join →</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

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
            </div>
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
          <a href="mailto:support@somda.edu.gh" className="text-[#d4a574] hover:underline font-medium">
            support@somda.edu.gh
          </a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="/terms-conditions" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="/privacy-policy" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
