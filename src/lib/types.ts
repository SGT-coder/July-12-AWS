export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export interface Activity {
  id: string;
  name: string;
  description: string;
  timeline: string;
  budget: number;
}

export interface Submission {
  id: string;
  userId: string;
  userName: string;
  projectTitle: string;
  department: string;
  budgetYear: number;
  objective: string;
  activities: Activity[];
  expectedOutcome: string;
  status: SubmissionStatus;
  submittedAt: string;
  lastModifiedAt: string;
  comments?: string;
}

export type Role = "User" | "Approver" | null;

export interface User {
  id: string;
  name: string;
  role: Role;
}
