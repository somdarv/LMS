import { useMemo, useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  MessageSquare, Plus, Search,
  Send, X, User,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort } from "../data/studentEnrollments";
import { courseSelectLabel, courseTitleWithTracks, studentCourseShortLabel } from "../lib/courseLabels";
import { getAllCourseStudents } from "../data/students";

const S = { fontFamily: "Inter, sans-serif" };
let _c = 1;
const uid = (p = "x") => `${p}-${Date.now()}-${_c++}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ChatMsg {
  id: string; from: "instructor" | "student"; name: string; body: string; ts: string;
}
interface Conversation {
  id: string; instructorName: string; courseId: number;
  msgs: ChatMsg[];
  unread: number;
}

// â”€â”€â”€ Student's enrolled courses (subset)
const ENROLLED_COURSE_IDS = [1, 2, 3]; // FA L1, FA L2, MA L1

// â”€â”€â”€ Mock Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const INIT_CONVS: Conversation[] = [
  {
    id: "c1", instructorName: "Prof Mensah Oduro", courseId: 1, unread: 1,
    msgs: [
      { id: "m1", from: "student", name: "Kojo Manu", body: "Good morning Professor. I have a question about the treatment of accruals in the trial balance. Should we include them as adjustments or as separate line items?", ts: "2026-02-22T09:15:00Z" },
      { id: "m2", from: "instructor", name: "Prof Mensah Oduro", body: "Great question, Kojo. The treatment of accruals depends on the format required. In the adjusted trial balance, they appear as adjustments. In the final financial statements, they are separate line items. Review Chapter 5 for detailed examples.", ts: "2026-02-22T10:30:00Z" },
    ],
  },
  {
    id: "c2", instructorName: "Prof Mensah Oduro", courseId: 3, unread: 0,
    msgs: [
      { id: "m3", from: "student", name: "Kojo Manu", body: "Professor, regarding the Cost Analysis case study, should we use the FIFO or weighted average method for inventory valuation?", ts: "2026-02-21T14:00:00Z" },
      { id: "m4", from: "instructor", name: "Prof Mensah Oduro", body: "Use the weighted average method for this particular case study. The question specifies 'standard costing' which aligns better with weighted average.", ts: "2026-02-21T15:15:00Z" },
      { id: "m5", from: "student", name: "Kojo Manu", body: "Thank you for the clarification, Professor.", ts: "2026-02-21T15:20:00Z" },
    ],
  },
  {
    id: "c3", instructorName: "Prof Mensah Oduro", courseId: 2, unread: 1,
    msgs: [
      { id: "m6", from: "student", name: "Kojo Manu", body: "Professor, I'm struggling with the minority interest calculation in consolidated statements. Could you point me to additional resources?", ts: "2026-02-25T11:00:00Z" },
      { id: "m7", from: "instructor", name: "Prof Mensah Oduro", body: "The consolidation workings are available in the Week 3 module materials. I've also uploaded an additional PDF guide. Focus on the proportional method first before moving to the equity method.", ts: "2026-02-25T14:30:00Z" },
    ],
  },
];

const LABEL_STYLE = { ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const INPUT_CLS = "w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#d4a574] transition-colors";

// â”€â”€â”€ Messages Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MessagesTab({
  newMode,
  onDismiss,
  prefill,
}: {
  newMode: boolean;
  onDismiss: () => void;
  prefill?: { courseId: number | null; mode: "instructor" | "student" | "all_students" | null; studentId: number | null };
}) {
  const [convs, setConvs] = useState<Conversation[]>(INIT_CONVS);
  const [selId, setSelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [newCourse, setNewCourse] = useState<number | "">("");
  const [newRecipient, setNewRecipient] = useState<"instructor" | "student" | "all_students">("instructor");
  const [newStudentId, setNewStudentId] = useState<number | "">("");
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!newMode) return;
    if (prefill?.courseId) setNewCourse(prefill.courseId);
    if (prefill?.mode) setNewRecipient(prefill.mode);
    if (prefill?.studentId) setNewStudentId(prefill.studentId);
  }, [newMode, prefill?.courseId, prefill?.mode, prefill?.studentId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selId, convs]);

  const handleSelect = (id: string) => {
    setSelId(id);
    onDismiss();
    setConvs(p => p.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleSend = () => {
    if (!draft.trim() || !selId) return;
    const msg: ChatMsg = { id: uid("m"), from: "student", name: "Kojo Manu", body: draft.trim(), ts: new Date().toISOString() };
    setConvs(p => p.map(c => c.id === selId ? { ...c, msgs: [...c.msgs, msg] } : c));
    setDraft("");
  };

  const handleStartConv = () => {
    if (!newCourse || !newMsg.trim()) return;
    const courseId = Number(newCourse);
    const existing = convs.find(c => c.courseId === courseId);
    const firstMsg: ChatMsg = { id: uid("m"), from: "student", name: "Kojo Manu", body: newMsg.trim(), ts: new Date().toISOString() };
    if (newRecipient === "instructor") {
      if (existing) {
        setConvs(p => p.map(c => c.id === existing.id ? { ...c, msgs: [...c.msgs, firstMsg] } : c));
        setSelId(existing.id);
      } else {
        const course = COURSES.find(c => c.id === courseId);
        const newConv: Conversation = { id: uid("conv"), instructorName: course?.instructor ?? "Instructor", courseId, msgs: [firstMsg], unread: 0 };
        setConvs(p => [newConv, ...p]);
        setSelId(newConv.id);
      }
    } else if (newRecipient === "student") {
      if (!newStudentId) return;
      const sid = Number(newStudentId);
      const student = getAllCourseStudents([courseId], getStudentEnrollmentCohort(courseId)).find((s) => s.id === sid);
      const label = student ? student.name : "Student";
      const convId = `stu-${courseId}-${sid}`;
      const existingStu = convs.find((c) => c.id === convId);
      if (existingStu) {
        setConvs((p) => p.map((c) => c.id === convId ? { ...c, msgs: [...c.msgs, firstMsg] } : c));
        setSelId(convId);
      } else {
        const newConv: Conversation = { id: convId, instructorName: label, courseId, msgs: [firstMsg], unread: 0 };
        setConvs((p) => [newConv, ...p]);
        setSelId(convId);
      }
    } else {
      const label = "Broadcast (All Students)";
      const convId = `broadcast-${courseId}`;
      const existingB = convs.find((c) => c.id === convId);
      const broadcastMsg: ChatMsg = { ...firstMsg, body: `[Broadcast] ${firstMsg.body}` };
      if (existingB) {
        setConvs((p) => p.map((c) => c.id === convId ? { ...c, msgs: [...c.msgs, broadcastMsg] } : c));
        setSelId(convId);
      } else {
        const newConv: Conversation = { id: convId, instructorName: label, courseId, msgs: [broadcastMsg], unread: 0 };
        setConvs((p) => [newConv, ...p]);
        setSelId(convId);
      }
    }

    setNewCourse(""); setNewMsg(""); setNewStudentId("");
    onDismiss();
  };

  const filtered = convs.filter((c) => {
    const cr = COURSES.find((x) => x.id === c.courseId);
    const label = cr ? courseTitleWithTracks(cr) : "";
    return (
      c.instructorName.toLowerCase().includes(search.toLowerCase()) ||
      label.toLowerCase().includes(search.toLowerCase())
    );
  });
  const sel = convs.find(c => c.id === selId);
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-[560px]">
      {/* Left */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg outline-none bg-[#f9f9f9] focus:border-[#d4a574] transition-colors" style={{ ...S, fontSize: "12px" }} />
          </div>
        </div>
        {totalUnread > 0 && (
          <div className="px-3 py-1.5 bg-[#d4a574]/10 border-b border-[#d4a574]/20 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#3a3a42" }}>{totalUnread}</span>
            <span style={{ ...S, fontSize: "11px", color: "#5a5a62" }}>unread messages</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => {
            const last = c.msgs[c.msgs.length - 1];
            const course = COURSES.find(cr => cr.id === c.courseId);
            return (
              <button key={c.id} onClick={() => handleSelect(c.id)}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${selId === c.id && !newMode ? "bg-[rgba(212,165,116,0.06)] border-l-2 border-l-[#d4a574]" : "hover:bg-gray-50 border-l-2 border-l-transparent"}`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#6c6c6c] flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate" style={{ ...S, fontSize: "12px", fontWeight: c.unread > 0 ? 700 : 500, color: "#3a3a42" }}>{c.instructorName}</span>
                      <span style={{ ...S, fontSize: "10px", color: "#b0b0b5", flexShrink: 0 }}>{last ? fmtDate(last.ts) : ""}</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-gray-100 text-[#5a5a62] rounded" style={{ ...S, fontSize: "9px", fontWeight: 600 }}>
                      {course ? studentCourseShortLabel(course, getStudentEnrollmentCohort(course.id)) : ""}
                    </span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="truncate" style={{ ...S, fontSize: "11px", color: c.unread > 0 ? "#3a3a42" : "#6c6c6c", fontWeight: c.unread > 0 ? 500 : 400 }}>
                        {last?.from === "student" ? "You: " : ""}{last?.body}
                      </span>
                      {c.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center flex-shrink-0" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#3a3a42" }}>{c.unread}</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {newMode ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#3a3a42" }}>New Message</h3>
              <button onClick={onDismiss} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={14} className="text-[#6c6c6c]" /></button>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Course</p>
              <select value={newCourse} onChange={e => setNewCourse(e.target.value === "" ? "" : Number(e.target.value))} className={`${INPUT_CLS} bg-white`} style={{ ...S, fontSize: "13px" }}>
                <option value="">Select a course...</option>
                {ENROLLED_COURSE_IDS.map((id) => {
                  const c = COURSES.find((cr) => cr.id === id);
                  return c ? (
                    <option key={c.id} value={c.id}>
                      {courseSelectLabel(c)}
                    </option>
                  ) : null;
                })}
              </select>
              <div className="mt-3">
                <p style={LABEL_STYLE} className="mb-1.5">Recipient</p>
                <select
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value as any)}
                  className={`${INPUT_CLS} bg-white`}
                  style={{ ...S, fontSize: "13px" }}
                >
                  <option value="instructor">Instructor / Lecturer</option>
                  <option value="student">Student (direct message)</option>
                  <option value="all_students">Broadcast to all students</option>
                </select>
                {newCourse && newRecipient === "instructor" && (
                  <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 4 }}>
                    Message will be sent to {COURSES.find(c => c.id === Number(newCourse))?.instructor}
                  </p>
                )}
                {newCourse && newRecipient === "student" && (
                  <div className="mt-2">
                    <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginBottom: 6 }}>
                      Select a classmate to message.
                    </p>
                    <select
                      value={newStudentId}
                      onChange={(e) => setNewStudentId(e.target.value === "" ? "" : Number(e.target.value))}
                      className={`${INPUT_CLS} bg-white`}
                      style={{ ...S, fontSize: "13px" }}
                    >
                      <option value="">Select student...</option>
                      {newCourse &&
                        getAllCourseStudents([Number(newCourse)], getStudentEnrollmentCohort(Number(newCourse))).slice(0, 80).map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                    </select>
                    <p style={{ ...S, fontSize: "10px", color: "#b0b0b5", marginTop: 4 }}>
                      Showing first 80 students for demo.
                    </p>
                  </div>
                )}
                {newCourse && newRecipient === "all_students" && (
                  <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 4 }}>
                    Broadcast will be visible as a â€œBroadcastâ€ thread in your messages.
                  </p>
                )}
              </div>
            </div>
            <div className="mb-5">
              <p style={LABEL_STYLE} className="mb-1.5">Message</p>
              <textarea autoFocus rows={5} value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Write your message..." className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleStartConv}
                disabled={!newCourse || !newMsg.trim() || (newRecipient === "student" && !newStudentId)}
                className="flex items-center gap-2 px-5 py-2 bg-[#5a5a62] text-white rounded-lg hover:bg-[#4a4a52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ ...S, fontSize: "13px", fontWeight: 600 }}
              >
                <Send size={13} /> Send Message
              </button>
              <button onClick={onDismiss} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" style={{ ...S, fontSize: "13px" }}>Cancel</button>
            </div>
          </div>
        ) : sel ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-[#6c6c6c] flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              <div>
                <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#3a3a42" }}>{sel.instructorName}</p>
                <p style={{ ...S, fontSize: "11px", color: "#d4a574" }}>
                  {(() => {
                    const c = COURSES.find((x) => x.id === sel.courseId);
                    return c ? courseTitleWithTracks(c) : "";
                  })()}
                </p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#fafafa]">
              {sel.msgs.map(msg => {
                const isMe = msg.from === "student";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-3.5 py-2 ${isMe ? "bg-[#5a5a62] text-white" : "bg-white border border-gray-200 text-[#3a3a42]"}`}
                        style={{ ...S, fontSize: "13px", lineHeight: 1.5, borderRadius: "10px", ...(isMe ? { borderBottomRightRadius: "3px" } : { borderBottomLeftRadius: "3px" }) }}>
                        {msg.body}
                      </div>
                      <span style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>
                        {fmtDate(msg.ts)}
                        {isMe && <span className="ml-1 text-[#d4a574]">{"\u2713\u2713"}</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 border-t border-gray-100 p-3 flex items-end gap-2 bg-white">
              <textarea rows={2} value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                className="flex-1 border border-gray-200 px-3 py-2 outline-none focus:border-[#d4a574] resize-none transition-colors"
                style={{ ...S, fontSize: "13px", borderRadius: "8px" }} />
              <button onClick={handleSend} disabled={!draft.trim()} className="w-9 h-9 bg-[#5a5a62] flex items-center justify-center hover:bg-[#4a4a52] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-colors" style={{ borderRadius: "8px" }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageSquare size={36} className="text-gray-200" />
            <p style={{ ...S, fontSize: "13px", color: "#b0b0b5" }}>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export function StudentCommunicationsPage() {
  const [msgNew, setMsgNew] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("compose") === "1") {
      setMsgNew(true);
    }
  }, [searchParams]);

  const composePrefill = useMemo(() => {
    const courseId = searchParams.get("courseId");
    const mode = searchParams.get("mode");
    const studentId = searchParams.get("studentId");
    return {
      courseId: courseId ? Number(courseId) : null,
      mode: (mode === "broadcast" ? "all_students" : mode === "dm" ? "student" : null) as "instructor" | "student" | "all_students" | null,
      studentId: studentId ? Number(studentId) : null,
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Messages" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>Messages</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                Your inbox for private conversations and course messages
              </p>
            </div>
            <button onClick={() => setMsgNew(true)} className="flex items-center gap-2 px-4 h-9 bg-[#5a5a62] text-white rounded-lg hover:bg-[#4a4a52] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
              <Plus size={13} /> New Message
            </button>
          </div>

          {/* Content card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-[#d4a574] text-[#3a3a42]">
                <MessageSquare size={14} />
                <span style={{ ...S, fontSize: "13px", fontWeight: 700 }}>Messages</span>
                <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#3a3a42" }}>2</span>
              </div>
            </div>

            <MessagesTab
              newMode={msgNew}
              onDismiss={() => setMsgNew(false)}
              prefill={composePrefill}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
