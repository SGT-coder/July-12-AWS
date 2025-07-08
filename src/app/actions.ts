'use server';

import { randomUUID } from 'crypto';
import { initialSubmissions } from '@/lib/data';
import { users } from '@/lib/data';
import { strategicPlanSchema, type StrategicPlanFormValues } from '@/lib/schemas';
import type { Submission, SubmissionStatus } from '@/lib/types';


// --- In-memory database for development ---
// This creates a global variable to store submissions, making the data
// persist across Next.js hot reloads. This is for demonstration purposes
// and would be replaced by a real database (like PostgreSQL, MongoDB, or Firebase)
// in a production application.
declare global {
  var submissions: Submission[];
}

if (!global.submissions) {
  global.submissions = [...initialSubmissions];
}

const submissions = global.submissions;
// --- End of in-memory database ---


export async function getSubmissions(): Promise<Submission[]> {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 300));
    return submissions;
}

export async function addSubmission(data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }

    // Since we don't have login, we'll assign a default user for submissions made through the 'User' role.
    const user = users.find(u => u.id === 'user1');
    if (!user) {
        return { success: false, message: "Default user not found." };
    }
    
    const newSubmission: Submission = {
        id: randomUUID(),
        userId: user.id,
        userName: user.name,
        status: 'Pending',
        submittedAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        ...parsedData.data,
    };
    
    submissions.unshift(newSubmission);
    
    return { success: true, submission: newSubmission, message: "ዕቅድ በተሳካ ሁኔታ ገብቷል!" };
}

export async function updateSubmission(id: string, data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);
     if (!parsedData.success) {
        return { success: false, message: "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }

    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) {
        return { success: false, message: "Submission not found." };
    }
    
    const updatedSubmission = {
        ...submissions[index],
        ...parsedData.data,
        status: 'Pending' as SubmissionStatus, // Reset status on edit
        lastModifiedAt: new Date().toISOString(),
    };
    submissions[index] = updatedSubmission;

    return { success: true, submission: updatedSubmission, message: "ዕቅድ በተሳካ ሁኔታ ተስተካክሏል!" };
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, comments?: string) {
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) {
        return { success: false, message: "Submission not found." };
    }
    
    submissions[index] = {
        ...submissions[index],
        status,
        comments: comments && comments.trim() !== '' ? comments : submissions[index].comments,
        lastModifiedAt: new Date().toISOString(),
    };
    
    return { success: true, message: `Status updated to ${status}` };
}

export async function deleteSubmission(id: string) {
    const index = submissions.findIndex(s => s.id === id);
    if (index === -1) {
         return { success: false, message: "Submission not found." };
    }
    
    submissions.splice(index, 1);
    
    return { success: true, message: "Submission deleted." };
}
