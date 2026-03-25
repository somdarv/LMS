import { useState, useCallback } from "react";
import {
  Clock, ChevronLeft, ChevronRight, Check, X, AlertTriangle,
  HelpCircle, PenLine, AlignLeft, Upload, FileText, Link2,
  ClipboardList, Eye, Users, Plus, RotateCcw,
} from "lucide-react";
import { getCourseGroups, recalcGroupStatus, type Group, type GroupAssignmentConfig } from "../data/groups";

const S = { fontFamily: "Inter, sans-serif" };

// ─── Types ──────────────────────────────────────────────────────────────
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "long_answer";
export type DeliveryFormat = "short" | "long" | "bulk" | "instructions";
export type SubmissionType = "file" | "text" | "link";

export interface AssignmentQuestion {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correctOption?: number;
  correctAnswer?: boolean;
  points?: number;
}

export interface RubricCriterion {
  criterion: string;
  description: string;
  points: number;
}

export interface AssignmentConfig {
  id: number;
  title: string;
  course: string;
  courseCode: string;
  courseId?: number;
  track?: "Weekday" | "Weekend" | "All";
  description: string;
  assignmentType: string;
  deliveryFormat: DeliveryFormat | "document";
  submissionType: SubmissionType;
  questions: AssignmentQuestion[];
  instructions: string;
  rubric: RubricCriterion[];
  maxScore: number;
  dueDate: string;
  dueTime: string;
  allowLate: boolean;
  latePenalty?: number;
  allowResubmit?: boolean;
  week?: number;
  attachmentName?: string;
  attachmentUrl?: string;
  groupConfig?: GroupAssignmentConfig;
  /** null = self_enrollment and student has no group yet; undefined = not a group assignment */
  currentStudentGroup?: {
    groupId: string;
    groupName: string;
    members: Array<{ studentId: number; name: string }>;
    leaderId?: number;
  } | null;
  /** The current student's ID — used to determine if they are the group leader */
  currentStudentId?: number;
}

type Phase = "view" | "working" | "review" | "submitted";

interface Answers {
  [questionId: number]: number | string | boolean | undefined;
}

function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
};

const ASSIGNMENT_TYPE_LABELS: Record<string, string> = {
  assignment: "Written Assignment",
  exercise: "Practice Exercise",
  case_study: "Case Study",
  presentation: "Presentation",
  project: "Project",
};

// ─── Component ──────────────────────────────────────────────────────────
export function AssignmentTaker({
  config,
  onClose,
  onComplete,
  onGroupJoin,
}: {
  config: AssignmentConfig;
  onClose: () => void;
  onComplete?: (isResubmit?: boolean) => void;
  onGroupJoin?: (group: Group) => void;
}) {
  const [phase, setPhase] = useState<Phase>("view");
  const [answers, setAnswers] = useState<Answers>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [textSubmission, setTextSubmission] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [linkSubmission, setLinkSubmission] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isResubmit, setIsResubmit] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const hasQuestions = config.deliveryFormat === "bulk" || config.deliveryFormat === "short" || config.deliveryFormat === "long";
  const questions = config.questions;
  const answeredCount = questions.filter((q) => {
    const a = answers[q.id];
    return a !== undefined && a !== "";
  }).length;

  const setAnswer = useCallback((qId: number, val: number | string | boolean) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }, []);

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setShowConfirm(false);
      setPhase("submitted");
      onComplete?.(isResubmit);
    }, 1400);
  };

  const handleResubmit = () => {
    setIsResubmit(true);
    setPhase("working");
    setUploadedFile(null);
    setTextSubmission("");
    setLinkSubmission("");
    setAnswers({});
    setCurrentQ(0);
  };

  const canSubmit = () => {
    if (hasQuestions) return answeredCount === questions.length;
    if (config.submissionType === "file") return !!uploadedFile;
    if (config.submissionType === "text") return textSubmission.trim().length > 0;
    if (config.submissionType === "link") return linkSubmission.trim().length > 0;
    return false;
  };

  // ─── VIEW (Instructions) ──────────────────────────────────────────────
  if (phase === "view") {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0] sticky top-0 bg-white z-10">
            <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>Assignment</p>
            <button onClick={onClose} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
          </div>

          <div className="px-6 py-6">
            <h2 style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{config.title}</h2>
            <p style={{ ...S, fontSize: "12px", color: "#8e8e96", marginTop: 4 }}>
              {config.course}{config.week ? ` · Week ${config.week}` : ""}
            </p>

            {/* Meta tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="px-2 py-1 rounded-md bg-[#f3f3f5] text-[#5a5a62]" style={{ ...S, fontSize: "11px", fontWeight: 500 }}>
                {ASSIGNMENT_TYPE_LABELS[config.assignmentType] || config.assignmentType}
              </span>
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#f3f3f5] text-[#5a5a62]" style={{ ...S, fontSize: "11px", fontWeight: 500 }}>
                <Clock size={10} /> Due {config.dueDate} at {config.dueTime}
              </span>
              <span className="px-2 py-1 rounded-md bg-[#f3f3f5] text-[#5a5a62]" style={{ ...S, fontSize: "11px", fontWeight: 500 }}>
                {config.maxScore} points
              </span>
            </div>

            {/* Description */}
            {config.description && (
              <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mt-5">
                <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.6 }}>{config.description}</p>
              </div>
            )}

            {/* Instructions */}
            {config.instructions && (
              <div className="mt-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Instructions
                </p>
                <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0]">
                  <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.7 }}>{config.instructions}</p>
                </div>
              </div>
            )}

            {/* Document Attachment */}
            {config.deliveryFormat === "document" && (
              <div className="mt-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Assignment Document
                </p>
                <a
                  href={config.attachmentUrl || "#"}
                  download
                  className="flex items-center gap-3 p-4 rounded-lg border border-[#e2e2e5] hover:border-[#a68b5b] transition-colors bg-white group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded bg-[#f3f3f5] flex items-center justify-center text-[#5a5a62] group-hover:bg-[#faf8f5] group-hover:text-[#a68b5b] transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                      {config.attachmentName || "Assignment_Worksheet.pdf"}
                    </p>
                    <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>
                      Click to download
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a5a62] group-hover:text-[#a68b5b] bg-[#f3f3f5] group-hover:bg-[#faf8f5]">
                    <Upload size={14} className="rotate-180" />
                  </div>
                </a>
              </div>
            )}

            {/* Rubric */}
            {config.rubric.length > 0 && (
              <div className="mt-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Marking Criteria
                </p>
                <div className="border border-[#ededf0] rounded-lg overflow-hidden">
                  {config.rubric.map((r, i) => (
                    <div key={i} className={`px-4 py-3 flex items-start gap-3 ${i > 0 ? "border-t border-[#ededf0]" : ""}`}>
                      <div className="flex-1">
                        <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{r.criterion}</p>
                        {r.description && (
                          <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>{r.description}</p>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#f3f3f5] text-[#5a5a62] flex-shrink-0" style={{ ...S, fontSize: "11px", fontWeight: 600 }}>
                        {r.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What to expect */}
            {hasQuestions && (
              <div className="mt-5 bg-[#fafafb] border border-[#ededf0] rounded-lg p-4">
                <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", marginBottom: 6 }}>
                  This assignment has {questions.length} question{questions.length !== 1 ? "s" : ""} to answer
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["multiple_choice", "true_false", "short_answer", "long_answer"] as QuestionType[]).map((t) => {
                    const count = questions.filter((q) => q.type === t).length;
                    if (!count) return null;
                    return (
                      <span key={t} className="px-2 py-0.5 rounded bg-[#e8e8ea] text-[#5a5a62]" style={{ ...S, fontSize: "10px", fontWeight: 500 }}>
                        {TYPE_LABEL[t]} ({count})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasQuestions && (
              <div className="mt-5 bg-[#fafafb] border border-[#ededf0] rounded-lg p-3 flex items-center gap-2">
                {config.submissionType === "file" && <><Upload size={14} className="text-[#8e8e96]" /><span style={{ ...S, fontSize: "12px", color: "#5a5a62" }}>Submit via file upload (PDF, DOCX, images)</span></>}
                {config.submissionType === "text" && <><FileText size={14} className="text-[#8e8e96]" /><span style={{ ...S, fontSize: "12px", color: "#5a5a62" }}>Type your response directly on the platform</span></>}
                {config.submissionType === "link" && <><Link2 size={14} className="text-[#8e8e96]" /><span style={{ ...S, fontSize: "12px", color: "#5a5a62" }}>Submit a URL (Google Docs, Drive, etc.)</span></>}
              </div>
            )}

            {config.allowLate && config.latePenalty && (
              <p style={{ ...S, fontSize: "10px", color: "#a68b5b", marginTop: 8 }}>
                Late submissions accepted with a {config.latePenalty}% penalty per day.
              </p>
            )}

            {/* Group panel */}
            {config.groupConfig?.enabled && (
              <div className="mt-5 border border-[#d4a574]/40 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-[#fdf8f3] border-b border-[#d4a574]/30">
                  <Users size={13} className="text-[#a68b5b]" />
                  <p style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#a68b5b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Group Assignment
                  </p>
                </div>
                <div className="px-4 py-3">
                  {config.currentStudentGroup ? (
                    <div>
                      <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                        {config.currentStudentGroup.groupName}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {config.currentStudentGroup.members.map((m) => {
                          const isLeader = config.currentStudentGroup!.leaderId === m.studentId;
                          const isMe = config.currentStudentId === m.studentId;
                          return (
                            <span key={m.studentId}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${isLeader ? "bg-[#fdf3e7] text-[#a68b5b] border border-[#d4a574]/40" : "bg-[#f3f3f5] text-[#5a5a62]"}`}
                              style={{ ...S, fontSize: "11px", fontWeight: isLeader ? 600 : 400 }}>
                              {isLeader && <span>★</span>}
                              {m.name}{isMe ? " (You)" : ""}
                            </span>
                          );
                        })}
                      </div>
                      {config.currentStudentGroup.leaderId && (
                        <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 8 }}>
                          ★ = Group Leader — submits on behalf of the group
                        </p>
                      )}
                      {config.currentStudentId !== undefined &&
                       config.currentStudentGroup.leaderId !== undefined &&
                       config.currentStudentGroup.leaderId !== config.currentStudentId && (
                        <div className="mt-3 px-3 py-2 rounded-lg bg-[#f3f3f5] border border-[#ededf0]">
                          <p style={{ ...S, fontSize: "12px", color: "#5a5a62" }}>
                            Your group leader will submit this assignment on behalf of your group.
                            Only the leader can start the submission.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : config.groupConfig.mode === "self_enrollment" ? (
                    <div>
                      <p style={{ ...S, fontSize: "12px", color: "#5a5a62", marginBottom: 8 }}>
                        You are not yet in a group for this assignment.
                      </p>
                      <button
                        onClick={() => setShowGroupModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white transition-colors"
                        style={{ ...S, fontSize: "12px", fontWeight: 600 }}
                      >
                        <Plus size={12} /> Join or Create Group
                      </button>
                    </div>
                  ) : (
                    <p style={{ ...S, fontSize: "12px", color: "#8e8e96" }}>
                      Contact your instructor — you have not been assigned to a group.
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              onClick={() => setPhase("working")}
              disabled={config.groupConfig?.enabled && config.groupConfig.mode === "self_enrollment" && config.currentStudentGroup === null}
              className="w-full mt-6 py-3 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ ...S, fontSize: "14px", fontWeight: 600 }}
              title={config.groupConfig?.enabled && config.groupConfig.mode === "self_enrollment" && config.currentStudentGroup === null ? "Join a group first" : undefined}
            >
              {hasQuestions ? "Begin Assignment" : "Start Submission"}
            </button>

            {showGroupModal && config.courseId != null && (
              <GroupModal
                courseId={config.courseId}
                track={config.track ?? "All"}
                maxGroupSize={config.groupConfig?.maxGroupSize ?? 4}
                onJoin={(group) => {
                  onGroupJoin?.(group);
                  setShowGroupModal(false);
                }}
                onClose={() => setShowGroupModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── WORKING ──────────────────────────────────────────────────────────
  if (phase === "working") {
    // Questions-based assignment
    if (hasQuestions && questions.length > 0) {
      const q = questions[currentQ];
      return (
        <div className="fixed inset-0 z-50 bg-[#f5f6f8] flex flex-col">
          {/* Top bar */}
          <div className="bg-white border-b border-[#ededf0] px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
              <div>
                <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>{config.title}</p>
                <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>{config.courseCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span style={{ ...S, fontSize: "12px", color: "#8e8e96" }}>
                {answeredCount}/{questions.length} answered
              </span>
              <button
                onClick={() => setPhase("review")}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-[#ededf0] text-[#5a5a62] hover:bg-[#fafafb] transition-colors"
                style={{ ...S, fontSize: "12px", fontWeight: 500 }}
              >
                <Eye size={12} /> Review
              </button>
              <button
                onClick={() => setShowConfirm(true)}
                className="px-4 py-1.5 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
                style={{ ...S, fontSize: "12px", fontWeight: 600 }}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Question nav bar */}
          <div className="bg-white border-b border-[#ededf0] px-6 py-2 flex items-center gap-1.5 overflow-x-auto">
            {questions.map((qq, i) => {
              const answered = answers[qq.id] !== undefined && answers[qq.id] !== "";
              const isCurrent = i === currentQ;
              return (
                <button
                  key={qq.id}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    isCurrent ? "bg-[#5a5a62] text-[#faf8f5]" : answered ? "bg-[#e8e8ea] text-[#3a3a42]" : "bg-[#f3f3f5] text-[#8e8e96] hover:bg-[#e8e8ea]"
                  }`}
                  style={{ ...S, fontSize: "11px", fontWeight: 600 }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Question content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[640px] mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-md bg-[#6c6c6c] text-[#faf8f5] flex items-center justify-center" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                  {currentQ + 1}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#f3f3f5] text-[#8e8e96]" style={{ ...S, fontSize: "10px", fontWeight: 500 }}>
                  {TYPE_LABEL[q.type]}
                </span>
                {q.points && <span style={{ ...S, fontSize: "11px", color: "#b0b0b5" }}>{q.points} pts</span>}
              </div>

              <div className="bg-white rounded-xl border border-[#ededf0] p-6 mb-5">
                <p style={{ ...S, fontSize: "15px", fontWeight: 500, color: "#0a1628", lineHeight: 1.7 }}>{q.text}</p>
              </div>

              <div className="bg-white rounded-xl border border-[#ededf0] p-6">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Your Answer
                </p>

                {/* MCQ */}
                {q.type === "multiple_choice" && q.options && (
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, i) => {
                      const selected = answers[q.id] === i;
                      return (
                        <button key={i} onClick={() => setAnswer(q.id, i)}
                          className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${selected ? "border-[#d4a574] bg-[#faf7f3]" : "border-[#ededf0] hover:border-[#cdcdd2]"}`}>
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected ? "border-[#d4a574] bg-[#d4a574]" : "border-[#cdcdd2]"}`}>
                            {selected && <Check size={12} className="text-white" />}
                          </span>
                          <span style={{ ...S, fontSize: "13px", color: selected ? "#0a1628" : "#5a5a62", fontWeight: selected ? 500 : 400 }}>
                            <span className="text-[#b0b0b5] mr-2" style={{ fontWeight: 600 }}>{String.fromCharCode(65 + i)}.</span>{opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* T/F */}
                {q.type === "true_false" && (
                  <div className="flex gap-3">
                    {[true, false].map((val) => {
                      const selected = answers[q.id] === val;
                      return (
                        <button key={String(val)} onClick={() => setAnswer(q.id, val)}
                          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border transition-all ${selected ? "border-[#5a5a62] bg-[#5a5a62] text-[#faf8f5]" : "border-[#ededf0] text-[#5a5a62] hover:border-[#cdcdd2]"}`}
                          style={{ ...S, fontSize: "14px", fontWeight: 600 }}>
                          {selected && <Check size={14} />}{val ? "True" : "False"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short */}
                {q.type === "short_answer" && (
                  <div>
                    <textarea value={(answers[q.id] as string) || ""} onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Type your answer here..." rows={3}
                      className="w-full px-4 py-3 border border-[#ededf0] rounded-lg bg-[#fafafb] text-[#0a1628] placeholder-[#cdcdd2] outline-none focus:border-[#8e8e96] transition-all resize-none"
                      style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
                    <p style={{ ...S, fontSize: "10px", color: "#b0b0b5", marginTop: 4 }}>Brief response — 1–3 sentences</p>
                  </div>
                )}

                {/* Long */}
                {q.type === "long_answer" && (
                  <div>
                    <textarea value={(answers[q.id] as string) || ""} onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder="Write your extended response here..." rows={10}
                      className="w-full px-4 py-3 border border-[#ededf0] rounded-lg bg-[#fafafb] text-[#0a1628] placeholder-[#cdcdd2] outline-none focus:border-[#8e8e96] transition-all resize-none"
                      style={{ ...S, fontSize: "13px", lineHeight: 1.7 }} />
                    <div className="flex items-center justify-between mt-2">
                      <p style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>Extended response — analysis, discussion, or explanation</p>
                      <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96" }}>
                        {wordCount((answers[q.id] as string) || "")} words
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between mt-6">
                <button onClick={() => setCurrentQ((p) => Math.max(0, p - 1))} disabled={currentQ === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#ededf0] text-[#5a5a62] hover:bg-[#fafafb] disabled:opacity-30 transition-colors"
                  style={{ ...S, fontSize: "13px", fontWeight: 500 }}>
                  <ChevronLeft size={14} /> Previous
                </button>
                <p style={{ ...S, fontSize: "12px", color: "#b0b0b5" }}>{currentQ + 1} of {questions.length}</p>
                {currentQ < questions.length - 1 ? (
                  <button onClick={() => setCurrentQ((p) => p + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
                    style={{ ...S, fontSize: "13px", fontWeight: 500 }}>
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={() => setPhase("review")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
                    style={{ ...S, fontSize: "13px", fontWeight: 500 }}>
                    Review <Eye size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {showConfirm && <ConfirmModal answeredCount={answeredCount} totalCount={questions.length} onCancel={() => setShowConfirm(false)} onConfirm={handleSubmit} submitting={submitting} />}
        </div>
      );
    }

    // Submission-based assignment (file / text / link)
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0] sticky top-0 bg-white z-10">
            <div>
              <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>{config.title}</p>
              <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>{config.courseCode} · Due {config.dueDate}</p>
            </div>
            <button onClick={onClose} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
          </div>

          <div className="px-6 py-5">
            {/* Instructions reminder */}
            {config.instructions && (
              <div className="mb-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Instructions</p>
                <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0]">
                  <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.7 }}>{config.instructions}</p>
                </div>
              </div>
            )}

            {/* Document Attachment */}
            {config.deliveryFormat === "document" && (
              <div className="mb-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Assignment Document
                </p>
                <a
                  href={config.attachmentUrl || "#"}
                  download
                  className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e2e5] hover:border-[#a68b5b] transition-colors bg-white group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded bg-[#f3f3f5] flex items-center justify-center text-[#5a5a62] group-hover:bg-[#faf8f5] group-hover:text-[#a68b5b] transition-colors">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                      {config.attachmentName || "Assignment_Worksheet.pdf"}
                    </p>
                    <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>
                      Click to download
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#5a5a62] group-hover:text-[#a68b5b] bg-[#f3f3f5] group-hover:bg-[#faf8f5]">
                    <Upload size={14} className="rotate-180" />
                  </div>
                </a>
              </div>
            )}

            {/* Submission area */}
            <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Your Submission
            </p>

            {config.submissionType === "file" && (
              <div
                className="border-2 border-dashed border-[#dcdce0] rounded-xl p-8 text-center hover:border-[#b0b0b5] transition-colors cursor-pointer bg-[#fafafb]"
                onClick={() => setUploadedFile("Assignment_KojoManu.pdf")}
              >
                {uploadedFile ? (
                  <div className="flex items-center gap-3 justify-center">
                    <FileText size={20} className="text-[#6c6c6c]" />
                    <span style={{ ...S, fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>{uploadedFile}</span>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-[#8e8e96] hover:text-[#3a3a42]"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="mx-auto mb-3 text-[#cdcdd2]" />
                    <p style={{ ...S, fontSize: "13px", fontWeight: 500, color: "#5a5a62" }}>Click to upload your file</p>
                    <p style={{ ...S, fontSize: "11px", color: "#b0b0b5", marginTop: 4 }}>PDF, DOCX, or images up to 10MB</p>
                  </>
                )}
              </div>
            )}

            {config.submissionType === "text" && (
              <div>
                <textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Type your response here..."
                  rows={12}
                  className="w-full px-4 py-3 border border-[#ededf0] rounded-xl bg-[#fafafb] text-[#0a1628] placeholder-[#cdcdd2] outline-none focus:border-[#8e8e96] transition-all resize-none"
                  style={{ ...S, fontSize: "13px", lineHeight: 1.7 }}
                />
                <div className="flex justify-end mt-2">
                  <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96" }}>{wordCount(textSubmission)} words</p>
                </div>
              </div>
            )}

            {config.submissionType === "link" && (
              <div>
                <div className="flex items-center gap-2 border border-[#ededf0] rounded-lg bg-[#fafafb] px-4 py-3">
                  <Link2 size={16} className="text-[#b0b0b5]" />
                  <input
                    type="url"
                    value={linkSubmission}
                    onChange={(e) => setLinkSubmission(e.target.value)}
                    placeholder="https://docs.google.com/..."
                    className="flex-1 bg-transparent text-[#0a1628] placeholder-[#cdcdd2] outline-none"
                    style={{ ...S, fontSize: "13px" }}
                  />
                </div>
                <p style={{ ...S, fontSize: "10px", color: "#b0b0b5", marginTop: 4 }}>Paste a link to your Google Doc, Drive file, or any public URL</p>
              </div>
            )}

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit()}
              className="w-full mt-5 py-2.5 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors disabled:opacity-30"
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}
            >
              Submit Assignment
            </button>
          </div>

          {showConfirm && <ConfirmModal onCancel={() => setShowConfirm(false)} onConfirm={handleSubmit} submitting={submitting} />}
        </div>
      </div>
    );
  }

  // ─── REVIEW (questions-based) ─────────────────────────────────────────
  if (phase === "review" && hasQuestions) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f5f6f8] flex flex-col">
        <div className="bg-white border-b border-[#ededf0] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setPhase("working")} className="text-[#8e8e96] hover:text-[#0a1628]"><ChevronLeft size={18} /></button>
            <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>Review Answers</p>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ ...S, fontSize: "12px", color: "#8e8e96" }}>{answeredCount}/{questions.length} answered</span>
            <button onClick={() => setShowConfirm(true)}
              className="px-5 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}>Submit</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[640px] mx-auto flex flex-col gap-3">
            {questions.map((q, i) => {
              const a = answers[q.id];
              const answered = a !== undefined && a !== "";
              return (
                <button key={q.id} onClick={() => { setCurrentQ(i); setPhase("working"); }}
                  className="w-full bg-white rounded-xl border border-[#ededf0] px-5 py-4 text-left hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${answered ? "bg-[#e8e8ea] text-[#3a3a42]" : "bg-[#f3f3f5] text-[#8e8e96]"}`}
                      style={{ ...S, fontSize: "11px", fontWeight: 700 }}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ ...S, fontSize: "13px", color: "#0a1628", lineHeight: 1.4 }} className="line-clamp-2">{q.text}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#f3f3f5] text-[#8e8e96]" style={{ ...S, fontSize: "9px", fontWeight: 500 }}>{TYPE_LABEL[q.type]}</span>
                      </div>
                      {answered && (
                        <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 4 }} className="truncate">
                          {q.type === "multiple_choice" ? `Selected: ${q.options?.[a as number] || "—"}` :
                           q.type === "true_false" ? `Selected: ${a ? "True" : "False"}` :
                           `"${String(a).slice(0, 80)}${String(a).length > 80 ? "…" : ""}"`}
                        </p>
                      )}
                      {!answered && <p style={{ ...S, fontSize: "11px", color: "#cdcdd2", marginTop: 4, fontStyle: "italic" }}>Not answered</p>}
                    </div>
                    <ChevronRight size={14} className="text-[#cdcdd2] flex-shrink-0 mt-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {showConfirm && <ConfirmModal answeredCount={answeredCount} totalCount={questions.length} onCancel={() => setShowConfirm(false)} onConfirm={handleSubmit} submitting={submitting} />}
      </div>
    );
  }

  // ─── SUBMITTED ────────────────────────────────────────────────────────
  if (phase === "submitted") {
    const grp = config.currentStudentGroup;
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[440px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-5">
            <Check size={28} className="text-[#5a5a62]" />
          </div>
          <h3 style={{ ...S, fontSize: "18px", fontWeight: 600, color: "#0a1628" }}>
            {isResubmit ? "Resubmission Received" : "Assignment Submitted"}
          </h3>
          <p style={{ ...S, fontSize: "13px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
            {grp ? (
              <>Submitted on behalf of <strong style={{ color: "#3a3a42" }}>{grp.groupName}</strong> · {grp.members.map(m => m.name).join(", ")}</>
            ) : (
              <>Your submission for <strong style={{ color: "#3a3a42" }}>{config.title}</strong> has been received. Your instructor will review and grade it.</>
            )}
          </p>
          {hasQuestions && (
            <p style={{ ...S, fontSize: "11px", color: "#b0b0b5", marginTop: 8 }}>
              {answeredCount}/{questions.length} questions answered
            </p>
          )}
          {isResubmit && (
            <p style={{ ...S, fontSize: "11px", color: "#a68b5b", marginTop: 8 }}>
              Your previous grade has been cleared. Your instructor will re-grade this submission.
            </p>
          )}
          {config.allowResubmit && (
            <button
              onClick={handleResubmit}
              className="w-full mt-4 py-2.5 rounded-lg border border-[#0a1628] text-[#0a1628] hover:bg-[#0a1628] hover:text-white transition-colors flex items-center justify-center gap-2"
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}
            >
              <RotateCcw size={13} /> Edit &amp; Resubmit
            </button>
          )}
          <button onClick={onClose}
            className="w-full mt-3 py-2.5 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
            style={{ ...S, fontSize: "13px", fontWeight: 600 }}>Done</button>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Group modal ─────────────────────────────────────────────────────────────
function GroupModal({
  courseId,
  track,
  maxGroupSize,
  onJoin,
  onClose,
}: {
  courseId: number;
  track: "Weekday" | "Weekend" | "All";
  maxGroupSize: number;
  onJoin: (group: Group) => void;
  onClose: () => void;
}) {
  const existingGroups = getCourseGroups(courseId, track).filter((g) => g.status !== "locked");
  const [newName, setNewName] = useState("");
  const [localGroups, setLocalGroups] = useState<Group[]>(existingGroups);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    const g: Group = {
      id: `grp-${courseId}-${Date.now()}`,
      courseId, track,
      name,
      members: [],
      maxSize: maxGroupSize,
      status: "open",
      createdBy: 7, // demo student (Kojo Manu)
      createdAt: new Date().toISOString(),
    };
    setLocalGroups((prev) => [...prev, g]);
    onJoin(g);
  };

  const handleJoin = (g: Group) => {
    const updated = { ...g, members: [...g.members, { studentId: 7, name: "Kojo Manu", initials: "KM", joinedAt: new Date().toISOString() }] };
    updated.status = recalcGroupStatus(updated);
    onJoin(updated);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ededf0]">
          <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>Join or Create Group</p>
          <button onClick={onClose} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={16} /></button>
        </div>

        <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
          {localGroups.length > 0 && (
            <div className="mb-4">
              <p style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Open Groups
              </p>
              <div className="flex flex-col gap-2">
                {localGroups.map((g) => (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#ededf0] bg-[#fafafb]">
                    <div className="flex-1 min-w-0">
                      <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{g.name}</p>
                      <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>
                        {g.members.length}/{g.maxSize} members{g.members.length > 0 ? ` · ${g.members.map(m => m.name.split(" ")[0]).join(", ")}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJoin(g)}
                      disabled={g.members.length >= g.maxSize}
                      className="px-3 py-1 rounded-lg bg-[#0a1628] text-white hover:bg-[#1a2a42] transition-colors text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                      style={{ ...S, fontSize: "11px", fontWeight: 600 }}
                    >
                      {g.members.length >= g.maxSize ? "Full" : "Join"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Create New Group
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Group name…"
                className="flex-1 px-3 py-2 border border-[#dcdce0] rounded-lg focus:outline-none focus:border-[#0a1628]"
                style={{ ...S, fontSize: "13px" }}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="px-4 py-2 rounded-lg bg-[#0a1628] text-white hover:bg-[#1a2a42] transition-colors disabled:opacity-30 flex items-center gap-1"
                style={{ ...S, fontSize: "12px", fontWeight: 600 }}
              >
                <Plus size={12} /> Create
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm modal ──────────────────────────────────────────────────────
function ConfirmModal({
  answeredCount,
  totalCount,
  onCancel,
  onConfirm,
  submitting,
}: {
  answeredCount?: number;
  totalCount?: number;
  onCancel: () => void;
  onConfirm: () => void;
  submitting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 text-center">
        <div className="w-11 h-11 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={18} className="text-[#5a5a62]" />
        </div>
        <h3 style={{ ...S, fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Submit assignment?</h3>
        <p style={{ ...S, fontSize: "12px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
          {answeredCount !== undefined && totalCount !== undefined
            ? `${answeredCount}/${totalCount} questions answered. `
            : ""}
          This cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border border-[#dcdce0] text-[#3a3a42] hover:bg-[#f5f5f7] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 500 }}>Cancel</button>
          <button onClick={onConfirm} disabled={submitting} className="flex-1 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors disabled:opacity-60" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
            {submitting ? "Submitting…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}