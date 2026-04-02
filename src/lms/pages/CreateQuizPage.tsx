import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft, ChevronRight, Check, FileText, Plus, Trash2,
  Clock, Target, RefreshCw, Shuffle, Eye, AlertCircle, ArrowLeft,
  AlignLeft, PenLine, Info, MonitorCheck, Upload, Link2,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseSelectLabel, courseTitleWithTracks } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };

type QuestionType = "multiple_choice" | "true_false" | "short_answer" | "long_answer";

interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: number | string;
  points: number;
  minWords?: number;
  maxWords?: number;
}

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${i < current ? "bg-[#0a1628] border-[#0a1628] text-white" : i === current ? "bg-[#d4a574] border-[#d4a574] text-white" : "bg-white border-gray-300 text-gray-400"}`}
              style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span style={{ ...S, fontSize: "10px", fontWeight: i === current ? 700 : 400, color: i === current ? "#0a1628" : i < current ? "#d4a574" : "#9ca3af", marginTop: 4, whiteSpace: "nowrap" }}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < current ? "bg-[#d4a574]" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

let nextId = 1;

const TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "MCQ",
  true_false: "T/F",
  short_answer: "Short",
  long_answer: "Long",
};

function QuestionCard({ question, index, onChange, onDelete }: {
  question: Question; index: number;
  onChange: (q: Question) => void; onDelete: () => void;
}) {
  const updateOption = (i: number, val: string) => {
    const opts = [...question.options]; opts[i] = val;
    onChange({ ...question, options: opts });
  };

  const switchType = (type: QuestionType) => {
    const base = {
      multiple_choice: { options: question.options.length >= 2 ? question.options : ["", "", "", ""], correctAnswer: 0 },
      true_false:      { options: ["True", "False"], correctAnswer: 0 },
      short_answer:    { options: [], correctAnswer: "" },
      long_answer:     { options: [], correctAnswer: "" },
    }[type];
    onChange({ ...question, type, ...base });
  };

  return (
    <div className="border border-gray-200 p-4 bg-[#fafafa]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-6 h-6 bg-[#0a1628] text-white flex items-center justify-center text-xs font-bold flex-shrink-0" style={S}>
            {index + 1}
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {(["multiple_choice", "true_false", "short_answer", "long_answer"] as QuestionType[]).map((type) => (
              <button key={type} onClick={() => switchType(type)}
                className={`px-2 py-0.5 text-xs border transition-colors ${question.type === type ? "border-black bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
                style={{ ...S, fontWeight: 500 }}>
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input type="number" value={question.points} onChange={(e) => onChange({ ...question, points: Number(e.target.value) })}
            min="1" className="w-14 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs font-bold"
            style={S} />
          <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>pts</span>
          <button onClick={onDelete} className="p-1 hover:text-red-500 transition-colors text-[#6c6c6c]"><Trash2 size={14} /></button>
        </div>
      </div>

      <textarea value={question.text} onChange={(e) => onChange({ ...question, text: e.target.value })}
        placeholder="Enter your question here..." rows={2}
        className="w-full border border-gray-200 px-3 py-2 mb-3 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] resize-none bg-white"
        style={{ ...S, fontSize: "13px" }} />

      {/* MCQ */}
      {question.type === "multiple_choice" && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2">
              <button onClick={() => onChange({ ...question, correctAnswer: oi })}
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${question.correctAnswer === oi ? "border-[#d4a574] bg-[#d4a574]" : "border-gray-300"}`}>
                {question.correctAnswer === oi && <Check size={10} className="text-white mx-auto" />}
              </button>
              <input type="text" value={opt} onChange={(e) => updateOption(oi, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                className="flex-1 border border-gray-200 px-3 py-1.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] bg-white"
                style={{ ...S, fontSize: "12px" }} />
            </div>
          ))}
          {question.options.length < 6 && (
            <button onClick={() => onChange({ ...question, options: [...question.options, ""] })}
              className="flex items-center gap-1 text-[#d4a574] hover:text-[#b8895a] transition-colors mt-1"
              style={{ ...S, fontSize: "12px", fontWeight: 500 }}>
              <Plus size={12} /> Add Option
            </button>
          )}
          <p style={{ ...S, fontSize: "10px", color: "#9ca3af" }}>Click a circle to mark the correct answer.</p>
        </div>
      )}

      {/* True/False */}
      {question.type === "true_false" && (
        <div className="flex gap-3">
          {["True", "False"].map((opt, oi) => (
            <button key={opt} onClick={() => onChange({ ...question, correctAnswer: oi })}
              className={`flex items-center gap-2 px-4 py-2 border transition-all ${question.correctAnswer === oi ? "border-[#0a1628] bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
              {question.correctAnswer === oi && <Check size={12} />}
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Short Answer */}
      {question.type === "short_answer" && (
        <div className="flex flex-col gap-2">
          <div className="bg-[#f8f8f9] border border-gray-200 px-3 py-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <PenLine size={12} className="text-[#6c6c6c]" />
              <p style={{ ...S, fontSize: "11px", fontWeight: 600, color: "#0a1628" }}>Short Answer</p>
            </div>
            <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>
              Student types a brief response — typically 1–3 sentences or a specific value. Manually graded.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Min words:</span>
              <input type="number" value={question.minWords ?? ""} min="0"
                onChange={(e) => onChange({ ...question, minWords: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="—" className="w-16 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs"
                style={S} />
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Max words:</span>
              <input type="number" value={question.maxWords ?? ""} min="0"
                onChange={(e) => onChange({ ...question, maxWords: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="—" className="w-16 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs"
                style={S} />
            </div>
            <span style={{ ...S, fontSize: "10px", color: "#9ca3af" }}>Optional — leave blank for no limit</span>
          </div>
        </div>
      )}

      {/* Long Answer */}
      {question.type === "long_answer" && (
        <div className="flex flex-col gap-2">
          <div className="bg-[#f8f8f9] border border-gray-200 px-3 py-2.5 flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <AlignLeft size={12} className="text-[#6c6c6c]" />
              <p style={{ ...S, fontSize: "11px", fontWeight: 600, color: "#0a1628" }}>Long Answer / Essay</p>
            </div>
            <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>
              Student writes an extended response — analysis, discussion, or explanation. Always manually graded by the instructor.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Min words:</span>
              <input type="number" value={question.minWords ?? ""} min="0"
                onChange={(e) => onChange({ ...question, minWords: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="—" className="w-16 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs"
                style={S} />
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Max words:</span>
              <input type="number" value={question.maxWords ?? ""} min="0"
                onChange={(e) => onChange({ ...question, maxWords: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="—" className="w-16 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs"
                style={S} />
            </div>
            <span style={{ ...S, fontSize: "10px", color: "#9ca3af" }}>Optional — leave blank for no limit</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function CreateQuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]                     = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(preselectedCourseId || "");
  const [selectedTrack, setSelectedTrack]   = useState("All");
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");
  const [deliveryFormat, setDeliveryFormat] = useState<"platform" | "document">("platform");
  const [quizFile, setQuizFile]             = useState<File | null>(null);
  const [dragOver, setDragOver]             = useState(false);
  const [hasTimeLimit, setHasTimeLimit]     = useState(true);
  const [timeLimit, setTimeLimit]           = useState("30");
  const [timeLimitUnit, setTimeLimitUnit]   = useState<"minutes" | "hours">("minutes");
  const [questions, setQuestions]           = useState<Question[]>([
    { id: nextId++, type: "multiple_choice", text: "", options: ["", "", "", ""], correctAnswer: 0, points: 5 },
  ]);
  const [passingScore, setPassingScore]     = useState("50");
  const [attempts, setAttempts]             = useState("1");
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions]     = useState(false);
  const [showFeedback, setShowFeedback]         = useState(true);
  const [availableFrom, setAvailableFrom]   = useState("");
  const [availableTo, setAvailableTo]       = useState("");
  const [published, setPublished]           = useState(false);
  const [documentPoints, setDocumentPoints] = useState("100");

  const STEPS = deliveryFormat === "document"
    ? ["Quiz Setup", "Upload Document", "Settings", "Preview & Publish"]
    : ["Quiz Setup", "Add Questions", "Settings", "Preview & Publish"];

  const course = COURSES.find((c) => c.id === Number(selectedCourse));
  const totalPoints = deliveryFormat === "platform" 
    ? questions.reduce((sum, q) => sum + q.points, 0) 
    : Number(documentPoints);

  const addQuestion = (type: QuestionType) => {
    const q: Question = {
      id: nextId++, type, text: "", points: 5,
      options:       type === "true_false" ? ["True", "False"] : type === "multiple_choice" ? ["", "", "", ""] : [],
      correctAnswer: 0,
    };
    setQuestions((prev) => [...prev, q]);
  };

  const updateQuestion = (id: number, q: Question) => setQuestions((prev) => prev.map((p) => (p.id === id ? q : p)));
  const deleteQuestion  = (id: number) => setQuestions((prev) => prev.filter((p) => p.id !== id));

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setQuizFile(f);
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setQuizFile(e.target.files[0]);
  };

  const canProceed = () => {
    if (step === 0) return selectedCourse !== "" && title !== "";
    if (step === 1) {
      if (deliveryFormat === "document") return quizFile !== null && documentPoints !== "";
      return questions.length > 0 && questions.every((q) => q.text.trim() !== "");
    }
    return true;
  };

  const timeLimitDisplay = hasTimeLimit
    ? `${timeLimit} ${timeLimitUnit === "hours" ? "hr" : "min"}`
    : "None";

  if (published) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
        <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses" }, { label: "Create Quiz" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />
        <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
          <InstructorSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="bg-white border border-gray-200 p-10 text-center max-w-md w-full">
              <div className="w-16 h-16 bg-[rgba(212,165,116,0.1)] flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-[#d4a574]" strokeWidth={2.5} />
              </div>
              <h2 style={{ ...S, fontWeight: 700, fontSize: "20px", color: "#0a1628", marginBottom: 8 }}>Quiz Published!</h2>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", lineHeight: 1.7 }}>
                <span className="font-semibold text-[#0a1628]">"{title}"</span> is now live for{" "}
                <span className="font-semibold text-[#0a1628]">{course ? courseTitleWithTracks(course) : ""}</span>.
              </p>
              {deliveryFormat === "platform" ? (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  {questions.length} questions · {totalPoints} pts · {hasTimeLimit ? `${timeLimit} ${timeLimitUnit} timer` : "No timer"}
                </p>
              ) : (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  Document Upload format · {totalPoints} pts · {hasTimeLimit ? `${timeLimit} ${timeLimitUnit} timer` : "No timer"}
                </p>
              )}
              <div className="flex flex-col gap-3 mt-6">
                <button onClick={() => navigate(`/instructor/courses/${selectedCourse}`)}
                  className="flex items-center justify-center gap-2 px-4 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors w-full"
                  style={{ ...S, fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                  View Course
                </button>
                <button onClick={() => { setPublished(false); setStep(0); setTitle(""); setQuestions([{ id: nextId++, type: "multiple_choice", text: "", options: ["", "", "", ""], correctAnswer: 0, points: 5 }]); }}
                  className="flex items-center justify-center gap-2 px-4 h-[47px] border border-gray-200 hover:bg-gray-50 transition-colors w-full"
                  style={{ ...S, fontSize: "14px", color: "#6c6c6c" }}>
                  Create Another Quiz
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses", href: "/instructor/courses" }, { label: "Create Quiz" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 transition-colors hover:text-[#0a1628] text-[#6c6c6c]" style={{ ...S, fontSize: "13px" }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>Create Quiz</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>Build a quiz to assess student understanding</p>
            </div>

            <StepIndicator current={step} steps={STEPS} />

            {/* ── Step 0: Quiz Setup ─────────────────────────────── */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select value={selectedCourse} onChange={(e) => {
                      setSelectedCourse(e.target.value);
                      setSelectedTrack("All");
                    }}
                    className="w-full border border-gray-200 px-3 py-2.5 bg-white text-[#0a1628] outline-none focus:border-[#d4a574] appearance-none"
                    style={{ ...S, fontSize: "13px" }}>
                    <option value="">Select a course...</option>
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {courseSelectLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCourse && (() => {
                  const c = COURSES.find((c) => c.id === Number(selectedCourse));
                  if (!c || c.tracks.length <= 1) return null;
                  return (
                    <div>
                      <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                        Assign To <span className="text-red-500">*</span>
                      </label>
                      <select value={selectedTrack} onChange={(e) => setSelectedTrack(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2.5 bg-white text-[#0a1628] outline-none focus:border-[#d4a574] transition-all appearance-none"
                        style={{ ...S, fontSize: "13px" }}>
                        <option value="All">All Students (Both Cohorts)</option>
                        {c.tracks.map((t) => <option key={t} value={t}>{t} Cohort Only</option>)}
                      </select>
                    </div>
                  );
                })()}

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Week 2 – Double Entry Quiz"
                    className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                    style={{ ...S, fontSize: "13px" }} />
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Description
                  </label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="Instructions visible to students before they start the quiz..."
                    className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all resize-none"
                    style={{ ...S, fontSize: "13px" }} />
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 4 }}>
                    Delivery Format <span className="text-red-500">*</span>
                  </label>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12 }}>
                    How will the quiz be given to students?
                  </p>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setDeliveryFormat("platform")}
                      className={`flex items-start gap-3 p-3 border text-left transition-all ${deliveryFormat === "platform" ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 ${deliveryFormat === "platform" ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                        <MonitorCheck size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>On-Platform Quiz</p>
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.4, marginTop: 2 }}>Build questions (MCQ, True/False, etc.) directly in the platform. Students will take the quiz interactively online.</p>
                      </div>
                      {deliveryFormat === "platform" && <Check size={14} className="text-[#d4a574] flex-shrink-0 mt-1" />}
                    </button>
                    <button onClick={() => setDeliveryFormat("document")}
                      className={`flex items-start gap-3 p-3 border text-left transition-all ${deliveryFormat === "document" ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                      <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 ${deliveryFormat === "document" ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                        <FileText size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Document Upload</p>
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.4, marginTop: 2 }}>Upload a PDF or Word document. Students will download it, complete it, and re-upload their response.</p>
                      </div>
                      {deliveryFormat === "document" && <Check size={14} className="text-[#d4a574] flex-shrink-0 mt-1" />}
                    </button>
                  </div>
                </div>

                {/* Timer — with clear availability vs timer distinction */}
                <div className="border border-gray-200 p-4 bg-[#f8f8f9]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Quiz Timer</p>
                      <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 1 }}>
                        How long each student gets <strong>once they click "Start Quiz"</strong>
                      </p>
                    </div>
                    <button onClick={() => setHasTimeLimit(!hasTimeLimit)}
                      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${hasTimeLimit ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${hasTimeLimit ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>

                  {hasTimeLimit ? (
                    <div className="flex items-center gap-3">
                      <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} min="1" max="600"
                        className="w-24 border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] text-center"
                        style={{ ...S, fontSize: "16px", fontWeight: 700 }} />
                      <div className="flex gap-1">
                        {(["minutes", "hours"] as const).map((u) => (
                          <button key={u} onClick={() => setTimeLimitUnit(u)}
                            className={`px-3 py-2 border text-xs font-semibold transition-colors ${timeLimitUnit === u ? "border-black bg-[#0a1628] text-white" : "border-gray-200 text-[#6c6c6c] hover:border-gray-400"}`}
                            style={S}>
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>No time limit — students can take as long as needed.</p>
                  )}

                  {/* Availability vs timer callout */}
                  <div className="mt-3 flex items-start gap-2 bg-white border border-gray-200 px-3 py-2.5">
                    <Info size={12} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                    <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>
                      <strong style={{ color: "#0a1628" }}>Timer ≠ Availability window.</strong>{" "}
                      The availability window (set in Settings) controls <em>when</em> the quiz can be started.
                      The timer controls <em>how long</em> the student has once they begin — even if the quiz
                      is available for a week, once started the countdown runs.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 1: Questions / Document ──────────────────────────── */}
            {step === 1 && deliveryFormat === "platform" && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2">
                  <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>
                    {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalPoints} pts total
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Add:</span>
                    {([
                      ["MCQ",   "multiple_choice"],
                      ["T/F",   "true_false"],
                      ["Short", "short_answer"],
                      ["Long",  "long_answer"],
                    ] as [string, QuestionType][]).map(([label, type]) => (
                      <button key={type} onClick={() => addQuestion(type)}
                        className="flex items-center gap-1 px-3 h-[32px] border border-black hover:bg-[#f5f5f5] transition-colors"
                        style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                        <Plus size={11} /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question type guide */}
                <div className="bg-[#f8f8f9] border border-gray-200 px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
                  <div className="flex items-start gap-2">
                    <span style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#d4a574", minWidth: 32 }}>Short</span>
                    <span style={{ ...S, fontSize: "10px", color: "#6c6c6c" }}>Brief response — 1–3 sentences or a specific value. Manually graded.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#d4a574", minWidth: 32 }}>Long</span>
                    <span style={{ ...S, fontSize: "10px", color: "#6c6c6c" }}>Essay / analysis — extended paragraphs, 300+ words. Always manually graded.</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {questions.map((q, i) => (
                    <QuestionCard key={q.id} question={q} index={i}
                      onChange={(updated) => updateQuestion(q.id, updated)}
                      onDelete={() => deleteQuestion(q.id)} />
                  ))}
                </div>

                {questions.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 p-10 text-center">
                    <FileText size={32} className="text-gray-200 mx-auto mb-3" />
                    <p style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}>No questions yet. Use the buttons above to add questions.</p>
                  </div>
                )}
              </div>
            )}

            {step === 1 && deliveryFormat === "document" && (
              <div className="flex flex-col gap-5">
                <div>
                  <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>Upload Quiz Document</p>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12 }}>
                    Students will download this file, complete their answers, and upload their finished work.
                  </p>
                  
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer ${dragOver ? "border-[#d4a574] bg-[rgba(212,165,116,0.05)]" : "border-gray-200 hover:border-gray-400 bg-[#fafafa]"}`}
                  >
                    <input type="file" ref={fileRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx" />
                    
                    {quizFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-[#0a1628] text-white flex items-center justify-center">
                          <FileText size={20} />
                        </div>
                        <div className="text-left">
                          <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{quizFile.name}</p>
                          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{(quizFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setQuizFile(null); }} className="p-2 text-[#6c6c6c] hover:text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={32} className={`mx-auto mb-4 ${dragOver ? "text-[#d4a574]" : "text-gray-300"}`} />
                        <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>
                          Click to upload or drag and drop
                        </p>
                        <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                          PDF, DOC, or DOCX (max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Total Points <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={documentPoints} onChange={(e) => setDocumentPoints(e.target.value)} min="1"
                      className="w-24 border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] text-center"
                      style={{ ...S, fontSize: "16px", fontWeight: 700 }} />
                    <span style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}>points</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Settings ──────────────────────────────── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>Passing Score (%)</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={passingScore} onChange={(e) => setPassingScore(e.target.value)} min="0" max="100"
                        className="w-24 border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] text-center"
                        style={{ ...S, fontSize: "16px", fontWeight: 700 }} />
                      <span style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}>%</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>Allowed Attempts</label>
                    <div className="flex items-center gap-2">
                      <input type="number" value={attempts} onChange={(e) => setAttempts(e.target.value)} min="1" max="10"
                        className="w-24 border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] text-center"
                        style={{ ...S, fontSize: "16px", fontWeight: 700 }} />
                      <span style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}>attempt{Number(attempts) !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { label: "Shuffle question order", desc: "Randomise the order of questions for each student", state: shuffleQuestions, set: setShuffleQuestions, icon: Shuffle },
                    { label: "Shuffle answer options", desc: "Randomise MCQ answer choices for each attempt", state: shuffleOptions, set: setShuffleOptions, icon: RefreshCw },
                    { label: "Show feedback after submission", desc: "Display correct answers once student submits", state: showFeedback, set: setShowFeedback, icon: Eye },
                  ].map((opt) => (
                    <div key={opt.label} className="flex items-center justify-between p-4 border border-gray-200 bg-[#fafafa]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                          <opt.icon size={15} className="text-[#6c6c6c]" />
                        </div>
                        <div>
                          <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{opt.label}</p>
                          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{opt.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => opt.set(!opt.state)}
                        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${opt.state ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${opt.state ? "left-[22px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Availability window */}
                <div className="border border-gray-200 p-4">
                  <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>Availability Window</p>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12, lineHeight: 1.5 }}>
                    Controls <strong>when</strong> students can open the quiz. Once they click "Start", their individual timer begins.
                    Leave blank to make it available immediately upon publishing.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#6c6c6c", display: "block", marginBottom: 6 }}>Opens</label>
                      <input type="datetime-local" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574]"
                        style={{ ...S, fontSize: "12px" }} />
                    </div>
                    <div>
                      <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#6c6c6c", display: "block", marginBottom: 6 }}>Closes</label>
                      <input type="datetime-local" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574]"
                        style={{ ...S, fontSize: "12px" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Preview & Publish ──────────────────────── */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="border border-gray-200 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 style={{ ...S, fontWeight: 700, fontSize: "16px", color: "#0a1628" }}>{title}</h3>
                      <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>
                        {course ? courseTitleWithTracks(course) : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{totalPoints}</p>
                      <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>total points</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                    {(deliveryFormat === "platform" ? [
                      { icon: FileText, label: "Questions",        val: questions.length },
                      { icon: Clock,    label: "Timer (per start)", val: hasTimeLimit ? `${timeLimit} ${timeLimitUnit}` : "None" },
                      { icon: RefreshCw, label: "Attempts",         val: attempts },
                      { icon: Target,   label: "Pass mark",         val: `${passingScore}%` },
                    ] : [
                      { icon: FileText, label: "Format",           val: "Document" },
                      { icon: Clock,    label: "Timer (per start)", val: hasTimeLimit ? `${timeLimit} ${timeLimitUnit}` : "None" },
                      { icon: RefreshCw, label: "Attempts",         val: attempts },
                      { icon: Target,   label: "Pass mark",         val: `${passingScore}%` },
                    ]).map((s) => (
                      <div key={s.label} className="flex flex-col items-center p-2 bg-[#f8f8f9]">
                        <s.icon size={14} className="text-[#d4a574] mb-1" />
                        <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>{s.val}</p>
                        <p style={{ ...S, fontSize: "10px", color: "#6c6c6c", textAlign: "center" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {(availableFrom || availableTo) && (
                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 flex-wrap">
                      {availableFrom && <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Opens: <strong style={{ color: "#0a1628" }}>{new Date(availableFrom).toLocaleString()}</strong></span>}
                      {availableTo   && <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Closes: <strong style={{ color: "#0a1628" }}>{new Date(availableTo).toLocaleString()}</strong></span>}
                    </div>
                  )}
                </div>

                {/* Question breakdown by type */}
                {deliveryFormat === "platform" && (
                  <div className="border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f8f9] flex items-center justify-between">
                      <p style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Questions Preview
                      </p>
                      {(() => {
                        const manualCount = questions.filter((q) => q.type === "short_answer" || q.type === "long_answer").length;
                        return manualCount > 0 ? (
                          <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                            {manualCount} question{manualCount > 1 ? "s" : ""} require manual grading
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {questions.slice(0, 6).map((q, i) => (
                        <div key={q.id} className="px-4 py-3 flex items-start gap-3">
                          <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#d4a574", minWidth: 20 }}>{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p style={{ ...S, fontSize: "12px", color: "#0a1628", lineHeight: 1.5 }} className="truncate">
                              {q.text || <span className="text-[#b0b0b0] italic">Question text not set</span>}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="inline-block px-2 py-0.5 bg-gray-100 text-[#6c6c6c] text-xs" style={S}>
                                {q.type === "multiple_choice" ? "MCQ" : q.type === "true_false" ? "True/False" : q.type === "short_answer" ? "Short Answer" : "Long Answer"} · {q.points} pts
                              </span>
                              {(q.type === "short_answer" || q.type === "long_answer") && (
                                <span className="inline-block px-2 py-0.5 bg-[#faf8f5] border border-[rgba(212,165,116,0.3)] text-[#d4a574] text-xs" style={S}>
                                  Manual grade
                                </span>
                              )}
                              {(q.type === "long_answer" || q.type === "short_answer") && (q.minWords || q.maxWords) && (
                                <span style={{ ...S, fontSize: "10px", color: "#9ca3af" }}>
                                  {q.minWords ? `${q.minWords} min` : ""}{q.minWords && q.maxWords ? " – " : ""}{q.maxWords ? `${q.maxWords} max` : ""} words
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {questions.length > 6 && (
                        <div className="px-4 py-2 text-center" style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                          +{questions.length - 6} more questions
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {deliveryFormat === "document" && quizFile && (
                  <div className="border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f8f9] flex items-center justify-between">
                      <p style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Attached Document
                      </p>
                    </div>
                    <div className="px-4 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0a1628] text-white flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                          {quizFile.name}
                        </p>
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                          {(quizFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-[#f8f8f9] border border-gray-200 flex items-center gap-3">
                  <AlertCircle size={15} className="text-[#6c6c6c] flex-shrink-0" />
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                    Once published, students can access this quiz{availableFrom ? ` from ${new Date(availableFrom).toLocaleString()}` : " immediately"}.
                    {hasTimeLimit && ` Each attempt is limited to ${timeLimit} ${timeLimitUnit} from the moment they start.`}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}
                className="flex items-center gap-2 px-4 h-[47px] border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ ...S, fontWeight: 600, fontSize: "14px", color: "#6c6c6c" }}>
                <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
              </button>

              {step < STEPS.length - 1 ? (
                <button onClick={() => setStep(step + 1)} disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ ...S, fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={() => setPublished(true)}
                  className="flex items-center gap-2 px-5 h-[47px] bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ ...S, fontWeight: 600, fontSize: "14px" }}>
                  <FileText size={16} /> Publish Quiz
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex items-center justify-between mt-4">
        <p style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
      </footer>
    </div>
  );
}
