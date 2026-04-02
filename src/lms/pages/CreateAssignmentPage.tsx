import React, { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft, ChevronRight, Check, ClipboardList, FileText,
  CalendarDays, AlertCircle, Upload, Link2, Eye,
  ArrowLeft, PenLine, AlignLeft, CloudUpload, X, Info, Lock,
  Sparkles, RefreshCw, Pencil, MonitorCheck, Plus, Trash2,
  Users2, RotateCcw,
} from "lucide-react";
import type { GroupMode } from "../data/groups";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseDisplayTitleWithTrack, courseSelectLabel, courseTitleWithTracks } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };

// ─── Now 5 steps — Marking Rubric is step 2 ──────────────────────────────────
const STEPS = ["Details", "Deadline & Scoring", "Marking Rubric", "Instructions", "Preview & Publish"];

const assignmentTypes = [
  { id: "assignment",    label: "Written Assignment", desc: "Essay, report, or written work" },
  { id: "exercise",      label: "Practice Exercise",  desc: "Problem set or worked examples" },
  { id: "case_study",    label: "Case Study",          desc: "Real-world analysis and application" },
  { id: "presentation",  label: "Presentation",        desc: "Slide deck or video presentation" },
  { id: "project",       label: "Project",             desc: "Extended research or group work" },
];

const submissionTypes = [
  { id: "file", icon: Upload,   label: "File Upload",    desc: "PDF, Word, or any file format" },
  { id: "text", icon: FileText, label: "Online Text",    desc: "Type directly in the platform" },
  { id: "link", icon: Link2,    label: "URL Submission", desc: "Link to Google Docs, Drive, etc." },
];

const answerFormats = [
  { id: "document",     icon: FileText,     label: "Document Upload",          desc: "Upload a PDF or Word document containing the assignment. Students will download it, complete it, and re-upload their response." },
  { id: "short",        icon: PenLine,      label: "Short Answer",             desc: "Students write a brief response — typically 1–3 sentences or a specific value (e.g. define a term, state a figure)." },
  { id: "long",         icon: AlignLeft,    label: "Long Answer / Essay",      desc: "Students write an extended response — analysis, discussion, or explanation across multiple paragraphs (300+ words). Always manually graded." },
  { id: "bulk",         icon: CloudUpload,  label: "Bulk Question Upload",     desc: "Upload a question paper (PDF or Word). AI reads it, extracts every question, and presents them to students directly on the platform — no downloading needed." },
  { id: "instructions", icon: FileText,     label: "Written Instructions Only",desc: "Type the assignment brief directly. Suitable for essays, projects, and open-ended tasks." },
];

const MOCK_EXTRACTED: ExtractedQuestion[] = [
  { id: 1, text: "Define the term 'double-entry bookkeeping' and explain its fundamental principle.", type: "short_answer", confirmed: true },
  { id: 2, text: "A company purchases equipment worth GHS 50,000 on credit. Record the journal entry.", type: "short_answer", confirmed: true },
  { id: 3, text: "Which of the following best describes a liability?", type: "multiple_choice", options: ["An asset owned by the business", "An amount owed to external parties", "Revenue earned but not collected", "Equity contributed by shareholders"], correctOption: 1, confirmed: true },
  { id: 4, text: "Retained earnings appear on the Income Statement.", type: "true_false", correctAnswer: false, confirmed: true },
  { id: 5, text: "Explain the difference between capital expenditure and revenue expenditure, providing two examples of each.", type: "long_answer", confirmed: true },
  { id: 6, text: "Calculate the gross profit ratio given: Net Sales = GHS 200,000; COGS = GHS 140,000. Show your workings.", type: "short_answer", confirmed: true },
  { id: 7, text: "The accounting equation states that Assets = Liabilities + Equity.", type: "true_false", correctAnswer: true, confirmed: true },
  { id: 8, text: "Discuss how the matching principle affects the preparation of financial statements. Use practical examples from a manufacturing company.", type: "long_answer", confirmed: true },
];

interface ExtractedQuestion {
  id: number;
  text: string;
  type: "short_answer" | "long_answer" | "multiple_choice" | "true_false";
  options?: string[];
  correctOption?: number;
  correctAnswer?: boolean;
  confirmed: boolean;
  minWords?: number;
  maxWords?: number;
}

// ─── Rubric row type ──────────────────────────────────────────────────────────
interface RubricRow {
  id: number;
  criterion: string;
  description: string;
  points: number;
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${i < current ? "bg-[#0a1628] border-[#0a1628] text-white" : i === current ? "bg-[#d4a574] border-[#d4a574] text-white" : "bg-white border-gray-300 text-gray-400"}`}
              style={{ ...S, fontSize: "12px", fontWeight: 700 }}
            >
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

const TYPE_PILL: Record<string, string> = {
  short_answer: "Short", long_answer: "Long", multiple_choice: "MCQ", true_false: "T/F",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
let rubricNextId = 100;

export function CreateAssignmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");

  // Change #14: Assignment creation must be initiated from a course page
  if (!preselectedCourseId) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
        <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Create Assignment" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />
        <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
          <InstructorSidebar />
          <main className="flex-1 min-w-0 flex flex-col items-center justify-center gap-4 py-20">
            <ClipboardList size={48} className="text-gray-300" />
            <h2 style={{ ...S, fontSize: "18px", fontWeight: 700, color: "#0a1628" }}>No course selected</h2>
            <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", textAlign: "center", maxWidth: 400 }}>
              Assignments must be created from within a course. Please navigate to a course first and create the assignment from there.
            </p>
            <button
              onClick={() => navigate("/instructor/courses")}
              className="mt-2 px-5 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 transition-colors"
              style={{ ...S, fontSize: "13px", fontWeight: 600 }}
            >
              Go to My Courses
            </button>
          </main>
        </div>
      </div>
    );
  }

  const questionFileRef = useRef<HTMLInputElement>(null);

  const [step, setStep]                     = useState(0);
  const [selectedCourse, setSelectedCourse] = useState(preselectedCourseId || "");
  const [selectedTrack, setSelectedTrack]   = useState("All");
  const [assignmentType, setAssignmentType] = useState("");
  const [answerFormat, setAnswerFormat]     = useState("instructions");
  const [title, setTitle]                   = useState("");
  const [description, setDescription]       = useState("");

  // Step 1: Deadline & scoring
  const [availableFrom, setAvailableFrom]   = useState("");
  const [availableTo, setAvailableTo]       = useState("");
  const [dueDate, setDueDate]               = useState("");
  const [dueTime, setDueTime]               = useState("23:59");
  const [maxScore, setMaxScore]             = useState("100");
  const [allowLate, setAllowLate]           = useState(false);
  const [latePenalty, setLatePenalty]       = useState("10");
  const [submissionType, setSubmissionType] = useState("file");

  // Step 0: Group assignment
  const [isGroupAssignment, setIsGroupAssignment] = useState(false);
  const [groupMode, setGroupMode]                 = useState<GroupMode>("instructor_assigned");
  const [maxGroupSize, setMaxGroupSize]           = useState("4");
  const [groupFormationDeadline, setGroupFormationDeadline] = useState("");

  // Step 1: Resubmit
  const [allowResubmit, setAllowResubmit] = useState(false);
  // Step 3: Document download permission
  const [allowDocumentDownload, setAllowDocumentDownload] = useState(true);

  // Step 2: Marking rubric
  const [rubricRows, setRubricRows]           = useState<RubricRow[]>([]);
  const [gradeHolistically, setGradeHolistically] = useState(false);

  const rubricTotal     = rubricRows.reduce((s, r) => s + r.points, 0);
  const rubricRemaining = Number(maxScore) - rubricTotal;

  const addRubricRow = () => {
    setRubricRows(prev => [
      ...prev,
      { id: rubricNextId++, criterion: "", description: "", points: Math.max(0, rubricRemaining) },
    ]);
  };
  const updateRubricRow = (id: number, field: keyof RubricRow, val: string | number) =>
    setRubricRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  const removeRubricRow = (id: number) =>
    setRubricRows(prev => prev.filter(r => r.id !== id));

  // Step 3: Instructions / AI
  const [instructions, setInstructions] = useState("");
  const [assignmentMinWords, setAssignmentMinWords] = useState("");
  const [assignmentMaxWords, setAssignmentMaxWords] = useState("");
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [dragOver, setDragOver]         = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiDone, setAiDone]             = useState(false);
  const [extractedQs, setExtractedQs]   = useState<ExtractedQuestion[]>([]);
  const [editingId, setEditingId]       = useState<number | null>(null);
  const [editText, setEditText]         = useState("");
  const [editMinWords, setEditMinWords] = useState<string>("");
  const [editMaxWords, setEditMaxWords] = useState<string>("");

  const [published, setPublished] = useState(false);
  const course = COURSES.find((c) => c.id === Number(selectedCourse));

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setQuestionFile(f); setAiDone(false); setExtractedQs([]); }
  };
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setQuestionFile(e.target.files[0]); setAiDone(false); setExtractedQs([]); }
  };
  const runAiParse = () => {
    setAiProcessing(true);
    setTimeout(() => { setAiProcessing(false); setAiDone(true); setExtractedQs(MOCK_EXTRACTED); }, 2800);
  };
  const startEdit = (q: ExtractedQuestion) => { 
    setEditingId(q.id); 
    setEditText(q.text); 
    setEditMinWords(q.minWords ? String(q.minWords) : "");
    setEditMaxWords(q.maxWords ? String(q.maxWords) : "");
  };
  const saveEdit  = (id: number) => {
    setExtractedQs((prev) => prev.map((q) => q.id === id ? { 
      ...q, 
      text: editText,
      minWords: editMinWords ? Number(editMinWords) : undefined,
      maxWords: editMaxWords ? Number(editMaxWords) : undefined
    } : q));
    setEditingId(null);
  };
  const removeQ = (id: number) => setExtractedQs((prev) => prev.filter((q) => q.id !== id));

  const canProceed = () => {
    if (step === 0) return selectedCourse !== "" && assignmentType !== "" && title !== "" && !(isGroupAssignment && answerFormat === "bulk");
    if (step === 1) return dueDate !== "" && maxScore !== "";
    if (step === 2) return true;                                          // rubric is always optional
    if (step === 3 && answerFormat === "bulk") return aiDone && extractedQs.length > 0;
    return true;
  };

  const handlePublish = () => {
    // Demo persistence: store created doc permissions so AssignmentTaker can enforce them.
    if (typeof window === "undefined") return;
    try {
      const selectedCourseId = Number(selectedCourse);
      const course = COURSES.find((c) => c.id === selectedCourseId);
      const courseName = course?.title ?? "Course";
      const courseCode = course?.shortCode ?? "COURSE";

      const attachmentUrl =
        answerFormat === "document" && questionFile ? URL.createObjectURL(questionFile) : undefined;

      const newAssignment = {
        id: Date.now(),
        title,
        courseId: selectedCourseId,
        course: courseName,
        courseCode,
        description,
        instructions,
        dueDate,
        dueTime,
        maxPoints: Number(maxScore),
        submissionType,
        deliveryFormat: answerFormat === "document" ? "document" : answerFormat,
        questions:
          answerFormat === "bulk"
            ? extractedQs.map((q) => ({
                id: q.id,
                type: q.type,
                text: q.text,
                options: q.options,
                correctOption: q.correctOption,
                correctAnswer: q.correctAnswer,
              }))
            : [],
        assignmentType,
        status: "Not Started",
        allowLate,
        latePenalty: allowLate ? Number(latePenalty) : undefined,
        allowResubmit: allowResubmit ? true : undefined,
        week: undefined,
        rubric: rubricRows.map((r) => ({ criterion: r.criterion, description: r.description, points: r.points })),
        groupConfig: isGroupAssignment
          ? {
              enabled: true,
              mode: groupMode,
              maxGroupSize: Number(maxGroupSize),
              groupFormationDeadline:
                groupMode === "self_enrollment" && groupFormationDeadline ? groupFormationDeadline : undefined,
            }
          : undefined,
        // Document attachment permission + metadata
        allowDocumentDownload: answerFormat === "document" ? allowDocumentDownload : undefined,
        attachmentName: attachmentUrl && questionFile ? questionFile.name : undefined,
        attachmentUrl,
      };

      const storageKey = "lms:createdAssignments";
      const raw = window.localStorage.getItem(storageKey);
      const prev = raw ? JSON.parse(raw) : [];
      const next = Array.isArray(prev) ? [...prev, newAssignment] : [newAssignment];
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore demo persistence failures
    }

    setPublished(true);
  };

  // ── Published success screen ─────────────────────────────────────────────────
  if (published) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
        <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses" }, { label: "Create Assignment" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />
        <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
          <InstructorSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="bg-white border border-gray-200 p-10 text-center max-w-md w-full">
              <div className="w-16 h-16 bg-[rgba(212,165,116,0.1)] flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-[#d4a574]" strokeWidth={2.5} />
              </div>
              <h2 style={{ ...S, fontWeight: 700, fontSize: "20px", color: "#0a1628", marginBottom: 8 }}>Assignment Created!</h2>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", lineHeight: 1.7 }}>
                <span className="font-semibold text-[#0a1628]">"{title}"</span> has been published to{" "}
                <span className="font-semibold text-[#0a1628]">{course ? courseTitleWithTracks(course) : ""}</span>.
              </p>
              {!gradeHolistically && rubricRows.length > 0 && (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  {rubricRows.length} rubric criteria · {rubricTotal}/{maxScore} pts defined
                </p>
              )}
              {answerFormat === "bulk" && (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  {extractedQs.length} AI-parsed questions · Students answer on-platform
                </p>
              )}
              {isGroupAssignment && (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  Group Assignment · {groupMode === "instructor_assigned" ? "Instructor-assigned" : `Self-enrollment · Max ${maxGroupSize} per group`}
                </p>
              )}
              {allowResubmit && (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  Resubmission allowed until deadline
                </p>
              )}
              {answerFormat === "document" && (
                <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                  Document download for students: {allowDocumentDownload ? "Allowed" : "Disabled"}
                </p>
              )}
              <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                Due: {dueDate} at {dueTime} · {maxScore} points
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => navigate("/instructor/assignments")}
                  className="flex items-center justify-center gap-2 px-4 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors w-full"
                  style={{ ...S, fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
                >
                  <ClipboardList size={15} /> View All Assignments
                </button>
                <button
                  onClick={() => {
                    setPublished(false); setStep(0); setTitle(""); setAssignmentType("");
                    setQuestionFile(null); setAiDone(false); setExtractedQs([]); setRubricRows([]);
                  }}
                  className="flex items-center justify-center gap-2 px-4 h-[47px] border border-gray-200 hover:bg-gray-50 transition-colors w-full"
                  style={{ ...S, fontSize: "14px", color: "#6c6c6c" }}
                >
                  Create Another
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
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses", href: "/instructor/courses" }, { label: "Create Assignment" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4 transition-colors hover:text-[#0a1628] text-[#6c6c6c]" style={{ ...S, fontSize: "13px" }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>Create Assignment</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>Design a new assignment for your students</p>
            </div>

            <StepIndicator current={step} steps={STEPS} />

            {/* ── Step 0: Details ───────────────────────────────── */}
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
                    className="w-full border border-gray-200 px-3 py-2.5 bg-white text-[#0a1628] outline-none focus:border-[#d4a574] transition-all appearance-none"
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
                    Assignment Title <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Balance Sheet Preparation Exercise"
                    className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                    style={{ ...S, fontSize: "13px" }} />
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Short Description
                  </label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                    placeholder="What is this assignment about?"
                    className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all resize-none"
                    style={{ ...S, fontSize: "13px" }} />
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 10 }}>
                    Assignment Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {assignmentTypes.map((type) => (
                      <button key={type.id} onClick={() => setAssignmentType(type.id)}
                        className={`flex items-center gap-3 p-3 border text-left transition-all ${assignmentType === type.id ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${assignmentType === type.id ? "border-[#d4a574] bg-[#d4a574]" : "border-gray-300"}`} />
                        <div>
                          <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{type.label}</p>
                          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{type.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 4 }}>
                    Question Delivery Format
                  </label>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12 }}>
                    How will the questions or task be given to students?
                  </p>
                  <div className="flex flex-col gap-2">
                    {answerFormats.map((fmt) => (
                      <button key={fmt.id} onClick={() => setAnswerFormat(fmt.id)}
                        className={`flex items-start gap-3 p-3 border text-left transition-all ${answerFormat === fmt.id ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5 ${answerFormat === fmt.id ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                          <fmt.icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{fmt.label}</p>
                            {fmt.id === "bulk" && (
                              <span style={{ ...S, fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em" }}
                                className="px-1.5 py-0.5 rounded-sm bg-[#0a1628] text-[#d4a574] uppercase flex-shrink-0">
                                ✦ AI-Parsed
                              </span>
                            )}
                          </div>
                          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.4, marginTop: 2 }}>{fmt.desc}</p>
                          {fmt.id === "bulk" && (
                            <p style={{ ...S, fontSize: "10px", color: "#d4a574", marginTop: 4, lineHeight: 1.4 }}>
                              AI reads your uploaded file and extracts each question automatically — students answer directly on the platform.
                            </p>
                          )}
                        </div>
                        {answerFormat === fmt.id && <Check size={14} className="text-[#d4a574] flex-shrink-0 mt-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group assignment toggle */}
                <div className={`border ${isGroupAssignment ? "border-[#0a1628]" : "border-gray-200"} overflow-hidden`}>
                  <div className="flex items-center justify-between p-4 bg-[#fafafa]">
                    <div className="flex items-center gap-2">
                      <Users2 size={16} className="text-[#0a1628]" />
                      <div>
                        <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Group Assignment</p>
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 1 }}>
                          Allow students to work and submit as a team — one submission, one grade shared by all members
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setIsGroupAssignment(!isGroupAssignment)}
                      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${isGroupAssignment ? "bg-[#0a1628]" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isGroupAssignment ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>

                  {isGroupAssignment && (
                    <div className="border-t border-gray-200 p-4 flex flex-col gap-4">
                      {answerFormat === "bulk" && (
                        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200">
                          <AlertCircle size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                          <p style={{ ...S, fontSize: "11px", color: "#92400e" }}>
                            Group assignments cannot use AI-parsed questions. Please choose a different answer format.
                          </p>
                        </div>
                      )}

                      <div>
                        <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", marginBottom: 8 }}>Group Formation Mode</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {([
                            { id: "instructor_assigned", label: "Instructor-assigned", desc: "You create groups and assign students in the Groups tab" },
                            { id: "self_enrollment",    label: "Self-enrollment",      desc: "Students form their own groups up to a max size you set" },
                          ] as { id: GroupMode; label: string; desc: string }[]).map((m) => (
                            <button key={m.id} onClick={() => setGroupMode(m.id)}
                              className={`flex items-start gap-2 p-3 border text-left transition-all ${groupMode === m.id ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-0.5 ${groupMode === m.id ? "border-[#d4a574] bg-[#d4a574]" : "border-gray-300"}`} />
                              <div>
                                <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{m.label}</p>
                                <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{m.desc}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {groupMode === "self_enrollment" && (
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-4">
                            <div>
                              <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                                Max group size
                              </label>
                              <input type="number" value={maxGroupSize} onChange={(e) => setMaxGroupSize(e.target.value)}
                                min="2" max="10"
                                className="w-20 border border-gray-200 px-3 py-2 text-center text-[#0a1628] outline-none focus:border-[#d4a574]"
                                style={{ ...S, fontSize: "14px", fontWeight: 700 }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                              Group formation deadline
                            </label>
                            <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 6 }}>
                              After this date, groups are locked — students can still submit but cannot join or create groups.
                            </p>
                            <input type="datetime-local" value={groupFormationDeadline} onChange={(e) => setGroupFormationDeadline(e.target.value)}
                              className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                              style={{ ...S, fontSize: "12px" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 1: Deadline & Scoring ─────────────────────── */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div className="border border-gray-200 p-4">
                  <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>Availability Window</p>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12, lineHeight: 1.5 }}>
                    Controls when students can <strong>see and open</strong> this assignment. Leave blank to make it visible immediately.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#6c6c6c", display: "block", marginBottom: 6 }}>Opens</label>
                      <input type="datetime-local" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                        style={{ ...S, fontSize: "12px" }} />
                    </div>
                    <div>
                      <label style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#6c6c6c", display: "block", marginBottom: 6 }}>Closes / Due</label>
                      <input type="datetime-local" value={availableTo} onChange={(e) => setAvailableTo(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                        style={{ ...S, fontSize: "12px" }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                      Submission Due Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDays size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                        className="w-full border border-gray-200 pl-8 pr-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                        style={{ ...S, fontSize: "13px" }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>Due Time</label>
                    <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                      style={{ ...S, fontSize: "13px" }} />
                  </div>
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Maximum Score <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} min="1" max="1000"
                      className="w-32 border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all text-center"
                      style={{ ...S, fontSize: "16px", fontWeight: 700 }} />
                    <span style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}>points</span>
                  </div>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 6 }}>
                    You'll break this down into marking criteria in the next step.
                  </p>
                </div>

                <div>
                  <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 10 }}>
                    Submission Type
                  </label>
                  {answerFormat === "bulk" ? (
                    <div className="border border-black bg-[#f8f8f8] p-4 flex items-start gap-3">
                      <div className="w-8 h-8 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
                        <MonitorCheck size={15} className="text-[#d4a574]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Answer On-Platform</p>
                          <span style={{ ...S, fontSize: "9px", fontWeight: 700 }} className="px-1.5 py-0.5 bg-[#0a1628] text-[#d4a574] uppercase">Auto-set</span>
                        </div>
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 3, lineHeight: 1.5 }}>
                          Because questions are AI-parsed and displayed on the platform, students answer each question directly here — no file upload or external link needed.
                        </p>
                      </div>
                      <Check size={14} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {submissionTypes.map((sub) => (
                        <button key={sub.id} onClick={() => setSubmissionType(sub.id)}
                          className={`flex items-center gap-3 p-3 border text-left transition-all ${submissionType === sub.id ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                          <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${submissionType === sub.id ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                            <sub.icon size={15} />
                          </div>
                          <div>
                            <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{sub.label}</p>
                            <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{sub.desc}</p>
                          </div>
                          {submissionType === sub.id && <Check size={14} className="text-[#d4a574] ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 bg-[#fafafa]">
                  <div>
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Allow late submissions</p>
                    <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>Accept submissions after the deadline with a penalty</p>
                  </div>
                  <button onClick={() => setAllowLate(!allowLate)}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${allowLate ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${allowLate ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
                {allowLate && (
                  <div className="flex items-center gap-3 p-3 bg-[#f8f8f9] border border-gray-200">
                    <AlertCircle size={14} className="text-[#6c6c6c] flex-shrink-0" />
                    <div className="flex items-center gap-2 flex-1">
                      <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Deduct</span>
                      <input type="number" value={latePenalty} onChange={(e) => setLatePenalty(e.target.value)} min="0" max="100"
                        className="w-14 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none"
                        style={{ ...S, fontSize: "13px", fontWeight: 700 }} />
                      <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>% per day late</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 border border-gray-200 bg-[#fafafa]">
                  <div className="flex items-center gap-2">
                    <RotateCcw size={14} className="text-[#6c6c6c]" />
                    <div>
                      <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Allow resubmission until deadline</p>
                      <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                        Students can replace their submission at any time before the due date. Grade resets on resubmit.
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setAllowResubmit(!allowResubmit)}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${allowResubmit ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${allowResubmit ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Marking Rubric ─────────────────────────── */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                {/* Header callout */}
                <div className="flex items-start gap-3 bg-[#f8f8f9] border border-gray-200 px-4 py-3">
                  <Info size={14} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                  <div>
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                      Define how the {maxScore} marks are distributed
                    </p>
                    <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 3, lineHeight: 1.5 }}>
                      Break your total score into marking criteria so you can grade each dimension separately in the Grading Center.
                      If you prefer a single overall score, use "Grade holistically" below.
                    </p>
                  </div>
                </div>

                {/* Grade holistically toggle */}
                <div className="flex items-center justify-between p-4 border border-gray-200 bg-[#fafafa]">
                  <div>
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Grade holistically</p>
                    <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                      Skip the rubric — assign one overall score out of {maxScore} pts during grading
                    </p>
                  </div>
                  <button
                    onClick={() => { setGradeHolistically(!gradeHolistically); if (!gradeHolistically) setRubricRows([]); }}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${gradeHolistically ? "bg-[#d4a574]" : "bg-gray-200"}`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${gradeHolistically ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>

                {!gradeHolistically && (
                  <>
                    {/* Allocation progress bar */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>Points allocated</span>
                        <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: rubricTotal > Number(maxScore) ? "#c0392b" : "#0a1628" }}>
                          {rubricTotal} / {maxScore} pts
                          {rubricTotal === Number(maxScore) && rubricRows.length > 0 && (
                            <span className="ml-2 text-[#d4a574]"> ✓ fully allocated</span>
                          )}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${rubricTotal > Number(maxScore) ? "bg-red-400" : "bg-[#d4a574]"}`}
                          style={{ width: `${Math.min((rubricTotal / Number(maxScore)) * 100, 100)}%` }}
                        />
                      </div>
                      {rubricTotal > Number(maxScore) && (
                        <p style={{ ...S, fontSize: "11px", color: "#c0392b", marginTop: 4 }}>
                          Over-allocated by {rubricTotal - Number(maxScore)} pts — reduce criterion scores.
                        </p>
                      )}
                    </div>

                    {/* Criteria table */}
                    {rubricRows.length > 0 && (
                      <div className="border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="grid grid-cols-[1fr_180px_72px_32px] bg-[#f9f9f9] border-b border-gray-200 px-4 py-2 gap-3">
                          {["Criterion", "Marking Guidance (optional)", "Pts", ""].map(h => (
                            <span key={h} style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
                          ))}
                        </div>
                        {/* Rows */}
                        {rubricRows.map((row, i) => (
                          <div key={row.id} className={`grid grid-cols-[1fr_180px_72px_32px] items-center gap-3 px-4 py-3 ${i < rubricRows.length - 1 ? "border-b border-gray-100" : ""}`}>
                            <input
                              type="text"
                              value={row.criterion}
                              onChange={e => updateRubricRow(row.id, "criterion", e.target.value)}
                              placeholder="e.g. Journal Entry Accuracy"
                              className="border border-gray-200 px-2 py-1.5 outline-none focus:border-[#d4a574] text-[#0a1628] placeholder-[#c0c0c0] w-full"
                              style={{ ...S, fontSize: "12px" }}
                            />
                            <input
                              type="text"
                              value={row.description}
                              onChange={e => updateRubricRow(row.id, "description", e.target.value)}
                              placeholder="What to look for…"
                              className="border border-gray-200 px-2 py-1.5 outline-none focus:border-[#d4a574] text-[#0a1628] placeholder-[#c0c0c0] w-full"
                              style={{ ...S, fontSize: "12px" }}
                            />
                            <input
                              type="number"
                              min={0}
                              max={Number(maxScore)}
                              value={row.points}
                              onChange={e => updateRubricRow(row.id, "points", Number(e.target.value))}
                              className="border border-gray-200 px-2 py-1.5 text-center outline-none focus:border-[#d4a574] text-[#0a1628] w-full"
                              style={{ ...S, fontSize: "13px", fontWeight: 700 }}
                            />
                            <button onClick={() => removeRubricRow(row.id)} className="p-1 text-[#b0b0b0] hover:text-red-400 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        {/* Total row */}
                        <div className="grid grid-cols-[1fr_180px_72px_32px] items-center gap-3 px-4 py-3 bg-[#0a1628] border-t-2 border-gray-300">
                          <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#faf8f5" }}>Total</span>
                          <span />
                          <span
                            className="text-center"
                            style={{ ...S, fontSize: "14px", fontWeight: 700, color: rubricTotal === Number(maxScore) ? "#d4a574" : "white" }}
                          >
                            {rubricTotal}
                          </span>
                          <span />
                        </div>
                      </div>
                    )}

                    {/* Add criterion button */}
                    <button
                      onClick={addRubricRow}
                      className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 hover:border-[#d4a574] hover:text-[#d4a574] transition-colors w-fit"
                      style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}
                    >
                      <Plus size={14} /> Add Criterion
                    </button>

                    {rubricRows.length === 0 && (
                      <div className="border-2 border-dashed border-gray-200 p-8 text-center">
                        <PenLine size={28} className="text-gray-200 mx-auto mb-3" />
                        <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>No rubric criteria yet</p>
                        <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                          Click "Add Criterion" to define how the {maxScore} marks break down,<br />or toggle "Grade holistically" above to skip this step.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Step 3: Instructions / AI Question Extraction ─── */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                {/* ── BULK / AI-PARSED PATH ── */}
                {answerFormat === "bulk" && (
                  <div className="flex flex-col gap-4">
                    {!aiDone && (
                      <div>
                        <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>
                          Upload Question Paper <span className="text-red-500">*</span>
                        </p>
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12, lineHeight: 1.5 }}>
                          Upload your question paper and AI will read it, identify every question, and format them on the platform for students to answer.
                          Supports PDF, Word (.docx), or Excel (.xlsx).
                        </p>

                        {questionFile ? (
                          <div className="flex flex-col gap-3">
                            <div className="border border-gray-200 bg-[#f8f8f9] p-4 flex items-center gap-3">
                              <div className="w-9 h-9 bg-[#0a1628] flex items-center justify-center text-white flex-shrink-0">
                                <FileText size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">{questionFile.name}</p>
                                <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{(questionFile.size / 1024 / 1024).toFixed(2)} MB · Ready to parse</p>
                              </div>
                              <button onClick={() => { setQuestionFile(null); setAiDone(false); }} className="text-[#6c6c6c] hover:text-red-500 transition-colors">
                                <X size={14} />
                              </button>
                            </div>
                            <button onClick={runAiParse}
                              className="flex items-center justify-center gap-2 w-full py-3 bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                              style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
                              <Sparkles size={15} className="text-[#d4a574]" />
                              Extract Questions with AI
                            </button>
                          </div>
                        ) : aiProcessing ? (
                          <div className="border border-[rgba(212,165,116,0.4)] bg-[rgba(212,165,116,0.05)] p-8 text-center">
                            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                              <RefreshCw size={28} className="text-[#d4a574] animate-spin" />
                            </div>
                            <p style={{ ...S, fontSize: "14px", fontWeight: 700, color: "#0a1628", marginBottom: 6 }}>AI is reading your paper…</p>
                            <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", lineHeight: 1.6 }}>
                              Scanning document structure · Identifying question numbers · Classifying question types
                            </p>
                            <div className="mt-4 h-1 w-full bg-gray-100 overflow-hidden">
                              <div className="h-full bg-[#d4a574] animate-pulse" style={{ width: "70%" }} />
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleFileDrop}
                            onClick={() => questionFileRef.current?.click()}
                            className={`border-2 border-dashed p-10 text-center cursor-pointer transition-all ${dragOver ? "border-[#d4a574] bg-[rgba(212,165,116,0.05)]" : "border-gray-300 hover:border-gray-400"}`}
                          >
                            <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-gray-50">
                              <CloudUpload size={24} className="text-gray-300" />
                            </div>
                            <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Drag & drop your question paper here</p>
                            <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                              or <span className="text-[#d4a574] font-semibold">browse to upload</span>
                            </p>
                            <p style={{ ...S, fontSize: "11px", color: "#b0b0b0", marginTop: 8 }}>PDF, Word (.docx), Excel (.xlsx) — max 50MB</p>
                            <input ref={questionFileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" className="hidden" onChange={handleFileSelect} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* AI extraction results */}
                    {aiDone && extractedQs.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles size={15} className="text-[#d4a574]" />
                            <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>
                              {extractedQs.length} questions extracted
                            </p>
                          </div>
                          <button onClick={() => { setAiDone(false); setExtractedQs([]); setQuestionFile(null); }}
                            className="flex items-center gap-1 text-[#6c6c6c] hover:text-[#0a1628] transition-colors"
                            style={{ ...S, fontSize: "12px" }}>
                            <RefreshCw size={12} /> Re-upload
                          </button>
                        </div>

                        <div className="flex items-start gap-2 bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.3)] px-3 py-2.5">
                          <Check size={12} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>
                            AI has identified and classified all questions. Review them below — you can edit any question text or remove questions you don't want.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {(["short_answer", "long_answer", "multiple_choice", "true_false"] as const).map((t) => {
                            const count = extractedQs.filter((q) => q.type === t).length;
                            if (!count) return null;
                            return (
                              <span key={t} style={{ ...S, fontSize: "11px" }} className="px-2 py-0.5 bg-gray-100 text-[#6c6c6c]">
                                {count} {TYPE_PILL[t]}
                              </span>
                            );
                          })}
                        </div>

                        <div className="border border-gray-200 overflow-hidden">
                          {extractedQs.map((q, i) => (
                            <div key={q.id} className={`px-4 py-3 flex items-start gap-3 ${i < extractedQs.length - 1 ? "border-b border-gray-100" : ""}`}>
                              <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#d4a574", minWidth: 22, flexShrink: 0, paddingTop: 1 }}>
                                {i + 1}.
                              </span>
                              <div className="flex-1 min-w-0">
                                {editingId === q.id ? (
                                  <div className="flex flex-col gap-2">
                                    <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={2}
                                      className="w-full border border-[#d4a574] px-2 py-1.5 text-[#0a1628] outline-none resize-none"
                                      style={{ ...S, fontSize: "12px" }} />
                                    {(q.type === "short_answer" || q.type === "long_answer") && (
                                      <div className="flex items-center gap-3 mt-1">
                                        <div className="flex items-center gap-1.5">
                                          <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Min words:</span>
                                          <input type="number" value={editMinWords} min="0"
                                            onChange={(e) => setEditMinWords(e.target.value)}
                                            placeholder="—" className="w-16 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs"
                                            style={S} />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Max words:</span>
                                          <input type="number" value={editMaxWords} min="0"
                                            onChange={(e) => setEditMaxWords(e.target.value)}
                                            placeholder="—" className="w-16 border border-gray-200 px-2 py-1 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-xs"
                                            style={S} />
                                        </div>
                                        <span style={{ ...S, fontSize: "10px", color: "#9ca3af" }}>Optional</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <button onClick={() => saveEdit(q.id)} className="px-3 py-1 bg-[#0a1628] text-white text-xs" style={S}>Save</button>
                                      <button onClick={() => setEditingId(null)} className="px-3 py-1 border border-gray-200 text-[#6c6c6c] text-xs hover:bg-gray-50" style={S}>Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col gap-1">
                                    <p style={{ ...S, fontSize: "12px", color: "#0a1628", lineHeight: 1.6 }}>{q.text}</p>
                                    {(q.type === "short_answer" || q.type === "long_answer") && (q.minWords || q.maxWords) && (
                                      <span style={{ ...S, fontSize: "10px", color: "#9ca3af" }}>
                                        {q.minWords ? `${q.minWords} min` : ""}{q.minWords && q.maxWords ? " – " : ""}{q.maxWords ? `${q.maxWords} max` : ""} words
                                      </span>
                                    )}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <span className="px-1.5 py-0.5 bg-gray-100 text-[#6c6c6c]" style={{ ...S, fontSize: "10px" }}>{TYPE_PILL[q.type]}</span>
                                  {(q.type === "short_answer" || q.type === "long_answer") && (
                                    <span className="px-1.5 py-0.5 bg-[#faf8f5] border border-[rgba(212,165,116,0.3)] text-[#d4a574]" style={{ ...S, fontSize: "10px" }}>
                                      Manual grade
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {editingId !== q.id && (
                                  <button onClick={() => startEdit(q)} className="p-1 text-[#6c6c6c] hover:text-[#0a1628] transition-colors">
                                    <Pencil size={12} />
                                  </button>
                                )}
                                <button onClick={() => removeQ(q.id)} className="p-1 text-[#6c6c6c] hover:text-red-500 transition-colors">
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {extractedQs.length === 0 && (
                          <div className="border-2 border-dashed border-gray-200 p-6 text-center">
                            <p style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>All questions removed. Re-upload to start again.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {(aiDone || !questionFile) && (
                      <div>
                        <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                          Additional Instructions <span style={{ ...S, fontSize: "11px", fontWeight: 400, color: "#6c6c6c" }}>(optional)</span>
                        </label>
                        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4}
                          placeholder="Any extra guidance, format requirements, or rules for students..."
                          className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#c0c0c0] outline-none focus:border-[#d4a574] transition-all resize-none"
                          style={{ ...S, fontSize: "13px", lineHeight: 1.7 }} />
                      </div>
                    )}
                  </div>
                )}

                {/* ── DOCUMENT PATH ── */}
                {answerFormat === "document" && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>
                        Upload Assignment Document <span className="text-red-500">*</span>
                      </p>
                      <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 12, lineHeight: 1.5 }}>
                        Upload the PDF or Word document containing the questions or task. Students will download this file, complete their work, and re-upload their response.
                      </p>

                      {!questionFile ? (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleFileDrop}
                          className={`border-2 border-dashed p-8 flex flex-col items-center justify-center transition-colors ${dragOver ? "border-[#d4a574] bg-[#faf8f5]" : "border-gray-200 hover:border-gray-300 bg-[#fcfcfc]"}`}
                        >
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-gray-100">
                            <Upload size={20} className="text-[#0a1628]" />
                          </div>
                          <p style={{ ...S, fontSize: "14px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>
                            Drag and drop your document here
                          </p>
                          <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginBottom: 16 }}>
                            or click to browse from your computer
                          </p>
                          <input type="file" ref={questionFileRef} onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx" />
                          <button onClick={() => questionFileRef.current?.click()}
                            className="px-4 py-2 bg-white border border-gray-200 text-[#0a1628] hover:border-[#d4a574] hover:text-[#d4a574] transition-colors"
                            style={{ ...S, fontSize: "13px", fontWeight: 500 }}>
                            Select File
                          </button>
                        </div>
                      ) : (
                        <div className="border border-[#d4a574] bg-[#faf8f5] p-4 flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#0a1628] flex items-center justify-center text-white flex-shrink-0">
                            <FileText size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">{questionFile.name}</p>
                            <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{(questionFile.size / 1024 / 1024).toFixed(2)} MB · Attached for students</p>
                          </div>
                          <button onClick={() => setQuestionFile(null)} className="text-[#6c6c6c] hover:text-red-500 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

              {/* ── Document download toggle ── */}
              <div className="flex items-center justify-between gap-4 p-4 bg-[#faf8f5] border border-[#d4a574]/30 rounded-lg">
                <div className="min-w-0">
                  <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628", lineHeight: 1.3 }}>
                    Students can download the document
                  </p>
                  <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 4, lineHeight: 1.4 }}>
                    Allow learners to download the uploaded worksheet before submitting.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDocumentDownload((v) => !v)}
                  disabled={!questionFile}
                  className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${allowDocumentDownload ? "bg-[#d4a574]" : "bg-gray-200"} disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-pressed={allowDocumentDownload}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${allowDocumentDownload ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

                    <div>
                      <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                        Brief Instructions <span style={{ ...S, fontSize: "11px", fontWeight: 400, color: "#6c6c6c" }}>(optional)</span>
                      </label>
                      <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={4}
                        placeholder="e.g. Please download the attached worksheet, fill in your answers, and upload the completed PDF."
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#c0c0c0] outline-none focus:border-[#d4a574] transition-all resize-none"
                        style={{ ...S, fontSize: "13px", lineHeight: 1.7 }} />
                    </div>
                  </div>
                )}

                {/* ── NON-BULK PATH ── */}
                {(answerFormat === "short" || answerFormat === "long" || answerFormat === "instructions") && (
                  <div className="flex flex-col gap-4">
                    {(answerFormat === "short" || answerFormat === "long") && (
                      <div className="flex items-start gap-2 bg-[#f8f8f9] border border-gray-200 px-3 py-2.5">
                        <Info size={12} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                        <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>
                          {answerFormat === "short"
                            ? "Short Answer: Students write a brief response — 1–3 sentences or a specific value."
                            : "Long Answer / Essay: Students write an extended response. Always manually graded."}
                        </p>
                      </div>
                    )}

                    {(answerFormat === "short" || answerFormat === "long") && (
                      <div>
                        <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                          Word Count Limit (Optional)
                        </label>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Min:</span>
                            <input type="number" value={assignmentMinWords} min="0"
                              onChange={(e) => setAssignmentMinWords(e.target.value)}
                              placeholder="—" className="w-20 border border-gray-200 px-3 py-1.5 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-sm"
                              style={S} />
                          </div>
                          <div className="flex items-center gap-2">
                            <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Max:</span>
                            <input type="number" value={assignmentMaxWords} min="0"
                              onChange={(e) => setAssignmentMaxWords(e.target.value)}
                              placeholder="—" className="w-20 border border-gray-200 px-3 py-1.5 text-center text-[#0a1628] outline-none focus:border-[#d4a574] text-sm"
                              style={S} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                        Assignment Instructions
                      </label>
                      <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 10 }}>
                        Provide clear, detailed instructions for students. Include learning objectives, format requirements, and grading criteria.
                      </p>
                      <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={12}
                        placeholder={`Example:\n\n**Learning Objective:**\nStudents should be able to prepare a complete set of financial statements from a trial balance.\n\n**Task:**\n1. Using the trial balance provided in the attached document, prepare an Income Statement and Balance Sheet.\n2. Show all workings clearly.\n3. Format your answer according to IAS standards.\n\n**Submission Requirements:**\n- Maximum 4 pages, A4, 12pt font\n- Submit as PDF via the platform\n- Due by the date shown above`}
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#c0c0c0] outline-none focus:border-[#d4a574] transition-all resize-none"
                        style={{ ...S, fontSize: "13px", lineHeight: 1.7 }} />
                      <p style={{ ...S, fontSize: "11px", color: "#b0b0b0", marginTop: 6, textAlign: "right" }}>{instructions.length} characters</p>
                    </div>

                    <div className="p-4 bg-[#f8f8f9] border border-gray-200">
                      <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", marginBottom: 6 }}>Tips for clear instructions</p>
                      <ul className="flex flex-col gap-1.5">
                        {["State the learning objective clearly", "Break tasks into numbered steps", "Specify word/page limits and format", "Explain how marks will be allocated", "Include any resources or reading materials"].map((tip) => (
                          <li key={tip} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574] flex-shrink-0 mt-1.5" />
                            <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 4: Preview & Publish ──────────────────────── */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                {/* Assignment summary card */}
                <div className="border border-gray-200 p-5 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="px-2 py-0.5 bg-[#f0f0f0] text-[#0a1628] text-xs font-semibold" style={S}>
                          {assignmentTypes.find((t) => t.id === assignmentType)?.label}
                        </span>
                        <span className="px-2 py-0.5 bg-[#f0f0f0] text-[#0a1628] text-xs" style={S}>
                          {answerFormats.find((f) => f.id === answerFormat)?.label}
                        </span>
                        {answerFormat === "bulk" && (
                          <span className="px-1.5 py-0.5 bg-[#0a1628] text-[#d4a574] text-xs" style={{ ...S, fontWeight: 700 }}>✦ AI-Parsed</span>
                        )}
                      </div>
                      <h3 style={{ ...S, fontWeight: 700, fontSize: "16px", color: "#0a1628" }}>{title}</h3>
                      <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 3 }}>
                        {course ? courseDisplayTitleWithTrack(course, selectedTrack) : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>{maxScore} pts</p>
                      <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Max score</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-[#d4a574]" />
                      <span style={{ ...S, fontSize: "12px", color: "#0a1628" }}>Due: {dueDate || "—"} at {dueTime}</span>
                    </div>
                    {(availableFrom || availableTo) && (
                      <div className="flex items-center gap-1.5">
                        <Lock size={12} className="text-[#6c6c6c]" />
                        <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                          Available {availableFrom ? `from ${new Date(availableFrom).toLocaleString()}` : "immediately"}
                          {availableTo ? ` until ${new Date(availableTo).toLocaleString()}` : ""}
                        </span>
                      </div>
                    )}
                    {answerFormat === "bulk" && (
                      <div className="flex items-center gap-1.5">
                        <MonitorCheck size={13} className="text-[#d4a574]" />
                        <span style={{ ...S, fontSize: "12px", color: "#0a1628" }}>
                          {extractedQs.length} AI-parsed questions · Students answer on-platform
                        </span>
                      </div>
                    )}
                    {allowLate && (
                      <div className="flex items-center gap-1.5">
                        <AlertCircle size={13} className="text-[#6c6c6c]" />
                        <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Late penalty: {latePenalty}%/day</span>
                      </div>
                    )}
                    {(answerFormat === "short" || answerFormat === "long") && (assignmentMinWords || assignmentMaxWords) && (
                      <div className="flex items-center gap-1.5">
                        <AlignLeft size={13} className="text-[#6c6c6c]" />
                        <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                          Word limit: {assignmentMinWords ? `${assignmentMinWords} min` : ""}{assignmentMinWords && assignmentMaxWords ? " – " : ""}{assignmentMaxWords ? `${assignmentMaxWords} max` : ""} words
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rubric preview */}
                {!gradeHolistically && rubricRows.length > 0 && (
                  <div className="border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f8f9] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PenLine size={13} className="text-[#d4a574]" />
                        <p style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          Marking Rubric
                        </p>
                      </div>
                      <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                        {rubricRows.length} criteria · {rubricTotal}/{maxScore} pts allocated
                      </span>
                    </div>
                    {rubricRows.map((row, i) => (
                      <div key={row.id} className={`flex items-center justify-between px-4 py-3 ${i < rubricRows.length - 1 ? "border-b border-gray-50" : ""}`}>
                        <div>
                          <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{row.criterion || "—"}</p>
                          {row.description && (
                            <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginTop: 1 }}>{row.description}</p>
                          )}
                        </div>
                        <span style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>{row.points} pts</span>
                      </div>
                    ))}
                  </div>
                )}
                {gradeHolistically && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-200 bg-[#f8f8f9]">
                    <Check size={13} className="text-[#d4a574]" />
                    <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                      Graded holistically — instructor assigns one overall score out of {maxScore} pts
                    </span>
                  </div>
                )}
                {!gradeHolistically && rubricRows.length === 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray-200">
                    <Info size={13} className="text-[#b0b0b0]" />
                    <span style={{ ...S, fontSize: "12px", color: "#b0b0b0" }}>
                      No rubric defined — go back to Step 3 to add marking criteria, or grade holistically.
                    </span>
                  </div>
                )}

                {/* AI question preview */}
                {answerFormat === "bulk" && extractedQs.length > 0 && (
                  <div className="border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-[#f8f8f9] flex items-center gap-2">
                      <Sparkles size={13} className="text-[#d4a574]" />
                      <p style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Extracted Questions Preview
                      </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {extractedQs.slice(0, 5).map((q, i) => (
                        <div key={q.id} className="px-4 py-3 flex items-start gap-3">
                          <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#d4a574", minWidth: 20 }}>{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p style={{ ...S, fontSize: "12px", color: "#0a1628", lineHeight: 1.5 }} className="truncate">{q.text}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-[#6c6c6c] text-xs" style={S}>{TYPE_PILL[q.type]}</span>
                          </div>
                        </div>
                      ))}
                      {extractedQs.length > 5 && (
                        <div className="px-4 py-2 text-center" style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                          +{extractedQs.length - 5} more questions
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {instructions && (
                  <div className="border border-gray-200 p-5 bg-[#fafafa]">
                    <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                      Instructions Preview
                    </p>
                    <div style={{ ...S, fontSize: "13px", color: "#0a1628", lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 180, overflow: "auto" }}>
                      {instructions}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-[#f8f8f9] border border-gray-200 flex items-center gap-3">
                  <Eye size={15} className="text-[#6c6c6c] flex-shrink-0" />
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>
                    Students will be notified and can see this assignment{availableFrom ? ` from ${new Date(availableFrom).toLocaleString()}` : " immediately"} after publishing.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}
                className="flex items-center gap-2 px-4 h-[47px] border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ ...S, fontWeight: 600, fontSize: "14px", color: "#6c6c6c" }}
              >
                <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ ...S, fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-5 h-[47px] bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ ...S, fontWeight: 600, fontSize: "14px" }}
                >
                  <ClipboardList size={16} /> Publish Assignment
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
