
import * as z from "zod";

export const strategicPlanSchema = z.object({
    userName: z.string({ required_error: "ስም ያስፈልጋል" }).min(2, "ስም ቢያንስ 2 ቁምፊዎች መሆን አለበት።"),
    projectTitle: z.string({ required_error: "የእቅድ ርዕስ ያስፈልጋል" }).min(1, "የእቅድ ርዕስ ባዶ መሆን የለበትም"),
    department: z.string({ required_error: "ዲፓርትመንት መምረጥ ያስፈልጋል" }).min(1, "ዲፓርትመንት መምረጥ ያስፈልጋል"),
    goal: z.string({ required_error: "ግብ መምረጥ ያስፈልጋል" }).min(1, "ግብ መምረጥ ያስፈልጋል"),
    objective: z.string({ required_error: "ዓላማ መምረጥ ያስፈልጋል" }).min(1, "ዓላማ መምረጥ ያስፈልጋል"),
    strategicAction: z.string({ required_error: "ስትራቴጂክ እርምጃ ያስፈልጋል" }).min(1, "ስትራቴጂክ እርምጃ ባዶ መሆን የለበትም"),
    metric: z.string({ required_error: "መለኪያ ያስፈልጋል" }).min(1, "መለኪያ ባዶ መሆን የለበትም"),
    mainTask: z.string({ required_error: "ዋና ተግባር ያስፈልጋል" }).min(1, "ዋና ተግባር ባዶ መሆን የለበትም"),
    mainTaskTarget: z.string({ required_error: "የዋና ተግባር ዒላማ ያስፈልጋል" }).min(1, "የዋና ተግባር ዒላማ ባዶ መሆን የለበትም"),
    objectiveWeight: z.string({ required_error: "የዓላማ ክብደት መምረጥ ያስፈልጋል" }).min(1, "የዓላማ ክብደት መምረጥ ያስፈልጋል"),
    strategicActionWeight: z.string({ required_error: "የስትራቴጂክ እርምጃ ክብደት መምረጥ ያስፈልጋል" }).min(1, "የስትራቴጂክ እርምጃ ክብደት መምረጥ ያስፈልጋል"),
    metricWeight: z.string({ required_error: "የመለኪያ ክብደት መምረጥ ያስፈልጋል" }).min(1, "የመለኪያ ክብደት መምረጥ ያስፈልጋል"),
    mainTaskWeight: z.string({ required_error: "የዋና ተግባር ክብደት መምረጥ ያስፈልጋል" }).min(1, "የዋና ተግባር ክብደት መምረጥ ያስፈልጋል"),
    executingBody: z.string({ required_error: "ፈጻሚ አካል መምረጥ ያስፈልጋል" }).min(1, "ፈጻሚ አካል መምረጥ ያስፈልጋል"),
    executionTime: z.string({ required_error: "የሚከናወንበት ጊዜ መምረጥ ያስፈልጋል" }).min(1, "የሚከናወንበት ጊዜ መምረጥ ያስፈልጋል"),
    budgetSource: z.string({ required_error: "የበጀት ምንጭ መምረጥ ያስፈልጋል" }).min(1, "የበጀት ምንጭ መምረጥ ያስፈልጋል"),
    governmentBudgetAmount: z.string().optional(),
    governmentBudgetCode: z.string().optional(),
    grantBudgetAmount: z.string().optional(),
    sdgBudgetAmount: z.string().optional(),
});

export type StrategicPlanFormValues = z.infer<typeof strategicPlanSchema>;


// --- User Settings Schemas ---
export const updateProfileSchema = z.object({
    name: z.string().min(2, "ስም ቢያንስ 2 ቁምፊዎች መሆን አለበት።"),
    email: z.string().email("የተሳሳተ የኢሜይል አድራሻ።"),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
    oldPassword: z.string().min(1, "የድሮ የይለፍ ቃል ያስፈልጋል።"),
    newPassword: z.string().min(6, "አዲስ የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "አዲስ የይለፍ ቃሎች አይዛመዱም።",
    path: ["confirmPassword"],
});
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export const adminAddUserSchema = z.object({
    name: z.string().min(2, "ስም ቢያንስ 2 ቁምፊዎች መሆን አለበት።"),
    email: z.string().email("የተሳሳተ የኢሜይል አድራሻ።"),
    password: z.string().min(6, "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።"),
    role: z.enum(['Admin', 'Approver'], { required_error: "ሚና መምረጥ ያስፈልጋል።" }),
});
export type AdminAddUserFormValues = z.infer<typeof adminAddUserSchema>;
