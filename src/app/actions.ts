
'use server';

import { randomUUID } from 'crypto';
import { z } from 'zod';
import { strategicPlanSchema, type StrategicPlanFormValues, updateProfileSchema, changePasswordSchema, adminAddUserSchema, type AdminAddUserFormValues, resetPasswordSchema } from '@/lib/schemas';
import type { Submission, SubmissionStatus, User, UserStatus, Role } from '@/lib/types';
import { initialSubmissions, initialUsers } from '@/lib/data';

// In-memory database
let submissions: Submission[] = [...initialSubmissions];
let users: User[] = [...initialUsers];

const statusTranslations: Record<UserStatus | SubmissionStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};

const roleTranslations: Record<User['role'], string> = {
    Admin: "አስተዳዳሪ",
    Approver: "አጽዳቂ",
};

// --- Auth Actions ---

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: z.enum(['Admin', 'Approver']),
});

export async function loginUser(credentials: z.infer<typeof loginSchema>) {
    const parsedCredentials = loginSchema.safeParse(credentials);
    if (!parsedCredentials.success) {
        return { success: false, message: 'የተሳሳተ መረጃ ቀርቧል።' };
    }

    const { email, password, role } = parsedCredentials.data;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
        return { success: false, message: 'በዚህ ኢሜይል የተመዘገበ መለያ አልተገኘም።' };
    }
    
    // Critical fix: Ensure the user's role matches the one expected by the login form.
    if (user.role !== role) {
        return { success: false, message: 'በዚህ ገጽ ለመግባት ፈቃድ የለዎትም።' };
    }

    // In a real app, you would hash and compare passwords.
    if (user.password !== password) {
        return { success: false, message: 'የተሳሳተ የይለፍ ቃል።' };
    }

    if (user.status !== 'Approved') {
        return { success: false, message: 'ይህ መለያ ይሁንታ በመጠበቅ ላይ ነው።' };
    }
    
    // Don't send password back to the client
    const { password: _, ...userWithoutPassword } = user;
    const translatedRole = roleTranslations[user.role];

    return { success: true, user: userWithoutPassword, translatedRole };
}

const registerSchema = z.object({
    fullName: z.string().min(2, 'ሙሉ ስም ያስፈልጋል።'),
    email: z.string().email('የተሳሳተ የኢሜይል አድራሻ።'),
    password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት።'),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
    const parsedData = registerSchema.safeParse(data);
    if (!parsedData.success) {
        const issues = parsedData.error.flatten().fieldErrors;
        const message = Object.values(issues).flat().join(' ');
        return { success: false, message: message || "የተሳሳተ መረጃ ቀርቧል።" };
    }
    
    const { fullName, email, password } = parsedData.data;

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'በዚህ ኢሜይል አስቀድሞ የተመዘገበ መለያ አለ።' };
    }

    const newUser: User = {
        id: randomUUID(),
        name: fullName,
        email,
        password, // Storing plaintext password
        role: 'Approver',
        status: 'Pending',
        createdAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    
    return { success: true, message: 'ምዝገባው ተሳክቷል! መለያዎ የአስተዳዳሪ ይሁንታ በመጠበቅ ላይ ነው።' };
}

export async function requestPasswordReset(data: z.infer<typeof resetPasswordSchema>) {
    const parsedData = resetPasswordSchema.safeParse(data);
    if (!parsedData.success) {
        const issues = parsedData.error.flatten().fieldErrors;
        const message = Object.values(issues).flat().join(' ');
        return { success: false, message: message || "የተሳሳተ መረጃ ቀርቧል።" };
    }

    const { fullName, email } = parsedData.data;
    const userIndex = users.findIndex(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.name.trim().toLowerCase() === fullName.trim().toLowerCase()
    );

    if (userIndex === -1) {
        return { success: false, message: "በዚያ ስም እና የኢሜይል አድራሻ የተመዘገበ መለያ የለም።" };
    }
    
    const user = users[userIndex];

    if (user.role === 'Admin') {
        user.passwordResetStatus = 'Pending';
        user.statusUpdatedAt = new Date().toISOString();
        return { success: true, message: "የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎ ለአስተዳዳሪ ተልኳል።", isAdminRequest: true };
    }

    const newPassword = Math.random().toString(36).substring(2, 10);
    user.password = newPassword;
    user.statusUpdatedAt = new Date().toISOString();
    
    return { success: true, newPassword, message: "አዲስ የይለፍ ቃል ተፈጥሯል።", isAdminRequest: false };
}


// --- Admin Actions ---

export async function getUsers(): Promise<User[]> {
    // Return all users without their passwords
    return users.map(({ password, ...user }) => user);
}

export async function adminAddUser(data: AdminAddUserFormValues) {
    const parsedData = adminAddUserSchema.safeParse(data);
    if (!parsedData.success) {
        const issues = parsedData.error.flatten().fieldErrors;
        const message = Object.values(issues).flat().join(' ');
        return { success: false, message: message || "የተሳሳተ መረጃ ቀርቧል።" };
    }
    
    const { name, email, password, role } = parsedData.data;

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'በዚህ ኢሜይል አስቀድሞ የተመዘገበ መለያ አለ።' };
    }

    const newUser: User = {
        id: randomUUID(),
        name,
        email,
        password,
        role,
        status: 'Approved',
        createdAt: new Date().toISOString(),
        statusUpdatedAt: new Date().toISOString(),
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, message: 'ተጠቃሚው በተሳካ ሁኔታ ተፈጥሯል።', user: userWithoutPassword };
}


export async function updateUserStatus(userId: string, status: UserStatus) {
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    users[userIndex].status = status;
    users[userIndex].statusUpdatedAt = new Date().toISOString();
    const translatedStatus = statusTranslations[status] || status;
    return { success: true, message: `የተጠቃሚው ሁኔታ ወደ '${translatedStatus}' ተቀይሯል።`};
}

export async function deleteUser(userId: string) {
    const initialLength = users.length;
    users = users.filter(u => u.id !== userId);

    if (users.length === initialLength) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }
    return { success: true, message: "ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል።"};
}


export async function approvePasswordReset(userId: string, adminId: string) {
    if (userId === adminId) {
        return { success: false, message: "የራስዎን የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ ማጽደቅ አይችሉም።" };
    }
    
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1 || users[userIndex].passwordResetStatus !== 'Pending') {
        return { success: false, message: "የሚጸድቅ የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ አልተገኘም።" };
    }

    const newPassword = 'ahri123';
    users[userIndex].password = newPassword;
    users[userIndex].passwordResetStatus = undefined;
    users[userIndex].statusUpdatedAt = new Date().toISOString();

    return { success: true, newPassword, message: "የይለፍ ቃል ዳግም ማስጀመር ጸድቋል። አዲሱ የይለፍ ቃል ለተጠቃሚው ደህንነቱ በተጠበቀ ሁኔታ መላክ አለበት።" };
}

export async function rejectPasswordReset(userId: string) {
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1 || users[userIndex].passwordResetStatus !== 'Pending') {
        return { success: false, message: "ውድቅ የሚደረግ የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ አልተገኘም።" };
    }
    
    users[userIndex].passwordResetStatus = undefined;
    users[userIndex].statusUpdatedAt = new Date().toISOString();

    return { success: true, message: "የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ ውድቅ ተደርጓል።" };
}


// --- User Profile Actions ---

export async function updateUserProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    const parsedData = updateProfileSchema.safeParse(data);
    if (!parsedData.success) {
        return { success: false, message: 'የተሳሳተ መረጃ ቀርቧል።' };
    }

    const { name, email } = parsedData.data;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    // Check if another user already has the new email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId)) {
        return { success: false, message: "ይህ ኢሜይል አስቀድሞ በሌላ መለያ ጥቅም ላይ ውሏል።" };
    }

    users[userIndex].name = name;
    users[userIndex].email = email;

    const { password, ...updatedUser } = users[userIndex];
    return { success: true, message: "መረጃዎ በተሳካ ሁኔታ ተቀይሯል።", user: updatedUser };
}


export async function changeUserPassword(userId: string, data: z.infer<typeof changePasswordSchema>) {
    const parsedData = changePasswordSchema.safeParse(data);
    if (!parsedData.success) {
        const issues = parsedData.error.flatten().fieldErrors;
        const message = Object.values(issues).flat().join(' ');
        return { success: false, message: message || "የተሳሳተ መረጃ ቀርቧል።" };
    }

    const { oldPassword, newPassword } = parsedData.data;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    if (users[userIndex].password !== oldPassword) {
        return { success: false, message: "የድሮ የይለፍ ቃልዎ ትክክል አይደለም።" };
    }

    users[userIndex].password = newPassword;

    return { success: true, message: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል።" };
}


// --- Submission Actions ---

// Helper function to generate a unique tracking ID
function generateTrackingId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `TRX-${year}-${month}${day}-${randomPart}`;
}

export async function getSubmissions(): Promise<Submission[]> {
    // Sort submissions by date, newest first
    return [...submissions].sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

// Used internally or by logged-in users who already have rights
export async function getSubmissionById(id: string): Promise<{ success: boolean; submission?: Submission; message?: string }> {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        return { success: false, message: "የመከታተያ መታወቂያ ያስፈልጋል።" };
    }
    const submission = submissions.find(s => s.id.toLowerCase() === id.toLowerCase());

    if (submission) {
            // Ensure old submissions have the new objectives structure for form compatibility
        if (!submission.objectives && submission.objective) {
            submission.objectives = [{
                objective: submission.objective,
                objectiveWeight: submission.objectiveWeight || "0",
                strategicActions: [{
                    action: submission.strategicAction || "",
                    weight: submission.strategicActionWeight || "0"
                }]
            }];
        }
        return { success: true, submission };
    } else {
        return { success: false, message: "በዚህ መታወቂያ ምንም ማመልከቻ አልተገኘም።" };
    }
}

const trackSubmissionSchema = z.object({
    trackingId: z.string().min(1, 'የመከታተያ መታወቂያ ያስፈልጋል።'),
    userName: z.string().min(1, 'ሙሉ ስም ያስፈልጋል።'),
});

export async function trackSubmission(data: z.infer<typeof trackSubmissionSchema>) {
    const parsedData = trackSubmissionSchema.safeParse(data);
    if (!parsedData.success) {
        return { success: false, message: "የመከታተያ መታወቂያ እና ሙሉ ስም ያስፈልጋል።" };
    }

    const { trackingId, userName } = parsedData.data;

    const submission = submissions.find(s => 
        s.id.toLowerCase() === trackingId.toLowerCase() && 
        s.userName.trim().toLowerCase() === userName.trim().toLowerCase()
    );

    if (submission) {
            // Ensure old submissions have the new objectives structure for form compatibility
        if (!submission.objectives && submission.objective) {
            submission.objectives = [{
                objective: submission.objective,
                objectiveWeight: submission.objectiveWeight || "0",
                strategicActions: [{
                    action: submission.strategicAction || "",
                    weight: submission.strategicActionWeight || "0"
                }]
            }];
        }
        return { success: true, submission };
    } else {
        return { success: false, message: "በዚህ መታወቂያ እና ስም ምንም ማመልከቻ አልተገኘም። እባክዎ መረጃዎን ያረጋግጡ።" };
    }
}

export async function addSubmission(data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);

    if (!parsedData.success) {
        const errorPath = parsedData.error.issues[0]?.path.join('.');
        const errorMessage = parsedData.error.issues[0]?.message;
        const finalMessage = errorPath ? `${errorPath}: ${errorMessage}` : errorMessage;

        console.log("Validation Errors: ", parsedData.error.flatten());
        return { success: false, message: finalMessage || "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }
    
    const newId = generateTrackingId();
    const newSubmission: Submission = {
        id: newId,
        userId: 'user1', // Generic ID for public submissions
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        ...parsedData.data, // This now includes userName
    };
    
    submissions.push(newSubmission);
    return { success: true, submission: newSubmission, message: "ዕቅድ በተሳካ ሁኔታ ገብቷል!" };
}

export async function updateSubmission(id: string, data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);
     if (!parsedData.success) {
        const errorPath = parsedData.error.issues[0]?.path.join('.');
        const errorMessage = parsedData.error.issues[0]?.message;
        const finalMessage = errorPath ? `${errorPath}: ${errorMessage}` : errorMessage;
        
        console.log("Validation Errors: ", parsedData.error.flatten());
        return { success: false, message: finalMessage || "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }

    const submissionIndex = submissions.findIndex(s => s.id === id);

    if (submissionIndex === -1) {
        return { success: false, message: "ማመልከቻው አልተገኘም።" };
    }

    const updatedSubmission: Submission = {
        ...submissions[submissionIndex],
        ...parsedData.data,
        status: 'Pending' as SubmissionStatus,
        lastModifiedAt: new Date().toISOString(),
    };

    submissions[submissionIndex] = updatedSubmission;
    return { success: true, submission: updatedSubmission, message: "ዕቅድ በተሳካ ሁኔታ ተስተካክሏል!" };
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, comments?: string) {
    const submissionIndex = submissions.findIndex(s => s.id === id);

    if (submissionIndex === -1) {
        return { success: false, message: "ማመልከቻው አልተገኘም።" };
    }
    
    const statusUpdate: Partial<Submission> = {
        status,
        lastModifiedAt: new Date().toISOString(),
    };

    if (comments && comments.trim() !== '') {
        statusUpdate.comments = comments;
    }

    submissions[submissionIndex] = { ...submissions[submissionIndex], ...statusUpdate };
    const translatedStatus = statusTranslations[status] || status;
    return { success: true, message: `ሁኔታው ወደ '${translatedStatus}' ተቀይሯል` };
}

export async function deleteSubmission(id: string) {
    const initialLength = submissions.length;
    submissions = submissions.filter(s => s.id !== id);
    
    if (submissions.length === initialLength) {
            return { success: false, message: "ለመሰረዝ ማመልከቻ አልተገኘም።" };
    }

    return { success: true, message: "ማመልከቻው ተሰርዟል።" };
}
