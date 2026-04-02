export type StudentTrack = "Weekday" | "Weekend" | "All";

export interface StudentProfile {
  id: number;
  name: string;
  initials: string;
  email: string;
  studentId: string;
}

const FIRST = [
  "Akua", "Kwame", "Yaa", "Kofi", "Ama", "Kojo", "Abena", "Nana", "Efua", "Yaw",
  "Akosua", "Esi", "Adwoa", "Mawuli", "Selorm", "Nii", "Dzifa", "Oheneba", "Mavis", "Eyram",
  "Bernice", "Priscilla", "Samuel", "Joseph", "Daniel", "Esther", "Beatrice", "Michael", "David", "Grace",
  "Ibrahim", "Hafsa", "Amina", "Farida", "Abdul", "Latif", "Mariam", "Sule", "Hassan", "Safia",
];

const LAST = [
  "Mensah", "Asante", "Osei", "Boateng", "Addo", "Owusu", "Darko", "Frimpong", "Appiah", "Adu",
  "Amponsah", "Boadu", "Kwakye", "Oppong", "Nyarko", "Adjei", "Acheampong", "Abakah", "Gyasi", "Sarpong",
  "Annan", "Kumi", "Tetteh", "Quaye", "Ayitey", "Koranteng", "Obeng", "Baffour", "Akoto", "Agyeman",
];

function initialsFromName(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function pad(n: number, width = 3): string {
  return String(n).padStart(width, "0");
}

function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function buildRoster(courseId: number, track: Exclude<StudentTrack, "All">, count: number): StudentProfile[] {
  const base = courseId * 10000 + (track === "Weekday" ? 1000 : 2000);
  const list: StudentProfile[] = [];

  for (let i = 0; i < count; i += 1) {
    const idx = base + i;
    const first = seededPick(FIRST, idx);
    const last = seededPick(LAST, idx * 7 + 13);
    const name = `${first} ${last}`;
    const id = idx;
    const studentId = `STD-${courseId}-${track === "Weekday" ? "WD" : "WE"}-${pad(i + 1, 3)}`;
    list.push({
      id,
      name,
      initials: initialsFromName(name),
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@somda.edu.gh`,
      studentId,
    });
  }

  return list;
}

// Tunable counts per course to support group generation testing.
const COURSE_COUNTS: Record<number, { Weekday: number; Weekend: number }> = {
  1: { Weekday: 46, Weekend: 38 },
  2: { Weekday: 53, Weekend: 42 },
  3: { Weekday: 48, Weekend: 40 },
  4: { Weekday: 38, Weekend: 38 },
  5: { Weekday: 38, Weekend: 38 },
};

const ROSTERS: Record<number, { Weekday: StudentProfile[]; Weekend: StudentProfile[] }> = Object.fromEntries(
  Object.entries(COURSE_COUNTS).map(([courseIdStr, counts]) => {
    const courseId = Number(courseIdStr);
    return [
      courseId,
      {
        Weekday: buildRoster(courseId, "Weekday", counts.Weekday),
        Weekend: buildRoster(courseId, "Weekend", counts.Weekend),
      },
    ];
  })
) as Record<number, { Weekday: StudentProfile[]; Weekend: StudentProfile[] }>;

export function getCourseStudents(courseId: number, track: StudentTrack): StudentProfile[] {
  const roster = ROSTERS[courseId];
  if (!roster) return [];
  if (track === "Weekday") return roster.Weekday;
  if (track === "Weekend") return roster.Weekend;
  // "All" – merge + de-dupe
  const byId = new Map<number, StudentProfile>();
  [...roster.Weekday, ...roster.Weekend].forEach((s) => byId.set(s.id, s));
  return Array.from(byId.values());
}

export function getAllCourseStudents(courseIds: number[], track: StudentTrack): StudentProfile[] {
  const byId = new Map<number, StudentProfile>();
  courseIds.forEach((courseId) => {
    getCourseStudents(courseId, track).forEach((s) => byId.set(s.id, s));
  });
  return Array.from(byId.values());
}

