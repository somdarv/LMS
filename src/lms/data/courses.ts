export interface Module {
  id: number;
  week: number;
  title: string;
  lessons: { id: number; title: string; duration: string; type: "video" | "pdf" | "reading" }[];
}

export interface Course {
  id: number;
  title: string;
  subtitle: string;
  shortCode: string;   // e.g. "FA L1" — used as the common key across all pages
  code: string;        // e.g. "ICAG-FA-L1"
  level: string;
  term: string;
  students: number;
  modules: number;
  assignments: number;
  status: "Active" | "Draft" | "Upcoming";
  imageUrl: string;
  instructor: string;
  overview: string;
  whatYouLearn: string[];
  requirements: string[];
  courseContent: Module[];
  completionRate: number;
  avgGrade: number;
  upcoming: string;    // next class date shown on dashboard cards
  tracks: string[];    // e.g. ["Weekday", "Weekend"], ["Weekend"], or ["All"]
}

export const COURSES: Course[] = [
  {
    id: 1,
    title: "Financial Accounting Level 1",
    subtitle: "Foundation-level course covering double entry, trial balance, and basic financial statements.",
    shortCode: "FA L1",
    code: "ICAG-FA-L1",
    level: "Level 1",
    term: "May 2025 Sitting",
    students: 42,
    modules: 8,
    assignments: 5,
    status: "Active",
    upcoming: "Mar 12, 2025",
    imageUrl: "https://images.unsplash.com/photo-1769794370969-eee773593604?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhY2NvdW50aW5nJTIwZmluYW5jZSUyMHRleHRib29rcyUyMGRlc2slMjBzdHVkeXxlbnwxfHx8fDE3NzE1MzE1OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    instructor: "Prof Mensah Oduro",
    overview: "This comprehensive Financial Accounting Level 1 course provides a thorough introduction to the fundamental principles of accounting. Students will master the double-entry bookkeeping system, learn to prepare trial balances, and develop skills in creating basic financial statements including income statements and balance sheets. The course is designed for students pursuing the ICAG professional qualification.",
    whatYouLearn: [
      "Understand double-entry bookkeeping principles and applications",
      "Prepare and analyse trial balances with confidence",
      "Create income statements and balance sheets",
      "Record transactions accurately in journals and ledgers",
      "Apply accruals and prepayments concepts",
      "Understand bank reconciliation statements",
    ],
    requirements: [
      "Completion of ICAG Level 1 or equivalent foundation in business law",
      "Basic understanding of mathematics and numerical reasoning",
      "Access to a scientific calculator for exam preparation",
    ],
    courseContent: [
      {
        id: 1, week: 1, title: "Introduction to Accounting",
        lessons: [
          { id: 1, title: "Overview of Accounting Principles", duration: "45:00", type: "video" },
          { id: 2, title: "The Accounting Equation", duration: "32:15", type: "video" },
          { id: 3, title: "Week 1 Reading Material", duration: "PDF", type: "pdf" },
        ],
      },
      {
        id: 2, week: 2, title: "Double Entry Bookkeeping",
        lessons: [
          { id: 4, title: "Debits and Credits Explained", duration: "51:30", type: "video" },
          { id: 5, title: "Journal Entries Practice", duration: "38:45", type: "video" },
          { id: 6, title: "Ledger Accounts", duration: "44:10", type: "video" },
        ],
      },
      {
        id: 3, week: 3, title: "Trial Balance",
        lessons: [
          { id: 7, title: "Preparing a Trial Balance", duration: "42:00", type: "video" },
          { id: 8, title: "Trial Balance Errors", duration: "29:20", type: "video" },
        ],
      },
      {
        id: 4, week: 4, title: "Financial Statements",
        lessons: [
          { id: 9, title: "Income Statement Preparation", duration: "55:00", type: "video" },
          { id: 10, title: "Balance Sheet Construction", duration: "48:15", type: "video" },
          { id: 11, title: "Financial Statements Guide", duration: "PDF", type: "pdf" },
        ],
      },
      {
        id: 5, week: 5, title: "Accruals and Prepayments",
        lessons: [
          { id: 12, title: "Understanding Accruals", duration: "33:40", type: "video" },
          { id: 13, title: "Prepayment Adjustments", duration: "28:50", type: "video" },
        ],
      },
    ],
    completionRate: 68,
    avgGrade: 73,
    tracks: ["Weekday", "Weekend"],
  },
  {
    id: 2,
    title: "Financial Accounting Level 2",
    subtitle: "Advanced financial accounting covering consolidated statements, partnerships, and complex transactions.",
    shortCode: "FA L2",
    code: "ICAG-FA-L2",
    level: "Level 2",
    term: "May 2025 Sitting",
    students: 38,
    modules: 7,
    assignments: 4,
    status: "Active",
    upcoming: "Mar 14, 2025",
    imageUrl: "https://images.unsplash.com/photo-1758518727707-b023e285b709?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbmFnZW1lbnQlMjBtZWV0aW5nJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc3MTUzMTU5NXww&ixlib=rb-4.1.0&q=80&w=1080",
    instructor: "Prof Mensah Oduro",
    overview: "Building on Level 1 foundations, Financial Accounting Level 2 explores advanced accounting concepts including consolidated financial statements, partnership accounts, company accounts, and complex adjustments. Students will develop the analytical skills required for the ICAG professional examinations.",
    whatYouLearn: [
      "Prepare consolidated financial statements for group companies",
      "Account for partnerships including goodwill and dissolution",
      "Handle complex adjustments including depreciation methods",
      "Apply IAS standards to financial reporting",
      "Analyse cash flow statements comprehensively",
      "Interpret financial ratios for decision-making",
    ],
    requirements: [
      "Successful completion of Financial Accounting Level 1",
      "Understanding of basic financial statements",
      "Knowledge of double-entry bookkeeping",
    ],
    courseContent: [
      {
        id: 6, week: 1, title: "Company Accounts",
        lessons: [
          { id: 14, title: "Introduction to Company Accounts", duration: "48:00", type: "video" },
          { id: 15, title: "Share Capital and Reserves", duration: "41:30", type: "video" },
        ],
      },
      {
        id: 7, week: 2, title: "Partnership Accounts",
        lessons: [
          { id: 16, title: "Partnership Formation", duration: "37:45", type: "video" },
          { id: 17, title: "Goodwill and Dissolution", duration: "52:10", type: "video" },
        ],
      },
      {
        id: 8, week: 3, title: "Consolidated Statements",
        lessons: [
          { id: 18, title: "Principles of Consolidation", duration: "58:20", type: "video" },
          { id: 19, title: "Minority Interests", duration: "35:00", type: "video" },
          { id: 20, title: "Consolidation Workings Guide", duration: "PDF", type: "pdf" },
        ],
      },
      {
        id: 9, week: 4, title: "Cash Flow Statements",
        lessons: [
          { id: 21, title: "Direct vs Indirect Method", duration: "44:30", type: "video" },
          { id: 22, title: "Preparing Cash Flow Statements", duration: "50:15", type: "video" },
        ],
      },
    ],
    completionRate: 52,
    avgGrade: 67,
    tracks: ["Weekend"],
  },
  {
    id: 3,
    title: "Management Accounting Level 1",
    subtitle: "Cost accounting fundamentals covering budgeting, variance analysis, and management decision-making.",
    shortCode: "MA L1",
    code: "ICAG-MA-L1",
    level: "Level 1",
    term: "May 2025 Sitting",
    students: 35,
    modules: 6,
    assignments: 4,
    status: "Active",
    upcoming: "Mar 11, 2025",
    imageUrl: "https://images.unsplash.com/photo-1769776400201-6b99211a4f4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW5hZ2VtZW50JTIwYWNjb3VudGluZyUyMGJ1c2luZXNzJTIwc3RyYXRlZ3l8ZW58MXx8fHwxNzcxNjA2MTAwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    instructor: "Prof Mensah Oduro",
    overview: "Management Accounting Level 1 equips students with the tools needed to support business decision-making through cost analysis, budgeting, and performance measurement. Students will gain practical skills in cost classification, absorption costing, marginal costing, and variance analysis, all aligned with the ICAG professional syllabus.",
    whatYouLearn: [
      "Classify and analyse costs for decision-making",
      "Apply absorption and marginal costing techniques",
      "Prepare functional and master budgets",
      "Conduct variance analysis and interpret results",
      "Understand break-even and contribution margin analysis",
      "Support management with relevant cost information",
    ],
    requirements: [
      "Completion of Financial Accounting Level 1",
      "Basic understanding of business operations",
      "Familiarity with spreadsheet tools for practice",
    ],
    courseContent: [
      {
        id: 10, week: 1, title: "Introduction to Management Accounting",
        lessons: [
          { id: 23, title: "Role of Management Accountant", duration: "38:00", type: "video" },
          { id: 24, title: "Cost Classification", duration: "44:20", type: "video" },
        ],
      },
      {
        id: 11, week: 2, title: "Costing Methods",
        lessons: [
          { id: 25, title: "Absorption Costing Explained", duration: "52:00", type: "video" },
          { id: 26, title: "Marginal Costing vs Absorption", duration: "41:15", type: "video" },
          { id: 27, title: "Costing Methods Guide", duration: "PDF", type: "pdf" },
        ],
      },
      {
        id: 12, week: 3, title: "Budgeting",
        lessons: [
          { id: 28, title: "Budget Preparation Process", duration: "47:30", type: "video" },
          { id: 29, title: "Master Budget Construction", duration: "55:00", type: "video" },
        ],
      },
      {
        id: 13, week: 4, title: "Variance Analysis",
        lessons: [
          { id: 30, title: "Material and Labour Variances", duration: "49:10", type: "video" },
          { id: 31, title: "Overhead Variances", duration: "36:45", type: "video" },
        ],
      },
    ],
    completionRate: 61,
    avgGrade: 70,
    tracks: ["All"],
  },
  {
    id: 4,
    title: "Taxation Level 1",
    subtitle: "Introduction to Ghanaian tax law covering personal income tax, corporate tax, and VAT compliance.",
    shortCode: "TAX L1",
    code: "ICAG-TAX-L1",
    level: "Level 1",
    term: "May 2025 Sitting",
    students: 29,
    modules: 5,
    assignments: 3,
    status: "Active",
    upcoming: "Mar 13, 2025",
    imageUrl: "https://images.unsplash.com/photo-1653189909214-72143c4fc7ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YXhhdGlvbiUyMGxhdyUyMGRvY3VtZW50cyUyMG9mZmljZXxlbnwxfHx8fDE3NzE2MDYxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    instructor: "Prof Mensah Oduro",
    overview: "Taxation Level 1 provides a comprehensive introduction to Ghana's tax framework. Students will study the Income Tax Act 2015 (Act 896), personal and corporate tax computations, value added tax (VAT), and withholding tax obligations. The course prepares students to handle routine tax compliance tasks and builds a foundation for advanced tax planning.",
    whatYouLearn: [
      "Understand Ghana's tax legislation and administration",
      "Compute personal income tax and employee tax obligations",
      "Calculate corporate income tax for resident companies",
      "Apply VAT rules to business transactions",
      "Handle withholding tax deductions and remittances",
      "File basic tax returns accurately",
    ],
    requirements: [
      "Completion of Financial Accounting Level 1",
      "Understanding of basic business law concepts",
      "Familiarity with Ghana Revenue Authority (GRA) processes",
    ],
    courseContent: [
      {
        id: 14, week: 1, title: "Ghana Tax System Overview",
        lessons: [
          { id: 32, title: "Introduction to Ghana's Tax Laws", duration: "41:00", type: "video" },
          { id: 33, title: "Tax Administration Overview", duration: "34:30", type: "video" },
        ],
      },
      {
        id: 15, week: 2, title: "Personal Income Tax",
        lessons: [
          { id: 34, title: "Computing Employment Income Tax", duration: "48:00", type: "video" },
          { id: 35, title: "Self-Employed Income Tax", duration: "43:20", type: "video" },
          { id: 36, title: "PIT Computation Guide", duration: "PDF", type: "pdf" },
        ],
      },
      {
        id: 16, week: 3, title: "Corporate Tax",
        lessons: [
          { id: 37, title: "Corporate Tax Rates and Rules", duration: "50:15", type: "video" },
          { id: 38, title: "Tax Allowable Deductions", duration: "38:00", type: "video" },
        ],
      },
      {
        id: 17, week: 4, title: "Value Added Tax",
        lessons: [
          { id: 39, title: "VAT Registration and Rates", duration: "36:45", type: "video" },
          { id: 40, title: "VAT Returns and Filing", duration: "42:10", type: "video" },
        ],
      },
    ],
    completionRate: 57,
    avgGrade: 65,
    tracks: ["All"],
  },
  {
    id: 5,
    title: "Auditing & Assurance Level 1",
    subtitle: "Principles of auditing, internal controls, risk assessment, and professional ethics for auditors.",
    shortCode: "AUD L1",
    code: "ICAG-AUD-L1",
    level: "Level 1",
    term: "May 2025 Sitting",
    students: 31,
    modules: 6,
    assignments: 4,
    status: "Active",
    upcoming: "Mar 15, 2025",
    imageUrl: "https://images.unsplash.com/photo-1574884280706-7342ca3d4231?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpdGluZyUyMGZpbmFuY2lhbCUyMHJldmlldyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzE2MDYxMDB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    instructor: "Prof Mensah Oduro",
    overview: "Auditing & Assurance Level 1 introduces students to the principles and practice of external auditing. Topics include audit planning, internal controls evaluation, audit evidence, and the auditor's report. Students will develop an understanding of professional ethics, audit risk, and the regulatory framework governing auditors in Ghana and internationally.",
    whatYouLearn: [
      "Understand the purpose and scope of an audit engagement",
      "Evaluate internal control systems and identify weaknesses",
      "Assess audit risk and design appropriate audit procedures",
      "Gather and evaluate sufficient and appropriate audit evidence",
      "Draft audit reports and management letters",
      "Apply professional ethics and independence standards",
    ],
    requirements: [
      "Completion of Financial Accounting Level 1 and Level 2",
      "Understanding of financial statement preparation",
      "Basic knowledge of business processes and controls",
    ],
    courseContent: [
      {
        id: 18, week: 1, title: "Nature and Purpose of Audit",
        lessons: [
          { id: 41, title: "What is an Audit?", duration: "36:00", type: "video" },
          { id: 42, title: "Legal and Regulatory Framework", duration: "42:15", type: "video" },
        ],
      },
      {
        id: 19, week: 2, title: "Internal Controls",
        lessons: [
          { id: 43, title: "Types of Internal Controls", duration: "47:00", type: "video" },
          { id: 44, title: "Evaluating Control Weaknesses", duration: "39:30", type: "video" },
          { id: 45, title: "Internal Controls Checklist", duration: "PDF", type: "pdf" },
        ],
      },
      {
        id: 20, week: 3, title: "Audit Risk and Planning",
        lessons: [
          { id: 46, title: "Understanding Audit Risk", duration: "51:00", type: "video" },
          { id: 47, title: "Audit Planning and Materiality", duration: "44:40", type: "video" },
        ],
      },
      {
        id: 21, week: 4, title: "Audit Evidence and Procedures",
        lessons: [
          { id: 48, title: "Types of Audit Evidence", duration: "43:00", type: "video" },
          { id: 49, title: "Substantive Testing Techniques", duration: "50:20", type: "video" },
        ],
      },
    ],
    completionRate: 44,
    avgGrade: 62,
    tracks: ["All"],
  },
];
