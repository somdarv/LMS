import { useState } from "react";
import { Plus, X, Lock, Unlock, Users2, AlertTriangle, Crown, UserCheck } from "lucide-react";
import {
  getCourseGroups, recalcGroupStatus,
  type Group, type GroupMember,
} from "../data/groups";

const S = { fontFamily: "Inter, sans-serif" };

interface SimpleStudent {
  id: number;
  name: string;
  initials: string;
  cohort: "Weekday" | "Weekend";
}

interface GroupsTabProps {
  courseId: number;
  track: "Weekday" | "Weekend" | "All";
  students: SimpleStudent[];
}

export function GroupsTab({ courseId, track, students }: GroupsTabProps) {
  const [groups, setGroups] = useState<Group[]>(() => getCourseGroups(courseId, track));
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMaxSize, setNewGroupMaxSize] = useState(4);
  const [creating, setCreating] = useState(false);
  const [selfEnrollOpen, setSelfEnrollOpen] = useState(false);

  // Which students are already in a group
  const groupedIds = new Set(groups.flatMap((g) => g.members.map((m) => m.studentId)));
  const ungrouped = students.filter((s) => !groupedIds.has(s.id));

  const handleCreateGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    const newGroup: Group = {
      id: `grp-${courseId}-${Date.now()}`,
      courseId,
      track,
      name,
      members: [],
      maxSize: Math.max(1, newGroupMaxSize),
      status: "open",
      createdBy: "instructor",
      createdAt: new Date().toISOString(),
    };
    setGroups((prev) => [...prev, newGroup]);
    setNewGroupName("");
    setNewGroupMaxSize(4);
    setCreating(false);
  };

  const handleSetMaxSize = (groupId: string, delta: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const next = Math.max(g.members.length, g.maxSize + delta); // can't go below current member count
        const updated = { ...g, maxSize: next };
        updated.status = recalcGroupStatus(updated);
        return updated;
      })
    );
  };

  const handleRemoveMember = (groupId: string, studentId: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const updated = { ...g, members: g.members.filter((m) => m.studentId !== studentId) };
        updated.status = recalcGroupStatus(updated);
        return updated;
      })
    );
  };

  const handleAddMember = (groupId: string, student: SimpleStudent) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.members.length >= g.maxSize) return g;
        const member: GroupMember = {
          studentId: student.id,
          name: student.name,
          initials: student.initials,
          joinedAt: new Date().toISOString(),
        };
        const updated = { ...g, members: [...g.members, member] };
        updated.status = recalcGroupStatus(updated);
        return updated;
      })
    );
  };

  const handleToggleLock = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.status === "locked") {
          return { ...g, status: recalcGroupStatus({ ...g, status: "open" }) };
        }
        return { ...g, status: "locked" };
      })
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleSetLeader = (groupId: string, studentId: number) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        // Toggle: clicking the current leader removes them
        return { ...g, leaderId: g.leaderId === studentId ? undefined : studentId };
      })
    );
  };

  const statusColor: Record<string, string> = {
    open: "bg-green-50 text-green-700 border-green-200",
    full: "bg-[#fdf3e7] text-[#a68b5b] border-[#d4a574]/40",
    locked: "bg-[#f3f3f5] text-[#5a5a62] border-[#dcdce0]",
  };

  return (
    <div className="px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ ...S, fontSize: "20px", fontWeight: 700, color: "#0a1628" }}>Groups</h2>
          <p style={{ ...S, fontSize: "13px", color: "#8e8e96", marginTop: 2 }}>
            {groups.length} group{groups.length !== 1 ? "s" : ""} · {groupedIds.size} students assigned · {ungrouped.length} ungrouped
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Self-enrollment toggle */}
          <button
            onClick={() => setSelfEnrollOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${selfEnrollOpen ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-[#dcdce0] text-[#5a5a62] hover:border-[#0a1628]"}`}
            style={{ ...S, fontSize: "12px", fontWeight: 600 }}
            title="Allow students to join groups themselves"
          >
            <UserCheck size={13} />
            Self-enroll {selfEnrollOpen ? "On" : "Off"}
          </button>
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0a1628] text-white hover:bg-[#1a2a42] transition-colors"
            style={{ ...S, fontSize: "13px", fontWeight: 600 }}
          >
            <Plus size={14} /> Create Group
          </button>
        </div>
      </div>

      {/* Self-enrollment banner */}
      {selfEnrollOpen && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
          <UserCheck size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#166534" }}>Self-enrollment is open</p>
            <p style={{ ...S, fontSize: "12px", color: "#15803d", marginTop: 2 }}>
              Students can see and join any open group from their course page until groups are full or you turn this off.
            </p>
          </div>
        </div>
      )}

      {/* Create group inline form */}
      {creating && (
        <div className="mb-4 p-4 rounded-xl border border-[#0a1628]/20 bg-[#fafafa] flex gap-3 items-center flex-wrap">
          <input
            autoFocus
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Group name…"
            className="flex-1 min-w-[160px] px-3 py-2 border border-[#dcdce0] rounded-lg focus:outline-none focus:border-[#0a1628]"
            style={{ ...S, fontSize: "13px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateGroup();
              if (e.key === "Escape") setCreating(false);
            }}
          />
          {/* Max size stepper */}
          <div className="flex items-center gap-2">
            <span style={{ ...S, fontSize: "12px", color: "#5a5a62" }}>Max size</span>
            <div className="flex items-center border border-[#dcdce0] rounded-lg overflow-hidden">
              <button
                onClick={() => setNewGroupMaxSize((v) => Math.max(1, v - 1))}
                className="px-2.5 py-2 text-[#5a5a62] hover:bg-[#f3f3f5] transition-colors"
                style={{ ...S, fontSize: "13px", lineHeight: 1 }}
              >−</button>
              <span className="px-3 py-2 border-x border-[#dcdce0] bg-white"
                style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", minWidth: "32px", textAlign: "center" }}>
                {newGroupMaxSize}
              </span>
              <button
                onClick={() => setNewGroupMaxSize((v) => Math.min(20, v + 1))}
                className="px-2.5 py-2 text-[#5a5a62] hover:bg-[#f3f3f5] transition-colors"
                style={{ ...S, fontSize: "13px", lineHeight: 1 }}
              >+</button>
            </div>
          </div>
          <button onClick={handleCreateGroup} disabled={!newGroupName.trim()}
            className="px-4 py-2 rounded-lg bg-[#0a1628] text-white text-sm font-semibold disabled:opacity-30 hover:bg-[#1a2a42] transition-colors"
            style={S}>
            Create
          </button>
          <button onClick={() => setCreating(false)} className="text-[#8e8e96] hover:text-[#0a1628]">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Groups list */}
      {groups.length === 0 && !creating && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f3f3f5] flex items-center justify-center mb-4">
            <Users2 size={24} className="text-[#b0b0b5]" />
          </div>
          <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#3a3a42" }}>No groups yet</p>
          <p style={{ ...S, fontSize: "13px", color: "#8e8e96", marginTop: 4 }}>
            Create groups and assign students, or wait for students to self-enroll.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {groups.map((group) => {
          const availableStudents = ungrouped.concat(
            // also allow reassigning from another group — show truly ungrouped only for simplicity
            []
          );
          return (
            <div key={group.id} className="bg-white border border-[#ededf0] rounded-xl overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#f3f3f5] bg-[#fafafa]">
                <div className="w-8 h-8 rounded-lg bg-[#0a1628]/8 flex items-center justify-center">
                  <Users2 size={14} className="text-[#0a1628]" />
                </div>
                <p style={{ ...S, fontSize: "14px", fontWeight: 700, color: "#0a1628" }} className="flex-1">
                  {group.name}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${statusColor[group.status] || ""}`}
                  style={S}>
                  {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                </span>
                <button
                  onClick={() => handleToggleLock(group.id)}
                  title={group.status === "locked" ? "Unlock group" : "Lock group"}
                  className="w-7 h-7 flex items-center justify-center rounded text-[#8e8e96] hover:text-[#0a1628] hover:bg-[#f3f3f5] transition-colors"
                >
                  {group.status === "locked" ? <Unlock size={13} /> : <Lock size={13} />}
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  title="Delete group"
                  className="w-7 h-7 flex items-center justify-center rounded text-[#8e8e96] hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X size={13} />
                </button>
              </div>

              {/* Members */}
              <div className="px-5 py-3">
                <div className="flex flex-wrap gap-2">
                  {group.members.map((m) => {
                    const isLeader = group.leaderId === m.studentId;
                    return (
                      <div key={m.studentId}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${isLeader ? "bg-[#fdf3e7] border-[#d4a574]/40" : "bg-[#f3f3f5] border-[#ededf0]"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center ${isLeader ? "bg-[#d4a574]" : "bg-[#0a1628]"} text-white`}
                          style={{ ...S, fontSize: "9px", fontWeight: 700 }}>
                          {m.initials}
                        </span>
                        <span style={{ ...S, fontSize: "12px", color: "#3a3a42" }}>{m.name}</span>
                        {isLeader && <Crown size={10} className="text-[#d4a574]" />}
                        {/* Set/unset leader button */}
                        {group.status !== "locked" && (
                          <button
                            onClick={() => handleSetLeader(group.id, m.studentId)}
                            title={isLeader ? "Remove leader" : "Set as leader"}
                            className={`ml-0.5 transition-colors ${isLeader ? "text-[#d4a574] hover:text-[#a68b5b]" : "text-[#d0d0d5] hover:text-[#d4a574]"}`}
                          >
                            <Crown size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveMember(group.id, m.studentId)}
                          className="text-[#b0b0b5] hover:text-red-400 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add student dropdown */}
                  {group.status !== "locked" && group.members.length < group.maxSize && availableStudents.length > 0 && (
                    <AddStudentDropdown
                      students={availableStudents}
                      onAdd={(s) => handleAddMember(group.id, s)}
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <span style={{ ...S, fontSize: "11px", color: "#b0b0b5" }}>
                    {group.members.length} / {group.maxSize} members
                  </span>
                  {group.status !== "locked" && (
                    <div className="flex items-center gap-1">
                      <span style={{ ...S, fontSize: "10px", color: "#8e8e96" }}>Max:</span>
                      <div className="flex items-center border border-[#ededf0] rounded overflow-hidden">
                        <button
                          onClick={() => handleSetMaxSize(group.id, -1)}
                          disabled={group.maxSize <= group.members.length}
                          className="px-1.5 py-0.5 text-[#8e8e96] hover:bg-[#f3f3f5] disabled:opacity-30 transition-colors"
                          style={{ ...S, fontSize: "11px", lineHeight: 1 }}
                        >−</button>
                        <span className="px-2 py-0.5 border-x border-[#ededf0] bg-white"
                          style={{ ...S, fontSize: "11px", fontWeight: 600, color: "#0a1628", minWidth: "24px", textAlign: "center" }}>
                          {group.maxSize}
                        </span>
                        <button
                          onClick={() => handleSetMaxSize(group.id, 1)}
                          disabled={group.maxSize >= 20}
                          className="px-1.5 py-0.5 text-[#8e8e96] hover:bg-[#f3f3f5] disabled:opacity-30 transition-colors"
                          style={{ ...S, fontSize: "11px", lineHeight: 1 }}
                        >+</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ungrouped students */}
      {ungrouped.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} className="text-[#a68b5b]" />
            <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#a68b5b" }}>
              {ungrouped.length} student{ungrouped.length !== 1 ? "s" : ""} not in any group
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {ungrouped.map((s) => (
              <UngroupedStudentChip
                key={s.id}
                student={s}
                groups={groups.filter((g) => g.status !== "locked" && g.members.length < g.maxSize)}
                onAssign={(groupId) => handleAddMember(groupId, s)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add student dropdown ─────────────────────────────────────────────────────
function AddStudentDropdown({
  students,
  onAdd,
}: {
  students: SimpleStudent[];
  onAdd: (s: SimpleStudent) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#b0b0b5] text-[#8e8e96] hover:border-[#0a1628] hover:text-[#0a1628] transition-colors"
        style={{ ...S, fontSize: "12px" }}
      >
        <Plus size={11} /> Add student
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-10 w-52 bg-white border border-[#ededf0] rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {students.map((s) => (
              <button
                key={s.id}
                onClick={() => { onAdd(s); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#fafafb] text-left transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-[#0a1628] text-white flex items-center justify-center flex-shrink-0"
                  style={{ ...S, fontSize: "9px", fontWeight: 700 }}>
                  {s.initials}
                </span>
                <span style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{s.name}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setOpen(false)}
            className="w-full text-center py-1.5 border-t border-[#f3f3f5] text-[#8e8e96] hover:bg-[#fafafb] transition-colors"
            style={{ ...S, fontSize: "11px" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Ungrouped student chip with assign dropdown ──────────────────────────────
function UngroupedStudentChip({
  student,
  groups,
  onAssign,
}: {
  student: SimpleStudent;
  groups: Group[];
  onAssign: (groupId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-[#d4a574]/60 bg-[#fdf8f3] hover:border-[#a68b5b] transition-colors"
      >
        <span className="w-5 h-5 rounded-full bg-[#d4a574] text-white flex items-center justify-center"
          style={{ ...S, fontSize: "9px", fontWeight: 700 }}>
          {student.initials}
        </span>
        <span style={{ ...S, fontSize: "12px", color: "#3a3a42" }}>{student.name}</span>
        <span style={{ ...S, fontSize: "10px", color: "#a68b5b" }}>▾</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-10 w-48 bg-white border border-[#ededf0] rounded-xl shadow-lg overflow-hidden">
          <p className="px-3 py-2 border-b border-[#f3f3f5]" style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Assign to
          </p>
          {groups.length === 0 && (
            <p className="px-3 py-3 text-center" style={{ ...S, fontSize: "12px", color: "#b0b0b5" }}>No open groups</p>
          )}
          {groups.map((g) => (
            <button key={g.id} onClick={() => { onAssign(g.id); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#fafafb] text-left transition-colors">
              <span style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{g.name}</span>
              <span style={{ ...S, fontSize: "10px", color: "#8e8e96" }}>{g.members.length}/{g.maxSize}</span>
            </button>
          ))}
          <button onClick={() => setOpen(false)}
            className="w-full text-center py-1.5 border-t border-[#f3f3f5] text-[#8e8e96] hover:bg-[#fafafb]"
            style={{ ...S, fontSize: "11px" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
