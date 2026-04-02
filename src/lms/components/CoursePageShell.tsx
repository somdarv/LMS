import { useState, type ReactNode } from "react";
import { useParams } from "react-router";
import { AlmsHeader } from "./AlmsHeader";
import { CourseSidebar, type CourseTab } from "./CourseSidebar";
import { COURSES } from "../data/courses";
import { courseDisplayTitleWithTrack } from "../lib/courseLabels";
import { getCourseGroups } from "../data/groups";

/**
 * Shell for sub-pages rendered within the course view
 * (e.g. upload content, create assignment, create quiz, grading).
 * Shows AlmsHeader + CourseSidebar instead of InstructorSidebar.
 */
export function CoursePageShell({
  children,
  activeTab = "content",
  breadcrumbSuffix,
}: {
  children: ReactNode;
  activeTab?: CourseTab;
  breadcrumbSuffix: string;
}) {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);
  const course = COURSES.find((c) => c.id === courseId) ?? COURSES[0];
  const courseTitle = courseDisplayTitleWithTrack(course, "All");

  const [currentTab, setCurrentTab] = useState<CourseTab>(activeTab);

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader
        breadcrumb={[
          { label: "Home" },
          { label: "My Courses", href: "/instructor/courses" },
          { label: courseTitle, href: `/instructor/courses/${courseId}` },
          { label: breadcrumbSuffix },
        ]}
        instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES"
        showAvatar
      />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full items-start">
        <CourseSidebar
          activeTab={currentTab}
          setActiveTab={(tab) => {
            setCurrentTab(tab);
            // Navigate to the course page with the selected tab
            window.location.href = `/instructor/courses/${courseId}?tab=${tab}`;
          }}
          courseName={courseTitle}
          courseCode={course.code}
          backUrl="/instructor/dashboard"
          counts={{
            content: course.courseContent.reduce((sum, m) => sum + m.lessons.length, 0),
            assignments: course.assignments,
            quizzes: 2,
            students: course.students,
            groups: getCourseGroups(courseId, "All").length,
          }}
        />

        {children}
      </div>
    </div>
  );
}
