import { useState, useMemo } from "react";
import { X, Copy, Check, ChevronDown, User, Users } from "lucide-react";
import { useLMS, PERIOD_TYPE_LABELS, PERIOD_UNITS } from "../context/LMSContext";
import { COURSES } from "../data/courses";

type LinkMode = "general" | "single";
type ModalStep = "configure" | "success";

interface GenerateEnrollmentLinkModalProps {
  onClose: () => void;
}

export function GenerateEnrollmentLinkModal({ onClose }: GenerateEnrollmentLinkModalProps) {
  const { programs, sittings, cohorts, generateEnrollmentLink } = useLMS();

  const [step, setStep] = useState<ModalStep>("configure");
  const [mode, setMode] = useState<LinkMode>("general");

  // Selections
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedSitting, setSelectedSitting] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("");

  // Bio data (single student mode)
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPhone, setStudentPhone] = useState("");

  const [generatedUrl, setGeneratedUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Courses filtered by selected program
  const programCourses = useMemo(
    () => (selectedProgram ? COURSES.filter((c) => c.programId === selectedProgram) : []),
    [selectedProgram]
  );

  const handleProgramChange = (programId: string) => {
    setSelectedProgram(programId);
    setSelectedCourses([]); // reset courses when program changes
  };

  const handleToggleCourse = (courseId: number) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleGenerate = () => {
    if (!selectedProgram || selectedCourses.length === 0 || !selectedSitting || !selectedCohort) return;
    if (mode === "single" && (!studentName.trim() || !studentEmail.trim())) return;

    const link = generateEnrollmentLink({
      mode,
      allowedPrograms: [selectedProgram],
      allowedCourses: selectedCourses,
      allowedSittings: [selectedSitting],
      allowedCohorts: [selectedCohort],
      ...(mode === "single"
        ? { studentName: studentName.trim(), studentEmail: studentEmail.trim(), studentPhone: studentPhone.trim() }
        : {}),
    });

    setGeneratedUrl(`${window.location.origin}/student/enroll?token=${link.token}`);
    setStep("success");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCohortObj = cohorts.find((c) => c.id === selectedCohort);

  const canGenerate =
    selectedProgram &&
    selectedCourses.length > 0 &&
    selectedSitting &&
    selectedCohort &&
    (mode === "general" || (studentName.trim() && studentEmail.trim()));

  const font = { fontFamily: "Inter, sans-serif" } as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[600px] mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 style={{ ...font, fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>
            Generate Enrollment Link
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X size={16} className="text-[#6c6c6c]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1">
          {step === "configure" ? (
            <div className="flex flex-col gap-5">
              {/* Mode Toggle */}
              <div>
                <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                  Link Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("general")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      mode === "general"
                        ? "border-[#d4a574] bg-[rgba(212,165,116,0.06)]"
                        : "border-gray-200 bg-[#f8f8f9] hover:border-gray-300"
                    }`}
                  >
                    <Users size={18} className={mode === "general" ? "text-[#d4a574]" : "text-[#6c6c6c]"} />
                    <div>
                      <div style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>General Link</div>
                      <div style={{ ...font, fontSize: "11px", color: "#6c6c6c" }}>Share with many students</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("single")}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                      mode === "single"
                        ? "border-[#d4a574] bg-[rgba(212,165,116,0.06)]"
                        : "border-gray-200 bg-[#f8f8f9] hover:border-gray-300"
                    }`}
                  >
                    <User size={18} className={mode === "single" ? "text-[#d4a574]" : "text-[#6c6c6c]"} />
                    <div>
                      <div style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Single Student</div>
                      <div style={{ ...font, fontSize: "11px", color: "#6c6c6c" }}>Pre-fill bio data for one</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bio Data (single mode only) */}
              {mode === "single" && (
                <div className="bg-[#f8f8f9] border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
                  <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                    Student Bio Data
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors"
                    style={{ ...font, fontSize: "13px" }}
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors"
                    style={{ ...font, fontSize: "13px" }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors"
                    style={{ ...font, fontSize: "13px" }}
                  />
                </div>
              )}

              {/* Program Dropdown */}
              <div>
                <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                  Program
                </label>
                <div className="relative">
                  <select
                    value={selectedProgram}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-[#f8f8f9] text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors cursor-pointer"
                    style={{ ...font, fontSize: "13px" }}
                  >
                    <option value="">Select a program…</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] pointer-events-none" />
                </div>
              </div>

              {/* Courses (appear after program selected) */}
              {selectedProgram && (
                <div>
                  <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                    Courses
                    {programCourses.length > 0 && (
                      <span className="ml-2 text-[#6c6c6c] font-normal">
                        ({selectedCourses.length} of {programCourses.length} selected)
                      </span>
                    )}
                  </label>
                  {programCourses.length > 0 ? (
                    <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                      {programCourses.map((c) => (
                        <label
                          key={c.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                            selectedCourses.includes(c.id)
                              ? "border-[#d4a574] bg-[rgba(212,165,116,0.06)]"
                              : "border-gray-200 bg-[#f8f8f9] hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-[#d4a574] focus:ring-[#d4a574]"
                            checked={selectedCourses.includes(c.id)}
                            onChange={() => handleToggleCourse(c.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <span style={{ ...font, fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>
                              {c.title}
                            </span>
                            <span className="ml-2 text-[10px] text-[#6c6c6c] bg-gray-100 px-1.5 py-0.5 rounded">
                              {c.code}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p style={{ ...font, fontSize: "13px", color: "#6c6c6c" }}>
                      No courses available for this program yet.
                    </p>
                  )}
                </div>
              )}

              {/* Sitting Dropdown */}
              <div>
                <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                  Sitting
                </label>
                <div className="relative">
                  <select
                    value={selectedSitting}
                    onChange={(e) => setSelectedSitting(e.target.value)}
                    className="w-full appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-[#f8f8f9] text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors cursor-pointer"
                    style={{ ...font, fontSize: "13px" }}
                  >
                    <option value="">Select a sitting…</option>
                    {sittings.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6c6c6c] pointer-events-none" />
                </div>
              </div>

              {/* Cohort */}
              <div>
                <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
                  Cohort
                </label>
                {cohorts.length === 0 ? (
                  <p style={{ ...font, fontSize: "13px", color: "#6c6c6c" }}>
                    No cohorts defined yet. <a href="/admin/cohorts" className="text-[#d4a574] underline">Create one</a> first.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {cohorts.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setSelectedCohort(c.id)}
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          selectedCohort === c.id
                            ? "border-[#d4a574] bg-[rgba(212,165,116,0.06)]"
                            : "border-gray-200 bg-[#f8f8f9] hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            selectedCohort === c.id ? "border-[#d4a574]" : "border-gray-300"
                          }`}
                        >
                          {selectedCohort === c.id && <div className="w-2 h-2 rounded-full bg-[#d4a574]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                            {c.name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {PERIOD_UNITS[c.periodType].map((unit) => (
                              <span
                                key={unit}
                                className={`text-[10px] px-1.5 py-0.5 rounded ${
                                  c.periods.includes(unit)
                                    ? "bg-[#0a1628] text-[#faf8f5] font-semibold"
                                    : "bg-gray-100 text-[#ccc]"
                                }`}
                                style={font}
                              >
                                {unit}
                              </span>
                            ))}
                            <span className="ml-1 text-[10px] text-[#6c6c6c]" style={font}>
                              ({PERIOD_TYPE_LABELS[c.periodType]})
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {/* Scheduling implication hint */}
                {selectedCohortObj && (
                  <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <p style={{ ...font, fontSize: "11px", color: "#4a6fa5", lineHeight: 1.5 }}>
                      Courses in this cohort are constrained to:{" "}
                      <strong>{selectedCohortObj.periods.join(", ")}</strong>{" "}
                      ({PERIOD_TYPE_LABELS[selectedCohortObj.periodType].toLowerCase()}).
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Success state */
            <div>
              <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-5 mb-5">
                <p style={{ ...font, fontWeight: 700, fontSize: "16px", color: "#0a1628", marginBottom: 6 }}>
                  Enrollment Link Generated!
                </p>
                <p style={{ ...font, fontSize: "13px", color: "#6c6c6c", lineHeight: 1.5 }}>
                  {mode === "general"
                    ? "Share this link with students via WhatsApp, SMS, or email. They will fill in their details and confirm enrollment."
                    : `This link is pre-filled for ${studentName}. Share it directly — they only need to confirm enrollment.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] text-sm truncate outline-none"
                  style={{ ...font, fontSize: "13px" }}
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-lg transition-colors shrink-0"
                  style={{ ...font, fontSize: "13px", fontWeight: 600 }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          {step === "configure" ? (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-[#6c6c6c] hover:bg-gray-50 transition-colors"
                style={{ ...font, fontSize: "13px", fontWeight: 500 }}
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="px-5 py-2.5 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors disabled:opacity-50"
                style={{ ...font, fontSize: "13px", fontWeight: 600 }}
              >
                Generate Link
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors"
              style={{ ...font, fontSize: "13px", fontWeight: 600 }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
