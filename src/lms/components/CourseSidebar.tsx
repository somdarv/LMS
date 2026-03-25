import { useState } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen,
  ClipboardList,
  HelpCircle,
  MessageCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Users,
  Users2,
} from "lucide-react";

export type CourseTab = "overview" | "content" | "assignments" | "quizzes" | "grades" | "communications" | "students" | "groups";

interface CourseSidebarProps {
  activeTab: CourseTab;
  setActiveTab: (tab: CourseTab) => void;
  courseName: string;
  courseCode: string;
  backUrl: string;
  counts?: Partial<Record<CourseTab, number>>;
  /** Tabs to hide — e.g. pass ["students"] on the student-facing course view */
  hideItems?: CourseTab[];
}

export function CourseSidebar({ activeTab, setActiveTab, courseName, courseCode, backUrl, counts = {}, hideItems = [] }: CourseSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const items = [
    { id: "overview", label: "About Course", icon: Info },
    { id: "content", label: "Course Content", icon: BookOpen },
    { id: "assignments", label: "Assignments", icon: ClipboardList },
    { id: "quizzes", label: "Quizzes", icon: HelpCircle },
    { id: "grades", label: "Grades", icon: GraduationCap },
    { id: "students", label: "Students", icon: Users },
    { id: "groups", label: "Groups", icon: Users2 },
    { id: "communications", label: "Communications", icon: MessageCircle },
  ].filter(item => !hideItems.includes(item.id as CourseTab));

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 flex-shrink-0 self-start sticky top-6 ${collapsed ? "w-[72px]" : "w-[260px]"}`}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <button onClick={() => navigate(backUrl)} className="flex items-center gap-2 text-[#6c6c6c] hover:text-[#0a1628] transition-colors" style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        )}
        {collapsed && (
          <button onClick={() => navigate(backUrl)} className="mx-auto text-[#6c6c6c] hover:text-[#0a1628]" title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 py-4 border-b border-gray-100 bg-[#fafafa]">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700, color: "#d4a574", marginBottom: 2 }}>{courseCode}</p>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#0a1628", lineHeight: 1.3 }}>{courseName}</p>
        </div>
      )}

      <div className="flex-1 py-3 flex flex-col gap-1 px-3">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          const count = counts[item.id as CourseTab];
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as CourseTab)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${isActive ? "bg-[#0a1628] text-white" : "text-[#6c6c6c] hover:bg-gray-50 hover:text-[#0a1628]"}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={isActive ? "text-[#d4a574]" : ""} />
                {!collapsed && (
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: isActive ? 600 : 500 }}>
                    {item.label}
                  </span>
                )}
              </div>
              {!collapsed && count !== undefined && (
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-[#8e8e96]"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2.5 rounded-lg text-[#6c6c6c] hover:bg-gray-50 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft size={16} />
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500 }}>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
