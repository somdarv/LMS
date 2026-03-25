import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Plus, ChevronDown, ChevronUp, ChevronUpIcon,
  Pencil, Trash2, Play, FileText, ClipboardList,
  BookOpen, Check, X, GripVertical, Link2,
  Video, BookMarked, CalendarDays,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { ProfileBanner } from "../components/ProfileBanner";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { COURSES } from "../data/courses";
import { courseShortWithTracks, courseTitleWithTracks } from "../lib/courseLabels";
import { useLMS, ModuleItemType, LMSModule } from "../context/LMSContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ITEM_TYPE_OPTIONS: { value: ModuleItemType; label: string; icon: typeof Play }[] = [
  { value: "video",      label: "Video Lesson",  icon: Play },
  { value: "reading",    label: "Reading",       icon: BookOpen },
  { value: "pdf",        label: "PDF Document",  icon: FileText },
  { value: "quiz",       label: "Quiz",          icon: ClipboardList },
  { value: "assignment", label: "Assignment",    icon: BookMarked },
  { value: "link",       label: "Link",          icon: Link2 },
];

function itemIcon(type: ModuleItemType) {
  switch (type) {
    case "video":      return <Play size={12} className="text-blue-500 flex-shrink-0" />;
    case "reading":    return <BookOpen size={12} className="text-emerald-500 flex-shrink-0" />;
    case "pdf":        return <FileText size={12} className="text-orange-500 flex-shrink-0" />;
    case "quiz":       return <ClipboardList size={12} className="text-purple-500 flex-shrink-0" />;
    case "assignment": return <BookMarked size={12} className="text-rose-500 flex-shrink-0" />;
    case "link":       return <Link2 size={12} className="text-[#d4a574] flex-shrink-0" />;
  }
}

const S = { fontFamily: "Inter, sans-serif" };

// ─── Inline editable title ────────────────────────────────────────────────────

function InlineEdit({
  value, onSave, fontSize = "14px", fontWeight = 600, color = "#0a1628",
}: {
  value: string; onSave: (v: string) => void;
  fontSize?: string; fontWeight?: number; color?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const commit = () => { if (draft.trim()) onSave(draft.trim()); setEditing(false); };
  if (!editing) {
    return (
      <button
        onClick={() => { setDraft(value); setEditing(true); }}
        className="text-left hover:underline decoration-dotted underline-offset-2 cursor-text"
        style={{ ...S, fontSize, fontWeight, color }}
      >
        {value}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5 flex-1">
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEditing(false); }}
        className="flex-1 border border-[#0a1628] px-2 py-1 outline-none min-w-0"
        style={{ ...S, fontSize, fontWeight, color }}
      />
      <button onClick={commit} className="p-1 hover:bg-green-50"><Check size={13} className="text-green-600" /></button>
      <button onClick={() => setEditing(false)} className="p-1 hover:bg-red-50"><X size={13} className="text-red-400" /></button>
    </div>
  );
}

// ─── Module Card ──────────────────────────────────────────────────────────────

function ModuleCard({
  mod, isFirst, isLast, linkedSessionCount,
}: {
  mod: LMSModule; isFirst: boolean; isLast: boolean; linkedSessionCount: number;
}) {
  const { updateModule, deleteModule, reorderModule, addModuleItem, updateModuleItem, deleteModuleItem } = useLMS();
  const [expanded, setExpanded] = useState(true);
  const [addingItem, setAddingItem] = useState(false);
  const [newItemType, setNewItemType]   = useState<ModuleItemType>("video");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemUrl, setNewItemUrl]     = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(mod.description);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemDraft, setItemDraft] = useState("");

  const handleAddItem = () => {
    if (!newItemTitle.trim()) return;
    if (newItemType === "link" && !newItemUrl.trim()) return;
    addModuleItem(
      mod.id,
      newItemType,
      newItemTitle.trim(),
      newItemType === "link" ? newItemUrl.trim() : undefined,
    );
    setNewItemTitle("");
    setNewItemUrl("");
    setAddingItem(false);
  };

  return (
    <div className="bg-white border border-gray-200 overflow-hidden">
      {/* Module header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-[#fafafa]">
        {/* Order badge */}
        <div
          className="w-7 h-7 flex items-center justify-center flex-shrink-0 bg-[#0a1628] text-white"
          style={{ ...S, fontSize: "12px", fontWeight: 700 }}
        >
          {mod.order}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <InlineEdit
            value={mod.title}
            onSave={(v) => updateModule(mod.id, { title: v })}
            fontSize="14px"
            fontWeight={600}
          />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {linkedSessionCount > 0 && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100"
              style={{ ...S, fontSize: "10px", fontWeight: 600 }}
            >
              <Link2 size={9} />
              {linkedSessionCount} session{linkedSessionCount > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-[#6c6c6c]" style={{ ...S, fontSize: "11px" }}>
            {mod.items.length} item{mod.items.length !== 1 ? "s" : ""}
          </span>
          {/* Reorder */}
          <div className="flex flex-col gap-0">
            <button
              disabled={isFirst}
              onClick={() => reorderModule(mod.id, "up")}
              className="p-0.5 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-default"
            >
              <ChevronUpIcon size={13} className="text-[#6c6c6c]" />
            </button>
            <button
              disabled={isLast}
              onClick={() => reorderModule(mod.id, "down")}
              className="p-0.5 hover:bg-gray-100 disabled:opacity-20 disabled:cursor-default"
            >
              <ChevronDown size={13} className="text-[#6c6c6c]" />
            </button>
          </div>
          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => deleteModule(mod.id)}
                className="px-2 py-0.5 bg-red-600 text-white hover:bg-red-700"
                style={{ ...S, fontSize: "11px" }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 border border-gray-200 hover:bg-gray-50"
                style={{ ...S, fontSize: "11px" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 hover:bg-red-50 group">
              <Trash2 size={13} className="text-gray-300 group-hover:text-red-400" />
            </button>
          )}
          {/* Expand toggle */}
          <button onClick={() => setExpanded((e) => !e)} className="p-1.5 hover:bg-gray-100">
            {expanded ? <ChevronUp size={15} className="text-[#6c6c6c]" /> : <ChevronDown size={15} className="text-[#6c6c6c]" />}
          </button>
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 pt-3">
          {/* Description */}
          {editingDesc ? (
            <div className="flex flex-col gap-1.5 mb-4">
              <textarea
                autoFocus
                rows={2}
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                className="border border-[#0a1628] px-3 py-2 outline-none resize-none w-full"
                style={{ ...S, fontSize: "13px", color: "#4a4a4a" }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { updateModule(mod.id, { description: descDraft.trim() || mod.description }); setEditingDesc(false); }}
                  className="flex items-center gap-1 px-3 py-1 bg-[#0a1628] text-white hover:bg-[#0a1628]/90"
                  style={{ ...S, fontSize: "12px" }}
                >
                  <Check size={11} /> Save
                </button>
                <button onClick={() => setEditingDesc(false)} className="px-3 py-1 border border-gray-200 hover:bg-gray-50" style={{ ...S, fontSize: "12px" }}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 mb-4 group">
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", lineHeight: 1.6, flex: 1 }}>
                {mod.description}
              </p>
              <button
                onClick={() => { setDescDraft(mod.description); setEditingDesc(true); }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 mt-0.5 flex-shrink-0"
              >
                <Pencil size={11} className="text-[#6c6c6c]" />
              </button>
            </div>
          )}

          {/* Items list */}
          {mod.items.length > 0 && (
            <div className="flex flex-col divide-y divide-gray-50 mb-3 border border-gray-100">
              {mod.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 py-1.5 pl-4 group">
                  <GripVertical size={11} className="text-gray-300 flex-shrink-0" />
                  {itemIcon(item.type)}
                  <div className="flex-1 min-w-0">
                    <span style={{ ...S, fontSize: "13px", color: "#0a1628" }}>{item.title}</span>
                    {item.type === "link" && item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate hover:underline"
                        style={{ ...S, fontSize: "10px", color: "#d4a574", marginTop: 1 }}
                      >
                        {item.url}
                      </a>
                    )}
                  </div>
                  <span
                    style={{ ...S, fontSize: "10px", color: "#b0b0b0", flexShrink: 0 }}
                    className="opacity-0 group-hover:opacity-100"
                  >
                    {ITEM_TYPE_OPTIONS.find((o) => o.value === item.type)?.label}
                  </span>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <button
                      onClick={() => { setEditingItemId(item.id); setItemDraft(item.title); }}
                      className="p-1 hover:bg-gray-100"
                    >
                      <Pencil size={11} className="text-[#6c6c6c]" />
                    </button>
                    <button
                      onClick={() => deleteModuleItem(mod.id, item.id)}
                      className="p-1 hover:bg-red-50"
                    >
                      <Trash2 size={11} className="text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add item form */}
          {addingItem ? (
            <div className="flex flex-col gap-2 border border-[#0a1628] p-2 bg-[#f5f6f8]">
              <div className="flex items-center gap-2">
                <select
                  value={newItemType}
                  onChange={(e) => { setNewItemType(e.target.value as ModuleItemType); setNewItemUrl(""); }}
                  className="border border-gray-200 px-2 py-1 outline-none bg-white flex-shrink-0"
                  style={{ ...S, fontSize: "12px", color: "#0a1628" }}
                >
                  {ITEM_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  autoFocus
                  placeholder="Item title…"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && newItemType !== "link") handleAddItem(); if (e.key === "Escape") setAddingItem(false); }}
                  className="flex-1 border border-gray-200 px-2 py-1 outline-none bg-white"
                  style={{ ...S, fontSize: "12px" }}
                />
                {newItemType !== "link" && (
                  <>
                    <button
                      onClick={handleAddItem}
                      className="px-3 py-1 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 flex-shrink-0"
                      style={{ ...S, fontSize: "12px" }}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setAddingItem(false); setNewItemTitle(""); setNewItemUrl(""); }}
                      className="p-1.5 hover:bg-gray-100 flex-shrink-0"
                    >
                      <X size={13} className="text-[#6c6c6c]" />
                    </button>
                  </>
                )}
              </div>

              {/* URL row — shown only for Link type */}
              {newItemType === "link" && (
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6c6c6c]" />
                    <input
                      placeholder="https://…"
                      value={newItemUrl}
                      onChange={(e) => setNewItemUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddItem(); if (e.key === "Escape") setAddingItem(false); }}
                      className="w-full border border-gray-200 pl-6 pr-2 py-1 outline-none bg-white"
                      style={{ ...S, fontSize: "12px" }}
                    />
                  </div>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemTitle.trim() || !newItemUrl.trim()}
                    className="px-3 py-1 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ ...S, fontSize: "12px" }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAddingItem(false); setNewItemTitle(""); setNewItemUrl(""); }}
                    className="p-1.5 hover:bg-gray-100 flex-shrink-0"
                  >
                    <X size={13} className="text-[#6c6c6c]" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setAddingItem(true)}
              className="flex items-center gap-1.5 text-[#6c6c6c] hover:text-[#0a1628] transition-colors"
              style={{ ...S, fontSize: "12px" }}
            >
              <Plus size={13} />
              Add item
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ModulesPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const courseLabel = courseTitleWithTracks(course);

  const { modules, sessions, addModule } = useLMS();

  const courseModules = modules
    .filter((m) => m.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  // count sessions linked per module
  const sessionLinkCount = (modId: string) =>
    sessions.filter((s) => s.linkedModuleId === modId).length;

  // Add-module form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const handleAddModule = () => {
    if (!newTitle.trim()) return;
    addModule(courseId, newTitle.trim(), newDesc.trim() || `Introduction to ${newTitle.trim()}.`);
    setNewTitle("");
    setNewDesc("");
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[
          { label: "Home" },
          { label: "My Courses", href: "/instructor/courses" },
          { label: courseLabel, href: `/instructor/courses/${courseId}` },
          { label: "Modules" },
        ]}
      />
      <ProfileBanner name="Prof Mensah Oduro" role="Instructor" />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Back */}
          <button
            onClick={() => navigate(`/instructor/courses/${courseId}`)}
            className="flex items-center gap-2 text-[#6c6c6c] hover:text-[#0a1628] transition-colors w-fit"
            style={{ ...S, fontSize: "13px" }}
          >
            <ArrowLeft size={14} /> Back to {courseLabel}
          </button>

          {/* Page header */}
          <div className="bg-[#0a1628] px-6 py-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Video size={14} className="text-[#d4a574]" />
                <span style={{ ...S, fontSize: "11px", color: "#d4a574", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {courseShortWithTracks(course)}
                </span>
              </div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "18px", color: "#faf8f5" }}>
                Module Manager
              </h1>
              <p style={{ ...S, fontSize: "12px", color: "rgba(250,248,245,0.6)", marginTop: 2 }}>
                {courseModules.length} module{courseModules.length !== 1 ? "s" : ""} · {courseModules.reduce((s, m) => s + m.items.length, 0)} total items
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/instructor/calendar")}
                className="flex items-center gap-2 px-4 h-9 border border-white/20 text-white/80 hover:border-white hover:text-white transition-colors"
                style={{ ...S, fontSize: "12px" }}
              >
                <CalendarDays size={13} /> Schedule Classes
              </button>
              <button
                onClick={() => { setShowAddForm(true); setNewTitle(""); setNewDesc(""); }}
                className="flex items-center gap-2 px-4 h-9 bg-[#d4a574] text-[#0a1628] hover:bg-[#c8955f] transition-colors"
                style={{ ...S, fontSize: "12px", fontWeight: 700 }}
              >
                <Plus size={13} /> Add Module
              </button>
            </div>
          </div>

          {/* Add module form */}
          {showAddForm && (
            <div className="bg-white border-2 border-[#0a1628] p-5 flex flex-col gap-3">
              <p style={{ ...S, fontSize: "13px", fontWeight: 700, color: "#0a1628" }}>New Module</p>
              <input
                autoFocus
                placeholder="Module title (e.g. Introduction to Costing Methods)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddModule(); if (e.key === "Escape") setShowAddForm(false); }}
                className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] w-full"
                style={{ ...S, fontSize: "13px" }}
              />
              <textarea
                rows={2}
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="border border-gray-200 px-3 py-2 outline-none focus:border-[#0a1628] resize-none w-full"
                style={{ ...S, fontSize: "13px" }}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddModule}
                  disabled={!newTitle.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ ...S, fontSize: "13px", fontWeight: 600 }}
                >
                  <Check size={13} /> Save Module
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50"
                  style={{ ...S, fontSize: "13px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Module list */}
          {courseModules.length === 0 ? (
            <div className="bg-white border border-gray-200 py-16 flex flex-col items-center gap-4">
              <BookOpen size={40} className="text-gray-200" />
              <div className="text-center">
                <p style={{ ...S, fontSize: "15px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>
                  No modules yet
                </p>
                <p style={{ ...S, fontSize: "13px", color: "#6c6c6c" }}>
                  Click "Add Module" to start building your course content.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-5 py-2 bg-[#0a1628] text-white hover:bg-[#0a1628]/90"
                style={{ ...S, fontSize: "13px", fontWeight: 600 }}
              >
                <Plus size={14} /> Add First Module
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {courseModules.map((mod, idx) => (
                <ModuleCard
                  key={mod.id}
                  mod={mod}
                  isFirst={idx === 0}
                  isLast={idx === courseModules.length - 1}
                  linkedSessionCount={sessionLinkCount(mod.id)}
                />
              ))}
            </div>
          )}

          {/* Tips */}
          {courseModules.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 px-4 py-3 flex items-start gap-3">
              <Link2 size={14} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p style={{ ...S, fontSize: "12px", color: "#3b82f6", lineHeight: 1.6 }}>
                <strong>Tip:</strong> Once you've set up modules, go to{" "}
                <button
                  onClick={() => navigate("/instructor/calendar")}
                  className="underline font-semibold hover:text-blue-800"
                >
                  Schedule Classes
                </button>{" "}
                and link each class session to the module it will cover. Students will see what's being taught before joining.
              </p>
            </div>
          )}
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