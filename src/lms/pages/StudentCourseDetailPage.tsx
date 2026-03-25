import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Play,
  FileText,
  Link as LinkIcon,
  Download,
  Clock,
  CheckCircle,
  X,
  ClipboardList,
  Upload,
  Check,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  MessageCircle,
  Bell,
  User,
  Users2,
  Crown,
  LogIn,
  Shield,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { CourseSidebar, CourseTab } from "../components/CourseSidebar";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort } from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";
import { useLMS } from "../context/LMSContext";
import { getCourseGroups, findStudentGroup, type Group } from "../data/groups";

// ─── Assignment / Quiz Types ────────────────────────────────────────────────

type WorkStatus = "Not Started" | "In Progress" | "Submitted" | "Graded";
type SubmissionType = "file" | "text";

interface CourseAssignment {
  id: number;
  title: string;
  instructions: string;
  dueDate: string;
  maxPoints: number;
  submissionType: SubmissionType;
  status: WorkStatus;
  week?: number;
  grade?: number;
  feedback?: string;
  submittedAt?: string;
  fileName?: string;
}

interface CourseQuiz {
  id: number;
  title: string;
  description: string;
  questions: number;
  duration: string;
  dueDate: string;
  maxPoints: number;
  status: WorkStatus;
  week?: number;
  grade?: number;
  feedback?: string;
  attempts?: number;
  maxAttempts?: number;
  submittedAt?: string;
}

// ─── Per-course mock data ───────────────────────────────────────────────────

const COURSE_ASSIGNMENTS: Record<number, CourseAssignment[]> = {
  1: [
    { id: 101, title: "Essay on Financial Statements", instructions: "Write a comprehensive essay (1500-2000 words) discussing the importance of financial statements in business decision-making. Include real-world examples and reference at least 3 accounting standards.", dueDate: "Mar 15, 2026", maxPoints: 100, submissionType: "file", status: "Not Started", week: 4 },
    { id: 102, title: "Journal Entries Practice Set", instructions: "Complete the 25-question practice set covering debits, credits, and ledger postings. Show all workings clearly.", dueDate: "Mar 22, 2026", maxPoints: 50, submissionType: "file", status: "In Progress", week: 2 },
    { id: 103, title: "Double Entry Practice Set", instructions: "Complete the attached practice set covering journal entries, T-accounts, and trial balance preparation.", dueDate: "Mar 5, 2026", maxPoints: 50, submissionType: "file", status: "Graded", week: 2, grade: 45, feedback: "Excellent work! Your journal entries were accurate and well-presented. Minor error in the trial balance totals.", submittedAt: "Mar 4, 2026", fileName: "DoubleEntry_KojoManu.pdf" },
    { id: 104, title: "Accounting Equation Worksheet", instructions: "Complete the worksheet identifying assets, liabilities, and equity for 15 given transactions.", dueDate: "Feb 20, 2026", maxPoints: 30, submissionType: "file", status: "Graded", week: 1, grade: 28, feedback: "Well done. All classifications were correct.", submittedAt: "Feb 19, 2026", fileName: "AccEq_KojoManu.pdf" },
    { id: 105, title: "Trial Balance Reconciliation", instructions: "Identify and correct the 8 errors in the given trial balance. Prepare a suspense account and corrected trial balance.", dueDate: "Feb 28, 2026", maxPoints: 40, submissionType: "file", status: "Submitted", week: 3, submittedAt: "Feb 27, 2026", fileName: "TrialBalance_KojoManu.pdf" },
  ],
  2: [
    { id: 201, title: "Partnership Dissolution Exercise", instructions: "Complete the partnership dissolution workings for the given scenario. Show all journal entries, realisation account, and partner capital accounts.", dueDate: "Mar 22, 2026", maxPoints: 60, submissionType: "file", status: "Not Started", week: 2 },
    { id: 202, title: "Company Accounts Exercise", instructions: "Prepare a full set of company accounts including statement of financial position and income statement for the given trial balance.", dueDate: "Feb 22, 2026", maxPoints: 60, submissionType: "file", status: "Graded", week: 1, grade: 52, feedback: "Good understanding of share capital and reserves. Review the treatment of inter-company balances.", submittedAt: "Feb 22, 2026", fileName: "CompanyAccounts_KojoManu.pdf" },
  ],
  3: [
    { id: 301, title: "Case Study: Cost Analysis", instructions: "Analyse the cost structure of the given manufacturing company. Identify fixed and variable costs, compute break-even point, and recommend cost reduction strategies.", dueDate: "Mar 18, 2026", maxPoints: 80, submissionType: "text", status: "In Progress", week: 2 },
    { id: 302, title: "Budget Preparation Exercise", instructions: "Prepare a master budget for the given scenario including sales budget, production budget, and cash budget.", dueDate: "Mar 1, 2026", maxPoints: 70, submissionType: "file", status: "Submitted", week: 3, submittedAt: "Feb 28, 2026", fileName: "MasterBudget_KojoManu.pdf" },
    { id: 303, title: "Cost Classification Worksheet", instructions: "Classify the 20 cost items as fixed, variable, semi-variable, direct, or indirect.", dueDate: "Feb 15, 2026", maxPoints: 25, submissionType: "file", status: "Graded", week: 1, grade: 23, feedback: "Excellent classification. Only 1 item was incorrectly classified.", submittedAt: "Feb 14, 2026", fileName: "CostClass_KojoManu.pdf" },
  ],
};

const COURSE_QUIZZES: Record<number, CourseQuiz[]> = {
  1: [
    { id: 1001, title: "Week 3: Trial Balance Concepts", description: "Test your understanding of trial balance preparation, errors, and corrections.", questions: 15, duration: "25 min", dueDate: "Mar 20, 2026", maxPoints: 15, status: "Not Started", week: 3 },
    { id: 1002, title: "Week 2: Double Entry Quiz", description: "Multiple choice and short-answer questions on debits, credits, and journal entries.", questions: 10, duration: "20 min", dueDate: "Mar 8, 2026", maxPoints: 10, status: "Graded", week: 2, grade: 8, attempts: 1, maxAttempts: 2, submittedAt: "Mar 7, 2026" },
    { id: 1003, title: "Week 1: Accounting Principles", description: "Foundation quiz covering accounting concepts, the accounting equation, and GAAP.", questions: 10, duration: "15 min", dueDate: "Feb 22, 2026", maxPoints: 10, status: "Graded", week: 1, grade: 9, attempts: 1, maxAttempts: 2, submittedAt: "Feb 21, 2026" },
  ],
  2: [
    { id: 2001, title: "Week 2: Partnership Accounts", description: "Questions on partnership formation, profit sharing, and goodwill treatment.", questions: 12, duration: "20 min", dueDate: "Mar 18, 2026", maxPoints: 12, status: "Not Started", week: 2 },
    { id: 2002, title: "Week 1: Company Accounts Basics", description: "Quiz on share capital, reserves, and basic company account structures.", questions: 10, duration: "15 min", dueDate: "Feb 25, 2026", maxPoints: 10, status: "Graded", week: 1, grade: 7, attempts: 2, maxAttempts: 2, submittedAt: "Feb 24, 2026" },
  ],
  3: [
    { id: 3001, title: "Week 2: Costing Methods Quiz", description: "Test your knowledge of absorption costing vs marginal costing with practical examples.", questions: 12, duration: "20 min", dueDate: "Mar 15, 2026", maxPoints: 12, status: "Not Started", week: 2 },
    { id: 3002, title: "Week 1: Cost Classification", description: "Quick quiz on classifying costs as fixed, variable, direct, and indirect.", questions: 10, duration: "15 min", dueDate: "Feb 20, 2026", maxPoints: 10, status: "Graded", week: 1, grade: 7, attempts: 1, maxAttempts: 2, submittedAt: "Feb 19, 2026" },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const isActive = (s: WorkStatus) => s === "Not Started" || s === "In Progress";
const isHistory = (s: WorkStatus) => s === "Submitted" || s === "Graded";

// ─── Component ─────────────────────────���────────────────────────────────────

export function StudentCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { modules } = useLMS();
  const courseId = Number(id);
  const course = COURSES.find((c) => c.id === courseId);
  const enrolledCohort = course ? getStudentEnrollmentCohort(course.id) : "All";
  const courseTitle = course ? studentCourseTitle(course, enrolledCohort) : "";
  const courseModules = modules
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const [expandedModules, setExpandedModules] = useState<string[]>(
    courseModules.length > 0 ? [courseModules[0].id] : []
  );
  const [activeTab, setActiveTab] = useState<CourseTab>("overview");
  const [viewingItem, setViewingItem] = useState<{ type: string; title: string; url?: string } | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  // Assignment detail state
  const [selectedAssignment, setSelectedAssignment] = useState<CourseAssignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Quiz detail state
  const [selectedQuiz, setSelectedQuiz] = useState<CourseQuiz | null>(null);

  // Groups
  const DEMO_STUDENT_ID = 7; // Kojo Manu
  const cohort = getStudentEnrollmentCohort(courseId) ?? "All";
  const courseGroups = getCourseGroups(courseId, cohort as "Weekday" | "Weekend" | "All");
  const [myGroup, setMyGroup] = useState<Group | null | undefined>(
    () => findStudentGroup(DEMO_STUDENT_ID, courseId, cohort as "Weekday" | "Weekend" | "All") ?? null
  );
  const handleJoinGroup = (group: Group) => setMyGroup(group);

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
        <p style={{ fontFamily: "Inter, sans-serif", color: "#6c6c6c" }}>Course not found.</p>
      </div>
    );
  }

  const assignments = COURSE_ASSIGNMENTS[courseId] || [];
  const quizzes = COURSE_QUIZZES[courseId] || [];
  const activeAssignments = assignments.filter((a) => isActive(a.status));
  const historyAssignments = assignments.filter((a) => isHistory(a.status));
  const activeQuizzes = quizzes.filter((q) => isActive(q.status));
  const historyQuizzes = quizzes.filter((q) => isHistory(q.status));

  const toggleModule = (id: string) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const totalItems = courseModules.reduce((s, m) => s + m.items.length, 0);
  const completedCount = courseModules.reduce(
    (s, m) => s + m.items.filter((it) => completed.has(it.id)).length, 0
  );

  const markComplete = (itemId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case "video": return <Play size={14} className="text-[#d4a574]" />;
      case "pdf": return <FileText size={14} className="text-[#d4a574]" />;
      case "link": return <LinkIcon size={14} className="text-[#d4a574]" />;
      default: return <BookOpen size={14} className="text-[#d4a574]" />;
    }
  };

  const handleSubmitAssignment = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setJustSubmitted(true);
      setShowSubmitConfirm(false);
    }, 1400);
  };

  const closeAssignmentDetail = () => {
    setSelectedAssignment(null);
    setSubmissionText("");
    setUploadedFile(null);
    setShowSubmitConfirm(false);
    setJustSubmitted(false);
  };

  // ─── Tab config ─────────────────────────────────────────────────────────

  const tabs = [
    { key: "content" as const, label: "Content", count: totalItems },
    { key: "assignments" as const, label: "Assignments", count: assignments.length },
    { key: "quizzes" as const, label: "Quizzes", count: quizzes.length },
    { key: "overview" as const, label: "Overview" },
  ];

  // ─── Status badge helper ────────────────────────────���──────────────────

  const statusStyle = (s: WorkStatus): string => {
    switch (s) {
      case "Graded":      return "bg-[#e8e8ea] text-[#3a3a42]";
      case "Submitted":   return "bg-[#e8e8ea] text-[#6c6c6c]";
      case "In Progress": return "bg-[#f0ece6] text-[#a68b5b]";
      default:            return "bg-[#f3f3f5] text-[#8e8e96]";
    }
  };

  const statusLabel = (s: WorkStatus, grade?: number, max?: number): string => {
    if (s === "Graded" && grade !== undefined) return `${grade}/${max}`;
    return s;
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses" }, { label: courseTitle }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full items-start">
        <CourseSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          courseName={courseTitle}
          courseCode={course.code}
          backUrl="/student/courses"
          hideItems={["students"]}
          counts={{
            content: totalItems,
            assignments: assignments.length,
            quizzes: quizzes.length,
            groups: courseGroups.length,
          }}
        />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* ─── Course Header ─────────────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="relative w-full h-[160px] overflow-hidden">
              <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/70 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#d4a574] text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>{course.code}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>{course.term}</span>
                  <span className="px-2 py-0.5 rounded-full bg-black/40 text-white border border-white/20" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>
                    {enrolledCohort} Track
                  </span>
                </div>
                <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#FAF8F5" }}>{courseTitle}</h1>
              </div>
            </div>

            <div className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <span className="flex items-center gap-1.5 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  <BookOpen size={14} /> {courseModules.length} weeks
                </span>
                <span className="flex items-center gap-1.5 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  <ClipboardList size={14} /> {assignments.length} assignments
                </span>
                <span className="flex items-center gap-1.5 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  <HelpCircle size={14} /> {quizzes.length} quizzes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#d4a574" }}>
                  {totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0}%
                </span>
                <div className="w-24 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-[#d4a574] rounded-full" style={{ width: `${totalItems > 0 ? (completedCount / totalItems) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Tabs ──────────────────────────────────────────────────── */}
          <div className="hidden">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2.5 transition-colors relative ${
                  activeTab === tab.key
                    ? "text-[#0a1628]"
                    : "text-[#8e8e96] hover:text-[#5a5a62]"
                }`}
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: activeTab === tab.key ? 600 : 400 }}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className="ml-1.5"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 400, color: "#b0b0b5" }}
                  >
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0a1628] rounded-t" />
                )}
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Content                                                */}
          {/* ══════════════════════════════════════════════��═════════════ */}
          {activeTab === "content" && (
            <div className="flex flex-col gap-3">
              {courseModules.map((mod) => {
                const isExp = expandedModules.includes(mod.id);
                const modDone = mod.items.filter((it) => completed.has(it.id)).length;
                return (
                  <div key={mod.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#fafafa] transition-colors"
                    >
                      {isExp ? <ChevronDown size={16} className="text-[#0a1628]" /> : <ChevronRight size={16} className="text-[#b0b0b5]" />}
                      <div className="flex-1">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>Week {mod.order}: {mod.title}</p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>{mod.items.length} items · {modDone}/{mod.items.length} completed</p>
                      </div>
                      <div className="w-12 bg-[#ebebee] rounded-full h-1 overflow-hidden">
                        <div className="h-full bg-[#d4a574] rounded-full" style={{ width: `${mod.items.length > 0 ? (modDone / mod.items.length) * 100 : 0}%` }} />
                      </div>
                    </button>
                    {isExp && (
                      <div className="border-t border-[#ededf0] divide-y divide-[#f5f5f7]">
                        {mod.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[#fafafb] transition-colors">
                            <button
                              onClick={() => markComplete(item.id)}
                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${completed.has(item.id) ? "bg-[#d4a574] border-[#d4a574]" : "border-[#cdcdd2] hover:border-[#d4a574]"}`}
                            >
                              {completed.has(item.id) && <Check size={10} className="text-white" />}
                            </button>
                            <div className="w-8 h-8 rounded-lg bg-[#f3f3f5] flex items-center justify-center flex-shrink-0">
                              {getItemIcon(item.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: completed.has(item.id) ? "#b0b0b5" : "#0a1628", textDecoration: completed.has(item.id) ? "line-through" : "none" }}>
                                {item.title}
                              </p>
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b5", textTransform: "capitalize" }}>{item.type}</p>
                            </div>
                            <button
                              onClick={() => setViewingItem({ type: item.type, title: item.title, url: item.url })}
                              className="px-3 py-1 rounded-md bg-[#f3f3f5] text-[#3a3a42] hover:bg-[#e8e8ea] transition-colors"
                              style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}
                            >
                              {item.type === "video" ? "Watch" : item.type === "pdf" ? "View" : "Open"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {courseModules.length === 0 && <EmptyState icon={<BookOpen size={28} className="text-[#cdcdd2]" />} title="No content yet" subtitle="Your instructor hasn't uploaded content for this course yet." />}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Assignments                                            */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "assignments" && (
            <div className="flex flex-col gap-6">
              {/* Active */}
              <WorkSection
                label="Active"
                count={activeAssignments.length}
                emptyText="No active assignments right now."
              >
                {activeAssignments.map((a) => (
                  <AssignmentRow key={a.id} a={a} onClick={() => setSelectedAssignment(a)} statusStyle={statusStyle} statusLabel={statusLabel} />
                ))}
              </WorkSection>

              {/* Past */}
              <WorkSection
                label="Past"
                count={historyAssignments.length}
                emptyText="No past assignments yet."
                defaultCollapsed
              >
                {historyAssignments.map((a) => (
                  <AssignmentRow key={a.id} a={a} onClick={() => setSelectedAssignment(a)} statusStyle={statusStyle} statusLabel={statusLabel} />
                ))}
              </WorkSection>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Quizzes                                                */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "quizzes" && (
            <div className="flex flex-col gap-6">
              {/* Active */}
              <WorkSection
                label="Active"
                count={activeQuizzes.length}
                emptyText="No active quizzes right now."
              >
                {activeQuizzes.map((q) => (
                  <QuizRow key={q.id} q={q} onClick={() => setSelectedQuiz(q)} statusStyle={statusStyle} statusLabel={statusLabel} />
                ))}
              </WorkSection>

              {/* Past */}
              <WorkSection
                label="Past"
                count={historyQuizzes.length}
                emptyText="No past quizzes yet."
                defaultCollapsed
              >
                {historyQuizzes.map((q) => (
                  <QuizRow key={q.id} q={q} onClick={() => setSelectedQuiz(q)} statusStyle={statusStyle} statusLabel={statusLabel} />
                ))}
              </WorkSection>
            </div>
          )}

          {/* ═════════════════════════════════════════════════════════��══ */}
          {/* TAB: Grades                                                 */}
          {/* ═════════════════════════════════════════════════════��══════ */}
          {activeTab === "grades" && (() => {
            const courseGrades = [
              ...assignments.filter((a) => !isActive(a.status)).map((a) => ({ id: `a-${a.id}`, item: a, assignment: a.title, type: "Assignment", grade: a.grade ?? null, maxPoints: a.maxPoints, status: a.status, date: a.dueDate, feedback: a.feedback })),
              ...quizzes.filter((q) => !isActive(q.status)).map((q) => ({ id: `q-${q.id}`, item: q, assignment: q.title, type: "Quiz", grade: q.grade ?? null, maxPoints: q.maxPoints, status: q.status, date: q.dueDate, feedback: q.feedback }))
            ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const gradedItems = courseGrades.filter((g) => g.status === "Graded" && g.grade !== null);
            const totalEarned = gradedItems.reduce((s, g) => s + (g.grade || 0), 0);
            const totalPossible = gradedItems.reduce((s, g) => s + g.maxPoints, 0);
            const overallPercent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

            return (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#d4a574" }}>{overallPercent}%</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Course Average</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#0a1628" }}>{gradedItems.length}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Graded Items</p>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#0a1628" }}>
                      {courseGrades.filter((g) => g.status === "Submitted").length}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Awaiting Grade</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {courseGrades.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-[#f8f8f9] border-b border-gray-100">
                          {["Item", "Type", "Grade", "Status", "Feedback"].map((h) => (
                            <th key={h} className="px-4 py-3 text-left" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {courseGrades.map((g) => (
                          <tr 
                            key={g.id} 
                            className="border-b border-gray-50 hover:bg-[#fafafa] transition-colors cursor-pointer"
                            onClick={() => {
                              if (g.type === "Assignment") setSelectedAssignment(g.item as CourseAssignment);
                              else setSelectedQuiz(g.item as CourseQuiz);
                            }}
                          >
                            <td className="px-4 py-3">
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>{g.assignment}</p>
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>{g.date}</p>
                            </td>
                            <td className="px-4 py-3">
                              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>{g.type}</span>
                            </td>
                            <td className="px-4 py-3">
                              {g.grade !== null ? (
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                                  {g.grade}/{g.maxPoints}
                                </span>
                              ) : (
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#8e8e96" }}>—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                  g.status === "Graded" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                                }`}
                              >
                                {g.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {g.feedback ? (
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                  {g.feedback}
                                </p>
                              ) : (
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b5" }}>No feedback yet</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c" }}>No graded items yet.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Communications                                         */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "communications" && (() => {
            const courseCommunications = [
              { id: 1, type: "announcement", title: "Mid-Term Exam Schedule Released", message: `The mid-term examinations for ${courseTitle} will begin on March 24, 2026. Please check your individual course calendars for exact times.`, time: "2 hours ago", urgent: true, author: course.instructor },
              { id: 2, type: "announcement", title: "Week 4 Materials Available", message: "Week 4 lecture notes and video have been uploaded.", time: "Yesterday", urgent: false, author: course.instructor },
              { id: 3, type: "discussion", title: "Question regarding Trial Balances", message: "Can someone clarify how suspense accounts work when the trial balance doesn't match? I am stuck on question 3.", time: "5 days ago", urgent: false, author: "Kojo Manu", replies: 3 },
              { id: 4, type: "announcement", title: "Assignment Deadline Extended", message: "The Case Study assignment has been extended to March 15. Please ensure you submit by the new deadline.", time: "Last week", urgent: false, author: course.instructor },
              { id: 5, type: "discussion", title: "Study group for upcoming quiz", message: "Anyone want to form a study group for the weekend cohort? We can meet via Zoom on Friday evenings.", time: "Last week", urgent: false, author: "Sarah Osei", replies: 8 },
            ];
            
            return (
              <div className="flex flex-col gap-6">
                {/* Urgent Announcements Banner (similar to dashboard) */}
                {courseCommunications.filter(c => c.urgent).length > 0 && (
                  <div className="flex flex-col gap-3">
                    {courseCommunications.filter(c => c.urgent).map(c => (
                      <div key={`urgent-${c.id}`} className="bg-[rgba(212,165,116,0.1)] border border-[rgba(212,165,116,0.3)] rounded-xl px-5 py-4 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#d4a574] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bell size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{c.title}</p>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#d4a574", fontWeight: 600, whiteSpace: "nowrap" }}>{c.time}</span>
                          </div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", lineHeight: 1.5, marginBottom: 8 }}>{c.message}</p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[rgba(212,165,116,0.2)] text-[#b58753]">Announcement</span>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", fontWeight: 500 }}>Posted by {c.author === "Kojo Manu" ? "You" : c.author}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628" }}>Recent Activity</h2>
                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-lg border border-gray-200 text-[#0a1628] hover:bg-gray-50 transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500 }}>
                        Filter: All
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-[#0a1628] text-white hover:bg-[#0a1628]/90 transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500 }}>
                        New Discussion
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {courseCommunications.filter(c => !c.urgent).map((item) => (
                      <div key={item.id} className="flex items-start gap-4 p-4 rounded-xl bg-[#f8f8f9] hover:bg-[#f2f2f4] transition-colors cursor-pointer border border-transparent hover:border-gray-200">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'announcement' ? 'bg-[rgba(212,165,116,0.15)]' : 'bg-gray-200'}`}>
                          {item.type === 'announcement' ? <Bell size={16} className="text-[#d4a574]" /> : <MessageCircle size={16} className="text-gray-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }} className="truncate pr-4">{item.title}</p>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", whiteSpace: "nowrap" }}>{item.time}</span>
                          </div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", lineHeight: 1.5, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.message}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${item.type === 'announcement' ? 'bg-[rgba(212,165,116,0.15)] text-[#d4a574]' : 'bg-gray-200 text-gray-700'}`}>
                              {item.type}
                            </span>
                            <span className="flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", fontWeight: 500 }}>
                              <User size={12} /> {item.author === "Kojo Manu" ? "You" : item.author}
                            </span>
                            {item.type === 'discussion' && item.replies !== undefined && (
                              <span className="flex items-center gap-1.5" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", fontWeight: 500 }}>
                                <MessageCircle size={12} /> {item.replies} {item.replies === 1 ? 'reply' : 'replies'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Groups                                                 */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "groups" && (
            <div className="flex flex-col gap-4">
              {/* My group card */}
              {myGroup ? (
                <div className="bg-white rounded-xl border border-[#ededf0] overflow-hidden">
                  <div className="px-5 py-3.5 bg-[#fafafa] border-b border-[#f3f3f5] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0a1628]/8 flex items-center justify-center">
                      <Users2 size={14} className="text-[#0a1628]" />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{myGroup.name}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96" }}>Your group</p>
                    </div>
                    {myGroup.leaderId === DEMO_STUDENT_ID && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fdf3e7] border border-[#d4a574]/40 text-[#a68b5b]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>
                        <Crown size={11} /> Group Leader
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                      Members · {myGroup.members.length}/{myGroup.maxSize}
                    </p>
                    <div className="flex flex-col gap-2.5">
                      {myGroup.members.map((m) => {
                        const isLeader = myGroup.leaderId === m.studentId;
                        const isMe = m.studentId === DEMO_STUDENT_ID;
                        return (
                          <div key={m.studentId} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isLeader ? "bg-[#d4a574]" : "bg-[#0a1628]"} text-white`}
                              style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 700 }}>
                              {m.initials}
                            </div>
                            <div className="flex-1">
                              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                                {m.name}{isMe ? " (You)" : ""}
                              </p>
                              {isLeader && (
                                <p className="flex items-center gap-1" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#a68b5b" }}>
                                  <Crown size={10} /> Group Leader — submits assignments for the group
                                </p>
                              )}
                            </div>
                            {!isLeader && !myGroup.leaderId && isMe && (
                              <button
                                onClick={() => setMyGroup({ ...myGroup, leaderId: DEMO_STUDENT_ID })}
                                className="px-3 py-1 rounded-lg border border-[#d4a574]/40 text-[#a68b5b] hover:bg-[#fdf3e7] transition-colors"
                                style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600 }}
                              >
                                Claim Leadership
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {!myGroup.leaderId && (
                      <div className="mt-4 px-4 py-3 rounded-lg bg-[#fdf3e7] border border-[#d4a574]/30">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#a68b5b" }}>
                          No group leader assigned yet. A leader is responsible for submitting group assignments.
                          Click <strong>Claim Leadership</strong> next to your name above.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* No group yet — show available groups to join */
                <div className="bg-white rounded-xl border border-[#ededf0] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <LogIn size={18} className="text-[#0a1628]" />
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>Join a Group</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96", marginTop: 1 }}>
                        Your instructor has opened groups for self-enrollment. Join an open group below.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {courseGroups.filter(g => g.status !== "locked" && g.members.length < g.maxSize).map(g => (
                      <div key={g.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#ededf0] bg-[#fafafa]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#0a1628]/8 flex items-center justify-center">
                            <Users2 size={14} className="text-[#0a1628]" />
                          </div>
                          <div>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{g.name}</p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96" }}>
                              {g.members.length}/{g.maxSize} members · {g.maxSize - g.members.length} spot{g.maxSize - g.members.length !== 1 ? "s" : ""} left
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleJoinGroup(g)}
                          className="px-4 py-1.5 rounded-lg bg-[#0a1628] text-white hover:bg-[#1a2a42] transition-colors"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                        >
                          Join
                        </button>
                      </div>
                    ))}
                    {courseGroups.filter(g => g.status !== "locked" && g.members.length < g.maxSize).length === 0 && (
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#8e8e96" }}>
                        All groups are currently full or locked. Contact your instructor.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* All groups overview */}
              {myGroup && courseGroups.length > 1 && (
                <div className="bg-white rounded-xl border border-[#ededf0] px-5 py-4">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#0a1628", marginBottom: 12 }}>
                    All Groups in this Course
                  </p>
                  <div className="flex flex-col gap-2">
                    {courseGroups.map(g => (
                      <div key={g.id} className={`flex items-center justify-between px-3 py-2 rounded-lg ${g.id === myGroup.id ? "bg-[#fdf3e7] border border-[#d4a574]/30" : "bg-[#fafafa]"}`}>
                        <div className="flex items-center gap-2">
                          <Users2 size={13} className={g.id === myGroup.id ? "text-[#a68b5b]" : "text-[#8e8e96]"} />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: g.id === myGroup.id ? 600 : 400, color: "#0a1628" }}>
                            {g.name}{g.id === myGroup.id ? " (You)" : ""}
                          </span>
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96" }}>
                          {g.members.length}/{g.maxSize}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════ */}
          {/* TAB: Overview                                               */}
          {/* ════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628", marginBottom: 12 }}>About This Course</h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", lineHeight: 1.7 }}>{course.overview}</p>

              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginTop: 20, marginBottom: 10 }}>What You'll Learn</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {course.whatYouLearn.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} className="text-[#d4a574] mt-0.5 flex-shrink-0" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginTop: 20, marginBottom: 10 }}>Requirements</h3>
              <ul className="flex flex-col gap-1.5">
                {course.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cdcdd2] mt-1.5 flex-shrink-0" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5 }}>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>

      {/* ─── Content Viewer Modal ──────────────────────────────────────── */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[700px] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#ededf0]">
              <div className="flex items-center gap-2">
                {getItemIcon(viewingItem.type)}
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>{viewingItem.title}</p>
              </div>
              <button onClick={() => setViewingItem(null)} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
            </div>
            <div className="p-6">
              {viewingItem.type === "video" ? (
                <div className="w-full aspect-video bg-[#0a1628] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-[#d4a574] flex items-center justify-center mx-auto mb-3 cursor-pointer hover:scale-110 transition-transform">
                      <Play size={28} className="text-white ml-1" />
                    </div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#faf8f5", fontWeight: 500 }}>{viewingItem.title}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#faf8f5", opacity: 0.6, marginTop: 4 }}>Click to play lecture video</p>
                  </div>
                </div>
              ) : viewingItem.type === "pdf" ? (
                <div className="w-full h-[400px] bg-[#f8f8f9] rounded-xl flex flex-col items-center justify-center">
                  <FileText size={48} className="text-[#d4a574] mb-3" />
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>{viewingItem.title}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>PDF document preview</p>
                  <button className="mt-4 px-4 py-2 rounded-lg bg-[#0a1628] text-[#faf8f5] flex items-center gap-2 hover:bg-[#0d1e35] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}>
                    <Download size={14} /> Download PDF
                  </button>
                </div>
              ) : (
                <div className="w-full h-[300px] bg-[#f8f8f9] rounded-xl flex flex-col items-center justify-center">
                  <LinkIcon size={48} className="text-[#d4a574] mb-3" />
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>External Link</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>This will open in a new tab</p>
                  <button className="mt-4 px-4 py-2 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}>Open Link</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Assignment Detail Modal ───────────────────────────────────── */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0] sticky top-0 bg-white z-10">
              <div className="flex-1 min-w-0 pr-4">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>{selectedAssignment.title}</p>
                {selectedAssignment.week && (
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>Week {selectedAssignment.week}</p>
                )}
              </div>
              <button onClick={closeAssignmentDetail} className="text-[#8e8e96] hover:text-[#0a1628] flex-shrink-0"><X size={18} /></button>
            </div>

            <div className="px-6 py-5">
              {justSubmitted ? (
                /* Success state */
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-[#3a3a42]" />
                  </div>
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628" }}>Submitted</h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
                    Your assignment has been submitted. Your instructor will be notified.
                  </p>
                  <button onClick={closeAssignmentDetail} className="mt-6 px-5 py-2 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}>
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Meta row */}
                  <div className="flex flex-wrap items-center gap-3 mb-5">
                    <span className={`px-2 py-1 rounded-md ${statusStyle(selectedAssignment.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
                      {statusLabel(selectedAssignment.status, selectedAssignment.grade, selectedAssignment.maxPoints)}
                    </span>
                    <span className="flex items-center gap-1 text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                      <Clock size={12} /> Due {selectedAssignment.dueDate}
                    </span>
                    <span className="text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                      {selectedAssignment.maxPoints} pts
                    </span>
                  </div>

                  {/* Instructions */}
                  <div className="mb-5">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Instructions</p>
                    <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0]">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3a3a42", lineHeight: 1.7 }}>{selectedAssignment.instructions}</p>
                    </div>
                  </div>

                  {/* Graded — feedback */}
                  {selectedAssignment.status === "Graded" && (
                    <div className="mb-5">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Result</p>
                      <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0]">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a1628" }}>
                            {selectedAssignment.grade}
                          </span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#8e8e96" }}>
                            / {selectedAssignment.maxPoints}
                          </span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b5", marginLeft: 4 }}>
                            ({Math.round(((selectedAssignment.grade || 0) / selectedAssignment.maxPoints) * 100)}%)
                          </span>
                        </div>
                        {selectedAssignment.feedback && (
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62", lineHeight: 1.6 }}>
                            {selectedAssignment.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submitted file */}
                  {(selectedAssignment.status === "Submitted" || selectedAssignment.status === "Graded") && selectedAssignment.fileName && (
                    <div className="mb-5">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Your Submission</p>
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fafafb] border border-[#ededf0]">
                        <FileText size={16} className="text-[#8e8e96]" />
                        <div className="flex-1 min-w-0">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#3a3a42" }}>{selectedAssignment.fileName}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b5" }}>Submitted {selectedAssignment.submittedAt}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission area (active only) */}
                  {isActive(selectedAssignment.status) && (
                    <>
                      <div className="mb-5">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Your Submission</p>
                        {selectedAssignment.submissionType === "file" ? (
                          <div
                            className="border-2 border-dashed border-[#dcdce0] rounded-xl p-6 text-center hover:border-[#b0b0b5] transition-colors cursor-pointer bg-[#fafafb]"
                            onClick={() => setUploadedFile("MyAssignment.pdf")}
                          >
                            {uploadedFile ? (
                              <div className="flex items-center gap-3 justify-center">
                                <FileText size={18} className="text-[#6c6c6c]" />
                                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>{uploadedFile}</span>
                                <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-[#8e8e96] hover:text-[#3a3a42]"><X size={14} /></button>
                              </div>
                            ) : (
                              <>
                                <Upload size={24} className="mx-auto mb-2 text-[#cdcdd2]" />
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#5a5a62" }}>Click to upload your file</p>
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b5", marginTop: 4 }}>PDF, DOCX, or images up to 10MB</p>
                              </>
                            )}
                          </div>
                        ) : (
                          <textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            placeholder="Type your response here..."
                            rows={7}
                            className="w-full px-4 py-3 border border-[#dcdce0] rounded-xl bg-[#fafafb] text-[#0a1628] placeholder-[#b0b0b5] outline-none focus:border-[#8e8e96] focus:ring-1 focus:ring-[#e2e2e5] transition-all resize-none"
                            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.6 }}
                          />
                        )}
                      </div>

                      <button
                        onClick={() => setShowSubmitConfirm(true)}
                        disabled={selectedAssignment.submissionType === "file" ? !uploadedFile : !submissionText}
                        className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors disabled:opacity-30"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                      >
                        Submit Assignment
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirm */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 text-center">
            <div className="w-11 h-11 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={18} className="text-[#5a5a62]" />
            </div>
            <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Submit assignment?</h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
              You're about to submit <strong style={{ color: "#3a3a42" }}>{selectedAssignment?.title}</strong>. This cannot be undone.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-2 rounded-lg border border-[#dcdce0] text-[#3a3a42] hover:bg-[#f5f5f7] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}>Cancel</button>
              <button onClick={handleSubmitAssignment} disabled={submitting} className="flex-1 py-2 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors disabled:opacity-60" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}>
                {submitting ? "Submitting…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Quiz Detail Modal ─────────────────────────────────────────── */}
      {selectedQuiz && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0]">
              <div className="flex-1 min-w-0 pr-4">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>{selectedQuiz.title}</p>
                {selectedQuiz.week && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>Week {selectedQuiz.week}</p>}
              </div>
              <button onClick={() => setSelectedQuiz(null)} className="text-[#8e8e96] hover:text-[#0a1628] flex-shrink-0"><X size={18} /></button>
            </div>

            <div className="px-6 py-5">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`px-2 py-1 rounded-md ${statusStyle(selectedQuiz.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
                  {statusLabel(selectedQuiz.status, selectedQuiz.grade, selectedQuiz.maxPoints)}
                </span>
                <span className="flex items-center gap-1 text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  <Clock size={12} /> Due {selectedQuiz.dueDate}
                </span>
              </div>

              {/* Description */}
              <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mb-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3a3a42", lineHeight: 1.6 }}>{selectedQuiz.description}</p>
              </div>

              {/* Quiz details */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>{selectedQuiz.questions}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Questions</p>
                </div>
                <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>{selectedQuiz.duration}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Duration</p>
                </div>
                <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>{selectedQuiz.maxPoints}</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Points</p>
                </div>
              </div>

              {/* Graded result */}
              {selectedQuiz.status === "Graded" && (
                <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mb-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a1628" }}>{selectedQuiz.grade}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#8e8e96" }}>/ {selectedQuiz.maxPoints}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b5", marginLeft: 4 }}>
                      ({Math.round(((selectedQuiz.grade || 0) / selectedQuiz.maxPoints) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    {selectedQuiz.attempts !== undefined && (
                      <span className="flex items-center gap-1 text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                        <RotateCcw size={11} /> {selectedQuiz.attempts}/{selectedQuiz.maxAttempts} attempts used
                      </span>
                    )}
                    {selectedQuiz.submittedAt && (
                      <span className="flex items-center gap-1 text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                        <Clock size={11} /> {selectedQuiz.submittedAt}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Start quiz button */}
              {isActive(selectedQuiz.status) && (
                <button
                  className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  Start Quiz
                </button>
              )}

              {/* Retake (if attempts remain) */}
              {selectedQuiz.status === "Graded" && selectedQuiz.attempts !== undefined && selectedQuiz.maxAttempts !== undefined && selectedQuiz.attempts < selectedQuiz.maxAttempts && (
                <button
                  className="w-full py-2.5 rounded-lg border border-[#dcdce0] text-[#3a3a42] hover:bg-[#f5f5f7] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}
                >
                  Retake Quiz ({selectedQuiz.maxAttempts - selectedQuiz.attempts} attempt{selectedQuiz.maxAttempts - selectedQuiz.attempts > 1 ? "s" : ""} remaining)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════════════════════════════

/* ─── Section wrapper with Active / History label ──────────────────────── */
function WorkSection({
  label,
  count,
  emptyText,
  defaultCollapsed = false,
  children,
}: {
  label: string;
  count: number;
  emptyText: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 group"
      >
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-[#ebebee] text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>
          {count}
        </span>
        {collapsed ? (
          <ChevronRight size={14} className="text-[#b0b0b5] group-hover:text-[#8e8e96] transition-colors" />
        ) : (
          <ChevronDown size={14} className="text-[#b0b0b5] group-hover:text-[#8e8e96] transition-colors" />
        )}
      </button>

      {!collapsed && (
        count > 0 ? (
          <div className="flex flex-col gap-2">
            {children}
          </div>
        ) : (
          <EmptyState icon={<ClipboardList size={22} className="text-[#cdcdd2]" />} title={emptyText} />
        )
      )}
    </div>
  );
}

/* ─── Assignment row ──────────────────────────────────────────────────── */
function AssignmentRow({
  a,
  onClick,
  statusStyle,
  statusLabel,
}: {
  a: CourseAssignment;
  onClick: () => void;
  statusStyle: (s: WorkStatus) => string;
  statusLabel: (s: WorkStatus, g?: number, m?: number) => string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-[#ebebee] px-5 py-4 text-left hover:border-[#cdcdd2] hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg bg-[#f3f3f5] flex items-center justify-center flex-shrink-0">
          <ClipboardList size={16} className="text-[#8e8e96]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{a.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {a.week && (
              <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                Week {a.week}
              </span>
            )}
            <span className="flex items-center gap-1 text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
              <Clock size={10} /> {a.dueDate}
            </span>
            <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
              {a.maxPoints} pts
            </span>
          </div>
        </div>

        {/* Status + arrow */}
        <span className={`px-2 py-1 rounded-md flex-shrink-0 ${statusStyle(a.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
          {statusLabel(a.status, a.grade, a.maxPoints)}
        </span>
        <ChevronRight size={15} className="text-[#cdcdd2] group-hover:text-[#8e8e96] transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

/* ─── Quiz row ────────────────────────────────────────────────────────── */
function QuizRow({
  q,
  onClick,
  statusStyle,
  statusLabel,
}: {
  q: CourseQuiz;
  onClick: () => void;
  statusStyle: (s: WorkStatus) => string;
  statusLabel: (s: WorkStatus, g?: number, m?: number) => string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-[#ebebee] px-5 py-4 text-left hover:border-[#cdcdd2] hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg bg-[#f3f3f5] flex items-center justify-center flex-shrink-0">
          <HelpCircle size={16} className="text-[#8e8e96]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{q.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {q.week && (
              <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                Week {q.week}
              </span>
            )}
            <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
              {q.questions} Qs · {q.duration}
            </span>
            <span className="flex items-center gap-1 text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
              <Clock size={10} /> {q.dueDate}
            </span>
          </div>
        </div>

        {/* Status + arrow */}
        <span className={`px-2 py-1 rounded-md flex-shrink-0 ${statusStyle(q.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
          {statusLabel(q.status, q.grade, q.maxPoints)}
        </span>
        <ChevronRight size={15} className="text-[#cdcdd2] group-hover:text-[#8e8e96] transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}

/* ─── Empty state ─────────────────────────────────────────────────────── */
function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="bg-[#fafafb] rounded-xl border border-[#ededf0] py-10 px-6 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#5a5a62" }}>{title}</p>
      {subtitle && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b5", marginTop: 4 }}>{subtitle}</p>}
    </div>
  );
}