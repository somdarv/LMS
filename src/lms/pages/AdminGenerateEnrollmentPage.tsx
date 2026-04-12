import { useState } from "react";
import { AlmsHeader } from "../components/AlmsHeader";
import { AdminSidebar } from "../components/AdminSidebar";
import { GenerateEnrollmentLinkModal } from "../components/GenerateEnrollmentLinkModal";
import { useLMS } from "../context/LMSContext";
import { Link, Copy, Check, Plus, Search, Trash2, CalendarDays, BookOpen, Clock, Users, CheckCircle, XCircle } from "lucide-react";

type Tab = "pending" | "approved" | "rejected" | "all";

// Mock pending enrollments data
const MOCK_PENDING = [
  { id: "ENR-2025-1234", name: "Kwame Mensah", phone: "0244 123 4567", email: "kwame.mensah@email.com", courses: ["Management Accounting", "Taxation"], date: "Dec 16, 2025", time: "2:34 PM" },
  { id: "ENR-2025-1235", name: "Ama Serwaa", phone: "0244 567 8901", email: "ama.serwaa@email.com", courses: ["Financial Accounting", "Business Law"], date: "Dec 16, 2025", time: "3:12 PM" },
  { id: "ENR-2025-1236", name: "Kofi Asante", phone: "0244 234 5678", email: "kofi.asante@email.com", courses: ["Taxation", "Audit Assurance"], date: "Dec 16, 2025", time: "4:05 PM" },
  { id: "ENR-2025-1237", name: "Abena Osei", phone: "0244 345 6789", email: "abena.osei@email.com", courses: ["Economics", "Business Law"], date: "Dec 15, 2025", time: "10:22 AM" },
  { id: "ENR-2025-1238", name: "Yaw Boateng", phone: "0244 456 7890", email: "yaw.boateng@email.com", courses: ["Management Accounting"], date: "Dec 15, 2025", time: "11:45 AM" },
];

export function AdminGenerateEnrollmentPage() {
  const { programs, sittings, cohorts, enrollmentLinks, generateEnrollmentLink } = useLMS();

  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/student/enroll?token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "pending", label: "Pending Approvals", count: MOCK_PENDING.length },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
    { key: "all", label: "All Enrollments" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[{ label: "Home" }, { label: "Enrollment Management" }]}
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
            Enrollment Management
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <AdminSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Enrollment Notification */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgba(212,165,116,0.15)] rounded-lg flex items-center justify-center">
                <Link size={18} className="text-[#d4a574]" />
              </div>
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                  Enrollment: Pending Enrollments
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                  Pending: {MOCK_PENDING.length} Students
                </p>
              </div>
            </div>
            <button
              className="px-4 py-2 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
            >
              View All
            </button>
          </div>

          {/* Overview Cards */}
          <div>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0a1628", marginBottom: 12 }}>
              Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Pending Approval</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#0a1628" }}>{MOCK_PENDING.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Total Enrollments</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#0a1628" }}>247</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Active Links</p>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#0a1628" }}>{enrollmentLinks.length}</p>
              </div>
            </div>
          </div>

          {/* Active Enrollment Links */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628" }}>
                Active Enrollment Links
              </h3>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] hover:bg-[#0d1e35] text-[#faf8f5] rounded-lg transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                <Plus size={16} />
                Generate New Link
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {enrollmentLinks.length === 0 ? (
                <p className="text-center py-6" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c" }}>
                  No enrollment links generated yet. Click "Generate New Link" to create one.
                </p>
              ) : (
                enrollmentLinks.map((link) => (
                  <div key={link.id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                            {sittings.find(s => link.allowedSittings.includes(s.id))?.name || "Enrollment Link"}{" "}
                            {programs.find(p => link.allowedPrograms.includes(p.id))?.name.includes("Level") ? "" : "Courses"}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            link.mode === "single"
                              ? "bg-purple-50 text-purple-600"
                              : "bg-blue-50 text-blue-600"
                          }`} style={{ fontFamily: "Inter, sans-serif" }}>
                            {link.mode === "single" ? "Single Student" : "General"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> Created: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> 0 Submissions</span>
                          {link.studentName && <span className="flex items-center gap-1">For: {link.studentName}</span>}
                          <span className="flex items-center gap-1"><Clock size={12} /> Expires: —</span>
                        </div>
                      </div>
                    </div>

                    {/* Course chips */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {link.allowedPrograms.map(pid => {
                        const prog = programs.find(p => p.id === pid);
                        return prog ? (
                          <span key={pid} className="px-3 py-1 rounded-full bg-gray-100 text-[#0a1628]"
                            style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}
                          >
                            {prog.name}
                          </span>
                        ) : null;
                      })}
                    </div>

                    {/* URL + actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-[#f8f8f9] border border-gray-200 rounded-lg truncate" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                        {window.location.origin}/student/enroll?token={link.token}
                      </div>
                      <button
                        onClick={() => handleCopyLink(link.token)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#166534] hover:bg-[#14532d] text-white rounded-lg transition-colors flex-shrink-0"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                      >
                        {copiedToken === link.token ? <Check size={14} /> : <Copy size={14} />}
                        {copiedToken === link.token ? "Copied!" : "Copy Link"}
                      </button>
                      <button
                        className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Approvals / Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 transition-colors relative ${
                    activeTab === tab.key ? "text-[#d4a574]" : "text-[#6c6c6c] hover:text-[#0a1628]"
                  }`}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: activeTab === tab.key ? 600 : 400 }}
                >
                  {tab.label}
                  {tab.count != null && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#d4a574] text-white"
                      style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700 }}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.key && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d4a574]" />
                  )}
                </button>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100">
              <div className="relative flex-1 max-w-[320px]">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                <input
                  type="text"
                  placeholder="Search By Phone name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574]"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
                />
              </div>
              <select
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-[#0a1628] outline-none focus:border-[#d4a574]"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}
              >
                <option>All Courses</option>
              </select>
              <button
                className="ml-auto px-4 py-2 bg-[#0a1628] hover:bg-[#0d1e35] text-[#faf8f5] rounded-lg transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
              >
                Enroll All
              </button>
            </div>

            {/* Enrollment Cards */}
            <div className="p-5 flex flex-col gap-4">
              {MOCK_PENDING.map((enrollment) => (
                <div key={enrollment.id} className="border border-gray-200 rounded-xl p-5 flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-[#d4a574] focus:ring-[#d4a574]" />
                    <div className="min-w-0 flex-1">
                      <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                        {enrollment.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                        <span>📱 {enrollment.phone}</span>
                        <span>✉️ {enrollment.email}</span>
                      </div>
                      <div className="mt-3">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em", marginBottom: 6 }}>
                          SELECTED COURSES ({enrollment.courses.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {enrollment.courses.map((course) => (
                            <span key={course} className="px-3 py-1 rounded-full bg-gray-100 text-[#0a1628]"
                              style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#b0b0b0" }}>
                        ID: {enrollment.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: "#0a1628" }}>{enrollment.date}</p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>{enrollment.time}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="px-4 py-1.5 bg-[#166534] hover:bg-[#14532d] text-white rounded-lg transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                      >
                        Approve & Enroll
                      </button>
                      <button
                        className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

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

      {/* Generate Link Modal */}
      {showGenerateModal && (
        <GenerateEnrollmentLinkModal onClose={() => setShowGenerateModal(false)} />
      )}
    </div>
  );
}