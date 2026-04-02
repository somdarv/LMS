import { useNavigate } from "react-router";
import {
  LogIn,
  UserPlus,
  Clock,
  ShieldAlert,
  CheckSquare,
  LayoutDashboard,
  ArrowRight,
  Mail,
  ChevronRight,
  ClipboardList,
  Users,
  CalendarCheck,
  BookMarked,
  BookOpen,
  MessageSquare,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

interface FlowCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  href: string;
  cta: string;
}

function FlowCard({ icon, title, description, badge, badgeColor = "bg-blue-100 text-blue-700", href, cta }: FlowCardProps) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(href)}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-[#d4a574] transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(212,165,116,0.1)] flex items-center justify-center text-[#d4a574]">
          {icon}
        </div>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-[#0a1628] mb-1" style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}>
        {title}
      </h3>
      <p className="text-[#6c6c6c] mb-3" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", lineHeight: 1.5 }}>
        {description}
      </p>
      <div className="flex items-center gap-1 text-[#d4a574] group-hover:gap-2 transition-all" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}>
        {cta} <ArrowRight size={14} />
      </div>
    </button>
  );
}

export function DemoLanding() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      {/* Header */}
      <header className="bg-[#0a1628] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 27 27" fill="none">
            <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
            <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#FAF8F5" }}>SOMDA INSTITUTE OF PROFESSIONAL STUDIES</span>
        </div>
        <span className="text-[#faf8f5] opacity-60 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>SOMDA INSTITUTE OF PROFESSIONAL STUDIES — Full Platform Demo</span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[rgba(212,165,116,0.15)] text-[#d4a574] px-3 py-1 rounded-full mb-4" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}>
            <Mail size={13} />
            Full Platform Demo
          </div>
          <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "32px", color: "#0a1628", lineHeight: 1.2 }}>
            SOMDA Institute of Professional Studies
          </h1>
          <p className="mt-2 text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif", fontSize: "15px" }}>
            Explore the complete instructor and student flows. Click any card to preview that screen.
          </p>
        </div>

        {/* Flow Diagram */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <p className="text-xs font-semibold text-[#6c6c6c] uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Complete Flow</p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Admin Sends Invite", color: "bg-gray-100 text-gray-600" },
              { label: "→", color: "" },
              { label: "Email Received", color: "bg-blue-50 text-blue-600" },
              { label: "→", color: "" },
              { label: "System Check", color: "bg-purple-50 text-purple-600" },
              { label: "→", color: "" },
              { label: "Login / Setup", color: "bg-orange-50 text-[#d4a574]" },
              { label: "→", color: "" },
              { label: "Accept Role", color: "bg-green-50 text-green-600" },
              { label: "→", color: "" },
              { label: "Dashboard", color: "bg-[#0a1628] text-white" },
            ].map((step, i) =>
              step.label === "→" ? (
                <ChevronRight key={i} size={16} className="text-gray-300" />
              ) : (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${step.color}`} style={{ fontFamily: "Inter, sans-serif" }}>
                  {step.label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Admin Flow */}
        <h2 className="text-sm font-semibold text-[#0a1628] uppercase tracking-widest mt-10 mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Admin Flows</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <FlowCard
            icon={<UserPlus size={20} />}
            title="Admin: Generate Enrollment Links"
            description="Admin flow for configuring and generating tailored student enrollment links."
            badge="Admin"
            badgeColor="bg-slate-900 text-[#d4a574]"
            href="/admin/enrollment-links"
            cta="View Admin Portal"
          />
        </div>

        {/* Main Screens */}
        <h2 className="text-sm font-semibold text-[#0a1628] uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Instructor Main Screens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <FlowCard
            icon={<LogIn size={20} />}
            title="Screen 3A — Login Page"
            description="For instructors who already have an account. Shows login form with phone + password fields."
            badge="Existing User"
            badgeColor="bg-blue-50 text-blue-600"
            href="/invite/instructor"
            cta="View Login Page"
          />
          <FlowCard
            icon={<UserPlus size={20} />}
            title="Screen 3B — Account Setup"
            description="For new instructors. Pre-fills email from invitation and lets them create a password."
            badge="New User"
            badgeColor="bg-green-50 text-green-600"
            href="/invite/instructor/setup"
            cta="View Account Setup"
          />
          <FlowCard
            icon={<CheckSquare size={20} />}
            title="Screen 4 — Role Acceptance"
            description="Instructor reviews their assigned course details and responsibilities, then accepts the role."
            badge="Required"
            badgeColor="bg-orange-50 text-orange-600"
            href="/instructor/welcome"
            cta="View Role Acceptance"
          />
          <FlowCard
            icon={<LayoutDashboard size={20} />}
            title="Screen 5 — Instructor Dashboard"
            description="First-time dashboard view with welcome banner, quick actions, and navigation sidebar."
            badge="Dashboard"
            badgeColor="bg-[#0a1628] text-[#faf8f5]"
            href="/instructor/dashboard"
            cta="View Dashboard"
          />
        </div>

        {/* Edge Cases */}
        <h2 className="text-sm font-semibold text-[#0a1628] uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Edge Cases</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FlowCard
            icon={<Clock size={20} />}
            title="Expired Invitation Link"
            description="Shown when instructor clicks an invitation link that has passed its expiry date."
            badge="Edge Case"
            badgeColor="bg-red-50 text-red-500"
            href="/invite/expired"
            cta="View Expired Page"
          />
          <FlowCard
            icon={<ShieldAlert size={20} />}
            title="Invalid / Wrong Token"
            description="Shown when the invitation token in the URL is invalid or has been tampered with."
            badge="Edge Case"
            badgeColor="bg-red-50 text-red-500"
            href="/invite/invalid"
            cta="View Invalid Page"
          />
        </div>

        {/* Teaching Pages */}
        <h2 className="text-sm font-semibold text-[#0a1628] uppercase tracking-widest mb-4 mt-8" style={{ fontFamily: "Inter, sans-serif" }}>Teaching Management</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FlowCard
            icon={<ClipboardList size={20} />}
            title="Assignments"
            description="View, create, and manage assignments across courses. Filter by status and track submissions."
            badge="Teaching"
            badgeColor="bg-purple-50 text-purple-600"
            href="/instructor/assignments"
            cta="View Assignments"
          />
          <FlowCard
            icon={<Users size={20} />}
            title="Students"
            description="Browse student roster, track grades, attendance, and identify at-risk students."
            badge="Teaching"
            badgeColor="bg-purple-50 text-purple-600"
            href="/instructor/students"
            cta="View Students"
          />
          <FlowCard
            icon={<CalendarCheck size={20} />}
            title="Attendance"
            description="Mark daily attendance per session with P/A/L buttons. View cumulative attendance."
            badge="Teaching"
            badgeColor="bg-purple-50 text-purple-600"
            href="/instructor/attendance"
            cta="View Attendance"
          />
          <FlowCard
            icon={<BookMarked size={20} />}
            title="Grade Books"
            description="Full gradebook with editable score cells, letter grades, class average, and distribution chart."
            badge="Teaching"
            badgeColor="bg-purple-50 text-purple-600"
            href="/instructor/gradebooks"
            cta="View Grade Books"
          />
        </div>

        {/* ──────────────── STUDENT FLOW ──────────────── */}
        <div className="mt-12 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#d4a574] flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div>
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>Student Flow</h2>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Enrollment → Login → Dashboard → Learning</p>
            </div>
          </div>
        </div>

        {/* Student Flow Diagram */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <p className="text-xs font-semibold text-[#6c6c6c] uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Student Flow</p>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "Enrollment Link", color: "bg-gray-100 text-gray-600" },
              { label: "→", color: "" },
              { label: "Phone Check", color: "bg-[rgba(212,165,116,0.15)] text-[#d4a574]" },
              { label: "→", color: "" },
              { label: "Enrollment Form", color: "bg-[rgba(212,165,116,0.15)] text-[#d4a574]" },
              { label: "→", color: "" },
              { label: "Password Setup", color: "bg-[rgba(212,165,116,0.15)] text-[#d4a574]" },
              { label: "→", color: "" },
              { label: "Pending Approval", color: "bg-gray-100 text-gray-600" },
              { label: "→", color: "" },
              { label: "Dashboard", color: "bg-[#0a1628] text-white" },
            ].map((step, i) =>
              step.label === "→" ? (
                <ChevronRight key={i} size={16} className="text-gray-300" />
              ) : (
                <span key={i} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${step.color}`} style={{ fontFamily: "Inter, sans-serif" }}>
                  {step.label}
                </span>
              )
            )}
          </div>
        </div>

        {/* Student Enrollment */}
        <h2 className="text-sm font-semibold text-[#0a1628] uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Enrollment & Auth</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <FlowCard
            icon={<UserPlus size={20} />}
            title="Student Enrollment"
            description="Phone pre-check followed by enrollment form with name, email, and course selection."
            badge="New Student"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/enroll"
            cta="Start Enrollment"
          />
          <FlowCard
            icon={<LogIn size={20} />}
            title="Student Login"
            description="Returning student login with phone number and password. Links to enrollment and password reset."
            badge="Returning"
            badgeColor="bg-[#0a1628] text-[#faf8f5]"
            href="/student/login"
            cta="View Login"
          />
          <FlowCard
            icon={<Clock size={20} />}
            title="Password Setup"
            description="New students create a secure password after receiving the setup link via email/SMS."
            badge="Setup"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/password-setup"
            cta="View Password Setup"
          />
          <FlowCard
            icon={<ShieldAlert size={20} />}
            title="Pending Approval"
            description="Shown when student's enrollment is submitted but not yet approved by the admin."
            badge="Waiting"
            badgeColor="bg-gray-100 text-gray-600"
            href="/student/pending"
            cta="View Pending Page"
          />
        </div>

        {/* Student Learning */}
        <h2 className="text-sm font-semibold text-[#0a1628] uppercase tracking-widest mb-4" style={{ fontFamily: "Inter, sans-serif" }}>Student Learning</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FlowCard
            icon={<LayoutDashboard size={20} />}
            title="Student Dashboard"
            description="Enrolled courses with progress, upcoming classes, pending assignments, and announcements."
            badge="Dashboard"
            badgeColor="bg-[#0a1628] text-[#faf8f5]"
            href="/student/dashboard"
            cta="View Dashboard"
          />
          <FlowCard
            icon={<BookOpen size={20} />}
            title="My Courses"
            description="Browse enrolled courses with progress tracking. Click to view weekly content with video, PDF, and links."
            badge="Learning"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/courses"
            cta="View Courses"
          />
          <FlowCard
            icon={<ClipboardList size={20} />}
            title="Assignments"
            description="View, submit, and track assignments with file upload or text entry. Includes late submission warnings."
            badge="Learning"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/assignments"
            cta="View Assignments"
          />
          <FlowCard
            icon={<BookMarked size={20} />}
            title="My Grades"
            description="Track grades across all courses with overall average, instructor feedback, and grade details."
            badge="Learning"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/grades"
            cta="View Grades"
          />
          <FlowCard
            icon={<CalendarDays size={20} />}
            title="Calendar"
            description="Monthly calendar with class sessions and Zoom links. Click events to join live sessions."
            badge="Schedule"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/calendar"
            cta="View Calendar"
          />
          <FlowCard
            icon={<MessageSquare size={20} />}
            title="Communications"
            description="Direct messaging with instructors. Threaded conversations organized by course."
            badge="Communication"
            badgeColor="bg-[rgba(212,165,116,0.15)] text-[#d4a574]"
            href="/student/communications"
            cta="View Communications"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#6c6c6c] text-xs" style={{ fontFamily: "Inter, sans-serif" }}>
            <span>Copyright 2025 </span>
            <span className="text-[#d4a574]">© LMS.</span>
            <span> All right reserved.</span>
          </p>
          <div className="flex items-center gap-4 text-xs text-[#0a1628]" style={{ fontFamily: "Inter, sans-serif" }}>
            <a href="#" className="hover:text-[#d4a574] transition-colors">Terms & Conditions</a>
            <span className="text-[#6c6c6c]">\</span>
            <a href="#" className="hover:text-[#d4a574] transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </div>
  );
}