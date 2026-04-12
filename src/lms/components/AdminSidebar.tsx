import {
  LayoutDashboard,
  Users,
  BookOpen,
  Link as LinkIcon,
  BarChart3,
  CalendarDays,
  GraduationCap,
  Palette,
  ClipboardList,
  Layers,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const mainItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "Enrollments", icon: LinkIcon, href: "/admin/enrollment-links", badge: 5 },
];

const managementItems = [
  { label: "Courses", icon: BookOpen, href: "/admin/courses" },
  { label: "Cohorts", icon: Layers, href: "/admin/cohorts" },
  { label: "Students", icon: Users, href: "/admin/students" },
  { label: "Instructors", icon: GraduationCap, href: "/admin/instructors" },
  { label: "Terms & Sessions", icon: CalendarDays, href: "/admin/terms" },
];

const reportItems = [
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Attendance", icon: ClipboardList, href: "/admin/attendance" },
  { label: "Grade Books", icon: BookOpen, href: "/admin/gradebooks" },
];

const settingsItems = [
  { label: "Branding", icon: Palette, href: "/admin/branding" },
];

interface NavItemProps {
  label: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function NavItem({ label, icon: Icon, active, onClick, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 w-full px-3 py-2 transition-colors text-left ${
        active ? "text-[#d4a574]" : "text-[#6c6c6c] hover:text-[#0a1628]"
      }`}
    >
      <Icon size={16} strokeWidth={active ? 2 : 1.5} />
      <span
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "14px",
          fontWeight: active ? 600 : 400,
          flex: 1,
        }}
      >
        {label}
      </span>
      {badge && badge > 0 && (
        <span
          className="w-5 h-5 rounded-full bg-[#d4a574] flex items-center justify-center"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 700, color: "#fff" }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="px-3 mb-1 mt-4"
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "10px",
        fontWeight: 700,
        color: "#b0b0b0",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </p>
  );
}

export function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + "/");

  return (
    <aside className="w-[200px] flex-shrink-0 flex flex-col gap-4">
      <nav className="flex flex-col gap-1">
        <SectionLabel>Main</SectionLabel>
        {mainItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onClick={() => navigate(item.href)}
          />
        ))}
      </nav>

      <nav className="flex flex-col gap-1">
        <SectionLabel>Management</SectionLabel>
        {managementItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onClick={() => navigate(item.href)}
          />
        ))}
      </nav>

      <nav className="flex flex-col gap-1">
        <SectionLabel>Reports</SectionLabel>
        {reportItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onClick={() => navigate(item.href)}
          />
        ))}
      </nav>

      <nav className="flex flex-col gap-1">
        <SectionLabel>Settings</SectionLabel>
        {settingsItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href)}
            onClick={() => navigate(item.href)}
          />
        ))}
      </nav>
    </aside>
  );
}
