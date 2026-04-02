import { useNavigate } from "react-router";
import {
  ClipboardList,
  BookOpen,
  Users,
  Calendar,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseTitleWithTracks } from "../lib/courseLabels";

const upcomingClasses = [
  { course: "Financial Accounting Level 1 - Weekday", date: "Thu, Mar 6", time: "09:00 AM – 11:00 AM", room: "Hall A", cohort: "Weekday" },
  { course: "Management Accounting Level 1 - Weekday", date: "Tue, Mar 11", time: "10:00 AM – 12:00 PM", room: "Hall C", cohort: "Weekday" },
  { course: "Financial Accounting Level 2 - Weekday", date: "Fri, Mar 7", time: "01:00 PM – 03:00 PM", room: "Hall B", cohort: "Weekday" },
  { course: "Taxation Level 1 - Weekday", date: "Wed, Mar 13", time: "02:00 PM – 04:00 PM", room: "Hall D", cohort: "Weekday" },
  { course: "Auditing & Assurance Level 1 - Weekend", date: "Sat, Mar 15", time: "09:00 AM – 11:00 AM", room: "Hall E", cohort: "Weekend" },
  { course: "Financial Accounting Level 1 - Weekend", date: "Sun, Mar 16", time: "01:00 PM – 03:00 PM", room: "Hall A", cohort: "Weekend" },
];

const pendingAssignments = [
  { id: 1, title: "FA L1 — Assignment submissions awaiting grading", course: "FA L1", dueDate: "Mar 15, 2026", status: "Awaiting Grading" },
  { id: 2, title: "FA L2 — Group assignment work submitted (needs review)", course: "FA L2", dueDate: "Mar 22, 2026", status: "Awaiting Grading" },
  { id: 3, title: "MA L1 — Case study submissions in progress", course: "MA L1", dueDate: "Mar 18, 2026", status: "In Progress" },
];

export function InstructorDashboard() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
        instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES"
        showAvatar
      />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        {/* Sidebar */}
        <InstructorSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">



          {/* Welcome text & Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between py-4 border-b border-gray-200">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "36px", color: "#0a1628" }}>
                Welcome Richard,
              </h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6c6c6c", marginTop: 6 }}>
                You're all set to start teaching and inspiring students
              </p>
            </div>
          </div>

          {/* My Courses */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
            <div>
              <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0a1628" }}>My Assigned Courses</h2>
              <button 
                onClick={() => navigate("/instructor/courses")}
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#d4a574", fontWeight: 500 }} 
                className="hover:underline flex items-center gap-1"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COURSES.slice(0, 3).map((course) => (
                <button
                  key={course.id}
                  onClick={() => navigate(`/instructor/courses/${course.id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-md hover:border-[#d4a574] transition-all group flex flex-col"
                >
                  <div className="w-full h-[120px] overflow-hidden">
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>
                        {course.code}
                      </span>
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3, marginBottom: 4 }}>
                      {courseTitleWithTracks(course)}
                    </p>
                    <div className="mt-auto pt-4 flex items-center justify-between text-[#6c6c6c]">
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
                  </div>
                </button>
              ))}
            </div>

            {/* Upcoming Classes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mt-5">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Upcoming Classes</h2>
                <button
                  onClick={() => navigate("/instructor/calendar")}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#d4a574", fontWeight: 500 }}
                  className="hover:underline flex items-center gap-1"
                >
                  View Full Calendar <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {upcomingClasses.slice(0, 3).map((cls, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#f8f8f9]">
                    <div className="w-9 h-9 bg-[rgba(212,165,116,0.15)] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-[#d4a574]" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{cls.course}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                        {cls.date} • {cls.time}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                          {cls.room}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </div>

            {/* Pending Assignments (right sidebar) */}
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
                      className={`px-2 py-0.5 rounded-full ${
                        a.status === "Awaiting Grading" ? "bg-[rgba(212,165,116,0.15)] text-[#d4a574]" : "bg-gray-100 text-[#6c6c6c]"
                      }`}
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500, whiteSpace: "nowrap" }}
                    >
                      {a.status}
                    </span>
                  </div>
                ))}
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