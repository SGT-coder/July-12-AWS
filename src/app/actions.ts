
'use server';

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { strategicPlanSchema, type StrategicPlanFormValues, updateProfileSchema, changePasswordSchema, adminAddUserSchema, type AdminAddUserFormValues, resetPasswordSchema } from '@/lib/schemas';
import type { Submission, SubmissionStatus, User, UserStatus, Role } from '@/lib/types';

// Path to the local JSON database file
const dbPath = path.join(process.cwd(), 'db.json');

// Define the shape of the database
interface Db {
    submissions: Submission[];
    users: User[];
}

const statusTranslations: Record<UserStatus | SubmissionStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};

// Helper function to read the database file
async function readDb(): Promise<Db> {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        const dbContent = JSON.parse(data);
        // Ensure both submissions and users arrays exist
        return {
            submissions: dbContent.submissions || [],
            users: dbContent.users || [],
        };
    } catch (error) {
        // If the file doesn't exist or is empty, return an empty database structure
        if ((error as NodeJS.ErrnoException).code === 'ENOENT' || error instanceof SyntaxError) {
            return { submissions: [], users: [] };
        }
        console.error("Error reading database: ", error);
        throw error;
    }
}

// Helper function to write to the database file
async function writeDb(data: Db): Promise<void> {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to database: ", error);
        throw error;
    }
}


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
    const db = await readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

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
    return { success: true, user: userWithoutPassword };
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
    const db = await readDb();

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

    db.users.push(newUser);
    await writeDb(db);

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
    const db = await readDb();
    const userIndex = db.users.findIndex(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.name.trim().toLowerCase() === fullName.trim().toLowerCase()
    );

    if (userIndex === -1) {
        return { success: false, message: "በዚያ ስም እና የኢሜይል አድራሻ የተመዘገበ መለያ የለም።" };
    }
    
    const newPassword = Math.random().toString(36).substring(2, 10);
    db.users[userIndex].password = newPassword;
    db.users[userIndex].statusUpdatedAt = new Date().toISOString();
    
    await writeDb(db);

    return { success: true, newPassword, message: "አዲስ የይለፍ ቃል ተፈጥሯል።" };
}

// --- Admin Actions ---

export async function getUsers(): Promise<User[]> {
    const db = await readDb();
    // Return all users without their passwords
    return db.users.map(({ password, ...user }) => user);
}

export async function adminAddUser(data: AdminAddUserFormValues) {
    const parsedData = adminAddUserSchema.safeParse(data);
    if (!parsedData.success) {
        const issues = parsedData.error.flatten().fieldErrors;
        const message = Object.values(issues).flat().join(' ');
        return { success: false, message: message || "የተሳሳተ መረጃ ቀርቧል።" };
    }
    
    const { name, email, password, role } = parsedData.data;
    const db = await readDb();

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
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

    db.users.push(newUser);
    await writeDb(db);

    const { password: _, ...userWithoutPassword } = newUser;
    return { success: true, message: 'ተጠቃሚው በተሳካ ሁኔታ ተፈጥሯል።', user: userWithoutPassword };
}


export async function updateUserStatus(userId: string, status: UserStatus) {
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    db.users[userIndex].status = status;
    db.users[userIndex].statusUpdatedAt = new Date().toISOString();
    await writeDb(db);
    const translatedStatus = statusTranslations[status] || status;
    return { success: true, message: `የተጠቃሚው ሁኔታ ወደ '${translatedStatus}' ተቀይሯል።`};
}

export async function deleteUser(userId: string) {
    const db = await readDb();
    const initialLength = db.users.length;
    db.users = db.users.filter(u => u.id !== userId);

    if (db.users.length === initialLength) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    await writeDb(db);
    return { success: true, message: "ተጠቃሚው በተሳካ ሁኔታ ተሰርዟል።"};
}

// --- User Profile Actions ---

export async function updateUserProfile(userId: string, data: z.infer<typeof updateProfileSchema>) {
    const parsedData = updateProfileSchema.safeParse(data);
    if (!parsedData.success) {
        return { success: false, message: 'የተሳሳተ መረጃ ቀርቧል።' };
    }

    const { name, email } = parsedData.data;
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    // Check if another user already has the new email
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== userId)) {
        return { success: false, message: "ይህ ኢሜይል አስቀድሞ በሌላ መለያ ጥቅም ላይ ውሏል።" };
    }

    db.users[userIndex].name = name;
    db.users[userIndex].email = email;

    await writeDb(db);
    const { password, ...updatedUser } = db.users[userIndex];
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
    const db = await readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: "ተጠቃሚው አልተገኘም።" };
    }

    if (db.users[userIndex].password !== oldPassword) {
        return { success: false, message: "የድሮ የይለፍ ቃልዎ ትክክል አይደለም።" };
    }

    db.users[userIndex].password = newPassword;
    await writeDb(db);

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
    try {
        const db = await readDb();
        // Sort submissions by date, newest first
        return db.submissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } catch (error) {
        console.error("Error fetching submissions: ", error);
        return [];
    }
}

export async function addSubmission(data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
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
    
    try {
        const db = await readDb();
        db.submissions.push(newSubmission);
        await writeDb(db);
        return { success: true, submission: newSubmission, message: "ዕቅድ በተሳካ ሁኔታ ገብቷል!" };
    } catch (error) {
        console.error("Error adding submission: ", error);
        return { success: false, message: "ማመልከቻውን በማስቀመጥ ላይ ሳለ ስህተት ተፈጥሯል።" };
    }
}

export async function updateSubmission(id: string, data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);
     if (!parsedData.success) {
        return { success: false, message: "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }

    try {
        const db = await readDb();
        const submissionIndex = db.submissions.findIndex(s => s.id === id);

        if (submissionIndex === -1) {
            return { success: false, message: "ማመልከቻው አልተገኘም።" };
        }

        const updatedSubmission = {
            ...db.submissions[submissionIndex],
            ...parsedData.data,
            status: 'Pending' as SubmissionStatus,
            lastModifiedAt: new Date().toISOString(),
        };

        db.submissions[submissionIndex] = updatedSubmission;
        await writeDb(db);
        return { success: true, message: "ዕቅድ በተሳካ ሁኔታ ተስተካክሏል!" };
    } catch (error) {
        console.error("Error updating submission: ", error);
        return { success: false, message: "ማመልከቻውን በማዘመን ላይ ሳለ ስህተት ተፈጥሯል።" };
    }
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, comments?: string) {
    try {
        const db = await readDb();
        const submissionIndex = db.submissions.findIndex(s => s.id === id);

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

        db.submissions[submissionIndex] = { ...db.submissions[submissionIndex], ...statusUpdate };
        await writeDb(db);
        const translatedStatus = statusTranslations[status] || status;
        return { success: true, message: `ሁኔታው ወደ '${translatedStatus}' ተቀይሯል` };

    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, message: "ሁኔታውን በማዘመን ላይ ሳለ ስህተት ተፈጥሯል።" };
    }
}

export async function deleteSubmission(id: string) {
    try {
        const db = await readDb();
        const initialLength = db.submissions.length;
        db.submissions = db.submissions.filter(s => s.id !== id);
        
        if (db.submissions.length === initialLength) {
             return { success: false, message: "ለመሰረዝ ማመልከቻ አልተገኘም።" };
        }

        await writeDb(db);
        return { success: true, message: "ማመልከቻው ተሰርዟል።" };
    } catch (error) {
        console.error("Error deleting submission: ", error);
        return { success: false, message: "ማመልከቻውን በመሰረዝ ላይ ሳለ ስህተት ተፈጥሯል።" };
    }
}
