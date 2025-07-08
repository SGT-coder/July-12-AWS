"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, Trash2, Wand2, Loader2 } from "lucide-react";
import type { Submission } from "@/lib/types";
import { formAutocompletion } from "@/ai/flows/form-autocompletion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  projectTitle: z.string().min(5, "Project title must be at least 5 characters."),
  department: z.string().min(2, "Department is required."),
  budgetYear: z.number().min(2000),
  objective: z.string().min(10, "Objective must be at least 10 characters."),
  expectedOutcome: z.string().min(10, "Expected outcome must be at least 10 characters."),
  activities: z.array(
    z.object({
      name: z.string().min(3, "Activity name is required."),
      description: z.string().min(5, "Description is required."),
      timeline: z.string().min(1, "Timeline is required (e.g., Q1, Jan-Mar)."),
      budget: z.coerce.number().min(0, "Budget must be a positive number."),
    })
  ).min(1, "At least one activity is required."),
});

type SubmissionFormValues = z.infer<typeof formSchema>;

interface SubmissionFormProps {
  submission?: Submission;
  onSave: (data: Partial<Submission>) => void;
  onCancel: () => void;
  allSubmissions: Submission[];
}

export function SubmissionForm({ submission, onSave, onCancel, allSubmissions }: SubmissionFormProps) {
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const { toast } = useToast();

  const defaultValues: Partial<SubmissionFormValues> = submission ? {
    ...submission,
  } : {
    budgetYear: 2018,
    activities: [{ name: "", description: "", timeline: "", budget: 0 }],
  };
  
  const form = useForm<SubmissionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "activities",
  });

  const onSubmit = (data: SubmissionFormValues) => {
    onSave({ id: submission?.id, ...data });
  };
  
  const handleAutocomplete = async () => {
    setIsAutocompleting(true);
    try {
      const currentFormValues = form.getValues();
      const result = await formAutocompletion({
        currentFormValues,
        previousFormEntries: allSubmissions,
        fieldsToAutocomplete: ["department", "objective", "expectedOutcome"],
      });
      
      let updatedCount = 0;
      for (const [key, value] of Object.entries(result)) {
        if (value && key in currentFormValues) {
          form.setValue(key as keyof SubmissionFormValues, value, { shouldValidate: true });
          updatedCount++;
        }
      }

      if (updatedCount > 0) {
        toast({
          title: "AI Autocompletion successful!",
          description: `${updatedCount} field(s) have been pre-filled.`,
        });
      } else {
        toast({
          title: "AI Autocompletion",
          description: "No suggestions found based on your input.",
          variant: "default",
        });
      }

    } catch (error) {
      console.error("Autocomplete failed:", error);
      toast({
        title: "AI Autocompletion Failed",
        description: "Could not fetch AI suggestions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutocompleting(false);
    }
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="font-headline text-2xl">{submission ? "Edit" : "New"} Submission</CardTitle>
                <CardDescription>Fill in the details for your strategic planning form.</CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={handleAutocomplete} disabled={isAutocompleting}>
                {isAutocompleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                AI Autocomplete
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField control={form.control} name="projectTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl><Input placeholder="e.g., Research on Malaria Vaccines" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl><Input placeholder="e.g., Immunology" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
             <FormField control={form.control} name="objective" render={({ field }) => (
                <FormItem>
                  <FormLabel>Objective</FormLabel>
                  <FormControl><Textarea placeholder="Describe the main objective of this project" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="expectedOutcome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Outcome</FormLabel>
                  <FormControl><Textarea placeholder="What are the expected outcomes or deliverables?" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Activities</CardTitle>
            <CardDescription>Detail the activities involved in this project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                <h4 className="font-semibold">Activity {index + 1}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`activities.${index}.name`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Phase 1 Trials" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`activities.${index}.description`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl><Input placeholder="A brief description" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`activities.${index}.timeline`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeline</FormLabel>
                      <FormControl><Input placeholder="e.g., Q1-Q2" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name={`activities.${index}.budget`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget ($)</FormLabel>
                      <FormControl><Input type="number" placeholder="e.g., 50000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => append({ name: "", description: "", timeline: "", budget: 0 })}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Activity
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            <Button type="submit">{submission ? "Save Changes" : "Submit for Approval"}</Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
