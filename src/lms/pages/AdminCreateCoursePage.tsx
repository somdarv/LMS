import { useState } from "react";
import { useNavigate } from "react-router";
import { AlmsHeader } from "../components/AlmsHeader";
import { AdminSidebar } from "../components/AdminSidebar";
import { useLMS } from "../context/LMSContext";
import { CheckCircle } from "lucide-react";

type SuccessType = null | "course" | "program";

export function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const { programs } = useLMS();

  // Form state
  const [parentProgram, setParentProgram] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [level, setLevel] = useState("");
  const [period, setPeriod] = useState("");
  const [department, setDepartment] = useState("");
  const [deliveryMode, setDeliveryMode] = useState("");
  const [openForEnrollment, setOpenForEnrollment] = useState(true);
  const [certificateOnCompletion, setCertificateOnCompletion] = useState(true);
  const [maxStudents, setMaxStudents] = useState("");
  const [successModal, setSuccessModal] = useState<SuccessType>(null);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName || !parentProgram) return;
    setSuccessModal("course");
  };

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
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", marginBottom: 4 }}>
              Create Custom Course
            </h2>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginBottom: 24 }}>
              Add a new course to your program
            </p>

            {/* Info box */}
            <div className="bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.25)] rounded-xl px-5 py-4 mb-6">
              <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginBottom: 4 }}>
                Creating a Course
              </p>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5 }}>
                Courses belong to programs. Students enroll in courses to learn specific topics. After creating a course, you can assign instructors and upload content.
              </p>
            </div>

            <form onSubmit={handleCreateCourse} className="flex flex-col gap-6">
              {/* Parent Program */}
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 4 }}>
                  Parent Program
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginBottom: 10 }}>
                  Select the program this course belongs to
                </p>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                  Select Program
                </label>
                <select
                  value={parentProgram}
                  onChange={(e) => setParentProgram(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                >
                  <option value="">Choose A Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                  The course will be visible under this program
                </p>
              </div>

              {/* Basic Information */}
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 4 }}>
                  Basic Information
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginBottom: 12 }}>
                  Essential course details
                </p>

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

                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Prerequisites
                    </label>
                    <input
                      type="text"
                      placeholder="eg. Financial Accounting 1, Business Law"
                      value={prerequisites}
                      onChange={(e) => setPrerequisites(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                      Comma-separated list of prerequisite courses
                    </p>
                  </div>

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
                </div>
              </div>

              {/* Course Attributes */}
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 4 }}>
                  Course Attributes
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginBottom: 12 }}>
                  Classify this course using your institution's structure
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Level
                    </label>
                    <select
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    >
                      <option value="">Select Level</option>
                      <option value="Level 1">Level 1</option>
                      <option value="Level 2">Level 2</option>
                      <option value="Level 3">Level 3</option>
                    </select>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                      Academic level of difficulty
                    </p>
                  </div>
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Period
                    </label>
                    <select
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    >
                      <option value="">Select Period</option>
                      <option value="May 2026 Sitting">May 2026 Sitting</option>
                      <option value="November 2026 Sitting">November 2026 Sitting</option>
                    </select>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                      Term, sitting, cohort, or quarter
                    </p>
                  </div>
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Department/Track
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    >
                      <option value="">None</option>
                      <option value="Accounting">Accounting</option>
                      <option value="Law">Law</option>
                      <option value="Taxation">Taxation</option>
                      <option value="Management">Management</option>
                    </select>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                      Options category or specialization
                    </p>
                  </div>
                  <div>
                    <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                      Delivery Mode
                    </label>
                    <select
                      value={deliveryMode}
                      onChange={(e) => setDeliveryMode(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                    >
                      <option value="">Select Mode</option>
                      <option value="In-Person">In-Person</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                      How the course will be delivered
                    </p>
                  </div>
                </div>
              </div>

              {/* Course Settings */}
              <div>
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 4 }}>
                  Course Settings
                </h3>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginBottom: 12 }}>
                  Configure course features
                </p>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={openForEnrollment}
                        onChange={(e) => setOpenForEnrollment(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200 peer-checked:bg-[#d4a574] rounded-full transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                        Open for Enrollment
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>
                        Allow students to enroll in this course
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={certificateOnCompletion}
                        onChange={(e) => setCertificateOnCompletion(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-6 bg-gray-200 peer-checked:bg-[#d4a574] rounded-full transition-colors" />
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                        Certificate on Completion
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>
                        Award certificate when course is completed
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Max Students */}
              <div>
                <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                  Maximum Number of Students
                </label>
                <input
                  type="text"
                  placeholder="eg. 45"
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(e.target.value)}
                  className="w-full max-w-[280px] px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)]"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                />
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", marginTop: 4 }}>
                  Leave empty for unlimited enrollment
                </p>
              </div>

              {/* Note */}
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                After creating this course, you can assign an Instructor
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

      {/* Course Created Success Modal */}
      {successModal === "course" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSuccessModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[480px] mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>
                Create New Course
              </h2>
              <button
                onClick={() => setSuccessModal(null)}
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
