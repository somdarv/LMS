import { useState, useRef, useEffect } from "react";
import {
  MessageSquare, Plus, Search,
  Send, X,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseShortWithTracks, courseTitleWithTracks } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };
let _c = 1;
const uid = (p = "x") => `${p}-${Date.now()}-${_c++}`;
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" });
const cCode = (id: number | null | undefined) =>
  id
    ? (() => {
        const c = COURSES.find((x) => x.id === id);
        return c ? courseShortWithTracks(c) : "";
      })()
    : "";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string; from: "instructor" | "student"; name: string; body: string; ts: string; read: boolean;
}
interface Conversation {
  id: string; studentId: string; studentName: string; courseId: number;
  initials: string; color: string; msgs: ChatMsg[]; unread: number;
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

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
    msgs:[{id:"m1",from:"student",name:"Akosua Mensah",body:"Good afternoon Prof. I'm struggling with the Trial Balance for this week's assignment. The debits and credits don't balance.",ts:"2026-02-22T14:10:00Z",read:true},{id:"m2",from:"instructor",name:"Prof Mensah Oduro",body:"Hi Akosua, which specific ledger accounts are giving you trouble? The most common issue is forgetting the closing stock entry.",ts:"2026-02-22T14:35:00Z",read:true},{id:"m3",from:"student",name:"Akosua Mensah",body:"It's the accruals section â€” I think I'm double-counting the electricity expense.",ts:"2026-02-22T15:02:00Z",read:false},{id:"m4",from:"student",name:"Akosua Mensah",body:"Also, should prepaid rent appear on the debit or credit side of the trial balance?",ts:"2026-02-22T15:03:00Z",read:false}]},
  { id:"c2", studentId:"s2", studentName:"Kwame Acheampong",  courseId:1, initials:"KA", color:COLORS[1], unread:0,
    msgs:[{id:"m5",from:"student",name:"Kwame Acheampong",body:"Prof, thank you for the extra examples in Wednesday's class. Bank reconciliation finally clicked for me!",ts:"2026-02-21T18:20:00Z",read:true},{id:"m6",from:"instructor",name:"Prof Mensah Oduro",body:"Great to hear, Kwame! Keep practising with past exam papers â€” they have excellent bank rec exercises.",ts:"2026-02-21T19:05:00Z",read:true}]},
  { id:"c3", studentId:"s3", studentName:"Abena Boateng",     courseId:2, initials:"AB", color:COLORS[2], unread:1,
    msgs:[{id:"m7",from:"student",name:"Abena Boateng",body:"Prof, I watched the consolidation lecture twice but I'm still confused about acquisition method vs equity method.",ts:"2026-02-22T10:15:00Z",read:true},{id:"m8",from:"instructor",name:"Prof Mensah Oduro",body:"Key rule: above 50% ownership â†’ acquisition/consolidation. 20â€“50% â†’ equity method. Below 20% â†’ investment only.",ts:"2026-02-22T11:00:00Z",read:true},{id:"m9",from:"student",name:"Abena Boateng",body:"Thank you! What about joint ventures? I've seen both proportionate and equity method used in practice questions.",ts:"2026-02-22T13:45:00Z",read:false}]},
  { id:"c4", studentId:"s4", studentName:"Kofi Asante",       courseId:3, initials:"KA", color:COLORS[3], unread:0,
    msgs:[{id:"m10",from:"student",name:"Kofi Asante",body:"Good morning Prof. Can you recommend extra practice for variance analysis? The textbook examples feel too straightforward.",ts:"2026-02-19T08:30:00Z",read:true},{id:"m11",from:"instructor",name:"Prof Mensah Oduro",body:"Morning Kofi! I'll upload a variance analysis practice pack to the MA L1 module by Thursday. Also check ICAG past papers 2019â€“2022.",ts:"2026-02-19T09:10:00Z",read:true}]},
  { id:"c5", studentId:"s5", studentName:"Ama Owusu",         courseId:4, initials:"AO", color:COLORS[4], unread:0,
    msgs:[{id:"m12",from:"student",name:"Ama Owusu",body:"Prof, is the VAT registration threshold for the 2025 exam still GHS 200,000?",ts:"2026-02-18T16:40:00Z",read:true},{id:"m13",from:"instructor",name:"Prof Mensah Oduro",body:"Good question Ama â€” yes, standard VAT rate 15%, registration threshold GHS 200,000. I'll post an updated tax reference sheet in announcements.",ts:"2026-02-18T17:15:00Z",read:true}]},
  { id:"c6", studentId:"s6", studentName:"Yaw Darko",         courseId:5, initials:"YD", color:COLORS[5], unread:0,
    msgs:[{id:"m14",from:"student",name:"Yaw Darko",body:"Hi Prof. Do we need to memorise exact ISA standard numbers for the exam?",ts:"2026-02-17T11:00:00Z",read:true},{id:"m15",from:"instructor",name:"Prof Mensah Oduro",body:"Know the key ones: ISA 200, 210, 315, 330, 500, 700, 705, 706. Know their purpose and when to apply them â€” exact wording not required.",ts:"2026-02-17T11:45:00Z",read:true}]},
];

// â”€â”€â”€ Shared mini-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ï¿½ï¿½ï¿½â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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


const LABEL_STYLE = { ...S, fontSize: "11px", fontWeight: 700, color: "#6c6c6c", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const INPUT_CLS = "w-full border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628]";

// â”€â”€â”€ Messages Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversationsâ€¦" className="w-full pl-8 pr-3 py-1.5 border border-gray-200 outline-none bg-[#f9f9f9]" style={{ ...S, fontSize: "12px" }} />
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
                <option value="">Select a studentâ€¦</option>
                {MOCK_STUDENTS.map(s => <option key={s.id} value={s.id}>{s.name} â€” {cCode(s.courseId)}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <p style={LABEL_STYLE} className="mb-1.5">Message</p>
              <textarea autoFocus rows={5} value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Write your messageâ€¦" className={`${INPUT_CLS} resize-none`} style={{ ...S, fontSize: "13px", lineHeight: 1.6 }} />
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
                        {isMe && <span className="ml-1 text-[#d4a574]">âœ“âœ“</span>}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex-shrink-0 border-t border-gray-100 p-3 flex items-end gap-2 bg-white">
              <textarea rows={2} value={draft} onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a messageâ€¦ (Enter to send, Shift+Enter for new line)"
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


// ─── Page ──────────────────────────────────────────────────────────────────────

export function CommunicationsPage() {
  const [msgNew, setMsgNew] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Messages" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Page header */}
          <div className="bg-[#0a1628] px-6 py-4 flex items-center justify-between">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "18px", color: "#faf8f5" }}>Messages</h1>
              <p style={{ ...S, fontSize: "12px", color: "rgba(250,248,245,0.55)", marginTop: 2 }}>
                Your inbox for direct conversations and course messages
              </p>
            </div>
            <button onClick={() => setMsgNew(true)} className="flex items-center gap-2 px-4 h-9 bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f] transition-colors" style={{ ...S, fontSize: "12px", fontWeight: 700 }}>
              <Plus size={13} /> New Message
            </button>
          </div>

          {/* Content card */}
          <div className="bg-white border border-gray-200 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-gray-100">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-[#d4a574] text-[#0a1628]">
                <MessageSquare size={14} />
                <span style={{ ...S, fontSize: "13px", fontWeight: 700 }}>Messages</span>
                <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center" style={{ ...S, fontSize: "9px", fontWeight: 700, color: "#0a1628" }}>3</span>
              </div>
            </div>

            <MessagesTab newMode={msgNew} onDismiss={() => setMsgNew(false)} />
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
