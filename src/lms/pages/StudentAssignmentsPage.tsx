import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ClipboardList,
  Clock,
  Upload,
  FileText,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Type,
  Users2,
} from "lucide-react";
import { AlmsHeader } from "../components/AlmsHeader";
import { StudentSidebar } from "../components/StudentSidebar";
import { AssignmentTaker, type AssignmentConfig, type AssignmentQuestion, type RubricCriterion, type DeliveryFormat, type SubmissionType } from "../components/AssignmentTaker";
import { COURSES } from "../data/courses";
import { getStudentEnrollmentCohort, type StudentEnrollmentCohort } from "../data/studentEnrollments";
import { studentCourseTitle } from "../lib/courseLabels";
import { findStudentGroup, type Group, type GroupAssignmentConfig } from "../data/groups";

// Demo: Kojo Manu's student ID (matches groups.ts demo data)
const DEMO_STUDENT_ID = 7;

type WorkStatus = "Not Started" | "In Progress" | "Submitted" | "Graded";

interface Assignment {
  id: number;
  title: string;
  courseId: number;
  course: string;
  courseCode: string;
  description: string;
  instructions: string;
  dueDate: string;
  dueTime: string;
  maxPoints: number;
  submissionType: SubmissionType;
  deliveryFormat: DeliveryFormat | "document";
  assignmentType: string;
  status: WorkStatus;
  week?: number;
  grade?: number;
  feedback?: string;
  submittedAt?: string;
  fileName?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  allowDocumentDownload?: boolean;
  allowLate: boolean;
  latePenalty?: number;
  allowResubmit?: boolean;
  groupConfig?: GroupAssignmentConfig;
  rubric: RubricCriterion[];
  questions: AssignmentQuestion[];
}

// ─── Rich assignment data ──────────────────────────────────────────────

const assignments: Assignment[] = [
  // Course 1: FA L1 — Essay (Written Instructions, file upload)
  {
    id: 101, title: "Essay on Financial Statements", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Write a comprehensive essay discussing the importance of financial statements in business decision-making.",
    instructions: "Write a comprehensive essay (1500–2000 words) discussing the importance of financial statements in business decision-making. Include real-world examples and reference at least 3 accounting standards (e.g. IAS 1, IFRS 15). Your essay should cover:\n\n1. The purpose of each main financial statement\n2. How stakeholders use financial statements for decision-making\n3. Limitations of financial statements\n4. At least two real-world examples\n\nFormat: PDF or DOCX. Use 12pt font, double-spaced. Include a reference list.",
    dueDate: "Mar 15, 2026", dueTime: "23:59", maxPoints: 100, submissionType: "file", deliveryFormat: "instructions", assignmentType: "assignment",
    status: "Not Started", week: 4, allowLate: true, latePenalty: 10,
    rubric: [
      { criterion: "Understanding & Accuracy", description: "Demonstrates thorough understanding of financial statements and their purpose", points: 30 },
      { criterion: "Real-World Application", description: "Includes relevant, well-explained real-world examples", points: 25 },
      { criterion: "Critical Analysis", description: "Discusses limitations and alternative perspectives", points: 20 },
      { criterion: "Structure & Presentation", description: "Well-organised essay with clear introduction, body, and conclusion", points: 15 },
      { criterion: "References & Standards", description: "Correct referencing of at least 3 accounting standards", points: 10 },
    ],
    questions: [],
  },
  // Course 1: FA L1 — Journal Entries Practice Set (Bulk parsed questions)
  {
    id: 102, title: "Journal Entries Practice Set", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Complete a practice set covering debits, credits, and ledger postings with auto-parsed questions.",
    instructions: "Answer each question directly on the platform. Show all workings for calculation questions.",
    dueDate: "Mar 22, 2026", dueTime: "23:59", maxPoints: 50, submissionType: "file", deliveryFormat: "bulk", assignmentType: "exercise",
    status: "In Progress", week: 2, allowLate: false,
    rubric: [],
    questions: [
      { id: 1, type: "short_answer", text: "Record the journal entry for: A business purchases office furniture worth GHS 5,000 on credit from ABC Suppliers." },
      { id: 2, type: "short_answer", text: "Record the journal entry for: Cash sales of GHS 3,200 were made." },
      { id: 3, type: "multiple_choice", text: "Which of the following correctly records a payment of rent (GHS 1,500) by cheque?", options: ["Debit Rent, Credit Cash", "Debit Rent, Credit Bank", "Debit Bank, Credit Rent", "Debit Cash, Credit Rent"], correctOption: 1 },
      { id: 4, type: "true_false", text: "When goods are returned by a customer, the correct entry is: Debit Sales Returns, Credit Accounts Receivable.", correctAnswer: true },
      { id: 5, type: "short_answer", text: "A business owner withdraws GHS 2,000 cash for personal use. Record the journal entry and name the account classification for 'Drawings'." },
      { id: 6, type: "multiple_choice", text: "The purchase of inventory on credit should be recorded as:", options: ["Debit Purchases, Credit Cash", "Debit Purchases, Credit Accounts Payable", "Debit Accounts Payable, Credit Purchases", "Debit Cash, Credit Purchases"], correctOption: 1 },
      { id: 7, type: "long_answer", text: "A business had the following transactions in January:\n1. Started business with GHS 50,000 cash\n2. Bought goods on credit for GHS 12,000\n3. Sold goods for cash GHS 8,000\n4. Paid rent by cheque GHS 3,000\n5. Returned goods worth GHS 2,000 to supplier\n\nPrepare the general journal entries for all five transactions. For each, state which accounts are debited and credited, and the amounts." },
      { id: 8, type: "true_false", text: "A debit entry to an expense account increases the expense.", correctAnswer: true },
    ],
  },
  // Course 1: FA L1 — Double Entry Practice Set (graded)
  {
    id: 103, title: "Double Entry Practice Set", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Complete practice set covering journal entries, T-accounts, and trial balance preparation.",
    instructions: "Complete the attached practice set covering journal entries, T-accounts, and trial balance preparation.",
    dueDate: "Mar 5, 2026", dueTime: "23:59", maxPoints: 50, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Graded", week: 2, grade: 45,
    feedback: "Excellent work! Your journal entries were accurate and well-presented. Minor error in the trial balance totals — check your suspense account.",
    submittedAt: "Mar 4, 2026", fileName: "DoubleEntry_KojoManu.pdf", allowLate: false,
    rubric: [
      { criterion: "Journal Entries", description: "Accuracy and completeness of journal entries", points: 20 },
      { criterion: "T-Accounts", description: "Correct posting to T-accounts", points: 15 },
      { criterion: "Trial Balance", description: "Correct preparation of trial balance", points: 15 },
    ],
    questions: [],
  },
  // Course 1: FA L1 — Accounting Equation (graded)
  {
    id: 104, title: "Accounting Equation Worksheet", courseId: 1, course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1",
    description: "Classify assets, liabilities, and equity for given transactions.",
    instructions: "Complete the worksheet identifying assets, liabilities, and equity for 15 given transactions.",
    dueDate: "Feb 20, 2026", dueTime: "23:59", maxPoints: 30, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Graded", week: 1, grade: 28,
    feedback: "Well done. All classifications were correct.", submittedAt: "Feb 19, 2026", fileName: "AccEq_KojoManu.pdf", allowLate: false,
    rubric: [], questions: [],
  },
  // Course 1: FA L1 — Trial Balance Reconciliation (submitted)
  {
    id: 105, title: "Trial Balance Reconciliation", courseId: 1, course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1",
    description: "Identify and correct errors in a given trial balance.",
    instructions: "Identify and correct the 8 errors in the given trial balance. Prepare a suspense account and corrected trial balance.",
    dueDate: "Feb 28, 2026", dueTime: "23:59", maxPoints: 40, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Submitted", week: 3, submittedAt: "Feb 27, 2026", fileName: "TrialBalance_KojoManu.pdf", allowLate: false,
    rubric: [], questions: [],
  },
  // Course 2: FA L2 — Partnership Dissolution (active, short-answer format)
  {
    id: 201, title: "Partnership Dissolution Exercise", courseId: 2, course: "Financial Accounting Level 2 - Weekend", courseCode: "FA L2",
    description: "Complete partnership dissolution workings with journal entries and capital accounts.",
    instructions: "Answer each question about partnership dissolution. Show all journal entries, the realisation account, and partner capital accounts.",
    dueDate: "Mar 22, 2026", dueTime: "23:59", maxPoints: 60, submissionType: "text", deliveryFormat: "short", assignmentType: "exercise",
    status: "Not Started", week: 2, allowLate: true, latePenalty: 5,
    rubric: [
      { criterion: "Realisation Account", description: "Correct preparation and balancing", points: 20 },
      { criterion: "Partner Capital Accounts", description: "Accurate distribution of profits/losses", points: 20 },
      { criterion: "Journal Entries", description: "Complete and correct dissolution entries", points: 20 },
    ],
    questions: [
      { id: 20, type: "short_answer", text: "Partners A and B share profits in 3:2 ratio. Assets realised GHS 180,000 against book value GHS 200,000. Calculate each partner's share of the loss on realisation." },
      { id: 21, type: "long_answer", text: "Prepare the Realisation Account for the dissolution of AB Partnership given:\n• Book value of assets: GHS 200,000\n• Liabilities: GHS 60,000\n• Assets realised: GHS 180,000\n• Dissolution expenses: GHS 5,000\n• Liabilities paid in full\n\nShow all entries clearly with narrations." },
      { id: 22, type: "short_answer", text: "What is the journal entry to close a partner's loan account of GHS 15,000 during dissolution?" },
      { id: 23, type: "multiple_choice", text: "During partnership dissolution, assets are transferred to which account?", options: ["Capital Account", "Realisation Account", "Profit & Loss Account", "Cash Account"], correctOption: 1 },
      { id: 24, type: "long_answer", text: "Prepare the Capital Accounts (columnar format) for Partners A and B given:\n• A's capital: GHS 80,000, B's capital: GHS 50,000\n• Profit sharing: 3:2\n• Loss on realisation: GHS 25,000\n• A's drawings: GHS 10,000, B's drawings: GHS 8,000\n• A's loan to firm: GHS 15,000\n\nBalance off the accounts and show the final cash settlement." },
    ],
  },
  // Course 2: FA L2 — Company Accounts (graded)
  {
    id: 202, title: "Company Accounts Exercise", courseId: 2, course: "Financial Accounting Level 2 - Weekend", courseCode: "FA L2",
    description: "Prepare a full set of company accounts.",
    instructions: "Prepare a full set of company accounts including statement of financial position and income statement for the given trial balance.",
    dueDate: "Feb 22, 2026", dueTime: "23:59", maxPoints: 60, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Graded", week: 1, grade: 52,
    feedback: "Good understanding of share capital and reserves. Review the treatment of inter-company balances.",
    submittedAt: "Feb 22, 2026", fileName: "CompanyAccounts_KojoManu.pdf", allowLate: false,
    rubric: [], questions: [],
  },
  // Course 2: FA L2 — Resubmission Demo (file upload, resubmit allowed)
  {
    id: 206, title: "Resubmission Demo: Consolidation Working", courseId: 2, course: "Financial Accounting Level 2 - Weekend", courseCode: "FA L2",
    description: "Submit a first draft, then use Edit & Resubmit to demo multiple attempts.",
    instructions: "Upload your consolidation working (any format). After submitting, click “Edit & Resubmit” to submit an improved version (demo).",
    dueDate: "Mar 28, 2026", dueTime: "23:59", maxPoints: 20, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Not Started", week: 3, allowLate: false, allowResubmit: true,
    rubric: [
      { criterion: "Structure", description: "Clear working layout and headings", points: 5 },
      { criterion: "Calculations", description: "Accurate figures and adjustments", points: 10 },
      { criterion: "Presentation", description: "Readable and well-organised", points: 5 },
    ],
    questions: [],
  },
  // Course 3: MA — Case Study (active, text entry long-form)
  {
    id: 301, title: "Case Study: Cost Analysis", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Analyse the cost structure of a manufacturing company with break-even analysis.",
    instructions: "Analyse the cost structure of ManuTech Manufacturing Ltd. The company produces electronic components.\n\nData provided:\n• Fixed costs: GHS 120,000/month (rent, salaries, depreciation)\n• Variable cost per unit: GHS 35 (materials GHS 20, labour GHS 10, overhead GHS 5)\n• Selling price per unit: GHS 60\n• Current production: 8,000 units/month\n• Maximum capacity: 12,000 units/month\n\nYour analysis should cover:\n1. Cost classification (identify all fixed and variable elements)\n2. Break-even analysis (units and revenue)\n3. Margin of safety\n4. Profit at current and maximum production levels\n5. Recommendations for cost reduction (at least 3 strategies)",
    dueDate: "Mar 18, 2026", dueTime: "23:59", maxPoints: 80, submissionType: "text", deliveryFormat: "long", assignmentType: "case_study",
    status: "In Progress", week: 2, allowLate: true, latePenalty: 10,
    rubric: [
      { criterion: "Cost Classification", description: "Correct identification of fixed and variable costs", points: 15 },
      { criterion: "Break-Even Analysis", description: "Accurate calculation with clear workings", points: 25 },
      { criterion: "Margin of Safety & Profit", description: "Correct calculations at different levels", points: 15 },
      { criterion: "Recommendations", description: "Practical, well-justified cost reduction strategies", points: 15 },
      { criterion: "Presentation & Clarity", description: "Well-structured, clear communication", points: 10 },
    ],
    questions: [
      { id: 30, type: "long_answer", text: "Classify all the costs provided for ManuTech Manufacturing Ltd into fixed and variable categories. Explain why each cost behaves the way it does." },
      { id: 31, type: "short_answer", text: "Calculate the break-even point in units and in GHS revenue. Show your workings." },
      { id: 32, type: "short_answer", text: "Calculate the margin of safety in units and as a percentage at the current production level of 8,000 units." },
      { id: 33, type: "short_answer", text: "Calculate the profit at (a) current production of 8,000 units and (b) maximum capacity of 12,000 units." },
      { id: 34, type: "long_answer", text: "Recommend at least 3 specific, practical strategies that ManuTech could implement to reduce costs. For each strategy, explain the expected impact on the break-even point and profitability." },
    ],
  },
  // Course 3: MA — Budget (submitted)
  {
    id: 302, title: "Budget Preparation Exercise", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Prepare a master budget including sales, production, and cash budgets.",
    instructions: "Prepare a master budget for the given scenario including sales budget, production budget, and cash budget.",
    dueDate: "Mar 1, 2026", dueTime: "23:59", maxPoints: 70, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Submitted", week: 3, submittedAt: "Feb 28, 2026", fileName: "MasterBudget_KojoManu.pdf", allowLate: false,
    rubric: [], questions: [],
  },
  // Course 1: FA L1 — Group Case Study (group assignment, instructor-assigned, resubmit allowed)
  {
    id: 401, title: "Group Case Study: Balance Sheet Analysis", courseId: 1, course: "Financial Accounting Level 1 - Weekend", courseCode: "FA L1",
    description: "Analyse and reconstruct a balance sheet from a given trial balance, with group commentary.",
    instructions: "Working as a group, prepare a classified balance sheet for Dansoman Trading Co. from the trial balance provided. Include analysis of liquidity ratios, working capital, and solvency indicators.\n\nSubmit one file per group (PDF or DOCX). All group members will receive the same grade.",
    dueDate: "Apr 4, 2026", dueTime: "23:59", maxPoints: 40, submissionType: "file", deliveryFormat: "instructions", assignmentType: "case_study",
    status: "Not Started", week: 6, allowLate: false, allowResubmit: true,
    groupConfig: { enabled: true, mode: "instructor_assigned", maxGroupSize: 4 },
    rubric: [
      { criterion: "Balance Sheet Structure", description: "Correct classification of assets, liabilities, and equity", points: 15 },
      { criterion: "Calculations & Accuracy", description: "Arithmetic accuracy and correct application of principles", points: 15 },
      { criterion: "Analysis & Commentary", description: "Meaningful insights on liquidity and working capital", points: 10 },
    ],
    questions: [],
  },
  // Course 3: MA — Cost Classification (graded)
  {
    id: 303, title: "Cost Classification Worksheet", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Classify cost items as fixed, variable, semi-variable, direct, or indirect.",
    instructions: "Classify the 20 cost items as fixed, variable, semi-variable, direct, or indirect.",
    dueDate: "Feb 15, 2026", dueTime: "23:59", maxPoints: 25, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Graded", week: 1, grade: 23,
    feedback: "Excellent classification. Only 1 item was incorrectly classified.",
    submittedAt: "Feb 14, 2026", fileName: "CostClass_KojoManu.pdf", allowLate: false,
    rubric: [], questions: [],
  },
  // Course 1: FA L1 — Resubmission demo (submitted, can resubmit)
  {
    id: 106, title: "Trial Balance Corrections (Resubmission)", courseId: 1, course: "Financial Accounting Level 1", courseCode: "FA L1",
    description: "Correct errors in a trial balance and resubmit improved workings.",
    instructions: "Review the feedback from your first attempt and correct the errors in your trial balance. Upload your corrected workings as a PDF.",
    dueDate: "Mar 25, 2026", dueTime: "23:59", maxPoints: 40, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Submitted", week: 3, submittedAt: "Mar 10, 2026", fileName: "TrialBal_Attempt1_KojoManu.pdf",
    allowLate: false, allowResubmit: true,
    feedback: "Your suspense account has two posting errors. Please review and resubmit with corrections.",
    rubric: [
      { criterion: "Error Identification", description: "Correctly identifies all errors in original trial balance", points: 15 },
      { criterion: "Suspense Account", description: "Accurate preparation of suspense account", points: 15 },
      { criterion: "Corrected Trial Balance", description: "Correct final trial balance that balances", points: 10 },
    ],
    questions: [],
  },
  // Course 2: FA L2 — Group Assignment (instructor-assigned)
  {
    id: 402, title: "Consolidated Financial Statements Group Project", courseId: 2, course: "Financial Accounting Level 2 - Weekend", courseCode: "FA L2",
    description: "Work with your group to prepare consolidated financial statements for a parent-subsidiary scenario.",
    instructions: "Working as a group, prepare consolidated financial statements for the Accra Holdings Group. Include:\n\n1. Consolidated Statement of Financial Position\n2. Consolidated Income Statement\n3. Goodwill calculation and impairment review\n4. Elimination of inter-company transactions\n\nSubmit one file per group (PDF or DOCX). All group members receive the same grade.",
    dueDate: "Apr 10, 2026", dueTime: "23:59", maxPoints: 60, submissionType: "file", deliveryFormat: "instructions", assignmentType: "case_study",
    status: "Not Started", week: 5, allowLate: false, allowResubmit: true,
    groupConfig: { enabled: true, mode: "instructor_assigned", maxGroupSize: 4 },
    rubric: [
      { criterion: "Consolidation Adjustments", description: "Correct elimination of inter-company balances and transactions", points: 20 },
      { criterion: "Goodwill & NCI", description: "Accurate goodwill calculation and non-controlling interest treatment", points: 15 },
      { criterion: "Financial Statements", description: "Complete and correctly formatted consolidated statements", points: 15 },
      { criterion: "Group Commentary", description: "Clear explanatory notes on consolidation approach", points: 10 },
    ],
    questions: [],
  },
  // Course 3: MA L1 — Group Assignment (self-enroll)
  {
    id: 403, title: "Variance Analysis Group Report", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Collaborate with your group to analyse standard cost variances for a manufacturing scenario.",
    instructions: "Working as a group, analyse the standard and actual cost data for TechParts Manufacturing Ltd and prepare a comprehensive variance analysis report.\n\nCover:\n1. Material price and usage variances\n2. Labour rate and efficiency variances\n3. Fixed overhead expenditure and volume variances\n4. Recommendations for management action\n\nSubmit one file per group. All group members receive the same grade.",
    dueDate: "Apr 15, 2026", dueTime: "23:59", maxPoints: 50, submissionType: "file", deliveryFormat: "instructions", assignmentType: "case_study",
    status: "In Progress", week: 4, allowLate: false,
    groupConfig: { enabled: true, mode: "self_enrollment", maxGroupSize: 5 },
    rubric: [
      { criterion: "Material Variances", description: "Correct calculation and interpretation of material variances", points: 12 },
      { criterion: "Labour Variances", description: "Correct calculation and interpretation of labour variances", points: 12 },
      { criterion: "Overhead Variances", description: "Correct calculation of fixed overhead variances", points: 12 },
      { criterion: "Recommendations", description: "Practical and well-justified management recommendations", points: 14 },
    ],
    questions: [],
  },
  // Course 3: MA L1 — Resubmission demo (graded, can still resubmit)
  {
    id: 304, title: "Break-Even Rework Exercise", courseId: 3, course: "Management Accounting", courseCode: "MA L1",
    description: "Rework break-even calculations after instructor feedback for a better grade.",
    instructions: "Review the feedback on your original submission and rework the break-even analysis. Upload corrected workings as a PDF.",
    dueDate: "Mar 30, 2026", dueTime: "23:59", maxPoints: 80, submissionType: "file", deliveryFormat: "instructions", assignmentType: "exercise",
    status: "Graded", week: 2, grade: 55, submittedAt: "Mar 12, 2026", fileName: "BreakEven_Attempt1_KojoManu.pdf",
    allowLate: false, allowResubmit: true,
    feedback: "Your contribution margin calculation is correct but the break-even point in revenue has an arithmetic error. Resubmit for a better grade.",
    rubric: [
      { criterion: "Break-Even Calculation", description: "Accurate BEP in units and revenue", points: 30 },
      { criterion: "Contribution Analysis", description: "Correct contribution margin per unit and ratio", points: 25 },
      { criterion: "Margin of Safety", description: "Correct margin of safety calculation", points: 15 },
      { criterion: "Presentation", description: "Clear workings and professional layout", points: 10 },
    ],
    questions: [],
  },
];

const isActive = (a: Assignment) =>
  a.status === "Not Started" ||
  a.status === "In Progress" ||
  (a.status === "Submitted" && !!a.allowResubmit);
const isHistory = (a: Assignment) =>
  a.status === "Graded" || (a.status === "Submitted" && !a.allowResubmit);

const statusStyle = (s: WorkStatus): string => {
  switch (s) {
    case "Graded":      return "bg-[#e8e8ea] text-[#3a3a42]";
    case "Submitted":   return "bg-[#e8e8ea] text-[#6c6c6c]";
    case "In Progress": return "bg-[#f0ece6] text-[#a68b5b]";
    default:            return "bg-[#f3f3f5] text-[#8e8e96]";
  }
};

const statusLabel = (s: WorkStatus, grade?: number, max?: number): string => {
  if (s === "Graded" && grade !== undefined) return `${grade}/${max}`;
  return s;
};

const formatLabel: Record<DeliveryFormat | "document", string> = {
  instructions: "Written Instructions",
  short: "Short Answer",
  long: "Long Answer",
  bulk: "On-Platform Questions",
  document: "Document Upload",
};

export function StudentAssignmentsPage() {
  const navigate = useNavigate();
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [takingAssignment, setTakingAssignment] = useState<Assignment | null>(null);
  const [courseFilter, setCourseFilter] = useState<number | null>(null);
  // Track assignment statuses locally so resubmit + submit updates are reflected
  const [assignmentStates, setAssignmentStates] = useState<Record<number, Partial<Assignment>>>({});
  // Track student's group per courseId (preloaded from demo data)
  const [studentGroups, setStudentGroups] = useState<Record<number, Group | null>>(() => {
    const result: Record<number, Group | null> = {};
    [1, 2, 3].forEach((courseId) => {
      const cohort = getStudentEnrollmentCohort(courseId);
      result[courseId] = findStudentGroup(DEMO_STUDENT_ID, courseId, cohort ?? "All") ?? null;
    });
    return result;
  });

  // Demo end-to-end: persist a created document assignment from CreateAssignmentPage
  // so students can open it here.
  const [createdAssignments] = useState<Assignment[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("lms:createdAssignments");
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as Assignment[];
    } catch {
      return [];
    }
  });

  const getAssignment = (a: Assignment): Assignment => ({ ...a, ...assignmentStates[a.id] });
  const allAssignments = [...createdAssignments, ...assignments].map(getAssignment);
  const activeAssignments = allAssignments.filter((a) => isActive(a) && (!courseFilter || a.courseId === courseFilter));
  const historyAssignments = allAssignments.filter((a) => isHistory(a) && (!courseFilter || a.courseId === courseFilter));

  const enrolledCourses = COURSES.filter((c) => [1, 2, 3].includes(c.id)).map((c) => ({
    ...c,
    enrolledCohort: getStudentEnrollmentCohort(c.id) as StudentEnrollmentCohort,
  }));

  const buildConfig = (a: Assignment): AssignmentConfig => {
    const cohort = getStudentEnrollmentCohort(a.courseId);
    const grp = a.groupConfig?.enabled ? (studentGroups[a.courseId] ?? null) : undefined;
    return {
      id: a.id,
      title: a.title,
      course: a.course,
      courseCode: a.courseCode,
      courseId: a.courseId,
      track: cohort ?? "All",
      description: a.description,
      assignmentType: a.assignmentType,
      deliveryFormat: a.deliveryFormat,
      submissionType: a.submissionType,
      questions: a.questions,
      instructions: a.instructions,
      rubric: a.rubric,
      maxScore: a.maxPoints,
      dueDate: a.dueDate,
      dueTime: a.dueTime,
      allowLate: a.allowLate,
      latePenalty: a.latePenalty,
      allowResubmit: a.allowResubmit,
      allowDocumentDownload: a.allowDocumentDownload,
      attachmentName: a.attachmentName,
      attachmentUrl: a.attachmentUrl,
      week: a.week,
      groupConfig: a.groupConfig,
      currentStudentGroup: grp != null ? {
        groupId: grp.id,
        groupName: grp.name,
        members: grp.members.map((m) => ({ studentId: m.studentId, name: m.name })),
        leaderId: grp.leaderId,
      } : grp,
      currentStudentId: DEMO_STUDENT_ID,
    };
  };

  return (
    <div className="min-h-screen bg-[#f5f6f8] flex flex-col">
      <AlmsHeader breadcrumb={[{ label: "Home" }, { label: "Assignments" }]} instituteName="SOMDA INSTITUTE OF PROFESSIONAL STUDIES" showAvatar />

      <div className="flex-1 flex gap-6 px-6 py-6 max-w-[1200px] mx-auto w-full">
        <StudentSidebar />

        <main className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "24px", color: "#0a1628" }}>Assignments</h1>
              <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#6c6c6c", marginTop: 4 }}>
                View and submit assignments across all your courses
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={courseFilter ?? ""}
                onChange={(e) => setCourseFilter(e.target.value ? Number(e.target.value) : null)}
                className="px-3 py-1.5 rounded-lg bg-[#f3f3f5] border border-[#e2e2e5] text-[#3a3a42] outline-none focus:border-[#8e8e96] transition-colors cursor-pointer appearance-none pr-7"
                style={{
                  fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%238e8e96' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center",
                }}
              >
                <option value="">All Courses</option>
                {enrolledCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {studentCourseTitle(c, c.enrolledCohort)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <CollapsibleSection label="Active" count={activeAssignments.length} emptyText="No active assignments right now.">
            {activeAssignments.map((a) => (
              <AssignmentRow key={a.id} a={a} onClick={() => setSelectedAssignment(a)} />
            ))}
          </CollapsibleSection>

          <CollapsibleSection label="History" count={historyAssignments.length} emptyText="No completed assignments yet." defaultCollapsed>
            {historyAssignments.map((a) => (
              <AssignmentRow key={a.id} a={a} onClick={() => setSelectedAssignment(a)} />
            ))}
          </CollapsibleSection>
        </main>
      </div>

      {/* Detail modal */}
      {selectedAssignment && !takingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ededf0] sticky top-0 bg-white z-10">
              <div className="flex-1 min-w-0 pr-4">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "15px", fontWeight: 600, color: "#0a1628" }}>
                  {selectedAssignment.groupConfig?.enabled ? `Group Assignment: ${selectedAssignment.title}` : selectedAssignment.title}
                </p>
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", color: "#8e8e96", marginTop: 2 }}>
                  {selectedAssignment.course}{selectedAssignment.week ? ` · Week ${selectedAssignment.week}` : ""}
                </p>
              </div>
              <button onClick={() => setSelectedAssignment(null)} className="text-[#8e8e96] hover:text-[#0a1628] flex-shrink-0"><X size={18} /></button>
            </div>

            <div className="px-6 py-5">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className={`px-2 py-1 rounded-md ${statusStyle(selectedAssignment.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
                  {statusLabel(selectedAssignment.status, selectedAssignment.grade, selectedAssignment.maxPoints)}
                </span>
                <span className="flex items-center gap-1 text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>
                  <Clock size={12} /> Due {selectedAssignment.dueDate}
                </span>
                <span className="text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "12px" }}>{selectedAssignment.maxPoints} pts</span>
                <span className="px-2 py-0.5 rounded bg-[#f3f3f5] text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 500 }}>
                  {formatLabel[selectedAssignment.deliveryFormat]}
                </span>
              </div>

              {/* Description */}
              <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mb-5">
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#3a3a42", lineHeight: 1.7, whiteSpace: "pre-line" }}>{selectedAssignment.instructions}</p>
              </div>

              {/* Rubric */}
              {selectedAssignment.rubric.length > 0 && (
                <div className="mb-5">
                  <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Marking Criteria</p>
                  <div className="border border-[#ededf0] rounded-lg overflow-hidden">
                    {selectedAssignment.rubric.map((r, i) => (
                      <div key={i} className={`px-4 py-2.5 flex items-center gap-3 ${i > 0 ? "border-t border-[#ededf0]" : ""}`}>
                        <div className="flex-1">
                          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", fontWeight: 500, color: "#0a1628" }}>{r.criterion}</p>
                          {r.description && <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#8e8e96", marginTop: 1 }}>{r.description}</p>}
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-[#f3f3f5] text-[#5a5a62] flex-shrink-0" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>{r.points}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Graded result */}
              {selectedAssignment.status === "Graded" && (
                <div className="bg-[#fafafb] rounded-lg p-4 border border-[#ededf0] mb-5">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "22px", fontWeight: 700, color: "#0a1628" }}>{selectedAssignment.grade}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "14px", color: "#8e8e96" }}>/ {selectedAssignment.maxPoints}</span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#b0b0b5", marginLeft: 4 }}>
                      ({Math.round(((selectedAssignment.grade || 0) / selectedAssignment.maxPoints) * 100)}%)
                    </span>
                  </div>
                  {selectedAssignment.feedback && (
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", color: "#5a5a62", lineHeight: 1.6 }}>{selectedAssignment.feedback}</p>
                  )}
                </div>
              )}

              {/* Submitted file */}
              {(selectedAssignment.status === "Submitted" || selectedAssignment.status === "Graded") && selectedAssignment.fileName && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#fafafb] border border-[#ededf0] mb-5">
                  <FileText size={16} className="text-[#8e8e96]" />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#3a3a42" }}>{selectedAssignment.fileName}</p>
                    <p style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", color: "#b0b0b5" }}>Submitted {selectedAssignment.submittedAt}</p>
                  </div>
                </div>
              )}

              {/* Start button */}
              {isActive(selectedAssignment) && (
                <button
                  onClick={() => { setTakingAssignment(selectedAssignment); setSelectedAssignment(null); }}
                  className="w-full py-2.5 rounded-lg bg-[#0a1628] text-[#faf8f5] hover:bg-[#0d1e35] transition-colors"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600 }}
                >
                  {selectedAssignment.questions.length > 0 ? "Begin Assignment" : "Start Submission"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assignment Taker */}
      {takingAssignment && (
        <AssignmentTaker
          config={buildConfig(getAssignment(takingAssignment))}
          onClose={() => setTakingAssignment(null)}
          onComplete={(isResubmit) => {
            const id = takingAssignment.id;
            if (isResubmit) {
              setAssignmentStates((prev) => ({
                ...prev,
                [id]: { status: "Submitted", grade: undefined, feedback: undefined, submittedAt: new Date().toLocaleDateString() },
              }));
            } else {
              setAssignmentStates((prev) => ({
                ...prev,
                [id]: { ...prev[id], status: "Submitted", submittedAt: new Date().toLocaleDateString() },
              }));
            }
          }}
          onGroupJoin={(group) => {
            setStudentGroups((prev) => ({ ...prev, [group.courseId]: group }));
          }}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
function CollapsibleSection({ label, count, emptyText, defaultCollapsed = false, children }: {
  label: string; count: number; emptyText: string; defaultCollapsed?: boolean; children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <div>
      <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-2 mb-3 group">
        <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "#8e8e96", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span className="px-1.5 py-0.5 rounded bg-[#ebebee] text-[#8e8e96]" style={{ fontFamily: "Inter, sans-serif", fontSize: "10px", fontWeight: 600 }}>{count}</span>
        {collapsed ? <ChevronRight size={14} className="text-[#b0b0b5] group-hover:text-[#8e8e96]" /> : <ChevronDown size={14} className="text-[#b0b0b5] group-hover:text-[#8e8e96]" />}
      </button>
      {!collapsed && (count > 0 ? <div className="flex flex-col gap-2">{children}</div> : (
        <div className="bg-[#fafafb] rounded-xl border border-[#ededf0] py-10 px-6 text-center">
          <ClipboardList size={22} className="mx-auto mb-3 text-[#cdcdd2]" />
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 500, color: "#5a5a62" }}>{emptyText}</p>
        </div>
      ))}
    </div>
  );
}

function AssignmentRow({ a, onClick }: { a: Assignment; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white rounded-xl border border-[#ebebee] px-5 py-4 text-left hover:border-[#cdcdd2] hover:shadow-sm transition-all group">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-lg bg-[#f3f3f5] flex items-center justify-center flex-shrink-0">
          {a.groupConfig?.enabled
            ? <Users2 size={16} className="text-[#a68b5b]" />
            : <ClipboardList size={16} className="text-[#8e8e96]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: "13px", fontWeight: 600, color: "#0a1628" }}>
            {a.groupConfig?.enabled ? `Group Assignment: ${a.title}` : a.title}
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{a.courseCode}</span>
            {a.week && <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>Week {a.week}</span>}
            <span className="flex items-center gap-1 text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>
              <Clock size={10} /> {a.dueDate}
            </span>
            <span className="text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "11px" }}>{a.maxPoints} pts</span>
            <span className="px-1.5 py-0.5 rounded bg-[#f3f3f5] text-[#b0b0b5]" style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 500 }}>
              {formatLabel[a.deliveryFormat]}
            </span>
            {a.groupConfig?.enabled && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#fdf3e7] text-[#a68b5b]"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "9px", fontWeight: 600 }}>
                <Users2 size={9} /> Group
              </span>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-md flex-shrink-0 ${statusStyle(a.status)}`} style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 500 }}>
          {statusLabel(a.status, a.grade, a.maxPoints)}
        </span>
        <ChevronRight size={15} className="text-[#cdcdd2] group-hover:text-[#8e8e96] transition-colors flex-shrink-0" />
      </div>
    </button>
  );
}
