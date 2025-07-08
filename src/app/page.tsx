"use client";

import * as React from "react";
import type { StrategicPlanFormValues } from "@/lib/types";
import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";
import { useToast } from "@/hooks/use-toast";
import { addSubmission } from "@/app/actions";
import { TestTube2 } from "lucide-react";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  // A key to reset the form after successful submission
  const [formKey, setFormKey] = React.useState(Date.now());

  const handleSaveSubmission = async (data: StrategicPlanFormValues) => {
    setIsSubmitting(true);
    
    const result = await addSubmission(data);

    if (result.success) {
        toast({
          title: "ዕቅድ ገብቷል",
          description: `"${data.projectTitle}" የተሰኘው እቅድዎ ለግምገማ ተልኳል።`,
        });
        // Reset the form by changing its key
        setFormKey(Date.now());
    } else {
        toast({
            title: "በማስገባት ላይ ስህተት",
            description: result.message,
            variant: "destructive"
        });
    }

    setIsSubmitting(false);
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <header className="bg-card/80 border-b backdrop-blur-sm sticky top-0 z-20">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           <div className="flex items-center justify-between h-16">
             <div className="flex items-center space-x-3">
                <TestTube2 className="h-7 w-7 text-primary" />
               <h1 className="font-headline text-2xl font-bold text-primary">
                 AHRI Workflow
               </h1>
             </div>
           </div>
         </div>
       </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-500">
          <StrategicPlanForm
              key={formKey}
              onSave={handleSaveSubmission}
              isSubmitting={isSubmitting}
          />
        </div>
      </main>
    </div>
  );
}
