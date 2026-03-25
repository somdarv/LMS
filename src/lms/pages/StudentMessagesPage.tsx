import { useState } from "react";
import { useNavigate } from "react-router";
import {
  MessageSquare,
  Send,
  ChevronLeft,
  User,
  Clock,
  Plus,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";

interface Message {
  id: number;
  from: "student" | "instructor";
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  instructor: string;
  course: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: Message[];
}

const conversations: Conversation[] = [
  {
    id: 1,
    instructor: "Prof Mensah Oduro",
    course: "Financial Accounting Level 1",
    lastMessage: "Great question, Kojo. The treatment of accruals...",
    lastTime: "10:30 AM",
    unread: 1,
    messages: [
      { id: 1, from: "student", text: "Good morning Professor. I have a question about the treatment of accruals in the trial balance. Should we include them as adjustments or as separate line items?", time: "9:15 AM" },
      { id: 2, from: "instructor", text: "Great question, Kojo. The treatment of accruals depends on the format required. In the adjusted trial balance, they appear as adjustments. In the final financial statements, they are separate line items. Review Chapter 5 for detailed examples.", time: "10:30 AM" },
    ],
  },
  {
    id: 2,
    instructor: "Prof Mensah Oduro",
    course: "Management Accounting Level 1",
    lastMessage: "Thank you for the clarification, Professor.",
    lastTime: "Yesterday",
    unread: 0,
    messages: [
      { id: 3, from: "student", text: "Professor, regarding the Cost Analysis case study, should we use the FIFO or weighted average method for inventory valuation?", time: "Yesterday 2:00 PM" },
      { id: 4, from: "instructor", text: "Use the weighted average method for this particular case study. The question specifies 'standard costing' which aligns better with weighted average.", time: "Yesterday 3:15 PM" },
      { id: 5, from: "student", text: "Thank you for the clarification, Professor.", time: "Yesterday 3:20 PM" },
    ],
  },
  {
    id: 3,
    instructor: "Prof Mensah Oduro",
    course: "Financial Accounting Level 2",
    lastMessage: "The consolidation workings are available in...",
    lastTime: "Feb 25",
    unread: 1,
    messages: [
      { id: 6, from: "student", text: "Professor, I'm struggling with the minority interest calculation in consolidated statements. Could you point me to additional resources?", time: "Feb 25 11:00 AM" },
      { id: 7, from: "instructor", text: "The consolidation workings are available in the Week 3 module materials. I've also uploaded an additional PDF guide. Focus on the proportional method first before moving to the equity method.", time: "Feb 25 2:30 PM" },
    ],
  },
];

export function StudentMessagesPage() {
  const navigate = useNavigate();
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [convoList, setConvoList] = useState(conversations);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedConvo) return;
    const updatedConvos = convoList.map((c) => {
      if (c.id === selectedConvo.id) {
        const updated = {
          ...c,
          lastMessage: newMessage,
          lastTime: "Just now",
          messages: [
            ...c.messages,
            { id: Date.now(), from: "student" as const, text: newMessage, time: "Just now" },
          ],
        };
        setSelectedConvo(updated);
        return updated;
      }
      return c;
    });
    setConvoList(updatedConvos);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Messages" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div>
            <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>Messages</h1>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
              Message your instructors directly
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: 500 }}>
            <div className="flex h-[500px]">
              {/* Conversation List */}
              <div className={`w-[300px] border-r border-gray-100 flex flex-col ${selectedConvo ? "hidden sm:flex" : "flex"}`}>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>Inbox</p>
                  <button className="w-7 h-7 rounded-lg bg-[#0a1628] flex items-center justify-center hover:bg-[#0d1e35] transition-colors">
                    <Plus size={14} className="text-[#faf8f5]" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {convoList.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedConvo(c)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-[#fafafa] transition-colors ${
                        selectedConvo?.id === c.id ? "bg-[rgba(212,165,116,0.05)]" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#0a1628] flex items-center justify-center flex-shrink-0">
                          <User size={16} className="text-[#faf8f5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }} className="truncate">
                              {c.instructor}
                            </p>
                            <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#6c6c6c", whiteSpace: "nowrap" }}>
                              {c.lastTime}
                            </span>
                          </div>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#d4a574", fontWeight: 500, marginTop: 1 }}>
                            {c.course}
                          </p>
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#6c6c6c", marginTop: 2 }} className="truncate">
                            {c.lastMessage}
                          </p>
                        </div>
                        {c.unread > 0 && (
                          <span className="w-4 h-4 rounded-full bg-[#d4a574] flex items-center justify-center flex-shrink-0" style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 700, color: "#0a1628" }}>
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`flex-1 flex flex-col ${selectedConvo ? "flex" : "hidden sm:flex"}`}>
                {selectedConvo ? (
                  <>
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                      <button onClick={() => setSelectedConvo(null)} className="sm:hidden text-[#6c6c6c] hover:text-[#0a1628]">
                        <ChevronLeft size={18} />
                      </button>
                      <div className="w-8 h-8 rounded-full bg-[#0a1628] flex items-center justify-center">
                        <User size={14} className="text-[#faf8f5]" />
                      </div>
                      <div>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
                          {selectedConvo.instructor}
                        </p>
                        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#d4a574" }}>
                          {selectedConvo.course}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                      {selectedConvo.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.from === "student" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-xl ${
                            msg.from === "student"
                              ? "bg-[#0a1628] text-[#faf8f5]"
                              : "bg-[#f8f8f9] text-[#0a1628]"
                          }`}>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", lineHeight: 1.6 }}>
                              {msg.text}
                            </p>
                            <p style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", opacity: 0.6, marginTop: 4, textAlign: "right" }}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSend()}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl bg-[#f8f8f9] text-[#0a1628] placeholder-[#b0b0b0] outline-none focus:border-[#d4a574] focus:ring-2 focus:ring-[rgba(212,165,116,0.2)] transition-all"
                          style={{ fontFamily: "Inter, sans-serif", fontSize: "14px" }}
                        />
                        <button
                          onClick={handleSend}
                          disabled={!newMessage.trim()}
                          className="w-10 h-10 rounded-xl bg-[#0a1628] flex items-center justify-center hover:bg-[#0d1e35] transition-colors disabled:opacity-40"
                        >
                          <Send size={16} className="text-[#faf8f5]" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <MessageSquare size={40} className="text-[#b0b0b0] mb-3" />
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", fontWeight: 600, color: "#0a1628" }}>
                      Select a conversation
                    </p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
