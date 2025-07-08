"use client";

import type { Submission } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquareWarning } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateDisplay } from "@/components/shared/date-display";

interface SubmissionViewProps {
  submission: Submission;
  onBack: () => void;
}

const DescriptionListItem = ({ term, children }: { term: string, children: React.ReactNode }) => (
    !children || children === '' ? null :
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-3">
      <dt className="font-medium text-muted-foreground">{term}</dt>
      <dd className="md:col-span-2">{children}</dd>
    </div>
);

export function SubmissionView({ submission, onBack }: SubmissionViewProps) {
  const totalBudget = [
    submission.governmentBudgetAmount,
    submission.grantBudgetAmount,
    submission.sdgBudgetAmount
  ].reduce((acc, amount) => acc + (Number(amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        ወደ ዳሽቦርድ ተመለስ
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">{submission.projectTitle}</CardTitle>
              <CardDescription>ያስገባው: {submission.userName}</CardDescription>
            </div>
            <StatusBadge status={submission.status} className="text-base px-4 py-2" />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <DescriptionListItem term="ዲፓርትመንት">{submission.department}</DescriptionListItem>
            <DescriptionListItem term="ግብ">{submission.goal}</DescriptionListItem>
            <DescriptionListItem term="ዓላማ">{submission.objective}</DescriptionListItem>
            <DescriptionListItem term="የገባበት ቀን"><DateDisplay dateString={submission.submittedAt} includeTime /></DescriptionListItem>
            <DescriptionListItem term="ለመጨረሻ ጊዜ የተሻሻለው"><DateDisplay dateString={submission.lastModifiedAt} includeTime /></DescriptionListItem>
          </dl>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle className="font-headline">ዝርዝር ዕቅድ</CardTitle></CardHeader>
            <CardContent>
                <dl className="divide-y">
                    <DescriptionListItem term="ስትራቴጂክ እርምጃ">{submission.strategicAction}</DescriptionListItem>
                    <DescriptionListItem term="መለኪያ">{submission.metric}</DescriptionListItem>
                    <DescriptionListItem term="ዋና ተግባር">{submission.mainTask}</DescriptionListItem>
                    <DescriptionListItem term="የዋና ተግባር ዒላማ">{submission.mainTaskTarget}</DescriptionListItem>
                </dl>
            </CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle className="font-headline">ክብደቶች</CardTitle></CardHeader>
            <CardContent>
                <dl className="divide-y">
                    <DescriptionListItem term="ዓላማ ክብደት">{submission.objectiveWeight}</DescriptionListItem>
                    <DescriptionListItem term="ስትራቴጂክ እርምጃ ክብደት">{submission.strategicActionWeight}</DescriptionListItem>
                    <DescriptionListItem term="የመለኪያ ክብደት">{submission.metricWeight}</DescriptionListItem>
                    <DescriptionListItem term="የዋና ተግባር ክብደት">{submission.mainTaskWeight}</DescriptionListItem>
                </dl>
            </CardContent>
        </Card>
      </div>

       <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">አፈጻጸም እና በጀት</CardTitle>
        </CardHeader>
        <CardContent>
            <dl className="divide-y">
                <DescriptionListItem term="ፈጻሚ አካል">{submission.executingBody}</DescriptionListItem>
                <DescriptionListItem term="የሚከናወንበት ጊዜ">{submission.executionTime}</DescriptionListItem>
                <DescriptionListItem term="በጀት ምንጭ">{submission.budgetSource}</DescriptionListItem>
                <DescriptionListItem term="ከመንግስት በጀት በብር">{submission.governmentBudgetAmount}</DescriptionListItem>
                <DescriptionListItem term="ከመንግስት በጀት ኮድ">{submission.governmentBudgetCode}</DescriptionListItem>
                <DescriptionListItem term="ከግራንት በጀት በብር">{submission.grantBudgetAmount}</DescriptionListItem>
                <DescriptionListItem term="ከኢስ ዲ ጂ በጀት በብር">{submission.sdgBudgetAmount}</DescriptionListItem>
            </dl>
        </CardContent>
        <CardFooter className="text-right">
            <p className="w-full text-xl font-bold">ጠቅላላ በጀት: <span className="text-primary">{totalBudget.toLocaleString()} ብር</span></p>
        </CardFooter>
      </Card>

      {submission.comments && (
        <Card className="bg-amber-50 border-amber-200">
           <CardHeader className="flex flex-row items-center gap-4">
            <MessageSquareWarning className="h-8 w-8 text-amber-600" />
            <div>
                <CardTitle className="font-headline text-amber-900">የአጽዳቂው አስተያየት</CardTitle>
                <CardDescription className="text-amber-700">ከገምጋሚው የተሰጠ አስተያየት።</CardDescription>
            </div>
           </CardHeader>
           <CardContent>
              <p className="text-amber-800">{submission.comments}</p>
           </CardContent>
        </Card>
      )}

    </div>
  );
}
