COMPLETE LMS USER FLOWS - ALL 
PHASES 
PHASE 1: FOUNDATION (Authentication & Enrollment) 
FLOW 1: Student Enrollment (First-Time User) 
Flow: 
1. Student receives enrollment link (WhatsApp/SMS) 
2. Student clicks link → Opens enrollment page 
3. Phone pre-check: Student enters phone number 
4. System checks: Is phone registered? 
○ If YES: Redirect to login or show status 
○ If NO: Continue to enrollment form 
5. Student fills form: Name, Email, Select courses 
6. Student submits form 
7. System validates → Creates account 
8. Success screen: "Check your email/SMS" 
9. Student receives email/SMS with password setup link 
10. Student clicks link → Password creation page 
11. Student creates password → Submits 
12. System checks: Is enrollment approved? 
○ If NO: Show "Pending approval" message 
○ If YES: Auto-login → Dashboard 
Screens Needed: 
● Phone pre-check page (simple input) 
● Full enrollment form page 
● Form success page 
● Password creation page 
● Pending approval page 
● Empty dashboard (first login) 
Total: 6 screens 
FLOW 2: Admin Generates Enrollment Link 
Flow: 
1. Admin logs into dashboard 
2. Admin clicks "Create Enrollment Link" 
3. Link generator page loads 
4. Admin selects courses to offer (checkboxes) 
5. Admin clicks "Generate Link" 
6. System creates unique URL 
7. Success page shows: Link, Copy button, QR code 
8. Admin copies link 
9. Admin shares via WhatsApp/SMS 
Screens Needed: 
● Admin dashboard (home) 
● Enrollment link generator page 
● Link generated success page (with copy/QR) 
Total: 3 screens 
FLOW 3: Admin Approves Enrollment 
Flow: 
1. Student submits enrollment form (triggers notification) 
2. Admin sees notification: "3 pending enrollments" 
3. Admin clicks "Pending Enrollments" 
4. List page shows: Name, Phone, Courses, Status 
5. Admin clicks "Review" on a student 
6. Detail page shows: Full student info, courses selected 
7. Admin checks externally if student paid (MoMo/Bank) 
8. Decision: Approve or Reject? 
○ If Approve: Click "Approve" → Status = Enrolled → Student notified 
○ If Reject: Click "Reject" → Status = Rejected → Student notified 
9. System enrolls student in selected courses 
10. Student can now access platform 
Screens Needed: 
● Admin dashboard (with notification badge) 
● Pending enrollments list page 
● Enrollment detail/review page 
● Approval confirmation modal 
Total: 4 screens 
FLOW 4: Returning Student Login 
Flow: 
1. Student opens app/website 
2. Login page loads 
3. Student enters: Phone number + Password 
4. Student clicks "Login" 
5. System validates credentials 
6. Decision: Valid credentials? 
○ If NO: Show error "Invalid phone or password" 
○ If YES: Check enrollment status 
7. Decision: Is enrollment approved? 
○ If NO: Show "Pending approval" 
○ If YES: Load dashboard with courses 
Screens Needed: 
● Login page 
● Login error state 
● Pending approval screen 
● Student dashboard (with enrolled courses) 
Total: 4 screens 
FLOW 5: Student Password Reset 
Flow: 
1. Student on login page 
2. Student clicks "Forgot Password?" 
3. Password reset page loads 
4. Student enters phone number 
5. Student clicks "Send Reset Link" 
6. System checks: Does phone exist? 
○ If NO: Show "Phone not found" 
○ If YES: Send SMS with reset link 
7. Success: "Check your SMS" 
8. Student clicks link in SMS 
9. New password page loads 
10. Student enters new password 
11. Student clicks "Reset Password" 
12. System updates password 
13. Success: "Password updated!" 
14. Redirect to login 
Screens Needed: 
● Password reset request page 
● Reset link sent confirmation 
● New password creation page 
● Password reset success page 
Total: 4 screens 
PHASE 2: CORE LMS FEATURES (Learning Experience) 
FLOW 6: Instructor Uploads Course Content 
Flow: 
1. Instructor logs in → Dashboard 
2. Instructor clicks "My Courses" 
3. Course list shows assigned courses 
4. Instructor clicks on "Financial Accounting Level 1" 
5. Course management page loads 
6. Instructor sees content structure (Weeks/Modules) 
7. Instructor clicks "Add Content" for Week 1 
8. Upload interface appears 
9. Decision: What type of content? 
○ Video → Upload video file 
○ PDF → Upload PDF 
○ Link → Add YouTube/Google Drive URL 
10. Instructor uploads file: "Lecture1.mp4" 
11. Instructor adds: Title, Description 
12. Instructor clicks "Save" 
13. Content appears in Week 1 
14. Students can now see this content 
Screens Needed: 
● Instructor dashboard 
● My courses list page 
● Course management page (content organization) 
● Add/upload content interface 
● Content detail form 
● Content preview/edit page 
Total: 6 screens 
FLOW 7: Student Views Course Content 
Flow: 
1. Student logs in → Dashboard 
2. Dashboard shows enrolled courses (cards) 
3. Student clicks "Financial Accounting" 
4. Course page loads 
5. Sidebar shows weeks/modules: Week 1, Week 2, Week 3 
6. Student clicks "Week 1: Introduction" 
7. Content page displays: 
○ Video lecture 
○ PDF study notes 
○ YouTube links 
8. Decision: What does student want? 
○ Watch video → Video player 
○ Download PDF → File downloads 
○ Open link → New tab 
9. Student watches video 
10. Student clicks "Next" → Week 2 
Screens Needed: 
● Student dashboard (enrolled courses) 
● Course detail/overview page 
● Content viewing page (week/module) 
● Video player interface 
● File preview/download interface 
● Empty state (no content yet) 
Total: 6 screens 
FLOW 8: Instructor Creates Assignment 
Flow: 
1. Instructor in course management page 
2. Instructor clicks "Assignments" tab 
3. Assignments list loads (empty or existing) 
4. Instructor clicks "Create Assignment" 
5. Assignment form loads 
6. Instructor fills: 
○ Title: "Essay on Financial Statements" 
○ Instructions (rich text editor) 
○ Due date: Dec 31, 2024, 11:59 PM 
○ Submission type: File upload OR Text entry 
○ Max points: 100 
7. Decision: Publish or Save Draft? 
○ Save Draft → Stays hidden from students 
○ Publish → Visible to students 
8. Instructor clicks "Publish" 
9. System creates assignment 
10. All enrolled students notified 
11. Assignment appears in student view 
Screens Needed: 
● Assignments list page (instructor view) 
● Create assignment form 
● Rich text editor for instructions 
● Date/time picker 
● Assignment preview page 
● Publish confirmation 
Total: 6 screens 
FLOW 9: Student Submits Assignment 
Flow: 
1. Student in course page 
2. Student clicks "Assignments" tab 
3. Assignment list shows: 
○ "Essay" - Due: Dec 31 - Not submitted 
○ "Case Study" - Due: Jan 5 - Submitted ✓ 
4. Student clicks "Essay" 
5. Assignment detail page loads: 
○ Instructions 
○ Due date countdown 
○ Submission area 
6. Decision: Submission type? 
○ File upload → Choose file 
○ Text entry → Type in editor 
7. Student uploads "MyEssay.pdf" 
8. File preview appears 
9. Student clicks "Submit Assignment" 
10. Decision: Before deadline? 
○ If LATE: Show warning "This is late. Submit anyway?" 
○ If ON TIME: Show confirmation "Submit assignment?" 
11. Student confirms 
12. System saves submission 
13. Status updates: "Submitted ✓" 
14. Instructor notified 
15. Success message: "Submitted successfully!" 
Screens Needed: 
● Assignments list page (student view) 
● Assignment detail page 
● File upload interface 
● Text entry interface (rich text) 
● Submission confirmation dialog 
● Late submission warning 
● Submission success page 
● Submitted assignment view (read-only) 
Total: 8 screens 
FLOW 10: Instructor Grades Assignment 
Flow: 
1. Instructor dashboard shows: "5 new submissions" 
2. Instructor clicks notification or "View Submissions" 
3. Submissions list loads: 
○ Kojo Manu - Submitted Dec 30 - Pending 
○ Esther Smith - Submitted Dec 28 - Graded: 85% 
4. Instructor clicks "Kojo Manu" 
5. Submission viewer loads: 
○ Student name, submission date 
○ PDF viewer OR text content 
6. Instructor reviews work 
7. Instructor enters grade: 92/100 
8. Instructor adds feedback (optional): "Great work!" 
9. Instructor clicks "Save Grade" 
10. System updates gradebook 
11. Student notified: "New grade posted" 
12. Grade visible to student 
Screens Needed: 
● Submissions list page (instructor view) 
● Individual submission review page 
● PDF/file viewer 
● Grade entry interface 
● Feedback text area 
● Grade saved confirmation 
Total: 6 screens 
FLOW 11: Student Views Grades 
Flow: 
1. Student receives notification: "New grade posted" 
2. Student clicks notification or "Grades" 
3. Gradebook page loads (table view): 
○ Assignment | Grade | Status | Feedback 
○ Essay | 92/100 | Graded | View 
○ Case Study | — | Pending | — 
4. Student clicks "View" feedback 
5. Grade detail modal shows: 
○ Grade: 92/100 (92%) 
○ Instructor feedback 
○ Submitted file (for reference) 
6. Student closes modal 
Screens Needed: 
● Gradebook page (student view) 
● Grade detail modal/page 
● Feedback display 
Total: 3 screens 
PHASE 3: ADMIN & CENTER MANAGEMENT 
FLOW 12: Admin Assigns Instructor to Course 
Flow: 
1. Admin dashboard → "Instructors" section 
2. Instructor list loads 
3. Admin clicks "Assign Courses" on an instructor 
4. Assignment interface loads 
5. Shows available courses (checkboxes): 
○ Financial Accounting Level 1 
○ Cost Accounting Level 1 
6. Admin selects courses 
7. Admin clicks "Assign" 
8. System updates instructor's course list 
9. Instructor can now access these courses 
10. Confirmation: "Courses assigned successfully" 
Screens Needed: 
● Instructors list page 
● Instructor detail page 
● Course assignment interface 
● Assignment confirmation 
Total: 4 screens 
FLOW 13: Admin Manages Global Course Catalog 
Flow: 
1. Admin dashboard → "Course Catalog" 
2. Global course list loads: 
○ ICAG Level 1 courses 
○ ACCA courses 
○ CIMA courses 
3. Admin clicks "Select Courses We Offer" 
4. Course selection interface (checkboxes) 
5. Admin selects courses center will teach 
6. Admin clicks "Save" 
7. Selected courses now available for: 
○ Enrollment forms 
○ Instructor assignment 
8. Confirmation: "Course selection saved" 
Screens Needed: 
● Global course catalog page 
● Course selection interface 
● Center courses page (what we offer) 
● Save confirmation 
Total: 4 screens 
FLOW 14: Admin Customizes Center Branding *** 
Flow: 
1. Admin dashboard → "Settings" → "Branding" 
2. Branding page loads with: 
○ Current logo preview 
○ Color scheme preview 
○ Center name 
3. Admin clicks "Upload Logo" 
4. File picker opens 
5. Admin selects logo image 
6. Logo preview updates 
7. Admin clicks color picker 
8. Admin selects primary color: #2563EB 
9. Admin selects secondary color 
10. Admin enters center name: "ABC Professional Tuition" 
11. Live preview shows changes 
12. Admin clicks "Save Changes" 
13. System updates branding 
14. All pages now show new logo/colors 
15. Confirmation: "Branding updated" 
Screens Needed: 
● Branding settings page 
● Logo upload interface 
● Color picker 
● Live preview panel 
● Mobile preview 
● Save confirmation 
Total: 6 screens 
PHASE 4: INTEGRATIONS (Zoom & Communication) 
FLOW 15: Instructor Schedules Zoom Class 
Flow: 
1. Instructor in course page 
2. Instructor clicks "Schedule" or "Calendar" 
3. Schedule interface loads 
4. Instructor clicks "Add Zoom Session" 
5. Form appears: 
○ Session title: "Week 1 Live Lecture" 
○ Date: Dec 20, 2024 
○ Time: 3:00 PM 
○ Zoom link: [paste link] 
○ Description (optional) 
6. Instructor pastes Zoom link from their account 
7. Instructor clicks "Schedule" 
8. System creates calendar event 
9. All enrolled students notified 
10. Event appears in student calendar 
Screens Needed: 
● Schedule/calendar page (instructor view) 
● Add Zoom session form 
● Date/time picker 
● Schedule confirmation 
Total: 4 screens 
FLOW 16: Student Joins Zoom Class 
Flow: 
1. Student receives notification: "Class in 15 mins" 
2. Student opens app → Dashboard or Calendar 
3. Calendar shows upcoming event: 
○ "Week 1 Live Lecture" - Today, 3:00 PM 
4. Student clicks on event 
5. Event detail shows: 
○ Title, Date, Time 
○ "Join Zoom" button 
○ Description 
6. Student clicks "Join Zoom" 
7. New tab opens → Zoom meeting (external) 
8. Student joins class 
Screens Needed: 
● Calendar page (student view) 
● Event detail modal 
● Join confirmation (redirect notice) 
Total: 3 screens 
FLOW 17: Instructor Posts Zoom Recording 
Flow: 
1. Zoom class ends 
2. Instructor receives recording link from Zoom 
3. Instructor goes to course management 
4. Instructor clicks "Add Content" → Week 1 
5. Instructor selects "Add Link" 
6. Instructor pastes Zoom recording link 
7. Instructor adds title: "Week 1 Lecture Recording" 
8. Instructor clicks "Save" 
9. Recording link appears in Week 1 content 
10. Students can now watch recording 
Screens Needed: 
● Add link interface (reuse from Flow 6) 
● Recording added confirmation 
Total: 2 screens (mostly reuse) 
FLOW 18: Announcements (Admin/Instructor to Students) 
Flow: 
1. Admin or Instructor clicks "Announcements" 
2. Announcements page loads 
3. Click "Create Announcement" 
4. Form appears: 
○ Title 
○ Message (rich text) 
○ Target: All students OR Specific course 
○ Priority: Normal OR Urgent 
5. Fill announcement details 
6. Click "Post" 
7. System creates announcement 
8. Students notified based on target 
9. Announcement appears on student dashboard 
Screens Needed: 
● Announcements list page (admin/instructor view) 
● Create announcement form 
● Announcement detail page 
● Student dashboard (with announcements feed) 
Total: 4 screens 
FLOW 19: Direct Messaging (Student ↔ Instructor) 
Flow: 
1. Student clicks "Messages" or "Contact Instructor" 
2. Message interface loads 
3. Student selects instructor from dropdown 
4. Student types message 
5. Student clicks "Send" 
6. Message delivered to instructor 
7. Instructor receives notification 
8. Instructor opens message 
9. Instructor replies 
10. Student receives notification 
11. Student views reply 
Screens Needed: 
● Messages inbox page 
● New message compose interface 
● Message thread/conversation view 
● Message notifications 
Total: 4 screens 