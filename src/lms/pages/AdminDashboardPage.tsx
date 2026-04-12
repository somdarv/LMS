import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  GraduationCap,
  BookOpen,
  Link as LinkIcon,
  Plus,
  ArrowRight,
  CheckCircle,
  Upload,
  ClipboardList,
  Calendar,
  UserPlus,
  Monitor,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { AdminSidebar } from "../components/AdminSidebar";
import { COURSES } from "../data/courses";
import { courseTitleWithTracks } from "../lib/courseLabels";
import { GenerateEnrollmentLinkModal } from "../components/GenerateEnrollmentLinkModal";

const recentActivity = [
  {
    icon: CheckCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Student Approved",
    description: "Sarah Ofosu was enrolled in Financial Accounting L1",
    time: "15 minutes ago",
  },
  {
    icon: Upload,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    title: "New Content Uploaded",
    description: "Dr. Mensah uploaded Week 5 materials to Taxation",
    time: "1 hour ago",
  },
  {
    icon: ClipboardList,
    iconBg: "bg-[rgba(212,165,116,0.1)]",
    iconColor: "text-[#d4a574]",
    title: "Assignment Created",
    description: "Prof. Adjei created Case Study Analysis in Audit & Assurance",
    time: "3 hours ago",
  },
  {
    icon: UserPlus,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    title: "Instructor Assigned",
    description: "Mr. Kwarteng assigned to Management Accounting",
    time: "5 hours ago",
  },
  {
    icon: Monitor,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-500",
    title: "Zoom Session Scheduled",
    description: "Business Law Tomorrow at 2:00 PM",
    time: "Yesterday",
  },
  {
    icon: CheckCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
    title: "Multiple Students Approved",
    description: "3 students enrolled in Cost Accounting",
    time: "Yesterday",
  },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[{ label: "Home" }, { label: "Dashboard" }]}
        instituteName="ALMS"
        showAvatar
      />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Enrollment Notification Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[rgba(212,165,116,0.15)] rounded-lg flex items-center justify-center">
                <LinkIcon size={18} className="text-[#d4a574]" />
              </div>
              <div>
                <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                  Enrollment: Pending Enrollments
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>
                  Pending: 5 Students
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/enrollment-links")}
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
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-[rgba(212,165,116,0.12)] rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-[#d4a574]" />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Enrolled Students</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#0a1628" }}>247</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-[rgba(212,165,116,0.12)] rounded-lg flex items-center justify-center">
                  <GraduationCap size={20} className="text-[#d4a574]" />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Active Instructors</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#0a1628" }}>47</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-[rgba(212,165,116,0.12)] rounded-lg flex items-center justify-center">
                  <BookOpen size={20} className="text-[#d4a574]" />
                </div>
                <div>
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c" }}>Active Courses</p>
                  <p style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "28px", color: "#0a1628" }}>15</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0a1628", marginBottom: 12 }}>
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => setShowEnrollmentModal(true)}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#d4a574] hover:shadow-sm transition-all text-left"
              >
                <LinkIcon size={18} className="text-[#d4a574]" />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>
                  Generate Enrollment Link
                </span>
              </button>
              <button
                onClick={() => navigate("/admin/courses/create")}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#d4a574] hover:shadow-sm transition-all text-left"
              >
                <Plus size={18} className="text-[#d4a574]" />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>
                  Create New Course
                </span>
              </button>
              <button
                onClick={() => navigate("/admin/instructors")}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#d4a574] hover:shadow-sm transition-all text-left"
              >
                <GraduationCap size={18} className="text-[#d4a574]" />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>
                  Add Instructor
                </span>
              </button>
              <button
                onClick={() => navigate("/admin/terms")}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-200 hover:border-[#d4a574] hover:shadow-sm transition-all text-left"
              >
                <Calendar size={18} className="text-[#d4a574]" />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#0a1628" }}>
                  Create Term
                </span>
              </button>
            </div>
          </div>

          {/* Active Courses + Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
            {/* Active Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "18px", color: "#0a1628" }}>
                  Active Courses
                </h2>
                <button
                  onClick={() => navigate("/admin/courses")}
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#d4a574", fontWeight: 500 }}
                  className="hover:underline flex items-center gap-1"
                >
                  View All Courses <ArrowRight size={14} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {COURSES.slice(0, 4).map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-[#d4a574] transition-all group flex flex-col"
                  >
                    <div className="w-full h-[140px] overflow-hidden">
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-[#d4a574] flex items-center justify-center">
                          <span className="text-white text-[8px] font-bold">
                            {course.instructor.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c" }}>
                          {course.instructor}
                        </span>
                      </div>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628", lineHeight: 1.3 }}>
                        {courseTitleWithTracks(course)}
                      </p>
                      <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 4 }}>
                        {course.term} • {course.students} students
                      </p>
                      <div className="mt-auto pt-4">
                        <button
                          onClick={() => navigate(`/admin/courses/${course.id}`)}
                          className="px-4 py-1.5 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600 }}
                        >
                          View Course
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px", color: "#0a1628", marginBottom: 16 }}>
                Recent Activity
              </h2>
              <div className="flex flex-col gap-4">
                {recentActivity.map((activity, i) => {
                  const Icon = activity.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon size={14} className={activity.iconColor} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                          {activity.title}
                        </p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", lineHeight: 1.4, marginTop: 1 }}>
                          {activity.description}
                        </p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b0", marginTop: 2 }}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className="w-full mt-4 text-center hover:underline"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#d4a574", fontWeight: 500 }}
              >
                View All
              </button>
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
        <div className="flex items-center gap-3">
          {["facebook", "instagram", "twitter", "youtube", "linkedin"].map((s) => (
            <button key={s} className="w-7 h-7 rounded-full bg-[#0a1628] flex items-center justify-center hover:bg-[#d4a574] transition-colors">
              <span className="text-[#faf8f5] text-[10px] font-bold">{s[0].toUpperCase()}</span>
            </button>
          ))}
        </div>
      </footer>

      {/* Generate Enrollment Link Modal */}
      {showEnrollmentModal && (
        <GenerateEnrollmentLinkModal onClose={() => setShowEnrollmentModal(false)} />
      )}
    </div>
  );
}
