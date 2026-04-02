import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Eye,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  UserCheck,
  UserX,
  Download,
  ArrowLeft,
  Users2,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseSelectLabel } from "../lib/courseLabels";
import { findStudentGroup } from "../data/groups";

type StudentStatus = "Active" | "At Risk" | "Inactive";
type Trend = "up" | "down" | "neutral";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  course: string;   // matches COURSES[n].shortCode
  cohort: "Weekday" | "Weekend";
  grade: number;
  attendance: number;
  assignments: number;
  status: StudentStatus;
  trend: Trend;
  avatar: string;
  enrolled: string;
}

const students: Student[] = [
  // FA L1 (Has both tracks)
  { id: 1,  name: "Akua Mensah",     email: "akua.mensah@example.com",     phone: "+233 24 111 2222", course: "FA L1", cohort: "Weekday", grade: 78, attendance: 92,  assignments: 8,  status: "Active",   trend: "up",      avatar: "AM", enrolled: "Jan 15, 2025" },
  { id: 2,  name: "Kofi Boateng",    email: "kofi.boateng@example.com",    phone: "+233 20 333 4444", course: "FA L1", cohort: "Weekend", grade: 45, attendance: 60,  assignments: 5,  status: "At Risk",  trend: "down",    avatar: "KB", enrolled: "Jan 15, 2025" },
  { id: 3,  name: "Kwame Asante",    email: "kwame.asante@example.com",    phone: "+233 26 777 8888", course: "FA L1", cohort: "Weekday", grade: 62, attendance: 75,  assignments: 7,  status: "Active",   trend: "neutral", avatar: "KA", enrolled: "Jan 15, 2025" },
  { id: 4,  name: "Yaw Darko",       email: "yaw.darko@example.com",       phone: "+233 24 222 3333", course: "FA L1", cohort: "Weekend", grade: 91, attendance: 100, assignments: 10, status: "Active",   trend: "up",      avatar: "YD", enrolled: "Jan 15, 2025" },
  // FA L2 (Weekend track only)
  { id: 5,  name: "Ama Owusu",       email: "ama.owusu@example.com",       phone: "+233 27 555 6666", course: "FA L2", cohort: "Weekend", grade: 88, attendance: 97,  assignments: 10, status: "Active",   trend: "up",      avatar: "AO", enrolled: "Jan 15, 2025" },
  { id: 6,  name: "Adwoa Frimpong",  email: "adwoa.frimpong@example.com",  phone: "+233 55 999 0000", course: "FA L2", cohort: "Weekend", grade: 39, attendance: 48,  assignments: 3,  status: "At Risk",  trend: "down",    avatar: "AF", enrolled: "Jan 15, 2025" },
  { id: 7,  name: "Abena Kusi",      email: "abena.kusi@example.com",      phone: "+233 20 444 5555", course: "FA L2", cohort: "Weekend", grade: 55, attendance: 70,  assignments: 6,  status: "Active",   trend: "neutral", avatar: "AK", enrolled: "Jan 15, 2025" },
  { id: 8,  name: "Nana Adjei",      email: "nana.adjei@example.com",      phone: "+233 27 666 7777", course: "FA L2", cohort: "Weekend", grade: 72, attendance: 85,  assignments: 9,  status: "Active",   trend: "up",      avatar: "NA", enrolled: "Jan 15, 2025" },
  // MA L1 (All track)
  { id: 9,  name: "Efua Boadu",      email: "efua.boadu@example.com",      phone: "+233 24 888 9999", course: "MA L1", cohort: "Weekday", grade: 80, attendance: 88,  assignments: 9,  status: "Active",   trend: "up",      avatar: "EB", enrolled: "Jan 15, 2025" },
  { id: 10, name: "Kwesi Darko",     email: "kwesi.darko@example.com",     phone: "+233 20 111 3333", course: "MA L1", cohort: "Weekday", grade: 42, attendance: 55,  assignments: 4,  status: "At Risk",  trend: "down",    avatar: "KD", enrolled: "Jan 15, 2025" },
  { id: 11, name: "Aba Frimpong",    email: "aba.frimpong@example.com",    phone: "+233 27 333 5555", course: "MA L1", cohort: "Weekday", grade: 68, attendance: 80,  assignments: 7,  status: "Active",   trend: "neutral", avatar: "AF", enrolled: "Jan 15, 2025" },
  { id: 12, name: "Kojo Acheampong", email: "kojo.acheampong@example.com", phone: "+233 26 444 6666", course: "MA L1", cohort: "Weekday", grade: 74, attendance: 90,  assignments: 8,  status: "Active",   trend: "up",      avatar: "KA", enrolled: "Jan 15, 2025" },
  // TAX L1
  { id: 13, name: "Esi Amponsah",    email: "esi.amponsah@example.com",    phone: "+233 24 555 7777", course: "TAX L1", cohort: "Weekday",  grade: 85, attendance: 95,  assignments: 9,  status: "Active",   trend: "up",      avatar: "EA", enrolled: "Jan 15, 2025" },
  { id: 14, name: "Fiifi Mensah",    email: "fiifi.mensah@example.com",    phone: "+233 20 666 8888", course: "TAX L1", cohort: "Weekend", grade: 36, attendance: 42,  assignments: 2,  status: "At Risk",  trend: "down",    avatar: "FM", enrolled: "Jan 15, 2025" },
  { id: 15, name: "Gifty Asare",     email: "gifty.asare@example.com",     phone: "+233 27 777 9999", course: "TAX L1", cohort: "Weekday",  grade: 61, attendance: 78,  assignments: 6,  status: "Active",   trend: "neutral", avatar: "GA", enrolled: "Jan 15, 2025" },
  // AUD L1
  { id: 16, name: "Harriet Ofori",   email: "harriet.ofori@example.com",   phone: "+233 26 888 1111", course: "AUD L1", cohort: "Weekday",  grade: 79, attendance: 91,  assignments: 8,  status: "Active",   trend: "up",      avatar: "HO", enrolled: "Jan 15, 2025" },
  { id: 17, name: "Isaac Danso",     email: "isaac.danso@example.com",     phone: "+233 24 999 2222", course: "AUD L1", cohort: "Weekend", grade: 47, attendance: 58,  assignments: 4,  status: "At Risk",  trend: "down",    avatar: "ID", enrolled: "Jan 15, 2025" },
  { id: 18, name: "Josephine Adu",   email: "josephine.adu@example.com",   phone: "+233 20 000 3333", course: "AUD L1", cohort: "Weekday",  grade: 83, attendance: 96,  assignments: 9,  status: "Active",   trend: "up",      avatar: "JA", enrolled: "Jan 15, 2025" },
];

const statusConfig: Record<StudentStatus, { bg: string; text: string }> = {
  Active:   { bg: "bg-gray-100", text: "text-gray-600" },
  "At Risk": { bg: "bg-gray-100", text: "text-gray-600" },
  Inactive: { bg: "bg-gray-100", text: "text-gray-500" },
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

export function StudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterCohort, setFilterCohort] = useState("All");

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || s.status === filterStatus;
    const matchCourse = filterCourse === "All" || s.course === filterCourse;
    const matchCohort = filterCohort === "All" || s.cohort === filterCohort;
    return matchSearch && matchStatus && matchCourse && matchCohort;
  });

  const summaryCards = [
    { label: "Total Students", value: String(students.length),                                           icon: Users,     color: "text-[#d4a574] bg-[rgba(212,165,116,0.1)]" },
    { label: "Active",         value: String(students.filter(s => s.status === "Active").length),        icon: UserCheck, color: "text-green-500 bg-green-50" },
    { label: "At Risk",        value: String(students.filter(s => s.status === "At Risk").length),       icon: UserX,     color: "text-red-500 bg-red-50" },
    { label: "Avg. Grade",     value: `${Math.round(students.reduce((a, s) => a + s.grade, 0) / students.length)}%`, icon: TrendingUp, color: "text-blue-500 bg-blue-50" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }, { label: "Students" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

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
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>Students</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>View and manage your enrolled students</p>
            </div>
            <button
              className="flex items-center gap-2 px-4 h-[47px] border border-black hover:bg-gray-50 transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
            >
              <Download size={16} strokeWidth={1.8} />
              Export List
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-white border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${card.color}`}>
                  <card.icon size={18} />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: "#191919", lineHeight: 1.1 }}>{card.value}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6d6d6d", marginTop: 2 }}>{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-[#6c6c6c]" />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Status:</span>
              {["All", "Active", "At Risk"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 text-xs border transition-colors ${filterStatus === s ? "border-black bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500 }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#6c6c6c]" />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Course:</span>
              <div className="relative">
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 text-xs border border-gray-200 bg-white outline-none hover:border-gray-400 cursor-pointer"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, color: filterCourse !== "All" ? "#0a1628" : "#6c6c6c" }}
                >
                  <option value="All">All Courses</option>
                  {COURSES.map((c) => (
                    <option key={c.id} value={c.shortCode}>
                      {courseSelectLabel(c)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6c6c6c]" />
              </div>

              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginLeft: 8 }}>Cohort:</span>
              <div className="relative">
                <select
                  value={filterCohort}
                  onChange={(e) => setFilterCohort(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 text-xs border border-gray-200 bg-white outline-none hover:border-gray-400 cursor-pointer"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, color: filterCohort !== "All" ? "#0a1628" : "#6c6c6c" }}
                >
                  <option value="All">All Cohorts</option>
                  <option value="Weekday">Weekday Track</option>
                  <option value="Weekend">Weekend Track</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6c6c6c]" />
              </div>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Student", "Course", "Grade", "Attendance", "Assignments", "Status", "Trend", "Actions"].map((h) => (
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
                {filtered.map((s, i) => {
                  const cfg = statusConfig[s.status];
                  const courseId = COURSES.find(c => c.shortCode === s.course)?.id;
                  const group = courseId != null ? findStudentGroup(s.id, courseId, "All") : undefined;
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>{s.avatar}</span>
                          </div>
                          <div>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{s.name}</p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600 }}>
                            {s.course}
                          </span>
                          <span className="text-[10px] text-[#6c6c6c] font-medium px-1">
                            {s.cohort}
                          </span>
                          {group ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#fdf3e7] border border-[#d4a574]/30 text-[#a68b5b]"
                              style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700 }}>
                              <Users2 size={9} /> {group.name}
                            </span>
                          ) : (
                            <span className="text-[9px] text-[#c0c0c0] px-1" style={{ fontFamily: "Inter, sans-serif" }}>—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: s.grade >= 60 ? "#16a34a" : "#dc2626" }}>{s.grade}%</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{s.attendance}%</p>
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                            <div className="h-full rounded-full bg-[#d4a574]" style={{ width: `${s.attendance}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{s.assignments} done</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 ${cfg.bg} ${cfg.text}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600 }}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {s.trend === "up"      && <TrendingUp   size={16} className="text-green-500" />}
                        {s.trend === "down"    && <TrendingDown size={16} className="text-red-500" />}
                        {s.trend === "neutral" && <Minus        size={16} className="text-gray-400" />}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 hover:bg-gray-100 transition-colors" title="View"><Eye size={14} className="text-[#6c6c6c]" /></button>
                          <button className="p-1.5 hover:bg-gray-100 transition-colors" title="Message"><MessageCircle size={14} className="text-[#6c6c6c]" /></button>
                          <button className="p-1.5 hover:bg-gray-100 transition-colors" title="Email"><Mail size={14} className="text-[#6c6c6c]" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Users size={40} className="text-gray-200 mx-auto mb-3" />
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6c6c6c" }}>No students found matching your filters.</p>
              </div>
            )}
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