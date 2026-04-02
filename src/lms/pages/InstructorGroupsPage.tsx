import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Users, ArrowRight, Search, ChevronDown, ChevronRight } from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { InstructorSidebar } from "../components/InstructorSidebar";
import { GROUPS, type Group } from "../data/groups";
import { COURSES, type Course } from "../data/courses";
import { courseDisplayTitleWithTrack } from "../lib/courseLabels";

const S = { fontFamily: "Inter, sans-serif" };

const statusBadge = (status: Group["status"]) => {
  switch (status) {
    case "open":
      return { className: "bg-green-50 text-green-700 border-green-200", label: "Open" };
    case "full":
      return { className: "bg-[#fdf3e7] text-[#a68b5b] border-[#d4a574]/40", label: "Full" };
    case "locked":
      return { className: "bg-[#f3f3f5] text-[#5a5a62] border-[#dcdce0]", label: "Locked" };
    default:
      return { className: "bg-[#f3f3f5] text-[#5a5a62] border-[#dcdce0]", label: status };
  }
};

export function InstructorGroupsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedCourses, setCollapsedCourses] = useState<Record<number, boolean>>({});

  const instructorGroups = useMemo(() => GROUPS, []);

  const courseById = useMemo(() => {
    const map = new Map<number, Course>();
    COURSES.forEach((c) => map.set(c.id, c));
    return map;
  }, []);

  // Group by course
  const groupsByCourse = useMemo(() => {
    const map = new Map<number, Group[]>();
    instructorGroups.forEach((g) => {
      const arr = map.get(g.courseId) || [];
      arr.push(g);
      map.set(g.courseId, arr);
    });
    return Array.from(map.entries()).map(([courseId, groups]) => ({
      courseId,
      course: courseById.get(courseId),
      groups,
    }));
  }, [instructorGroups, courseById]);

  // Search filter
  const filtered = searchQuery
    ? groupsByCourse.map((section) => ({
        ...section,
        groups: section.groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase())),
      })).filter((section) => section.groups.length > 0)
    : groupsByCourse;

  // Summary stats
  const totalGroups = instructorGroups.length;
  const totalAssigned = new Set(instructorGroups.flatMap((g) => g.members.map((m) => m.studentId))).size;
  const totalMembers = instructorGroups.reduce((sum, g) => sum + g.members.length, 0);

  const toggleCourse = (courseId: number) =>
    setCollapsedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[{ label: "Home" }, { label: "Groups" }]}
        instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES"
        showAvatar
      />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <InstructorSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 style={{ ...S, fontWeight: 700, fontSize: "22px", color: "#0a1628" }}>All Course Groups</h1>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                {totalGroups} group{totalGroups !== 1 ? "s" : ""} across {groupsByCourse.length} course{groupsByCourse.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p style={{ ...S, fontSize: "22px", fontWeight: 800, color: "#0a1628" }}>{totalGroups}</p>
              <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>Total Groups</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p style={{ ...S, fontSize: "22px", fontWeight: 800, color: "#0a1628" }}>{totalAssigned}</p>
              <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>Students Assigned</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p style={{ ...S, fontSize: "22px", fontWeight: 800, color: "#d4a574" }}>{totalMembers}</p>
              <p style={{ ...S, fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>Total Memberships</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8e96]" />
            <input
              type="text"
              placeholder="Search groups across all courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-sm pl-8 pr-3 py-2 border border-gray-200 bg-white text-[#0a1628] placeholder-[#b0b0b5] outline-none focus:border-[#0a1628] rounded-lg"
              style={{ ...S, fontSize: "13px" }}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <Users size={44} className="mx-auto mb-3 text-[#d4a574]" />
              <p style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>{searchQuery ? "No groups match your search" : "No groups yet"}</p>
              <p style={{ ...S, fontSize: "13px", color: "#6c6c6c", marginTop: 6 }}>
                {searchQuery ? "Try a different search term." : "Create groups inside a course to start assigning students."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((section) => {
                const isCollapsed = collapsedCourses[section.courseId];
                const courseLabel = section.course ? section.course.title : `Course ${section.courseId}`;
                return (
                  <div key={section.courseId} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Collapsible course header */}
                    <button
                      onClick={() => toggleCourse(section.courseId)}
                      className="flex items-center gap-3 w-full text-left px-5 py-4 hover:bg-[#fafafb] transition-colors"
                    >
                      {isCollapsed ? <ChevronRight size={16} className="text-[#8e8e96]" /> : <ChevronDown size={16} className="text-[#8e8e96]" />}
                      <div className="flex-1 min-w-0">
                        <p style={{ ...S, fontSize: "15px", fontWeight: 700, color: "#0a1628" }}>{courseLabel}</p>
                      </div>
                      <span style={{ ...S, fontSize: "12px", color: "#8e8e96", fontWeight: 600 }}>
                        {section.groups.length} group{section.groups.length !== 1 ? "s" : ""}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="border-t border-gray-100 divide-y divide-gray-100">
                        {section.groups.map((g) => {
                          const badge = statusBadge(g.status);
                          return (
                            <div key={g.id} className="px-5 py-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p style={{ ...S, fontSize: "14px", fontWeight: 700, color: "#0a1628" }}>{g.name}</p>
                                    <span className="text-[#8e8e96]" style={{ ...S, fontSize: "11px" }}>({g.track})</span>
                                  </div>
                                  <p style={{ ...S, fontSize: "12px", color: "#6c6c6c", marginTop: 4 }}>
                                    {g.members.length} member{g.members.length !== 1 ? "s" : ""} · max {g.maxSize}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badge.className}`}
                                    style={S}
                                  >
                                    {badge.label}
                                  </span>
                                  <button
                                    onClick={() => navigate(`/instructor/courses/${g.courseId}?track=${g.track}`)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a1628] text-white hover:bg-[#0d1e35] transition-colors"
                                    style={{ ...S, fontSize: "11px", fontWeight: 700 }}
                                  >
                                    Manage <ArrowRight size={12} />
                                  </button>
                                </div>
                              </div>

                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {g.members.slice(0, 6).map((m) => (
                                  <span
                                    key={m.studentId}
                                    className="px-2 py-0.5 rounded-full bg-[#f3f3f5] text-[#5a5a62] border border-[#ededf0]"
                                    style={{ ...S, fontSize: "10px", fontWeight: 600 }}
                                  >
                                    {m.initials} · {m.name}
                                  </span>
                                ))}
                                {g.members.length > 6 && (
                                  <span className="px-2 py-0.5 rounded-full bg-[#f3f3f5] text-[#5a5a62] border border-[#ededf0]" style={{ ...S, fontSize: "10px", fontWeight: 700 }}>
                                    +{g.members.length - 6} more
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

