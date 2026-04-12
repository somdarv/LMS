import { useState } from "react";
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  CalendarRange,
  CalendarDays,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { AdminSidebar } from "../components/AdminSidebar";
import { useLMS, PERIOD_TYPE_LABELS, PERIOD_UNITS, type PeriodType, type Cohort } from "../context/LMSContext";

const PERIOD_TYPE_ICONS: Record<PeriodType, typeof Clock> = {
  "time-of-day": Clock,
  "day-of-week": CalendarDays,
  "quarter": CalendarRange,
  "half-year": Calendar,
  "month": Calendar,
};

const font = { fontFamily: "Inter, sans-serif" } as const;

export function AdminCohortsPage() {
  const { cohorts, addCohort, updateCohort, deleteCohort } = useLMS();

  const [showModal, setShowModal] = useState(false);
  const [editingCohort, setEditingCohort] = useState<Cohort | null>(null);

  const handleEdit = (cohort: Cohort) => {
    setEditingCohort(cohort);
    setShowModal(true);
  };

  const handleCreate = () => {
    setEditingCohort(null);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    deleteCohort(id);
  };

  // Group cohorts by period type for display
  const grouped = cohorts.reduce<Record<PeriodType, Cohort[]>>((acc, c) => {
    (acc[c.periodType] ??= []).push(c);
    return acc;
  }, {} as Record<PeriodType, Cohort[]>);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col" style={font}>
      <AlmsHeader breadcrumb={[{ label: "Admin", href: "/admin/dashboard" }, { label: "Cohorts" }]} instituteName="ALMS" showAvatar />

      {/* Banner */}
      <div className="relative w-full h-35 bg-[#0a1628] overflow-hidden flex items-end">
        <div className="absolute right-0 top-0 w-85 h-85 rounded-full border border-[#2a3a5c] opacity-30" style={{ transform: "translate(40%, -40%)" }} />
        <div className="relative z-10 px-6 pb-6 max-w-300 mx-auto w-full">
          <h1 style={{ ...font, fontWeight: 700, fontSize: "26px", color: "#FAF8F5" }}>Cohort Management</h1>
          <p style={{ ...font, fontSize: "13px", color: "#b0b5bf", marginTop: 4 }}>
            Configure cohorts to define when and how courses are scheduled.
          </p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-300 mx-auto w-full">
        <AdminSidebar />

        <main className="flex-1">
          {/* Action bar */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[#6c6c6c]" style={{ ...font, fontSize: "13px" }}>
              {cohorts.length} cohort{cohorts.length !== 1 ? "s" : ""} configured
            </p>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors"
              style={{ ...font, fontSize: "13px", fontWeight: 600 }}
            >
              <Plus size={16} />
              Create Cohort
            </button>
          </div>

          {/* Cohort cards grouped by period type */}
          {cohorts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <CalendarDays size={40} className="mx-auto text-gray-300 mb-3" />
              <p style={{ ...font, fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>No cohorts yet</p>
              <p style={{ ...font, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                Create your first cohort to start organising courses by schedule.
              </p>
              <button
                onClick={handleCreate}
                className="mt-4 px-5 py-2.5 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors"
                style={{ ...font, fontSize: "13px", fontWeight: 600 }}
              >
                <Plus size={14} className="inline mr-1.5 -mt-0.5" />
                Create Cohort
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {(Object.entries(grouped) as [PeriodType, Cohort[]][]).map(([type, items]) => {
                const Icon = PERIOD_TYPE_ICONS[type];
                return (
                  <div key={type}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} className="text-[#d4a574]" />
                      <h2 style={{ ...font, fontWeight: 600, fontSize: "14px", color: "#0a1628" }}>
                        {PERIOD_TYPE_LABELS[type]}
                      </h2>
                      <span className="text-[11px] text-[#6c6c6c] bg-gray-100 px-2 py-0.5 rounded-full" style={font}>
                        {items.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((cohort) => (
                        <CohortCard
                          key={cohort.id}
                          cohort={cohort}
                          onEdit={() => handleEdit(cohort)}
                          onDelete={() => handleDelete(cohort.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-gray-200 flex items-center justify-between max-w-300 mx-auto w-full">
        <p className="text-[#6c6c6c]" style={{ ...font, fontSize: "12px" }}>
          Copyright 2025 <span className="text-[#d4a574]">© LMS.</span> All rights reserved.
        </p>
        <div className="flex items-center gap-3" style={{ ...font, fontSize: "13px" }}>
          <a href="/terms-conditions" className="text-[#0a1628] hover:text-[#d4a574]">Terms & Conditions</a>
          <span className="text-[#6c6c6c]">|</span>
          <a href="/privacy-policy" className="text-[#0a1628] hover:text-[#d4a574]">Privacy Policy</a>
        </div>
      </footer>

      {/* Create / Edit Modal */}
      {showModal && (
        <CohortModal
          cohort={editingCohort}
          onSave={(data) => {
            if (editingCohort) {
              updateCohort(editingCohort.id, data);
            } else {
              addCohort(data);
            }
            setShowModal(false);
            setEditingCohort(null);
          }}
          onClose={() => { setShowModal(false); setEditingCohort(null); }}
        />
      )}
    </div>
  );
}

/* ─── Cohort Card ──────────────────────────────────────────────────────────── */

function CohortCard({ cohort, onEdit, onDelete }: { cohort: Cohort; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 style={{ ...font, fontWeight: 600, fontSize: "15px", color: "#0a1628" }}>{cohort.name}</h3>
          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-[rgba(212,165,116,0.1)] text-[#d4a574] font-medium" style={font}>
            {PERIOD_TYPE_LABELS[cohort.periodType]}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 text-[#6c6c6c] hover:text-[#0a1628] transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-[#6c6c6c] hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Period pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {PERIOD_UNITS[cohort.periodType].map((unit) => (
          <span
            key={unit}
            className={`text-[11px] px-2 py-1 rounded-md ${
              cohort.periods.includes(unit)
                ? "bg-[#0a1628] text-[#faf8f5] font-semibold"
                : "bg-gray-100 text-[#ccc]"
            }`}
            style={font}
          >
            {unit}
          </span>
        ))}
      </div>

      {cohort.description && (
        <p className="text-[#6c6c6c] leading-relaxed" style={{ ...font, fontSize: "12px" }}>
          {cohort.description}
        </p>
      )}
    </div>
  );
}

/* ─── Create / Edit Modal ──────────────────────────────────────────────────── */

function CohortModal({
  cohort,
  onSave,
  onClose,
}: {
  cohort: Cohort | null;
  onSave: (data: Omit<Cohort, "id">) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(cohort?.name ?? "");
  const [periodType, setPeriodType] = useState<PeriodType>(cohort?.periodType ?? "day-of-week");
  const [periods, setPeriods] = useState<string[]>(cohort?.periods ?? []);
  const [description, setDescription] = useState(cohort?.description ?? "");

  const handlePeriodTypeChange = (type: PeriodType) => {
    setPeriodType(type);
    setPeriods([]); // reset selections when type changes
  };

  const togglePeriod = (unit: string) => {
    setPeriods((prev) => (prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]));
  };

  const canSave = name.trim() && periods.length > 0;

  const handleSubmit = () => {
    if (!canSave) return;
    onSave({ name: name.trim(), periodType, periods, description: description.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-[520px] mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 style={{ ...font, fontWeight: 700, fontSize: "20px", color: "#0a1628" }}>
            {cohort ? "Edit Cohort" : "Create Cohort"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X size={16} className="text-[#6c6c6c]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5 overflow-y-auto flex-1 flex flex-col gap-5">
          {/* Name */}
          <div>
            <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
              Cohort Name
            </label>
            <input
              type="text"
              placeholder='e.g. "Weekday Morning", "Q1 2026"'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors"
              style={{ ...font, fontSize: "13px" }}
            />
          </div>

          {/* Period Type */}
          <div>
            <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
              Period Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(PERIOD_TYPE_LABELS) as PeriodType[]).map((type) => {
                const Icon = PERIOD_TYPE_ICONS[type];
                const active = periodType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePeriodTypeChange(type)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all text-left ${
                      active
                        ? "border-[#d4a574] bg-[rgba(212,165,116,0.06)]"
                        : "border-gray-200 bg-[#f8f8f9] hover:border-gray-300"
                    }`}
                  >
                    <Icon size={15} className={active ? "text-[#d4a574]" : "text-[#6c6c6c]"} />
                    <span style={{ ...font, fontSize: "12px", fontWeight: active ? 600 : 400, color: active ? "#0a1628" : "#6c6c6c" }}>
                      {PERIOD_TYPE_LABELS[type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Period Units */}
          <div>
            <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
              Select Periods
              <span className="ml-2 font-normal text-[#6c6c6c]">
                ({periods.length} of {PERIOD_UNITS[periodType].length} selected)
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {PERIOD_UNITS[periodType].map((unit) => {
                const active = periods.includes(unit);
                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => togglePeriod(unit)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      active
                        ? "bg-[#0a1628] text-[#faf8f5] border-[#0a1628] font-semibold"
                        : "border-gray-200 bg-[#f8f8f9] text-[#6c6c6c] hover:border-gray-300"
                    }`}
                    style={{ ...font, fontSize: "13px" }}
                  >
                    {unit}
                  </button>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setPeriods([...PERIOD_UNITS[periodType]])}
                className="text-[#d4a574] hover:underline"
                style={{ ...font, fontSize: "11px", fontWeight: 500 }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setPeriods([])}
                className="text-[#6c6c6c] hover:underline"
                style={{ ...font, fontSize: "11px", fontWeight: 500 }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ ...font, fontSize: "13px", fontWeight: 600, color: "#0a1628", display: "block", marginBottom: 8 }}>
              Description <span className="font-normal text-[#6c6c6c]">(optional)</span>
            </label>
            <textarea
              placeholder="Brief note about this cohort…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-[#f8f8f9] text-sm text-[#0a1628] outline-none focus:border-[#d4a574] transition-colors resize-none"
              style={{ ...font, fontSize: "13px" }}
            />
          </div>

          {/* Preview */}
          {periods.length > 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
              <p style={{ ...font, fontSize: "11px", fontWeight: 600, color: "#0a1628", marginBottom: 4 }}>Preview</p>
              <p style={{ ...font, fontSize: "12px", color: "#4a6fa5", lineHeight: 1.5 }}>
                Courses assigned to <strong>{name || "this cohort"}</strong> will be constrained to:{" "}
                <strong>{periods.join(", ")}</strong>{" "}
                ({PERIOD_TYPE_LABELS[periodType].toLowerCase()}).
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-[#6c6c6c] hover:bg-gray-50 transition-colors"
            style={{ ...font, fontSize: "13px", fontWeight: 500 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSave}
            className="px-5 py-2.5 bg-[#0a1628] text-[#faf8f5] rounded-lg hover:bg-[#0d1e35] transition-colors disabled:opacity-50"
            style={{ ...font, fontSize: "13px", fontWeight: 600 }}
          >
            {cohort ? "Save Changes" : "Create Cohort"}
          </button>
        </div>
      </div>
    </div>
  );
}
