import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  MessageSquare,
  Users,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const mainItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/instructor/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/instructor/courses" },
  { label: "Calendar", icon: CalendarDays, href: "/instructor/calendar" },
];

const communicationItems = [
  { label: "Messages", icon: MessageSquare, href: "/instructor/communications", badge: 3 },
  { label: "Groups", icon: Users, href: "/instructor/groups" },
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
          className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center"
          style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700, color: "#0a1628" }}
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
      className="px-3 mb-1"
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

export function InstructorSidebar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <aside className="w-[200px] flex-shrink-0 flex flex-col gap-6">
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
        <SectionLabel>Messages</SectionLabel>
        {communicationItems.map((item) => (
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