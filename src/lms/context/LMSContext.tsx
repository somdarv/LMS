import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { COURSES } from "../data/courses";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Program = {
  id: string;
  name: string;
  description: string;
};

export type Sitting = {
  id: string;
  name: string;      // e.g. "May 2026 Sitting"
  startDate: string;
  endDate: string;
};

export type PeriodType = "time-of-day" | "day-of-week" | "quarter" | "half-year" | "month";

export const PERIOD_TYPE_LABELS: Record<PeriodType, string> = {
  "time-of-day": "Time of Day",
  "day-of-week": "Day of Week",
  "quarter":     "Quarter of Year",
  "half-year":   "Half of Year",
  "month":       "Month of Year",
};

export const PERIOD_UNITS: Record<PeriodType, string[]> = {
  "time-of-day": ["Morning", "Afternoon", "Evening"],
  "day-of-week": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "quarter":     ["Q1", "Q2", "Q3", "Q4"],
  "half-year":   ["H1", "H2"],
  "month":       ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export type Cohort = {
  id: string;
  name: string;              // admin-defined label, e.g. "Weekday Morning", "Q1 2026"
  periodType: PeriodType;    // what kind of period this cohort represents
  periods: string[];         // selected units, e.g. ["Mon","Tue","Wed"] or ["Morning"]
  description?: string;
};

export type EnrollmentLinkConfig = {
  id: string;
  token: string;
  mode: "general" | "single";           // general = many students; single = bio pre-filled
  allowedPrograms: string[];             // Program IDs
  allowedCourses: number[];              // Course IDs (subset within program)
  allowedSittings: string[];             // Sitting IDs
  allowedCohorts: string[];              // Cohort IDs
  // Only populated for mode === "single"
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  expiresAt?: string;
};

export type ModuleItemType = "video" | "reading" | "quiz" | "assignment" | "pdf" | "link";

export type LMSModuleItem = {
  id: string;
  type: ModuleItemType;
  title: string;
  url?: string;          // populated when type === "link"
};

export type LMSModule = {
  id: string;
  courseId: number;   // matches COURSES[].id
  order: number;
  title: string;
  description: string;
  items: LMSModuleItem[];
};

export type ClassSession = {
  id: string;
  courseId: number;
  cohort: "Weekday" | "Weekend" | "Both";
  /** Optional label for calendar / UI */
  title?: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  zoomLink: string;
  meetingId: string;
  linkedModuleId?: string;
  notes?: string;
  recurrenceGroupId?: string;   // groups recurring sessions together
};

type LMSContextType = {
  programs: Program[];
  sittings: Sitting[];
  cohorts: Cohort[];
  addCohort: (cohort: Omit<Cohort, "id">) => Cohort;
  updateCohort: (id: string, patch: Partial<Omit<Cohort, "id">>) => void;
  deleteCohort: (id: string) => void;
  enrollmentLinks: EnrollmentLinkConfig[];
  generateEnrollmentLink: (config: Omit<EnrollmentLinkConfig, "id" | "token">) => EnrollmentLinkConfig;
  modules: LMSModule[];
  sessions: ClassSession[];
  addModule: (courseId: number, title: string, description: string) => LMSModule;
  updateModule: (id: string, patch: Partial<Pick<LMSModule, "title" | "description">>) => void;
  deleteModule: (id: string) => void;
  reorderModule: (id: string, direction: "up" | "down") => void;
  addModuleItem: (moduleId: string, type: ModuleItemType, title: string, url?: string) => void;
  updateModuleItem: (moduleId: string, itemId: string, patch: Partial<LMSModuleItem>) => void;
  deleteModuleItem: (moduleId: string, itemId: string) => void;
  addSession: (s: Omit<ClassSession, "id">) => void;
  updateSession: (id: string, patch: Partial<Omit<ClassSession, "id">>) => void;
  deleteSession: (id: string) => void;
  deleteSessionGroup: (recurrenceGroupId: string) => void;  // delete all in a series
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _counter = 1;
const uid = (prefix = "id") => `${prefix}-${Date.now()}-${_counter++}`;

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_PROGRAMS: Program[] = [
  { id: "prog-1", name: "ICAG Professional Qualification", description: "Full qualification covering Levels 1-3." },
  { id: "prog-2", name: "Diploma in Accounting", description: "Foundational diploma for entry-level accountants." },
  { id: "prog-3", name: "Taxation Specialist Certificate", description: "Specialized certificate focusing on tax laws and practices." },
];

const SEED_SITTINGS: Sitting[] = [
  { id: "sit-1", name: "May 2026 Sitting", startDate: "2026-01-15", endDate: "2026-05-10" },
  { id: "sit-2", name: "November 2026 Sitting", startDate: "2026-07-15", endDate: "2026-11-10" },
];

const SEED_COHORTS: Cohort[] = [
  { id: "cohort-weekday-am",  name: "Weekday Morning",    periodType: "day-of-week", periods: ["Mon", "Tue", "Wed", "Thu", "Fri"], description: "Classes on weekdays, morning sessions." },
  { id: "cohort-weekend-am",  name: "Weekend Morning",    periodType: "day-of-week", periods: ["Sat", "Sun"], description: "Weekend-only morning sessions." },
  { id: "cohort-evening",     name: "Evening Classes",    periodType: "time-of-day", periods: ["Evening"], description: "After-hours sessions for working professionals." },
  { id: "cohort-q1-2026",     name: "Q1 2026",            periodType: "quarter",     periods: ["Q1"], description: "January – March 2026 intake." },
  { id: "cohort-h1-2026",     name: "First Half 2026",    periodType: "half-year",   periods: ["H1"], description: "January – June 2026 intake." },
];

function buildInitialModules(): LMSModule[] {
  const list: LMSModule[] = [];
  COURSES.forEach((course) => {
    course.courseContent.forEach((wk, wkIdx) => {
      list.push({
        id: `mod-${course.id}-${wk.id}`,
        courseId: course.id,
        order: wkIdx + 1,
        title: wk.title,
        description: `Week ${wk.week} — covers ${wk.title.toLowerCase()} concepts and practice exercises.`,
        items: wk.lessons.map((l) => ({
          id: `item-${l.id}`,
          type: (l.type === "pdf" ? "pdf" : "video") as ModuleItemType,
          title: l.title,
        })),
      });
    });
  });
  return list;
}

// Default Zoom info per course
export const COURSE_SCHEDULE_DEFAULTS: Record<number, { zoom: string; meetingId: string; room: string }> = {
  1: { room: "Hall A", zoom: "https://us06web.zoom.us/j/84521067893?pwd=aB3cD4eF5gHi", meetingId: "845 2106 7893" },
  2: { room: "Hall B", zoom: "https://us06web.zoom.us/j/50273816492?pwd=cD5eF6gH7iJk", meetingId: "502 7381 6492" },
  3: { room: "Hall C", zoom: "https://us06web.zoom.us/j/72834519260?pwd=hI6jK7lM8nOp", meetingId: "728 3451 9260" },
  4: { room: "Hall D", zoom: "https://us06web.zoom.us/j/91045623784?pwd=oP9qR0sT1uVw", meetingId: "910 4562 3784" },
  5: { room: "Hall E", zoom: "https://us06web.zoom.us/j/63918274501?pwd=vW2xY3zA4bCd", meetingId: "639 1827 4501" },
};

// Recurring weekly schedule (0=Sun … 6=Sat)
const RECURRING = [
  { courseId: 1, days: [1, 4], start: "09:00 AM", end: "11:00 AM" },
  { courseId: 2, days: [5],    start: "01:00 PM", end: "03:00 PM" },
  { courseId: 3, days: [2, 5], start: "10:00 AM", end: "12:00 PM" },
  { courseId: 4, days: [3],    start: "02:00 PM", end: "04:00 PM" },
  { courseId: 5, days: [6],    start: "09:00 AM", end: "11:00 AM" },
];

function buildInitialSessions(): ClassSession[] {
  const sessions: ClassSession[] = [];
  const rangeStart = new Date(2026, 1, 20); // Feb 20
  const rangeEnd   = new Date(2026, 3, 30); // Apr 30

  for (const d = new Date(rangeStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    RECURRING.forEach((r) => {
      if (r.days.includes(dow)) {
        const def = COURSE_SCHEDULE_DEFAULTS[r.courseId];
        const isWeekend = dow === 0 || dow === 6;
        sessions.push({
          id: `sess-${r.courseId}-${dateStr}`,
          courseId: r.courseId,
          cohort: isWeekend ? "Weekend" : "Weekday",
          date: dateStr,
          startTime: r.start,
          endTime: r.end,
          room: def.room,
          zoomLink: def.zoom,
          meetingId: def.meetingId,
          recurrenceGroupId: `rec-${r.courseId}-${r.days.join("-")}-${r.start}-${r.end}`,
        });
      }
    });
  }
  return sessions;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LMSContext = createContext<LMSContextType | null>(null);

export function LMSProvider({ children }: { children: ReactNode }) {
  const [programs] = useState<Program[]>(SEED_PROGRAMS);
  const [sittings] = useState<Sitting[]>(SEED_SITTINGS);
  const [cohorts, setCohorts] = useState<Cohort[]>(SEED_COHORTS);
  const [enrollmentLinks, setEnrollmentLinks] = useState<EnrollmentLinkConfig[]>([]);

  const [modules, setModules] = useState<LMSModule[]>(() => buildInitialModules());
  const [sessions, setSessions] = useState<ClassSession[]>(() => buildInitialSessions());

  // ── Cohort CRUD ────────────────────────────────────────────────────────────

  const addCohort = (cohort: Omit<Cohort, "id">): Cohort => {
    const newCohort: Cohort = { ...cohort, id: uid("cohort") };
    setCohorts((prev) => [...prev, newCohort]);
    return newCohort;
  };

  const updateCohort = (id: string, patch: Partial<Omit<Cohort, "id">>) => {
    setCohorts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const deleteCohort = (id: string) => {
    setCohorts((prev) => prev.filter((c) => c.id !== id));
  };

  const generateEnrollmentLink = (config: Omit<EnrollmentLinkConfig, "id" | "token">) => {
    const newLink: EnrollmentLinkConfig = {
      ...config,
      id: uid("link"),
      token: Math.random().toString(36).substring(2, 10),
    };
    setEnrollmentLinks((prev) => [...prev, newLink]);
    return newLink;
  };

  // ── Modules ──────────────────────────────────────────────────────────────

  const addModule = (courseId: number, title: string, description: string): LMSModule => {
    const existing = modules.filter((m) => m.courseId === courseId);
    const newMod: LMSModule = {
      id: uid("mod"),
      courseId,
      order: existing.length + 1,
      title,
      description,
      items: [],
    };
    setModules((prev) => [...prev, newMod]);
    return newMod;
  };

  const updateModule = (id: string, patch: Partial<Pick<LMSModule, "title" | "description">>) => {
    setModules((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const deleteModule = (id: string) => {
    setModules((prev) => {
      const removed = prev.find((m) => m.id === id);
      if (!removed) return prev;
      return prev
        .filter((m) => m.id !== id)
        .map((m) =>
          m.courseId === removed.courseId && m.order > removed.order
            ? { ...m, order: m.order - 1 }
            : m
        );
    });
  };

  const reorderModule = (id: string, direction: "up" | "down") => {
    setModules((prev) => {
      const mod = prev.find((m) => m.id === id);
      if (!mod) return prev;
      const courseModules = prev
        .filter((m) => m.courseId === mod.courseId)
        .sort((a, b) => a.order - b.order);
      const idx = courseModules.findIndex((m) => m.id === id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= courseModules.length) return prev;
      const swapMod = courseModules[swapIdx];
      return prev.map((m) => {
        if (m.id === mod.id) return { ...m, order: swapMod.order };
        if (m.id === swapMod.id) return { ...m, order: mod.order };
        return m;
      });
    });
  };

  // ── Module Items ──────────────────────────────────────────────────────────

  const addModuleItem = (moduleId: string, type: ModuleItemType, title: string, url?: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, items: [...m.items, { id: uid("item"), type, title, ...(url ? { url } : {}) }] }
          : m
      )
    );
  };

  const updateModuleItem = (moduleId: string, itemId: string, patch: Partial<LMSModuleItem>) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, items: m.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : m
      )
    );
  };

  const deleteModuleItem = (moduleId: string, itemId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId ? { ...m, items: m.items.filter((it) => it.id !== itemId) } : m
      )
    );
  };

  // ── Sessions ──────────────────────────────────────────────────────────────

  const addSession = (s: Omit<ClassSession, "id">) => {
    setSessions((prev) => [...prev, { ...s, id: uid("sess") }]);
  };

  const updateSession = (id: string, patch: Partial<Omit<ClassSession, "id">>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const deleteSessionGroup = (recurrenceGroupId: string) => {
    setSessions((prev) => prev.filter((s) => s.recurrenceGroupId !== recurrenceGroupId));
  };

  const value = useMemo<LMSContextType>(
    () => ({
      programs, sittings, cohorts, addCohort, updateCohort, deleteCohort,
      enrollmentLinks, generateEnrollmentLink,
      modules, sessions,
      addModule, updateModule, deleteModule, reorderModule,
      addModuleItem, updateModuleItem, deleteModuleItem,
      addSession, updateSession, deleteSession, deleteSessionGroup,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [programs, sittings, cohorts, enrollmentLinks, modules, sessions]
  );

  return <LMSContext.Provider value={value}>{children}</LMSContext.Provider>;
}

export function useLMS(): LMSContextType {
  const ctx = useContext(LMSContext);
  if (!ctx) throw new Error("useLMS must be used inside <LMSProvider>");
  return ctx;
}