import type { RouteObject } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { DemoLanding } from "./pages/DemoLanding";
import { InviteLoginPage } from "./pages/InviteLoginPage";
import { AccountSetupPage } from "./pages/AccountSetupPage";
import { RoleAcceptancePage } from "./pages/RoleAcceptancePage";
import { InstructorDashboard } from "./pages/InstructorDashboard";
import { ErrorPage } from "./pages/ErrorPage";
import { AssignmentsPage } from "./pages/AssignmentsPage";
import { StudentsPage } from "./pages/StudentsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { GradebooksPage } from "./pages/GradebooksPage";
import { MyCoursesPage } from "./pages/MyCoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { UploadContentPage } from "./pages/UploadContentPage";
import { CreateAssignmentPage } from "./pages/CreateAssignmentPage";
import { CreateQuizPage } from "./pages/CreateQuizPage";
import { BrandingPage } from "./pages/BrandingPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ModulesPage } from "./pages/ModulesPage";
import { CommunicationsPage } from "./pages/CommunicationsPage";
import { GradingCenterPage } from "./pages/GradingCenterPage";
import { ArchitecturePage } from "./pages/ArchitecturePage";
import { InstructorGroupsPage } from "./pages/InstructorGroupsPage";
import { TermsConditionsPage } from "./pages/TermsConditionsPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

// Student pages
import { StudentEnrollPage } from "./pages/StudentEnrollPage";
import { StudentEnrollSuccessPage } from "./pages/StudentEnrollSuccessPage";
import { StudentPasswordSetupPage } from "./pages/StudentPasswordSetupPage";
import { StudentPendingPage } from "./pages/StudentPendingPage";
import { StudentLoginPage } from "./pages/StudentLoginPage";
import { StudentPasswordResetPage } from "./pages/StudentPasswordResetPage";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentCoursesPage } from "./pages/StudentCoursesPage";
import { StudentCourseDetailPage } from "./pages/StudentCourseDetailPage";
import { StudentAssignmentsPage } from "./pages/StudentAssignmentsPage";
import { StudentQuizzesPage } from "./pages/StudentQuizzesPage";
import { StudentGradesPage } from "./pages/StudentGradesPage";
import { StudentCalendarPage } from "./pages/StudentCalendarPage";
import { StudentCommunicationsPage } from "./pages/StudentCommunicationsPage";
import { StudentGroupsPage } from "./pages/StudentGroupsPage";

// Admin pages
import { AdminGenerateEnrollmentPage } from "./pages/AdminGenerateEnrollmentPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminCoursesPage } from "./pages/AdminCoursesPage";
import { AdminCreateCoursePage } from "./pages/AdminCreateCoursePage";
import { AdminCreateCustomCoursePage } from "./pages/AdminCreateCustomCoursePage";
import { AdminCohortsPage } from "./pages/AdminCohortsPage";

export const lmsRoutes: RouteObject[] = [
  {
    Component: RootLayout,
    children: [
      { path: "/",                              Component: DemoLanding },
      { path: "/invite/instructor",             Component: InviteLoginPage },
      { path: "/invite/instructor/setup",       Component: AccountSetupPage },
      { path: "/invite/expired",                Component: ErrorPage },
      { path: "/invite/invalid",                Component: ErrorPage },
      { path: "/instructor/welcome",            Component: RoleAcceptancePage },
      { path: "/instructor/dashboard",          Component: InstructorDashboard },
      { path: "/instructor/courses",            Component: MyCoursesPage },
      { path: "/instructor/courses/:id",        Component: CourseDetailPage },
      { path: "/instructor/courses/:id/upload-content",    Component: UploadContentPage },
      { path: "/instructor/courses/:id/create-assignment", Component: CreateAssignmentPage },
      { path: "/instructor/courses/:id/create-quiz",       Component: CreateQuizPage },
      { path: "/instructor/courses/:id/grading/:assignmentId", Component: GradingCenterPage },
      { path: "/instructor/upload-content",     Component: UploadContentPage },
      { path: "/instructor/create-assignment",  Component: CreateAssignmentPage },
      { path: "/instructor/create-quiz",        Component: CreateQuizPage },
      { path: "/instructor/assignments",        Component: AssignmentsPage },
      { path: "/instructor/students",           Component: StudentsPage },
      { path: "/instructor/attendance",         Component: AttendancePage },
      { path: "/instructor/gradebooks",         Component: GradebooksPage },
      { path: "/instructor/branding",           Component: BrandingPage },
      { path: "/instructor/calendar",           Component: CalendarPage },
      { path: "/instructor/courses/:id/modules", Component: ModulesPage },
      { path: "/instructor/communications",      Component: CommunicationsPage },
      { path: "/instructor/grading/:assignmentId", Component: GradingCenterPage },
      { path: "/instructor/architecture",        Component: ArchitecturePage },
      { path: "/instructor/groups",            Component: InstructorGroupsPage },

      // Legal pages (public)
      { path: "/terms-conditions",            Component: TermsConditionsPage },
      { path: "/privacy-policy",             Component: PrivacyPolicyPage },

      // Admin routes
      { path: "/admin/dashboard",                 Component: AdminDashboardPage },
      { path: "/admin/enrollment-links",           Component: AdminGenerateEnrollmentPage },
      { path: "/admin/courses",                    Component: AdminCoursesPage },
      { path: "/admin/courses/create",             Component: AdminCreateCoursePage },
      { path: "/admin/courses/create-custom",      Component: AdminCreateCustomCoursePage },
      { path: "/admin/cohorts",                    Component: AdminCohortsPage },

      // Student routes
      { path: "/student/enroll",                Component: StudentEnrollPage },
      { path: "/student/enroll/success",        Component: StudentEnrollSuccessPage },
      { path: "/student/password-setup",        Component: StudentPasswordSetupPage },
      { path: "/student/pending",               Component: StudentPendingPage },
      { path: "/student/login",                 Component: StudentLoginPage },
      { path: "/student/password-reset",        Component: StudentPasswordResetPage },
      { path: "/student/dashboard",             Component: StudentDashboard },
      { path: "/student/courses",               Component: StudentCoursesPage },
      { path: "/student/courses/:id",           Component: StudentCourseDetailPage },
      { path: "/student/assignments",           Component: StudentAssignmentsPage },
      { path: "/student/quizzes",               Component: StudentQuizzesPage },
      { path: "/student/grades",                Component: StudentGradesPage },
      { path: "/student/calendar",              Component: StudentCalendarPage },
      { path: "/student/communications",        Component: StudentCommunicationsPage },
      { path: "/student/groups",               Component: StudentGroupsPage },
    ],
  },
];