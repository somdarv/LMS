import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  Upload,
  PlusCircle,
  FileText,
  Users,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Play,
  FileIcon,
  BookMarked,
  ClipboardList,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  MessageCircle,
  HelpCircle,
  PenLine,
  MoreVertical,
  X,
  Plus,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { CourseSidebar, type CourseTab } from "../components/CourseSidebar";
import { GroupsTab } from "../components/GroupsTab";
import { COURSES } from "../data/courses";
import { courseDisplayTitleWithTrack } from "../lib/courseLabels";
import { getCourseGroups } from "../data/groups";
import { getCourseStudents } from "../data/students";

// Mock Data
const INSTRUCTOR_MOCK_ASSIGNMENTS = [
  { id: 1, title: "Chapter 1 – Double Entry Practice", dueDate: "Mar 8, 2026", submissions: 38, totalStudents: 42, status: "Grading", maxScore: 20 },
  { id: 2, title: "Balance Sheet Preparation", dueDate: "Mar 15, 2026", submissions: 12, totalStudents: 42, status: "Active", maxScore: 30 },
  { id: 3, title: "Mid-Term Paper", dueDate: "Feb 28, 2026", submissions: 42, totalStudents: 42, status: "Completed", maxScore: 50 },
];

const INSTRUCTOR_MOCK_QUIZZES = [
  { id: 101, title: "Quiz 1: Double Entry MCQ", dueDate: "Mar 5, 2026", questions: 15, timeLimit: 20, completions: 42, totalStudents: 42, status: "Completed", maxScore: 15 },
  { id: 102, title: "Quiz 2: Financial Ratios", dueDate: "Apr 8, 2026", questions: 10, timeLimit: 15, completions: 0, totalStudents: 42, status: "Active", maxScore: 10 },
];

const INSTRUCTOR_MOCK_COMMUNICATIONS = [
  { id: 1, type: "announcement", title: "Mid-Term Exam Schedule Released", message: "The mid-term examinations will begin on March 24, 2026. Please check your individual course calendars for exact times.", time: "2 hours ago", urgent: true },
  { id: 2, type: "announcement", title: "Week 4 Materials Available", message: "Week 4 lecture notes and video have been uploaded.", time: "Yesterday", urgent: false },
  { id: 3, type: "discussion", title: "Question regarding Trial Balances", message: "Can someone clarify how suspense accounts work when the trial balance doesn't match? I am stuck on question 3.", time: "5 days ago", urgent: false, author: "Kojo Manu", replies: 3 },
];

const INSTRUCTOR_MOCK_GRADES = [
  { id: 1, student: "Kojo Manu", assignment: "Mid-Term Paper", grade: 45, maxScore: 50, date: "Mar 2, 2026", needsGrading: false },
  { id: 2, student: "Sarah Osei", assignment: "Mid-Term Paper", grade: 48, maxScore: 50, date: "Mar 2, 2026", needsGrading: false },
  { id: 3, student: "Kwame Asamoah", assignment: "Mid-Term Paper", grade: 39, maxScore: 50, date: "Mar 2, 2026", needsGrading: false },
  { id: 4, student: "Ama Addo", assignment: "Chapter 1 – Double Entry Practice", grade: null, maxScore: 20, date: "Mar 8, 2026", needsGrading: true },
  { id: 5, student: "Kofi Mensah", assignment: "Chapter 1 – Double Entry Practice", grade: null, maxScore: 20, date: "Mar 8, 2026", needsGrading: true },
];

const INSTRUCTOR_MOCK_STUDENTS = [
  { id: 1, name: "Kojo Manu", email: "kojo.manu@example.com", studentId: "STD-2026-001", lastActive: "2 hours ago", status: "Active", progress: 85 },
  { id: 2, name: "Sarah Osei", email: "sarah.osei@example.com", studentId: "STD-2026-002", lastActive: "1 day ago", status: "Active", progress: 92 },
  { id: 3, name: "Kwame Asamoah", email: "kwame.asamoah@example.com", studentId: "STD-2026-003", lastActive: "3 days ago", status: "At Risk", progress: 45 },
  { id: 4, name: "Ama Addo", email: "ama.addo@example.com", studentId: "STD-2026-004", lastActive: "5 hours ago", status: "Active", progress: 78 },
  { id: 5, name: "Kofi Mensah", email: "kofi.mensah@example.com", studentId: "STD-2026-005", lastActive: "Just now", status: "Active", progress: 88 },
];

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const track = searchParams.get("track") || "All";
  const initialTab = (searchParams.get("tab") as CourseTab) || "overview";
  const courseId = Number(id);
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  
  const [activeTab, setActiveTab] = useState<CourseTab>(initialTab);
  const [openModules, setOpenModules] = useState<number[]>([1]);

  const toggleModule = (moduleId: number) => {
    setOpenModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const totalLessons = course.courseContent.reduce((sum, m) => sum + m.lessons.length, 0);
  const courseTitle = courseDisplayTitleWithTrack(course, track);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[
        { label: "Home" },
        { label: "My Courses", href: "/instructor/courses" },
        { label: courseTitle },
      ]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full items-start">
        <CourseSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          courseName={courseTitle}
          courseCode={course.code}
          backUrl="/instructor/dashboard"
          counts={{
            content: totalLessons,
            assignments: INSTRUCTOR_MOCK_ASSIGNMENTS.length,
            quizzes: INSTRUCTOR_MOCK_QUIZZES.length,
            students: INSTRUCTOR_MOCK_STUDENTS.length,
            groups: getCourseGroups(courseId, track as "Weekday" | "Weekend" | "All").length,
          }}
        />

        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Hero Header */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="relative w-full h-[160px] overflow-hidden">
              <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#d4a574] text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>{course.code}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>{course.term}</span>
                </div>
                <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#FAF8F5" }}>{courseTitle}</h1>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between border-t border-gray-100 bg-[#fafafa]">
              <div className="flex items-center gap-5">
                {[
                  { icon: Users, val: `${course.students} Students` },
                  { icon: BookOpen, val: `${course.modules} Modules` },
                  { icon: Clock, val: course.term },
                  { icon: ClipboardList, val: `${course.assignments} Assignments` },
                ].map((s) => (
                  <div key={s.val} className="flex items-center gap-1.5 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                    <s.icon size={13} />
                    <span>{s.val}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/instructor/courses/${course.id}/upload-content`)}
                  className="flex items-center gap-1.5 px-3 h-8 rounded bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                >
                  <Plus size={14} /> Add Content
                </button>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Overview                                               */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628", marginBottom: 12 }}>About This Course</h2>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", lineHeight: 1.7 }}>{course.overview}</p>

                  <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginTop: 20, marginBottom: 10 }}>What Students Learn</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {course.whatYouLearn.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#4a4a4a", lineHeight: 1.5 }}>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginTop: 20, marginBottom: 10 }}>Requirements</h3>
                  <ul className="flex flex-col gap-2">
                    {course.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574] flex-shrink-0 mt-2" />
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#4a4a4a", lineHeight: 1.5 }}>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Stats Sidebar */}
              <div className="w-[280px] flex-shrink-0 flex flex-col gap-5">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginBottom: 16 }}>Course Health</h2>
                  <div className="flex flex-col gap-4">
                    {[
                      { label: "Enrolled Students", val: course.students, total: course.students, color: "bg-[#d4a574]", unit: "" },
                      { label: "Completion Rate",   val: course.completionRate, total: 100, color: "bg-[#d4a574]", unit: "%" },
                      { label: "Avg. Grade",        val: course.avgGrade,       total: 100, color: "bg-[#d4a574]", unit: "%" },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{stat.label}</span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>
                            {stat.val}{stat.unit}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stat.color}`}
                            style={{ width: `${Math.min((stat.val / stat.total) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginBottom: 12 }}>Quick Links</h2>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: "Schedule Class", path: "/instructor/calendar", icon: Calendar },
                      { label: "Grade Book", path: "/instructor/gradebooks", icon: BookMarked },
                      { label: "Student List", path: "/instructor/students", icon: Users },
                    ].map((a) => (
                      <button
                        key={a.label}
                        onClick={() => navigate(a.path)}
                        className="flex items-center gap-2 w-full px-3 h-[38px] border border-gray-200 hover:border-[#0a1628] rounded transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628", fontWeight: 500 }}
                      >
                        <a.icon size={14} className="text-[#6c6c6c]" />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Content                                                */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "content" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Curriculum</h2>
                <button
                  onClick={() => navigate(`/instructor/courses/${course.id}/upload-content`)}
                  className="flex items-center gap-1.5 text-[#d4a574] hover:underline"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  <Plus size={14} /> Add Module
                </button>
              </div>
              <div className="flex flex-col">
                {course.courseContent.map((module) => {
                  const isOpen = openModules.includes(module.id);
                  return (
                    <div key={module.id} className="border-b border-gray-100 last:border-b-0">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#fafafa] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {isOpen ? <ChevronDown size={18} className="text-[#0a1628]" /> : <ChevronRight size={18} className="text-[#b0b0b5]" />}
                          <div className="text-left">
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>Week {module.week}: {module.title}</p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96", marginTop: 2 }}>
                              {module.lessons.length} {module.lessons.length === 1 ? "item" : "items"}
                            </p>
                          </div>
                        </div>
                        <MoreVertical size={16} className="text-[#b0b0b5]" />
                      </button>
                      {isOpen && (
                        <div className="bg-[#fcfcfc] border-t border-gray-50 py-2">
                          {module.lessons.map((lesson) => (
                            <div key={lesson.id} className="flex items-center justify-between px-10 py-2.5 hover:bg-[#f3f3f5] transition-colors group">
                              <div className="flex items-center gap-3">
                                {lesson.type === "video" ? <Play size={14} className="text-[#8e8e96]" /> : <FileText size={14} className="text-[#8e8e96]" />}
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3a3a42", fontWeight: 500 }}>{lesson.title}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96" }}>{lesson.duration}</span>
                                <button className="opacity-0 group-hover:opacity-100 text-[#8e8e96] hover:text-[#0a1628]"><PenLine size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Assignments                                            */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "assignments" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Assignments</h2>
                <button
                  onClick={() => navigate(`/instructor/courses/${course.id}/create-assignment`)}
                  className="flex items-center gap-1.5 px-3 h-8 rounded bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                >
                  <Plus size={14} /> Create Assignment
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-gray-100">
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Title</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Due Date</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Submissions</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTRUCTOR_MOCK_ASSIGNMENTS.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 hover:bg-[#fdfcfc] transition-colors">
                        <td className="px-5 py-4">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{a.title}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 4 }}>{a.maxScore} pts max</p>
                        </td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{a.dueDate}</td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>
                          <span className={a.submissions < a.totalStudents ? "text-[#d4a574] font-semibold" : ""}>{a.submissions}</span> / {a.totalStudents}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            a.status === 'Active' ? 'bg-blue-50 text-blue-600' :
                            a.status === 'Grading' ? 'bg-amber-50 text-amber-600' :
                            'bg-green-50 text-green-600'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => navigate("/instructor/gradebooks")} className="text-[#d4a574] hover:underline" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}>Grade</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Quizzes                                                */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "quizzes" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Quizzes</h2>
                <button
                  onClick={() => navigate(`/instructor/courses/${course.id}/create-quiz`)}
                  className="flex items-center gap-1.5 px-3 h-8 rounded bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                >
                  <Plus size={14} /> Create Quiz
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-gray-100">
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Title</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Due Date</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Completions</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTRUCTOR_MOCK_QUIZZES.map((q) => (
                      <tr key={q.id} className="border-b border-gray-50 hover:bg-[#fdfcfc] transition-colors">
                        <td className="px-5 py-4">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{q.title}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 4 }}>{q.questions} questions · {q.timeLimit} mins</p>
                        </td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>{q.dueDate}</td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>
                          {q.completions} / {q.totalStudents}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            q.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-[#6c6c6c]'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => navigate("/instructor/gradebooks")} className="text-[#d4a574] hover:underline" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}>Results</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Grades                                                 */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "grades" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Recent Submissions & Grades</h2>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Review latest submissions from students</p>
                </div>
                <button
                  onClick={() => navigate("/instructor/gradebooks")}
                  className="px-4 py-2 rounded border border-gray-300 text-[#0a1628] hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                >
                  Open Full Gradebook
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-gray-100">
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Student</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Assignment / Quiz</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Date</th>
                      <th className="px-5 py-3 text-[#6c6c6c] text-right" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTRUCTOR_MOCK_GRADES.map((g) => (
                      <tr key={g.id} className="border-b border-gray-50 hover:bg-[#fdfcfc] transition-colors">
                        <td className="px-5 py-4">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{g.student}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3a3a42" }}>{g.assignment}</p>
                        </td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96" }}>
                          {g.date}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {g.needsGrading ? (
                            <button onClick={() => navigate("/instructor/gradebooks")} className="px-3 py-1 rounded bg-[#d4a574]/10 text-[#d4a574] hover:bg-[#d4a574]/20 transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600 }}>
                              Grade Now
                            </button>
                          ) : (
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                              {g.grade} / {g.maxScore}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Students                                               */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "students" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Enrolled Students</h2>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Manage students enrolled in this course</p>
                </div>
                <button
                  onClick={() => navigate("/instructor/students")}
                  className="flex items-center gap-1.5 px-3 h-8 rounded bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                >
                  <Plus size={14} /> Add Student
                </button>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#fafafa] border-b border-gray-100">
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Student Name</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Student ID</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Progress</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Last Active</th>
                      <th className="px-5 py-3 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, textTransform: "uppercase" }}>Status</th>
                      <th className="px-5 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSTRUCTOR_MOCK_STUDENTS.map((s) => (
                      <tr key={s.id} className="border-b border-gray-50 hover:bg-[#fdfcfc] transition-colors">
                        <td className="px-5 py-4">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{s.name}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 4 }}>{s.email}</p>
                        </td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#0a1628" }}>
                          {s.studentId}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${s.progress < 50 ? 'bg-red-400' : 'bg-[#d4a574]'}`} style={{ width: `${s.progress}%` }} />
                            </div>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#0a1628", fontWeight: 500 }}>{s.progress}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96" }}>
                          {s.lastActive}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                            s.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => navigate("/instructor/communications")} className="text-[#6c6c6c] hover:text-[#0a1628] p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                            <MessageCircle size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Groups                                                 */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "groups" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <GroupsTab
                courseId={courseId}
                track={track as "Weekday" | "Weekend" | "All"}
                students={getCourseStudents(courseId, track as "Weekday" | "Weekend" | "All").map((s) => ({
                  id: s.id,
                  name: s.name,
                  initials: s.initials,
                  cohort: (track === "Weekend" ? "Weekend" : "Weekday") as "Weekday" | "Weekend",
                }))}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Announcements                                          */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "announcements" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Announcements</h2>
                <button
                  onClick={() => navigate("/instructor/communications")}
                  className="flex items-center gap-1.5 px-3 h-8 rounded bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                >
                  <Plus size={14} /> New Announcement
                </button>
              </div>

              {INSTRUCTOR_MOCK_COMMUNICATIONS.filter((c) => c.type === "announcement").map((c) => (
                <div
                  key={c.id}
                  className={`bg-white rounded-xl border ${c.urgent ? "border-[#d4a574]" : "border-gray-200"} p-5 flex gap-4 relative overflow-hidden`}
                >
                  {c.urgent && <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#d4a574]" />}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[rgba(212,165,116,0.15)] text-[#d4a574]">
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>{c.title}</p>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96" }}>{c.time}</span>
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#4a4a4a", lineHeight: 1.5, marginBottom: 12 }}>{c.message}</p>
                    <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-[#6c6c6c]">
                      announcement
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Discussions                                            */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "discussions" && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Discussions</h2>
              </div>

              {INSTRUCTOR_MOCK_COMMUNICATIONS.filter((c) => c.type === "discussion").map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex gap-4 relative overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-500">
                    <MessageCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>{c.title}</p>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96" }}>{c.time}</span>
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#4a4a4a", lineHeight: 1.5, marginBottom: 12 }}>{c.message}</p>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-[#6c6c6c]">
                        discussion
                      </span>
                      {c.author && <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>By {c.author}</span>}
                      {c.replies !== undefined && (
                        <span className="flex items-center gap-1 text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600 }}>
                          <MessageCircle size={12} /> {c.replies} Replies
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex items-center justify-between mt-auto">
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
