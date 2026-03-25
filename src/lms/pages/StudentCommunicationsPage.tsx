import { useState, useRef, useEffect } from "react";
import {
  Megaphone, MessageSquare, MessageCircle, Plus, Search, Pin, AlertTriangle,
  Send, X, Reply, ChevronDown, User,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort } from "../data/studentEnrollments";
import { courseSelectLabel, courseTitleWithTracks, studentCourseShortLabel } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };
let _c = 1;
const uid = (p = "x") => `${p}-${Date.now()}-${_c++}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) +
  " \u00b7 " + new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const cCode = (id: number | null | undefined) => {
  if (!id) return "";
  const c = COURSES.find((x) => x.id === id);
  return c ? studentCourseShortLabel(c, getStudentEnrollmentCohort(id)) : "";
};

// ─── Types ──────────────────────────────────────────────────────────────────────

type Priority = "normal" | "urgent";

interface Announcement {
  id: string; title: string; body: string; target: "all" | number;
  priority: Priority; createdAt: string; pinned: boolean;
}
interface ChatMsg {
  id: string; from: "instructor" | "student"; name: string; body: string; ts: string;
}
interface Conversation {
  id: string; instructorName: string; courseId: number;
  msgs: ChatMsg[];
  unread: number;
}
interface FReply { id: string; author: string; role: "instructor" | "student"; body: string; ts: string; }
interface FThread {
  id: string; author: string; role: "instructor" | "student"; courseId: number | null;
  title: string; body: string; ts: string; pinned: boolean; replies: FReply[];
}

// ─── Student's enrolled courses (subset)
const ENROLLED_COURSE_IDS = [1, 2, 3]; // FA L1, FA L2, MA L1

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const INIT_ANN: Announcement[] = [
  { id: "a1", title: "May 2025 Exam Dates Confirmed", body: "The ICAG has confirmed the May 2025 sitting dates: May 19\u201323, 2025. Please register with the Institute before the March 31 deadline.\n\nFinal revision classes will be scheduled in the last two weeks of April. Watch this space for timetable updates.", target: "all", priority: "urgent", createdAt: "2026-02-20T09:00:00Z", pinned: true },
  { id: "a2", title: "FA L1 Assignment 3 \u2014 Deadline Extended", body: "Due to the public holiday on Friday, the deadline for FA Level 1 Assignment 3 has been extended to Monday, March 2nd at 11:59 PM. Please use the extra time to review feedback from Assignment 2.", target: 1, priority: "normal", createdAt: "2026-02-18T14:30:00Z", pinned: false },
  { id: "a3", title: "New Study Materials Uploaded", body: "Updated study materials for Weeks 5\u20137 have been uploaded to your respective course pages. This includes revised practice questions for the upcoming mid-semester assessments. Download them from the module section.", target: "all", priority: "normal", createdAt: "2026-02-15T11:00:00Z", pinned: false },
  { id: "a4", title: "Mid-Semester Results Released", body: "Mid-semester results are now live on the Gradebooks page. Students scoring below 50% are strongly encouraged to schedule an office hour session before the final exam.", target: "all", priority: "normal", createdAt: "2026-02-10T16:00:00Z", pinned: false },
  { id: "a5", title: "FA L2 Consolidation Workshop \u2014 Saturday", body: "A special workshop on Consolidated Financial Statements will be held this Saturday, Feb 28, from 10:00 AM \u2013 1:00 PM.\n\nLocation: Room 204, Block B.\n\nTopics: acquisition method, goodwill, minority interests, intercompany eliminations. Strongly recommended for students struggling with the consolidation unit.", target: 2, priority: "urgent", createdAt: "2026-02-22T08:00:00Z", pinned: false },
];

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

const INIT_THREADS: FThread[] = [
  { id: "t1", author: "Prof Mensah Oduro", role: "instructor", courseId: null, title: "Welcome to the ALMS Discussion Forum \u2014 Read First!", body: "Welcome to our course discussion forum. This is your space to ask questions, share insights, and support each other.\n\nGround rules:\n1. Be respectful and constructive\n2. Search before posting \u2014 your question may already be answered\n3. Tag your post with the relevant course if it's course-specific\n4. I check this forum every weekday and respond within 24 hours\n\nLet's have a productive semester!", ts: "2026-02-01T08:00:00Z", pinned: true, replies: [{ id: "r0a", author: "Akosua Mensah", role: "student", body: "Thank you Prof! Looking forward to a great semester.", ts: "2026-02-01T09:15:00Z" }, { id: "r0b", author: "Kwame Acheampong", role: "student", body: "Really appreciate the clear guidelines!", ts: "2026-02-01T10:00:00Z" }] },
  { id: "t2", author: "Akosua Mensah", role: "student", courseId: 1, title: "Good resources for Trial Balance practice?", body: "Looking for extra practice questions for Trial Balance. The textbook examples feel too simple. Any good supplementary resources? Any tips for quickly spotting balancing errors?", ts: "2026-02-20T13:00:00Z", pinned: false, replies: [{ id: "r1a", author: "Kwame Acheampong", role: "student", body: "ICAG 2021\u20132022 past papers have great trial balance questions in Section B.", ts: "2026-02-20T13:45:00Z" }, { id: "r1b", author: "Efua Addai", role: "student", body: "Agreed on past papers! 'AccountingCoach' on YouTube is also great.", ts: "2026-02-20T14:20:00Z" }, { id: "r1c", author: "Prof Mensah Oduro", role: "instructor", body: "I'll upload a 10-exercise practice worksheet to the FA L1 module by end of week. Quick tip: if the difference between debit and credit totals is divisible by 9, you likely have a transposition error.", ts: "2026-02-20T16:00:00Z" }, { id: "r1d", author: "Akosua Mensah", role: "student", body: "The divisibility-by-9 tip is brilliant! Thank you Prof!", ts: "2026-02-20T16:30:00Z" }] },
  { id: "t3", author: "Abena Boateng", role: "student", courseId: 2, title: "Clarification on Minority Interest calculation method", body: "The consolidation worksheet example 3 uses a different approach to NCI than the lecture slides. Which method should we use in the exam \u2014 proportionate share of net assets, or the full goodwill method?", ts: "2026-02-19T10:00:00Z", pinned: false, replies: [{ id: "r2a", author: "Nana Osei", role: "student", body: "Same confusion here. Worksheet uses NCI at fair value but slides use proportionate share.", ts: "2026-02-19T11:00:00Z" }, { id: "r2b", author: "Prof Mensah Oduro", role: "instructor", body: "Good catch \u2014 the ICAG syllabus requires you to know BOTH methods. The exam will specify which to use. Worksheet follows IFRS 3 (full goodwill). I'll do a side-by-side in Thursday's class.", ts: "2026-02-19T14:00:00Z" }, { id: "r2c", author: "Abena Boateng", role: "student", body: "Very helpful, thank you Prof! Looking forward to Thursday.", ts: "2026-02-19T14:30:00Z" }] },
  { id: "t4", author: "Efua Addai", role: "student", courseId: null, title: "Study group for May 2025 sitting \u2014 who's in?", body: "Organising a study group for the May 2025 ICAG sitting. Meeting every Saturday 3\u20135 PM at the library, Study Room 2. All levels welcome \u2014 currently 6 people. Reply with which subjects you're covering!", ts: "2026-02-18T09:00:00Z", pinned: false, replies: [{ id: "r3a", author: "Kwame Acheampong", role: "student", body: "I'm in! FA L1 and MA L1.", ts: "2026-02-18T09:30:00Z" }, { id: "r3b", author: "Kofi Asante", role: "student", body: "Count me in for MA L1 and TAX L1.", ts: "2026-02-18T10:00:00Z" }, { id: "r3c", author: "Yaw Darko", role: "student", body: "AUD L1 here. Should we create a WhatsApp group?", ts: "2026-02-18T11:15:00Z" }, { id: "r3d", author: "Prof Mensah Oduro", role: "instructor", body: "Wonderful initiative! I'll share revision topic lists for each subject in the announcements. Keep up the collaborative spirit!", ts: "2026-02-18T12:00:00Z" }, { id: "r3e", author: "Nana Osei", role: "student", body: "FA L2 here \u2014 Saturday works perfectly!", ts: "2026-02-18T14:00:00Z" }] },
  { id: "t5", author: "Kwabena Frimpong", role: "student", courseId: 3, title: "Week 3 lecture video \u2014 audio cuts out at 22 minutes", body: "The Week 3 MA L1 video on Absorption Costing has an audio issue \u2014 it cuts out from ~22:00 to 26:30. Missed the overhead allocation explanation. Anyone else experiencing this?", ts: "2026-02-21T20:00:00Z", pinned: false, replies: [{ id: "r4a", author: "Kofi Asante", role: "student", body: "Yes, noticed this too \u2014 had to skip that section.", ts: "2026-02-21T20:30:00Z" }, { id: "r4b", author: "Prof Mensah Oduro", role: "instructor", body: "Thanks for flagging this. I've reported it to the platform team. I'll record a 10-minute explainer on overhead allocation by tomorrow. Apologies for the inconvenience!", ts: "2026-02-22T08:30:00Z" }] },
  { id: "t6", author: "Kojo Manu", role: "student", courseId: 1, title: "Best approach for Suspense Account questions?", body: "I keep getting confused on suspense account correction entries. When there's an error of commission vs error of principle, I mix up which side to adjust. Any tips or mnemonics?", ts: "2026-02-23T09:00:00Z", pinned: false, replies: [{ id: "r5a", author: "Akosua Mensah", role: "student", body: "Error of commission = right class, wrong account. Error of principle = wrong class entirely. Try remembering 'Commission = Correct class'", ts: "2026-02-23T10:15:00Z" }, { id: "r5b", author: "Prof Mensah Oduro", role: "instructor", body: "Great mnemonic from Akosua. Also: suspense accounts only arise from errors that affect the trial balance. Errors of commission and principle do NOT affect the trial balance, so no suspense entry needed for those. Focus on: transposition, casting, single-entry, and omission from one account.", ts: "2026-02-23T12:00:00Z" }] },
];

// ─── Shared ─────────────────────────────────────────────────────────────────────

function RoleBadge({ role, author }: { role: "instructor" | "student", author?: string }) {
  const isMe = author === "Kojo Manu";
  return (
    <span
      className={role === "instructor" ? "bg-[#5a5a62] text-white" : (isMe ? "bg-[#d4a574]/20 text-[#d4a574]" : "bg-gray-100 text-[#6c6c6c]")}
      style={{ ...S, fontSize: "9px", fontWeight: 700, padding: "2px 6px", display: "inline-block" }}
    >
      {role === "instructor" ? "Instructor" : (isMe ? "You" : "Student")}
    </span>
  );
}

const LABEL_STYLE = { ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const INPUT_CLS = "w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#d4a574] transition-colors";

// ─── Announcements Tab (Read-only for students) ─────────────────────────────────

function AnnouncementsTab() {
  const [selId, setSelId] = useState<string | null>(INIT_ANN[0].id);
  const [search, setSearch] = useState("");

  // Filter to show only announcements relevant to student's enrolled courses
  const relevant = INIT_ANN.filter(a => a.target === "all" || ENROLLED_COURSE_IDS.includes(a.target as number));

  const filtered = [...relevant]
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sel = relevant.find(a => a.id === selId);

  return (
    <div className="flex h-[560px]">
      {/* Left */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg outline-none bg-[#f9f9f9] focus:border-[#d4a574] transition-colors" style={{ ...S, fontSize: "12px" }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(a => (
            <button key={a.id} onClick={() => setSelId(a.id)}
              className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${selId === a.id ? "bg-[rgba(212,165,116,0.06)] border-l-2 border-l-[#d4a574]" : "hover:bg-gray-50 border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {a.pinned && <Pin size={10} className="text-[#d4a574] flex-shrink-0" />}
                  <span className="truncate" style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#3a3a42" }}>{a.title}</span>
                </div>
                {a.priority === "urgent" && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-[#f0ece6] text-[#a68b5b] rounded" style={{ ...S, fontSize: "9px", fontWeight: 700 }}>URGENT</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.5 bg-gray-100 text-[#5a5a62] rounded" style={{ ...S, fontSize: "9px", fontWeight: 700 }}>
                  {a.target === "all" ? "All Students" : cCode(a.target as number)}
                </span>
                <span style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>{fmtDate(a.createdAt)}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-6 text-center" style={{ ...S, fontSize: "12px", color: "#b0b0b5" }}>No announcements found</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {sel ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {sel.priority === "urgent" && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#f0ece6] text-[#a68b5b] rounded" style={{ ...S, fontSize: "10px", fontWeight: 700 }}><AlertTriangle size={10} /> URGENT</span>
                )}
                <span className="px-2 py-0.5 bg-gray-100 text-[#5a5a62] rounded" style={{ ...S, fontSize: "10px", fontWeight: 700 }}>
                  {sel.target === "all" ? "All Students" : cCode(sel.target as number)}
                </span>
                {sel.pinned && <span className="flex items-center gap-1 text-[#d4a574]" style={{ ...S, fontSize: "10px" }}><Pin size={10} /> Pinned</span>}
              </div>
              <h2 style={{ ...S, fontSize: "17px", fontWeight: 700, color: "#3a3a42" }}>{sel.title}</h2>
              <p style={{ ...S, fontSize: "11px", color: "#b0b0b5", marginTop: 3 }}>Prof Mensah Oduro \u00b7 {fmtFull(sel.createdAt)}</p>
            </div>
            <div className="bg-[#fafafb] border border-[#ededf0] rounded-xl p-5">
              <p style={{ ...S, fontSize: "14px", color: "#3a3a42", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{sel.body}</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <Megaphone size={36} className="text-gray-200" />
            <p style={{ ...S, fontSize: "13px", color: "#b0b0b5" }}>Select an announcement to read</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Messages Tab ───────────────────────────────────────────────────────────────

function MessagesTab({ newMode, onDismiss }: { newMode: boolean; onDismiss: () => void }) {
  const [convs, setConvs] = useState<Conversation[]>(INIT_CONVS);
  const [selId, setSelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [newCourse, setNewCourse] = useState<number | "">("");
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (existing) {
      setConvs(p => p.map(c => c.id === existing.id ? { ...c, msgs: [...c.msgs, firstMsg] } : c));
      setSelId(existing.id);
    } else {
      const course = COURSES.find(c => c.id === courseId);
      const newConv: Conversation = { id: uid("conv"), instructorName: course?.instructor ?? "Instructor", courseId, msgs: [firstMsg], unread: 0 };
      setConvs(p => [newConv, ...p]);
      setSelId(newConv.id);
    }
    setNewCourse(""); setNewMsg("");
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
              {newCourse && <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 4 }}>Message will be sent to {COURSES.find(c => c.id === Number(newCourse))?.instructor}</p>}
            </div>
            <div className="mb-5">
              <p style={LABEL_STYLE} className="mb-1.5">Message</p>
              <textarea autoFocus rows={5} value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Write your message..." className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleStartConv} disabled={!newCourse || !newMsg.trim()} className="flex items-center gap-2 px-5 py-2 bg-[#5a5a62] text-white rounded-lg hover:bg-[#4a4a52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
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

// ─── Forum Tab ──────────────────────────────────────────────────────────────────

function ForumTab({ createMode, onDismiss }: { createMode: boolean; onDismiss: () => void }) {
  const [threads, setThreads] = useState<FThread[]>(INIT_THREADS);
  const [selId, setSelId] = useState<string | null>(INIT_THREADS[0].id);
  const [search, setSearch] = useState("");
  const [courseF, setCourseF] = useState<number | "all">("all");
  const [reply, setReply] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [fBody, setFBody] = useState("");
  const [fCourse, setFCourse] = useState<number | null>(null);

  useEffect(() => { if (createMode) setSelId(null); }, [createMode]);

  const filtered = [...threads]
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) && (courseF === "all" || t.courseId === courseF))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      const aLast = a.replies.length ? a.replies[a.replies.length - 1].ts : a.ts;
      const bLast = b.replies.length ? b.replies[b.replies.length - 1].ts : b.ts;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    });

  const sel = threads.find(t => t.id === selId);

  const handleReply = () => {
    if (!reply.trim() || !selId) return;
    const r: FReply = { id: uid("r"), author: "Kojo Manu", role: "student", body: reply.trim(), ts: new Date().toISOString() };
    setThreads(p => p.map(t => t.id === selId ? { ...t, replies: [...t.replies, r] } : t));
    setReply("");
  };

  const handlePost = () => {
    if (!fTitle.trim() || !fBody.trim()) return;
    const t: FThread = { id: uid("t"), author: "Kojo Manu", role: "student", courseId: fCourse, title: fTitle.trim(), body: fBody.trim(), ts: new Date().toISOString(), pinned: false, replies: [] };
    setThreads(p => [t, ...p]);
    setSelId(t.id);
    setFTitle(""); setFBody(""); setFCourse(null);
    onDismiss();
  };

  return (
    <div className="flex h-[560px]">
      {/* Left */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0 flex flex-col gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search threads..." className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg outline-none bg-[#f9f9f9] focus:border-[#d4a574] transition-colors" style={{ ...S, fontSize: "12px" }} />
          </div>
          <select value={courseF === "all" ? "all" : String(courseF)} onChange={e => setCourseF(e.target.value === "all" ? "all" : Number(e.target.value))} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white focus:border-[#d4a574] transition-colors" style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
            <option value="all">All courses</option>
            {ENROLLED_COURSE_IDS.map((id) => {
              const c = COURSES.find((cr) => cr.id === id);
              return c ? (
                <option key={c.id} value={c.id}>
                  {studentCourseShortLabel(c, getStudentEnrollmentCohort(c.id))}
                </option>
              ) : null;
            })}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(t => {
            const lastAct = t.replies.length ? t.replies[t.replies.length - 1].ts : t.ts;
            const hasInstrReply = t.role === "instructor" || t.replies.some(r => r.role === "instructor");
            return (
              <button key={t.id} onClick={() => { setSelId(t.id); onDismiss(); }}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${selId === t.id && !createMode ? "bg-[rgba(212,165,116,0.06)] border-l-2 border-l-[#d4a574]" : "hover:bg-gray-50 border-l-2 border-l-transparent"}`}
              >
                <div className="flex items-start gap-1.5">
                  {t.pinned && <Pin size={10} className="text-[#d4a574] mt-0.5 flex-shrink-0" />}
                  <span className="flex-1 min-w-0 text-left" style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#3a3a42", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.title}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <RoleBadge role={t.role} author={t.author} />
                  {t.courseId && <span className="px-1.5 py-0.5 bg-gray-100 text-[#5a5a62] rounded" style={{ ...S, fontSize: "9px", fontWeight: 600 }}>{cCode(t.courseId)}</span>}
                  {hasInstrReply && t.role !== "instructor" && <span className="px-1.5 py-0.5 bg-[#d4a574]/20 text-[#5a5a62] rounded" style={{ ...S, fontSize: "9px", fontWeight: 700 }}>Replied {"\u2713"}</span>}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Reply size={9} className="text-gray-300" />
                  <span style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>{t.replies.length} replies \u00b7 {fmtDate(lastAct)}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="p-6 text-center" style={{ ...S, fontSize: "12px", color: "#b0b0b5" }}>No threads found</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {createMode ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#3a3a42" }}>New Thread</h3>
              <button onClick={onDismiss} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={14} className="text-[#6c6c6c]" /></button>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Course Tag <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
              <select value={fCourse === null ? "null" : String(fCourse)} onChange={e => setFCourse(e.target.value === "null" ? null : Number(e.target.value))} className={`${INPUT_CLS} bg-white`} style={{ ...S, fontSize: "13px" }}>
                <option value="null">General (no specific course)</option>
                {ENROLLED_COURSE_IDS.map((id) => {
                  const c = COURSES.find((cr) => cr.id === id);
                  return c ? (
                    <option key={c.id} value={c.id}>
                      {courseSelectLabel(c)}
                    </option>
                  ) : null;
                })}
              </select>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Thread Title</p>
              <input autoFocus value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="What's this thread about?" className={INPUT_CLS} style={{ ...S, fontSize: "13px" }} />
            </div>
            <div className="mb-6">
              <p style={LABEL_STYLE} className="mb-1.5">Body</p>
              <textarea rows={6} value={fBody} onChange={e => setFBody(e.target.value)} placeholder="Share your question, insight, or resource..." className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
            </div>
            <div className="flex gap-3">
              <button onClick={handlePost} disabled={!fTitle.trim() || !fBody.trim()} className="flex items-center gap-2 px-5 py-2 bg-[#5a5a62] text-white rounded-lg hover:bg-[#4a4a52] disabled:opacity-40 disabled:cursor-not-allowed transition-colors" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
                <MessageCircle size={13} /> Post Thread
              </button>
              <button onClick={onDismiss} className="px-5 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" style={{ ...S, fontSize: "13px" }}>Cancel</button>
            </div>
          </div>
        ) : sel ? (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Original post */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {sel.pinned && <span className="flex items-center gap-1 text-[#d4a574]" style={{ ...S, fontSize: "10px" }}><Pin size={10} /> Pinned</span>}
                  {sel.courseId && <span className="px-1.5 py-0.5 bg-gray-100 text-[#5a5a62] rounded" style={{ ...S, fontSize: "10px", fontWeight: 700 }}>{cCode(sel.courseId)}</span>}
                  <RoleBadge role={sel.role} author={sel.author} />
                </div>
                <h2 style={{ ...S, fontSize: "16px", fontWeight: 700, color: "#3a3a42" }}>{sel.title}</h2>
                <p style={{ ...S, fontSize: "11px", color: "#b0b0b5", marginTop: 2 }}>{sel.author} \u00b7 {fmtFull(sel.ts)}</p>
                <div className="bg-[#fafafb] border border-[#ededf0] rounded-xl p-4 mt-3">
                  <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{sel.body}</p>
                </div>
              </div>

              {/* Replies */}
              {sel.replies.length > 0 && (
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
                  <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#b0b0b5", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {sel.replies.length} {sel.replies.length === 1 ? "Reply" : "Replies"}
                  </span>
                  {sel.replies.map(r => (
                    <div key={r.id} className={`pl-4 border-l-2 ${r.role === "instructor" ? "border-[#d4a574]" : "border-gray-200"}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <RoleBadge role={r.role} author={r.author} />
                        <span style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#3a3a42" }}>{r.author}</span>
                        <span style={{ ...S, fontSize: "10px", color: "#b0b0b5" }}>{fmtFull(r.ts)}</span>
                      </div>
                      <p style={{ ...S, fontSize: "13px", color: "#3a3a42", lineHeight: 1.7 }}>{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply compose */}
            <div className="flex-shrink-0 border-t border-gray-100 p-3 flex items-end gap-2 bg-white">
              <textarea rows={2} value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="Write a reply... (Enter to post)"
                className="flex-1 border border-gray-200 px-3 py-2 outline-none focus:border-[#d4a574] resize-none transition-colors"
                style={{ ...S, fontSize: "13px", borderRadius: "8px" }} />
              <button onClick={handleReply} disabled={!reply.trim()} className="w-9 h-9 bg-[#5a5a62] flex items-center justify-center hover:bg-[#4a4a52] disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 transition-colors" style={{ borderRadius: "8px" }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageCircle size={36} className="text-gray-200" />
            <p style={{ ...S, fontSize: "13px", color: "#b0b0b5" }}>Select a thread to read the discussion</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

type TabId = "announcements" | "messages" | "forum";

export function StudentCommunicationsPage() {
  const [tab, setTab] = useState<TabId>("announcements");
  const [msgNew, setMsgNew] = useState(false);
  const [forumCreate, setForumCreate] = useState(false);

  const switchTab = (t: TabId) => {
    setTab(t);
    setMsgNew(false);
    setForumCreate(false);
  };

  const tabs: { id: TabId; label: string; Icon: React.ElementType; badge?: number }[] = [
    { id: "announcements", label: "Announcements", Icon: Megaphone, badge: 2 },
    { id: "messages",      label: "Messages",      Icon: MessageSquare, badge: 2 },
    { id: "forum",         label: "Discussion Forum", Icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Communications" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>Communications</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                Announcements, messages, and discussion forum
              </p>
            </div>
            <div>
              {tab === "messages" && (
                <button onClick={() => setMsgNew(true)} className="flex items-center gap-2 px-4 h-9 bg-[#5a5a62] text-white rounded-lg hover:bg-[#4a4a52] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                  <Plus size={13} /> New Message
                </button>
              )}
              {tab === "forum" && (
                <button onClick={() => setForumCreate(true)} className="flex items-center gap-2 px-4 h-9 bg-[#5a5a62] text-white rounded-lg hover:bg-[#4a4a52] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                  <Plus size={13} /> New Thread
                </button>
              )}
            </div>
          </div>

          {/* Content card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              {tabs.map(t => (
                <button key={t.id} onClick={() => switchTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 border-b-2 transition-colors ${tab === t.id ? "border-[#d4a574] text-[#3a3a42]" : "border-transparent text-[#6c6c6c] hover:text-[#3a3a42]"}`}
                >
                  <t.Icon size={14} />
                  <span style={{ ...S, fontSize: "13px", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
                  {t.badge && (
                    <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#3a3a42" }}>{t.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {tab === "announcements" && <AnnouncementsTab />}
            {tab === "messages"      && <MessagesTab newMode={msgNew} onDismiss={() => setMsgNew(false)} />}
            {tab === "forum"         && <ForumTab createMode={forumCreate} onDismiss={() => setForumCreate(false)} />}
          </div>
        </main>
      </div>
    </div>
  );
}
