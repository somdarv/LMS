// ─── Types ────────────────────────────────────────────────────────────────────

export type GroupMode   = "instructor_assigned" | "self_enrollment";
export type GroupStatus = "open" | "full" | "locked";

export interface GroupMember {
  studentId: number;
  name: string;
  initials: string;
  joinedAt: string; // ISO
}

export interface Group {
  id: string;
  courseId: number;
  track: "Weekday" | "Weekend" | "All";
  name: string;
  members: GroupMember[];
  maxSize: number;
  status: GroupStatus;
  createdBy: "instructor" | number; // "instructor" or studentId
  createdAt: string; // ISO
  /** studentId of the designated group leader; undefined = no leader yet */
  leaderId?: number;
}

export interface GroupAssignmentConfig {
  enabled: boolean;
  mode: GroupMode;
  maxGroupSize: number;
  /** ISO datetime — only for self_enrollment; groups lock after this, submission still open */
  groupFormationDeadline?: string;
}

export interface GroupSubmissionMeta {
  groupId: string;
  groupName: string;
  memberIds: number[];
  submittedByStudentId: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

export const GROUPS: Group[] = [
  // FA L1 — instructor-assigned, Weekday cohort
  {
    id: "grp-1-wd-001",
    courseId: 1,
    track: "Weekday",
    name: "Group Alpha",
    maxSize: 4,
    status: "open",
    createdBy: "instructor",
    createdAt: "2026-02-01T10:00:00Z",
    leaderId: 1,
    members: [
      { studentId: 1,  name: "Akua Mensah",    initials: "AM", joinedAt: "2026-02-01T10:00:00Z" },
      { studentId: 3,  name: "Kwame Asante",   initials: "KA", joinedAt: "2026-02-01T10:00:00Z" },
      { studentId: 5,  name: "Yaa Frimpong",   initials: "YF", joinedAt: "2026-02-01T10:00:00Z" },
    ],
  },
  {
    id: "grp-1-wd-002",
    courseId: 1,
    track: "Weekday",
    name: "Group Beta",
    maxSize: 4,
    status: "open",
    createdBy: "instructor",
    createdAt: "2026-02-01T10:00:00Z",
    leaderId: 2,
    members: [
      { studentId: 2,  name: "Kofi Boateng",   initials: "KB", joinedAt: "2026-02-01T10:00:00Z" },
      { studentId: 4,  name: "Yaw Darko",      initials: "YD", joinedAt: "2026-02-01T10:00:00Z" },
    ],
  },
  // FA L1 — instructor-assigned, Weekend cohort
  {
    id: "grp-1-we-001",
    courseId: 1,
    track: "Weekend",
    name: "Group Gamma",
    maxSize: 4,
    status: "open",
    createdBy: "instructor",
    createdAt: "2026-02-01T10:00:00Z",
    leaderId: 7, // Kojo Manu is the leader
    members: [
      { studentId: 6,  name: "Ama Darko",      initials: "AD", joinedAt: "2026-02-01T10:00:00Z" },
      { studentId: 7,  name: "Kojo Manu",      initials: "KM", joinedAt: "2026-02-01T10:00:00Z" },
    ],
  },
  // MA L1 — self-enrollment (partial, to demo the join flow)
  {
    id: "grp-3-all-001",
    courseId: 3,
    track: "All",
    name: "Team One",
    maxSize: 3,
    status: "open",
    createdBy: 8,
    createdAt: "2026-02-10T14:00:00Z",
    leaderId: 8,
    members: [
      { studentId: 8,  name: "Esi Amponsah",   initials: "EA", joinedAt: "2026-02-10T14:00:00Z" },
      { studentId: 9,  name: "Kwabena Frimpong", initials: "KF", joinedAt: "2026-02-10T15:00:00Z" },
    ],
  },
  {
    id: "grp-3-all-002",
    courseId: 3,
    track: "All",
    name: "Team Two",
    maxSize: 3,
    status: "open",
    createdBy: 10,
    createdAt: "2026-02-11T09:00:00Z",
    leaderId: 10,
    members: [
      { studentId: 10, name: "Harriet Ofori",  initials: "HO", joinedAt: "2026-02-11T09:00:00Z" },
    ],
  },
  // FA L2 — Weekend cohort, Kojo is leader
  {
    id: "grp-2-we-001",
    courseId: 2,
    track: "Weekend",
    name: "Group Delta",
    maxSize: 4,
    status: "open",
    createdBy: "instructor",
    createdAt: "2026-02-05T10:00:00Z",
    leaderId: 7,
    members: [
      { studentId: 7,  name: "Kojo Manu",      initials: "KM", joinedAt: "2026-02-05T10:00:00Z" },
      { studentId: 11, name: "Yaa Asantewaa",   initials: "YA", joinedAt: "2026-02-05T10:00:00Z" },
      { studentId: 12, name: "Nana Akufo",      initials: "NA", joinedAt: "2026-02-06T09:00:00Z" },
    ],
  },
  // MA L1 — Weekday cohort, Kojo is leader
  {
    id: "grp-3-wd-001",
    courseId: 3,
    track: "Weekday",
    name: "Team Alpha",
    maxSize: 4,
    status: "open",
    createdBy: "instructor",
    createdAt: "2026-02-08T10:00:00Z",
    leaderId: 7,
    members: [
      { studentId: 7,  name: "Kojo Manu",      initials: "KM", joinedAt: "2026-02-08T10:00:00Z" },
      { studentId: 8,  name: "Esi Amponsah",   initials: "EA", joinedAt: "2026-02-08T10:00:00Z" },
      { studentId: 9,  name: "Kwabena Frimpong", initials: "KF", joinedAt: "2026-02-08T11:00:00Z" },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Find the group a student belongs to for a given course/track. */
export function findStudentGroup(
  studentId: number,
  courseId: number,
  track: "Weekday" | "Weekend" | "All"
): Group | undefined {
  return GROUPS.find(
    (g) =>
      g.courseId === courseId &&
      (g.track === "All" || track === "All" || g.track === track) &&
      g.members.some((m) => m.studentId === studentId)
  );
}

/** Get all groups for a course/track. */
export function getCourseGroups(
  courseId: number,
  track: "Weekday" | "Weekend" | "All"
): Group[] {
  return GROUPS.filter(
    (g) =>
      g.courseId === courseId &&
      (g.track === "All" || track === "All" || g.track === track)
  );
}

/** Recalculate a group's status based on current member count vs maxSize. */
export function recalcGroupStatus(group: Group): GroupStatus {
  if (group.status === "locked") return "locked";
  return group.members.length >= group.maxSize ? "full" : "open";
}
