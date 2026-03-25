import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin,
  Video, X, ArrowLeft, ExternalLink, Hash, Plus,
  Pencil, Trash2, Check, Link2, BookOpen, StickyNote,
  AlertCircle, RefreshCw,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { useLMS, ClassSession, COURSE_SCHEDULE_DEFAULTS } from "../context/LMSContext";
import { cohortShortLabel } from "../lib/cohortLabels";
import { courseDisplayTitleWithTrack, courseSelectLabel, courseTitleWithTracks } from "../lib/courseLabels";

// ─── Constants ────────────────────────────────────────────────────────────────

const S = { fontFamily: "Inter, sans-serif" };

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const COURSE_COLORS: Record<number, { dot: string; bg: string; text: string; border: string }> = {
  1: { dot: "bg-[#d4a574]",   bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200" },
  2: { dot: "bg-gray-500",    bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-200" },
  3: { dot: "bg-gray-600",    bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-200" },
  4: { dot: "bg-[#d4a574]",   bg: "bg-amber-50",   text: "text-amber-800",   border: "border-amber-200" },
  5: { dot: "bg-gray-400",    bg: "bg-gray-50",    text: "text-gray-700",    border: "border-gray-200" },
};

// Unique calendar dot per course so they're visually distinct on the grid
const CALENDAR_DOTS: Record<number, string> = {
  1: "bg-[#d4a574]",
  2: "bg-gray-700",
  3: "bg-gray-400",
  4: "bg-[#c8955f]",
  5: "bg-gray-300 border border-gray-400",
};

const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 20; h++) {
  for (const m of [0, 30]) {
    const period = h < 12 ? "AM" : "PM";
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    TIME_OPTIONS.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`);
  }
}

// ─── Recurrence helpers ───────────────────────────────────────────────────────

type RepeatMode = "none" | "weekly" | "biweekly";

function generateSeriesDates(startDate: string, endDate: string, repeat: RepeatMode): string[] {
  if (!startDate || !endDate || repeat === "none") return [startDate];
  const dates: string[] = [];
  const start = new Date(startDate + "T12:00:00");
  const end   = new Date(endDate   + "T12:00:00");
  const step  = repeat === "biweekly" ? 14 : 7;
  for (const d = new Date(start); d <= end; d.setDate(d.getDate() + step)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

let _seq = 200;
const fuid = (p = "x") => `${p}-${Date.now()}-${_seq++}`;

// ─── Session form ─────────────────────────────────────────────────────────────

type SessionFormData = {
  courseId: number;
  cohort: "Weekday" | "Weekend" | "Both";
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  zoomLink: string;
  meetingId: string;
  linkedModuleId: string;
  notes: string;
  repeat: RepeatMode;
  repeatEndDate: string;
  autoAssignModules: boolean;
  startingModuleId: string;
};

const BLANK_FORM = (date = ""): SessionFormData => ({
  courseId: 1,
  cohort: "Both",
  date,
  startTime: "09:00 AM",
  endTime: "11:00 AM",
  room: COURSE_SCHEDULE_DEFAULTS[1].room,
  zoomLink: COURSE_SCHEDULE_DEFAULTS[1].zoom,
  meetingId: COURSE_SCHEDULE_DEFAULTS[1].meetingId,
  linkedModuleId: "",
  notes: "",
  repeat: "none",
  repeatEndDate: "",
  autoAssignModules: false,
  startingModuleId: "",
});

function SessionModal({ initial, editingId, onClose }: {
  initial: SessionFormData; editingId: string | null; onClose: () => void;
}) {
  const { modules, addSession, updateSession } = useLMS();
  const [form, setForm] = useState<SessionFormData>(initial);
  const [errors, setErrors] = useState<string[]>([]);

  const courseModules = modules.filter((m) => m.courseId === form.courseId).sort((a, b) => a.order - b.order);
  const set = (patch: Partial<SessionFormData>) => setForm((f) => ({ ...f, ...patch }));
  const isRecurring = form.repeat !== "none";

  const previewDates = isRecurring && form.date && form.repeatEndDate
    ? generateSeriesDates(form.date, form.repeatEndDate, form.repeat)
    : [];

  const handleCourseChange = (courseId: number) => {
    const def = COURSE_SCHEDULE_DEFAULTS[courseId];
    set({ courseId, room: def.room, zoomLink: def.zoom, meetingId: def.meetingId, linkedModuleId: "", startingModuleId: "" });
  };

  const validate = () => {
    const errs: string[] = [];
    if (!form.date) errs.push("Start date is required.");
    if (isRecurring && !form.repeatEndDate) errs.push("End date is required for recurring sessions.");
    if (isRecurring && form.repeatEndDate && form.repeatEndDate <= form.date) errs.push("End date must be after start date.");
    if (!form.startTime) errs.push("Start time is required.");
    if (!form.endTime) errs.push("End time is required.");
    if (!form.room.trim()) errs.push("Room / location is required.");
    if (!form.zoomLink.trim()) errs.push("Zoom link is required.");
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }

    if (editingId) {
      updateSession(editingId, {
        courseId: form.courseId, date: form.date, cohort: form.cohort,
        startTime: form.startTime, endTime: form.endTime,
        room: form.room.trim(), zoomLink: form.zoomLink.trim(), meetingId: form.meetingId.trim(),
        linkedModuleId: form.linkedModuleId || undefined,
        notes: form.notes.trim() || undefined,
      });
      onClose(); return;
    }

    const dates = isRecurring ? generateSeriesDates(form.date, form.repeatEndDate, form.repeat) : [form.date];
    const groupId = isRecurring ? fuid("grp") : undefined;

    dates.forEach((date, idx) => {
      let linkedModuleId: string | undefined = form.linkedModuleId || undefined;
      if (isRecurring && form.autoAssignModules && courseModules.length > 0) {
        const startIdx = courseModules.findIndex((m) => m.id === form.startingModuleId);
        const base = startIdx >= 0 ? startIdx : 0;
        linkedModuleId = courseModules[(base + idx) % courseModules.length]?.id;
      }
      addSession({
        courseId: form.courseId, cohort: form.cohort, date,
        startTime: form.startTime, endTime: form.endTime,
        room: form.room.trim(), zoomLink: form.zoomLink.trim(), meetingId: form.meetingId.trim(),
        linkedModuleId, notes: form.notes.trim() || undefined, recurrenceGroupId: groupId,
      });
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="bg-[#0a1628] px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 style={{ ...S, fontSize: "16px", fontWeight: 700, color: "#faf8f5" }}>
            {editingId ? "Edit Class Session" : "Add Class Session"}
          </h2>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded"><X size={15} className="text-white/70" /></button>
        </div>

        {errors.length > 0 && (
          <div className="flex items-start gap-2 px-5 py-3 bg-red-50 border-b border-red-100">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>{errors.map((e) => <p key={e} style={{ ...S, fontSize: "12px", color: "#dc2626" }}>{e}</p>)}</div>
          </div>
        )}

        <div className="flex flex-col gap-4 p-6">
          {/* Course & Cohort */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Course *</label>
              <select value={form.courseId} onChange={(e) => handleCourseChange(Number(e.target.value))}
                className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] bg-white"
                style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {courseSelectLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cohort *</label>
              <select value={form.cohort} onChange={(e) => set({ cohort: e.target.value as any })}
                className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] bg-white"
                style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
                <option value="Weekday">WD — Weekday</option>
                <option value="Weekend">WE — Weekend</option>
                <option value="Both">All cohorts</option>
              </select>
            </div>
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isRecurring ? "Series Start Date *" : "Date *"}
            </label>
            <input type="date" value={form.date} onChange={(e) => set({ date: e.target.value })}
              className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628]"
              style={{ ...S, fontSize: "13px", color: "#0a1628" }} />
          </div>

          {/* Recurrence (hidden when editing) */}
          {!editingId && (
            <div className="flex flex-col gap-3 p-4 bg-[#f5f6f8] border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw size={12} className="text-[#6c6c6c]" />
                  <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Recurrence
                  </label>
                </div>
                {isRecurring && previewDates.length > 0 && (
                  <span style={{ ...S, fontSize: "11px", color: "#d4a574", fontWeight: 700 }}>
                    {previewDates.length} sessions
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {(["none", "weekly", "biweekly"] as RepeatMode[]).map((r) => (
                  <button key={r}
                    onClick={() => set({ repeat: r, repeatEndDate: r === "none" ? "" : form.repeatEndDate, autoAssignModules: false })}
                    className={`flex-1 h-8 border transition-colors ${form.repeat === r ? "bg-[#0a1628] border-[#0a1628] text-white" : "border-gray-300 bg-white text-[#6c6c6c] hover:border-[#0a1628]"}`}
                    style={{ ...S, fontSize: "12px", fontWeight: 600 }}>
                    {r === "none" ? "One-off" : r === "weekly" ? "Weekly" : "Bi-weekly"}
                  </button>
                ))}
              </div>

              {isRecurring && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Series End Date *</label>
                    <input type="date" value={form.repeatEndDate} onChange={(e) => set({ repeatEndDate: e.target.value })}
                      className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] bg-white"
                      style={{ ...S, fontSize: "13px", color: "#0a1628" }} />
                  </div>

                  {/* Auto-module assignment */}
                  {courseModules.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-200">
                      <label className="flex items-start gap-2.5 cursor-pointer select-none">
                        <input type="checkbox" checked={form.autoAssignModules}
                          onChange={(e) => set({ autoAssignModules: e.target.checked })}
                          className="w-4 h-4 mt-0.5 accent-[#d4a574] flex-shrink-0" />
                        <div>
                          <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                            Auto-assign modules in sequence
                          </p>
                          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.4, marginTop: 1 }}>
                            Each session automatically gets the next module — links the recurring schedule to your curriculum
                          </p>
                        </div>
                      </label>

                      {form.autoAssignModules && (
                        <div className="flex flex-col gap-2">
                          <label style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>Starting module:</label>
                          <select value={form.startingModuleId} onChange={(e) => set({ startingModuleId: e.target.value })}
                            className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] bg-white"
                            style={{ ...S, fontSize: "12px", color: "#0a1628" }}>
                            <option value="">Module 1 — {courseModules[0]?.title}</option>
                            {courseModules.map((m) => (
                              <option key={m.id} value={m.id}>Module {m.order}: {m.title}</option>
                            ))}
                          </select>

                          {/* Preview mapping */}
                          {previewDates.length > 0 && (
                            <div className="bg-white border border-gray-200 p-2 max-h-[120px] overflow-y-auto">
                              <p style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                                Preview
                              </p>
                              {previewDates.map((date, idx) => {
                                const startIdx = courseModules.findIndex((m) => m.id === form.startingModuleId);
                                const base = startIdx >= 0 ? startIdx : 0;
                                const mod = courseModules[(base + idx) % courseModules.length];
                                const d = new Date(date + "T12:00:00");
                                return (
                                  <div key={date} className="flex items-center gap-2 py-0.5">
                                    <span style={{ ...S, fontSize: "10px", color: "#6c6c6c", width: 70, flexShrink: 0 }}>
                                      {d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                                    </span>
                                    <span style={{ ...S, fontSize: "10px", color: "#d4a574" }}>→</span>
                                    <span style={{ ...S, fontSize: "10px", color: "#0a1628" }}>
                                      M{mod?.order}: {mod?.title}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            {[{ label: "Start Time *", key: "startTime" as const }, { label: "End Time *", key: "endTime" as const }].map(({ label, key }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
                <select value={form[key]} onChange={(e) => set({ [key]: e.target.value })}
                  className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] bg-white"
                  style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Room */}
          <div className="flex flex-col gap-1.5">
            <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Room / Location *</label>
            <input value={form.room} onChange={(e) => set({ room: e.target.value })} placeholder="e.g. Hall A, Online…"
              className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628]" style={{ ...S, fontSize: "13px" }} />
          </div>

          {/* Zoom */}
          <div className="flex flex-col gap-1.5">
            <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Zoom Link *</label>
            <input value={form.zoomLink} onChange={(e) => set({ zoomLink: e.target.value })} placeholder="https://zoom.us/j/…"
              className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628]" style={{ ...S, fontSize: "13px" }} />
          </div>

          {/* Meeting ID */}
          <div className="flex flex-col gap-1.5">
            <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>Meeting ID</label>
            <input value={form.meetingId} onChange={(e) => set({ meetingId: e.target.value })} placeholder="e.g. 845 2106 7893"
              className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628]" style={{ ...S, fontSize: "13px" }} />
          </div>

          {/* Module link — one-off or edit only */}
          {(!isRecurring || editingId) && (
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5" style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <Link2 size={11} /> Link to Module
                <span style={{ fontWeight: 400, color: "#b0b0b0", textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>(optional)</span>
              </label>
              {courseModules.length === 0
                ? <p style={{ ...S, fontSize: "12px", color: "#b0b0b0" }}>No modules yet for this course.</p>
                : (
                  <select value={form.linkedModuleId} onChange={(e) => set({ linkedModuleId: e.target.value })}
                    className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] bg-white"
                    style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
                    <option value="">— No module linked —</option>
                    {courseModules.map((m) => <option key={m.id} value={m.id}>Module {m.order}: {m.title}</option>)}
                  </select>
                )}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Notes <span style={{ fontWeight: 400, color: "#b0b0b0", textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>(optional)</span>
            </label>
            <textarea rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })}
              placeholder="Notes for students about this session…"
              className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] resize-none"
              style={{ ...S, fontSize: "13px" }} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 transition-colors"
              style={{ ...S, fontSize: "13px", fontWeight: 700 }}>
              <Check size={13} />
              {editingId ? "Save Changes" : isRecurring && previewDates.length > 0 ? `Create ${previewDates.length} Sessions` : "Add Session"}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ ...S, fontSize: "13px" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Delete confirmation panel ────────────────────────────────────────────────

type DeleteIntent = { sessionId: string; recurrenceGroupId?: string } | null;

function DeleteControls({ sess, onDelete, onDeleteGroup, onCancel }: {
  sess: ClassSession;
  onDelete: () => void;
  onDeleteGroup: () => void;
  onCancel: () => void;
}) {
  const isRecurring = !!sess.recurrenceGroupId;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      {isRecurring ? (
        <>
          <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", marginBottom: 2 }}>Delete:</p>
          <button onClick={onDelete}
            className="h-7 border border-gray-200 hover:border-red-400 hover:bg-red-50 transition-colors"
            style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
            This session only
          </button>
          <button onClick={onDeleteGroup}
            className="h-7 bg-red-600 text-white hover:bg-red-700 transition-colors"
            style={{ ...S, fontSize: "11px" }}>
            All sessions in series
          </button>
          <button onClick={onCancel}
            className="h-7 border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ ...S, fontSize: "11px" }}>
            Cancel
          </button>
        </>
      ) : (
        <div className="flex gap-1">
          <button onClick={onDelete}
            className="flex-1 h-7 bg-red-600 text-white hover:bg-red-700 transition-colors"
            style={{ ...S, fontSize: "11px" }}>
            Confirm Delete
          </button>
          <button onClick={onCancel}
            className="flex-1 h-7 border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ ...S, fontSize: "11px" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function CalendarPage() {
  const navigate = useNavigate();
  const { sessions, modules, deleteSession, deleteSessionGroup } = useLMS();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(todayStr);

  const [showModal, setShowModal] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteIntent>(null);

  const openAdd  = (date?: string) => { setEditingSession(null); setShowModal(true); if (date) setSelectedDate(date); };
  const openEdit = (s: ClassSession) => { setEditingSession(s); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditingSession(null); };

  const eventMap = useMemo(() => {
    const map: Record<string, ClassSession[]> = {};
    sessions
      .filter((s) => { const d = new Date(s.date + "T12:00:00"); return d.getFullYear() === year && d.getMonth() === month; })
      .forEach((s) => { if (!map[s.date]) map[s.date] = []; map[s.date].push(s); });
    return map;
  }, [sessions, year, month]);

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthCount = Object.values(eventMap).flat().length;

  const prevMonth = () => { setSelectedDate(null); if (month === 0) { setYear((y) => y - 1); setMonth(11); } else setMonth((m) => m - 1); };
  const nextMonth = () => { setSelectedDate(null); if (month === 11) { setYear((y) => y + 1); setMonth(0); } else setMonth((m) => m + 1); };
  const goToday   = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(todayStr); };

  const selectedSessions = selectedDate ? (eventMap[selectedDate] ?? []) : [];

  const upcomingList = useMemo(() =>
    [...sessions].filter((s) => s.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5),
    [sessions, todayStr]
  );

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Dashboard" }, { label: "Calendar" }]} />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" />

      {showModal && (
        <SessionModal
          initial={editingSession ? {
            courseId: editingSession.courseId, cohort: editingSession.cohort, date: editingSession.date,
            startTime: editingSession.startTime, endTime: editingSession.endTime,
            room: editingSession.room, zoomLink: editingSession.zoomLink, meetingId: editingSession.meetingId,
            linkedModuleId: editingSession.linkedModuleId ?? "",
            notes: editingSession.notes ?? "",
            repeat: "none", repeatEndDate: "", autoAssignModules: false, startingModuleId: "",
          } : BLANK_FORM(selectedDate ?? "")}
          editingId={editingSession?.id ?? null}
          onClose={closeModal}
        />
      )}

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />
        <main className="flex-1 min-w-0 flex flex-col gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 w-fit text-[#6c6c6c] hover:text-[#0a1628] transition-colors" style={{ ...S, fontSize: "13px" }}>
            <ArrowLeft size={14} /> Back
          </button>

          <div className="flex gap-4 items-start">
            {/* ── Calendar grid ─────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">

              {/* Month nav */}
              <div className="bg-white border border-gray-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <h1 style={{ ...S, fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>{MONTH_LABELS[month]} {year}</h1>
                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 2 }}>
                    {monthCount} session{monthCount !== 1 ? "s" : ""} this month
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={prevMonth} className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:border-black transition-colors"><ChevronLeft size={15} /></button>
                  <button onClick={goToday} className="px-3 h-8 border border-gray-200 hover:border-black transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>Today</button>
                  <button onClick={nextMonth} className="w-8 h-8 border border-gray-200 flex items-center justify-center hover:border-black transition-colors"><ChevronRight size={15} /></button>
                  <button onClick={() => openAdd(selectedDate ?? "")}
                    className="flex items-center gap-1.5 px-3 h-8 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 transition-colors"
                    style={{ ...S, fontSize: "12px", fontWeight: 600 }}>
                    <Plus size={13} /> Add Session
                  </button>
                </div>
              </div>

              {/* Grid */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-7 border-b border-gray-100">
                  {DAY_LABELS.map((d) => (
                    <div key={d} className="py-2 text-center" style={{ ...S, fontSize: "11px", fontWeight: 700, color: d === "Sun" || d === "Sat" ? "#d4a574" : "#6c6c6c", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDow }).map((_, i) => (
                    <div key={`b${i}`} className="min-h-[90px] bg-[#fafafa] border-b border-r border-gray-50" />
                  ))}

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const daySessions = eventMap[dateStr] ?? [];
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;
                    const isWeekend = new Date(year, month, day).getDay() % 6 === 0;

                    return (
                      <div key={dateStr}
                        onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                        className={`min-h-[90px] p-2 border-b border-r border-gray-50 cursor-pointer transition-all
                          ${isSelected ? "bg-[#0a1628]" : isWeekend ? "bg-[#fdfcfc] hover:bg-[#f8f8f9]" : "bg-white hover:bg-[#f8f8f9]"}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`w-6 h-6 flex items-center justify-center rounded-full ${isToday && !isSelected ? "bg-[#d4a574]" : ""}`}
                            style={{ ...S, fontSize: "12px", fontWeight: isToday || isSelected ? 700 : 400, color: isSelected ? "#fff" : isToday ? "#fff" : isWeekend ? "#b0b0b0" : "#0a1628" }}>
                            {day}
                          </span>
                          {daySessions.length > 0 && (
                            <span className={`text-[9px] font-bold px-1 rounded ${isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-[#6c6c6c]"}`} style={S}>
                              {daySessions.length}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-0.5">
                          {daySessions.slice(0, 2).map((sess) => {
                            const course = COURSES.find((x) => x.id === sess.courseId);
                            const dotClass = CALENDAR_DOTS[sess.courseId] ?? "bg-gray-400";
                            return (
                              <div key={sess.id} className={`flex items-center gap-1 px-1 py-0.5 rounded ${isSelected ? "bg-white/15" : "bg-gray-50"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                                <span style={{ ...S, fontSize: "9px", fontWeight: 600 }} className={isSelected ? "text-white" : "text-[#6c6c6c]"}>
                                  {course ? `${course.shortCode} · ${cohortShortLabel(sess.cohort)}` : "—"}
                                </span>
                                {sess.recurrenceGroupId && (
                                  <RefreshCw size={7} className={isSelected ? "text-white/50" : "text-gray-300"} />
                                )}
                              </div>
                            );
                          })}
                          {daySessions.length > 2 && (
                            <span style={{ ...S, fontSize: "9px", paddingLeft: 2 }} className={isSelected ? "text-white/70" : "text-[#6c6c6c]"}>
                              +{daySessions.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white border border-gray-200 px-5 py-4">
                <p style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Course Legend</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {COURSES.map((c) => {
                    const dotClass = CALENDAR_DOTS[c.id] ?? "bg-gray-400";
                    return (
                      <div key={c.id} className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${dotClass}`} />
                        <span style={{ ...S, fontSize: "12px", color: "#0a1628" }}>{courseTitleWithTracks(c)}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-gray-200">
                    <RefreshCw size={10} className="text-gray-400" />
                    <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Recurring</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right panel ───────────────────────────────────────────── */}
            <div className="w-[260px] flex-shrink-0 flex flex-col gap-4 sticky top-4">

              {/* Date detail */}
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="bg-[#0a1628] px-4 py-3 flex items-center justify-between">
                  <div>
                    <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#faf8f5" }}>
                      {selectedDate
                        ? new Date(selectedDate + "T12:00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })
                        : "Select a date"}
                    </p>
                    <p style={{ ...S, fontSize: "11px", color: "rgba(250,248,245,0.6)", marginTop: 2 }}>
                      {selectedDate
                        ? selectedSessions.length === 0 ? "No classes — click + to add" : `${selectedSessions.length} class${selectedSessions.length > 1 ? "es" : ""}`
                        : "Click a date on the calendar"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {selectedDate && (
                      <button onClick={() => openAdd(selectedDate)} className="p-1.5 hover:bg-white/10 rounded" title="Add session">
                        <Plus size={13} className="text-[#d4a574]" />
                      </button>
                    )}
                    {selectedDate && (
                      <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-white/10 rounded">
                        <X size={13} className="text-white/50 hover:text-white" />
                      </button>
                    )}
                  </div>
                </div>

                {!selectedDate ? (
                  <div className="px-5 py-8 text-center">
                    <Calendar size={32} className="text-gray-200 mx-auto mb-2" />
                    <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", lineHeight: 1.5 }}>Click any date to view or manage sessions</p>
                  </div>
                ) : selectedSessions.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Calendar size={28} className="text-gray-200 mx-auto mb-2" />
                    <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>Free day</p>
                    <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginBottom: 12 }}>No sessions scheduled.</p>
                    <button onClick={() => openAdd(selectedDate)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 mx-auto"
                      style={{ ...S, fontSize: "12px" }}>
                      <Plus size={12} /> Add Session
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {selectedSessions.map((sess) => {
                      const c = COURSE_COLORS[sess.courseId] ?? COURSE_COLORS[1];
                      const course = COURSES.find((x) => x.id === sess.courseId);
                      const linkedMod = sess.linkedModuleId ? modules.find((m) => m.id === sess.linkedModuleId) : null;
                      const isDeleting = deleteTarget?.sessionId === sess.id;

                      return (
                        <div key={sess.id} className="p-4">
                          {/* Badge row */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${c.bg} ${c.border}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                              <span style={{ ...S, fontSize: "10px", fontWeight: 700 }} className={c.text}>{course?.shortCode}</span>
                            </div>
                            <span className="inline-flex px-1.5 py-0.5 rounded bg-[#eef2f6] text-[#0a1628] text-[9px] font-semibold">
                              {cohortShortLabel(sess.cohort)}
                            </span>
                            {sess.recurrenceGroupId && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-50 border border-gray-200" style={{ ...S, fontSize: "10px", color: "#6c6c6c" }}>
                                <RefreshCw size={9} /> Recurring
                              </span>
                            )}
                          </div>

                          <p style={{ ...S, fontSize: "13px", fontWeight: 600, color: "#0a1628", marginBottom: 8 }}>
                            {course &&
                              (sess.cohort === "Both"
                                ? courseTitleWithTracks(course)
                                : courseDisplayTitleWithTrack(course, sess.cohort))}
                          </p>

                          <div className="flex flex-col gap-1.5 mb-3">
                            <div className="flex items-center gap-2">
                              <Clock size={11} className="text-[#6c6c6c] flex-shrink-0" />
                              <span style={{ ...S, fontSize: "11px", color: "#0a1628" }}>{sess.startTime} – {sess.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin size={11} className="text-[#6c6c6c] flex-shrink-0" />
                              <span style={{ ...S, fontSize: "11px", color: "#0a1628" }}>{sess.room}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Hash size={11} className="text-[#6c6c6c] flex-shrink-0" />
                              <span style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>{sess.meetingId}</span>
                            </div>
                            {linkedMod && (
                              <div className="flex items-start gap-2 mt-1 px-2 py-1.5 bg-[#fafaf5] border border-[rgba(212,165,116,0.2)]">
                                <BookOpen size={11} className="text-[#d4a574] flex-shrink-0 mt-0.5" />
                                <div>
                                  <p style={{ ...S, fontSize: "10px", color: "#d4a574", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>Covering</p>
                                  <p style={{ ...S, fontSize: "11px", color: "#0a1628" }}>Module {linkedMod.order}: {linkedMod.title}</p>
                                </div>
                              </div>
                            )}
                            {sess.notes && (
                              <div className="flex items-start gap-2 mt-1 px-2 py-1.5 bg-[#fafafa] border border-gray-100">
                                <StickyNote size={11} className="text-[#6c6c6c] flex-shrink-0 mt-0.5" />
                                <p style={{ ...S, fontSize: "11px", color: "#6c6c6c", lineHeight: 1.5 }}>{sess.notes}</p>
                              </div>
                            )}
                          </div>

                          <a href={sess.zoomLink} target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 w-full h-9 bg-[#2D8CFF] hover:bg-[#1a7cef] transition-colors mb-2"
                            style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#fff", textDecoration: "none" }}>
                            <Video size={12} /> Join via Zoom <ExternalLink size={10} />
                          </a>

                          {/* Edit / Delete */}
                          {isDeleting ? (
                            <DeleteControls
                              sess={sess}
                              onDelete={() => { deleteSession(sess.id); setDeleteTarget(null); }}
                              onDeleteGroup={() => { if (sess.recurrenceGroupId) deleteSessionGroup(sess.recurrenceGroupId); setDeleteTarget(null); }}
                              onCancel={() => setDeleteTarget(null)}
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <button onClick={() => openEdit(sess)}
                                className="flex items-center gap-1 flex-1 h-7 border border-gray-200 hover:border-black transition-colors justify-center"
                                style={{ ...S, fontSize: "11px", color: "#0a1628" }}>
                                <Pencil size={10} /> Edit
                              </button>
                              <button onClick={() => setDeleteTarget({ sessionId: sess.id, recurrenceGroupId: sess.recurrenceGroupId })}
                                className="flex items-center gap-1 flex-1 h-7 border border-gray-200 hover:border-red-400 hover:bg-red-50 transition-colors justify-center"
                                style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                                <Trash2 size={10} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Coming up */}
              <div className="bg-white border border-gray-200 p-4">
                <p style={{ ...S, fontSize: "10px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Coming Up
                </p>
                {upcomingList.length === 0
                  ? <p style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>No upcoming sessions.</p>
                  : (
                    <div className="flex flex-col gap-2">
                      {upcomingList.map((sess) => {
                        const dotClass = CALENDAR_DOTS[sess.courseId] ?? "bg-gray-400";
                        const course = COURSES.find((x) => x.id === sess.courseId);
                        const linkedMod = sess.linkedModuleId ? modules.find((m) => m.id === sess.linkedModuleId) : null;
                        const d = new Date(sess.date + "T12:00:00");
                        return (
                          <button key={sess.id}
                            onClick={() => { setYear(d.getFullYear()); setMonth(d.getMonth()); setSelectedDate(sess.date); }}
                            className="flex items-start gap-2.5 text-left w-full px-2 py-1.5 hover:bg-[#f8f8f9] rounded transition-colors">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${dotClass}`} />
                            <div className="min-w-0">
                              <p style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>
                                {course ? `${course.shortCode} · ${cohortShortLabel(sess.cohort)}` : "—"}
                              </p>
                              <p style={{ ...S, fontSize: "10px", color: "#6c6c6c", lineHeight: 1.4 }}>
                                {d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                                {" · "}{sess.startTime}
                              </p>
                              {linkedMod && (
                                <p style={{ ...S, fontSize: "10px", color: "#d4a574", lineHeight: 1.3 }}>
                                  M{linkedMod.order}: {linkedMod.title}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex items-center justify-between mt-4">
        <p style={{ ...S, fontSize: "13px", color: "#0a1628" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.
        </p>
        <div className="flex items-center gap-3" style={{ ...S, fontSize: "13px" }}>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
