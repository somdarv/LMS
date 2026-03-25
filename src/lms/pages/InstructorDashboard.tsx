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
  Bell,
  ChevronRight,
  X,
  PlusCircle,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseTitleWithTracks } from "../lib/courseLabels";

const quickActions = [
  { icon: Upload,       label: "Upload Content",    path: "/instructor/upload-content" },
  { icon: PlusCircle,   label: "Create Assignment", path: "/instructor/create-assignment" },
  { icon: FileText,     label: "Create Quiz",       path: "/instructor/create-quiz" },
  { icon: CalendarCheck,label: "Mark Attendance",   path: "/instructor/attendance" },
];

const upcomingClasses = [
  { course: "Financial Accounting Level 1 - Weekday", date: "Thu, Mar 6", time: "09:00 AM – 11:00 AM", room: "Hall A", cohort: "Weekday" },
  { course: "Management Accounting Level 1 - Weekday", date: "Tue, Mar 11", time: "10:00 AM – 12:00 PM", room: "Hall C", cohort: "Weekday" },
  { course: "Financial Accounting Level 2 - Weekday", date: "Fri, Mar 7", time: "01:00 PM – 03:00 PM", room: "Hall B", cohort: "Weekday" },
  { course: "Taxation Level 1 - Weekday", date: "Wed, Mar 13", time: "02:00 PM – 04:00 PM", room: "Hall D", cohort: "Weekday" },
  { course: "Auditing & Assurance Level 1 - Weekend", date: "Sat, Mar 15", time: "09:00 AM – 11:00 AM", room: "Hall E", cohort: "Weekend" },
  { course: "Financial Accounting Level 1 - Weekend", date: "Sun, Mar 16", time: "01:00 PM – 03:00 PM", room: "Hall A", cohort: "Weekend" },
];

const activityFeed = [
  { icon: Users,         text: "5 new students enrolled in Financial Accounting Level 1", time: "10 min ago",  gold: false, cohort: "Weekday" },
  { icon: ClipboardList, text: "12 pending assignment submissions await grading",          time: "1 hour ago", gold: false, cohort: "Weekend" },
  { icon: MessageCircle, text: "3 unread messages from students",                         time: "2 hours ago", gold: false, cohort: "Weekday" },
  { icon: Bell,          text: "Reminder: Upload Week 4 lecture materials",               time: "Yesterday",   gold: true,  cohort: "All" },
];

const responsibilities = [
  { icon: Upload, title: "Upload Course Content", desc: "Share lecture materials, videos, PDFs, and resources with students" },
  { icon: ClipboardList, title: "Create Assignments", desc: "Design and manage assignments with clear deadlines and grading criteria" },
  { icon: Star, title: "Grade Submissions", desc: "Review and grade student work with constructive feedback" },
  { icon: CalendarCheck, title: "Track Attendance", desc: "Mark and monitor student attendance for each class session" },
  { icon: BookOpen, title: "Manage Quizzes", desc: "Create and grade quizzes to assess student understanding" },
  { icon: MessageCircle, title: "Communicate with Students", desc: "Respond to questions, send announcements, and provide support" },
];

export function InstructorDashboard() {
  const navigate = useNavigate();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<"All" | "Weekday" | "Weekend">("All");

  const quickStartCards = [
    { icon: Upload, title: "Upload your first course material", color: "border-l-[#d4a574]" },
    { icon: Users, title: "Review your course roster", color: "border-l-blue-400" },
    { icon: Calendar, title: "Set up your course calendar", color: "border-l-green-400" },
    { icon: PlusCircle, title: "Create your first assignment", color: "border-l-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }]} />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" />

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
            <div className="mt-4 sm:mt-0 flex items-center gap-3">
              <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                Cohort View:
              </label>
              <select
                value={selectedCohort}
                onChange={(e) => setSelectedCohort(e.target.value as "All" | "Weekday" | "Weekend")}
                className="h-[40px] px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#0a1628]"
                style={{ fontFamily: "Inter, sans-serif", color: "#0a1628" }}
              >
                <option value="All">All Cohorts</option>
                <option value="Weekday">Weekday Track</option>
                <option value="Weekend">Weekend Track</option>
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 14 }}>Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-2 px-4 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
                >
                  <action.icon size={17} strokeWidth={1.8} />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* My Courses */}
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
          </div>

          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
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
          </div>

          {/* Two-column: Upcoming + Activity */}
          {/* My Courses */}
          <div>
            <div className="flex items-center justify-between mb-4 mt-2">
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
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-5">
            {/* Upcoming Classes */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Upcoming Classes</h2>
                <button style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#d4a574", fontWeight: 500 }} className="hover:underline flex items-center gap-1">
                  View Full Calendar <ArrowRight size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {upcomingClasses
                  .filter((cls) => selectedCohort === "All" || cls.cohort === selectedCohort)
                  .slice(0, 3).map((cls, i) => (
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

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 14 }}>Recent Activity</h2>
              <div className="flex flex-col gap-3">
                {activityFeed
                  .filter(item => selectedCohort === "All" || item.cohort === "All" || item.cohort === selectedCohort)
                  .map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full bg-[#f8f8f9] flex items-center justify-center flex-shrink-0`}>
                      <item.icon size={14} className={item.gold ? "text-[#d4a574]" : "text-[#6c6c6c]"} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628", lineHeight: 1.4 }}>
                        {item.text}
                        {item.cohort !== "All" && (
                          <span className="ml-2 inline-flex px-1.5 py-0.5 rounded bg-[#eef2f6] text-[#0a1628] text-[9px]">
                            {item.cohort}
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-[#6c6c6c]" />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Responsibilities Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628", textAlign: "center", marginBottom: 20 }}>
              Your Instructor Responsibilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {responsibilities.map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-[rgba(212,165,116,0.1)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-[#d4a574]" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>{item.title}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5, marginTop: 3 }}>{item.desc}</p>
                  </div>
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