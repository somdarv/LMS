import { useState } from "react";
import { useNavigate } from "react-router";
import { BookMarked, X, FileText, Clock, MessageSquare, Users2 } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";

interface GradeEntry {
  id: number;
  assignment: string;
  course: string;
  courseCode: string;
  type: "Assignment" | "Quiz" | "Group Assignment";
  grade: number | null;
  maxPoints: number;
  status: "Graded" | "Pending" | "Submitted";
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  fileName?: string;
  groupName?: string;
}

const grades: GradeEntry[] = [
  { id: 1, assignment: "Double Entry Practice Set", course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1", type: "Assignment", grade: 45, maxPoints: 50, status: "Graded", feedback: "Excellent work! Your journal entries were accurate and well-presented. Minor error in the trial balance totals — check your suspense account.", submittedAt: "Mar 4, 2026", gradedAt: "Mar 7, 2026", fileName: "DoubleEntry_KojoManu.pdf" },
  { id: 2, assignment: "Budget Preparation Exercise", course: "Management Accounting Level 1 - Weekday", courseCode: "MA L1", type: "Assignment", grade: null, maxPoints: 70, status: "Submitted", submittedAt: "Feb 28, 2026", fileName: "MasterBudget_KojoManu.pdf" },
  { id: 3, assignment: "Week 2 Quiz: Double Entry", course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1", type: "Quiz", grade: 8, maxPoints: 10, status: "Graded", gradedAt: "Feb 25, 2026" },
  { id: 4, assignment: "Essay on Financial Statements", course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1", type: "Assignment", grade: null, maxPoints: 100, status: "Pending" },
  { id: 5, assignment: "Week 1 Quiz: Cost Classification", course: "Management Accounting Level 1 - Weekday", courseCode: "MA L1", type: "Quiz", grade: 7, maxPoints: 10, status: "Graded", gradedAt: "Feb 20, 2026" },
  { id: 6, assignment: "Company Accounts Exercise", course: "Financial Accounting Level 2 - Weekend", courseCode: "FA L2", type: "Assignment", grade: 52, maxPoints: 60, status: "Graded", feedback: "Good understanding of share capital and reserves. Your consolidation workings were mostly correct. Review the treatment of inter-company balances.", submittedAt: "Feb 22, 2026", gradedAt: "Feb 26, 2026", fileName: "CompanyAccounts_KojoManu.pdf" },
  { id: 7, assignment: "Group Case Study: Balance Sheet Analysis", course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1", type: "Group Assignment", grade: 34, maxPoints: 40, status: "Graded", feedback: "Strong analysis with well-structured arguments. Good team collaboration evident in the submission.", gradedAt: "Mar 5, 2026", groupName: "Group Gamma" },
];

const filterTabs = ["All", "Graded", "Pending"] as const;

export function StudentGradesPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<(typeof filterTabs)[number]>("All");
  const [selectedGrade, setSelectedGrade] = useState<GradeEntry | null>(null);

  const filtered = grades.filter((g) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Graded") return g.status === "Graded";
    if (activeFilter === "Pending") return g.status === "Pending" || g.status === "Submitted";
    return true;
  });

  const gradedItems = grades.filter((g) => g.status === "Graded" && g.grade !== null);
  const totalEarned = gradedItems.reduce((s, g) => s + (g.grade || 0), 0);
  const totalPossible = gradedItems.reduce((s, g) => s + g.maxPoints, 0);
  const overallPercent = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Grades" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div>
            <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>My Grades</h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
              Track your performance across all courses
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#d4a574" }}>{overallPercent}%</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Overall Average</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#0a1628" }}>{gradedItems.length}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Graded Items</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", fontWeight: 700, color: "#0a1628" }}>
                {grades.filter((g) => g.status === "Pending" || g.status === "Submitted").length}
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>Awaiting Grade</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-0 border-b border-gray-200">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2.5 transition-colors ${
                  activeFilter === tab
                    ? "border-b-2 border-[#d4a574] text-[#0a1628]"
                    : "text-[#6c6c6c] hover:text-[#0a1628]"
                }`}
                style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: activeFilter === tab ? 600 : 400 }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Grades Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#f8f8f9] border-b border-gray-100">
                  {["Assignment", "Course", "Type", "Grade", "Status", "Feedback"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((g) => (
                  <tr key={g.id} className="border-b border-gray-50 hover:bg-[#fafafa] transition-colors">
                    <td className="px-4 py-3">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>{g.assignment}</p>
                      {g.groupName && (
                        <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-[#fdf3e7] border border-[#d4a574]/30 text-[#a68b5b]"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700 }}>
                          <Users2 size={9} /> {g.groupName}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                        {g.courseCode}
                      </span>
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
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b0" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full ${g.status === "Graded" ? "bg-[rgba(212,165,116,0.15)] text-[#d4a574]" : g.status === "Submitted" ? "bg-[#e8e8ea] text-[#5a5a62]" : "bg-gray-100 text-[#6c6c6c]"}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {g.feedback ? (
                        <button
                          onClick={() => setSelectedGrade(g)}
                          className="px-3 py-1 rounded-lg bg-[#f3f3f5] text-[#5a5a62] hover:bg-[#e8e8ea] transition-colors"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}
                        >
                          View
                        </button>
                      ) : (
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b0" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Grade Detail Modal */}
      {selectedGrade && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[500px] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 700, color: "#0a1628" }}>Grade Detail</p>
              <button onClick={() => setSelectedGrade(null)} className="text-[#6c6c6c] hover:text-[#0a1628]"><X size={18} /></button>
            </div>
            <div className="px-6 py-5">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>{selectedGrade.assignment}</p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>{selectedGrade.course}</p>

              <div className="bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.25)] rounded-lg p-4 mt-4 text-center">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "32px", fontWeight: 700, color: "#d4a574" }}>
                  {selectedGrade.grade}/{selectedGrade.maxPoints}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6c6c6c", marginTop: 2 }}>
                  {Math.round(((selectedGrade.grade || 0) / selectedGrade.maxPoints) * 100)}%
                </p>
              </div>

              {selectedGrade.feedback && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-[#d4a574]" />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Instructor Feedback</p>
                  </div>
                  <div className="bg-[#f8f8f9] rounded-lg p-4">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", lineHeight: 1.7 }}>
                      {selectedGrade.feedback}
                    </p>
                  </div>
                </div>
              )}

              {selectedGrade.fileName && (
                <div className="mt-4">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 6 }}>Your Submission</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f8f9]">
                    <FileText size={16} className="text-[#d4a574]" />
                    <div className="flex-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: "#0a1628" }}>{selectedGrade.fileName}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>Submitted {selectedGrade.submittedAt}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedGrade.gradedAt && (
                <div className="flex items-center gap-1.5 mt-4 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
                  <Clock size={12} /> Graded on {selectedGrade.gradedAt}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}