import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Video,
  ExternalLink,
  X,
  Clock,
  MapPin,
  ClipboardList,
  HelpCircle,
  FileText,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { useLMS } from "../context/LMSContext";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort, STUDENT_DEMO_ENROLLMENTS } from "../data/studentEnrollments";
import { cohortShortLabel } from "../lib/cohortLabels";
import { studentCourseTitle } from "../lib/courseLabels";

const studentEnrollments = STUDENT_DEMO_ENROLLMENTS;

const enrolledCourseIds = studentEnrollments.map((e) => e.courseId);

// ─── Calendar event types ────────────────────────────────────────────────

type CalendarEventType = "session" | "assignment" | "quiz";

interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  courseId: number;
  date: string; // YYYY-MM-DD
  title: string;
  // Session fields
  startTime?: string;
  endTime?: string;
  room?: string;
  zoomLink?: string;
  meetingId?: string;
  cohort?: "Weekday" | "Weekend" | "Both";
  // Assignment/Quiz fields
  maxPoints?: number;
  status?: string;
  submissionType?: string;
  questions?: number;
  duration?: string;
}

// ─── Due date data (mirrored from StudentCourseDetailPage) ───────────────

const ASSIGNMENT_EVENTS: CalendarEvent[] = [
  // Course 1: Financial Accounting Level 1
  { id: "a-101", type: "assignment", courseId: 1, date: "2026-03-15", title: "Essay on Financial Statements", maxPoints: 100, status: "Not Started", submissionType: "file" },
  { id: "a-102", type: "assignment", courseId: 1, date: "2026-03-22", title: "Journal Entries Practice Set", maxPoints: 50, status: "In Progress", submissionType: "file" },
  { id: "a-103", type: "assignment", courseId: 1, date: "2026-03-05", title: "Double Entry Practice Set", maxPoints: 50, status: "Graded", submissionType: "file" },
  { id: "a-104", type: "assignment", courseId: 1, date: "2026-02-20", title: "Accounting Equation Worksheet", maxPoints: 30, status: "Graded", submissionType: "file" },
  { id: "a-105", type: "assignment", courseId: 1, date: "2026-02-28", title: "Trial Balance Reconciliation", maxPoints: 40, status: "Submitted", submissionType: "file" },
  // Course 2: Financial Accounting Level 2
  { id: "a-201", type: "assignment", courseId: 2, date: "2026-03-22", title: "Partnership Dissolution Exercise", maxPoints: 60, status: "Not Started", submissionType: "file" },
  { id: "a-202", type: "assignment", courseId: 2, date: "2026-02-22", title: "Company Accounts Exercise", maxPoints: 60, status: "Graded", submissionType: "file" },
  // Course 3: Management Accounting
  { id: "a-301", type: "assignment", courseId: 3, date: "2026-03-18", title: "Case Study: Cost Analysis", maxPoints: 80, status: "In Progress", submissionType: "text" },
  { id: "a-302", type: "assignment", courseId: 3, date: "2026-03-01", title: "Budget Preparation Exercise", maxPoints: 70, status: "Submitted", submissionType: "file" },
  { id: "a-303", type: "assignment", courseId: 3, date: "2026-02-15", title: "Cost Classification Worksheet", maxPoints: 25, status: "Graded", submissionType: "file" },
];

const QUIZ_EVENTS: CalendarEvent[] = [
  // Course 1
  { id: "q-1001", type: "quiz", courseId: 1, date: "2026-03-20", title: "Trial Balance Concepts", maxPoints: 15, status: "Not Started", questions: 15, duration: "25 min" },
  { id: "q-1002", type: "quiz", courseId: 1, date: "2026-03-08", title: "Double Entry Quiz", maxPoints: 10, status: "Graded", questions: 10, duration: "20 min" },
  { id: "q-1003", type: "quiz", courseId: 1, date: "2026-02-22", title: "Accounting Principles", maxPoints: 10, status: "Graded", questions: 10, duration: "15 min" },
  // Course 2
  { id: "q-2001", type: "quiz", courseId: 2, date: "2026-03-18", title: "Partnership Accounts", maxPoints: 12, status: "Not Started", questions: 12, duration: "20 min" },
  { id: "q-2002", type: "quiz", courseId: 2, date: "2026-02-25", title: "Company Accounts Basics", maxPoints: 10, status: "Graded", questions: 10, duration: "15 min" },
  // Course 3
  { id: "q-3001", type: "quiz", courseId: 3, date: "2026-03-15", title: "Costing Methods Quiz", maxPoints: 12, status: "Not Started", questions: 12, duration: "20 min" },
  { id: "q-3002", type: "quiz", courseId: 3, date: "2026-02-20", title: "Cost Classification", maxPoints: 10, status: "Graded", questions: 10, duration: "15 min" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusBadge = (status?: string): { bg: string; text: string } => {
  switch (status) {
    case "Graded":      return { bg: "bg-[#e8e8ea]", text: "text-[#3a3a42]" };
    case "Submitted":   return { bg: "bg-[#e8e8ea]", text: "text-[#6c6c6c]" };
    case "In Progress": return { bg: "bg-[#f0ece6]", text: "text-[#a68b5b]" };
    default:            return { bg: "bg-[#f3f3f5]", text: "text-[#8e8e96]" };
  }
};

const eventColor = (type: CalendarEventType) => {
  switch (type) {
    case "session":    return { bg: "bg-[rgba(212,165,116,0.15)]", hover: "hover:bg-[rgba(212,165,116,0.25)]", text: "text-[#d4a574]" };
    case "assignment": return { bg: "bg-[#eeeef0]", hover: "hover:bg-[#e4e4e7]", text: "text-[#5a5a62]" };
    case "quiz":       return { bg: "bg-[#e8eaee]", hover: "hover:bg-[#dddfe4]", text: "text-[#4a4e5a]" };
  }
};

const eventIcon = (type: CalendarEventType, size = 10) => {
  switch (type) {
    case "session":    return <Video size={size} />;
    case "assignment": return <ClipboardList size={size} />;
    case "quiz":       return <HelpCircle size={size} />;
  }
};

const eventTypeLabel = (type: CalendarEventType) => {
  switch (type) {
    case "session":    return "Class Session";
    case "assignment": return "Assignment Due";
    case "quiz":       return "Quiz Due";
  }
};

// ─── Component ──────────────────────────────────────────────────────────────

export function StudentCalendarPage() {
  const navigate = useNavigate();
  const { sessions } = useLMS();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1)); // Feb 2026
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Convert sessions to CalendarEvent
  const sessionEvents: CalendarEvent[] = sessions
    .filter((s) => {
      const enrollment = studentEnrollments.find(e => e.courseId === s.courseId);
      if (!enrollment) return false;
      return s.cohort === "Both" || s.cohort === enrollment.cohort;
    })
    .map((s) => ({
      id: `s-${s.id}`,
      type: "session" as const,
      courseId: s.courseId,
      date: s.date,
      title: s.title || "Class Session",
      startTime: s.startTime,
      endTime: s.endTime,
      room: s.room,
      zoomLink: s.zoomLink,
      meetingId: s.meetingId,
      cohort: s.cohort,
    }));

  const allEvents = [...sessionEvents, ...ASSIGNMENT_EVENTS, ...QUIZ_EVENTS];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentMonth.toLocaleString("default", { month: "long", year: "numeric" });

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [firstDay, daysInMonth]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((e) => e.date === dateStr);
  };

  const getCourseName = (courseId: number) => {
    const course = COURSES.find((c) => c.id === courseId);
    if (!course) return `Course ${courseId}`;
    return studentCourseTitle(course, getStudentEnrollmentCohort(courseId));
  };

  const getCourseCode = (courseId: number) =>
    COURSES.find((c) => c.id === courseId)?.code || COURSES.find((c) => c.id === courseId)?.shortCode || "—";

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1));

  const today = "2026-02-27";

  // Upcoming events — all types, sorted
  const upcoming = allEvents
    .filter((e) => e.date >= today)
    .sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      // sessions with times first, then assignments, then quizzes
      if (a.startTime && !b.startTime) return -1;
      if (!a.startTime && b.startTime) return 1;
      if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
      return 0;
    })
    .slice(0, 8);

  // Legend
  const legend: { type: CalendarEventType; label: string }[] = [
    { type: "session", label: "Class" },
    { type: "assignment", label: "Assignment" },
    { type: "quiz", label: "Quiz" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Calendar" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div>
            <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>Calendar</h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
              Class sessions, assignment deadlines, and quiz due dates
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
            {/* ─── Calendar Grid ──────────────────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              {/* Month nav + legend */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors">
                  <ChevronLeft size={18} className="text-[#6c6c6c]" />
                </button>
                <div className="flex items-center gap-4">
                  <h2 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "16px", color: "#0a1628" }}>{monthName}</h2>
                </div>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors">
                  <ChevronRight size={18} className="text-[#6c6c6c]" />
                </button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4 px-1">
                {legend.map((l) => {
                  const c = eventColor(l.type);
                  return (
                    <div key={l.type} className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-sm ${c.bg}`} />
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8e8e96" }}>{l.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center py-2" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96" }}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar cells */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} className="h-[84px]" />;
                  const dayEvents = getEventsForDay(day);
                  const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const isToday = dateStr === today;
                  const hasDue = dayEvents.some((e) => e.type === "assignment" || e.type === "quiz");
                  return (
                    <div
                      key={day}
                      className={`h-[84px] rounded-lg p-1 border transition-colors ${
                        isToday ? "border-[#d4a574] bg-[rgba(212,165,116,0.04)]" : "border-transparent hover:bg-[#fafafb]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: isToday ? 700 : 400, color: isToday ? "#d4a574" : "#0a1628" }}>
                          {day}
                        </p>
                        {/* Dot indicators when there are too many events to show */}
                        {dayEvents.length > 2 && (
                          <div className="flex gap-0.5">
                            {dayEvents.some((e) => e.type === "session") && <span className="w-1.5 h-1.5 rounded-full bg-[#d4a574]" />}
                            {dayEvents.some((e) => e.type === "assignment") && <span className="w-1.5 h-1.5 rounded-full bg-[#8e8e96]" />}
                            {dayEvents.some((e) => e.type === "quiz") && <span className="w-1.5 h-1.5 rounded-full bg-[#6a6e78]" />}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const c = eventColor(ev.type);
                          return (
                            <button
                              key={ev.id}
                              onClick={() => setSelectedEvent(ev)}
                              className={`w-full text-left px-1 py-[2px] rounded truncate transition-colors ${c.bg} ${c.hover}`}
                              style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 500 }}
                            >
                              <span className={c.text}>
                                {ev.type === "session"
                                  ? `${getCourseCode(ev.courseId)}${ev.cohort ? ` (${cohortShortLabel(ev.cohort)})` : ""}`
                                  : ev.type === "assignment"
                                  ? `📋 ${ev.title.length > 12 ? ev.title.slice(0, 12) + "…" : ev.title}`
                                  : `? ${ev.title.length > 12 ? ev.title.slice(0, 12) + "…" : ev.title}`}
                              </span>
                            </button>
                          );
                        })}
                        {dayEvents.length > 3 && (
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "8px", color: "#b0b0b5" }}>
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── Upcoming Events Sidebar ─────────────────────────────── */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginBottom: 12 }}>
                  Upcoming
                </h3>
                <div className="flex flex-col gap-2">
                  {upcoming.map((ev) => {
                    const d = new Date(ev.date + "T12:00:00");
                    const dateLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    const c = eventColor(ev.type);
                    const sb = ev.status ? statusBadge(ev.status) : null;
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-3 rounded-lg bg-[#fafafb] text-left hover:bg-[#f3f3f5] transition-colors group"
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Type icon */}
                          <div className={`w-7 h-7 rounded-md ${c.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <span className={c.text}>{eventIcon(ev.type, 12)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                              {ev.title}
                            </p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8e8e96", marginTop: 1 }}>
                              {getCourseCode(ev.courseId)}
                              {ev.type === "session" && ev.cohort && (
                                <span> · {cohortShortLabel(ev.cohort)}</span>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="flex items-center gap-1 text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px" }}>
                                <Clock size={9} /> {dateLabel}
                                {ev.startTime && ` • ${ev.startTime}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {/* Type tag */}
                              <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${c.bg} ${c.text}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 500 }}>
                                {eventTypeLabel(ev.type)}
                              </span>
                              {/* Status tag (assignments/quizzes) */}
                              {sb && (
                                <span className={`px-1.5 py-0.5 rounded ${sb.bg} ${sb.text}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 500 }}>
                                  {ev.status}
                                </span>
                              )}
                              {/* Zoom tag */}
                              {ev.zoomLink && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#0a1628] text-[#faf8f5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 500 }}>
                                  <Video size={8} /> Zoom
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {upcoming.length === 0 && (
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96" }}>No upcoming events.</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "14px", color: "#0a1628", marginBottom: 12 }}>
                  Due This Month
                </h3>
                {(() => {
                  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
                  const monthAssignments = ASSIGNMENT_EVENTS.filter((e) => e.date.startsWith(monthPrefix));
                  const monthQuizzes = QUIZ_EVENTS.filter((e) => e.date.startsWith(monthPrefix));
                  const pendingAssignments = monthAssignments.filter((e) => e.status === "Not Started" || e.status === "In Progress");
                  const pendingQuizzes = monthQuizzes.filter((e) => e.status === "Not Started" || e.status === "In Progress");
                  return (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#fafafb]">
                        <div className="flex items-center gap-2">
                          <ClipboardList size={14} className="text-[#8e8e96]" />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#5a5a62" }}>Assignments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{pendingAssignments.length}</span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b5" }}>/ {monthAssignments.length}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#fafafb]">
                        <div className="flex items-center gap-2">
                          <HelpCircle size={14} className="text-[#8e8e96]" />
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#5a5a62" }}>Quizzes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{pendingQuizzes.length}</span>
                          <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b5" }}>/ {monthQuizzes.length}</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ─── Event Detail Modal ──────────────────────────────────────── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[440px] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0]">
              <div className="flex items-center gap-2">
                {(() => {
                  const c = eventColor(selectedEvent.type);
                  return (
                    <span className={`w-7 h-7 rounded-md ${c.bg} ${c.text} flex items-center justify-center`}>
                      {eventIcon(selectedEvent.type, 14)}
                    </span>
                  );
                })()}
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>
                  {eventTypeLabel(selectedEvent.type)}
                </p>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-[#8e8e96] hover:text-[#0a1628]"><X size={18} /></button>
            </div>

            <div className="px-6 py-5">
              <h3 style={{ fontFamily: "Inter, sans-serif", fontSize: "16px", fontWeight: 600, color: "#0a1628" }}>
                {selectedEvent.title}
              </h3>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#8e8e96", marginTop: 2 }}>
                {getCourseName(selectedEvent.courseId)}
                {selectedEvent.type === "session" && selectedEvent.cohort && (
                  <span> · {cohortShortLabel(selectedEvent.cohort)}</span>
                )}
              </p>

              {/* Status badge for assignments/quizzes */}
              {selectedEvent.status && (
                <div className="mt-3">
                  {(() => {
                    const sb = statusBadge(selectedEvent.status);
                    return (
                      <span className={`inline-flex px-2 py-1 rounded-md ${sb.bg} ${sb.text}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
                        {selectedEvent.status}
                      </span>
                    );
                  })()}
                </div>
              )}

              <div className="flex flex-col gap-3 mt-4">
                {/* Date */}
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-[#b0b0b5]" />
                  <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62" }}>
                    {new Date(selectedEvent.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>

                {/* Time (sessions) */}
                {selectedEvent.startTime && (
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-[#b0b0b5]" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62" }}>
                      {selectedEvent.startTime}{selectedEvent.endTime && ` – ${selectedEvent.endTime}`}
                    </span>
                  </div>
                )}

                {/* Room (sessions) */}
                {selectedEvent.room && (
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-[#b0b0b5]" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62" }}>
                      {selectedEvent.room}
                    </span>
                  </div>
                )}

                {/* Points (assignments/quizzes) */}
                {selectedEvent.maxPoints && (selectedEvent.type === "assignment" || selectedEvent.type === "quiz") && (
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#b0b0b5]" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62" }}>
                      {selectedEvent.maxPoints} points
                    </span>
                  </div>
                )}

                {/* Quiz specifics */}
                {selectedEvent.type === "quiz" && selectedEvent.questions && (
                  <div className="flex items-center gap-3">
                    <HelpCircle size={16} className="text-[#b0b0b5]" />
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62" }}>
                      {selectedEvent.questions} questions · {selectedEvent.duration}
                    </span>
                  </div>
                )}
              </div>

              {/* Zoom section */}
              {selectedEvent.zoomLink && (
                <div className="mt-5 bg-[rgba(212,165,116,0.08)] border border-[rgba(212,165,116,0.25)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Video size={16} className="text-[#d4a574]" />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>Zoom Meeting</p>
                  </div>
                  {selectedEvent.meetingId && (
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginBottom: 8 }}>
                      Meeting ID: {selectedEvent.meetingId}
                    </p>
                  )}
                  <a
                    href={selectedEvent.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600 }}
                  >
                    <Video size={16} /> Join Zoom Meeting <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Action button for assignments/quizzes */}
              {(selectedEvent.type === "assignment" || selectedEvent.type === "quiz") && (selectedEvent.status === "Not Started" || selectedEvent.status === "In Progress") && (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    navigate(`/student/courses/${selectedEvent.courseId}`);
                  }}
                  className="w-full mt-5 py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  {selectedEvent.type === "assignment" ? "Go to Assignment" : "Go to Quiz"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
