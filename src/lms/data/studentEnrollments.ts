/** Demo student cohort per course — keep in sync across student pages. */
export type StudentEnrollmentCohort = "Weekday" | "Weekend" | "All";

export const STUDENT_DEMO_ENROLLMENTS: { courseId: number; cohort: "Weekday" | "Weekend" }[] = [
  { courseId: 1, cohort: "Weekend" },
  { courseId: 2, cohort: "Weekend" },
  { courseId: 3, cohort: "Weekday" },
];

export function getStudentEnrollmentCohort(courseId: number): StudentEnrollmentCohort {
  const row = STUDENT_DEMO_ENROLLMENTS.find((e) => e.courseId === courseId);
  return row?.cohort ?? "All";
}
