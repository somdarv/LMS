import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Upload, Video, FileText, Link2, Image, Monitor,
  ChevronRight, ChevronLeft, Check, CloudUpload, X,
  BookOpen, Eye, EyeOff, Bell, ArrowLeft, Lock, ClipboardList, PenTool,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseSelectLabel, courseTitleWithTracks } from "../lib/courseLabels";

const contentTypes = [
  { id: "video",        icon: Video,         label: "Video Lecture",         desc: "Upload an MP4 or link to YouTube/Vimeo" },
  { id: "pdf",          icon: FileText,       label: "PDF Document",          desc: "Lecture notes, handouts, or readings" },
  { id: "presentation", icon: Monitor,        label: "Presentation",          desc: "PowerPoint or Google Slides" },
  { id: "link",         icon: Link2,          label: "External Link",         desc: "Link to an external resource or article" },
  { id: "image",        icon: Image,          label: "Image / Infographic",   desc: "Visual aids and supplementary images" },
  { id: "assignment",   icon: ClipboardList,  label: "Schedule Assignment",   desc: "Schedule an existing or new assignment to go live on a set date" },
  { id: "quiz",         icon: PenTool,        label: "Schedule Quiz",         desc: "Schedule an existing or new quiz to become available on a set date" },
];

const STEPS = ["Content Type", "Upload & Details", "Settings", "Confirm"];

function StepIndicator({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                i < current
                  ? "bg-[#0a1628] border-[#0a1628] text-white"
                  : i === current
                  ? "bg-[#d4a574] border-[#d4a574] text-white"
                  : "bg-white border-gray-300 text-gray-400"
              }`}
              style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700 }}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "10px",
                fontWeight: i === current ? 700 : 400,
                color: i === current ? "#0a1628" : i < current ? "#d4a574" : "#9ca3af",
                marginTop: 4,
                whiteSpace: "nowrap",
              }}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < current ? "bg-[#d4a574]" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export function UploadContentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourseId = searchParams.get("courseId");

  const [step, setStep]                   = useState(0);
  const [contentType, setContentType]     = useState("");
  const [selectedCourse, setSelectedCourse] = useState(preselectedCourseId || "");
  const [selectedModule, setSelectedModule] = useState("");
  const [title, setTitle]                 = useState("");
  const [description, setDescription]     = useState("");
  const [externalUrl, setExternalUrl]     = useState("");
  const [file, setFile]                   = useState<File | null>(null);
  const [dragOver, setDragOver]           = useState(false);
  const [visibility, setVisibility]       = useState("published");
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [releaseDate, setReleaseDate]     = useState("");
  const [lockContent, setLockContent]     = useState(false);
  const [lockUntilDate, setLockUntilDate] = useState("");
  const [published, setPublished]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const course = COURSES.find((c) => c.id === Number(selectedCourse));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  };

  const canProceed = () => {
    if (step === 0) return contentType !== "" && selectedCourse !== "";
    if (step === 1) {
      // Assignment / quiz types just need a title
      if (contentType === "assignment" || contentType === "quiz") return title !== "";
      if (!title) return false;
      if (contentType === "link") return externalUrl !== "";
      return file !== null || contentType === "link";
    }
    return true;
  };

  const handlePublish = () => {
    setPublished(true);
  };

  if (published) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
        <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses" }, { label: "Upload Content" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />
        <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
          <InstructorSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="bg-white border border-gray-200 p-10 text-center max-w-md w-full">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                <Check size={32} className="text-green-500" strokeWidth={2.5} />
              </div>
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628", marginBottom: 8 }}>
                Content Published!
              </h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", lineHeight: 1.7, marginBottom: 6 }}>
                <span className="font-semibold text-[#0a1628]">"{title}"</span> has been successfully uploaded to{" "}
                <span className="font-semibold text-[#0a1628]">{course ? courseTitleWithTracks(course) : ""}</span>.
              </p>
              {notifyStudents && (
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }} className="mb-6">
                  Students have been notified.
                </p>
              )}
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => navigate(`/instructor/courses/${selectedCourse}`)}
                  className="flex items-center justify-center gap-2 px-4 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors w-full"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
                >
                  <BookOpen size={15} /> View Course
                </button>
                <button
                  onClick={() => { setPublished(false); setStep(0); setFile(null); setTitle(""); setDescription(""); setContentType(""); }}
                  className="flex items-center justify-center gap-2 px-4 h-[47px] border border-gray-200 hover:bg-gray-50 transition-colors w-full"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#6c6c6c" }}
                >
                  Upload More Content
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
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "My Courses", href: "/instructor/courses" }, { label: "Upload Content" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-4 transition-colors hover:text-[#0a1628] text-[#6c6c6c]"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>Upload Content</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                Add learning materials to your course
              </p>
            </div>

            <StepIndicator current={step} steps={STEPS} />

            {/* Step 0: Content Type + Course */}
            {step === 0 && (
              <div className="flex flex-col gap-6">
                {/* Course selector */}
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Select Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full border border-gray-200 px-3 py-2.5 bg-white text-[#0a1628] outline-none focus:border-[#d4a574] transition-all appearance-none"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                  >
                    <option value="">Select a course...</option>
                    {COURSES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {courseSelectLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Content Type */}
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 12 }}>
                    Content Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contentTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={`flex items-start gap-3 p-4 border text-left transition-all ${
                          contentType === type.id
                            ? "border-black bg-[#f8f8f8]"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 ${contentType === type.id ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                          <type.icon size={17} strokeWidth={1.8} />
                        </div>
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{type.label}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>{type.desc}</p>
                        </div>
                        {contentType === type.id && (
                          <div className="ml-auto flex-shrink-0">
                            <Check size={14} className="text-[#d4a574]" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Upload & Details */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                {/* Special: assignment or quiz scheduling */}
                {(contentType === "assignment" || contentType === "quiz") && (
                  <div className="p-4 bg-[rgba(212,165,116,0.07)] border border-[rgba(212,165,116,0.3)]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 bg-[#0a1628] flex items-center justify-center flex-shrink-0">
                        {contentType === "assignment" ? <ClipboardList size={15} className="text-white" /> : <PenTool size={15} className="text-white" />}
                      </div>
                      <div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                          Scheduling a {contentType === "assignment" ? "Assignment" : "Quiz"}
                        </p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 3, lineHeight: 1.5 }}>
                          Enter a title and set the release date in the next step. You can build the full {contentType} now or later.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(contentType === "assignment" ? "/instructor/create-assignment" : "/instructor/create-quiz")}
                      className="mt-3 flex items-center gap-1.5 px-3 py-2 border border-black hover:bg-[#f5f5f5] transition-colors"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                      Open {contentType === "assignment" ? "Assignment" : "Quiz"} Builder →
                    </button>
                  </div>
                )}

                {/* Module selector */}
                {course && (
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                      Add to Module / Week
                    </label>
                    <select
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2.5 bg-white text-[#0a1628] outline-none focus:border-[#d4a574] appearance-none"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                    >
                      <option value="">Select a module...</option>
                      {course.courseContent.map((m) => (
                        <option key={m.id} value={m.id}>Week {m.week}: {m.title}</option>
                      ))}
                      <option value="new">+ Create New Module</option>
                    </select>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={contentType === "assignment" ? "e.g. Chapter 3 Practice Exercise" : contentType === "quiz" ? "e.g. Week 3 Quiz" : "e.g. Week 3 – Lecture Recording"}
                    className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Brief description of this content..."
                    className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all resize-none"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                  />
                </div>

                {/* File upload or URL (not for assignment/quiz) */}
                {contentType !== "assignment" && contentType !== "quiz" && (
                  contentType === "link" ? (
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                        External URL <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="url"
                          value={externalUrl}
                          onChange={(e) => setExternalUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full border border-gray-200 pl-8 pr-3 py-2.5 text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                        Upload File <span className="text-red-500">*</span>
                      </label>
                      {file ? (
                        <div className="border border-gray-200 bg-[#f8f8f9] p-4 flex items-center gap-3">
                          <div className="w-9 h-9 bg-[#0a1628] flex items-center justify-center text-white flex-shrink-0"><Check size={16} /></div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">{file.name}</p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button onClick={() => setFile(null)} className="text-[#6c6c6c] hover:text-red-500 transition-colors"><X size={14} /></button>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={handleDrop}
                          onClick={() => fileRef.current?.click()}
                          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                            dragOver ? "border-[#d4a574] bg-[rgba(212,165,116,0.05)]" : "border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          <CloudUpload size={32} className="mx-auto mb-3 text-gray-300" />
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                            Drag & drop your file here
                          </p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                            or <span className="text-[#d4a574] font-semibold">browse to upload</span>
                          </p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 8 }}>
                            {contentType === "video"        && "Supports MP4, MOV, AVI — max 2GB"}
                            {contentType === "pdf"          && "Supports PDF — max 50MB"}
                            {contentType === "presentation" && "Supports PPTX, KEY, PDF — max 100MB"}
                            {contentType === "image"        && "Supports JPG, PNG, SVG — max 20MB"}
                          </p>
                          <input
                            ref={fileRef}
                            type="file"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                          />
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {/* Step 2: Settings */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                {/* Visibility */}
                <div>
                  <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 12 }}>
                    Visibility
                  </label>
                  <div className="flex flex-col gap-3">
                    {[
                      { id: "published",  icon: Eye,    label: "Published",         desc: "Visible to all enrolled students immediately" },
                      { id: "scheduled",  icon: Bell,   label: "Scheduled Release", desc: "Set a future date to make it visible" },
                      { id: "hidden",     icon: EyeOff, label: "Hidden",            desc: "Only visible to you until manually published" },
                    ].map((opt) => (
                      <button key={opt.id} onClick={() => setVisibility(opt.id)}
                        className={`flex items-start gap-3 p-4 border text-left transition-all ${visibility === opt.id ? "border-black bg-[#f8f8f8]" : "border-gray-200 hover:border-gray-400"}`}>
                        <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${visibility === opt.id ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}`}>
                          <opt.icon size={15} />
                        </div>
                        <div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>{opt.label}</p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>{opt.desc}</p>
                        </div>
                        {visibility === opt.id && <Check size={14} className="text-[#d4a574] ml-auto flex-shrink-0 mt-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scheduled date */}
                {visibility === "scheduled" && (
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                      Release Date & Time
                    </label>
                    <input type="datetime-local" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)}
                      className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }} />
                  </div>
                )}

                {/* Lock content */}
                <div className="border border-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-4 bg-[#fafafa]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                        <Lock size={15} className="text-[#6c6c6c]" />
                      </div>
                      <div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Lock content until a date</p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                          Content appears in the module list but is locked — students can see it exists but cannot open it until unlocked
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setLockContent(!lockContent)}
                      className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${lockContent ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${lockContent ? "left-[22px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  {lockContent && (
                    <div className="px-4 pb-4 bg-[#fafafa] border-t border-gray-100">
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#6c6c6c", display: "block", marginBottom: 6, marginTop: 12 }}>
                        Unlock on
                      </label>
                      <input type="datetime-local" value={lockUntilDate} onChange={(e) => setLockUntilDate(e.target.value)}
                        className="w-full border border-gray-200 px-3 py-2.5 text-[#0a1628] outline-none focus:border-[#d4a574] transition-all"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }} />
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 6 }}>
                        Students will see a lock icon on this item and can't access it until this date and time.
                      </p>
                    </div>
                  )}
                </div>

                {/* Notify students */}
                <div className="flex items-center justify-between p-4 border border-gray-200 bg-[#fafafa]">
                  <div>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Notify students</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>
                      Send a notification to enrolled students when this content goes live
                    </p>
                  </div>
                  <button onClick={() => setNotifyStudents(!notifyStudents)}
                    className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${notifyStudents ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifyStudents ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="bg-[#f8f8f9] border border-gray-200 p-5">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 700, color: "#0a1628", marginBottom: 14 }}>Review your upload</p>
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Course",          value: course ? courseTitleWithTracks(course) : "—" },
                      { label: "Content Type",     value: contentTypes.find((t) => t.id === contentType)?.label || "—" },
                      { label: "Title",            value: title || "—" },
                      { label: "Description",      value: description || "None" },
                      { label: "File",             value: file ? file.name : contentType === "link" ? externalUrl : (contentType === "assignment" || contentType === "quiz") ? "(scheduled)" : "—" },
                      { label: "Visibility",       value: visibility.charAt(0).toUpperCase() + visibility.slice(1) },
                      { label: "Locked",           value: lockContent ? `Until ${lockUntilDate ? new Date(lockUntilDate).toLocaleString() : "—"}` : "No" },
                      { label: "Notify Students",  value: notifyStudents ? "Yes" : "No" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-start gap-4">
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", minWidth: 120 }}>{row.label}</span>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: "#0a1628" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                  By clicking "Publish", you confirm that this content complies with SOMDA Institute's academic policies.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}
                className="flex items-center gap-2 px-4 h-[47px] border border-gray-300 hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#6c6c6c" }}
              >
                <ChevronLeft size={16} /> {step === 0 ? "Cancel" : "Back"}
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 h-[47px] border border-black hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handlePublish}
                  className="flex items-center gap-2 px-5 h-[47px] bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px" }}
                >
                  <CloudUpload size={16} /> Publish Content
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex items-center justify-between mt-4">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
      </footer>
    </div>
  );
}