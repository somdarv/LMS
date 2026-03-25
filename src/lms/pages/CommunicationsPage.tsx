import { useState, useRef, useEffect } from "react";
import {
  Megaphone, MessageSquare, MessageCircle, Plus, Search, Pin, AlertTriangle,
  Send, X, Eye, Trash2, Reply, ChevronDown,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseSelectLabel, courseShortWithTracks, courseTitleWithTracks } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };
let _c = 1;
const uid = (p = "x") => `${p}-${Date.now()}-${_c++}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
const fmtFull = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) +
  " · " + new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
const cCode = (id: number | null | undefined) =>
  id
    ? (() => {
        const c = COURSES.find((x) => x.id === id);
        return c ? courseShortWithTracks(c) : "";
      })()
    : "";
const tLabel = (t: "all" | number) => (t === "all" ? "All Students" : cCode(t));
const tTotal = (t: "all" | number) =>
  t === "all" ? COURSES.reduce((s, c) => s + c.students, 0) : (COURSES.find(c => c.id === t)?.students ?? 0);

// ─── Types ─────────────────────────────────────────────────────────────────────

type Priority = "normal" | "urgent";

interface Announcement {
  id: string; title: string; body: string; target: "all" | number;
  priority: Priority; createdAt: string; pinned: boolean; readCount: number; total: number;
}
interface ChatMsg {
  id: string; from: "instructor" | "student"; name: string; body: string; ts: string; read: boolean;
}
interface Conversation {
  id: string; studentId: string; studentName: string; courseId: number;
  initials: string; color: string; msgs: ChatMsg[]; unread: number;
}
interface FReply { id: string; author: string; role: "instructor" | "student"; body: string; ts: string; }
interface FThread {
  id: string; author: string; role: "instructor" | "student"; courseId: number | null;
  title: string; body: string; ts: string; pinned: boolean; replies: FReply[];
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const INIT_ANN: Announcement[] = [
  { id: "a1", title: "May 2025 Exam Dates Confirmed", body: "The ICAG has confirmed the May 2025 sitting dates: May 19–23, 2025. Please register with the Institute before the March 31 deadline.\n\nFinal revision classes will be scheduled in the last two weeks of April. Watch this space for timetable updates.", target: "all", priority: "urgent", createdAt: "2026-02-20T09:00:00Z", pinned: true, readCount: 87, total: 175 },
  { id: "a2", title: "FA L1 Assignment 3 — Deadline Extended", body: "Due to the public holiday on Friday, the deadline for FA Level 1 Assignment 3 has been extended to Monday, March 2nd at 11:59 PM. Please use the extra time to review feedback from Assignment 2.", target: 1, priority: "normal", createdAt: "2026-02-18T14:30:00Z", pinned: false, readCount: 39, total: 42 },
  { id: "a3", title: "New Study Materials Uploaded", body: "Updated study materials for Weeks 5–7 have been uploaded to your respective course pages. This includes revised practice questions for the upcoming mid-semester assessments. Download them from the module section.", target: "all", priority: "normal", createdAt: "2026-02-15T11:00:00Z", pinned: false, readCount: 142, total: 175 },
  { id: "a4", title: "Mid-Semester Results Released", body: "Mid-semester results are now live on the Gradebooks page. Students scoring below 50% are strongly encouraged to schedule an office hour session before the final exam.", target: "all", priority: "normal", createdAt: "2026-02-10T16:00:00Z", pinned: false, readCount: 168, total: 175 },
  { id: "a5", title: "FA L2 Consolidation Workshop — Saturday", body: "A special workshop on Consolidated Financial Statements will be held this Saturday, Feb 28, from 10:00 AM – 1:00 PM.\n\nLocation: Room 204, Block B.\n\nTopics: acquisition method, goodwill, minority interests, intercompany eliminations. Strongly recommended for students struggling with the consolidation unit.", target: 2, priority: "urgent", createdAt: "2026-02-22T08:00:00Z", pinned: false, readCount: 22, total: 38 },
];

const COLORS = ["#4f46e5","#0891b2","#059669","#d97706","#dc2626","#7c3aed","#be185d","#1e3a5f","#065f46","#92400e"];

const MOCK_STUDENTS = [
  { id: "s1",  name: "Akosua Mensah",    initials: "AM", courseId: 1, color: COLORS[0] },
  { id: "s2",  name: "Kwame Acheampong", initials: "KA", courseId: 1, color: COLORS[1] },
  { id: "s3",  name: "Abena Boateng",    initials: "AB", courseId: 2, color: COLORS[2] },
  { id: "s4",  name: "Kofi Asante",      initials: "KA", courseId: 3, color: COLORS[3] },
  { id: "s5",  name: "Ama Owusu",        initials: "AO", courseId: 4, color: COLORS[4] },
  { id: "s6",  name: "Yaw Darko",        initials: "YD", courseId: 5, color: COLORS[5] },
  { id: "s7",  name: "Efua Addai",       initials: "EA", courseId: 1, color: COLORS[6] },
  { id: "s8",  name: "Nana Osei",        initials: "NO", courseId: 2, color: COLORS[7] },
  { id: "s9",  name: "Kwabena Frimpong", initials: "KF", courseId: 3, color: COLORS[8] },
  { id: "s10", name: "Adwoa Sarpong",    initials: "AS", courseId: 4, color: COLORS[9] },
];

const INIT_CONVS: Conversation[] = [
  { id:"c1", studentId:"s1", studentName:"Akosua Mensah",    courseId:1, initials:"AM", color:COLORS[0], unread:2,
    msgs:[{id:"m1",from:"student",name:"Akosua Mensah",body:"Good afternoon Prof. I'm struggling with the Trial Balance for this week's assignment. The debits and credits don't balance.",ts:"2026-02-22T14:10:00Z",read:true},{id:"m2",from:"instructor",name:"Prof Mensah Oduro",body:"Hi Akosua, which specific ledger accounts are giving you trouble? The most common issue is forgetting the closing stock entry.",ts:"2026-02-22T14:35:00Z",read:true},{id:"m3",from:"student",name:"Akosua Mensah",body:"It's the accruals section — I think I'm double-counting the electricity expense.",ts:"2026-02-22T15:02:00Z",read:false},{id:"m4",from:"student",name:"Akosua Mensah",body:"Also, should prepaid rent appear on the debit or credit side of the trial balance?",ts:"2026-02-22T15:03:00Z",read:false}]},
  { id:"c2", studentId:"s2", studentName:"Kwame Acheampong",  courseId:1, initials:"KA", color:COLORS[1], unread:0,
    msgs:[{id:"m5",from:"student",name:"Kwame Acheampong",body:"Prof, thank you for the extra examples in Wednesday's class. Bank reconciliation finally clicked for me!",ts:"2026-02-21T18:20:00Z",read:true},{id:"m6",from:"instructor",name:"Prof Mensah Oduro",body:"Great to hear, Kwame! Keep practising with past exam papers — they have excellent bank rec exercises.",ts:"2026-02-21T19:05:00Z",read:true}]},
  { id:"c3", studentId:"s3", studentName:"Abena Boateng",     courseId:2, initials:"AB", color:COLORS[2], unread:1,
    msgs:[{id:"m7",from:"student",name:"Abena Boateng",body:"Prof, I watched the consolidation lecture twice but I'm still confused about acquisition method vs equity method.",ts:"2026-02-22T10:15:00Z",read:true},{id:"m8",from:"instructor",name:"Prof Mensah Oduro",body:"Key rule: above 50% ownership → acquisition/consolidation. 20–50% → equity method. Below 20% → investment only.",ts:"2026-02-22T11:00:00Z",read:true},{id:"m9",from:"student",name:"Abena Boateng",body:"Thank you! What about joint ventures? I've seen both proportionate and equity method used in practice questions.",ts:"2026-02-22T13:45:00Z",read:false}]},
  { id:"c4", studentId:"s4", studentName:"Kofi Asante",       courseId:3, initials:"KA", color:COLORS[3], unread:0,
    msgs:[{id:"m10",from:"student",name:"Kofi Asante",body:"Good morning Prof. Can you recommend extra practice for variance analysis? The textbook examples feel too straightforward.",ts:"2026-02-19T08:30:00Z",read:true},{id:"m11",from:"instructor",name:"Prof Mensah Oduro",body:"Morning Kofi! I'll upload a variance analysis practice pack to the MA L1 module by Thursday. Also check ICAG past papers 2019–2022.",ts:"2026-02-19T09:10:00Z",read:true}]},
  { id:"c5", studentId:"s5", studentName:"Ama Owusu",         courseId:4, initials:"AO", color:COLORS[4], unread:0,
    msgs:[{id:"m12",from:"student",name:"Ama Owusu",body:"Prof, is the VAT registration threshold for the 2025 exam still GHS 200,000?",ts:"2026-02-18T16:40:00Z",read:true},{id:"m13",from:"instructor",name:"Prof Mensah Oduro",body:"Good question Ama — yes, standard VAT rate 15%, registration threshold GHS 200,000. I'll post an updated tax reference sheet in announcements.",ts:"2026-02-18T17:15:00Z",read:true}]},
  { id:"c6", studentId:"s6", studentName:"Yaw Darko",         courseId:5, initials:"YD", color:COLORS[5], unread:0,
    msgs:[{id:"m14",from:"student",name:"Yaw Darko",body:"Hi Prof. Do we need to memorise exact ISA standard numbers for the exam?",ts:"2026-02-17T11:00:00Z",read:true},{id:"m15",from:"instructor",name:"Prof Mensah Oduro",body:"Know the key ones: ISA 200, 210, 315, 330, 500, 700, 705, 706. Know their purpose and when to apply them — exact wording not required.",ts:"2026-02-17T11:45:00Z",read:true}]},
];

const INIT_THREADS: FThread[] = [
  { id:"t1", author:"Prof Mensah Oduro", role:"instructor", courseId:null, title:"Welcome to the ALMS Discussion Forum — Read First!", body:"Welcome to our course discussion forum. This is your space to ask questions, share insights, and support each other.\n\nGround rules:\n1. Be respectful and constructive\n2. Search before posting — your question may already be answered\n3. Tag your post with the relevant course if it's course-specific\n4. I check this forum every weekday and respond within 24 hours\n\nLet's have a productive semester!", ts:"2026-02-01T08:00:00Z", pinned:true, replies:[{id:"r0a",author:"Akosua Mensah",role:"student",body:"Thank you Prof! Looking forward to a great semester.",ts:"2026-02-01T09:15:00Z"},{id:"r0b",author:"Kwame Acheampong",role:"student",body:"Really appreciate the clear guidelines!",ts:"2026-02-01T10:00:00Z"}] },
  { id:"t2", author:"Akosua Mensah", role:"student", courseId:1, title:"Good resources for Trial Balance practice?", body:"Looking for extra practice questions for Trial Balance. The textbook examples feel too simple. Any good supplementary resources? Any tips for quickly spotting balancing errors?", ts:"2026-02-20T13:00:00Z", pinned:false, replies:[{id:"r1a",author:"Kwame Acheampong",role:"student",body:"ICAG 2021–2022 past papers have great trial balance questions in Section B.",ts:"2026-02-20T13:45:00Z"},{id:"r1b",author:"Efua Addai",role:"student",body:"Agreed on past papers! 'AccountingCoach' on YouTube is also great.",ts:"2026-02-20T14:20:00Z"},{id:"r1c",author:"Prof Mensah Oduro",role:"instructor",body:"I'll upload a 10-exercise practice worksheet to the FA L1 module by end of week. Quick tip: if the difference between debit and credit totals is divisible by 9, you likely have a transposition error.",ts:"2026-02-20T16:00:00Z"},{id:"r1d",author:"Akosua Mensah",role:"student",body:"The divisibility-by-9 tip is brilliant! Thank you Prof!",ts:"2026-02-20T16:30:00Z"}] },
  { id:"t3", author:"Abena Boateng", role:"student", courseId:2, title:"Clarification on Minority Interest calculation method", body:"The consolidation worksheet example 3 uses a different approach to NCI than the lecture slides. Which method should we use in the exam — proportionate share of net assets, or the full goodwill method?", ts:"2026-02-19T10:00:00Z", pinned:false, replies:[{id:"r2a",author:"Nana Osei",role:"student",body:"Same confusion here. Worksheet uses NCI at fair value but slides use proportionate share.",ts:"2026-02-19T11:00:00Z"},{id:"r2b",author:"Prof Mensah Oduro",role:"instructor",body:"Good catch — the ICAG syllabus requires you to know BOTH methods. The exam will specify which to use. Worksheet follows IFRS 3 (full goodwill). I'll do a side-by-side in Thursday's class.",ts:"2026-02-19T14:00:00Z"},{id:"r2c",author:"Abena Boateng",role:"student",body:"Very helpful, thank you Prof! Looking forward to Thursday.",ts:"2026-02-19T14:30:00Z"}] },
  { id:"t4", author:"Efua Addai", role:"student", courseId:null, title:"Study group for May 2025 sitting — who's in?", body:"Organising a study group for the May 2025 ICAG sitting. Meeting every Saturday 3–5 PM at the library, Study Room 2. All levels welcome — currently 6 people. Reply with which subjects you're covering!", ts:"2026-02-18T09:00:00Z", pinned:false, replies:[{id:"r3a",author:"Kwame Acheampong",role:"student",body:"I'm in! FA L1 and MA L1.",ts:"2026-02-18T09:30:00Z"},{id:"r3b",author:"Kofi Asante",role:"student",body:"Count me in for MA L1 and TAX L1.",ts:"2026-02-18T10:00:00Z"},{id:"r3c",author:"Yaw Darko",role:"student",body:"AUD L1 here. Should we create a WhatsApp group?",ts:"2026-02-18T11:15:00Z"},{id:"r3d",author:"Prof Mensah Oduro",role:"instructor",body:"Wonderful initiative! I'll share revision topic lists for each subject in the announcements. Keep up the collaborative spirit!",ts:"2026-02-18T12:00:00Z"},{id:"r3e",author:"Nana Osei",role:"student",body:"FA L2 here — Saturday works perfectly!",ts:"2026-02-18T14:00:00Z"}] },
  { id:"t5", author:"Kwabena Frimpong", role:"student", courseId:3, title:"Week 3 lecture video — audio cuts out at 22 minutes", body:"The Week 3 MA L1 video on Absorption Costing has an audio issue — it cuts out from ~22:00 to 26:30. Missed the overhead allocation explanation. Anyone else experiencing this?", ts:"2026-02-21T20:00:00Z", pinned:false, replies:[{id:"r4a",author:"Kofi Asante",role:"student",body:"Yes, noticed this too — had to skip that section.",ts:"2026-02-21T20:30:00Z"},{id:"r4b",author:"Prof Mensah Oduro",role:"instructor",body:"Thanks for flagging this. I've reported it to the platform team. I'll record a 10-minute explainer on overhead allocation by tomorrow. Apologies for the inconvenience!",ts:"2026-02-22T08:30:00Z"}] },
  { id:"t6", author:"Adwoa Sarpong", role:"student", courseId:4, title:"2025 tax threshold updates — are they examinable?", body:"The GRA announced changes to personal income tax bands in the 2025 budget. For the May sitting, should we use 2024 or the updated 2025 figures?", ts:"2026-02-22T11:00:00Z", pinned:false, replies:[{id:"r5a",author:"Prof Mensah Oduro",role:"instructor",body:"Great question. ICAG uses legislation effective 1 January of the exam year — so for May 2025, the 2025 figures apply. I'll upload an updated tax rates reference card to the TAX L1 module this week.",ts:"2026-02-22T12:00:00Z"},{id:"r5b",author:"Adwoa Sarpong",role:"student",body:"Thank you so much Prof! The reference card will be very helpful.",ts:"2026-02-22T12:30:00Z"}] },
];

// ─── Shared mini-components ─────────────────────���──────────────────────────────

function Av({ initials, color, size = 36 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0 text-white"
      style={{ width: size, height: size, backgroundColor: color, ...S, fontSize: size * 0.32, fontWeight: 700 }}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }: { role: "instructor" | "student" }) {
  return (
    <span
      className={role === "instructor" ? "bg-[#0a1628] text-white" : "bg-gray-100 text-[#6c6c6c]"}
      style={{ ...S, fontSize: "9px", fontWeight: 700, padding: "2px 6px", display: "inline-block" }}
    >
      {role === "instructor" ? "Instructor" : "Student"}
    </span>
  );
}

const LABEL_STYLE = { ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const INPUT_CLS = "w-full border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628]";

// ─── Announcements Tab ─────────────────────────────────────────────────────────

function AnnouncementsTab({ createMode, onDismiss }: { createMode: boolean; onDismiss: () => void }) {
  const [list, setList] = useState<Announcement[]>(INIT_ANN);
  const [selId, setSelId] = useState<string | null>(INIT_ANN[0].id);
  const [search, setSearch] = useState("");
  const [fTitle, setFTitle] = useState("");
  const [fBody,  setFBody]  = useState("");
  const [fTarget, setFTarget] = useState<"all" | number>("all");
  const [fPrio, setFPrio] = useState<Priority>("normal");
  const [fPin, setFPin] = useState(false);

  useEffect(() => { if (createMode) { setSelId(null); } }, [createMode]);

  const filtered = [...list]
    .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sel = list.find(a => a.id === selId);

  const handlePost = () => {
    if (!fTitle.trim() || !fBody.trim()) return;
    const n: Announcement = { id: uid("ann"), title: fTitle.trim(), body: fBody.trim(), target: fTarget, priority: fPrio, createdAt: new Date().toISOString(), pinned: fPin, readCount: 0, total: tTotal(fTarget) };
    setList(p => [n, ...p]);
    setSelId(n.id);
    setFTitle(""); setFBody(""); setFTarget("all"); setFPrio("normal"); setFPin(false);
    onDismiss();
  };

  return (
    <div className="flex h-[600px]">
      {/* Left */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements…" className="w-full pl-8 pr-3 py-1.5 border border-gray-200 outline-none bg-[#f9f9f9]" style={{ ...S, fontSize: "12px" }} />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(a => (
            <button key={a.id} onClick={() => { setSelId(a.id); onDismiss(); }}
              className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${selId === a.id && !createMode ? "bg-[#0a1628]/5 border-l-2 border-l-[#d4a574]" : "hover:bg-gray-50 border-l-2 border-l-transparent"}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  {a.pinned && <Pin size={10} className="text-[#d4a574] flex-shrink-0" />}
                  <span className="truncate" style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{a.title}</span>
                </div>
                {a.priority === "urgent" && (
                  <span className="flex-shrink-0 px-1.5 py-0.5 bg-red-100 text-red-600" style={{ ...S, fontSize: "9px", fontWeight: 700 }}>URGENT</span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-1.5 py-0.5 bg-[#0a1628]/5 text-[#0a1628]" style={{ ...S, fontSize: "9px", fontWeight: 700 }}>{tLabel(a.target)}</span>
                <span style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>{fmtDate(a.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Eye size={9} className="text-gray-300" />
                <span style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>{a.readCount}/{a.total} read</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <p className="p-6 text-center" style={{ ...S, fontSize: "12px", color: "#b0b0b0" }}>No announcements found</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {createMode ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>New Announcement</h3>
              <button onClick={onDismiss} className="p-1.5 hover:bg-gray-100"><X size={14} className="text-[#6c6c6c]" /></button>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Priority</p>
              <div className="flex gap-2">
                {(["normal","urgent"] as Priority[]).map(p => (
                  <button key={p} onClick={() => setFPrio(p)}
                    className={`px-4 py-1.5 border transition-colors ${fPrio === p ? (p === "urgent" ? "bg-red-600 border-red-600 text-white" : "bg-[#0a1628] border-[#0a1628] text-white") : "border-gray-200 text-[#6c6c6c] hover:border-[#0a1628]"}`}
                    style={{ ...S, fontSize: "12px", fontWeight: 600 }}
                  >{p === "urgent" ? "⚡ Urgent" : "Normal"}</button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Title</p>
              <input autoFocus value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="Announcement title…" className={INPUT_CLS} style={{ ...S, fontSize: "13px" }} />
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Message</p>
              <textarea rows={6} value={fBody} onChange={e => setFBody(e.target.value)} placeholder="Write your announcement here…" className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Target Audience</p>
              <select value={fTarget === "all" ? "all" : String(fTarget)} onChange={e => setFTarget(e.target.value === "all" ? "all" : Number(e.target.value))} className={`${INPUT_CLS} bg-white`} style={{ ...S, fontSize: "13px" }}>
                <option value="all">All Students (all courses)</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {courseSelectLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2.5 mb-6">
              <button onClick={() => setFPin(p => !p)} className={`w-10 h-5 rounded-full relative transition-colors ${fPin ? "bg-[#d4a574]" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${fPin ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
              <span style={{ ...S, fontSize: "12px", color: "#6c6c6c" }}>Pin this announcement</span>
            </div>
            <div className="flex gap-3">
              <button onClick={handlePost} disabled={!fTitle.trim() || !fBody.trim()} className="flex items-center gap-2 px-5 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
                <Megaphone size={13} /> Post Announcement
              </button>
              <button onClick={onDismiss} className="px-5 py-2 border border-gray-200 hover:bg-gray-50" style={{ ...S, fontSize: "13px" }}>Cancel</button>
            </div>
          </div>
        ) : sel ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {sel.priority === "urgent" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600" style={{ ...S, fontSize: "10px", fontWeight: 700 }}><AlertTriangle size={10} /> URGENT</span>
                  )}
                  <span className="px-2 py-0.5 bg-[#0a1628]/5 text-[#0a1628]" style={{ ...S, fontSize: "10px", fontWeight: 700 }}>{tLabel(sel.target)}</span>
                  {sel.pinned && <span className="flex items-center gap-1 text-[#d4a574]" style={{ ...S, fontSize: "10px" }}><Pin size={10} /> Pinned</span>}
                </div>
                <h2 style={{ ...S, fontSize: "17px", fontWeight: 700, color: "#0a1628" }}>{sel.title}</h2>
                <p style={{ ...S, fontSize: "11px", color: "#b0b0b0", marginTop: 3 }}>Prof Mensah Oduro · {fmtFull(sel.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setList(p => p.map(a => a.id === sel.id ? { ...a, pinned: !a.pinned } : a))} className="p-1.5 hover:bg-gray-100">
                  <Pin size={13} className={sel.pinned ? "text-[#d4a574]" : "text-gray-300"} />
                </button>
                <button onClick={() => { setList(p => p.filter(a => a.id !== sel.id)); setSelId(list.find(a => a.id !== sel.id)?.id ?? null); }} className="p-1.5 hover:bg-red-50">
                  <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
                </button>
              </div>
            </div>
            <p style={{ ...S, fontSize: "14px", color: "#3a3a3a", lineHeight: 1.9, whiteSpace: "pre-wrap" }} className="mb-6">{sel.body}</p>
            <div className="bg-[#f5f6f8] border border-gray-100 px-4 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Eye size={14} className="text-[#6c6c6c]" />
                <span style={{ ...S, fontSize: "12px", color: "#0a1628" }}><strong>{sel.readCount}</strong> of <strong>{sel.total}</strong> students read</span>
              </div>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#d4a574] rounded-full" style={{ width: `${Math.round((sel.readCount / sel.total) * 100)}%` }} />
              </div>
              <span style={{ ...S, fontSize: "12px", fontWeight: 700, color: "#0a1628" }}>{Math.round((sel.readCount / sel.total) * 100)}%</span>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <Megaphone size={36} className="text-gray-200" />
            <p style={{ ...S, fontSize: "13px", color: "#b0b0b0" }}>Select an announcement to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Messages Tab ──────────────────────────────────────────────────────────────

function MessagesTab({ newMode, onDismiss }: { newMode: boolean; onDismiss: () => void }) {
  const [convs, setConvs] = useState<Conversation[]>(INIT_CONVS);
  const [selId, setSelId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [newStu, setNewStu] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selId, convs]);

  const handleSelect = (id: string) => {
    setSelId(id);
    onDismiss();
    setConvs(p => p.map(c => c.id === id ? { ...c, unread: 0, msgs: c.msgs.map(m => ({ ...m, read: true })) } : c));
  };

  const handleSend = () => {
    if (!draft.trim() || !selId) return;
    const msg: ChatMsg = { id: uid("m"), from: "instructor", name: "Prof Mensah Oduro", body: draft.trim(), ts: new Date().toISOString(), read: true };
    setConvs(p => p.map(c => c.id === selId ? { ...c, msgs: [...c.msgs, msg] } : c));
    setDraft("");
  };

  const handleStartConv = () => {
    if (!newStu || !newMsg.trim()) return;
    const stu = MOCK_STUDENTS.find(s => s.id === newStu);
    if (!stu) return;
    const existing = convs.find(c => c.studentId === newStu);
    const firstMsg: ChatMsg = { id: uid("m"), from: "instructor", name: "Prof Mensah Oduro", body: newMsg.trim(), ts: new Date().toISOString(), read: true };
    if (existing) {
      setConvs(p => p.map(c => c.id === existing.id ? { ...c, msgs: [...c.msgs, firstMsg] } : c));
      setSelId(existing.id);
    } else {
      const newConv: Conversation = { id: uid("conv"), studentId: stu.id, studentName: stu.name, courseId: stu.courseId, initials: stu.initials, color: stu.color, msgs: [firstMsg], unread: 0 };
      setConvs(p => [newConv, ...p]);
      setSelId(newConv.id);
    }
    setNewStu(""); setNewMsg("");
    onDismiss();
  };

  const filtered = convs.filter(c => c.studentName.toLowerCase().includes(search.toLowerCase()));
  const sel = convs.find(c => c.id === selId);
  const totalUnread = convs.reduce((s, c) => s + c.unread, 0);

  return (
    <div className="flex h-[600px]">
      {/* Left */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations…" className="w-full pl-8 pr-3 py-1.5 border border-gray-200 outline-none bg-[#f9f9f9]" style={{ ...S, fontSize: "12px" }} />
          </div>
        </div>
        {totalUnread > 0 && (
          <div className="px-3 py-1.5 bg-[#d4a574]/10 border-b border-[#d4a574]/20 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#0a1628" }}>{totalUnread}</span>
            <span style={{ ...S, fontSize: "11px", color: "#0a1628" }}>unread messages</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => {
            const last = c.msgs[c.msgs.length - 1];
            return (
              <button key={c.id} onClick={() => handleSelect(c.id)}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${selId === c.id && !newMode ? "bg-[#0a1628]/5 border-l-2 border-l-[#d4a574]" : "hover:bg-gray-50 border-l-2 border-l-transparent"}`}
              >
                <div className="flex items-start gap-2.5">
                  <Av initials={c.initials} color={c.color} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate" style={{ ...S, fontSize: "12px", fontWeight: c.unread > 0 ? 700 : 500, color: "#0a1628" }}>{c.studentName}</span>
                      <span style={{ ...S, fontSize: "10px", color: "#b0b0b0", flexShrink: 0 }}>{last ? fmtDate(last.ts) : ""}</span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-[#0a1628]/5 text-[#0a1628]" style={{ ...S, fontSize: "9px", fontWeight: 600 }}>{cCode(c.courseId)}</span>
                    <div className="flex items-center justify-between gap-1 mt-0.5">
                      <span className="truncate" style={{ ...S, fontSize: "11px", color: c.unread > 0 ? "#0a1628" : "#6c6c6c", fontWeight: c.unread > 0 ? 500 : 400 }}>
                        {last?.from === "instructor" ? "You: " : ""}{last?.body}
                      </span>
                      {c.unread > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center flex-shrink-0" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#0a1628" }}>{c.unread}</span>
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
              <h3 style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>New Message</h3>
              <button onClick={onDismiss} className="p-1.5 hover:bg-gray-100"><X size={14} className="text-[#6c6c6c]" /></button>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Send to</p>
              <select value={newStu} onChange={e => setNewStu(e.target.value)} className={`${INPUT_CLS} bg-white`} style={{ ...S, fontSize: "13px" }}>
                <option value="">Select a student…</option>
                {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name} — {cCode(s.courseId)}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <p style={LABEL_STYLE} className="mb-1.5">Message</p>
              <textarea autoFocus rows={5} value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Write your message…" className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
            </div>
            <div className="flex gap-3">
              <button onClick={handleStartConv} disabled={!newStu || !newMsg.trim()} className="flex items-center gap-2 px-5 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
                <Send size={13} /> Send Message
              </button>
              <button onClick={onDismiss} className="px-5 py-2 border border-gray-200 hover:bg-gray-50" style={{ ...S, fontSize: "13px" }}>Cancel</button>
            </div>
          </div>
        ) : sel ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-shrink-0">
              <Av initials={sel.initials} color={sel.color} size={36} />
              <div>
                <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>{sel.studentName}</p>
                <p style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
                  {(() => {
                    const c = COURSES.find((x) => x.id === sel.courseId);
                    return c ? courseTitleWithTracks(c) : "";
                  })()}
                </p>
              </div>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#fafafa]">
              {sel.msgs.map(msg => {
                const isMe = msg.from === "instructor";
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[72%] flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`px-3.5 py-2 ${isMe ? "bg-[#0a1628] text-white" : "bg-white border border-gray-200 text-[#0a1628]"}`}
                        style={{ ...S, fontSize: "13px", lineHeight: 1.5, borderRadius: "10px", ...(isMe ? { borderBottomRightRadius: "3px" } : { borderBottomLeftRadius: "3px" }) }}>
                        {msg.body}
                      </div>
                      <span style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>
                        {fmtDate(msg.ts)}
                        {isMe && <span className="ml-1 text-[#d4a574]">✓✓</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 border-t border-gray-100 p-3 flex items-end gap-2 bg-white">
              <textarea rows={2} value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
                className="flex-1 border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] resize-none"
                style={{ ...S, fontSize: "13px", borderRadius: "8px" }} />
              <button onClick={handleSend} disabled={!draft.trim()} className="w-9 h-9 bg-[#0a1628] flex items-center justify-center hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0" style={{ borderRadius: "8px" }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageSquare size={36} className="text-gray-200" />
            <p style={{ ...S, fontSize: "13px", color: "#b0b0b0" }}>Select a conversation to start messaging</p>
            <button onClick={() => {}} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-[#6c6c6c] hover:text-[#0a1628]" style={{ ...S, fontSize: "12px" }}>
              <Plus size={13} /> Start a new conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Forum Tab ─────────────────────────────────────────────────────────────────

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
    const r: FReply = { id: uid("r"), author: "Prof Mensah Oduro", role: "instructor", body: reply.trim(), ts: new Date().toISOString() };
    setThreads(p => p.map(t => t.id === selId ? { ...t, replies: [...t.replies, r] } : t));
    setReply("");
  };

  const handlePost = () => {
    if (!fTitle.trim() || !fBody.trim()) return;
    const t: FThread = { id: uid("t"), author: "Prof Mensah Oduro", role: "instructor", courseId: fCourse, title: fTitle.trim(), body: fBody.trim(), ts: new Date().toISOString(), pinned: false, replies: [] };
    setThreads(p => [t, ...p]);
    setSelId(t.id);
    setFTitle(""); setFBody(""); setFCourse(null);
    onDismiss();
  };

  return (
    <div className="flex h-[600px]">
      {/* Left */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-100">
        <div className="px-3 py-2.5 border-b border-gray-100 flex-shrink-0 flex flex-col gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search threads…" className="w-full pl-8 pr-3 py-1.5 border border-gray-200 outline-none bg-[#f9f9f9]" style={{ ...S, fontSize: "12px" }} />
          </div>
          <select value={courseF === "all" ? "all" : String(courseF)} onChange={e => setCourseF(e.target.value === "all" ? "all" : Number(e.target.value))} className="w-full border border-gray-200 px-2 py-1.5 outline-none bg-white" style={{ ...S, fontSize: "11px", color: "#6c6c6c" }}>
            <option value="all">All courses</option>
            {COURSES.map((c) => (
              <option key={c.id} value={c.id}>
                {courseShortWithTracks(c)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map(t => {
            const lastAct = t.replies.length ? t.replies[t.replies.length - 1].ts : t.ts;
            const hasInstrReply = t.role === "instructor" || t.replies.some(r => r.role === "instructor");
            return (
              <button key={t.id} onClick={() => { setSelId(t.id); onDismiss(); }}
                className={`w-full text-left px-3 py-3 border-b border-gray-50 transition-colors ${selId === t.id && !createMode ? "bg-[#0a1628]/5 border-l-2 border-l-[#d4a574]" : "hover:bg-gray-50 border-l-2 border-l-transparent"}`}
              >
                <div className="flex items-start gap-1.5">
                  {t.pinned && <Pin size={10} className="text-[#d4a574] mt-0.5 flex-shrink-0" />}
                  <span className="flex-1 min-w-0 text-left" style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.title}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <RoleBadge role={t.role} />
                  {t.courseId && <span className="px-1.5 py-0.5 bg-[#0a1628]/5 text-[#0a1628]" style={{ ...S, fontSize: "9px", fontWeight: 600 }}>{cCode(t.courseId)}</span>}
                  {hasInstrReply && t.role !== "instructor" && <span className="px-1.5 py-0.5 bg-[#d4a574]/20 text-[#0a1628]" style={{ ...S, fontSize: "9px", fontWeight: 700 }}>Replied ✓</span>}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Reply size={9} className="text-gray-300" />
                  <span style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>{t.replies.length} replies · {fmtDate(lastAct)}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && <p className="p-6 text-center" style={{ ...S, fontSize: "12px", color: "#b0b0b0" }}>No threads found</p>}
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {createMode ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>New Thread</h3>
              <button onClick={onDismiss} className="p-1.5 hover:bg-gray-100"><X size={14} className="text-[#6c6c6c]" /></button>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Course Tag <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span></p>
              <select value={fCourse === null ? "null" : String(fCourse)} onChange={e => setFCourse(e.target.value === "null" ? null : Number(e.target.value))} className={`${INPUT_CLS} bg-white`} style={{ ...S, fontSize: "13px" }}>
                <option value="null">General (no specific course)</option>
                {COURSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {courseSelectLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <p style={LABEL_STYLE} className="mb-1.5">Thread Title</p>
              <input autoFocus value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="What's this thread about?" className={INPUT_CLS} style={{ ...S, fontSize: "13px" }} />
            </div>
            <div className="mb-6">
              <p style={LABEL_STYLE} className="mb-1.5">Body</p>
              <textarea rows={6} value={fBody} onChange={e => setFBody(e.target.value)} placeholder="Share your question, insight, or resource…" className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
            </div>
            <div className="flex gap-3">
              <button onClick={handlePost} disabled={!fTitle.trim() || !fBody.trim()} className="flex items-center gap-2 px-5 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed" style={{ ...S, fontSize: "13px", fontWeight: 600 }}>
                <MessageCircle size={13} /> Post Thread
              </button>
              <button onClick={onDismiss} className="px-5 py-2 border border-gray-200 hover:bg-gray-50" style={{ ...S, fontSize: "13px" }}>Cancel</button>
            </div>
          </div>
        ) : sel ? (
          <>
            <div className="flex-1 overflow-y-auto p-5">
              {/* Original post */}
              <div className="mb-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      {sel.pinned && <span className="flex items-center gap-1 text-[#d4a574]" style={{ ...S, fontSize: "10px" }}><Pin size={10} /> Pinned</span>}
                      {sel.courseId && <span className="px-1.5 py-0.5 bg-[#0a1628]/5 text-[#0a1628]" style={{ ...S, fontSize: "10px", fontWeight: 700 }}>{cCode(sel.courseId)}</span>}
                      <RoleBadge role={sel.role} />
                    </div>
                    <h2 style={{ ...S, fontSize: "16px", fontWeight: 700, color: "#0a1628" }}>{sel.title}</h2>
                    <p style={{ ...S, fontSize: "11px", color: "#b0b0b0", marginTop: 2 }}>{sel.author} · {fmtFull(sel.ts)}</p>
                  </div>
                  {sel.role === "instructor" && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setThreads(p => p.map(t => t.id === sel.id ? { ...t, pinned: !t.pinned } : t))} className="p-1.5 hover:bg-gray-100">
                        <Pin size={13} className={sel.pinned ? "text-[#d4a574]" : "text-gray-300"} />
                      </button>
                      <button onClick={() => { setThreads(p => p.filter(t => t.id !== sel.id)); setSelId(null); }} className="p-1.5 hover:bg-red-50">
                        <Trash2 size={13} className="text-gray-300 hover:text-red-400" />
                      </button>
                    </div>
                  )}
                </div>
                <p style={{ ...S, fontSize: "13px", color: "#3a3a3a", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{sel.body}</p>
              </div>

              {/* Replies */}
              {sel.replies.length > 0 && (
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
                  <span style={{ ...S, fontSize: "11px", fontWeight: 700, color: "#b0b0b0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {sel.replies.length} {sel.replies.length === 1 ? "Reply" : "Replies"}
                  </span>
                  {sel.replies.map(r => (
                    <div key={r.id} className={`pl-4 border-l-2 ${r.role === "instructor" ? "border-[#d4a574]" : "border-gray-200"}`}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <RoleBadge role={r.role} />
                        <span style={{ ...S, fontSize: "12px", fontWeight: 600, color: "#0a1628" }}>{r.author}</span>
                        <span style={{ ...S, fontSize: "10px", color: "#b0b0b0" }}>{fmtFull(r.ts)}</span>
                      </div>
                      <p style={{ ...S, fontSize: "13px", color: "#3a3a3a", lineHeight: 1.7 }}>{r.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply compose */}
            <div className="flex-shrink-0 border-t border-gray-100 p-3 flex items-end gap-2 bg-white">
              <textarea rows={2} value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                placeholder="Write a reply… (Enter to post)"
                className="flex-1 border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] resize-none"
                style={{ ...S, fontSize: "13px", borderRadius: "8px" }} />
              <button onClick={handleReply} disabled={!reply.trim()} className="w-9 h-9 bg-[#0a1628] flex items-center justify-center hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0" style={{ borderRadius: "8px" }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <MessageCircle size={36} className="text-gray-200" />
            <p style={{ ...S, fontSize: "13px", color: "#b0b0b0" }}>Select a thread to read the discussion</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type TabId = "announcements" | "messages" | "forum";

export function CommunicationsPage() {
  const [tab, setTab] = useState<TabId>("announcements");
  const [annCreate, setAnnCreate] = useState(false);
  const [msgNew, setMsgNew] = useState(false);
  const [forumCreate, setForumCreate] = useState(false);

  const switchTab = (t: TabId) => {
    setTab(t);
    setAnnCreate(false);
    setMsgNew(false);
    setForumCreate(false);
  };

  const tabs: { id: TabId; label: string; Icon: React.ElementType; badge?: number }[] = [
    { id: "announcements", label: "Announcements", Icon: Megaphone, badge: 1 },
    { id: "messages",      label: "Messages",      Icon: MessageSquare, badge: 3 },
    { id: "forum",         label: "Discussion Forum", Icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Communications" }]} />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Page header */}
          <div className="bg-[#0a1628] px-6 py-4 flex items-center justify-between">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "18px", color: "#faf8f5" }}>Communications</h1>
              <p style={{ ...S, fontSize: "12px", color: "rgba(250,248,245,0.55)", marginTop: 2 }}>
                Announcements · Direct Messages · Discussion Forum
              </p>
            </div>
            <div>
              {tab === "announcements" && (
                <button onClick={() => setAnnCreate(true)} className="flex items-center gap-2 px-4 h-9 bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                  <Plus size={13} /> Post Announcement
                </button>
              )}
              {tab === "messages" && (
                <button onClick={() => setMsgNew(true)} className="flex items-center gap-2 px-4 h-9 bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                  <Plus size={13} /> New Message
                </button>
              )}
              {tab === "forum" && (
                <button onClick={() => setForumCreate(true)} className="flex items-center gap-2 px-4 h-9 bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
                  <Plus size={13} /> New Thread
                </button>
              )}
            </div>
          </div>

          {/* Content card */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              {tabs.map(t => (
                <button key={t.id} onClick={() => switchTab(t.id)}
                  className={`flex items-center gap-2 px-5 py-3.5 border-b-2 transition-colors ${tab === t.id ? "border-[#d4a574] text-[#0a1628]" : "border-transparent text-[#6c6c6c] hover:text-[#0a1628]"}`}
                >
                  <t.Icon size={14} />
                  <span style={{ ...S, fontSize: "13px", fontWeight: tab === t.id ? 700 : 400 }}>{t.label}</span>
                  {t.badge && (
                    <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#0a1628" }}>{t.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {tab === "announcements" && <AnnouncementsTab createMode={annCreate} onDismiss={() => setAnnCreate(false)} />}
            {tab === "messages"      && <MessagesTab newMode={msgNew} onDismiss={() => setMsgNew(false)} />}
            {tab === "forum"         && <ForumTab createMode={forumCreate} onDismiss={() => setForumCreate(false)} />}
          </div>
        </main>
      </div>

      <footer className="py-4 border-t border-gray-200 bg-white px-6 flex items-center justify-between mt-4">
        <p style={{ ...S, fontSize: "13px", color: "#0a1628" }}>Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All right reserved.</p>
        <div className="flex items-center gap-3" style={{ ...S, fontSize: "13px" }}>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">\</span>
          <a href="#" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
}
