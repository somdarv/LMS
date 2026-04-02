import { Moon, Bell, Settings, User } from "lucide-react";
import { useNavigate } from "react-router";

interface AlmsHeaderProps {
  breadcrumb?: { label: string; href?: string }[];
  instituteName?: string;
  showAvatar?: boolean;
  avatarUrl?: string;
}

export function AlmsHeader({ breadcrumb, instituteName, showAvatar, avatarUrl }: AlmsHeaderProps) {
  const navigate = useNavigate();
  return (
    <>
      {/* Top Nav */}
      <header className="w-full bg-[#0a1628] flex items-center justify-between px-6 py-[14px]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 2L3 7.5V19.5L13.5 25L24 19.5V7.5L13.5 2Z" stroke="#FAF8F5" strokeWidth="2" strokeLinejoin="round" />
            <path d="M13.5 2V25M3 7.5L24 19.5M24 7.5L3 19.5" stroke="#FAF8F5" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: instituteName ? "15px" : "22px", color: "#FAF8F5", letterSpacing: "0.5px" }}>
            {instituteName ?? "SOMDA INSTITUTE OF PROFESSIONAL STUDIES"}
          </span>
        </button>
        <div className="flex items-center gap-5">
          <button className="text-[#faf8f5] opacity-80 hover:opacity-100 transition-opacity">
            <Moon size={20} />
          </button>
          <button className="text-[#faf8f5] opacity-80 hover:opacity-100 transition-opacity relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-2 h-2" />
          </button>
          <button className="text-[#faf8f5] opacity-80 hover:opacity-100 transition-opacity">
            <Settings size={20} />
          </button>
          {showAvatar && (
            <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#d4a574] border-2 border-[#faf8f5] overflow-hidden hover:opacity-90 transition-opacity flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover object-top" />
              ) : (
                <User size={16} className="text-[#faf8f5]" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>
      </header>
      {/* Breadcrumb */}
      {breadcrumb && (
        <div className="px-6 py-3 flex items-center gap-2 bg-white border-b border-gray-100">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && (
                <span className="inline-block w-3 h-3 rounded-full bg-[#d4a574]" style={{ minWidth: 10, minHeight: 10 }} />
              )}
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  color: i === breadcrumb.length - 1 ? "#0a1628" : "#0a1628",
                  fontWeight: i === breadcrumb.length - 1 ? 600 : 400,
                  cursor: item.href ? "pointer" : "default",
                }}
              >
                {item.label}
              </span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
