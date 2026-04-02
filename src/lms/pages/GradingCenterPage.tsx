import { useState, useEffect, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, ChevronRight, Check, X, Send, Download,
  ClipboardList, AlertTriangle, Clock, CheckCircle2, Users2,
  RotateCcw,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { CoursePageShell } from "../components/CoursePageShell";
import {
  GRADING_DATA, autoScore,
  type Submission, type AssignmentGrading, type SubStatus, type StudentAnswer,
} from "../data/gradingData";
import { COURSES } from "../data/courses";
import { studentCourseShortLabel } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };
const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) +
  " · " + new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: SubStatus }) {
  const map: Record<SubStatus, { label: string; cls: string }> = {
    graded:    { label: "Graded",    cls: "bg-[#0a1628] text-white" },
    submitted: { label: "Submitted", cls: "bg-gray-100 text-[#6c6c6c]" },
    late:      { label: "Late",      cls: "bg-[#d4a574]/20 text-[#0a1628] border border-[#d4a574]" },
    missing:   { label: "Missing",   cls: "bg-gray-100 text-[#b0b0b0]" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`px-1.5 py-0.5 ${cls}`} style={{ ...S, fontSize: "9px", fontWeight: 700 }}>
      {label}
    </span>
  );
}

// ─── Source badge ──────────────────────────────────────────────────────────────

function SourceBadge({ source }: { source: "auto" | "manual" | null }) {
  if (!source) return null;
  return (
    <span
      className={source === "auto" ? "bg-[#d4a574] text-[#0a1628]" : "bg-[#0a1628] text-white"}
      style={{ ...S, fontSize: "8px", fontWeight: 700, padding: "1px 5px" }}
    >
      {source === "auto" ? "A" : "M"}
    </span>
  );
}

// ─── Submission list (left panel) ─────────────────────────────────────────────

type Filter = "All" | "Ungraded" | "Graded" | "Late" | "Missing";

function SubmissionList({
  submissions, selectedId, onSelect, maxScore,
}: {
  submissions: Submission[]; selectedId: string | null; onSelect: (id: string) => void; maxScore: number;
}) {
  const [filter, setFilter] = useState<Filter>("All");

  const counts: Record<Filter, number> = {
    All:      submissions.length,
    Ungraded: submissions.filter(s => s.status === "submitted").length,
    Graded:   submissions.filter(s => s.status === "graded").length,
    Late:     submissions.filter(s => s.status === "late").length,
    Missing:  submissions.filter(s => s.status === "missing").length,
  };

  const visible = submissions.filter(s => {
    if (filter === "All")      return true;
    if (filter === "Ungraded") return s.status === "submitted";
    if (filter === "Graded")   return s.status === "graded";
    if (filter === "Late")     return s.status === "late";
    if (filter === "Missing")  return s.status === "missing";
    return true;
  });

  return (
    <div className="w-[280px] flex-shrink-0 flex flex-col border-r border-gray-200 bg-white">
      {/* Filter tabs */}
      <div className="border-b border-gray-100 flex flex-wrap">
        {(["All","Ungraded","Graded","Late","Missing"] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-2.5 py-2 text-center border-b-2 transition-colors ${filter === f ? "border-[#d4a574] text-[#0a1628]" : "border-transparent text-[#6c6c6c] hover:text-[#0a1628]"}`}
            style={{ ...S, fontSize: "11px", fontWeight: filter === f ? 700 : 400 }}
          >
            {f}
            <span className="ml-1" style={{ fontSize: "10px", color: filter === f ? "#d4a574" : "#b0b0b0" }}>
              {counts[f]}
            </span>
          </button>
        ))}
      </div>
      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 && (
          <p className="p-6 text-center" style={{ ...S, fontSize: "12px", color: "#b0b0b0" }}>None in this category</p>
        )}
        {visible.map(sub => (
          <button key={sub.id} onClick={() => onSelect(sub.id)}
            className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors flex gap-3 ${
              sub.status === "late" ? "border-l-2 border-l-[#d4a574]" : "border-l-2 border-l-transparent"
            } ${selectedId === sub.id ? "bg-[#0a1628]/5" : "hover:bg-gray-50"}`}
          >
            {/* Avatar */}
            {sub.groupMeta ? (
              <div className="w-8 h-8 rounded-lg bg-[#d4a574]/20 flex items-center justify-center flex-shrink-0">
                <Users2 size={14} className="text-[#a68b5b]" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0a1628]/10 flex items-center justify-center flex-shrink-0"
                style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#0a1628" }}>
                {sub.initials}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="truncate" style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                  {sub.groupMeta ? sub.groupMeta.groupName : sub.name}
                </span>
                <SourceBadge source={sub.source} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <StatusChip status={sub.status} />
                {sub.score !== null && (
                  <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#0a1628" }}>
                    {sub.score}/{maxScore}
                  </span>
                )}
              </div>
              {sub.groupMeta && (
                <p className="mt-0.5" style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>
                  {sub.groupMeta.memberIds.length} members
                </p>
              )}
              {sub.submittedAt && (
                <p className="mt-0.5" style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>
                  {new Date(sub.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Manual grader (right panel) ──────────────────────────────────────────────

function ManualGrader({
  grading, submissions, selectedId, onSave, onSaveAndNext, allowResubmit,
}: {
  grading: AssignmentGrading;
  submissions: Submission[];
  selectedId: string | null;
  onSave: (id: string, score: number, rubric: Record<string, number>, feedback: string) => void;
  onSaveAndNext: (id: string, score: number, rubric: Record<string, number>, feedback: string) => void;
  allowResubmit?: boolean;
}) {
  const sub = submissions.find(s => s.id === selectedId);

  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!sub) return;
    setRubricScores(sub.status === "graded" ? { ...sub.rubricScores } : {});
    setFeedback(sub.feedback ?? "");
  }, [selectedId]);

  if (!sub) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#fafafa]">
        <ClipboardList size={36} className="text-gray-200" />
        <p style={{ ...S, fontSize: "13px", color: "#b0b0b0" }}>Select a submission to start grading</p>
      </div>
    );
  }

  if (sub.status === "missing") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[#fafafa]">
        <AlertTriangle size={36} className="text-gray-300" />
        <p style={{ ...S, fontSize: "13px", color: "#b0b0b0" }}>No submission — student did not submit</p>
      </div>
    );
  }

  const total = grading.rubric.reduce((sum, r) => sum + (rubricScores[r.id] ?? 0), 0);
  const maxTotal = grading.maxScore;

  const setScore = (id: string, val: string, max: number) => {
    const n = parseFloat(val);
    if (val === "" || isNaN(n)) {
      setRubricScores(p => { const c = { ...p }; delete c[id]; return c; });
      return;
    }
    setRubricScores(p => ({ ...p, [id]: Math.min(Math.max(0, n), max) }));
  };

  const isComplete = grading.rubric.every(r => rubricScores[r.id] !== undefined);

  const handleSave = () => {
    if (!isComplete) return;
    onSave(sub.id, total, rubricScores, feedback);
  };

  const handleSaveAndNext = () => {
    if (!isComplete) return;
    onSaveAndNext(sub.id, total, rubricScores, feedback);
  };

  // Next ungraded student
  const ungradedIds = submissions.filter(s => s.status === "submitted" || s.status === "late").map(s => s.id);
  const curIdx = ungradedIds.indexOf(sub.id);
  const nextId = ungradedIds[curIdx + 1] ?? null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Student header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0a1628]/10 flex items-center justify-center"
            style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#0a1628" }}>
            {sub.initials}
          </div>
          <div>
            <p style={{ ...S, fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{sub.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusChip status={sub.status} />
              {sub.submittedAt && (
                <span style={{ ...S, fontSize: "11px", color: "#b0b0b0" }}>{fmt(sub.submittedAt)}</span>
              )}
            </div>
          </div>
        </div>
        {sub.status === "graded" && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1628]/5">
            <Check size={12} className="text-[#d4a574]" />
            <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#0a1628" }}>
              Previously graded: {sub.score}/{maxTotal}
            </span>
          </div>
        )}
        {allowResubmit && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4a574]/10 border border-[#d4a574]/30">
            <RotateCcw size={11} className="text-[#a68b5b]" />
            <span style={{ ...S, fontSize: "11px", fontWeight: 600, color: "#0a1628" }}>
              Attempt {sub.status === "graded" ? 1 : 1} · Resubmission allowed
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Group banner */}
        {sub.groupMeta && (
          <div className="mx-5 mt-4 p-3 bg-[#fdf8f3] border border-[#d4a574]/40 rounded-lg flex items-start gap-2 flex-shrink-0">
            <Users2 size={14} className="text-[#a68b5b] flex-shrink-0 mt-0.5" />
            <div>
              <p style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#0a1628" }}>
                Grade applies to all {sub.groupMeta.memberIds.length} members · {sub.groupMeta.groupName}
              </p>
              <p style={{ ...S, fontSize: "11px", color: "#8a8a8a", marginTop: 2 }}>
                Submitted by student #{sub.groupMeta.submittedByStudentId}
              </p>
            </div>
          </div>
        )}

        {/* Submission content */}
        {sub.submissionText && (
          <div className="p-5 flex-shrink-0">
            <p className="mb-2" style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Submission
            </p>
            <div className="bg-[#f9f9f9] border border-gray-200 px-4 py-3 max-h-52 overflow-y-auto">
              <pre style={{ ...S, fontSize: "12px", color: "#3a3a3a", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {sub.submissionText}
              </pre>
            </div>
          </div>
        )}

        {/* Rubric grader */}
        <div className="px-5 pb-5">
          <p className="mb-3" style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Marking Rubric
          </p>
          <div className="border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_120px] gap-0 bg-[#f9f9f9] border-b border-gray-200 px-4 py-2">
              {["Criterion", "Max", "Score", ""].map(h => (
                <span key={h} style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {grading.rubric.map((r, i) => {
              const val = rubricScores[r.id];
              const pct = val !== undefined ? (val / r.max) * 100 : 0;
              return (
                <div key={r.id} className={`grid grid-cols-[1fr_auto_auto_120px] gap-0 items-center px-4 py-3 ${i < grading.rubric.length - 1 ? "border-b border-gray-100" : ""}`}>
                  <div>
                    <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{r.criterion}</p>
                    <p style={{ ...S, fontSize: "11px", color: "#8a8a8a" }}>{r.description}</p>
                  </div>
                  <span className="px-4 text-right" style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>{r.max}</span>
                  <input
                    type="number" min={0} max={r.max} step={0.5}
                    value={val !== undefined ? val : ""}
                    onChange={e => setScore(r.id, e.target.value, r.max)}
                    placeholder="—"
                    className="w-14 px-2 py-1 border border-gray-200 outline-none text-center focus:border-[#d4a574] mx-2"
                    style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}
                  />
                  {/* Mini progress bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#d4a574] rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>{Math.round(pct)}%</span>
                  </div>
                </div>
              );
            })}
            {/* Total row */}
            <div className="grid grid-cols-[1fr_auto_auto_120px] gap-0 items-center px-4 py-3 bg-[#0a1628] border-t-2 border-gray-300">
              <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#faf8f5" }}>Total Score</span>
              <span className="px-4 text-right" style={{ ...S, fontSize: "12px", color: "#d4a574" }}>{maxTotal}</span>
              <span className="mx-2 w-14 text-center" style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#d4a574" }}>{total}</span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-[#d4a574] rounded-full transition-all" style={{ width: `${(total / maxTotal) * 100}%` }} />
                </div>
                <span style={{ ...S, fontSize: "10px", color: "#d4a574" }}>{Math.round((total / maxTotal) * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="mt-4">
            <p className="mb-2" style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Feedback to Student
            </p>
            <textarea rows={4} value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder="Write constructive feedback explaining the marks awarded and areas for improvement…"
              className="w-full border border-gray-200 px-3 py-2.5 outline-none resize-none focus:border-[#d4a574]"
              style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleSave} disabled={!isComplete}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              style={{ ...S, fontSize: "13px", fontWeight: 700 }}>
              <Check size={14} /> Save Grade
            </button>
            {nextId && (
              <button
                onClick={() => { if (isComplete) onSaveAndNext(sub.id, total, rubricScores, feedback); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ ...S, fontSize: "13px", fontWeight: 600 }}
                disabled={!isComplete}>
                Save & Next <ChevronRight size={14} />
              </button>
            )}
            {!isComplete && (
              <span style={{ ...S, fontSize: "11px", color: "#b0b0b0" }}>Fill all criteria to save</span>
            )}
            {allowResubmit && isComplete && (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2.5 border border-[#d4a574] text-[#d4a574] hover:bg-[#d4a574]/10 transition-colors ml-auto"
                style={{ ...S, fontSize: "12px", fontWeight: 600 }}>
                <RotateCcw size={13} /> Request Resubmission
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auto grader (right panel) ────────────────────────────────────────────────

function AutoGrader({
  grading, submissions, selectedId, onSelect, onOverride,
}: {
  grading: AssignmentGrading;
  submissions: Submission[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOverride: (subId: string, qId: string, pts: number) => void;
}) {
  const sub = submissions.find(s => s.id === selectedId);
  const questions = grading.questions ?? [];

  if (!sub) {
    // Class overview
    const scores = submissions.map(s => s.score ?? 0);
    const avg    = scores.reduce((a, b) => a + b, 0) / scores.length;
    const hi     = Math.max(...scores);
    const lo     = Math.min(...scores);

    // Distribution buckets
    const max = grading.maxScore;
    const bands = [
      { label: "90–100%", lo: max * 0.9, hi: max },
      { label: "70–89%",  lo: max * 0.7, hi: max * 0.89 },
      { label: "50–69%",  lo: max * 0.5, hi: max * 0.69 },
      { label: "<50%",    lo: 0,         hi: max * 0.49 },
    ];

    return (
      <div className="flex-1 overflow-y-auto p-6 bg-[#fafafa]">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Graded",  value: `${submissions.filter(s => s.status === "graded").length}/${submissions.length}` },
            { label: "Average", value: `${avg.toFixed(1)}/${max}` },
            { label: "Highest", value: `${hi}/${max}` },
            { label: "Lowest",  value: `${lo}/${max}` },
          ].map(c => (
            <div key={c.label} className="bg-white border border-gray-200 px-4 py-3">
              <p style={{ ...S, fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>{c.value}</p>
              <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{c.label}</p>
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div className="bg-white border border-gray-200 p-5 mb-5">
          <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628", marginBottom: 16 }}>Score Distribution</p>
          <div className="flex items-end gap-4 h-24">
            {bands.map(b => {
              const count = submissions.filter(s => (s.score ?? 0) >= b.lo && (s.score ?? 0) <= b.hi).length;
              const h = submissions.length > 0 ? Math.max((count / submissions.length) * 100, count > 0 ? 12 : 0) : 0;
              return (
                <div key={b.label} className="flex flex-col items-center gap-1 flex-1">
                  <p style={{ ...S, fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{count}</p>
                  <div className="w-full bg-[#d4a574] transition-all" style={{ height: `${h}%`, minHeight: count > 0 ? 6 : 0 }} />
                  <p className="text-center" style={{ ...S, fontSize: "10px", color: "#6c6c6c" }}>{b.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Student table */}
        <div className="bg-white border border-gray-200">
          <p className="px-4 py-3 border-b border-gray-100" style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#6c6c6c" }}>
            Click a student to review their answers
          </p>
          {submissions.map(s => {
            const pct = Math.round(((s.score ?? 0) / max) * 100);
            const correct = s.answers?.filter((a, i) => {
              const q = questions[i];
              return q && a.chosen === q.correct;
            }).length ?? 0;
            return (
              <button key={s.id} onClick={() => onSelect(s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-left transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#0a1628]/10 flex items-center justify-center flex-shrink-0"
                  style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#0a1628" }}>{s.initials}</div>
                <p className="flex-1" style={{ ...S, fontSize: "12px", fontWeight: 500, color: "#0a1628" }}>{s.name}</p>
                <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{correct}/{questions.length} correct</span>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mx-2">
                  <div className="h-full bg-[#d4a574] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>{s.score}</span>
                <ChevronRight size={13} className="text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Per-student Q&A breakdown
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => onSelect("")} className="p-1.5 hover:bg-gray-100">
            <ArrowLeft size={14} className="text-[#6c6c6c]" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#0a1628]/10 flex items-center justify-center"
            style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#0a1628" }}>{sub.initials}</div>
          <div>
            <p style={{ ...S, fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{sub.name}</p>
            <p style={{ ...S, fontSize: "11px", color: "#b0b0b0" }}>Auto-graded · {fmt(sub.submittedAt!)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <SourceBadge source="auto" />
          <span style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>{sub.score}/{grading.maxScore}</span>
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto">
        {questions.map((q, i) => {
          const ans = sub.answers?.find(a => a.questionId === q.id);
          const chosen = ans?.chosen ?? -1;
          const isCorrect = chosen === q.correct;
          const overridden = ans?.overridden;
          const earnedPts = overridden ? (ans?.overridePts ?? 0) : (isCorrect ? q.pts : 0);

          return (
            <div key={q.id} className={`px-5 py-4 border-b border-gray-100 ${overridden ? "bg-[#d4a574]/5" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                  <span style={{ color: "#b0b0b0" }}>Q{i + 1}.&nbsp;</span>{q.question}
                </p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {overridden && (
                    <span className="px-1.5 py-0.5 bg-[#d4a574]/20 border border-[#d4a574]" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#0a1628" }}>OVERRIDDEN</span>
                  )}
                  <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#0a1628" }}>
                    {earnedPts}/{q.pts}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-3">
                {q.options.map((opt, oi) => {
                  const isStudent  = chosen === oi;
                  const isCorrectO = q.correct === oi;
                  return (
                    <div key={oi}
                      className={`flex items-center gap-2 px-3 py-1.5 ${
                        isStudent && isCorrect ? "bg-[#0a1628]/5 border border-[#0a1628]/20"
                        : isStudent && !isCorrect ? "bg-[#d4a574]/10 border border-[#d4a574]/40"
                        : isCorrectO && !isCorrect ? "border border-dashed border-gray-300"
                        : "border border-transparent"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isCorrectO ? "bg-[#0a1628] text-white" : "bg-gray-100"
                      }`} style={{ ...S, fontSize: "10px", fontWeight: 700 }}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="flex-1" style={{ ...S, fontSize: "12px", color: "#3a3a3a" }}>{opt}</span>
                      {isStudent && <span style={{ ...S, fontSize: "10px", color: "#6c6c6c" }}>← student</span>}
                      {isCorrectO && !isStudent && <span style={{ ...S, fontSize: "10px", color: "#0a1628" }}>← correct</span>}
                    </div>
                  );
                })}
              </div>

              {/* Override button */}
              {!isCorrect && !overridden && (
                <button onClick={() => onOverride(sub.id, q.id, q.pts)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-[#d4a574] hover:bg-[#d4a574]/5 transition-colors"
                  style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                  Override — give full credit ({q.pts} pts)
                </button>
              )}
              {overridden && (
                <button onClick={() => onOverride(sub.id, q.id, -1)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#d4a574]/40 bg-[#d4a574]/10 hover:bg-gray-50 transition-colors"
                  style={{ ...S, fontSize: "11px", color: "#0a1628" }}>
                  <X size={11} /> Remove override
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export function GradingCenterPage() {
  const { assignmentId, id: routeCourseId } = useParams<{ assignmentId: string; id: string }>();
  const navigate = useNavigate();
  const isCourseScoped = !!routeCourseId;

  const Shell = ({ children }: { children: ReactNode }) =>
    isCourseScoped ? (
      <CoursePageShell activeTab="grades" breadcrumbSuffix="Grade">{children}</CoursePageShell>
    ) : (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
        <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Assignments" }, { label: "Grade" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />
        <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
          <InstructorSidebar />
          {children}
        </div>
      </div>
    );

  const [published, setPublished] = useState(false);

  // Load grading data
  const baseData = GRADING_DATA.find(g => g.assignmentId === Number(assignmentId));

  useEffect(() => {
    if (!baseData) navigate("/instructor/assignments");
  }, [baseData, navigate]);

  // Local mutable submissions state
  const [submissions, setSubmissions] = useState<Submission[]>(baseData?.submissions ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (baseData) {
      setSubmissions([...baseData.submissions]);
      // Default select first ungraded
      const first = baseData.submissions.find(s => s.status === "submitted" || s.status === "late");
      setSelectedId(first?.id ?? baseData.submissions[0]?.id ?? null);
    }
  }, [assignmentId]);

  if (!baseData) return null;

  const courseForBadge = COURSES.find((c) => c.id === baseData.courseId);
  const courseBadge = courseForBadge
    ? studentCourseShortLabel(courseForBadge, baseData.track)
    : baseData.course;

  const graded = submissions.filter(s => s.status === "graded").length;
  const total  = submissions.filter(s => s.status !== "missing").length;
  const pct    = total > 0 ? Math.round((graded / total) * 100) : 0;

  const METHOD_LABELS: Record<string, string> = {
    auto: "Auto-Graded", manual: "Manual", hybrid: "Hybrid",
  };

  // Save a manually graded submission
  const handleSave = (id: string, score: number, rubric: Record<string, number>, feedback: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, score, rubricScores: rubric, feedback, status: "graded", source: "manual" } : s
    ));
  };

  // Save & advance to next ungraded
  const handleSaveAndNext = (id: string, score: number, rubric: Record<string, number>, feedback: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === id ? { ...s, score, rubricScores: rubric, feedback, status: "graded", source: "manual" } : s
    ));
    const ungradedAfter = submissions.filter(s => (s.status === "submitted" || s.status === "late") && s.id !== id);
    if (ungradedAfter.length > 0) setSelectedId(ungradedAfter[0].id);
  };

  // Override a quiz question
  const handleOverride = (subId: string, qId: string, pts: number) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id !== subId || !s.answers) return s;
      const newAnswers: StudentAnswer[] = s.answers.map(a => {
        if (a.questionId !== qId) return a;
        if (pts === -1) return { ...a, overridden: false, overridePts: undefined };
        return { ...a, overridden: true, overridePts: pts };
      });
      const newScore = autoScore(newAnswers, baseData.questions ?? []);
      return { ...s, answers: newAnswers, score: newScore };
    }));
  };

  return (
    <Shell>
      <main className="flex-1 min-w-0 flex flex-col gap-4">
        {/* Page header */}
        <div className="bg-[#0a1628] px-6 py-4">
          <button onClick={() => navigate("/instructor/assignments")}
            className="flex items-center gap-1.5 mb-3 hover:opacity-80 transition-opacity"
              style={{ ...S, fontSize: "11px", color: "#d4a574" }}>
              <ArrowLeft size={12} /> Back to Assignments
            </button>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 style={{ ...S, fontWeight: 700, fontSize: "18px", color: "#faf8f5" }}>{baseData.title}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className="px-2 py-0.5 border border-white/20 text-white/80" style={{ ...S, fontSize: "11px" }}>{courseBadge}</span>
                  <span className="px-2 py-0.5 border border-white/20 text-white/80" style={{ ...S, fontSize: "11px" }}>{baseData.type}</span>
                  <span className={`px-2 py-0.5 ${baseData.method === "auto" ? "bg-[#d4a574] text-[#0a1628]" : "border border-white/20 text-white/80"}`}
                    style={{ ...S, fontSize: "11px", fontWeight: 700 }}>
                    {METHOD_LABELS[baseData.method]}
                  </span>
                  {baseData.allowResubmit && (
                    <span className="px-2 py-0.5 bg-[#d4a574]/30 text-white border border-[#d4a574]/50 flex items-center gap-1"
                      style={{ ...S, fontSize: "11px", fontWeight: 700 }}>
                      <RotateCcw size={10} /> Resubmission Allowed
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p style={{ ...S, fontSize: "22px", fontWeight: 700, color: "#faf8f5" }}>{graded}<span style={{ fontSize: "14px", color: "rgba(250,248,245,0.5)" }}>/{total}</span></p>
                <p style={{ ...S, fontSize: "11px", color: "rgba(250,248,245,0.6)" }}>submissions graded</p>
              </div>
            </div>
          </div>

          {/* Progress bar + actions */}
          <div className="bg-white border border-gray-200 px-5 py-3 flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#d4a574] rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#0a1628" }}>{pct}%</span>
              <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                {graded} of {total} graded · {baseData.totalStudents - submissions.length} not submitted
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setPublished(p => !p)}
                className={`flex items-center gap-2 px-4 py-2 transition-colors ${published ? "bg-[#0a1628] text-white" : "bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f]"}`}
                style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                {published ? <><CheckCircle2 size={13} /> Published</> : <><Send size={13} /> Publish Grades</>}
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
                style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                <Download size={13} /> Export
              </button>
            </div>
          </div>

          {/* Split pane */}
          <div className="flex border border-gray-200 bg-white overflow-hidden" style={{ height: 580 }}>
            <SubmissionList submissions={submissions} selectedId={selectedId} onSelect={setSelectedId} maxScore={baseData.maxScore} />

            {baseData.method === "manual" && (
              <ManualGrader
                grading={baseData}
                submissions={submissions}
                selectedId={selectedId}
                onSave={handleSave}
                onSaveAndNext={handleSaveAndNext}
                allowResubmit={baseData.allowResubmit}
              />
            )}

            {baseData.method === "auto" && (
              <AutoGrader
                grading={baseData}
                submissions={submissions}
                selectedId={selectedId}
                onSelect={id => setSelectedId(id || null)}
                onOverride={handleOverride}
              />
            )}
          </div>
        </main>
      </Shell>
  );
}