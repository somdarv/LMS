import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Phone, ArrowLeft, ArrowRight, User, Mail, BookOpen, Check, Layers, CalendarDays, Clock } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { COURSES } from "../data/courses";
import { courseTitleWithTracks } from "../lib/courseLabels";
import { useLMS } from "../context/LMSContext";

type Step = "phone-check" | "form";

export function StudentEnrollPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const { enrollmentLinks, programs, sittings, cohorts } = useLMS();
  const activeLink = token ? enrollmentLinks.find(l => l.token === token) : null;

  const [step, setStep] = useState<Step>("phone-check");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [selectedSitting, setSelectedSitting] = useState<string>("");
  const [selectedCohort, setSelectedCohort] = useState<string>("");

  useEffect(() => {
    // Auto-select if only one option is available from the link
    if (activeLink) {
      if (activeLink.allowedPrograms.length === 1) setSelectedProgram(activeLink.allowedPrograms[0]);
      if (activeLink.allowedSittings.length === 1) setSelectedSitting(activeLink.allowedSittings[0]);
      if (activeLink.allowedCohorts.length === 1) setSelectedCohort(activeLink.allowedCohorts[0]);
    }
  }, [activeLink]);

  const handlePhoneCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    setPhoneError("");
    setLoading(true);
    // Simulate check — phone is "not registered" → proceed to form
    setTimeout(() => {
      setLoading(false);
      setStep("form");
    }, 1200);
  };

  const toggleCourse = (id: number) => {
    setSelectedCourses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || selectedCourses.length === 0) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/student/enroll/success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Student Enrollment" }]} />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[520px]">
          <button
            onClick={() => (step === "form" ? setStep("phone-check") : navigate("/"))}
            className="flex items-center gap-1.5 text-[#6c6c6c] hover:text-[#0a1628] mb-6 transition-colors"
            style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
          >
            <ArrowLeft size={15} /> {step === "form" ? "Back to phone check" : "Back to overview"}
          </button>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-[#d4a574] to-[#c4915e]" />

            <div className="px-8 py-8">
              {/* Logo */}
              <div className="flex flex-col items-center mb-7">
                <div className="w-14 h-14 bg-[#0a1628] rounded-xl flex items-center justify-center mb-3">
                  <svg width="28" height="28" viewBox="0 0 27 27" fill="none">
                    <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", textAlign: "center", letterSpacing: "0.5px" }}>
                  SOMDA INSTITUTE OF PROFESSIONAL STUDIES
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }}>Accra, Ghana</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "phone-check" ? "bg-[#0a1628] text-white" : "bg-[#d4a574] text-[#0a1628]"}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700 }}>
                  {step === "form" ? <Check size={14} /> : "1"}
                </div>
                <div className="w-12 h-0.5 bg-gray-200" />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === "form" ? "bg-[#0a1628] text-white" : "bg-gray-200 text-[#6c6c6c]"}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 700 }}>
                  2
                </div>
              </div>

              {step === "phone-check" ? (
                <>
                  <div className="mb-6 text-center">
                    <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", lineHeight: 1.3 }}>
                      Student Enrollment
                    </h1>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6, lineHeight: 1.5 }}>
                      Let's start by checking your phone number
                    </p>
                  </div>

                  <div className="bg-[rgba(212,165,116,0.1)] border border-[rgba(212,165,116,0.3)] rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#d4a574] mt-1.5 flex-shrink-0" />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>
                      Enter your phone number to check if you already have an account. If not, you'll proceed to fill out the enrollment form.
                    </p>
                  </div>

                  <form onSubmit={handlePhoneCheck} className="flex flex-col gap-4">
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="tel"
                          placeholder="+233 XX XXX XXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                      {phoneError && (
                        <p className="mt-1.5 text-[#d4a574]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>{phoneError}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                    >
                      {loading ? (
                        <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      {loading ? "Checking…" : "Continue"}
                      {!loading && <ArrowRight size={15} />}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="mb-6 text-center">
                    <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "22px", color: "#0a1628", lineHeight: 1.3 }}>
                      Complete Your Enrollment
                    </h1>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 6, lineHeight: 1.5 }}>
                      Fill in your details and select courses to enroll in
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                          First Name
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                          <input
                            type="text"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                            style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                          Last Name
                        </label>
                        <input
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                        <input
                          type="tel"
                          value={phone}
                          readOnly
                          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg bg-[#eee] text-[#6c6c6c] outline-none cursor-not-allowed"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                      </div>
                    </div>

                    {/* Course Selection */}
                    <div>
                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Program Selection
                      </label>
                      <select 
                        value={selectedProgram}
                        onChange={e => setSelectedProgram(e.target.value)}
                        className="w-full px-4 py-2.5 mb-4 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                      >
                        <option value="">Select a Program</option>
                        {programs
                          .filter(p => !activeLink || activeLink.allowedPrograms.includes(p.id))
                          .map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                        Select Courses <span className="text-[#6c6c6c]" style={{ fontWeight: 400 }}>({selectedCourses.length} selected)</span>
                      </label>
                      <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1 mb-4">
                        {COURSES.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => toggleCourse(course.id)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left ${
                              selectedCourses.includes(course.id)
                                ? "border-[#d4a574] bg-[rgba(212,165,116,0.08)]"
                                : "border-gray-200 bg-[#f8f8f9] hover:border-gray-300"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                              selectedCourses.includes(course.id) ? "bg-[#d4a574]" : "border border-gray-300"
                            }`}>
                              {selectedCourses.includes(course.id) && <Check size={12} className="text-white" />}
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <BookOpen size={14} className="text-[#d4a574] flex-shrink-0" />
                              <div className="min-w-0">
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>{courseTitleWithTracks(course)}</p>
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c" }}>{course.code} • {course.term}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                            Sitting
                          </label>
                          <select 
                            value={selectedSitting}
                            onChange={e => setSelectedSitting(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                            style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                          >
                            <option value="">Select Sitting</option>
                            {sittings
                              .filter(s => !activeLink || activeLink.allowedSittings.includes(s.id))
                              .map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 6 }}>
                            Schedule
                          </label>
                          <select 
                            value={selectedCohort}
                            onChange={e => setSelectedCohort(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] outline-none focus:border-[#d4a574]"
                            style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                          >
                            <option value="">Select Schedule</option>
                            {cohorts
                              .filter(c => !activeLink || activeLink.allowedCohorts.includes(c.id))
                              .map(c => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !firstName || !lastName || !email || !selectedProgram || selectedCourses.length === 0 || !selectedSitting || !selectedCohort}
                      className="w-full mt-4 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                    >
                      {loading ? (
                        <svg className="animate-spin w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : null}
                      {loading ? "Submitting…" : "Submit Enrollment"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="bg-[#f8f8f9] border-t border-gray-100 px-8 py-4 text-center">
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                Already have an account?{" "}
                <button onClick={() => navigate("/student/login")} style={{ color: "#d4a574", fontWeight: 500 }} className="hover:underline">
                  Log in here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
