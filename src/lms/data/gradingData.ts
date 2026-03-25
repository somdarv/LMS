import type { GroupAssignmentConfig, GroupSubmissionMeta } from "./groups";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GradingMethod = "auto" | "manual" | "hybrid";
export type SubStatus    = "submitted" | "late" | "missing" | "graded";
export type GradeSource  = "auto" | "manual";

export interface RubricCriterion {
  id: string; criterion: string; description: string; max: number;
}
export interface QuizQuestion {
  id: string; question: string; options: string[]; correct: number; pts: number;
}
export interface StudentAnswer {
  questionId: string; chosen: number; overridden: boolean; overridePts?: number;
}
export interface Submission {
  id: string; studentId: number; name: string; initials: string;
  submittedAt: string | null; status: SubStatus;
  score: number | null; source: GradeSource | null;
  feedback: string; rubricScores: Record<string, number>;
  submissionText: string; answers?: StudentAnswer[];
  /** Populated only on group assignments — one submission represents the whole group */
  groupMeta?: GroupSubmissionMeta;
}
export interface AssignmentGrading {
  assignmentId: number;
  title: string;
  /** Legacy compact label; prefer courseId + track for cohort-aware display */
  course: string;
  /** Links to COURSES for cohort labels */
  courseId: number;
  track: "Weekday" | "Weekend" | "All";
  type: string;
  method: GradingMethod;
  maxScore: number;
  dueDate: string;
  totalStudents: number;
  rubric: RubricCriterion[];
  questions?: QuizQuestion[];
  submissions: Submission[];
  /** Present on group assignments only */
  groupConfig?: GroupAssignmentConfig;
  allowResubmit?: boolean;
}

// ─── Quiz questions (Assignment 13) ──────────────────────────────────────────

const FA_QUIZ_QUESTIONS: QuizQuestion[] = [
  { id:"q1", pts:1.5, correct:1,
    question:"Which account is debited when a business receives cash from a customer?",
    options:["Sales Account","Cash Account","Debtors Account","Capital Account"] },
  { id:"q2", pts:1.5, correct:1,
    question:"The accounting equation states that:",
    options:["Assets = Capital − Liabilities","Assets = Liabilities + Capital","Liabilities = Assets + Capital","Capital = Assets × Liabilities"] },
  { id:"q3", pts:1.5, correct:1,
    question:"A credit entry in the Cash Account indicates:",
    options:["Cash has been received","Cash has been paid out","Cash balance has increased","A capital injection has occurred"] },
  { id:"q4", pts:1.5, correct:2,
    question:"Which of the following is classified as a nominal (temporary) account?",
    options:["Cash at Bank","Land and Buildings","Rent Expense","Accounts Receivable"] },
  { id:"q5", pts:1.5, correct:2,
    question:"Prepaid rent is classified in the financial statements as:",
    options:["Revenue","Current Liability","Current Asset","Owner's Equity"] },
  { id:"q6", pts:1.5, correct:2,
    question:"Which journal entry correctly records a credit sale of goods?",
    options:["Dr. Sales; Cr. Debtors","Dr. Cash; Cr. Sales","Dr. Debtors; Cr. Sales","Dr. Cash; Cr. Debtors"] },
  { id:"q7", pts:1.5, correct:1,
    question:"The primary purpose of a trial balance is to verify that:",
    options:["All transactions have been recorded correctly","Total debits equal total credits in the ledger","The bank statement matches the cash book","The business has earned a profit"] },
  { id:"q8", pts:1.5, correct:1,
    question:"The correct journal entry to record annual depreciation is:",
    options:["Dr. Asset; Cr. Depreciation Expense","Dr. Depreciation Expense; Cr. Accumulated Depreciation","Dr. Cash; Cr. Asset","Dr. Capital; Cr. Asset"] },
  { id:"q9", pts:1.5, correct:2,
    question:"Which of the following is a real (permanent) account?",
    options:["Sales Revenue","Wages Expense","Land and Buildings","Rent Income"] },
  { id:"q10", pts:1.5, correct:1,
    question:"Accrued expenses are recorded in the financial statements as:",
    options:["An asset and revenue","A liability and an expense","An asset and capital","A liability and revenue"] },
];

// Helper: score answers against questions
function autoScore(answers: StudentAnswer[], questions: QuizQuestion[]): number {
  return answers.reduce((total, a) => {
    const q = questions.find(q => q.id === a.questionId);
    if (!q) return total;
    if (a.overridden) return total + (a.overridePts ?? 0);
    return total + (a.chosen === q.correct ? q.pts : 0);
  }, 0);
}

// Build auto-scored submission answers
function buildAnswers(chosen: number[]): StudentAnswer[] {
  return FA_QUIZ_QUESTIONS.map((q, i) => ({
    questionId: q.id, chosen: chosen[i], overridden: false,
  }));
}

// ─── Submission texts ─────────────────────────────────────────────────────────

const SUBMISSION_A = `FINANCIAL ACCOUNTING – CHAPTER 1 EXERCISE
Student: Kofi Boateng  |  Course: FA L1  |  Date: 22 Feb 2026

PART A: JOURNAL ENTRIES

Transaction 1: Commenced business with GHS 20,000 cash
  Dr. Cash Account              GHS 20,000
      Cr. Capital Account                    GHS 20,000
  Being: Initial capital investment by proprietor

Transaction 2: Purchased goods worth GHS 5,000 on credit from Mensah Suppliers
  Dr. Purchases Account         GHS  5,000
      Cr. Accounts Payable                   GHS  5,000
  Being: Credit purchase of goods for resale

Transaction 3: Cash sales of goods GHS 3,200
  Dr. Cash Account              GHS  3,200
      Cr. Sales Account                      GHS  3,200
  Being: Cash sale of goods to customers

Transaction 4: Paid monthly rent of GHS 800
  Dr. Rent Expense Account      GHS    800
      Cr. Cash Account                       GHS    800
  Being: Payment of monthly office rent (Note: treated as Cash; no separate Bank a/c set up)

Transaction 5: Received GHS 2,000 from debtor Osei Ltd in settlement of account
  Dr. Cash Account              GHS  2,000
      Cr. Accounts Receivable                GHS  2,000
  Being: Receipt in settlement of trade debtor account

PART B: TRIAL BALANCE (as at 28 February 2026)
Account Name                    Dr (GHS)      Cr (GHS)
Cash Account                     24,400
Capital Account                               20,000
Purchases Account                 5,000
Accounts Payable                               5,000
Sales Account                                  3,200
Rent Expense Account                800
Accounts Receivable                    0
                                --------      --------
TOTALS                           30,200        28,200

NOTE: The trial balance does not agree. The difference is GHS 2,000. I believe an error 
exists in how I treated the Accounts Receivable — the original debtor balance before 
receipt may not have been correctly carried forward into the trial balance.`;

const SUBMISSION_B = `FINANCIAL ACCOUNTING – CHAPTER 1 EXERCISE
Student: Yaw Darko  |  Course: FA L1  |  Date: 22 Feb 2026

PART A: JOURNAL ENTRIES

Transaction 1: Business commenced with GHS 20,000 cash
  Dr. Cash Account              GHS 20,000
      Cr. Capital Account                    GHS 20,000
  Being: Owner's initial capital contribution

Transaction 2: Credit purchase of goods from Mensah Suppliers — GHS 5,000
  Dr. Purchases Account         GHS  5,000
      Cr. Accounts Payable — Mensah         GHS  5,000
  Being: Goods purchased on credit for resale

Transaction 3: Cash sale of goods — GHS 3,200
  Dr. Cash Account              GHS  3,200
      Cr. Sales Account                      GHS  3,200
  Being: Revenue from cash sale of goods

Transaction 4: Rent paid by bank transfer — GHS 800
  Dr. Rent Expense              GHS    800
      Cr. Bank Account                       GHS    800
  Being: Monthly rent settled via bank transfer

Transaction 5: Receipt from debtor Osei Ltd — GHS 2,000
  Dr. Bank Account              GHS  2,000
      Cr. Accounts Receivable — Osei Ltd    GHS  2,000
  Being: Debt collected from trade debtor

PART B: TRIAL BALANCE (as at 28 February 2026)
Account Name                    Dr (GHS)      Cr (GHS)
Cash Account                     23,200
Bank Account                      1,200
Capital Account                               20,000
Purchases Account                 5,000
Accounts Payable                               5,000
Sales Account                                  3,200
Rent Expense                         800
Accounts Receivable                    0
                                --------      --------
TOTALS                           30,200        28,200

The trial balance agrees. Cash and Bank treated as separate accounts.`;

const SUBMISSION_C = `INCOME STATEMENT ANALYSIS — FA L2 CASE STUDY
Student: Ama Darko  |  Course: FA L2  |  Date: 14 Mar 2026

EXECUTIVE SUMMARY
This report analyses the income statement of Accra Manufacturing Ltd for the year ended
31 December 2025. The analysis identifies key revenue trends, expense classifications,
and profitability indicators.

SECTION 1: REVENUE ANALYSIS
Total revenue for the period stood at GHS 2,450,000, representing a 12% increase over
the prior year (GHS 2,187,500). The growth is primarily driven by:
  - Core product sales: GHS 2,100,000 (85.7% of revenue)
  - Service income: GHS 280,000 (11.4%)
  - Other income: GHS 70,000 (2.9%)

Revenue quality appears strong; the majority arises from recurring operational activities.
One concern is the GHS 70,000 classified as "other income" — this should be disaggregated
to determine whether it is sustainable.

SECTION 2: EXPENSE CLASSIFICATION
Operating Expenses (correctly classified):
  - Cost of goods sold: GHS 1,470,000 (gross margin = 40%)
  - Distribution costs: GHS 196,000
  - Administrative expenses: GHS 245,000

Non-operating items requiring reclassification:
  - Interest on long-term loan (GHS 85,000) — currently included in "admin expenses".
    This should be classified as a finance cost per IAS 1.

SECTION 3: PROFITABILITY ANALYSIS
  Gross Profit: GHS 980,000 (GM% = 40%)
  Operating Profit: GHS 539,000 (OP% = 22%)
  Profit Before Tax: GHS 454,000 (after finance costs properly restated)

Profitability compares favourably to industry average (OP% ~18%), suggesting efficient
cost control at the operational level.

CONCLUSION & RECOMMENDATIONS
The company shows solid revenue growth and healthy margins. I recommend:
1. Disaggregate "other income" in future periods for clearer reporting
2. Reclassify finance costs per IAS 1 to give a truer operating profit picture
3. Investigate the 8% increase in administrative expenses relative to revenue`;

const SUBMISSION_D = `COST VARIANCE ANALYSIS — MA L1 EXERCISE
Student: Kwabena Frimpong  |  Course: MA L1  |  Date: 20 Mar 2026

GIVEN DATA:
Product: Manufactured unit
Standard material: 4 kg per unit @ GHS 8.00/kg
Actual material: 4.2 kg per unit @ GHS 7.80/kg
Units produced: 1,000

Standard labour: 2.5 hrs per unit @ GHS 12.00/hr
Actual labour: 2.7 hrs per unit @ GHS 11.50/hr

PART A: MATERIAL VARIANCES

1. Material Price Variance (MPV)
   MPV = (Standard Price − Actual Price) × Actual Quantity
   MPV = (GHS 8.00 − GHS 7.80) × 4,200 kg
   MPV = GHS 0.20 × 4,200 = GHS 840 FAVOURABLE
   (Materials purchased at lower price than standard — favourable to the business)

2. Material Usage Variance (MUV)
   MUV = (Standard Quantity − Actual Quantity) × Standard Price
   MUV = (4,000 kg − 4,200 kg) × GHS 8.00
   MUV = −200 kg × GHS 8.00 = GHS 1,600 ADVERSE
   (More material used than standard — adverse, indicates wastage)

3. Total Material Cost Variance = MPV + MUV = GHS 840 F − GHS 1,600 A = GHS 760 ADVERSE

PART B: LABOUR VARIANCES

1. Labour Rate Variance (LRV)
   LRV = (Standard Rate − Actual Rate) × Actual Hours
   LRV = (GHS 12.00 − GHS 11.50) × 2,700 hrs
   LRV = GHS 0.50 × 2,700 = GHS 1,350 FAVOURABLE

2. Labour Efficiency Variance (LEV)
   LEV = (Standard Hours − Actual Hours) × Standard Rate
   LEV = (2,500 hrs − 2,700 hrs) × GHS 12.00
   LEV = −200 hrs × GHS 12.00 = GHS 2,400 ADVERSE

3. Total Labour Cost Variance = GHS 1,350 F − GHS 2,400 A = GHS 1,050 ADVERSE

PART C: OVERHEAD VARIANCES
(Absorbed at GHS 6.00 per standard hour)
Overhead Absorbed: 2,500 × GHS 6.00 = GHS 15,000
Overhead Incurred: GHS 16,200
Total Overhead Variance: GHS 1,200 ADVERSE`;

const SUBMISSION_E = `PERSONAL INCOME TAX — TAX L1 EXERCISE
Student: Esi Amponsah  |  Course: TAX L1  |  Date: 21 Mar 2026

TAXPAYER: Mr Emmanuel Darko (Employment income only)
TAX YEAR: 2025

STEP 1: GROSS INCOME
  Basic Salary                          GHS 72,000
  Car Allowance                         GHS  8,400
  Entertainment Allowance               GHS  2,400
  Total Gross Income                    GHS 82,800

STEP 2: STATUTORY DEDUCTIONS
  SSNIT (5.5% × GHS 72,000)            GHS  3,960
  (Note: Allowances are excluded from SSNIT computation per GRA rules)

STEP 3: PERSONAL RELIEFS
  Personal Relief (standard)            GHS  1,320
  Disability Relief (N/A)               GHS      0
  Marriage/Responsibility Relief        GHS    240
  Total Reliefs                         GHS  1,560

STEP 4: CHARGEABLE INCOME
  Gross Income                          GHS 82,800
  Less: SSNIT                          (GHS  3,960)
  Less: Personal Reliefs               (GHS  1,560)
  Chargeable Income                     GHS 77,280

STEP 5: TAX COMPUTATION (2025 Bands)
  First GHS 5,880 @ 0%                 GHS      0
  Next GHS 1,320 @ 5%                  GHS     66
  Next GHS 1,560 @ 10%                 GHS    156
  Next GHS 38,000 @ 17.5%              GHS  6,650
  Remaining GHS 30,520 @ 25%           GHS  7,630
  Total Tax Liability                   GHS 14,502

STEP 6: TAX ALREADY DEDUCTED
  Monthly PAYE (assumed)                GHS 14,000
  Balance Payable to GRA                GHS    502`;

const SUBMISSION_F = `AUDIT RISK ASSESSMENT — AUD L1 CASE STUDY
Student: Harriet Ofori  |  Course: AUD L1  |  Date: 24 Mar 2026

CLIENT: Coastal Imports Ltd  |  YEAR-END: 31 Dec 2025

SECTION 1: RISK IDENTIFICATION

The following significant risks have been identified from the planning information:

Risk 1: Revenue Recognition Risk (HIGH)
The company recorded a 35% jump in revenue in Q4 2025 with no corresponding increase in
inventory movements. This pattern is a red flag for potential premature or fictitious
revenue recognition, particularly close to the year-end.

Risk 2: Going Concern Risk (MEDIUM-HIGH)
Current ratio has fallen to 0.8:1 (prior year: 1.4:1) and the company has breached two
bank loan covenants. ISA 570 requires us to assess whether the going concern assumption
is appropriate.

Risk 3: Receivables Overstatement Risk (MEDIUM)
Trade receivables have increased by 45% while revenue grew only 35%. Days Sales
Outstanding has risen from 62 to 84 days, suggesting possible uncollectible balances
not adequately provided for.

Risk 4: Related Party Transactions Risk (MEDIUM)
The Managing Director has advanced GHS 1.2m to a sister company on no-interest terms.
Per IAS 24 and ISA 550, these must be disclosed and the commercial substance assessed.

SECTION 2: AUDIT PROCEDURES

For Risk 1 (Revenue):
  - Analytical review: compare revenue to prior periods and industry benchmarks
  - Test a sample of Q4 invoices: agree to delivery notes and bank receipts
  - Cut-off testing: examine sales around 31 Dec to detect early recognition

For Risk 2 (Going Concern):
  - Obtain management's going concern assessment and future cash flow forecasts
  - Review post-balance sheet events and subsequent bank correspondence
  - Consider disclosure adequacy if material uncertainty exists per ISA 570.19

For Risk 3 (Receivables):
  - Circularise major debtors (confirmations per ISA 505)
  - Review aged receivables analysis; test provision for doubtful debts adequacy
  - Vouch receipts after year-end to assess collectibility

For Risk 4 (Related Parties):
  - Review board minutes for authorisation of the loan
  - Confirm disclosure in the notes meets IAS 24 requirements
  - Assess whether the arm's-length principle has been applied

CONCLUSION:
Overall audit risk is assessed as HIGH due to the combination of revenue risk and
going concern indicators. A predominantly substantive approach is recommended with
reduced reliance on controls.`;

// ─── Grading data ─────────────────────────────────────────────────────────────

export const GRADING_DATA: AssignmentGrading[] = [

  // ── Assignment 1: Double Entry Exercise (Manual) ───────────────────────────
  {
    assignmentId: 1,
    title: "Chapter 1 – Double Entry Practice",
    course: "FA L1",
    courseId: 1,
    track: "Weekday",
    type: "Exercise",
    method: "manual",
    maxScore: 20, dueDate: "Mar 8, 2025", totalStudents: 42,
    rubric: [
      { id:"r1", criterion:"Journal Entry Accuracy", description:"Correct application of debit/credit rules across all 5 transactions", max:10 },
      { id:"r2", criterion:"Trial Balance", description:"Accurate extraction of ledger balances and successful agreement of totals", max:6 },
      { id:"r3", criterion:"Presentation", description:"Clear layout, proper account names, narrations included", max:4 },
    ],
    submissions: [
      { id:"s1",  studentId:1, name:"Akua Mensah",       initials:"AM", submittedAt:"2026-02-22T09:10:00Z", status:"graded",    score:16, source:"manual", feedback:"Very solid attempt, Akua. Journal entries 1–3 are perfect. Entry 4 misses the narration. Trial balance shows a GHS 1,000 discrepancy — review the rent account treatment. Excellent presentation overall.", rubricScores:{r1:9,r2:4,r3:3}, submissionText:"[Akua's submission — marked as graded. Score: 16/20]" },
      { id:"s2",  studentId:2, name:"Kofi Boateng",      initials:"KB", submittedAt:"2026-02-22T11:22:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:SUBMISSION_A },
      { id:"s3",  studentId:3, name:"Kwame Asante",      initials:"KA", submittedAt:"2026-02-22T14:05:00Z", status:"graded",    score:15, source:"manual", feedback:"Good effort overall. Transaction 2 debit correctly identifies Purchases, though the creditor name should appear in the narration. Trial balance has one transposition error — double-check your additions.", rubricScores:{r1:8,r2:4,r3:3}, submissionText:"[Kwame's submission — marked as graded. Score: 15/20]" },
      { id:"s4",  studentId:4, name:"Yaw Darko",         initials:"YD", submittedAt:"2026-02-22T10:30:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:SUBMISSION_B },
      { id:"s5",  studentId:5, name:"Abena Sarpong",     initials:"AS", submittedAt:"2026-02-25T16:45:00Z", status:"late",      score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Abena's late submission — awaiting grading]" },
      { id:"s6",  studentId:6, name:"Efua Addai",        initials:"EA", submittedAt:"2026-02-21T20:15:00Z", status:"graded",    score:19, source:"manual", feedback:"Exceptional work, Efua. All entries are correct with clear narrations. The trial balance agrees and is neatly presented. Minor: account ordering in the TB could follow the conventional sequence (assets first).", rubricScores:{r1:10,r2:6,r3:3}, submissionText:"[Efua's submission — marked as graded. Score: 19/20]" },
      { id:"s7",  studentId:7, name:"Emmanuel Osei",     initials:"EO", submittedAt:"2026-02-22T08:55:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Emmanuel's submission — awaiting grading]" },
      { id:"s8",  studentId:8, name:"Grace Boateng",     initials:"GB", submittedAt:"2026-02-22T13:40:00Z", status:"graded",    score:11, source:"manual", feedback:"Grace, you have the right structure but transactions 2 and 5 have the debit and credit reversed. Please revisit the golden rules: for a real account, what comes in is debited. Trial balance doesn't agree as a result. Come see me in office hours.", rubricScores:{r1:5,r2:3,r3:3}, submissionText:"[Grace's submission — marked as graded. Score: 11/20]" },
      { id:"s9",  studentId:9, name:"Isaac Amponsah",    initials:"IA", submittedAt:null,                   status:"missing",   score:null, source:null, feedback:"", rubricScores:{}, submissionText:"" },
      { id:"s10", studentId:10,name:"Josephine Asante",  initials:"JA", submittedAt:"2026-02-22T17:30:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Josephine's submission — awaiting grading]" },
    ],
  },

  // ── Assignment 4: Income Statement Analysis (Manual) ──────────────────────
  {
    assignmentId: 4,
    title: "Income Statement Analysis",
    course: "FA L2",
    courseId: 2,
    track: "Weekend",
    type: "Case Study",
    method: "manual",
    maxScore: 25, dueDate: "Mar 12, 2025", totalStudents: 38,
    rubric: [
      { id:"r1", criterion:"Revenue Analysis",       description:"Identification and analysis of all revenue streams with supporting commentary", max:8 },
      { id:"r2", criterion:"Expense Classification", description:"Correct categorisation of operating vs non-operating expenses per IAS 1",       max:7 },
      { id:"r3", criterion:"Conclusions",            description:"Justified recommendations supported by the analytical findings",                max:7 },
      { id:"r4", criterion:"Professional Format",    description:"Report structure, appropriate referencing, clear headings",                    max:3 },
    ],
    submissions: [
      { id:"s1", studentId:5, name:"Ama Darko",        initials:"AD", submittedAt:"2026-03-11T10:20:00Z", status:"graded",    score:21, source:"manual", feedback:"Strong revenue analysis and good identification of the IAS 1 reclassification issue. Recommendations in Section 3 are well-argued. Deduction: conclusions would benefit from quantifying the impact of the reclassification on EBIT.", rubricScores:{r1:7,r2:6,r3:5,r4:3}, submissionText:SUBMISSION_C },
      { id:"s2", studentId:6, name:"Nana Osei",        initials:"NO", submittedAt:"2026-03-11T14:30:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Nana's submission — awaiting grading]" },
      { id:"s3", studentId:7, name:"Abena Kusi",       initials:"AK", submittedAt:"2026-03-12T09:00:00Z", status:"graded",    score:18, source:"manual", feedback:"Good structure. Revenue analysis is thorough. The expense section misses the finance cost reclassification entirely — this was a key issue in the scenario. Conclusions are reasonable but could be more specific.", rubricScores:{r1:7,r2:4,r3:5,r4:2}, submissionText:"[Abena's submission — marked as graded]" },
      { id:"s4", studentId:8, name:"Kwame Darko",      initials:"KD", submittedAt:"2026-03-14T11:10:00Z", status:"late",      score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Kwame's late submission — awaiting grading]" },
      { id:"s5", studentId:9, name:"Efua Mensah",      initials:"EM", submittedAt:"2026-03-11T19:45:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Efua's submission — awaiting grading]" },
      { id:"s6", studentId:10,name:"Yaw Amponsah",     initials:"YA", submittedAt:null,                   status:"missing",   score:null, source:null, feedback:"", rubricScores:{}, submissionText:"" },
    ],
  },

  // ── Assignment 7: Cost Variance Analysis (Manual) ─────────────────────────
  {
    assignmentId: 7,
    title: "Cost Variance Analysis",
    course: "MA L1",
    courseId: 3,
    track: "Weekday",
    type: "Exercise",
    method: "manual",
    maxScore: 25, dueDate: "Mar 18, 2025", totalStudents: 35,
    rubric: [
      { id:"r1", criterion:"Material Variances", description:"Correct calculation of material price and usage variances with favourable/adverse notation", max:10 },
      { id:"r2", criterion:"Labour Variances",   description:"Correct calculation of labour rate and efficiency variances",                             max:10 },
      { id:"r3", criterion:"Overhead Variances", description:"Fixed and/or variable overhead variance calculations",                                   max:5  },
    ],
    submissions: [
      { id:"s1", studentId:11, name:"Kwabena Frimpong", initials:"KF", submittedAt:"2026-03-17T10:10:00Z", status:"graded",    score:23, source:"manual", feedback:"Excellent variance analysis, Kwabena. All calculations are correct with clear workings. One minor point: the overhead variance section would benefit from splitting fixed and variable components separately.", rubricScores:{r1:10,r2:9,r3:4}, submissionText:SUBMISSION_D },
      { id:"s2", studentId:12, name:"Aba Frimpong",     initials:"AF", submittedAt:"2026-03-17T14:22:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Aba's submission — awaiting grading]" },
      { id:"s3", studentId:13, name:"Kojo Acheampong",  initials:"KA", submittedAt:"2026-03-17T09:30:00Z", status:"graded",    score:19, source:"manual", feedback:"Good attempt. Material variances correct. Labour efficiency variance formula reversed — you have (Actual Hours − Standard Hours) but should be (Standard Hours − Actual Hours). This changes your F/A classification.", rubricScores:{r1:9,r2:7,r3:3}, submissionText:"[Kojo's submission — marked as graded]" },
      { id:"s4", studentId:14, name:"Efua Boadu",       initials:"EB", submittedAt:"2026-03-18T16:00:00Z", status:"late",      score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Efua's late submission — awaiting grading]" },
      { id:"s5", studentId:15, name:"Kwesi Darko",      initials:"KD", submittedAt:"2026-03-17T11:45:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Kwesi's submission — awaiting grading]" },
    ],
  },

  // ── Assignment 9: Personal Income Tax (Manual) ────────────────────────────
  {
    assignmentId: 9,
    title: "Personal Income Tax Exercise",
    course: "TAX L1",
    courseId: 4,
    track: "All",
    type: "Exercise",
    method: "manual",
    maxScore: 20, dueDate: "Mar 19, 2025", totalStudents: 29,
    rubric: [
      { id:"r1", criterion:"Income Computation",    description:"Correct classification and aggregation of all income sources",                 max:8 },
      { id:"r2", criterion:"Allowable Deductions",  description:"Proper application of statutory reliefs, SSNIT, and personal allowances",     max:7 },
      { id:"r3", criterion:"Tax Calculation",       description:"Correct application of tax bands and final tax liability computation",         max:5 },
    ],
    submissions: [
      { id:"s1", studentId:16, name:"Esi Amponsah",   initials:"EA", submittedAt:"2026-03-18T08:30:00Z", status:"graded",    score:18, source:"manual", feedback:"Excellent, Esi. All steps are logically structured. Minor point: SSNIT should be computed on basic salary only — you correctly excluded allowances, which is right. The tax band application is accurate. One band amount has a minor arithmetic error in Step 5 (GHS 38,000 @ 17.5% = GHS 6,650 ✓).", rubricScores:{r1:7,r2:7,r3:4}, submissionText:SUBMISSION_E },
      { id:"s2", studentId:17, name:"Fiifi Mensah",   initials:"FM", submittedAt:"2026-03-18T11:20:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Fiifi's submission — awaiting grading]" },
      { id:"s3", studentId:18, name:"Gifty Asare",    initials:"GA", submittedAt:"2026-03-18T14:10:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Gifty's submission — awaiting grading]" },
      { id:"s4", studentId:19, name:"Kojo Asante",    initials:"KA", submittedAt:"2026-03-20T10:00:00Z", status:"late",      score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Kojo's late submission — awaiting grading]" },
      { id:"s5", studentId:20, name:"Adwoa Sarpong",  initials:"AS", submittedAt:null,                   status:"missing",   score:null, source:null, feedback:"", rubricScores:{}, submissionText:"" },
    ],
  },

  // ── Assignment 11: Audit Risk Assessment (Manual) ─────────────────────────
  {
    assignmentId: 11,
    title: "Audit Risk Assessment",
    course: "AUD L1",
    courseId: 5,
    track: "Weekend",
    type: "Case Study",
    method: "manual",
    maxScore: 30, dueDate: "Mar 22, 2025", totalStudents: 31,
    rubric: [
      { id:"r1", criterion:"Risk Identification", description:"Clear identification of all significant audit risks from the scenario",           max:10 },
      { id:"r2", criterion:"Risk Assessment",     description:"Classification and justification of risk levels with reference to relevant ISAs", max:10 },
      { id:"r3", criterion:"Audit Procedures",    description:"Specific, tailored procedures proposed for each identified risk",                max:7  },
      { id:"r4", criterion:"Conclusions",         description:"Overall risk assessment with professional and logical conclusions",              max:3  },
    ],
    submissions: [
      { id:"s1", studentId:21, name:"Harriet Ofori",   initials:"HO", submittedAt:"2026-03-21T09:15:00Z", status:"graded",    score:26, source:"manual", feedback:"Excellent risk assessment, Harriet. Four risks correctly identified and well-prioritised. ISA references (ISA 570, ISA 550, ISA 505) are appropriately applied. Audit procedures are specific and tailored. Minor: the going concern conclusion in Section 3 could include specific wording on the potential modified opinion.", rubricScores:{r1:9,r2:9,r3:6,r4:2}, submissionText:SUBMISSION_F },
      { id:"s2", studentId:22, name:"Isaac Danso",     initials:"ID", submittedAt:"2026-03-21T13:40:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Isaac's submission — awaiting grading]" },
      { id:"s3", studentId:23, name:"Josephine Adu",   initials:"JA", submittedAt:"2026-03-21T11:05:00Z", status:"graded",    score:22, source:"manual", feedback:"Good work overall. Risk identification covers the main areas. Revenue risk analysis could be more specific about the audit implication. Procedures are generally good but some are too generic (e.g., 'verify figures' — what exactly?).", rubricScores:{r1:8,r2:7,r3:5,r4:2}, submissionText:"[Josephine's submission — marked as graded]" },
      { id:"s4", studentId:24, name:"Kwame Frimpong",  initials:"KF", submittedAt:"2026-03-22T17:55:00Z", status:"late",      score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Kwame's late submission — awaiting grading]" },
      { id:"s5", studentId:25, name:"Lydia Mensah",    initials:"LM", submittedAt:"2026-03-21T10:30:00Z", status:"submitted", score:null, source:null, feedback:"", rubricScores:{}, submissionText:"[Lydia's submission — awaiting grading]" },
    ],
  },

  // ── Assignment 20: Group Case Study — Balance Sheet Analysis (Manual, Group) ─
  {
    assignmentId: 20,
    title: "Group Case Study: Balance Sheet Analysis",
    course: "FA L1",
    courseId: 1,
    track: "Weekday",
    type: "Case Study",
    method: "manual",
    maxScore: 40, dueDate: "Apr 4, 2026", totalStudents: 42,
    allowResubmit: true,
    groupConfig: {
      enabled: true,
      mode: "instructor_assigned",
      maxGroupSize: 4,
    },
    rubric: [
      { id:"r1", criterion:"Balance Sheet Structure",  description:"Correct classification of assets, liabilities, and equity with proper headings", max:15 },
      { id:"r2", criterion:"Calculations & Accuracy",  description:"Arithmetic accuracy and correct application of accounting principles",           max:15 },
      { id:"r3", criterion:"Analysis & Commentary",    description:"Meaningful insights on liquidity, solvency, and working capital management",     max:10 },
    ],
    submissions: [
      {
        id: "sg1",
        studentId: 1, // Akua Mensah submitted on behalf of Group Alpha
        name: "Group Alpha",
        initials: "GA",
        submittedAt: "2026-03-28T10:30:00Z",
        status: "submitted",
        score: null, source: null, feedback: "", rubricScores: {},
        submissionText: `GROUP CASE STUDY — BALANCE SHEET ANALYSIS
Group: Group Alpha  |  Members: Akua Mensah, Kwame Asante, Yaa Frimpong
Course: FA L1 (Weekday)  |  Date: 28 Mar 2026

SECTION 1: BALANCE SHEET RECONSTRUCTION
Based on the trial balance of Dansoman Trading Co. as at 31 Dec 2025:

NON-CURRENT ASSETS
  Land & Buildings (net of depreciation)    GHS 180,000
  Motor Vehicles (net)                       GHS  42,000
  Equipment (net)                            GHS  28,000
  Total Non-Current Assets                  GHS 250,000

CURRENT ASSETS
  Inventory                                  GHS  35,000
  Trade Receivables                          GHS  48,200
  Prepaid Expenses                           GHS   3,400
  Cash & Bank                                GHS  12,600
  Total Current Assets                       GHS  99,200

TOTAL ASSETS                                GHS 349,200

EQUITY
  Share Capital                             GHS 150,000
  Retained Earnings                          GHS  72,400
  Total Equity                              GHS 222,400

NON-CURRENT LIABILITIES
  Long-Term Loan (repayable 2028)            GHS  80,000

CURRENT LIABILITIES
  Trade Payables                             GHS  32,800
  Accrued Expenses                           GHS   7,600
  Bank Overdraft                             GHS   6,400
  Total Current Liabilities                  GHS  46,800

TOTAL EQUITY & LIABILITIES                 GHS 349,200

SECTION 2: ANALYSIS
Current Ratio: 99,200 / 46,800 = 2.12:1 — healthy liquidity position
Quick Ratio: (99,200 − 35,000) / 46,800 = 1.37:1 — adequate
Debt-to-Equity: 126,800 / 222,400 = 0.57 — moderate leverage
Working Capital: 99,200 − 46,800 = GHS 52,400 positive

The company appears financially sound with strong liquidity and manageable debt levels.`,
        groupMeta: {
          groupId: "grp-1-wd-001",
          groupName: "Group Alpha",
          memberIds: [1, 3, 5],
          submittedByStudentId: 1,
        },
      },
      {
        id: "sg2",
        studentId: 2, // Kofi Boateng submitted on behalf of Group Beta
        name: "Group Beta",
        initials: "GB",
        submittedAt: "2026-03-29T14:15:00Z",
        status: "graded",
        score: 34, source: "manual",
        feedback: "Solid work from Group Beta. Balance sheet structure is correct and totals agree. The analysis section is strong — good use of ratios with clear interpretation. Minor: the quick ratio formula should exclude prepaid expenses as well as inventory. Overall a commendable group submission.",
        rubricScores: { r1: 13, r2: 12, r3: 9 },
        submissionText: `GROUP CASE STUDY — BALANCE SHEET ANALYSIS
Group: Group Beta  |  Members: Kofi Boateng, Yaw Darko
Course: FA L1 (Weekday)  |  Date: 29 Mar 2026

[Balance sheet and analysis — marked as graded. Score: 34/40]`,
        groupMeta: {
          groupId: "grp-1-wd-002",
          groupName: "Group Beta",
          memberIds: [2, 4],
          submittedByStudentId: 2,
        },
      },
    ],
  },

  // ── Assignment 13: Double Entry MCQ Quiz (Auto) ───────────────────────────
  {
    assignmentId: 13,
    title: "Quiz 1: Double Entry MCQ",
    course: "FA L1",
    courseId: 1,
    track: "Weekday",
    type: "Quiz",
    method: "auto",
    maxScore: 15, dueDate: "Mar 5, 2025", totalStudents: 42,
    rubric: [],
    questions: FA_QUIZ_QUESTIONS,
    submissions: [
      { id:"sq1",  studentId:1,  name:"Akua Mensah",      initials:"AM", submittedAt:"2026-03-04T14:10:00Z", status:"graded", score:15,  source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,1,1,2,2,2,1,1,2,1]) },
      { id:"sq2",  studentId:2,  name:"Kofi Boateng",     initials:"KB", submittedAt:"2026-03-04T15:22:00Z", status:"graded", score:13.5,source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,0,1,2,2,2,1,1,2,1]) },
      { id:"sq3",  studentId:3,  name:"Kwame Asante",     initials:"KA", submittedAt:"2026-03-04T13:45:00Z", status:"graded", score:13.5,source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,1,0,2,2,2,1,1,2,1]) },
      { id:"sq4",  studentId:4,  name:"Yaw Darko",        initials:"YD", submittedAt:"2026-03-05T08:30:00Z", status:"graded", score:12,  source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,1,1,2,0,2,1,0,2,1]) },
      { id:"sq5",  studentId:5,  name:"Abena Sarpong",    initials:"AS", submittedAt:"2026-03-04T19:00:00Z", status:"graded", score:10.5,source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([0,1,1,2,2,0,1,1,2,0]) },
      { id:"sq6",  studentId:6,  name:"Efua Addai",       initials:"EA", submittedAt:"2026-03-04T12:20:00Z", status:"graded", score:15,  source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,1,1,2,2,2,1,1,2,1]) },
      { id:"sq7",  studentId:7,  name:"Emmanuel Osei",    initials:"EO", submittedAt:"2026-03-05T09:10:00Z", status:"graded", score:9,   source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,0,0,1,2,2,0,1,2,1]) },
      { id:"sq8",  studentId:8,  name:"Grace Boateng",    initials:"GB", submittedAt:"2026-03-04T16:55:00Z", status:"graded", score:15,  source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([1,1,1,2,2,2,1,1,2,1]) },
      { id:"sq9",  studentId:9,  name:"Isaac Amponsah",   initials:"IA", submittedAt:"2026-03-04T20:00:00Z", status:"graded", score:13.5,source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([-1,1,1,2,2,2,1,1,2,1]) },
      { id:"sq10", studentId:10, name:"Josephine Asante", initials:"JA", submittedAt:"2026-03-05T10:30:00Z", status:"graded", score:6,   source:"auto", feedback:"", rubricScores:{}, submissionText:"", answers:buildAnswers([0,0,1,1,2,0,0,1,2,0]) },
    ],
  },
];

// Re-export autoScore for use in page
export { autoScore, FA_QUIZ_QUESTIONS };
