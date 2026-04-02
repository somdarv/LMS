/** Demo student cohort per course — keep in sync across student pages. */
export type StudentEnrollmentCohort = "Weekday" | "Weekend" | "All";
export type StudentEnrollmentStatus = "Active" | "Past";

export interface StudentCourseEnrollment {
  enrollmentId: string;
  courseId: number;
  cohort: "Weekday" | "Weekend";
  status: StudentEnrollmentStatus;
  term: string;
  finalGrade?: number;
  completedOn?: string;
}

export const STUDENT_DEMO_ENROLLMENTS: { courseId: number; cohort: "Weekday" | "Weekend" }[] = [
  { courseId: 1, cohort: "Weekend" },
  { courseId: 2, cohort: "Weekend" },
  { courseId: 3, cohort: "Weekday" },
];

// Full enrollment history used for "Active vs Past" course categorization.
export const STUDENT_DEMO_COURSE_ENROLLMENTS: StudentCourseEnrollment[] = [
  { enrollmentId: "enr-a-1", courseId: 1, cohort: "Weekend", status: "Active", term: "May 2025 Sitting" },
  { enrollmentId: "enr-a-2", courseId: 2, cohort: "Weekend", status: "Active", term: "May 2025 Sitting" },
  { enrollmentId: "enr-a-3", courseId: 3, cohort: "Weekday", status: "Active", term: "May 2025 Sitting" },

  // Past demo enrollments
  { enrollmentId: "enr-p-1", courseId: 1, cohort: "Weekday", status: "Past", term: "Nov 2024 Sitting", finalGrade: 72, completedOn: "2024-11-30" },
  { enrollmentId: "enr-p-2", courseId: 2, cohort: "Weekend", status: "Past", term: "Nov 2024 Sitting", finalGrade: 68, completedOn: "2024-11-30" },
  { enrollmentId: "enr-p-3", courseId: 3, cohort: "Weekday", status: "Past", term: "May 2024 Sitting", finalGrade: 74, completedOn: "2024-05-28" },
];

export function getStudentEnrollmentCohort(courseId: number): StudentEnrollmentCohort {
  const row = STUDENT_DEMO_ENROLLMENTS.find((e) => e.courseId === courseId);
  return row?.cohort ?? "All";
}
