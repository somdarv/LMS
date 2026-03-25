import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Clock, ChevronLeft, ChevronRight, Check, X, AlertTriangle,
  HelpCircle, PenLine, AlignLeft, RotateCcw, Flag, Eye, EyeOff,
} from "lucide-react";

const S = { fontFamily: "Inter, sans-serif" };

// ─── Types ──────────────────────────────────────────────────────────────
export type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "long_answer";

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer?: number | string | boolean;
  points: number;
  minWords?: number;
  maxWords?: number;
}

export interface QuizConfig {
  id: number;
  title: string;
  course: string;
  courseCode: string;
  description: string;
  deliveryFormat?: "platform" | "document";
  attachmentName?: string;
  attachmentUrl?: string;
  questions: QuizQuestion[];
  timeLimitMinutes: number | null;
  passingScorePercent: number;
  maxAttempts: number;
  currentAttempt: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showFeedback: boolean;
  week?: number;
  dueDate: string;
}

type Phase = "intro" | "taking" | "review" | "results";

interface Answers {
  [questionId: number]: number | string | boolean | undefined;
}

// ─── Helper ─────────────────────────────────────────────────────────────
function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

const TYPE_ICON: Record<QuestionType, any> = {
  multiple_choice: HelpCircle,
  true_false: Check,
  short_answer: PenLine,
  long_answer: AlignLeft,
};

const TYPE_LABEL: Record<QuestionType, string> = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  short_answer: "Short Answer",
  long_answer: "Long Answer",
};

// ─── Component ──────────────────────────────────────────────────────────
export function QuizTaker({
  config,
  onClose,
  onComplete,
}: {
  config: QuizConfig;
  onClose: () => void;
  onComplete?: (score: number, total: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(config.timeLimitMinutes ? config.timeLimitMinutes * 60 : 0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNav, setShowNav] = useState(true);

  // Shuffle questions and options on mount
  const orderedQuestions = useMemo(() => {
    let qs = [...config.questions];
    if (config.shuffleQuestions) qs = shuffle(qs);
    if (config.shuffleOptions) {
      qs = qs.map((q) => {
        if (q.type === "multiple_choice" && q.options) {
          const shuffled = shuffle(q.options.map((o, i) => ({ text: o, origIndex: i })));
          return {
            ...q,
            options: shuffled.map((s) => s.text),
            // Remap correct answer index
            correctAnswer: shuffled.findIndex((s) => s.origIndex === q.correctAnswer),
          };
        }
        return q;
      });
    }
    return qs;
  }, [config]);

  // Timer
  useEffect(() => {
    if (phase !== "taking" || !config.timeLimitMinutes) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase("review");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, config.timeLimitMinutes]);

  const totalPoints = orderedQuestions.reduce((s, q) => s + q.points, 0);
  const answeredCount = orderedQuestions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length;
  const currentQuestion = orderedQuestions[currentQ];

  const setAnswer = useCallback((qId: number, val: number | string | boolean) => {
    setAnswers((prev) => ({ ...prev, [qId]: val }));
  }, []);

  const toggleFlag = (qId: number) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  // Calculate score
  const calculateScore = (): number => {
    let score = 0;
    for (const q of orderedQuestions) {
      const a = answers[q.id];
      if (a === undefined) continue;
      if (q.type === "multiple_choice" && a === q.correctAnswer) score += q.points;
      else if (q.type === "true_false" && a === q.correctAnswer) score += q.points;
      // Short/long answers are manually graded — give full points for demo
      else if (q.type === "short_answer" && typeof a === "string" && a.trim()) score += q.points;
      else if (q.type === "long_answer" && typeof a === "string" && a.trim()) score += q.points;
    }
    return score;
  };

  const handleSubmit = () => {
    setShowConfirm(false);
    setPhase("results");
    const score = calculateScore();
    onComplete?.(score, totalPoints);
  };

  const timerWarning = config.timeLimitMinutes ? timeLeft < 60 : false;
  const timerCritical = config.timeLimitMinutes ? timeLeft < 30 : false;

  // ─── INTRO ─────────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[520px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0]">
            <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>Quiz</p>
            <button onClick={onClose} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
          </div>

          <div className="px-6 py-6">
            <h2 style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{config.title}</h2>
            <p style={{ ...S, fontSize: "12px", color: "#8e8e96", marginTop: 4 }}>
              {config.course}{config.week ? ` · Week ${config.week}` : ""} · Due {config.dueDate}
            </p>

            {config.description && (
              <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mt-5">
                <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.6 }}>{config.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-5">
              {config.deliveryFormat !== "document" && (
                <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                  <p style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{config.questions.length}</p>
                  <p style={{ ...S, fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Questions</p>
                </div>
              )}
              {config.deliveryFormat !== "document" && (
                <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                  <p style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{totalPoints}</p>
                  <p style={{ ...S, fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Points</p>
                </div>
              )}
              <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                <p style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{config.timeLimitMinutes ? `${config.timeLimitMinutes}m` : "—"}</p>
                <p style={{ ...S, fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Time Limit</p>
              </div>
              <div className="bg-[#fafafb] rounded-lg p-3 text-center border border-[#ededf0]">
                <p style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{config.currentAttempt}/{config.maxAttempts}</p>
                <p style={{ ...S, fontSize: "10px", color: "#8e8e96", marginTop: 2 }}>Attempt</p>
              </div>
            </div>

            {/* Document Attachment */}
            {config.deliveryFormat === "document" && (
              <div className="mt-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  Quiz Document
                </p>
                <a
                  href={config.attachmentUrl || "#"}
                  download
                  className="flex items-center gap-3 p-4 rounded-lg border border-[#e2e2e5] hover:border-[#a68b5b] transition-colors bg-white group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded bg-[#f3f3f5] flex items-center justify-center text-[#5a5a62] group-hover:bg-[#faf8f5] group-hover:text-[#a68b5b] transition-colors">
                    <AlignLeft size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                      {config.attachmentName || "Quiz_Worksheet.pdf"}
                    </p>
                    <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>
                      Click to download
                    </p>
                  </div>
                </a>
              </div>
            )}

            {/* Question type breakdown */}
            {config.deliveryFormat !== "document" && (
              <div className="mt-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Question Types</p>
                <div className="flex flex-wrap gap-2">
                  {(["multiple_choice", "true_false", "short_answer", "long_answer"] as QuestionType[]).map((t) => {
                    const count = config.questions.filter((q) => q.type === t).length;
                    if (!count) return null;
                    return (
                      <span key={t} className="px-2 py-1 rounded-md bg-[#f3f3f5] text-[#5a5a62]" style={{ ...S, fontSize: "11px", fontWeight: 500 }}>
                        {TYPE_LABEL[t]} ({count})
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {config.passingScorePercent > 0 && (
              <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 12 }}>
                Passing score: {config.passingScorePercent}%
              </p>
            )}

            <div className="flex items-start gap-2 mt-5 bg-[#fafafb] border border-[#ededf0] rounded-lg p-3">
              <AlertTriangle size={14} className="text-[#a68b5b] flex-shrink-0 mt-0.5" />
              <p style={{ ...S, fontSize: "11px", color: "#5a5a62", lineHeight: 1.5 }}>
                {config.timeLimitMinutes
                  ? `Once you start, you'll have ${config.timeLimitMinutes} minutes to complete this quiz. The timer cannot be paused.`
                  : "There is no time limit for this quiz. Take your time."
                }
              </p>
            </div>

            <button
              onClick={() => { setPhase("taking"); setCurrentQ(0); }}
              className="w-full mt-6 py-3 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
              style={{ ...S, fontSize: "14px", fontWeight: 600 }}
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── TAKING ────────────────────────────────────────────────────────────
  if (phase === "taking") {
    // Document Upload Format
    if (config.deliveryFormat === "document") {
      const isReadyToSubmit = Object.keys(answers).length > 0;
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
              {config.timeLimitMinutes && (
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${timerCritical ? "bg-[#3a3a42] text-[#faf8f5]" : timerWarning ? "bg-[#f0ece6] text-[#a68b5b]" : "bg-[#f3f3f5] text-[#5a5a62]"}`}>
                  <Clock size={14} />
                  <span style={{ ...S, fontSize: "14px", fontWeight: 700 }}>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-[500px]">
              <div className="bg-white rounded-xl border border-[#ededf0] p-6 mb-5">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Instructions
                </p>
                <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.7, marginBottom: 16 }}>
                  {config.description || "Download the document below, complete your answers, and re-upload the file before the time runs out."}
                </p>

                <a
                  href={config.attachmentUrl || "#"}
                  download
                  className="flex items-center gap-3 p-4 rounded-lg border border-[#e2e2e5] hover:border-[#a68b5b] transition-colors bg-[#fafafb] group cursor-pointer mb-6"
                >
                  <div className="w-10 h-10 rounded bg-[#f3f3f5] flex items-center justify-center text-[#5a5a62] group-hover:bg-[#faf8f5] group-hover:text-[#a68b5b] transition-colors">
                    <AlignLeft size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                      {config.attachmentName || "Quiz_Worksheet.pdf"}
                    </p>
                    <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>
                      Click to download
                    </p>
                  </div>
                </a>

                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Your Submission
                </p>
                <div
                  className="border-2 border-dashed border-[#dcdce0] rounded-xl p-8 text-center hover:border-[#b0b0b5] transition-colors cursor-pointer bg-[#fafafb]"
                  onClick={() => setAnswers({ 999: "Uploaded_Document.pdf" })}
                >
                  {isReadyToSubmit ? (
                    <div className="flex items-center gap-3 justify-center">
                      <Check size={20} className="text-[#a68b5b]" />
                      <span style={{ ...S, fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>{answers[999] as string}</span>
                      <button onClick={(e) => { e.stopPropagation(); setAnswers({}); }} className="text-[#8e8e96] hover:text-[#3a3a42]"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-3">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#cdcdd2]">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="17 8 12 3 7 8"></polyline>
                          <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                      </div>
                      <p style={{ ...S, fontSize: "13px", fontWeight: 500, color: "#5a5a62" }}>Click to upload your completed file</p>
                      <p style={{ ...S, fontSize: "11px", color: "#b0b0b5", marginTop: 4 }}>PDF, DOCX, or images</p>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowConfirm(true)}
                disabled={!isReadyToSubmit}
                className="w-full py-3 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors disabled:opacity-30"
                style={{ ...S, fontSize: "14px", fontWeight: 600 }}
              >
                Submit Quiz
              </button>
            </div>
          </div>

          {showConfirm && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 text-center">
                <div className="w-11 h-11 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={18} className="text-[#5a5a62]" />
                </div>
                <h3 style={{ ...S, fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Submit quiz?</h3>
                <p style={{ ...S, fontSize: "12px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
                  Are you sure you want to submit your file? This cannot be undone.
                </p>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-[#dcdce0] text-[#3a3a42] hover:bg-[#f5f5f7] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 500 }}>Cancel</button>
                  <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>Submit</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Platform format
    if (currentQuestion) {
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
            {config.timeLimitMinutes && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${timerCritical ? "bg-[#3a3a42] text-[#faf8f5]" : timerWarning ? "bg-[#f0ece6] text-[#a68b5b]" : "bg-[#f3f3f5] text-[#5a5a62]"}`}>
                <Clock size={14} />
                <span style={{ ...S, fontSize: "14px", fontWeight: 700 }}>{formatTime(timeLeft)}</span>
              </div>
            )}
            <span style={{ ...S, fontSize: "12px", color: "#8e8e96" }}>
              {answeredCount}/{orderedQuestions.length} answered
            </span>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-1.5 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
              style={{ ...S, fontSize: "12px", fontWeight: 600 }}
            >
              Submit
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Question nav sidebar */}
          {showNav && (
            <div className="w-[200px] bg-white border-r border-[#ededf0] p-4 overflow-y-auto flex-shrink-0">
              <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Questions
              </p>
              <div className="grid grid-cols-5 gap-1.5">
                {orderedQuestions.map((q, i) => {
                  const answered = answers[q.id] !== undefined && answers[q.id] !== "";
                  const isFlagged = flagged.has(q.id);
                  const isCurrent = i === currentQ;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all relative ${
                        isCurrent
                          ? "bg-[#5a5a62] text-[#faf8f5]"
                          : answered
                          ? "bg-[#e8e8ea] text-[#3a3a42]"
                          : "bg-[#f3f3f5] text-[#8e8e96] hover:bg-[#e8e8ea]"
                      }`}
                      style={{ ...S, fontSize: "11px", fontWeight: 600 }}
                    >
                      {i + 1}
                      {isFlagged && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#d4a574]" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1 mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#e8e8ea]" />
                  <span style={{ ...S, fontSize: "9px", color: "#8e8e96" }}>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#f3f3f5]" />
                  <span style={{ ...S, fontSize: "9px", color: "#8e8e96" }}>Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4a574]" />
                  <span style={{ ...S, fontSize: "9px", color: "#8e8e96" }}>Flagged</span>
                </div>
              </div>
            </div>
          )}

          {/* Main question area */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[640px] mx-auto">
              {/* Question header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-md bg-[#6c6c6c] text-[#faf8f5] flex items-center justify-center" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                    {currentQ + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#f3f3f5] text-[#8e8e96]" style={{ ...S, fontSize: "10px", fontWeight: 500 }}>
                    {TYPE_LABEL[currentQuestion.type]}
                  </span>
                  <span style={{ ...S, fontSize: "11px", color: "#b0b0b5" }}>{currentQuestion.points} pt{currentQuestion.points !== 1 ? "s" : ""}</span>
                </div>
                <button
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                    flagged.has(currentQuestion.id) ? "bg-[#f0ece6] text-[#a68b5b]" : "text-[#b0b0b5] hover:text-[#8e8e96]"
                  }`}
                  style={{ ...S, fontSize: "11px", fontWeight: 500 }}
                >
                  <Flag size={12} /> {flagged.has(currentQuestion.id) ? "Flagged" : "Flag"}
                </button>
              </div>

              {/* Question text */}
              <div className="bg-white rounded-xl border border-[#ededf0] p-6 mb-5">
                <p style={{ ...S, fontSize: "15px", fontWeight: 500, color: "#0a1628", lineHeight: 1.7 }}>
                  {currentQuestion.text}
                </p>
              </div>

              {/* Answer area */}
              <div className="bg-white rounded-xl border border-[#ededf0] p-6">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                  Your Answer
                </p>

                {/* MCQ */}
                {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                  <div className="flex flex-col gap-2">
                    {currentQuestion.options.map((opt, i) => {
                      const selected = answers[currentQuestion.id] === i;
                      return (
                        <button
                          key={i}
                          onClick={() => setAnswer(currentQuestion.id, i)}
                          className={`flex items-center gap-3 p-3.5 rounded-lg border text-left transition-all ${
                            selected ? "border-[#d4a574] bg-[#faf7f3]" : "border-[#ededf0] hover:border-[#cdcdd2]"
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            selected ? "border-[#d4a574] bg-[#d4a574]" : "border-[#cdcdd2]"
                          }`}>
                            {selected && <Check size={12} className="text-white" />}
                          </span>
                          <span style={{ ...S, fontSize: "13px", color: selected ? "#0a1628" : "#5a5a62", fontWeight: selected ? 500 : 400 }}>
                            <span className="text-[#b0b0b5] mr-2" style={{ fontWeight: 600 }}>{String.fromCharCode(65 + i)}.</span>
                            {opt}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === "true_false" && (
                  <div className="flex gap-3">
                    {[true, false].map((val) => {
                      const selected = answers[currentQuestion.id] === val;
                      return (
                        <button
                          key={String(val)}
                          onClick={() => setAnswer(currentQuestion.id, val)}
                          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-lg border transition-all ${
                            selected ? "border-[#5a5a62] bg-[#5a5a62] text-[#faf8f5]" : "border-[#ededf0] text-[#5a5a62] hover:border-[#cdcdd2]"
                          }`}
                          style={{ ...S, fontSize: "14px", fontWeight: 600 }}
                        >
                          {selected && <Check size={14} />}
                          {val ? "True" : "False"}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {currentQuestion.type === "short_answer" && (
                  <div>
                    <textarea
                      value={(answers[currentQuestion.id] as string) || ""}
                      onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Type your answer here..."
                      rows={3}
                      className="w-full px-4 py-3 border border-[#ededf0] rounded-lg bg-[#fafafb] text-[#0a1628] placeholder-[#cdcdd2] outline-none focus:border-[#8e8e96] transition-all resize-none"
                      style={{ ...S, fontSize: "13px", lineHeight: 1.6 }}
                    />
                    <p style={{ ...S, fontSize: "10px", color: "#b0b0b5", marginTop: 4 }}>
                      Brief response — 1–3 sentences
                    </p>
                  </div>
                )}

                {/* Long Answer */}
                {currentQuestion.type === "long_answer" && (
                  <div>
                    <textarea
                      value={(answers[currentQuestion.id] as string) || ""}
                      onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Write your extended response here..."
                      rows={8}
                      className="w-full px-4 py-3 border border-[#ededf0] rounded-lg bg-[#fafafb] text-[#0a1628] placeholder-[#cdcdd2] outline-none focus:border-[#8e8e96] transition-all resize-none"
                      style={{ ...S, fontSize: "13px", lineHeight: 1.7 }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>
                        {currentQuestion.minWords ? `Min ${currentQuestion.minWords} words` : ""}
                        {currentQuestion.minWords && currentQuestion.maxWords ? " · " : ""}
                        {currentQuestion.maxWords ? `Max ${currentQuestion.maxWords} words` : ""}
                      </p>
                      <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96" }}>
                        {wordCount((answers[currentQuestion.id] as string) || "")} words
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={() => setCurrentQ((p) => Math.max(0, p - 1))}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#ededf0] text-[#5a5a62] hover:bg-[#fafafb] disabled:opacity-30 transition-colors"
                  style={{ ...S, fontSize: "13px", fontWeight: 500 }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>

                <p style={{ ...S, fontSize: "12px", color: "#b0b0b5" }}>
                  {currentQ + 1} of {orderedQuestions.length}
                </p>

                {currentQ < orderedQuestions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQ((p) => Math.min(orderedQuestions.length - 1, p + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
                    style={{ ...S, fontSize: "13px", fontWeight: 500 }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setPhase("review")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
                    style={{ ...S, fontSize: "13px", fontWeight: 500 }}
                  >
                    Review <Eye size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit confirm */}
        {showConfirm && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 text-center">
              <div className="w-11 h-11 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={18} className="text-[#5a5a62]" />
              </div>
              <h3 style={{ ...S, fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Submit quiz?</h3>
              <p style={{ ...S, fontSize: "12px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
                You've answered {answeredCount} of {orderedQuestions.length} questions.
                {answeredCount < orderedQuestions.length && <><br /><strong style={{ color: "#5a5a62" }}>{orderedQuestions.length - answeredCount} unanswered</strong> will receive 0 points.</>}
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-[#dcdce0] text-[#3a3a42] hover:bg-[#f5f5f7] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 500 }}>Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

  // ─── REVIEW ────────────────────────────────────────────────────────────
  if (phase === "review") {
    return (
      <div className="fixed inset-0 z-50 bg-[#f5f6f8] flex flex-col">
        <div className="bg-white border-b border-[#ededf0] px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { setPhase("taking"); }} className="text-[#8e8e96] hover:text-[#0a1628]">
              <ChevronLeft size={18} />
            </button>
            <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>Review Answers</p>
          </div>
          <div className="flex items-center gap-3">
            {config.timeLimitMinutes && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${timerCritical ? "bg-[#3a3a42] text-[#faf8f5]" : "bg-[#f3f3f5] text-[#5a5a62]"}`}>
                <Clock size={14} />
                <span style={{ ...S, fontSize: "14px", fontWeight: 700 }}>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={() => setShowConfirm(true)}
              className="px-5 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}
            >
              Submit Quiz
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[640px] mx-auto">
            {/* Summary */}
            <div className="bg-white rounded-xl border border-[#ededf0] p-5 mb-5">
              <div className="flex items-center justify-between">
                <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>Summary</p>
                <span style={{ ...S, fontSize: "12px", color: "#8e8e96" }}>
                  {answeredCount}/{orderedQuestions.length} answered
                </span>
              </div>
              {flagged.size > 0 && (
                <p style={{ ...S, fontSize: "11px", color: "#a68b5b", marginTop: 4 }}>
                  {flagged.size} flagged question{flagged.size > 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* All questions */}
            <div className="flex flex-col gap-3">
              {orderedQuestions.map((q, i) => {
                const a = answers[q.id];
                const answered = a !== undefined && a !== "";
                const isFlagged = flagged.has(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => { setCurrentQ(i); setPhase("taking"); }}
                    className={`w-full bg-white rounded-xl border px-5 py-4 text-left hover:shadow-sm transition-all ${
                      isFlagged ? "border-[#d4a574]" : answered ? "border-[#ededf0]" : "border-[#ededf0]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${answered ? "bg-[#e8e8ea] text-[#3a3a42]" : "bg-[#f3f3f5] text-[#8e8e96]"}`}
                        style={{ ...S, fontSize: "11px", fontWeight: 700 }}>
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p style={{ ...S, fontSize: "13px", color: "#0a1628", lineHeight: 1.4 }} className="line-clamp-2">{q.text}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-[#f3f3f5] text-[#8e8e96]" style={{ ...S, fontSize: "9px", fontWeight: 500 }}>
                            {TYPE_LABEL[q.type]}
                          </span>
                          <span style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>{q.points} pts</span>
                          {isFlagged && <span className="px-1.5 py-0.5 rounded bg-[#f0ece6] text-[#a68b5b]" style={{ ...S, fontSize: "9px", fontWeight: 500 }}>Flagged</span>}
                        </div>
                        {answered && (
                          <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 4 }} className="truncate">
                            {q.type === "multiple_choice" ? `Selected: ${q.options?.[a as number] || "—"}` :
                             q.type === "true_false" ? `Selected: ${a ? "True" : "False"}` :
                             `"${String(a).slice(0, 80)}${String(a).length > 80 ? "…" : ""}"`}
                          </p>
                        )}
                        {!answered && (
                          <p style={{ ...S, fontSize: "11px", color: "#cdcdd2", marginTop: 4, fontStyle: "italic" }}>Not answered</p>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-[#cdcdd2] flex-shrink-0 mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[380px] p-6 text-center">
              <div className="w-11 h-11 rounded-full bg-[#f3f3f5] flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={18} className="text-[#5a5a62]" />
              </div>
              <h3 style={{ ...S, fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>Submit quiz?</h3>
              <p style={{ ...S, fontSize: "12px", color: "#8e8e96", marginTop: 6, lineHeight: 1.5 }}>
                {answeredCount}/{orderedQuestions.length} answered. This cannot be undone.
              </p>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-lg border border-[#dcdce0] text-[#3a3a42] hover:bg-[#f5f5f7] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 500 }}>Cancel</button>
                <button onClick={handleSubmit} className="flex-1 py-2 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>Submit</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULTS ───────────────────────────────────────────────────────────
  if (phase === "results") {
    const score = calculateScore();
    const pct = Math.round((score / totalPoints) * 100);
    const passed = pct >= config.passingScorePercent;

    return (
      <div className="fixed inset-0 z-50 bg-[#f5f6f8] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[520px] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0]">
            <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>Quiz Results</p>
            <button onClick={onClose} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
          </div>

          <div className="px-6 py-6">
            {/* Score circle */}
            <div className="flex flex-col items-center py-4">
              <div className="w-24 h-24 rounded-full border-4 border-[#d4a574] flex items-center justify-center mb-4">
                <div className="text-center">
                  <p style={{ ...S, fontSize: "28px", fontWeight: 700, color: "#3a3a42" }}>{pct}%</p>
                </div>
              </div>
              <p style={{ ...S, fontSize: "16px", fontWeight: 600, color: "#0a1628" }}>
                {score}/{totalPoints} points
              </p>
              <span className={`mt-2 px-3 py-1 rounded-md ${passed ? "bg-[#e8e8ea] text-[#3a3a42]" : "bg-[#f0ece6] text-[#a68b5b]"}`}
                style={{ ...S, fontSize: "12px", fontWeight: 500 }}>
                {passed ? "Passed" : "Below passing score"}
              </span>
            </div>

            {/* Breakdown */}
            {config.showFeedback && (
              <div className="mt-4">
                <p style={{ ...S, fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Question Breakdown
                </p>
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {orderedQuestions.map((q, i) => {
                    const a = answers[q.id];
                    let correct = false;
                    if (q.type === "multiple_choice") correct = a === q.correctAnswer;
                    else if (q.type === "true_false") correct = a === q.correctAnswer;
                    else correct = a !== undefined && a !== ""; // Assume correct for text (manually graded)
                    const isTextType = q.type === "short_answer" || q.type === "long_answer";

                    return (
                      <div key={q.id} className={`px-4 py-3 rounded-lg border ${correct ? "border-[#ededf0] bg-[#fafafb]" : "border-[#ededf0] bg-[#fafafb]"}`}>
                        <div className="flex items-start gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${correct ? "bg-[#e8e8ea] text-[#3a3a42]" : "bg-[#e8e8ea] text-[#8e8e96]"}`}>
                            {correct ? <Check size={10} /> : <X size={10} />}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p style={{ ...S, fontSize: "12px", color: "#0a1628", lineHeight: 1.4 }}>{q.text}</p>
                            {q.type === "multiple_choice" && (
                              <div className="mt-2">
                                {a !== undefined && a !== q.correctAnswer && (
                                  <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>Your answer: {q.options?.[a as number]}</p>
                                )}
                                <p style={{ ...S, fontSize: "11px", color: "#3a3a42", fontWeight: 500 }}>Correct: {q.options?.[q.correctAnswer as number]}</p>
                              </div>
                            )}
                            {q.type === "true_false" && (
                              <div className="mt-2">
                                {a !== q.correctAnswer && (
                                  <p style={{ ...S, fontSize: "11px", color: "#8e8e96" }}>Your answer: {a === true ? "True" : a === false ? "False" : "—"}</p>
                                )}
                                <p style={{ ...S, fontSize: "11px", color: "#3a3a42", fontWeight: 500 }}>Correct: {q.correctAnswer ? "True" : "False"}</p>
                              </div>
                            )}
                            {isTextType && (
                              <p style={{ ...S, fontSize: "10px", color: "#b0b0b5", marginTop: 4, fontStyle: "italic" }}>
                                Pending manual review by instructor
                              </p>
                            )}
                          </div>
                          <span style={{ ...S, fontSize: "11px", fontWeight: 600, color: correct ? "#3a3a42" : "#8e8e96" }}>
                            {correct ? q.points : 0}/{q.points}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full mt-6 py-2.5 rounded-lg bg-[#5a5a62] text-[#faf8f5] hover:bg-[#4a4a52] transition-colors"
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}