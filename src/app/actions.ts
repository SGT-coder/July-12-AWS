'use server'

import { strategicPlanSchema, type StrategicPlanFormValues } from '@/lib/schemas';

export async function submitStrategicPlan(data: StrategicPlanFormValues) {
    const parsedData = strategicPlanSchema.safeParse(data);

    if (!parsedData.success) {
        console.error("Server validation failed", parsedData.error.flatten());
        return { success: false, message: "የገባው መረጃ ትክክል አይደለም።", errors: parsedData.error.flatten() };
    }

    console.log("New Strategic Plan Submitted:", parsedData.data);

    // In a real application, you would save this data to a database.
    // For example: await db.strategicPlan.create({ data: parsedData.data });

    return { success: true, message: "ዕቅድ በተሳካ ሁኔታ ገብቷል!" };
}
