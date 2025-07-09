
"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { strategicPlanSchema, type StrategicPlanFormValues } from "@/lib/schemas";
import {
    goalOptions,
    objectiveOptions,
    executionTimeOptions,
    executingBodyOptions,
    departmentOptions,
    budgetSourceOptions,
    govBudgetCodeOptions,
} from "@/lib/options";
import type { Submission } from "@/lib/types";

const defaultFormValues: StrategicPlanFormValues = {
    userName: "",
    projectTitle: "",
    department: "",
    goal: "",
    objective: "",
    strategicAction: "",
    metric: "",
    mainTask: "",
    mainTaskTarget: "",
    objectiveWeight: "",
    strategicActionWeight: "",
    metricWeight: "",
    mainTaskWeight: "",
    executingBody: "",
    executionTime: "",
    budgetSource: "",
    governmentBudgetAmount: "",
    governmentBudgetCode: "",
    grantBudgetAmount: "",
    sdgBudgetAmount: "",
};

interface StrategicPlanFormProps {
    submission?: Submission | null;
    onSave: (data: StrategicPlanFormValues, id?: string) => void;
    isSubmitting: boolean;
}

export function StrategicPlanForm({ submission, onSave, isSubmitting }: StrategicPlanFormProps) {
  const form = useForm<StrategicPlanFormValues>({
    resolver: zodResolver(strategicPlanSchema),
    defaultValues: submission ? {
        ...defaultFormValues,
        ...submission,
    } : defaultFormValues,
  });

  useEffect(() => {
    if (submission) {
      form.reset({
        ...defaultFormValues,
        ...submission,
      });
    } else {
      form.reset(defaultFormValues);
    }
  }, [submission, form]);

  const budgetSource = form.watch("budgetSource");

  function onSubmit(data: StrategicPlanFormValues) {
    onSave(data, submission?.id);
  }
  
  const handleReset = () => {
    form.reset(defaultFormValues);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-bold text-center font-headline">{submission ? "ዕቅድ አርትዕ" : "ስትራቴጂ ጉዳዮች ዕቅድ ማስገቢያ ቅጽ"}</CardTitle>
                <CardDescription className="text-center text-lg">
                {submission ? 'ለውጦችዎን ያስገቡ እና ለድጋሚ ግምገማ ያስገቡ።' : 'ለግምገማ አዲስ ስልታዊ ዕቅድ ለማስገባት እባክዎ ከታች ያሉትን መስኮች ይሙሉ'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                
                <Card>
                    <CardHeader><CardTitle className="text-xl">አጠቃላይ መረጃ</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="userName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>የአስገባው ሙሉ ስም</FormLabel>
                                <FormControl><Input placeholder="ሙሉ ስምዎን ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="projectTitle" render={({ field }) => (
                            <FormItem>
                                <FormLabel>የእቅድ ርዕስ</FormLabel>
                                <FormControl><Input placeholder="የዕቅዱን ርዕስ ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="department" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ዲፓርትመንት</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="ዲፓርትመንት ይምረጡ" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {departmentOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="goal" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ግብ</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="ግብ ይምረጡ" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {goalOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="objective" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ዓላማ</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="ዓላማ ይምረጡ" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {objectiveOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-xl">ዝርዝር ዕቅድ</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="strategicAction" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ስትራቴጂክ እርምጃ</FormLabel>
                                <FormControl><Input placeholder="ስትራቴጂክ እርምጃ ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="metric" render={({ field }) => (
                            <FormItem>
                                <FormLabel>መለኪያ</FormLabel>
                                <FormControl><Input placeholder="መለኪያ ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="mainTask" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ዋና ተግባር</FormLabel>
                                <FormControl><Input placeholder="ዋና ተግባር ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="mainTaskTarget" render={({ field }) => (
                            <FormItem>
                                <FormLabel>የዋና ተግባር ዒላማ</FormLabel>
                                <FormControl><Input placeholder="የዋና ተግባር ዒላማ ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">ክብደቶች</CardTitle>
                        <CardDescription>እባክዎ የችግር መጠኑን በቁጥር ያስገቡ።</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FormField control={form.control} name="objectiveWeight" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ዓላማ ክብደት</FormLabel>
                                <FormControl><Input type="number" placeholder="የዓላማ ክብደት ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="strategicActionWeight" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ስትራቴጂክ እርምጃ ክብደት</FormLabel>
                                <FormControl><Input type="number" placeholder="የስትራቴጂክ እርምጃ ክብደት ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="metricWeight" render={({ field }) => (
                            <FormItem>
                                <FormLabel>የመለኪያ ክብደት</FormLabel>
                                <FormControl><Input type="number" placeholder="የመለኪያ ክብደት ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="mainTaskWeight" render={({ field }) => (
                            <FormItem>
                                <FormLabel>የዋና ተግባር ክብደት</FormLabel>
                               <FormControl><Input type="number" placeholder="የዋና ተግባር ክብደት ያስገቡ" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader><CardTitle className="text-xl">አፈጻጸም እና በጀት</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField control={form.control} name="executingBody" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ፈጻሚ አካል</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="ፈጻሚ አካል ይምረጡ" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {executingBodyOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="executionTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>የሚከናወንበት ጊዜ</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="የሚከናወንበትን ጊዜ ይምረጡ" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {executionTimeOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="budgetSource" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>በጀት ምንጭ</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="የበጀት ምንጭ ይምረጡ" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {budgetSourceOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        
                        {budgetSource && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                                {budgetSource === 'መንግስት' && (
                                    <>
                                        <FormField control={form.control} name="governmentBudgetAmount" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ከመንግስት በጀት በብር</FormLabel>
                                                <FormControl><Input type="number" placeholder="ብር" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="governmentBudgetCode" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ከመንግስት በጀት ኮድ</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="ኮድ ይምረጡ" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        {govBudgetCodeOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </>
                                )}
                                {budgetSource === 'ግራንት' && (
                                    <FormField control={form.control} name="grantBudgetAmount" render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>ከግራንት በጀት በብር</FormLabel>
                                            <FormControl><Input type="number" placeholder="ብር" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                                {budgetSource === 'ኢስዲጂ' && (
                                    <FormField control={form.control} name="sdgBudgetAmount" render={({ field }) => (
                                        <FormItem className="md:col-span-1">
                                            <FormLabel>ከኢስ ዲ ጂ በጀት በብር</FormLabel>
                                            <FormControl><Input type="number" placeholder="ብር" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

            </CardContent>
            <CardFooter className="flex justify-end gap-4 p-6">
                {!submission && <Button type="button" variant="ghost" onClick={handleReset} disabled={isSubmitting}>አጽዳ</Button>}
                <Button type="submit" disabled={isSubmitting} className="text-lg px-6 py-4">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (submission ? 'አርትዕ እና እንደገና አስገባ' : 'ዕቅድ አስገባ')}
                </Button>
            </CardFooter>
            </Card>
        </form>
        </Form>
    </div>
  );
}
