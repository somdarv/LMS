/** Compact cohort labels for calendar chips and badges (Weekday / Weekend / Both). */
export function cohortShortLabel(cohort: "Weekday" | "Weekend" | "Both"): string {
  switch (cohort) {
    case "Both":
      return "All";
    case "Weekday":
      return "WD";
    case "Weekend":
      return "WE";
    default:
      return cohort;
  }
}
