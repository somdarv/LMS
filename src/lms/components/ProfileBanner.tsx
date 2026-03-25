import { CheckCircle2, User } from "lucide-react";

interface ProfileBannerProps {
  name: string;
  role: string;
  institution?: string;
  location?: string;
  avatarUrl?: string;
}

export function ProfileBanner({
  name,
  role,
  institution = "SOMDA INSTITUTE OF PROFESSIONAL STUDIES",
  location = "Accra, Ghana",
  avatarUrl,
}: ProfileBannerProps) {
  return (
    <div className="relative w-full h-[180px] bg-[#0a1628] overflow-hidden flex items-center">
      {/* Decorative background (replaces Figma-exported assets) */}
      <div
        className="absolute inset-0 opacity-40 mix-blend-luminosity"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(212,165,116,0.2) 0%, transparent 45%), radial-gradient(ellipse 80% 100% at 85% 50%, rgba(42,58,92,0.85) 0%, transparent 60%)",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "55% auto",
        }}
      />
      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-[340px] h-[340px] rounded-full border border-[#2a3a5c] opacity-30" style={{ transform: "translate(40%, -40%)" }} />
      <div className="absolute right-0 top-0 w-[220px] h-[220px] rounded-full border border-[#2a3a5c] opacity-40" style={{ transform: "translate(30%, -30%)" }} />

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-between px-8">
        {/* Left: Avatar + Name */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-4 border-[#faf8f5] bg-[#d4a574] flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover object-top" />
              ) : (
                <User size={44} className="text-[#faf8f5] opacity-90" strokeWidth={1.5} />
              )}
            </div>
            <div className="absolute bottom-1 right-1 bg-white rounded-full p-0.5">
              <CheckCircle2 size={16} className="text-green-500" fill="currentColor" />
            </div>
          </div>
          <div>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                fontSize: "20px",
                color: "#FAF8F5",
                lineHeight: 1.4,
              }}
            >
              {name}
            </p>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "13px",
                color: "#FAF8F5",
                opacity: 0.8,
              }}
            >
              {role}
            </p>
          </div>
        </div>

        {/* Right: Institution */}
        <div className="text-right pr-4">
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "18px",
              color: "#FAF8F5",
              letterSpacing: "0.5px",
              lineHeight: 1.3,
            }}
          >
            {institution}
          </p>
          <p
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "13px",
              color: "#FAF8F5",
              opacity: 0.8,
              marginTop: 4,
            }}
          >
            {location}
          </p>
        </div>
      </div>
    </div>
  );
}
