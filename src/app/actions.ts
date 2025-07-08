'use server';

import { initialSubmissions } from '@/lib/data';
import { strategicPlanSchema, type StrategicPlanFormValues } from '@/lib/schemas';
import type { Submission, SubmissionStatus, User } from '@/lib/types';

// This is our in-memory "database".
// It's a mutable array that lives on the server and is initialized with some sample data.
// It will be reset if the server restarts.
let submissions: Submission[] = [...initialSubmissions];

export async function getSubmissions(): Promise<Submission[]> {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 300));
    return submissions;
}

export async function addSubmission(data: StrategicPlanFormValues, user: User) {
    const parsedData = strategicPlanSchema.safeParse(data);

    if (!parsedData.success) {
        return { success: false, message: "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }
    
    const newSubmission: Submission = {
        id: `sub${Date.now()}`,
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
    const initialLength = submissions.length;
    submissions = submissions.filter(s => s.id !== id);
    
    if (submissions.length === initialLength) {
         return { success: false, message: "Submission not found." };
    }
    
    return { success: true, message: "Submission deleted." };
}