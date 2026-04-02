import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Clock,
  Users,
  TrendingUp,
  Download,
  Save,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseSelectLabel, courseTitleWithTracks } from "../lib/courseLabels";

type AttendanceStatus = "Present" | "Absent" | "Late" | "Unmarked";

interface SessionMeta {
  date: string;
  day: string;
  time: string;
  topic: string;
}

interface StudentAttendance {
  id: number;
  name: string;
  avatar: string;
  status: AttendanceStatus;
  totalPresent: number;
  totalClasses: number;
  cohort: "Weekday" | "Weekend";
}

// Sessions per course (keyed by shortCode)
const allSessions: Record<string, SessionMeta[]> = {
  "FA L1": [
    { date: "Feb 6, 2025",  day: "Thu", time: "9:00–11:00 AM", topic: "Introduction to Double Entry" },
    { date: "Feb 13, 2025", day: "Thu", time: "9:00–11:00 AM", topic: "The Balance Sheet" },
    { date: "Feb 20, 2025", day: "Thu", time: "9:00–11:00 AM", topic: "Income Statement Basics" },
    { date: "Feb 27, 2025", day: "Thu", time: "9:00–11:00 AM", topic: "Ledger Accounts" },
    { date: "Mar 6, 2025",  day: "Thu", time: "9:00–11:00 AM", topic: "Cash Flow Overview" },
  ],
  "FA L2": [
    { date: "Feb 7, 2025",  day: "Fri", time: "1:00–3:00 PM", topic: "Company Accounts Intro" },
    { date: "Feb 14, 2025", day: "Fri", time: "1:00–3:00 PM", topic: "Share Capital & Reserves" },
    { date: "Feb 21, 2025", day: "Fri", time: "1:00–3:00 PM", topic: "Partnership Accounts" },
    { date: "Feb 28, 2025", day: "Fri", time: "1:00–3:00 PM", topic: "Consolidated Statements" },
    { date: "Mar 7, 2025",  day: "Fri", time: "1:00–3:00 PM", topic: "Cash Flow Statements" },
  ],
  "MA L1": [
    { date: "Feb 11, 2025", day: "Tue", time: "10:00 AM–12:00 PM", topic: "Role of Management Accountant" },
    { date: "Feb 18, 2025", day: "Tue", time: "10:00 AM–12:00 PM", topic: "Cost Classification" },
    { date: "Feb 25, 2025", day: "Tue", time: "10:00 AM–12:00 PM", topic: "Absorption vs Marginal Costing" },
    { date: "Mar 4, 2025",  day: "Tue", time: "10:00 AM–12:00 PM", topic: "Budget Preparation" },
    { date: "Mar 11, 2025", day: "Tue", time: "10:00 AM–12:00 PM", topic: "Variance Analysis" },
  ],
  "TAX L1": [
    { date: "Feb 12, 2025", day: "Wed", time: "2:00–4:00 PM", topic: "Ghana Tax System Overview" },
    { date: "Feb 19, 2025", day: "Wed", time: "2:00–4:00 PM", topic: "Personal Income Tax" },
    { date: "Feb 26, 2025", day: "Wed", time: "2:00–4:00 PM", topic: "Corporate Tax Computation" },
    { date: "Mar 5, 2025",  day: "Wed", time: "2:00–4:00 PM", topic: "VAT Registration & Rates" },
    { date: "Mar 13, 2025", day: "Wed", time: "2:00–4:00 PM", topic: "Tax Returns & Filing" },
  ],
  "AUD L1": [
    { date: "Feb 8, 2025",  day: "Sat", time: "9:00–11:00 AM", topic: "Nature and Purpose of Audit" },
    { date: "Feb 15, 2025", day: "Sat", time: "9:00–11:00 AM", topic: "Legal & Regulatory Framework" },
    { date: "Feb 22, 2025", day: "Sat", time: "9:00–11:00 AM", topic: "Types of Internal Controls" },
    { date: "Mar 1, 2025",  day: "Sat", time: "9:00–11:00 AM", topic: "Understanding Audit Risk" },
    { date: "Mar 15, 2025", day: "Sat", time: "9:00–11:00 AM", topic: "Audit Evidence & Procedures" },
  ],
};

// Initial students per course (keyed by shortCode)
const allCourseStudents: Record<string, StudentAttendance[]> = {
  "FA L1": [
    { id: 1, name: "Akua Mensah",  avatar: "AM", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekday" },
    { id: 2, name: "Kofi Boateng", avatar: "KB", status: "Unmarked", totalPresent: 3, totalClasses: 5, cohort: "Weekend" },
    { id: 3, name: "Kwame Asante", avatar: "KA", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekday" },
    { id: 4, name: "Yaw Darko",    avatar: "YD", status: "Unmarked", totalPresent: 5, totalClasses: 5, cohort: "Weekend" },
  ],
  "FA L2": [
    { id: 5, name: "Ama Owusu",      avatar: "AO", status: "Unmarked", totalPresent: 5, totalClasses: 5, cohort: "Weekend" },
    { id: 6, name: "Adwoa Frimpong", avatar: "AF", status: "Unmarked", totalPresent: 2, totalClasses: 5, cohort: "Weekend" },
    { id: 7, name: "Abena Kusi",     avatar: "AK", status: "Unmarked", totalPresent: 3, totalClasses: 5, cohort: "Weekend" },
    { id: 8, name: "Nana Adjei",     avatar: "NA", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekend" },
  ],
  "MA L1": [
    { id: 9,  name: "Efua Boadu",      avatar: "EB", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekday" },
    { id: 10, name: "Kwesi Darko",     avatar: "KD", status: "Unmarked", totalPresent: 2, totalClasses: 5, cohort: "Weekday" },
    { id: 11, name: "Aba Frimpong",    avatar: "AF", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekday" },
    { id: 12, name: "Kojo Acheampong", avatar: "KA", status: "Unmarked", totalPresent: 5, totalClasses: 5, cohort: "Weekday" },
  ],
  "TAX L1": [
    { id: 13, name: "Esi Amponsah",  avatar: "EA", status: "Unmarked", totalPresent: 5, totalClasses: 5, cohort: "Weekend" },
    { id: 14, name: "Fiifi Mensah",  avatar: "FM", status: "Unmarked", totalPresent: 2, totalClasses: 5, cohort: "Weekend" },
    { id: 15, name: "Gifty Asare",   avatar: "GA", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekend" },
  ],
  "AUD L1": [
    { id: 16, name: "Harriet Ofori",  avatar: "HO", status: "Unmarked", totalPresent: 4, totalClasses: 5, cohort: "Weekday" },
    { id: 17, name: "Isaac Danso",    avatar: "ID", status: "Unmarked", totalPresent: 3, totalClasses: 5, cohort: "Weekday" },
    { id: 18, name: "Josephine Adu",  avatar: "JA", status: "Unmarked", totalPresent: 5, totalClasses: 5, cohort: "Weekday" },
  ],
};

const avatarColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-yellow-100 text-yellow-700",
  "bg-teal-100 text-teal-700",
];

export function AttendancePage() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0].shortCode);
  const [selectedCohort, setSelectedCohort] = useState<"Weekday" | "Weekend" | "All">("All");
  const [selectedSession, setSelectedSession] = useState(4);
  const [saved, setSaved] = useState(false);
  // Students state keyed by course to persist marks across course switches
  const [studentsMap, setStudentsMap] = useState<Record<string, StudentAttendance[]>>(
    Object.fromEntries(Object.entries(allCourseStudents).map(([k, v]) => [k, v.map(s => ({ ...s }))]))
  );

  const courseObj = COURSES.find(c => c.shortCode === selectedCourse);
  const students = (studentsMap[selectedCourse] ?? []).filter(s => selectedCohort === "All" || s.cohort === selectedCohort);
  const sessions  = allSessions[selectedCourse]  ?? [];

  const handleCourseChange = (code: string) => {
    setSelectedCourse(code);
    setSelectedCohort("All");
    setSelectedSession(Math.min(4, (allSessions[code]?.length ?? 1) - 1));
    setSaved(false);
  };

  const markAll = (status: AttendanceStatus) => {
    setStudentsMap((prev) => ({
      ...prev,
      [selectedCourse]: (prev[selectedCourse] ?? []).map((s) => 
        (selectedCohort === "All" || s.cohort === selectedCohort) ? { ...s, status } : s
      ),
    }));
    setSaved(false);
  };

  const markStudent = (id: number, status: AttendanceStatus) => {
    setStudentsMap((prev) => ({
      ...prev,
      [selectedCourse]: (prev[selectedCourse] ?? []).map((s) => s.id === id ? { ...s, status } : s),
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const present  = students.filter((s) => s.status === "Present").length;
  const absent   = students.filter((s) => s.status === "Absent").length;
  const late     = students.filter((s) => s.status === "Late").length;
  const unmarked = students.filter((s) => s.status === "Unmarked").length;
  const session  = sessions[selectedSession] ?? sessions[0];

  const courseTitle = courseObj ? courseTitleWithTracks(courseObj) : selectedCourse;

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }, { label: "Attendance" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

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

          {/* Page Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>Attendance</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>Mark and track student attendance per session</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Course Selector */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="appearance-none pl-3 pr-8 h-[47px] border border-black bg-white text-[#0a1628] outline-none hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                  >
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.shortCode}>
                        {courseSelectLabel(c)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#0a1628]" />
                </div>

                {courseObj && courseObj.tracks.length > 1 && (
                  <div className="relative">
                    <select
                      value={selectedCohort}
                      onChange={(e) => setSelectedCohort(e.target.value as any)}
                      className="appearance-none pl-3 pr-8 h-[47px] border border-black bg-white text-[#0a1628] outline-none hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                    >
                      <option value="All">All Cohorts</option>
                      {courseObj.tracks.map((t) => (
                        <option key={t} value={t}>{t} Cohort</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#0a1628]" />
                  </div>
                )}
              </div>
              <button
                className="flex items-center gap-2 px-4 h-[47px] border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#6c6c6c" }}
              >
                <Download size={16} strokeWidth={1.8} />
                Export
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 h-[47px] border transition-colors ${saved ? "border-green-500 bg-green-50 text-green-600" : "border-black hover:bg-gray-50 text-[#0a1628]"}`}
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px" }}
              >
                {saved ? <Check size={16} strokeWidth={2} /> : <Save size={16} strokeWidth={1.8} />}
                {saved ? "Saved!" : "Save Attendance"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left: Session List */}
            <div className="bg-white border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>Sessions</p>
                <span
                  className="px-2 py-0.5 bg-[rgba(212,165,116,0.12)] text-[#d4a574]"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700 }}
                >
                  {selectedCourse}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {sessions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedSession(i); setSaved(false); }}
                    className={`flex items-start gap-3 p-3 text-left transition-colors border ${selectedSession === i ? "border-black bg-[#f8f8f8]" : "border-transparent hover:border-gray-200"}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center flex-shrink-0 ${selectedSession === i ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>{s.day}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{s.date}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 1, lineHeight: 1.3 }}>{s.topic}</p>
                    </div>
                    {i === sessions.length - 1 && (
                      <span className="ml-auto flex-shrink-0 px-1.5 py-0.5 bg-blue-50 text-blue-600" style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700 }}>
                        LATEST
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Mark Attendance */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Session Info */}
              {session && (
                <div className="bg-white border border-gray-200 p-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>{session.topic}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 3 }}>
                        {session.date} • {session.time} • {selectedCourse} {selectedCohort !== "All" ? `(${selectedCohort})` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>Mark all as:</span>
                      <button
                        onClick={() => markAll("Present")}
                        className="flex items-center gap-1 px-3 py-1.5 border border-green-400 text-green-600 hover:bg-green-50 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                      >
                        <Check size={12} /> Present
                      </button>
                      <button
                        onClick={() => markAll("Absent")}
                        className="flex items-center gap-1 px-3 py-1.5 border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                      >
                        <X size={12} /> Absent
                      </button>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    {[
                      { label: "Present",  value: present,          color: "text-green-600" },
                      { label: "Absent",   value: absent,           color: "text-red-500" },
                      { label: "Late",     value: late,             color: "text-orange-500" },
                      { label: "Unmarked", value: unmarked,         color: "text-gray-400" },
                      { label: "Total",    value: students.length,  color: "text-[#0a1628]" },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "20px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>{stat.label}</p>
                      </div>
                    ))}
                    <div className="ml-auto flex-1 max-w-[120px]">
                      <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                        <div className="bg-green-500 rounded-l-full" style={{ width: `${students.length ? (present / students.length) * 100 : 0}%` }} />
                        <div className="bg-orange-400" style={{ width: `${students.length ? (late / students.length) * 100 : 0}%` }} />
                        <div className="bg-red-500 rounded-r-full" style={{ width: `${students.length ? (absent / students.length) * 100 : 0}%` }} />
                      </div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c", textAlign: "center", marginTop: 4 }}>
                        {students.length > 0 ? Math.round((present / students.length) * 100) : 0}% present
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Student List */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Student</th>
                      <th className="text-left px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Overall</th>
                      <th className="text-center px-4 py-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-[#fafafa] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>{s.avatar}</span>
                            </div>
                            <div>
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{s.name}</p>
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c", marginTop: 1 }}>{s.cohort}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>
                              {s.totalPresent}/{s.totalClasses} sessions
                            </p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: s.totalPresent / s.totalClasses >= 0.75 ? "#16a34a" : "#dc2626" }}>
                              {Math.round((s.totalPresent / s.totalClasses) * 100)}% attendance
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {(["Present", "Absent", "Late"] as AttendanceStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => markStudent(s.id, s.status === status ? "Unmarked" : status)}
                                className={`px-3 py-1.5 border text-xs font-semibold transition-all ${
                                  s.status === status
                                    ? status === "Present"
                                      ? "border-green-500 bg-green-500 text-white"
                                      : status === "Absent"
                                      ? "border-red-500 bg-red-500 text-white"
                                      : "border-orange-400 bg-orange-400 text-white"
                                    : "border-gray-200 text-gray-400 hover:border-gray-400"
                                }`}
                                style={{ fontFamily: "Inter, sans-serif" }}
                              >
                                {status === "Present" ? "P" : status === "Absent" ? "A" : "L"}
                              </button>
                            ))}
                            {s.status === "Unmarked" && (
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0" }}>Not marked</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Overall Attendance Summary */}
          <div className="bg-white border border-gray-200 p-5">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 14 }}>
              Term Attendance Overview — {selectedCourse} {selectedCohort !== "All" && `(${selectedCohort})`}
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {students.map((s, i) => {
                const pct = Math.round((s.totalPresent / s.totalClasses) * 100);
                return (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarColors[i % avatarColors.length]}`}>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>{s.avatar}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pct >= 75 ? "bg-green-400" : "bg-red-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>{pct}%</p>
                  </div>
                );
              })}
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
