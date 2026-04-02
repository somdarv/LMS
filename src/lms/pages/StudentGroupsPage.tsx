import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Users, ArrowRight, Crown, Pencil, Check, X, AlertCircle, Search } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { GROUPS, type Group } from "../data/groups";
import { COURSES, type Course } from "../data/courses";
import { STUDENT_DEMO_ENROLLMENTS } from "../data/studentEnrollments";
import { courseDisplayTitleWithTrack } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };

// Demo: Kojo Manu student ID (matches other student pages/groups demo data)
const DEMO_STUDENT_ID = 7;

const statusBadge = (status: Group["status"]) => {
  switch (status) {
    case "open":
      return { className: "bg-green-50 text-green-700 border-green-200", label: "Open" };
    case "full":
      return { className: "bg-[#fdf3e7] text-[#a68b5b] border-[#d4a574]/40", label: "Full" };
    case "locked":
      return { className: "bg-[#f3f3f5] text-[#5a5a62] border-[#dcdce0]", label: "Locked" };
    default:
      return { className: "bg-[#f3f3f5] text-[#5a5a62] border-[#dcdce0]", label: status };
  }
};

export function StudentGroupsPage() {
  const navigate = useNavigate();

  const initialGroups = useMemo(
    () => GROUPS.filter((g) => g.members.some((m) => m.studentId === DEMO_STUDENT_ID)),
    [],
  );

  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [groupSearch, setGroupSearch] = useState("");

  const courseById = useMemo(() => {
    const map = new Map<number, Course>();
    COURSES.forEach((c) => map.set(c.id, c));
    return map;
  }, []);

  const handleStartRename = (g: Group) => {
    setEditingGroupId(g.id);
    setEditNameValue(g.name);
  };

  const handleRenameConfirm = (groupId: string) => {
    const trimmed = editNameValue.trim();
    if (!trimmed) return;
    setGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, name: trimmed } : g)));
    setEditingGroupId(null);
  };

  const handleRenameCancel = () => {
    setEditingGroupId(null);
    setEditNameValue("");
  };

  const handleClaimLeadership = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, leaderId: DEMO_STUDENT_ID } : g)),
    );
  };

  const handleStepDown = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, leaderId: undefined } : g)),
    );
  };

  const handleTransferLeadership = (groupId: string, toStudentId: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, leaderId: toStudentId } : g)),
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[{ label: "Home" }, { label: "Groups" }]}
        instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES"
        showAvatar
      />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>My Groups</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                {groups.length} group{groups.length !== 1 ? "s" : ""} across your courses
              </p>
            </div>
          </div>

          {/* Open group invitations banner */}
          {(() => {
            const enrolledIds = STUDENT_DEMO_ENROLLMENTS.map((e) => e.courseId);
            const coursesWithOpenGroups = COURSES.filter((c) => {
              if (!enrolledIds.includes(c.id)) return false;
              const courseGroups = GROUPS.filter((g) => g.courseId === c.id);
              if (courseGroups.length === 0) return false;
              const inGroup = courseGroups.some((g) => g.members.some((m) => m.studentId === DEMO_STUDENT_ID));
              if (inGroup) return false;
              return courseGroups.some((g) => g.status === "open" && g.members.length < g.maxSize);
            });
            if (coursesWithOpenGroups.length === 0) return null;
            return (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#fdf3e7] border border-[#d4a574]/30">
                <AlertCircle size={18} className="text-[#d4a574] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>You have open group invitations</p>
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 3, lineHeight: 1.4 }}>
                    Self-enrollment groups are available in {coursesWithOpenGroups.length} course{coursesWithOpenGroups.length !== 1 ? "s" : ""}. Join a group before the deadline.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {coursesWithOpenGroups.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/student/courses/${c.id}?tab=groups`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#d4a574]/30 hover:bg-[#f5e6d0] transition-colors"
                        style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#0a1628" }}
                      >
                        {c.title} <ArrowRight size={12} className="text-[#d4a574]" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {groups.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <Users size={44} className="mx-auto mb-3 text-[#d4a574]" />
              <p style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>No groups yet</p>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 6 }}>
                When instructors create groups, your membership will appear here.
              </p>
            </div>
          ) : (
            <>
              {/* Search */}
              {groups.length > 2 && (
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e96]" />
                  <input
                    type="text"
                    placeholder="Search groups..."
                    value={groupSearch}
                    onChange={(e) => setGroupSearch(e.target.value)}
                    className="w-full max-w-xs pl-8 pr-3 py-2 border border-gray-200 bg-white text-[#0a1628] placeholder-[#b0b0b5] outline-none focus:border-[#d4a574] rounded-lg"
                    style={{ ...S, fontSize: "13px" }}
                  />
                </div>
              )}
            <div className="flex flex-col gap-4">
              {groups.filter((g) => !groupSearch || g.name.toLowerCase().includes(groupSearch.toLowerCase())).map((g) => {
                const course = courseById.get(g.courseId);
                const badge = statusBadge(g.status);
                const isLeader = g.leaderId === DEMO_STUDENT_ID;
                const hasLeader = g.leaderId !== undefined;
                const isEditing = editingGroupId === g.id;

                return (
                  <div key={g.id} className="bg-white border border-[#ededf0] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p style={{ ...S, fontSize: "12px", color: "#8e8e96" }}>
                          {course ? courseDisplayTitleWithTrack(course, g.track) : `Course ${g.courseId}`}
                        </p>

                        {/* Group name — editable if leader */}
                        <div className="flex items-center gap-2 mt-1">
                          {isEditing ? (
                            <>
                              <input
                                autoFocus
                                value={editNameValue}
                                onChange={(e) => setEditNameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleRenameConfirm(g.id);
                                  if (e.key === "Escape") handleRenameCancel();
                                }}
                                className="border border-[#d4a574] rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-[#d4a574]/40"
                                style={{ ...S, fontSize: "16px", fontWeight: 800, color: "#0a1628", minWidth: 0, width: "180px" }}
                              />
                              <button
                                onClick={() => handleRenameConfirm(g.id)}
                                className="p-1 rounded-md hover:bg-green-50 text-green-600"
                                title="Confirm"
                              >
                                <Check size={15} />
                              </button>
                              <button
                                onClick={handleRenameCancel}
                                className="p-1 rounded-md hover:bg-red-50 text-red-400"
                                title="Cancel"
                              >
                                <X size={15} />
                              </button>
                            </>
                          ) : (
                            <>
                              <p style={{ ...S, fontSize: "16px", fontWeight: 800, color: "#0a1628" }}>
                                {g.name}
                              </p>
                              {isLeader && (
                                <button
                                  onClick={() => handleStartRename(g)}
                                  className="p-1 rounded-md text-[#8e8e96] hover:text-[#0a1628] hover:bg-[#f3f3f5] transition-colors"
                                  title="Rename group"
                                >
                                  <Pencil size={13} />
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 6 }}>
                          {g.members.length} member{g.members.length !== 1 ? "s" : ""} · max {g.maxSize}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                          style={S}
                        >
                          {badge.label}
                        </span>

                        {/* Leadership actions */}
                        {!hasLeader && (
                          <button
                            onClick={() => handleClaimLeadership(g.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#d4a574] bg-[#fdf3e7] text-[#a68b5b] hover:bg-[#f5e6d0] transition-colors"
                            style={{ ...S, fontSize: "11px", fontWeight: 700 }}
                          >
                            <Crown size={11} /> Claim Leadership
                          </button>
                        )}
                        {isLeader && (
                          <button
                            onClick={() => handleStepDown(g.id)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#dcdce0] bg-[#f3f3f5] text-[#5a5a62] hover:bg-[#ededf0] transition-colors"
                            style={{ ...S, fontSize: "11px", fontWeight: 700 }}
                          >
                            Step Down
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Member list */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {g.members.map((m) => {
                        const memberIsLeader = g.leaderId === m.studentId;
                        return (
                          <div key={m.studentId} className="flex items-center gap-1">
                            <span
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                                memberIsLeader
                                  ? "bg-[#fdf3e7] text-[#a68b5b] border-[#d4a574]/40"
                                  : "bg-[#f3f3f5] text-[#5a5a62] border-[#ededf0]"
                              }`}
                              style={{ ...S, fontSize: "11px", fontWeight: 600 }}
                            >
                              {memberIsLeader && <Crown size={10} className="text-[#d4a574]" />}
                              {m.initials} · {m.name}
                            </span>
                            {/* Transfer leadership button — only shown to current leader for other members */}
                            {isLeader && m.studentId !== DEMO_STUDENT_ID && (
                              <button
                                onClick={() => handleTransferLeadership(g.id, m.studentId)}
                                className="px-2 py-0.5 rounded-full border border-[#d4a574]/50 bg-white text-[#a68b5b] hover:bg-[#fdf3e7] transition-colors"
                                style={{ ...S, fontSize: "10px", fontWeight: 700 }}
                                title={`Make ${m.name} leader`}
                              >
                                Make Leader
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => navigate(`/student/courses/${g.courseId}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                        style={{ ...S, fontSize: "13px", fontWeight: 700 }}
                      >
                        Open Course <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
