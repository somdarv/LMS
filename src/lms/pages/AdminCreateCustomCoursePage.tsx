import { useState } from "react";
import { useNavigate } from "react-router";
import { AlmsHeader } from "../components/AlmsHeader";
import { AdminSidebar } from "../components/AdminSidebar";
import { useLMS } from "../context/LMSContext";
import { CheckCircle } from "lucide-react";

type CourseType = "workshop" | "bootcamp" | "mock-exam";

export function AdminCreateCustomCoursePage() {
  const navigate = useNavigate();
  const { programs } = useLMS();

  // Form state
  const [courseType, setCourseType] = useState<CourseType>("workshop");
  const [courseName, setCourseName] = useState("");
  const [relatedProgram, setRelatedProgram] = useState("");
  const [levelStage, setLevelStage] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName) return;
    setShowSuccess(true);
  };

  const courseTypeOptions: { value: CourseType; label: string; description: string }[] = [
    { value: "workshop", label: "Workshop/Tutorial", description: "Revision sessions, tutorials" },
    { value: "bootcamp", label: "Bootcamp/Intensive", description: "Intensive prep programs" },
    { value: "mock-exam", label: "Mock Exam Series", description: "Practice exams & drills" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[
          { label: "Home" },
          { label: "Course Management" },
          { label: "All Courses" },
        ]}
        instituteName="ALMS"
        showAvatar
      />

      {/* Banner */}
      <div className="relative w-full h-[140px] bg-[#0a1628] overflow-hidden flex items-end">
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 100% at 85% 50%, rgba(42,58,92,0.85) 0%, transparent 60%)" }}
        />
        <div className="absolute right-0 top-0 w-[340px] h-[340px] rounded-full border border-[#2a3a5c] opacity-30" style={{ transform: "translate(40%, -40%)" }} />
        <div className="relative z-10 px-6 pb-6 max-w-[1200px] mx-auto w-full">
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "12px", color: "#faf8f5", opacity: 0.7, letterSpacing: "0.5px" }}>
            SOMDA INSTITUTE OF PROFESSIONAL STUDIES
          </p>
          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#faf8f5" }}>
            Courses Management
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <AdminSidebar />

        <main className="flex-1 min-w-0">
          <div className="max-w-[680px]">
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", marginBottom: 20 }}>
              Create Custom Course
            </h2>

            {/* Info box */}
            <div className="bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.25)] rounded-xl px-5 py-4 mb-6">
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginBottom: 4 }}>
                Custom Course Creation
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5 }}>
                This course will be unique to your center only. Use this for revision workshops, mock exams, bootcamps, or supplementary courses not in the global catalog. For standard ICAG/ACCA/CIMA courses, use "Add from Catalog" instead.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Course Type */}
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 12 }}>
                  Course Type
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {courseTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCourseType(opt.value)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all ${
                        courseType === opt.value
                          ? "border-[#d4a574] bg-[#0a1628] text-white"
                          : "border-gray-200 bg-white text-[#0a1628] hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                          courseType === opt.value ? "border-[#d4a574]" : "border-gray-300"
                        }`}>
                          {courseType === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-[#d4a574]" />}
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}>
                          {opt.label}
                        </span>
                      </div>
                      <p style={{
                        fontFamily: "Inter, sans-serif",
                        fontSize: "11px",
                        color: courseType === opt.value ? "rgba(255,255,255,0.7)" : "#6c6c6c",
                        marginLeft: 20,
                      }}>
                        {opt.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 12 }}>
                  Basic Information
                </h3>

                <div className="flex flex-col gap-4">
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Course Name
                    </label>
                    <input
                      type="text"
                      placeholder="eg. ICAG Level 2 Workshop"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                      Choose a descriptive name that clearly indicates what this course offers
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Related Program
                      </label>
                      <select
                        value={relatedProgram}
                        onChange={(e) => setRelatedProgram(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      >
                        <option value="">None - General Program</option>
                        {programs.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                        Related Professional Course
                      </p>
                    </div>
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Level/Stage
                      </label>
                      <select
                        value={levelStage}
                        onChange={(e) => setLevelStage(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      >
                        <option value="">Select Level</option>
                        <option value="Level 1">Level 1</option>
                        <option value="Level 2">Level 2</option>
                        <option value="Level 3">Level 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Course Code
                      </label>
                      <input
                        type="text"
                        placeholder="eg. ICAG-CORP"
                        value={courseCode}
                        onChange={(e) => setCourseCode(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Maximum Number of Students
                      </label>
                      <input
                        type="text"
                        placeholder="eg. 45"
                        value={maxStudents}
                        onChange={(e) => setMaxStudents(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      />
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                        Leave empty for unlimited enrollment
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Course Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Add any additional notes about this term"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] resize-none"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Course Preview */}
              {courseName && (
                <div>
                  <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 4 }}>
                    Course Preview
                  </h3>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginBottom: 12 }}>
                    How this course will appear to students
                  </p>
                  <div className="bg-[#0a1628] rounded-xl p-5 text-white">
                    <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "18px", lineHeight: 1.3, marginBottom: 8 }}>
                      {courseName || "ICAG Level 2 Revision Workshop"}
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", opacity: 0.7, lineHeight: 1.5, marginBottom: 12 }}>
                      {courseDescription || "Master the principles of corporate law, company formation, governance structures, and legal compliance for professional accounting practice."}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.2)] text-[#d4a574]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}
                      >
                        {relatedProgram ? programs.find(p => p.id === relatedProgram)?.name || "Richard Professional Institute" : "Richard Professional Institute"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.2)] text-[#d4a574]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}
                      >
                        Custom Course
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                This course will only be available at your center
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#d4a574] hover:bg-[#c39463] text-[#0a1628] rounded-lg transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  Create Course
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/courses")}
                  className="px-5 py-2.5 border border-gray-200 rounded-lg text-[#6c6c6c] hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSuccess(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[480px] mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>
                Create New Course
              </h2>
              <button
                onClick={() => setShowSuccess(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-8">
              <div className="bg-green-50 border border-green-100 rounded-xl px-6 py-8 text-center">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "16px", color: "#0a1628", marginBottom: 6 }}>
                  Course Created Successfully!
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c" }}>
                  You can now assign an Instructor and upload content.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-center gap-3">
              <button
                onClick={() => navigate("/admin/instructors")}
                className="px-5 py-2.5 bg-[#d4a574] hover:bg-[#c39463] text-[#0a1628] rounded-lg transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                Assign Instructor
              </button>
              <button
                onClick={() => navigate("/admin/courses")}
                className="px-5 py-2.5 border border-gray-200 rounded-lg text-[#0a1628] hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                Go To Courses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
          <a href="/terms-conditions" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">|</span>
          <a href="/privacy-policy" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
