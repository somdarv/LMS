"use client";

import dynamic from "next/dynamic";

const LmsSpa = dynamic(() => import("@/lms/LmsSpa"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#f5f6f8] flex items-center justify-center">
      <p className="text-sm text-[#6c6c6c]" style={{ fontFamily: "Inter, sans-serif" }}>
        Loading…
      </p>
    </div>
  ),
});

export default function SpaClient() {
  return <LmsSpa />;
}
