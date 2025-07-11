
import type { strategicPlanSchema } from "@/lib/schemas";
import type { z } from "zod";

export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type StrategicPlanFormValues = z.infer<typeof strategicPlanSchema>;

// This is now the main type for submissions, based on the new schema
export interface Submission extends StrategicPlanFormValues {
  id: string;
  userId: string;
  status: SubmissionStatus;
  submittedAt: string;
  lastModifiedAt: string;
  comments?: string;

  // These fields are deprecated in the new structure but might exist in old data.
  // We keep them optional to avoid breaking old records.
  objective?: string;
  strategicAction?: string;
  objectiveWeight?: string;
  strategicActionWeight?: string;
}

export type Role = "User" | "Approver" | "Admin" | null;

export type UserStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Keep optional on client-side types
  role: "Approver" | "Admin";
  status: UserStatus;
  createdAt: string;
  statusUpdatedAt: string;
  passwordResetStatus?: 'Pending' | null;
}
