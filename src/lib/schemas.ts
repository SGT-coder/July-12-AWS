
import * as z from "zod";

export const strategicPlanSchema = z.object({
    userName: z.string({ required_error: "ስም ያስፈልጋል" }).min(1, "ስም ያስፈልጋል"),
    projectTitle: z.string({ required_error: "የእቅድ ርዕስ ያስፈልጋል" }).min(1, "የእቅድ ርዕስ ያስፈልጋል"),
    department: z.string({ required_error: "ዲፓርትመንት መምረጥ ያስፈልጋል" }).min(1, "ዲፓርትመንት መምረጥ ያስፈልጋል"),
    goal: z.string({ required_error: "ግብ መምረጥ ያስፈልጋል" }).min(1, "ግብ መምረጥ ያስፈልጋል"),
    objective: z.string({ required_error: "ዓላማ መምረጥ ያስፈልጋል" }).min(1, "ዓላማ መምረጥ ያስፈልጋል"),
    strategicAction: z.string({ required_error: "ስትራቴጂክ እርምጃ ያስፈልጋል" }).min(1, "ስትራቴጂክ እርምጃ ያስፈልጋል"),
    metric: z.string({ required_error: "መለኪያ ያስፈልጋል" }).min(1, "መለኪያ ያስፈልጋል"),
    mainTask: z.string({ required_error: "ዋና ተግባር ያስፈልጋል" }).min(1, "ዋና ተግባር ያስፈልጋል"),
    mainTaskTarget: z.string({ required_error: "የዋና ተግባር ዒላማ ያስፈልጋል" }).min(1, "የዋና ተግባር ዒላማ ያስፈልጋል"),
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
}).superRefine((data, ctx) => {
    if (data.budgetSource === 'መንግስት') {
        if (!data.governmentBudgetAmount || data.governmentBudgetAmount.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "ከመንግስት በጀት መጠን መግባት አለበት።",
                path: ['governmentBudgetAmount'],
            });
        }
        if (!data.governmentBudgetCode || data.governmentBudgetCode.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "ከመንግስት በጀት ኮድ መመረጥ አለበት።",
                path: ['governmentBudgetCode'],
            });
        }
    }
    if (data.budgetSource === 'ግራንት') {
        if (!data.grantBudgetAmount || data.grantBudgetAmount.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "ከግራንት በጀት መጠን መግባት አለበት።",
                path: ['grantBudgetAmount'],
            });
        }
    }
    if (data.budgetSource === 'ኢስዲጂ') {
        if (!data.sdgBudgetAmount || data.sdgBudgetAmount.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "ከኢስ ዲ ጂ በጀት መጠን መግባት አለበት።",
                path: ['sdgBudgetAmount'],
            });
        }
    }
});


export type StrategicPlanFormValues = z.infer<typeof strategicPlanSchema>;

export const resetPasswordSchema = z.object({
    fullName: z.string().min(1, 'ሙሉ ስም ያስፈልጋል።'),
    email: z.string().email('የተሳሳተ የኢሜይል አድራሻ።'),
});

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
    confirmPassword: z.string(),
    role: z.enum(['Admin', 'Approver'], { required_error: "ሚና መምረጥ ያስፈልጋል።" }),
}).refine(data => data.password === data.confirmPassword, {
    message: "የይለፍ ቃሎች አይዛመዱም።",
    path: ["confirmPassword"],
});
export type AdminAddUserFormValues = z.infer<typeof adminAddUserSchema>;
