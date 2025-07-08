'use server';

import { randomUUID } from 'crypto';
import { collection, doc, getDocs, query, setDoc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { users } from '@/lib/data';
import { strategicPlanSchema, type StrategicPlanFormValues } from '@/lib/schemas';
import type { Submission, SubmissionStatus } from '@/lib/types';


export async function getSubmissions(): Promise<Submission[]> {
    try {
        const submissionsCol = collection(db, 'submissions');
        const q = query(submissionsCol, orderBy('submittedAt', 'desc'));
        const submissionSnapshot = await getDocs(q);
        const submissionList = submissionSnapshot.docs.map(doc => doc.data() as Submission);
        return submissionList;
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
        await setDoc(doc(db, "submissions", newId), newSubmission);
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

    const submissionRef = doc(db, 'submissions', id);

    const updatedData = {
        ...parsedData.data,
        status: 'Pending' as SubmissionStatus,
        lastModifiedAt: new Date().toISOString(),
    };
    
    try {
        await updateDoc(submissionRef, updatedData);
        return { success: true, message: "ዕቅድ በተሳካ ሁኔታ ተስተካክሏል!" };
    } catch (error) {
        console.error("Error updating submission: ", error);
        return { success: false, message: "An error occurred while updating the submission." };
    }
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus, comments?: string) {
    const submissionRef = doc(db, 'submissions', id);
    
    const statusUpdate: Partial<Submission> = {
        status,
        lastModifiedAt: new Date().toISOString(),
    };

    if (comments && comments.trim() !== '') {
        statusUpdate.comments = comments;
    }

    try {
        await updateDoc(submissionRef, statusUpdate);
        return { success: true, message: `Status updated to ${status}` };
    } catch (error) {
        console.error("Error updating status: ", error);
        return { success: false, message: "An error occurred while updating the status." };
    }
}

export async function deleteSubmission(id: string) {
    try {
        await deleteDoc(doc(db, 'submissions', id));
        return { success: true, message: "Submission deleted." };
    } catch (error) {
        console.error("Error deleting submission: ", error);
        return { success: false, message: "An error occurred while deleting the submission." };
    }
}
