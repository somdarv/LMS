import { useState } from "react";
import { useNavigate } from "react-router";
import {
  PlusCircle,
  ClipboardList,
  Search,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  BookOpen,
  Edit2,
  Eye,
  Trash2,
  Download,
  PenLine,
  HelpCircle,
  Timer,
  BarChart2,
  Zap,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseSelectLabel } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };

// ─── Types ───────────────────────────────────────────────────────────────────
type ItemStatus = "Active" | "Grading" | "Completed" | "Draft";

interface Assignment {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  submissions: number;
  totalStudents: number;
  status: ItemStatus;
  maxScore: number;
  type: string;
}

interface Quiz {
  id: number;
  title: string;
  course: string;
  dueDate: string;
  questions: number;
  timeLimit: number;   // minutes
  attempts: number;
  completions: number;
  totalStudents: number;
  status: ItemStatus;
  maxScore: number;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ASSIGNMENTS: Assignment[] = [
  { id: 1,  title: "Chapter 1 – Double Entry Practice",  course: "FA L1",  dueDate: "Mar 8, 2026",  submissions: 38, totalStudents: 42, status: "Grading",   maxScore: 20, type: "Exercise"   },
  { id: 2,  title: "Balance Sheet Preparation",          course: "FA L1",  dueDate: "Mar 15, 2026", submissions: 12, totalStudents: 42, status: "Active",    maxScore: 30, type: "Assignment" },
  { id: 3,  title: "Mid-Term Paper",                     course: "FA L1",  dueDate: "Feb 28, 2026", submissions: 42, totalStudents: 42, status: "Completed", maxScore: 50, type: "Exam"       },
  { id: 4,  title: "Income Statement Analysis",          course: "FA L2",  dueDate: "Mar 12, 2026", submissions: 30, totalStudents: 38, status: "Grading",   maxScore: 25, type: "Case Study" },
  { id: 5,  title: "Cash Flow Statement Exercise",       course: "FA L2",  dueDate: "Mar 20, 2026", submissions: 0,  totalStudents: 38, status: "Active",    maxScore: 20, type: "Exercise"   },
  { id: 6,  title: "Ratio Analysis Draft",               course: "FA L2",  dueDate: "Apr 1, 2026",  submissions: 0,  totalStudents: 38, status: "Draft",     maxScore: 15, type: "Assignment" },
  { id: 7,  title: "Cost Variance Analysis",             course: "MA L1",  dueDate: "Mar 18, 2026", submissions: 20, totalStudents: 35, status: "Grading",   maxScore: 25, type: "Exercise"   },
  { id: 8,  title: "Budget Preparation Report",          course: "MA L1",  dueDate: "Mar 25, 2026", submissions: 0,  totalStudents: 35, status: "Active",    maxScore: 30, type: "Assignment" },
  { id: 9,  title: "Personal Income Tax Exercise",       course: "TAX L1", dueDate: "Mar 19, 2026", submissions: 15, totalStudents: 29, status: "Grading",   maxScore: 20, type: "Exercise"   },
  { id: 10, title: "VAT Compliance Assignment",          course: "TAX L1", dueDate: "Apr 2, 2026",  submissions: 0,  totalStudents: 29, status: "Draft",     maxScore: 25, type: "Assignment" },
  { id: 11, title: "Audit Risk Assessment",              course: "AUD L1", dueDate: "Mar 22, 2026", submissions: 18, totalStudents: 31, status: "Grading",   maxScore: 30, type: "Case Study" },
  { id: 12, title: "Internal Controls Review",           course: "AUD L1", dueDate: "Apr 5, 2026",  submissions: 0,  totalStudents: 31, status: "Active",    maxScore: 20, type: "Assignment" },
];

const QUIZZES: Quiz[] = [
  { id: 101, title: "Quiz 1: Double Entry MCQ",       course: "FA L1",  dueDate: "Mar 5, 2026",  questions: 15, timeLimit: 20, attempts: 1, completions: 42, totalStudents: 42, status: "Completed", maxScore: 15 },
  { id: 102, title: "Quiz 2: Financial Ratios",       course: "FA L1",  dueDate: "Apr 8, 2026",  questions: 10, timeLimit: 15, attempts: 2, completions: 0,  totalStudents: 42, status: "Active",    maxScore: 10 },
  { id: 103, title: "FA L2 Concepts Check",           course: "FA L2",  dueDate: "Mar 25, 2026", questions: 12, timeLimit: 20, attempts: 1, completions: 14, totalStudents: 38, status: "Active",    maxScore: 12 },
  { id: 104, title: "Depreciation Methods Quiz",      course: "FA L2",  dueDate: "Apr 15, 2026", questions: 8,  timeLimit: 12, attempts: 2, completions: 0,  totalStudents: 38, status: "Draft",     maxScore: 8  },
  { id: 105, title: "Cost Classification Quiz",       course: "MA L1",  dueDate: "Mar 20, 2026", questions: 10, timeLimit: 15, attempts: 1, completions: 22, totalStudents: 35, status: "Active",    maxScore: 10 },
  { id: 106, title: "Break-Even Analysis Quiz",       course: "MA L1",  dueDate: "Apr 10, 2026", questions: 12, timeLimit: 18, attempts: 2, completions: 0,  totalStudents: 35, status: "Draft",     maxScore: 12 },
  { id: 107, title: "Tax Basics Quiz",                course: "TAX L1", dueDate: "Mar 28, 2026", questions: 8,  timeLimit: 10, attempts: 1, completions: 0,  totalStudents: 29, status: "Active",    maxScore: 8  },
  { id: 108, title: "Audit Concepts Quiz",            course: "AUD L1", dueDate: "Apr 2, 2026",  questions: 10, timeLimit: 15, attempts: 1, completions: 0,  totalStudents: 31, status: "Draft",     maxScore: 10 },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const statusConfig: Record<ItemStatus, { bg: string; text: string; icon: React.ReactNode }> = {
  Active:    { bg: "bg-gray-100", text: "text-[#6c6c6c]", icon: <Clock size={11} />        },
  Grading:   { bg: "bg-[rgba(212,165,116,0.15)]", text: "text-[#b07d3a]", icon: <AlertCircle size={11} /> },
  Completed: { bg: "bg-gray-100", text: "text-[#6c6c6c]", icon: <CheckCircle2 size={11} />  },
  Draft:     { bg: "bg-gray-100", text: "text-[#b0b0b0]", icon: <Edit2 size={11} />         },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AssignmentsPage() {
  const navigate = useNavigate();

  const [tab, setTab]               = useState<"assignments" | "quizzes">("assignments");
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterCourse, setFilterCourse] = useState("All");
  const [assignmentRows, setAssignmentRows] = useState(ASSIGNMENTS);
  const [quizRows, setQuizRows]             = useState(QUIZZES);

  // Filtered assignment rows
  const filteredAssignments = assignmentRows.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.course.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    const matchCourse = filterCourse === "All" || a.course === filterCourse;
    return matchSearch && matchStatus && matchCourse;
  });

  // Filtered quiz rows
  const filteredQuizzes = quizRows.filter(q => {
    const matchSearch = q.title.toLowerCase().includes(search.toLowerCase()) || q.course.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || q.status === filterStatus;
    const matchCourse = filterCourse === "All" || q.course === filterCourse;
    return matchSearch && matchStatus && matchCourse;
  });

  const handleDeleteAssignment = (id: number) => setAssignmentRows(prev => prev.filter(a => a.id !== id));
  const handleDeleteQuiz       = (id: number) => setQuizRows(prev => prev.filter(q => q.id !== id));

  const handleDownload = (title: string) => {
    const blob = new Blob([`Submissions for: ${title}\n(No real data in demo)`], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${title.replace(/\s+/g, "_")}_submissions.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  // Summary stats
  const totalAssignments = assignmentRows.length;
  const totalQuizzes     = quizRows.length;
  const pendingGrading   = assignmentRows.filter(a => a.status === "Grading").length;
  const activeItems      = assignmentRows.filter(a => a.status === "Active").length + quizRows.filter(q => q.status === "Active").length;

  const summaryCards = [
    { label: "Assignments",     value: String(totalAssignments), icon: ClipboardList, gold: false },
    { label: "Quizzes",         value: String(totalQuizzes),     icon: HelpCircle,    gold: false },
    { label: "Pending Grading", value: String(pendingGrading),   icon: PenLine,       gold: true  },
    { label: "Active",          value: String(activeItems),      icon: Clock,         gold: false },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Assignments & Quizzes" }]} />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">

          {/* ── Page Header ── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>Assignments & Quizzes</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
                Manage all assignments and quizzes across your courses
              </p>
            </div>
            {/* Two create buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/instructor/create-quiz")}
                className="flex items-center gap-2 px-4 h-[42px] border border-gray-300 hover:border-[#0a1628] transition-colors"
                style={{ ...S, fontWeight: 600, fontSize: "13px", color: "#0a1628" }}
              >
                <PlusCircle size={15} strokeWidth={1.8} />
                Create Quiz
              </button>
              <button
                onClick={() => navigate("/instructor/create-assignment")}
                className="flex items-center gap-2 px-4 h-[42px] bg-[#0a1628] hover:bg-[#0d1e35] transition-colors"
                style={{ ...S, fontWeight: 600, fontSize: "13px", color: "white" }}
              >
                <PlusCircle size={15} strokeWidth={1.8} />
                Create Assignment
              </button>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {summaryCards.map(card => (
              <div key={card.label} className="bg-white border border-gray-200 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${card.gold ? "bg-[rgba(212,165,116,0.15)]" : "bg-[#f0f0f0]"}`}>
                  <card.icon size={18} className={card.gold ? "text-[#d4a574]" : "text-[#6c6c6c]"} />
                </div>
                <div>
                  <p style={{ ...S, fontSize: "22px", fontWeight: 700, color: "#0a1628", lineHeight: 1.1 }}>{card.value}</p>
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>{card.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Tab bar ── */}
          <div className="flex items-end gap-0 border-b border-gray-200">
            {(["assignments", "quizzes"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(""); setFilterStatus("All"); setFilterCourse("All"); }}
                className={`flex items-center gap-2 px-5 py-2.5 border-b-2 transition-colors ${
                  tab === t
                    ? "border-[#0a1628] text-[#0a1628]"
                    : "border-transparent text-[#b0b0b0] hover:text-[#6c6c6c]"
                }`}
                style={{ ...S, fontSize: "13px", fontWeight: tab === t ? 700 : 400 }}
              >
                {t === "assignments" ? <ClipboardList size={14} /> : <HelpCircle size={14} />}
                {t === "assignments" ? `Assignments (${totalAssignments})` : `Quizzes (${totalQuizzes})`}
              </button>
            ))}
          </div>

          {/* ── Filters ── */}
          <div className="bg-white border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
              <input
                type="text"
                placeholder={tab === "assignments" ? "Search assignments…" : "Search quizzes…"}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-200 bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                style={{ ...S, fontSize: "13px" }}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={14} className="text-[#6c6c6c]" />
              <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Status:</span>
              {["All", "Active", "Grading", "Completed", "Draft"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1 border transition-colors ${filterStatus === s ? "border-[#0a1628] bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
                  style={{ ...S, fontSize: "12px", fontWeight: 500 }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={14} className="text-[#6c6c6c]" />
              <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Course:</span>
              <div className="relative">
                <select
                  value={filterCourse}
                  onChange={e => setFilterCourse(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1 border border-gray-200 bg-white outline-none hover:border-gray-400 cursor-pointer"
                  style={{ ...S, fontSize: "12px", fontWeight: 500, color: filterCourse !== "All" ? "#0a1628" : "#6c6c6c" }}
                >
                  <option value="All">All Courses</option>
                  {COURSES.map(c => (
                    <option key={c.id} value={c.shortCode}>
                      {courseSelectLabel(c)}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[#6c6c6c]" />
              </div>
            </div>
          </div>

          {/* ── ASSIGNMENTS TABLE ── */}
          {tab === "assignments" && (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#f9f9f9]">
                    {["Assignment", "Course", "Type", "Due Date", "Submissions", "Status", "Actions"].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3"
                        style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a, i) => {
                    const cfg = statusConfig[a.status];
                    const pct = Math.round((a.submissions / a.totalStudents) * 100);
                    return (
                      <tr key={a.id} className={`border-b border-gray-50 hover:bg-[#fafafa] transition-colors ${i % 2 !== 0 ? "bg-[#fdfcfc]" : ""}`}>
                        <td className="px-4 py-3">
                          <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{a.title}</p>
                          <p style={{ ...S, fontSize: "11px", color: "#b0b0b0", marginTop: 1 }}>{a.maxScore} pts max</p>
                        </td>
                        <td className="px-4 py-3">
                          <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{a.course}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-[#f0f0f0]" style={{ ...S, fontSize: "11px", color: "#0a1628", fontWeight: 500 }}>{a.type}</span>
                        </td>
                        <td className="px-4 py-3">
                          <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{a.dueDate}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{a.submissions}/{a.totalStudents}</p>
                          <div className="w-24 h-1.5 bg-gray-100 mt-1 overflow-hidden">
                            <div className="h-full bg-[#d4a574]" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${cfg.bg} ${cfg.text}`} style={{ ...S, fontSize: "11px", fontWeight: 600 }}>
                            {cfg.icon} {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {a.status === "Grading" ? (
                              <button
                                onClick={() => navigate(`/instructor/grading/${a.id}`)}
                                className="flex items-center gap-1 px-2.5 py-1 bg-[#d4a574] hover:bg-[#c8955f] transition-colors"
                                title="Open Grading Center"
                              >
                                <PenLine size={12} className="text-[#0a1628]" />
                                <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#0a1628" }}>Grade</span>
                              </button>
                            ) : (
                              <button onClick={() => navigate("/instructor/gradebooks")} className="p-1.5 hover:bg-gray-100 transition-colors" title="View">
                                <Eye size={14} className="text-[#6c6c6c]" />
                              </button>
                            )}
                            <button onClick={() => navigate("/instructor/create-assignment")} className="p-1.5 hover:bg-gray-100 transition-colors" title="Edit">
                              <Edit2 size={14} className="text-[#6c6c6c]" />
                            </button>
                            <button onClick={() => handleDownload(a.title)} className="p-1.5 hover:bg-gray-100 transition-colors" title="Download">
                              <Download size={14} className="text-[#6c6c6c]" />
                            </button>
                            <button onClick={() => handleDeleteAssignment(a.id)} className="p-1.5 hover:bg-gray-100 transition-colors" title="Delete">
                              <Trash2 size={14} className="text-[#b0b0b0]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredAssignments.length === 0 && (
                <div className="py-16 text-center">
                  <ClipboardList size={36} className="text-gray-200 mx-auto mb-3" />
                  <p style={{ ...S, fontSize: "14px", color: "#6c6c6c" }}>No assignments match your filters.</p>
                  <button
                    onClick={() => navigate("/instructor/create-assignment")}
                    className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                    style={{ ...S, fontSize: "13px", fontWeight: 600 }}
                  >
                    <PlusCircle size={14} /> Create Assignment
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── QUIZZES TABLE ── */}
          {tab === "quizzes" && (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-[#f9f9f9]">
                    {["Quiz", "Course", "Questions", "Time Limit", "Attempts", "Completions", "Status", "Actions"].map(h => (
                      <th
                        key={h}
                        className="text-left px-4 py-3"
                        style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((q, i) => {
                    const cfg = statusConfig[q.status];
                    const pct = Math.round((q.completions / q.totalStudents) * 100);
                    return (
                      <tr key={q.id} className={`border-b border-gray-50 hover:bg-[#fafafa] transition-colors ${i % 2 !== 0 ? "bg-[#fdfcfc]" : ""}`}>
                        {/* Quiz title */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                              <HelpCircle size={13} className="text-[#0a1628]" />
                            </div>
                            <div>
                              <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{q.title}</p>
                              <p style={{ ...S, fontSize: "11px", color: "#b0b0b0", marginTop: 1 }}>{q.maxScore} pts max</p>
                            </div>
                          </div>
                        </td>
                        {/* Course */}
                        <td className="px-4 py-3">
                          <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{q.course}</p>
                        </td>
                        {/* Questions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <BarChart2 size={12} className="text-[#b0b0b0]" />
                            <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{q.questions}</p>
                          </div>
                        </td>
                        {/* Time limit */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Timer size={12} className="text-[#b0b0b0]" />
                            <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{q.timeLimit} min</p>
                          </div>
                        </td>
                        {/* Attempts */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Zap size={11} className="text-[#b0b0b0]" />
                            <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{q.attempts}×</p>
                          </div>
                        </td>
                        {/* Completions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <p style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{q.completions}/{q.totalStudents}</p>
                              <div className="w-20 h-1.5 bg-gray-100 mt-1 overflow-hidden">
                                <div className="h-full bg-[#d4a574]" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${cfg.bg} ${cfg.text}`} style={{ ...S, fontSize: "11px", fontWeight: 600 }}>
                            {cfg.icon} {q.status}
                          </span>
                          <p style={{ ...S, fontSize: "10px", color: "#b0b0b0", marginTop: 2 }}>Due {q.dueDate}</p>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate("/instructor/gradebooks")}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              title="View results"
                            >
                              <Eye size={14} className="text-[#6c6c6c]" />
                            </button>
                            <button
                              onClick={() => navigate("/instructor/create-quiz")}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              title="Edit quiz"
                            >
                              <Edit2 size={14} className="text-[#6c6c6c]" />
                            </button>
                            <button
                              onClick={() => handleDownload(q.title)}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              title="Download results"
                            >
                              <Download size={14} className="text-[#6c6c6c]" />
                            </button>
                            <button
                              onClick={() => handleDeleteQuiz(q.id)}
                              className="p-1.5 hover:bg-gray-100 transition-colors"
                              title="Delete quiz"
                            >
                              <Trash2 size={14} className="text-[#b0b0b0]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredQuizzes.length === 0 && (
                <div className="py-16 text-center">
                  <HelpCircle size={36} className="text-gray-200 mx-auto mb-3" />
                  <p style={{ ...S, fontSize: "14px", color: "#6c6c6c" }}>No quizzes match your filters.</p>
                  <button
                    onClick={() => navigate("/instructor/create-quiz")}
                    className="mt-4 flex items-center gap-2 mx-auto px-4 py-2 bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                    style={{ ...S, fontSize: "13px", fontWeight: 600 }}
                  >
                    <PlusCircle size={14} /> Create Quiz
                  </button>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 mt-4">
        <p style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
      </footer>
    </div>
  );
}
