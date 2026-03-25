import { useState } from "react";
import { useNavigate } from "react-router";
import {
  HelpCircle,
  Clock,
  X,
  ChevronRight,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { QuizTaker, type QuizConfig, type QuizQuestion } from "../components/QuizTaker";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort, type StudentEnrollmentCohort } from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";

type WorkStatus = "Not Started" | "In Progress" | "Submitted" | "Graded";

interface Quiz {
  id: number;
  title: string;
  courseId: number;
  course: string;
  courseCode: string;
  description: string;
  questionCount: number;
  duration: string;
  dueDate: string;
  maxPoints: number;
  status: WorkStatus;
  week?: number;
  grade?: number;
  attempts?: number;
  maxAttempts?: number;
  submittedAt?: string;
  timeLimitMinutes: number | null;
  passingScorePercent: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showFeedback: boolean;
  questions: QuizQuestion[];
}

// ─── Rich quiz data with actual questions ──────────────────────────────

const quizzes: Quiz[] = [
  // Course 1: FA L1 — Trial Balance Concepts (active)
  {
    id: 1001, title: "Trial Balance Concepts", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Test your understanding of trial balance preparation, errors that affect the trial balance, and corrections using suspense accounts.",
    questionCount: 8, duration: "25 min", dueDate: "Mar 20, 2026", maxPoints: 20, status: "Not Started", week: 3,
    maxAttempts: 2, timeLimitMinutes: 25, passingScorePercent: 50, shuffleQuestions: true, shuffleOptions: true, showFeedback: true,
    questions: [
      { id: 1, type: "multiple_choice", text: "Which of the following errors would cause the trial balance to NOT balance?", options: ["Error of commission", "Error of original entry", "Single-sided entry in the ledger", "Error of principle"], correctAnswer: 2, points: 3 },
      { id: 2, type: "true_false", text: "A trial balance that balances proves that no errors have been made in the books of accounts.", correctAnswer: false, points: 2 },
      { id: 3, type: "multiple_choice", text: "The suspense account is used to:", options: ["Record capital transactions", "Temporarily hold trial balance differences until errors are found", "Record depreciation adjustments", "Store prepayment balances"], correctAnswer: 1, points: 3 },
      { id: 4, type: "short_answer", text: "Define the term 'trial balance' and state its primary purpose in accounting.", points: 3 },
      { id: 5, type: "multiple_choice", text: "An error of omission occurs when:", options: ["A transaction is recorded in the wrong account of the correct class", "A transaction is completely left out of the books", "The wrong amount is entered on both sides", "A debit entry is made instead of a credit"], correctAnswer: 1, points: 2 },
      { id: 6, type: "true_false", text: "Compensating errors will cause the trial balance not to balance.", correctAnswer: false, points: 2 },
      { id: 7, type: "multiple_choice", text: "Which of these errors does NOT affect the trial balance?", options: ["Omitting a credit entry", "Posting GHS 500 as GHS 50 on the debit side only", "Recording a sale of GHS 200 as GHS 200 on both sides but in the wrong accounts", "Entering a debit as a credit"], correctAnswer: 2, points: 3 },
      { id: 8, type: "long_answer", text: "Explain the difference between errors of commission and errors of principle. Provide one example of each and describe how they would be corrected.", points: 2, minWords: 80, maxWords: 250 },
    ],
  },
  // Course 1: FA L1 — Double Entry Quiz (graded)
  {
    id: 1002, title: "Double Entry Quiz", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Multiple choice and short-answer questions on debits, credits, and journal entries.",
    questionCount: 6, duration: "20 min", dueDate: "Mar 8, 2026", maxPoints: 15, status: "Graded", week: 2,
    grade: 12, attempts: 1, maxAttempts: 2, submittedAt: "Mar 7, 2026",
    timeLimitMinutes: 20, passingScorePercent: 50, shuffleQuestions: false, shuffleOptions: true, showFeedback: true,
    questions: [
      { id: 10, type: "multiple_choice", text: "In double-entry bookkeeping, every transaction affects at least:", options: ["One account", "Two accounts", "Three accounts", "Four accounts"], correctAnswer: 1, points: 2 },
      { id: 11, type: "true_false", text: "Debit entries always represent increases.", correctAnswer: false, points: 2 },
      { id: 12, type: "multiple_choice", text: "When a business purchases inventory on credit, the correct entry is:", options: ["Debit Cash, Credit Inventory", "Debit Inventory, Credit Accounts Payable", "Debit Accounts Payable, Credit Inventory", "Debit Inventory, Credit Capital"], correctAnswer: 1, points: 3 },
      { id: 13, type: "short_answer", text: "What is the journal entry when a business owner invests GHS 10,000 cash into the business?", points: 3 },
      { id: 14, type: "multiple_choice", text: "Which account normally has a credit balance?", options: ["Equipment", "Rent Expense", "Revenue", "Drawings"], correctAnswer: 2, points: 2 },
      { id: 15, type: "short_answer", text: "Briefly explain why the accounting equation must always balance.", points: 3 },
    ],
  },
  // Course 1: FA L1 — Accounting Principles (graded)
  {
    id: 1003, title: "Accounting Principles", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Foundation quiz covering accounting concepts, the accounting equation, and GAAP.",
    questionCount: 5, duration: "15 min", dueDate: "Feb 22, 2026", maxPoints: 10, status: "Graded", week: 1,
    grade: 9, attempts: 1, maxAttempts: 2, submittedAt: "Feb 21, 2026",
    timeLimitMinutes: 15, passingScorePercent: 50, shuffleQuestions: false, shuffleOptions: false, showFeedback: true,
    questions: [
      { id: 20, type: "multiple_choice", text: "The accounting equation is:", options: ["Assets = Liabilities − Equity", "Assets = Liabilities + Equity", "Assets + Liabilities = Equity", "Equity = Assets + Liabilities"], correctAnswer: 1, points: 2 },
      { id: 21, type: "true_false", text: "The going concern concept assumes a business will continue to operate for the foreseeable future.", correctAnswer: true, points: 2 },
      { id: 22, type: "multiple_choice", text: "Which accounting principle requires expenses to be recorded in the same period as the revenues they help generate?", options: ["Prudence", "Matching principle", "Consistency", "Materiality"], correctAnswer: 1, points: 2 },
      { id: 23, type: "short_answer", text: "Name two users of financial statements and explain why they need accounting information.", points: 2 },
      { id: 24, type: "true_false", text: "Under the accrual basis of accounting, revenue is recognised only when cash is received.", correctAnswer: false, points: 2 },
    ],
  },
  // Course 2: FA L2 — Partnership Accounts (active)
  {
    id: 2001, title: "Partnership Accounts", courseId: 2, course: "Financial Accounting Level 2", courseCode: "FA L2",
    description: "Questions on partnership formation, profit sharing ratios, goodwill treatment, and dissolution procedures.",
    questionCount: 7, duration: "20 min", dueDate: "Mar 18, 2026", maxPoints: 18, status: "Not Started", week: 2,
    maxAttempts: 2, timeLimitMinutes: 20, passingScorePercent: 50, shuffleQuestions: true, shuffleOptions: true, showFeedback: true,
    questions: [
      { id: 30, type: "multiple_choice", text: "In the absence of a partnership agreement, profits are shared:", options: ["In the ratio of capital contributions", "Equally among all partners", "Based on seniority", "As determined by the managing partner"], correctAnswer: 1, points: 2 },
      { id: 31, type: "true_false", text: "Goodwill must always be recorded in the books when a new partner is admitted.", correctAnswer: false, points: 2 },
      { id: 32, type: "multiple_choice", text: "When a partner withdraws, the goodwill treatment under the 'full goodwill method' involves:", options: ["Writing off goodwill immediately", "Raising goodwill and then writing it off", "Only recording goodwill in the retiring partner's capital account", "Ignoring goodwill entirely"], correctAnswer: 1, points: 3 },
      { id: 33, type: "short_answer", text: "What is a 'realisation account' and when is it prepared?", points: 3 },
      { id: 34, type: "multiple_choice", text: "A partner's current account shows:", options: ["Only the capital invested", "Drawings, salary, interest on capital, and share of profit", "Only drawings made", "The partner's personal assets"], correctAnswer: 1, points: 2 },
      { id: 35, type: "true_false", text: "Partners can agree to share profits in any ratio they choose, regardless of capital contributions.", correctAnswer: true, points: 2 },
      { id: 36, type: "long_answer", text: "Explain the process of admitting a new partner into an existing partnership. Discuss how goodwill is treated and how the new profit-sharing ratio is determined.", points: 4, minWords: 100, maxWords: 300 },
    ],
  },
  // Course 2: FA L2 — Company Accounts Basics (graded)
  {
    id: 2002, title: "Company Accounts Basics", courseId: 2, course: "Financial Accounting Level 2", courseCode: "FA L2",
    description: "Quiz on share capital, reserves, and basic company account structures.",
    questionCount: 5, duration: "15 min", dueDate: "Feb 25, 2026", maxPoints: 10, status: "Graded", week: 1,
    grade: 7, attempts: 2, maxAttempts: 2, submittedAt: "Feb 24, 2026",
    timeLimitMinutes: 15, passingScorePercent: 50, shuffleQuestions: false, shuffleOptions: false, showFeedback: true,
    questions: [
      { id: 40, type: "multiple_choice", text: "Ordinary share capital represents:", options: ["Debt owed by the company", "Ownership interest with voting rights", "Government bonds held", "Short-term liabilities"], correctAnswer: 1, points: 2 },
      { id: 41, type: "true_false", text: "Preference shareholders always receive dividends before ordinary shareholders.", correctAnswer: true, points: 2 },
      { id: 42, type: "multiple_choice", text: "The share premium account arises when:", options: ["Shares are issued below par value", "Shares are issued above par value", "The company makes a profit", "Dividends are declared"], correctAnswer: 1, points: 2 },
      { id: 43, type: "short_answer", text: "What is the difference between authorised share capital and issued share capital?", points: 2 },
      { id: 44, type: "true_false", text: "Retained earnings can be distributed as dividends.", correctAnswer: true, points: 2 },
    ],
  },
  // Course 3: MA — Costing Methods Quiz (active)
  {
    id: 3001, title: "Costing Methods Quiz", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Test your knowledge of absorption costing versus marginal costing, with practical calculation examples.",
    questionCount: 7, duration: "20 min", dueDate: "Mar 15, 2026", maxPoints: 18, status: "Not Started", week: 2,
    maxAttempts: 2, timeLimitMinutes: 20, passingScorePercent: 50, shuffleQuestions: true, shuffleOptions: true, showFeedback: true,
    questions: [
      { id: 50, type: "multiple_choice", text: "Under absorption costing, fixed manufacturing overheads are:", options: ["Treated as a period cost", "Included in the cost of each unit produced", "Ignored entirely", "Only included when units are sold"], correctAnswer: 1, points: 2 },
      { id: 51, type: "true_false", text: "Marginal costing treats all fixed costs as period costs.", correctAnswer: true, points: 2 },
      { id: 52, type: "multiple_choice", text: "If production exceeds sales in a period, absorption costing will report:", options: ["Lower profit than marginal costing", "The same profit as marginal costing", "Higher profit than marginal costing", "A loss regardless of sales"], correctAnswer: 2, points: 3 },
      { id: 53, type: "short_answer", text: "A product has variable costs of GHS 30 per unit and sells for GHS 50. Fixed costs total GHS 40,000. Calculate the break-even point in units.", points: 3 },
      { id: 54, type: "multiple_choice", text: "Contribution per unit is calculated as:", options: ["Selling price − Total cost", "Selling price − Variable cost per unit", "Selling price − Fixed cost per unit", "Total revenue − Total cost"], correctAnswer: 1, points: 2 },
      { id: 55, type: "true_false", text: "The contribution margin ratio is useful for multi-product break-even analysis.", correctAnswer: true, points: 2 },
      { id: 56, type: "long_answer", text: "A company produces 10,000 units with variable costs of GHS 25/unit and fixed costs of GHS 100,000. Selling price is GHS 45/unit. Compare the profit reported under absorption costing and marginal costing if only 8,000 units are sold. Show your workings.", points: 4, minWords: 100, maxWords: 400 },
    ],
  },
  // Course 3: MA — Cost Classification (graded)
  {
    id: 3002, title: "Cost Classification", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Quick quiz on classifying costs as fixed, variable, direct, and indirect.",
    questionCount: 5, duration: "15 min", dueDate: "Feb 20, 2026", maxPoints: 10, status: "Graded", week: 1,
    grade: 7, attempts: 1, maxAttempts: 2, submittedAt: "Feb 19, 2026",
    timeLimitMinutes: 15, passingScorePercent: 50, shuffleQuestions: false, shuffleOptions: false, showFeedback: true,
    questions: [
      { id: 60, type: "multiple_choice", text: "Factory rent is classified as:", options: ["Direct variable cost", "Indirect fixed cost", "Direct fixed cost", "Variable overhead"], correctAnswer: 1, points: 2 },
      { id: 61, type: "true_false", text: "Direct materials are always variable costs.", correctAnswer: true, points: 2 },
      { id: 62, type: "multiple_choice", text: "Which of the following is a semi-variable cost?", options: ["Raw materials", "Factory rent", "Electricity (with a standing charge plus usage)", "Depreciation (straight-line)"], correctAnswer: 2, points: 2 },
      { id: 63, type: "short_answer", text: "Give two examples of indirect costs in a manufacturing business.", points: 2 },
      { id: 64, type: "true_false", text: "Stepped costs remain constant over all activity levels.", correctAnswer: false, points: 2 },
    ],
  },
];

const isActive = (s: WorkStatus) => s === "Not Started" || s === "In Progress";
const isHistory = (s: WorkStatus) => s === "Submitted" || s === "Graded";

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

export function StudentQuizzesPage() {
  const navigate = useNavigate();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [takingQuiz, setTakingQuiz] = useState<Quiz | null>(null);
  const [courseFilter, setCourseFilter] = useState<number | null>(null);

  const activeQuizzes = quizzes.filter((q) => isActive(q.status) && (!courseFilter || q.courseId === courseFilter));
  const historyQuizzes = quizzes.filter((q) => isHistory(q.status) && (!courseFilter || q.courseId === courseFilter));

  const enrolledCourses = COURSES.filter((c) => [1, 2, 3].includes(c.id)).map((c) => ({
    ...c,
    enrolledCohort: getStudentEnrollmentCohort(c.id) as StudentEnrollmentCohort,
  }));

  const buildConfig = (q: Quiz): QuizConfig => ({
    id: q.id,
    title: q.title,
    course: q.course,
    courseCode: q.courseCode,
    description: q.description,
    questions: q.questions,
    timeLimitMinutes: q.timeLimitMinutes,
    passingScorePercent: q.passingScorePercent,
    maxAttempts: q.maxAttempts ?? 1,
    currentAttempt: (q.attempts ?? 0) + 1,
    shuffleQuestions: q.shuffleQuestions,
    shuffleOptions: q.shuffleOptions,
    showFeedback: q.showFeedback,
    week: q.week,
    dueDate: q.dueDate,
  });

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Quizzes" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>Quizzes</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                View and take quizzes across all your courses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={courseFilter ?? ""}
                onChange={(e) => setCourseFilter(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-1.5 rounded-lg bg-[#f3f3f5] border border-[#e2e2e5] text-[#3a3a42] outline-none focus:border-[#8e8e96] transition-colors cursor-pointer appearance-none pr-7"
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238e8e96' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                }}
              >
                <option value="">All Courses</option>
                {enrolledCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {studentCourseTitle(c, c.enrolledCohort)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CollapsibleSection label="Active" count={activeQuizzes.length} emptyText="No active quizzes right now.">
            {activeQuizzes.map((q) => (
              <QuizRow key={q.id} q={q} onClick={() => setSelectedQuiz(q)} />
            ))}
          </CollapsibleSection>

          <CollapsibleSection label="History" count={historyQuizzes.length} emptyText="No completed quizzes yet." defaultCollapsed>
            {historyQuizzes.map((q) => (
              <QuizRow key={q.id} q={q} onClick={() => setSelectedQuiz(q)} />
            ))}
          </CollapsibleSection>
        </main>
      </div>

      {/* Detail modal (before starting) */}
      {selectedQuiz && !takingQuiz && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0]">
              <div className="flex-1 min-w-0 pr-4">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>{selectedQuiz.title}</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>
                  {selectedQuiz.course}{selectedQuiz.week ? ` · Week ${selectedQuiz.week}` : ""}
                </p>
              </div>
              <button onClick={() => setSelectedQuiz(null)} className="text-[#8e8e96] hover:text-[#0a1628] flex-shrink-0"><X size={18} /></button>
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className={`px-2 py-1 rounded-md ${statusStyle(selectedQuiz.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
                  {statusLabel(selectedQuiz.status, selectedQuiz.grade, selectedQuiz.maxPoints)}
                </span>
                <span className="flex items-center gap-1 text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  <Clock size={12} /> Due {selectedQuiz.dueDate}
                </span>
              </div>

              <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mb-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3a3a42", lineHeight: 1.6 }}>{selectedQuiz.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>{selectedQuiz.questions.length}</p>
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

              {isActive(selectedQuiz.status) && (
                <button
                  onClick={() => { setTakingQuiz(selectedQuiz); setSelectedQuiz(null); }}
                  className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  Start Quiz
                </button>
              )}

              {selectedQuiz.status === "Graded" && selectedQuiz.attempts !== undefined && selectedQuiz.maxAttempts !== undefined && selectedQuiz.attempts < selectedQuiz.maxAttempts && (
                <button
                  onClick={() => { setTakingQuiz(selectedQuiz); setSelectedQuiz(null); }}
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

      {/* Quiz Taker */}
      {takingQuiz && (
        <QuizTaker
          config={buildConfig(takingQuiz)}
          onClose={() => setTakingQuiz(null)}
          onComplete={(score, total) => {
            // In a real app this would update the quiz status
          }}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
function CollapsibleSection({ label, count, emptyText, defaultCollapsed = false, children }: {
  label: string; count: number; emptyText: string; defaultCollapsed?: boolean; children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 mb-3 group">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span className="px-1.5 py-0.5 rounded bg-[#ebebee] text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>{count}</span>
        {collapsed ? <ChevronRight size={14} className="text-[#b0b0b5] group-hover:text-[#8e8e96]" /> : <ChevronDown size={14} className="text-[#b0b0b5] group-hover:text-[#8e8e96]" />}
      </button>
      {!collapsed && (count > 0 ? <div className="flex flex-col gap-2">{children}</div> : (
        <div className="bg-[#fafafb] rounded-xl border border-[#ededf0] py-10 px-6 text-center">
          <HelpCircle size={22} className="mx-auto mb-3 text-[#cdcdd2]" />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#5a5a62" }}>{emptyText}</p>
        </div>
      ))}
    </div>
  );
}

function QuizRow({ q, onClick }: { q: Quiz; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-xl border border-[#ebebee] px-5 py-4 text-left hover:border-[#cdcdd2] hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#f3f3f5] flex items-center justify-center flex-shrink-0">
          <HelpCircle size={16} className="text-[#8e8e96]" />
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{q.title}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{q.courseCode}</span>
            {q.week && <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>Week {q.week}</span>}
            <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{q.questions.length} Qs · {q.duration}</span>
            <span className="flex items-center gap-1 text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}><Clock size={10} /> {q.dueDate}</span>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-md flex-shrink-0 ${statusStyle(q.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
          {statusLabel(q.status, q.grade, q.maxPoints)}
        </span>
        <ChevronRight size={15} className="text-[#cdcdd2] group-hover:text-[#8e8e96] transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}
