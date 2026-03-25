import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ChevronRight, Check, FileText, Search,
  Download, Users, PenLine, ChevronLeft,
  ClipboardList, BookOpen, Users2,
} from "lucide-react";
import type { GroupSubmissionMeta } from "../data/groups";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";

const S = { fontFamily: "Inter, sans-serif" };
const TODAY = new Date("2026-02-23");

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function formatSubmitTime(dt: string) {
  const d = new Date(dt);
  const day = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${day} · ${time.toLowerCase()}`;
}
function isPast(d: string) { return new Date(d) <= TODAY; }
function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - TODAY.getTime()) / 86400000);
}
function daysAgo(d: string) {
  return Math.floor((TODAY.getTime() - new Date(d).getTime()) / 86400000);
}

function getStudentCohort(studentId: number): "Weekday" | "Weekend" {
  return studentId % 2 === 0 ? "Weekend" : "Weekday";
}

// ─── Types ────────────────────────────────────────────────────────────────────
type AssignmentType = "Exercise" | "Assignment" | "Quiz" | "Exam";

interface RubricCriterion {
  id: number;
  criterion: string;
  description: string;
  points: number;
}

interface Submission {
  studentId: number;
  studentName: string;
  cohort?: "Weekday" | "Weekend";
  submittedAt: string | null;
  score: number | null;
  feedback: string;
  groupMeta?: GroupSubmissionMeta;
}

interface Assignment {
  id: number;
  title: string;
  type: AssignmentType;
  dueDate: string;
  maxScore: number;
  method: "auto" | "manual";
  rubric?: RubricCriterion[];
  isGroupAssignment?: boolean;
  submissions: Submission[];
}

interface Course {
  id: string;
  name: string;
  code: string;
  assignments: Assignment[];
}

type ViewState =
  | { page: "courses" }
  | { page: "assignments"; courseId: string }
  | { page: "submissions"; courseId: string; assignmentId: number }
  | { page: "grade"; courseId: string; assignmentId: number; studentId: number };

// ─── Student name lookup (for group submission fan-out) ────────────────────────
const STUDENT_NAME_MAP: Record<number, string> = {
  1: "Akua Mensah", 2: "Kofi Boateng", 3: "Kwame Asante",
  4: "Yaw Darko",   5: "Yaa Frimpong",
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const INITIAL_DATA: Course[] = [
  {
    id: "fa-l1", name: "Financial Accounting", code: "FA · Level 1",
    assignments: [
      {
        id: 101, title: "Chapter 1 Exercise", type: "Exercise",
        dueDate: "2026-01-05", maxScore: 20, method: "manual",
        rubric: [
          { id: 1, criterion: "Journal Entry Accuracy", description: "Correct use of debits and credits", points: 10 },
          { id: 2, criterion: "Trial Balance", description: "Balances extracted and totalled correctly", points: 7 },
          { id: 3, criterion: "Presentation", description: "Clear layout and workings shown", points: 3 },
        ],
        submissions: [
          { studentId: 1, studentName: "Akua Mensah",  cohort: "Weekday", submittedAt: "2026-01-04 14:22", score: 18, feedback: "Excellent work, clear workings." },
          { studentId: 2, studentName: "Kofi Boateng", cohort: "Weekend", submittedAt: "2026-01-05 09:11", score: 10, feedback: "Some errors in journal entries." },
          { studentId: 3, studentName: "Kwame Asante", cohort: "Weekday", submittedAt: "2026-01-04 22:45", score: 15, feedback: "" },
          { studentId: 4, studentName: "Yaw Darko",    cohort: "Weekend", submittedAt: "2026-01-05 08:00", score: 20, feedback: "Perfect submission." },
        ],
      },
      {
        id: 102, title: "Quiz 1: Accounting Basics", type: "Quiz",
        dueDate: "2026-01-15", maxScore: 15, method: "auto",
        submissions: [
          { studentId: 1, studentName: "Akua Mensah",  submittedAt: "2026-01-14 10:00", score: 13, feedback: "" },
          { studentId: 2, studentName: "Kofi Boateng", submittedAt: "2026-01-15 11:30", score: 8,  feedback: "" },
          { studentId: 3, studentName: "Kwame Asante", submittedAt: "2026-01-13 09:20", score: 11, feedback: "" },
          { studentId: 4, studentName: "Yaw Darko",    submittedAt: "2026-01-14 14:45", score: 15, feedback: "" },
        ],
      },
      {
        id: 103, title: "Balance Sheet Preparation", type: "Assignment",
        dueDate: "2026-01-20", maxScore: 30, method: "manual",
        rubric: [
          { id: 1, criterion: "Non-current Assets", description: "Correctly classified and valued", points: 8 },
          { id: 2, criterion: "Current Assets", description: "Correct ordering and totals", points: 6 },
          { id: 3, criterion: "Liabilities", description: "Current and non-current correctly separated", points: 8 },
          { id: 4, criterion: "Equity Section", description: "Share capital and retained earnings", points: 6 },
          { id: 5, criterion: "Formatting", description: "IAS-compliant layout and headings", points: 2 },
        ],
        submissions: [
          { studentId: 1, studentName: "Akua Mensah",  submittedAt: "2026-01-19 16:00", score: 25, feedback: "Good structure, minor formatting issues." },
          { studentId: 2, studentName: "Kofi Boateng", submittedAt: "2026-01-20 08:45", score: null, feedback: "" },
          { studentId: 3, studentName: "Kwame Asante", submittedAt: "2026-01-20 23:55", score: null, feedback: "" },
          { studentId: 4, studentName: "Yaw Darko",    submittedAt: "2026-01-18 10:00", score: 29, feedback: "Excellent work." },
        ],
      },
      {
        id: 104, title: "Mid-Term Examination", type: "Exam",
        dueDate: "2026-02-01", maxScore: 50, method: "manual",
        rubric: [
          { id: 1, criterion: "Section A — Short Answers", description: "Definitions, journal entries, calculations", points: 20 },
          { id: 2, criterion: "Section B — Extended Analysis", description: "Depth of analysis and application of concepts", points: 20 },
          { id: 3, criterion: "Workings & Method", description: "Logical steps and clear workings shown", points: 8 },
          { id: 4, criterion: "Presentation", description: "Legibility and structure of the paper", points: 2 },
        ],
        submissions: [
          { studentId: 1, studentName: "Akua Mensah",  submittedAt: "2026-02-01 12:00", score: 42, feedback: "" },
          { studentId: 2, studentName: "Kofi Boateng", submittedAt: "2026-02-01 12:00", score: 22, feedback: "" },
          { studentId: 3, studentName: "Kwame Asante", submittedAt: "2026-02-01 12:00", score: 38, feedback: "" },
          { studentId: 4, studentName: "Yaw Darko",    submittedAt: "2026-02-01 12:00", score: 48, feedback: "" },
        ],
      },
      {
        id: 105, title: "Cash Flow Statement", type: "Assignment",
        dueDate: "2026-02-20", maxScore: 20, method: "manual",
        submissions: [
          { studentId: 1, studentName: "Akua Mensah",  submittedAt: "2026-02-19 20:30", score: null, feedback: "" },
          { studentId: 2, studentName: "Kofi Boateng", submittedAt: null,               score: null, feedback: "" },
          { studentId: 3, studentName: "Kwame Asante", submittedAt: "2026-02-20 22:50", score: null, feedback: "" },
          { studentId: 4, studentName: "Yaw Darko",    submittedAt: "2026-02-18 11:00", score: null, feedback: "" },
        ],
      },
      {
        id: 106, title: "Quiz 2: Financial Ratios", type: "Quiz",
        dueDate: "2026-03-05", maxScore: 15, method: "auto",
        submissions: [
          { studentId: 1, studentName: "Akua Mensah",  submittedAt: null, score: null, feedback: "" },
          { studentId: 2, studentName: "Kofi Boateng", submittedAt: null, score: null, feedback: "" },
          { studentId: 3, studentName: "Kwame Asante", submittedAt: null, score: null, feedback: "" },
          { studentId: 4, studentName: "Yaw Darko",    submittedAt: null, score: null, feedback: "" },
        ],
      },
      {
        id: 107, title: "Group Case Study: Balance Sheet Analysis",
        type: "Assignment", isGroupAssignment: true,
        dueDate: "2026-02-28", maxScore: 40, method: "manual",
        rubric: [
          { id: 1, criterion: "Analysis Depth", description: "Thoroughness of balance sheet analysis", points: 16 },
          { id: 2, criterion: "Accuracy", description: "Correct figures and calculations", points: 14 },
          { id: 3, criterion: "Presentation", description: "Format and group coherence", points: 10 },
        ],
        submissions: [
          {
            studentId: 1, studentName: "Group Alpha", cohort: "Weekday",
            submittedAt: "2026-02-27 18:00", score: null, feedback: "",
            groupMeta: { groupId: "grp-1-wd-001", groupName: "Group Alpha", memberIds: [1, 3, 5], submittedByStudentId: 1 },
          },
          {
            studentId: 2, studentName: "Group Beta", cohort: "Weekday",
            submittedAt: "2026-02-26 14:00", score: 34, feedback: "Strong analysis with well-structured arguments.",
            groupMeta: { groupId: "grp-1-wd-002", groupName: "Group Beta", memberIds: [2, 4], submittedByStudentId: 2 },
          },
        ],
      },
    ],
  },
  {
    id: "fa-l2", name: "Financial Accounting", code: "FA · Level 2",
    assignments: [
      {
        id: 201, title: "Introduction Exercise", type: "Exercise",
        dueDate: "2026-01-08", maxScore: 20, method: "manual",
        submissions: [
          { studentId: 5, studentName: "Ama Owusu",      submittedAt: "2026-01-07 15:00", score: 19, feedback: "" },
          { studentId: 6, studentName: "Adwoa Frimpong", submittedAt: "2026-01-08 09:00", score: 8,  feedback: "" },
          { studentId: 7, studentName: "Abena Kusi",     submittedAt: "2026-01-07 20:00", score: 13, feedback: "" },
          { studentId: 8, studentName: "Nana Adjei",     submittedAt: "2026-01-08 07:30", score: 16, feedback: "" },
        ],
      },
      {
        id: 202, title: "Income Statement", type: "Assignment",
        dueDate: "2026-01-22", maxScore: 30, method: "manual",
        submissions: [
          { studentId: 5, studentName: "Ama Owusu",      submittedAt: "2026-01-21 18:00", score: 28, feedback: "" },
          { studentId: 6, studentName: "Adwoa Frimpong", submittedAt: "2026-01-22 10:00", score: null, feedback: "" },
          { studentId: 7, studentName: "Abena Kusi",     submittedAt: "2026-01-22 09:00", score: 20, feedback: "" },
          { studentId: 8, studentName: "Nana Adjei",     submittedAt: "2026-01-21 22:00", score: 24, feedback: "" },
        ],
      },
      {
        id: 203, title: "Case Study: Retail Co.", type: "Assignment",
        dueDate: "2026-02-10", maxScore: 40, method: "manual",
        submissions: [
          { studentId: 5, studentName: "Ama Owusu",      submittedAt: "2026-02-09 17:00", score: null, feedback: "" },
          { studentId: 6, studentName: "Adwoa Frimpong", submittedAt: null,               score: null, feedback: "" },
          { studentId: 7, studentName: "Abena Kusi",     submittedAt: "2026-02-10 14:00", score: null, feedback: "" },
          { studentId: 8, studentName: "Nana Adjei",     submittedAt: "2026-02-08 11:00", score: null, feedback: "" },
        ],
      },
      {
        id: 204, title: "Financial Analysis Quiz", type: "Quiz",
        dueDate: "2026-03-01", maxScore: 15, method: "auto",
        submissions: [
          { studentId: 5, studentName: "Ama Owusu",      submittedAt: null, score: null, feedback: "" },
          { studentId: 6, studentName: "Adwoa Frimpong", submittedAt: null, score: null, feedback: "" },
          { studentId: 7, studentName: "Abena Kusi",     submittedAt: null, score: null, feedback: "" },
          { studentId: 8, studentName: "Nana Adjei",     submittedAt: null, score: null, feedback: "" },
        ],
      },
    ],
  },
  {
    id: "ma-l1", name: "Management Accounting", code: "MA · Level 1",
    assignments: [
      {
        id: 301, title: "Cost Classification", type: "Exercise",
        dueDate: "2026-01-10", maxScore: 20, method: "manual",
        submissions: [
          { studentId: 9,  studentName: "Efua Boadu",      submittedAt: "2026-01-09 20:00", score: 17, feedback: "" },
          { studentId: 10, studentName: "Kwesi Darko",     submittedAt: "2026-01-10 09:00", score: 9,  feedback: "" },
          { studentId: 11, studentName: "Aba Frimpong",    submittedAt: "2026-01-10 11:00", score: 14, feedback: "" },
          { studentId: 12, studentName: "Kojo Acheampong", submittedAt: "2026-01-09 16:00", score: 17, feedback: "" },
        ],
      },
      {
        id: 302, title: "Variance Analysis", type: "Assignment",
        dueDate: "2026-02-05", maxScore: 30, method: "manual",
        rubric: [
          { id: 1, criterion: "Material Variance", description: "Price and usage variances correctly computed", points: 12 },
          { id: 2, criterion: "Labour Variance", description: "Rate and efficiency variances correctly computed", points: 12 },
          { id: 3, criterion: "Interpretation", description: "Favourable / adverse analysis with explanation", points: 6 },
        ],
        submissions: [
          { studentId: 9,  studentName: "Efua Boadu",      submittedAt: "2026-02-04 21:00", score: 26, feedback: "" },
          { studentId: 10, studentName: "Kwesi Darko",     submittedAt: "2026-02-05 10:00", score: null, feedback: "" },
          { studentId: 11, studentName: "Aba Frimpong",    submittedAt: "2026-02-05 08:00", score: 21, feedback: "" },
          { studentId: 12, studentName: "Kojo Acheampong", submittedAt: null,               score: null, feedback: "" },
        ],
      },
      {
        id: 303, title: "Budget Report", type: "Assignment",
        dueDate: "2026-02-18", maxScore: 30, method: "manual",
        submissions: [
          { studentId: 9,  studentName: "Efua Boadu",      submittedAt: "2026-02-17 18:00", score: null, feedback: "" },
          { studentId: 10, studentName: "Kwesi Darko",     submittedAt: null,               score: null, feedback: "" },
          { studentId: 11, studentName: "Aba Frimpong",    submittedAt: "2026-02-18 09:00", score: null, feedback: "" },
          { studentId: 12, studentName: "Kojo Acheampong", submittedAt: "2026-02-16 14:00", score: null, feedback: "" },
        ],
      },
      {
        id: 304, title: "Management Quiz", type: "Quiz",
        dueDate: "2026-03-10", maxScore: 15, method: "auto",
        submissions: [
          { studentId: 9,  studentName: "Efua Boadu",      submittedAt: null, score: null, feedback: "" },
          { studentId: 10, studentName: "Kwesi Darko",     submittedAt: null, score: null, feedback: "" },
          { studentId: 11, studentName: "Aba Frimpong",    submittedAt: null, score: null, feedback: "" },
          { studentId: 12, studentName: "Kojo Acheampong", submittedAt: null, score: null, feedback: "" },
        ],
      },
    ],
  },
  {
    id: "tax-l1", name: "Taxation", code: "TAX · Level 1",
    assignments: [
      {
        id: 401, title: "Tax Principles Exercise", type: "Exercise",
        dueDate: "2026-01-12", maxScore: 20, method: "manual",
        submissions: [
          { studentId: 13, studentName: "Esi Amponsah", submittedAt: "2026-01-11 14:00", score: 18, feedback: "" },
          { studentId: 14, studentName: "Fiifi Mensah", submittedAt: "2026-01-12 09:00", score: 7,  feedback: "" },
          { studentId: 15, studentName: "Gifty Asare",  submittedAt: "2026-01-11 20:00", score: 13, feedback: "" },
        ],
      },
      {
        id: 402, title: "Income Tax Computation", type: "Assignment",
        dueDate: "2026-02-14", maxScore: 40, method: "manual",
        rubric: [
          { id: 1, criterion: "Chargeable Income", description: "Correct computation of assessable income", points: 15 },
          { id: 2, criterion: "Tax Reliefs & Deductions", description: "Reliefs correctly identified and applied", points: 12 },
          { id: 3, criterion: "Tax Liability", description: "Final tax figure computed correctly", points: 10 },
          { id: 4, criterion: "Presentation", description: "Format, workings, and IAS compliance", points: 3 },
        ],
        submissions: [
          { studentId: 13, studentName: "Esi Amponsah", submittedAt: "2026-02-13 16:00", score: null, feedback: "" },
          { studentId: 14, studentName: "Fiifi Mensah", submittedAt: null,               score: null, feedback: "" },
          { studentId: 15, studentName: "Gifty Asare",  submittedAt: "2026-02-14 10:00", score: null, feedback: "" },
        ],
      },
      {
        id: 403, title: "Tax Quiz", type: "Quiz",
        dueDate: "2026-03-08", maxScore: 15, method: "auto",
        submissions: [
          { studentId: 13, studentName: "Esi Amponsah", submittedAt: null, score: null, feedback: "" },
          { studentId: 14, studentName: "Fiifi Mensah", submittedAt: null, score: null, feedback: "" },
          { studentId: 15, studentName: "Gifty Asare",  submittedAt: null, score: null, feedback: "" },
        ],
      },
    ],
  },
  {
    id: "aud-l1", name: "Auditing", code: "AUD · Level 1",
    assignments: [
      {
        id: 501, title: "Audit Evidence Exercise", type: "Exercise",
        dueDate: "2026-01-15", maxScore: 20, method: "manual",
        submissions: [
          { studentId: 16, studentName: "Harriet Ofori",  submittedAt: "2026-01-14 17:00", score: 16, feedback: "" },
          { studentId: 17, studentName: "Isaac Danso",    submittedAt: "2026-01-15 10:00", score: 10, feedback: "" },
          { studentId: 18, studentName: "Josephine Adu",  submittedAt: "2026-01-14 21:00", score: 18, feedback: "" },
        ],
      },
      {
        id: 502, title: "Audit Planning Report", type: "Assignment",
        dueDate: "2026-02-08", maxScore: 35, method: "manual",
        rubric: [
          { id: 1, criterion: "Risk Assessment", description: "Identification and evaluation of audit risks", points: 12 },
          { id: 2, criterion: "Audit Procedures", description: "Appropriateness and completeness of planned procedures", points: 13 },
          { id: 3, criterion: "Report Structure", description: "Clarity, logical flow, and professional tone", points: 10 },
        ],
        submissions: [
          { studentId: 16, studentName: "Harriet Ofori",  submittedAt: "2026-02-07 19:00", score: null, feedback: "" },
          { studentId: 17, studentName: "Isaac Danso",    submittedAt: "2026-02-08 09:00", score: null, feedback: "" },
          { studentId: 18, studentName: "Josephine Adu",  submittedAt: "2026-02-06 14:00", score: null, feedback: "" },
        ],
      },
      {
        id: 503, title: "Auditing Quiz", type: "Quiz",
        dueDate: "2026-03-12", maxScore: 15, method: "auto",
        submissions: [
          { studentId: 16, studentName: "Harriet Ofori",  submittedAt: null, score: null, feedback: "" },
          { studentId: 17, studentName: "Isaac Danso",    submittedAt: null, score: null, feedback: "" },
          { studentId: 18, studentName: "Josephine Adu",  submittedAt: null, score: null, feedback: "" },
        ],
      },
    ],
  },
];

// ─── Derived helpers ──────────────────────────────────────────────────────────
function getStatus(a: Assignment) {
  const submitted  = a.submissions.filter(s => s.submittedAt !== null);
  const graded     = a.submissions.filter(s => s.score !== null);
  const pending    = submitted.length - graded.length;
  const past       = isPast(a.dueDate);

  if (!past) return { kind: "open"    as const, pending: 0, submitted: submitted.length, graded: graded.length, total: a.submissions.length };
  if (pending > 0) return { kind: "pending" as const, pending, submitted: submitted.length, graded: graded.length, total: a.submissions.length };
  if (graded.length > 0) return { kind: "done"    as const, pending: 0, submitted: submitted.length, graded: graded.length, total: a.submissions.length };
  return { kind: "empty"   as const, pending: 0, submitted: 0, graded: 0, total: a.submissions.length };
}

function coursePending(course: Course) {
  return course.assignments.reduce((sum, a) => {
    if (!isPast(a.dueDate)) return sum;
    return sum + a.submissions.filter(s => s.submittedAt !== null && s.score === null).length;
  }, 0);
}

function studentCount(course: Course) {
  return new Set(course.assignments.flatMap(a => a.submissions.map(s => s.studentId))).size;
}

// ─── Type badge ───────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<AssignmentType, string> = {
  Exercise:   "border border-gray-300 text-[#6c6c6c]",
  Assignment: "bg-[#0a1628] text-white",
  Quiz:       "bg-[#d4a574] text-[#0a1628]",
  Exam:       "bg-[#0a1628] text-[#d4a574]",
};

function TypeBadge({ type }: { type: AssignmentType }) {
  return (
    <span
      className={`px-2 py-0.5 flex-shrink-0 ${TYPE_STYLES[type]}`}
      style={{ ...S, fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em" }}
    >
      {type.toUpperCase()}
    </span>
  );
}

// ─── Shared layout wrapper ────────────────────────────────────────────────────
function PageShell({
  breadcrumb, children,
}: {
  breadcrumb: { label: string; onClick?: () => void }[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={breadcrumb.map(b => ({ label: b.label }))} />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" />
      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {children}
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export function GradebooksPage() {
  useNavigate();

  const [data, setData]       = useState<Course[]>(INITIAL_DATA);
  const [view, setView]       = useState<ViewState>({ page: "courses" });
  const [tabFilter, setTabFilter] = useState<"all" | "submitted" | "to_grade">("all");
  const [cohortFilter, setCohortFilter] = useState<"All" | "Weekday" | "Weekend">("All");
  const [search, setSearch]   = useState("");
  const [editScore, setEditScore]       = useState("");
  const [editFeedback, setEditFeedback] = useState("");
  const [rubricScores, setRubricScores] = useState<Record<number, string>>({});

  // Accessors
  const getCourse     = (id: string)             => data.find(c => c.id === id)!;
  const getAssignment = (cId: string, aId: number) => getCourse(cId).assignments.find(a => a.id === aId)!;

  // Grade save
  const saveGrade = (cId: string, aId: number, sId: number) => {
    const score = parseFloat(editScore);
    if (isNaN(score)) return;
    setData(prev => prev.map(c => c.id !== cId ? c : {
      ...c,
      assignments: c.assignments.map(a => a.id !== aId ? a : {
        ...a,
        submissions: a.submissions.map(s => s.studentId !== sId ? s : { ...s, score, feedback: editFeedback }),
      }),
    }));
  };

  // Navigate to grade a student (pre-populate inputs)
  const openGrade = (cId: string, aId: number, sId: number) => {
    const sub = getAssignment(cId, aId).submissions.find(s => s.studentId === sId)!;
    setEditScore(sub.score !== null ? String(sub.score) : "");
    setEditFeedback(sub.feedback || "");
    setRubricScores({});  // always start fresh — rubric scored per-criterion
    setView({ page: "grade", courseId: cId, assignmentId: aId, studentId: sId });
  };

  // ── VIEW 1: Course selection ───────────────────────────────────────────────
  if (view.page === "courses") {
    return (
      <PageShell breadcrumb={[{ label: "Home" }, { label: "Grade Books" }]}>
        <div>
          <h1 style={{ ...S, fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>Grade Books</h1>
          <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
            Select a course to view its assignments and student submissions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(course => {
            const pending = coursePending(course);
            const students = studentCount(course);
            const total = course.assignments.length;
            return (
              <button
                key={course.id}
                onClick={() => { setView({ page: "assignments", courseId: course.id }); setSearch(""); }}
                className="bg-white border border-gray-200 p-5 text-left hover:border-[#0a1628] hover:shadow-sm transition-all group"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-[#0a1628]" />
                  </div>
                  {pending > 0 ? (
                    <span
                      className="px-2 py-0.5 bg-[#d4a574] text-[#0a1628]"
                      style={{ ...S, fontSize: "10px", fontWeight: 700 }}
                    >
                      {pending} to grade
                    </span>
                  ) : (
                    <span className="flex items-center gap-1" style={{ ...S, fontSize: "11px", color: "#b0b0b0" }}>
                      <Check size={11} /> All graded
                    </span>
                  )}
                </div>

                {/* Course info */}
                <p style={{ ...S, fontSize: "16px", fontWeight: 700, color: "#0a1628", lineHeight: 1.3 }}>
                  {course.name}
                </p>
                <p style={{ ...S, fontSize: "12px", color: "#d4a574", fontWeight: 600, marginTop: 2 }}>
                  {course.code}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
                  <span className="flex items-center gap-1.5" style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                    <Users size={12} /> {students} students
                  </span>
                  <span className="flex items-center gap-1.5" style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                    <ClipboardList size={12} /> {total} assignments
                  </span>
                </div>

                {/* Arrow */}
                <div className="flex items-center justify-end mt-3">
                  <span className="flex items-center gap-1 text-[#b0b0b0] group-hover:text-[#0a1628] transition-colors" style={{ ...S, fontSize: "12px" }}>
                    Open gradebook <ChevronRight size={13} />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </PageShell>
    );
  }

  // ── VIEW 2: Assignment list ────────────────────────────────────────────────
  if (view.page === "assignments") {
    const course = getCourse(view.courseId);

    // Sort: past due first (most recent → oldest), then open (soonest first)
    const sorted = [...course.assignments].sort((a, b) => {
      const aPast = isPast(a.dueDate), bPast = isPast(b.dueDate);
      if (aPast && !bPast) return -1;
      if (!aPast && bPast) return 1;
      if (aPast)  return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const totalPending = coursePending(course);

    return (
      <PageShell breadcrumb={[{ label: "Home" }, { label: "Grade Books" }, { label: course.code }]}>
        {/* Header */}
        <button
          onClick={() => setView({ page: "courses" })}
          className="flex items-center gap-2 w-fit text-[#6c6c6c] hover:text-[#0a1628] transition-colors"
          style={{ ...S, fontSize: "13px" }}
        >
          <ArrowLeft size={14} /> All Courses
        </button>

        <div className="flex items-start justify-between">
          <div>
            <p style={{ ...S, fontSize: "12px", color: "#d4a574", fontWeight: 600 }}>{course.code}</p>
            <h1 style={{ ...S, fontWeight: 700, fontSize: "22px", color: "#0a1628", marginTop: 2 }}>{course.name}</h1>
            <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
              {course.assignments.length} assignments · {studentCount(course)} students
              {totalPending > 0 && (
                <span className="ml-2 text-[#d4a574] font-semibold">· {totalPending} pending</span>
              )}
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-4 h-[40px] border border-gray-200 hover:border-[#0a1628] transition-colors"
            style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}
          >
            <Download size={14} /> Export
          </button>
        </div>

        {/* Assignment list */}
        <div className="flex flex-col gap-2">
          {sorted.map(a => {
            const status = getStatus(a);
            const past = isPast(a.dueDate);
            return (
              <button
                key={a.id}
                onClick={() => {
                  setTabFilter("all");
                  setView({ page: "submissions", courseId: course.id, assignmentId: a.id });
                }}
                className="bg-white border border-gray-200 hover:border-[#0a1628] hover:shadow-sm transition-all p-4 text-left flex items-center gap-4 group"
              >
                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>
                    {a.title}
                    <span style={{ ...S, fontSize: "13px", fontWeight: 400, color: "#b0b0b0", marginLeft: 6 }}>· {a.type}</span>
                  </p>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                      {past
                        ? `Closed ${daysAgo(a.dueDate) === 0 ? "today" : daysAgo(a.dueDate) === 1 ? "yesterday" : `${daysAgo(a.dueDate)} days ago`} · ${formatDate(a.dueDate)}`
                        : `Due ${daysUntil(a.dueDate) === 1 ? "tomorrow" : `in ${daysUntil(a.dueDate)} days`} · ${formatDate(a.dueDate)}`
                      }
                    </span>
                    <span style={{ ...S, fontSize: "12px", color: "#b0b0b0" }}>
                      {a.maxScore} pts · {a.method === "auto" ? "Auto-graded" : "Manual"}
                    </span>
                  </div>
                </div>

                {/* Status + progress */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  {/* Submission count */}
                  {past && (
                    <div className="text-right">
                      <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                        {status.graded}/{status.submitted}
                      </p>
                      <p style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>graded</p>
                    </div>
                  )}

                  {/* Status pill */}
                  {status.kind === "pending" && (
                    <span className="px-3 py-1 bg-[#d4a574] text-[#0a1628]" style={{ ...S, fontSize: "11px", fontWeight: 700 }}>
                      {status.pending} to grade
                    </span>
                  )}
                  {status.kind === "done" && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-[#0a1628]" style={{ ...S, fontSize: "11px", fontWeight: 600 }}>
                      <Check size={11} /> Fully graded
                    </span>
                  )}
                  {status.kind === "open" && (
                    <span className="px-3 py-1 border border-gray-200 text-[#6c6c6c]" style={{ ...S, fontSize: "11px" }}>
                      Open
                    </span>
                  )}
                  {status.kind === "empty" && (
                    <span className="px-3 py-1 border border-gray-200 text-[#b0b0b0]" style={{ ...S, fontSize: "11px" }}>
                      No submissions
                    </span>
                  )}

                  <ChevronRight size={16} className="text-[#b0b0b0] group-hover:text-[#0a1628] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </PageShell>
    );
  }

  // ── VIEW 3: Submissions list ───────────────────────────────────────────────
  if (view.page === "submissions") {
    const course     = getCourse(view.courseId);
    const assignment = getAssignment(view.courseId, view.assignmentId);
    const status     = getStatus(assignment);
    const past       = isPast(assignment.dueDate);

    const filtered = assignment.submissions.filter(s => {
      const q = search.toLowerCase();
      const matchSearch = s.groupMeta
        ? s.groupMeta.groupName.toLowerCase().includes(q) ||
          s.groupMeta.memberIds.some(id => (STUDENT_NAME_MAP[id] || "").toLowerCase().includes(q))
        : s.studentName.toLowerCase().includes(q);
      const sCohort = s.cohort || getStudentCohort(s.studentId);
      const matchCohort = cohortFilter === "All" || sCohort === cohortFilter;

      if (!matchSearch || !matchCohort) return false;

      if (tabFilter === "submitted")  return s.submittedAt !== null;
      if (tabFilter === "to_grade")   return s.submittedAt !== null && s.score === null;
      return true;
    });

    // Fan-out: expand group submissions into one display row per member
    type DisplayRow = { sub: Submission; displayName: string; groupName: string | undefined; rowKey: string };
    const displayRows: DisplayRow[] = filtered.flatMap(sub =>
      sub.groupMeta
        ? sub.groupMeta.memberIds.map(memberId => ({
            sub,
            displayName: STUDENT_NAME_MAP[memberId] || `Student ${memberId}`,
            groupName: sub.groupMeta!.groupName as string | undefined,
            rowKey: `${sub.studentId}-${memberId}`,
          }))
        : [{ sub, displayName: sub.studentName, groupName: undefined, rowKey: String(sub.studentId) }]
    );

    const tabs: { key: typeof tabFilter; label: string; count: number }[] = [
      { key: "all",       label: "All",          count: assignment.submissions.length },
      { key: "submitted", label: "Submitted",    count: assignment.submissions.filter(s => s.submittedAt !== null).length },
      { key: "to_grade",  label: "To grade",     count: assignment.submissions.filter(s => s.submittedAt !== null && s.score === null).length },
    ];

    return (
      <PageShell breadcrumb={[{ label: "Home" }, { label: "Grade Books" }, { label: course.code }, { label: assignment.title }]}>
        {/* Back */}
        <button
          onClick={() => setView({ page: "assignments", courseId: view.courseId })}
          className="flex items-center gap-2 w-fit text-[#6c6c6c] hover:text-[#0a1628] transition-colors"
          style={{ ...S, fontSize: "13px" }}
        >
          <ArrowLeft size={14} /> {course.code} Assignments
        </button>

        {/* Assignment header */}
        <div className="bg-white border border-gray-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TypeBadge type={assignment.type} />
                {assignment.method === "auto" && (
                  <span className="px-2 py-0.5 bg-gray-100 text-[#6c6c6c]" style={{ ...S, fontSize: "10px", fontWeight: 600 }}>
                    Auto-graded
                  </span>
                )}
              </div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>{assignment.title}</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 3 }}>
                {past ? "Closed" : "Due"} {formatDate(assignment.dueDate)}
                {past && daysAgo(assignment.dueDate) === 0 && " · closed today"}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p style={{ ...S, fontSize: "24px", fontWeight: 700, color: "#0a1628" }}>{assignment.maxScore}</p>
              <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>points</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
            {[
              { label: "Submitted",    value: status.submitted },
              { label: "Graded",       value: status.graded },
              { label: "To grade",     value: status.pending },
              { label: "Not submitted",value: status.total - status.submitted },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ ...S, fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>{value}</p>
                <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Filter tabs */}
          <div className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTabFilter(tab.key)}
                className={`px-3 py-1.5 transition-colors ${tabFilter === tab.key ? "bg-[#0a1628] text-white" : "bg-white border border-gray-200 text-[#6c6c6c] hover:border-[#0a1628]"}`}
                style={{ ...S, fontSize: "12px", fontWeight: 600 }}
              >
                {tab.label} <span style={{ opacity: 0.6 }}>({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Cohort Dropdown */}
            <select
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 bg-white text-[#0a1628] outline-none focus:border-[#d4a574]"
              style={{ ...S, fontSize: "13px" }}
            >
              <option value="All">All Cohorts</option>
              <option value="Weekday">Weekday Track</option>
              <option value="Weekend">Weekend Track</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b0b0b0]" />
              <input
                type="text"
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 border border-gray-200 bg-white text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] w-full"
                style={{ ...S, fontSize: "13px" }}
              />
            </div>
          </div>
        </div>

        {/* Student submission list */}
        <div className="bg-white border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_160px_100px_120px] px-5 py-2.5 bg-[#f9f9f9] border-b border-gray-200">
            {["Student", "Submitted", "Score", ""].map(h => (
              <span key={h} style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
            ))}
          </div>

          {displayRows.length === 0 && (
            <div className="py-12 text-center">
              <p style={{ ...S, fontSize: "13px", color: "#b0b0b0" }}>No students match this filter.</p>
            </div>
          )}

          {displayRows.map(({ sub, displayName, groupName, rowKey }, i) => {
            const isLast = i === displayRows.length - 1;
            const hasSubmission = sub.submittedAt !== null;
            const isGraded = sub.score !== null;

            return (
              <div
                key={rowKey}
                className={`grid grid-cols-[1fr_160px_100px_120px] items-center px-5 py-3.5 ${!isLast ? "border-b border-gray-50" : ""} ${hasSubmission ? "hover:bg-[#fafafa] cursor-pointer" : "opacity-60"} transition-colors`}
                onClick={() => hasSubmission && openGrade(view.courseId, view.assignmentId, sub.studentId)}
              >
                {/* Name, group chip & cohort */}
                <div>
                  <div className="flex items-center gap-2">
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{displayName}</p>
                    {groupName && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#fdf3e7] border border-[#d4a574]/30 text-[#a68b5b]"
                        style={{ ...S, fontSize: "9px", fontWeight: 700 }}>
                        <Users2 size={9} /> {groupName}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex px-1.5 py-0.5 rounded bg-[#eef2f6] text-[#0a1628] text-[9px] mt-1">
                    {sub.cohort || getStudentCohort(sub.studentId)} Track
                  </span>
                </div>

                {/* Submitted */}
                {hasSubmission ? (
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>{formatSubmitTime(sub.submittedAt!)}</p>
                ) : (
                  <p style={{ ...S, fontSize: "12px", color: "#b0b0b0", fontStyle: "italic" }}>Not submitted</p>
                )}

                {/* Score */}
                {isGraded ? (
                  <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>
                    {sub.score}<span style={{ fontWeight: 400, color: "#b0b0b0" }}>/{assignment.maxScore}</span>
                  </p>
                ) : (
                  <p style={{ ...S, fontSize: "13px", color: "#d0d0d0" }}>—</p>
                )}

                {/* Action — only on first member row for group submissions */}
                <div className="flex justify-end">
                  {!hasSubmission && (
                    <span style={{ ...S, fontSize: "11px", color: "#b0b0b0" }}>No submission</span>
                  )}
                  {hasSubmission && !isGraded && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-[#d4a574] text-[#0a1628]" style={{ ...S, fontSize: "11px", fontWeight: 700 }}>
                      <PenLine size={11} /> Grade
                    </span>
                  )}
                  {hasSubmission && isGraded && (
                    <span className="flex items-center gap-1.5 px-3 py-1 border border-gray-200 text-[#6c6c6c] hover:border-[#0a1628]" style={{ ...S, fontSize: "11px", fontWeight: 600 }}>
                      Edit <PenLine size={10} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </PageShell>
    );
  }

  // ── VIEW 4: Grade individual ───────────────────────────────────────────────
  if (view.page === "grade") {
    const course     = getCourse(view.courseId);
    const assignment = getAssignment(view.courseId, view.assignmentId);
    const submission = assignment.submissions.find(s => s.studentId === view.studentId)!;
    const submitted  = assignment.submissions.filter(s => s.submittedAt !== null);
    const currentIdx = submitted.findIndex(s => s.studentId === view.studentId);
    const prevSub    = submitted[currentIdx - 1];
    const nextSub    = submitted[currentIdx + 1];
    // ── Rubric / score logic ───────────────────────────────────────────────
    const hasRubric = !!(assignment.rubric && assignment.rubric.length > 0);

    const rubricTotal = hasRubric
      ? assignment.rubric!.reduce((sum, c) => sum + (parseFloat(rubricScores[c.id] || "0") || 0), 0)
      : 0;
    const allCriteriaFilled = hasRubric
      ? assignment.rubric!.every(c => rubricScores[c.id] !== undefined && rubricScores[c.id] !== "")
      : false;
    const anyCriterionInvalid = hasRubric
      ? assignment.rubric!.some(c => {
          const v = parseFloat(rubricScores[c.id] || "");
          return rubricScores[c.id] !== "" && (isNaN(v) || v < 0 || v > c.points);
        })
      : false;

    const scoreVal   = parseFloat(editScore);
    const scoreValid = hasRubric
      ? allCriteriaFilled && !anyCriterionInvalid
      : !isNaN(scoreVal) && scoreVal >= 0 && scoreVal <= assignment.maxScore;
    const finalScore = hasRubric ? rubricTotal : scoreVal;

    const handleSave = () => {
      if (!scoreValid) return;
      // Write the computed final score into editScore so saveGrade picks it up
      setEditScore(String(finalScore));
      saveGrade(view.courseId, view.assignmentId, view.studentId);
    };

    const handleSaveAndNext = () => {
      if (!scoreValid) return;
      const nextUngraded = submitted.slice(currentIdx + 1).find(s => s.score === null);
      setEditScore(String(finalScore));
      saveGrade(view.courseId, view.assignmentId, view.studentId);
      if (nextUngraded) {
        openGrade(view.courseId, view.assignmentId, nextUngraded.studentId);
      } else {
        setView({ page: "submissions", courseId: view.courseId, assignmentId: view.assignmentId });
      }
    };

    // Mock submission preview text (assignment-type-specific)
    const previewLines: string[] = {
      Exercise: [
        "Q1. The double-entry principle states that every transaction affects at least two accounts.",
        "     → Debit: Equipment        GHS 50,000",
        "        Credit: Accounts Payable GHS 50,000",
        "",
        "Q2. Trial balance as at 31 December 2025:",
        "     Cash at bank              GHS 12,400 (Dr)",
        "     Accounts receivable       GHS  8,200 (Dr)",
        "     Inventory                 GHS  6,800 (Dr)",
        "     Accounts payable          GHS  5,100 (Cr)",
        "     Capital                   GHS 22,300 (Cr)",
        "",
        "Q3. Gross profit = Net Sales – COGS = GHS 200,000 – GHS 140,000 = GHS 60,000",
        "     Gross profit ratio = 60,000 / 200,000 × 100 = 30%",
      ],
      Assignment: [
        "INTRODUCTION",
        "This report presents the financial statements prepared from the trial balance",
        "provided, in accordance with IAS standards.",
        "",
        "INCOME STATEMENT (Year ended 31 Dec 2025)",
        "Revenue                                 GHS 200,000",
        "Cost of goods sold                     (GHS 140,000)",
        "                                        ───────────",
        "Gross profit                             GHS  60,000",
        "Operating expenses                      (GHS  18,400)",
        "                                        ───────────",
        "Net profit                               GHS  41,600",
        "",
        "BALANCE SHEET (as at 31 Dec 2025)",
        "Non-current assets                       GHS  85,000",
        "Current assets                           GHS  42,600",
        "Total assets                             GHS 127,600",
        "",
        "Equity                                   GHS  80,000",
        "Non-current liabilities                  GHS  30,000",
        "Current liabilities                      GHS  17,600",
        "Total equity & liabilities               GHS 127,600",
      ],
      Quiz: [
        "Q1.  B — An amount owed to external parties",
        "Q2.  True",
        "Q3.  Assets = Liabilities + Equity",
        "Q4.  Gross profit ratio = 30%",
        "Q5.  C — Revenue expenditure is charged to the P&L",
        "Q6.  A — Capital expenditure is capitalised",
        "Q7.  False — Retained earnings appear on the Balance Sheet",
        "Q8.  D — Matching principle matches expenses to revenue",
      ],
      Exam: [
        "SECTION A — Short answers (30 marks)",
        "",
        "1. Define accrual accounting and explain how it differs from cash accounting.",
        "   Accrual accounting records transactions when they occur, regardless of when",
        "   cash is received or paid. Cash accounting only records when cash changes hands.",
        "",
        "2. Prepare journal entries for the following:",
        "   (a) Purchased goods on credit GHS 12,000",
        "        Dr Purchases  GHS 12,000 / Cr Creditors  GHS 12,000",
        "   (b) Paid creditor GHS 8,000 by cheque",
        "        Dr Creditors  GHS 8,000  / Cr Bank       GHS 8,000",
        "",
        "SECTION B — Extended response (20 marks)",
        "",
        "Discuss the importance of the going concern concept in financial reporting...",
        "[Response continues on page 3]",
      ],
    }[assignment.type] || [];

    return (
      <PageShell breadcrumb={[{ label: "Grade Books" }, { label: course.code }, { label: assignment.title }, { label: submission.studentName }]}>
        {/* Back + nav */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView({ page: "submissions", courseId: view.courseId, assignmentId: view.assignmentId })}
            className="flex items-center gap-2 text-[#6c6c6c] hover:text-[#0a1628] transition-colors"
            style={{ ...S, fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> All Submissions
          </button>

          {/* Student navigation */}
          <div className="flex items-center gap-2">
            <button
              disabled={!prevSub}
              onClick={() => prevSub && openGrade(view.courseId, view.assignmentId, prevSub.studentId)}
              className="flex items-center gap-1 px-3 h-[34px] border border-gray-200 hover:border-[#0a1628] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ ...S, fontSize: "12px", color: "#0a1628" }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
              {currentIdx + 1} of {submitted.length}
            </span>
            <button
              disabled={!nextSub}
              onClick={() => nextSub && openGrade(view.courseId, view.assignmentId, nextSub.studentId)}
              className="flex items-center gap-1 px-3 h-[34px] border border-gray-200 hover:border-[#0a1628] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ ...S, fontSize: "12px", color: "#0a1628" }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Two-column grading layout */}
        <div className="flex gap-5 flex-1">

          {/* ── Left: Submission preview ───────────────────────────── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* File card */}
            <div className="bg-white border border-gray-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0a1628]/5 flex items-center justify-center flex-shrink-0">
                <FileText size={18} className="text-[#0a1628]" />
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                  {assignment.title.replace(/\s+/g, "_")}_{submission.studentName.split(" ")[0]}.pdf
                </p>
                <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 1 }}>
                  {submission.submittedAt ? `Submitted ${formatSubmitTime(submission.submittedAt)}` : "No submission"} · 2.1 MB
                </p>
              </div>
              <TypeBadge type={assignment.type} />
            </div>

            {/* Document preview */}
            <div className="bg-white border border-gray-200 flex-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-[#f9f9f9] flex items-center gap-2">
                <span style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Submission Preview
                </span>
              </div>
              <div className="p-6 overflow-auto" style={{ maxHeight: "480px" }}>
                {/* Document header */}
                <div className="mb-5 pb-4 border-b border-gray-100">
                  <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>{assignment.title}</p>
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>{course.name} — {course.code}</p>
                  <div className="flex items-center gap-6 mt-3">
                    <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Student: <strong>{submission.studentName}</strong></span>
                    <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Max: <strong>{assignment.maxScore} pts</strong></span>
                    {submission.submittedAt && (
                      <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Submitted: <strong>{formatDate(submission.submittedAt.split(" ")[0])}</strong></span>
                    )}
                  </div>
                </div>

                {/* Mock content */}
                <div className="flex flex-col gap-1.5">
                  {previewLines.map((line, i) => (
                    <p
                      key={i}
                      style={{
                        ...S,
                        fontSize: "12px",
                        color: line === "" ? "transparent" : line.startsWith("     ") ? "#6c6c6c" : "#0a1628",
                        lineHeight: 1.8,
                        whiteSpace: "pre",
                        fontFamily: "ui-monospace, monospace",
                      }}
                    >
                      {line || " "}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Grading panel ────────────────────────────────── */}
          <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">

            {/* Student info */}
            <div className="bg-white border border-gray-200 p-4">
              <p style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                Grading
              </p>
              <p style={{ ...S, fontSize: "16px", fontWeight: 700, color: "#0a1628" }}>{submission.studentName}</p>
              <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>{assignment.title}</p>
            </div>

            {/* Score / Rubric panel */}
            <div className="bg-white border border-gray-200 p-4 flex flex-col gap-4">

              {hasRubric ? (
                /* ── Rubric criteria ── */
                <div className="flex flex-col gap-3">
                  <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                    Marking Rubric
                  </label>

                  <div className="border border-gray-200 overflow-hidden">
                    {assignment.rubric!.map((c, i) => {
                      const val     = parseFloat(rubricScores[c.id] || "");
                      const touched = rubricScores[c.id] !== undefined && rubricScores[c.id] !== "";
                      const invalid = touched && (isNaN(val) || val < 0 || val > c.points);
                      const isLast  = i === assignment.rubric!.length - 1;
                      return (
                        <div key={c.id} className={`p-3 ${!isLast ? "border-b border-gray-100" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{c.criterion}</p>
                              {c.description && (
                                <p style={{ ...S, fontSize: "10px", color: "#b0b0b0", marginTop: 1, lineHeight: 1.4 }}>{c.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                              <input
                                type="number"
                                min={0}
                                max={c.points}
                                value={rubricScores[c.id] ?? ""}
                                onChange={e => setRubricScores(prev => ({ ...prev, [c.id]: e.target.value }))}
                                placeholder="—"
                                className={`w-12 text-center border py-1 outline-none text-sm font-bold transition-colors ${
                                  invalid ? "border-red-300" : "border-gray-200 focus:border-[#d4a574]"
                                }`}
                                style={{ ...S, color: "#0a1628" }}
                              />
                              <span style={{ ...S, fontSize: "11px", color: "#b0b0b0" }}>/{c.points}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Total row */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-[#0a1628]">
                      <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#faf8f5" }}>Total</span>
                      <span style={{ ...S, fontSize: "14px", fontWeight: 700, color: allCriteriaFilled && !anyCriterionInvalid ? "#d4a574" : "white" }}>
                        {rubricTotal} / {assignment.maxScore}
                      </span>
                    </div>
                  </div>

                  {anyCriterionInvalid && (
                    <p style={{ ...S, fontSize: "11px", color: "#c0392b" }}>One or more scores are out of range.</p>
                  )}
                  {allCriteriaFilled && !anyCriterionInvalid && (
                    <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                      {Math.round((rubricTotal / assignment.maxScore) * 100)}% · total will be saved as final score
                    </p>
                  )}
                </div>
              ) : (
                /* ── Holistic single score ── */
                <div>
                  <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 10 }}>
                    Score
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={assignment.maxScore}
                      value={editScore}
                      onChange={e => setEditScore(e.target.value)}
                      placeholder="—"
                      className={`w-20 text-center border py-2.5 outline-none transition-colors ${
                        editScore && !scoreValid ? "border-red-300" : "border-gray-200 focus:border-[#d4a574]"
                      }`}
                      style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}
                    />
                    <span style={{ ...S, fontSize: "16px", color: "#b0b0b0" }}>/ {assignment.maxScore}</span>
                  </div>
                  {editScore && !scoreValid && (
                    <p style={{ ...S, fontSize: "11px", color: "#c0392b", marginTop: 4 }}>Must be 0–{assignment.maxScore}</p>
                  )}
                  {scoreValid && (
                    <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 4 }}>
                      {Math.round((scoreVal / assignment.maxScore) * 100)}%
                    </p>
                  )}
                </div>
              )}

              {/* Feedback */}
              <div>
                <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                  Feedback <span style={{ fontWeight: 400, color: "#b0b0b0" }}>(optional)</span>
                </label>
                <textarea
                  value={editFeedback}
                  onChange={e => setEditFeedback(e.target.value)}
                  rows={4}
                  placeholder="Write feedback for the student…"
                  className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#c0c0c0] outline-none focus:border-[#d4a574] resize-none"
                  style={{ ...S, fontSize: "12px", lineHeight: 1.6 }}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                {nextSub ? (
                  <button
                    onClick={handleSaveAndNext}
                    disabled={!scoreValid}
                    className="flex items-center justify-center gap-2 h-[42px] bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ ...S, fontSize: "13px", fontWeight: 600 }}
                  >
                    Save & Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => { handleSave(); setView({ page: "submissions", courseId: view.courseId, assignmentId: view.assignmentId }); }}
                    disabled={!scoreValid}
                    className="flex items-center justify-center gap-2 h-[42px] bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ ...S, fontSize: "13px", fontWeight: 600 }}
                  >
                    <Check size={14} /> Save Grade
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!scoreValid}
                  className="flex items-center justify-center gap-2 h-[42px] border border-gray-200 hover:border-[#0a1628] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}
                >
                  Save only
                </button>
              </div>

              {/* Note for auto-graded */}
              {assignment.method === "auto" && (
                <div className="flex items-start gap-2 bg-[#f8f8f9] border border-gray-200 p-3">
                  <span style={{ ...S, fontSize: "10px", color: "#6c6c6c", lineHeight: 1.5 }}>
                    This is an auto-graded item. You can override the score if needed.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  return null;
}