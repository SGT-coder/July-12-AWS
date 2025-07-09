
'use server';

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';
import { strategicPlanSchema, type StrategicPlanFormValues } from '@/lib/schemas';
import type { Submission, SubmissionStatus, User } from '@/lib/types';

// Path to the local JSON database file
const dbPath = path.join(process.cwd(), 'db.json');

// Define the shape of the database
interface Db {
    submissions: Submission[];
    users: User[];
}

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
});

export async function loginUser(credentials: z.infer<typeof loginSchema>) {
    const parsedCredentials = loginSchema.safeParse(credentials);
    if (!parsedCredentials.success) {
        return { success: false, message: 'Invalid credentials provided.' };
    }

    const { email, password } = parsedCredentials.data;
    const db = await readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === 'Approver');

    if (!user) {
        return { success: false, message: 'No approver account found with this email.' };
    }

    // In a real app, you would hash and compare passwords.
    // For this project, we are using plaintext passwords for simplicity.
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password.' };
    }
    
    // Don't send password back to the client
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
}

const registerSchema = z.object({
    fullName: z.string().min(2, 'Full name is required.'),
    email: z.string().email('Invalid email address.'),
    password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function registerUser(data: z.infer<typeof registerSchema>) {
    const parsedData = registerSchema.safeParse(data);
    if (!parsedData.success) {
        const issues = parsedData.error.flatten().fieldErrors;
        const message = Object.values(issues).flat().join(' ');
        return { success: false, message: message || "Invalid data provided." };
    }
    
    const { fullName, email, password } = parsedData.data;
    const db = await readDb();

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: User = {
        id: randomUUID(),
        name: fullName,
        email,
        password, // Storing plaintext password for simplicity in this project
        role: 'Approver',
    };

    db.users.push(newUser);
    await writeDb(db);

    return { success: true, message: 'Registration successful! You can now log in.' };
}


// --- Submission Actions ---

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

    // For public user submissions, we can assign a default user
    const user = { id: 'user1', name: "Public User" };
    
    const newId = randomUUID();
    const newSubmission: Submission = {
        id: newId,
        userId: user.id,
        userName: user.name,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        ...parsedData.data,
    };
    
    try {
        const db = await readDb();
        db.submissions.push(newSubmission);
        await writeDb(db);
        return { success: true, submission: newSubmission, message: "ዕቅድ በተሳካ ሁኔታ ገብቷል!" };
    } catch (error) {
        console.error("Error adding submission: ", error);
        return { success: false, message: "An error occurred while saving the submission." };
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
            return { success: false, message: "Submission not found." };
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
        return { success: false, message: "An error occurred while updating the submission." };
    }
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, comments?: string) {
    try {
        const db = await readDb();
        const submissionIndex = db.submissions.findIndex(s => s.id === id);

        if (submissionIndex === -1) {
            return { success: false, message: "Submission not found." };
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
        return { success: true, message: `Status updated to ${status}` };

    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, message: "An error occurred while updating the status." };
    }
}

export async function deleteSubmission(id: string) {
    try {
        const db = await readDb();
        const initialLength = db.submissions.length;
        db.submissions = db.submissions.filter(s => s.id !== id);
        
        if (db.submissions.length === initialLength) {
             return { success: false, message: "Submission not found to delete." };
        }

        await writeDb(db);
        return { success: true, message: "Submission deleted." };
    } catch (error) {
        console.error("Error deleting submission: ", error);
        return { success: false, message: "An error occurred while deleting the submission." };
    }
}
