
import type { strategicPlanSchema } from "@/lib/schemas";
import type { z } from "zod";

export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type StrategicPlanFormValues = z.infer<typeof strategicPlanSchema>;

export interface Submission extends StrategicPlanFormValues {
  id: string;
  userId: string;
  userName: string;
  status: SubmissionStatus;
  submittedAt: string;
  lastModifiedAt: string;
  comments?: string;
}

export type Role = "User" | "Approver" | "Admin" | null;

export type UserStatus = "Pending" | "Approved" | "Rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Keep optional on client-side types
  role: "User" | "Approver" | "Admin";
  status: UserStatus;
  passwordResetRequested?: boolean;
}
