
'use server';

import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { users } from '@/lib/data';
import { strategicPlanSchema, type StrategicPlanFormValues } from '@/lib/schemas';
import type { Submission, SubmissionStatus } from '@/lib/types';

// Path to the local JSON database file
const dbPath = path.join(process.cwd(), 'db.json');

// Helper function to read the database file
async function readDb(): Promise<{ submissions: Submission[] }> {
    try {
        const data = await fs.readFile(dbPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, return an empty database structure
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return { submissions: [] };
        }
        console.error("Error reading database: ", error);
        throw error;
    }
}

// Helper function to write to the database file
async function writeDb(data: { submissions: Submission[] }): Promise<void> {
    try {
        await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Error writing to database: ", error);
        throw error;
    }
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

    const user = users.find(u => u.id === 'user1');
    if (!user) {
        return { success: false, message: "Default user not found." };
    }
    
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
