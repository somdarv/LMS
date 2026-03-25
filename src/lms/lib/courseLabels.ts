import type { Course } from "../data/courses";
import type { StudentEnrollmentCohort } from "../data/studentEnrollments";
import { cohortShortLabel } from "./cohortLabels";

/** Map course.tracks to compact labels (WD / WE / All). */
export function formatCourseTracks(course: Course): string {
  const tracks = course.tracks ?? [];
  if (tracks.length === 0) return "";
  if (tracks.includes("All")) return "All";
  return tracks
    .map((tr) => {
      if (tr === "Weekday") return "WD";
      if (tr === "Weekend") return "WE";
      return tr;
    })
    .join(" · ");
}

/** e.g. "FA L1 · WD · WE" */
export function courseShortWithTracks(course: Course): string {
  const t = formatCourseTracks(course);
  return t ? `${course.shortCode} · ${t}` : course.shortCode;
}

/** e.g. "Financial Accounting Level 1 · WD · WE" */
export function courseTitleWithTracks(course: Course): string {
  const t = formatCourseTracks(course);
  return t ? `${course.title} · ${t}` : course.title;
}

/** Dropdowns / filters: full line with cohorts. */
export function courseSelectLabel(course: Course): string {
  const t = formatCourseTracks(course);
  return t ? `${course.shortCode} — ${course.title} · ${t}` : `${course.shortCode} — ${course.title}`;
}

/**
 * Instructor views: one row per track, or course detail ?track=Weekday|Weekend|All
 */
export function courseDisplayTitleWithTrack(course: Course, track: string): string {
  if (track === "All") {
    return courseTitleWithTracks(course);
  }
  if (track === "Weekday" || track === "Weekend") {
    return `${course.title} · ${cohortShortLabel(track)}`;
  }
  return course.title;
}

/** Student: enrolled cohort on that course. */
export function studentCourseTitle(course: Course, enrollment: StudentEnrollmentCohort): string {
  if (enrollment === "All") {
    return courseTitleWithTracks(course);
  }
  return `${course.title} · ${cohortShortLabel(enrollment)}`;
}

export function studentCourseShortLabel(course: Course, enrollment: StudentEnrollmentCohort): string {
  if (enrollment === "All") {
    return courseShortWithTracks(course);
  }
  return `${course.shortCode} · ${cohortShortLabel(enrollment)}`;
}
