import {
  LayoutDashboard,
  Users,
  Settings,
  Link as LinkIcon,
  Layers,
  CalendarDays,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router";

const mainItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
];

const managementItems = [
  { label: "Programs & Courses", icon: Layers, href: "/admin/programs" },
  { label: "Sittings", icon: CalendarDays, href: "/admin/sittings" },
  { label: "User Management", icon: Users, href: "/admin/users" },
  { label: "Enrollment Links", icon: LinkIcon, href: "/admin/enrollment-links" },
];

const settingsItems = [
  { label: "System Settings", icon: Settings, href: "/admin/settings" },
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
      className={`flex items-center gap-2 w-full px-3 py-2 transition-colors text-left rounded-md ${
        active ? "bg-slate-800 text-[#d4a574]" : "text-slate-400 hover:text-white hover:bg-slate-800/50"
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2 : 1.5} />
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
      className="px-3 mb-2 mt-4"
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "11px",
        fontWeight: 700,
        color: "#64748b",
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

  const isActive = (href: string) => {
    return location.pathname.startsWith(href);
  };

  return (
    <div className="w-[260px] bg-slate-900 border-r border-slate-800 flex flex-col h-full shrink-0 relative z-10 overflow-hidden text-white">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#d4a574] to-yellow-600 flex items-center justify-center font-bold text-slate-900">
            A
          </div>
          <span className="font-semibold text-sm tracking-wide">LMS Admin</span>
        </div>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="space-y-1 mb-6">
          {mainItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={isActive(item.href)}
              onClick={() => navigate(item.href)}
            />
          ))}
        </div>

        <SectionLabel>Organization</SectionLabel>
        <div className="space-y-1 mb-6">
          {managementItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={isActive(item.href)}
              onClick={() => navigate(item.href)}
            />
          ))}
        </div>

        <SectionLabel>Configuration</SectionLabel>
        <div className="space-y-1 mb-6">
          {settingsItems.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={isActive(item.href)}
              onClick={() => navigate(item.href)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
