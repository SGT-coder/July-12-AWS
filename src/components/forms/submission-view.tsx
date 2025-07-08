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
import { Separator } from "@/components/ui/separator";

interface SubmissionViewProps {
  submission: Submission;
  onBack: () => void;
}

const DescriptionListItem = ({ term, children }: { term: string, children: React.ReactNode }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-3">
    <dt className="font-medium text-muted-foreground">{term}</dt>
    <dd className="md:col-span-2">{children}</dd>
  </div>
);

export function SubmissionView({ submission, onBack }: SubmissionViewProps) {
  const totalBudget = submission.activities.reduce((acc, activity) => acc + activity.budget, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline text-3xl">{submission.projectTitle}</CardTitle>
              <CardDescription>Submitted by {submission.userName}</CardDescription>
            </div>
            <StatusBadge status={submission.status} className="text-base px-4 py-2" />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="divide-y">
            <DescriptionListItem term="Department">{submission.department}</DescriptionListItem>
            <DescriptionListItem term="Budget Year">{submission.budgetYear}</DescriptionListItem>
            <DescriptionListItem term="Submitted At"><DateDisplay dateString={submission.submittedAt} includeTime /></DescriptionListItem>
            <DescriptionListItem term="Last Modified"><DateDisplay dateString={submission.lastModifiedAt} includeTime /></DescriptionListItem>
            <DescriptionListItem term="Objective">{submission.objective}</DescriptionListItem>
            <DescriptionListItem term="Expected Outcome">{submission.expectedOutcome}</DescriptionListItem>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Activities</CardTitle>
          <CardDescription>Detailed breakdown of project activities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {submission.activities.map((activity, index) => (
            <div key={activity.id} className="p-4 border rounded-lg">
              <h4 className="font-bold text-lg">{index + 1}. {activity.name}</h4>
              <p className="text-muted-foreground mt-1">{activity.description}</p>
              <div className="flex justify-between items-center mt-3 text-sm">
                <span className="font-medium">Timeline: <span className="font-normal">{activity.timeline}</span></span>
                <span className="font-medium text-primary">Budget: <span className="font-normal">${activity.budget.toLocaleString()}</span></span>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="text-right">
            <p className="w-full text-xl font-bold">Total Budget: <span className="text-primary">${totalBudget.toLocaleString()}</span></p>
        </CardFooter>
      </Card>

      {submission.comments && (
        <Card className="bg-amber-50 border-amber-200">
           <CardHeader className="flex flex-row items-center gap-4">
            <MessageSquareWarning className="h-8 w-8 text-amber-600" />
            <div>
                <CardTitle className="font-headline text-amber-900">Approver Comments</CardTitle>
                <CardDescription className="text-amber-700">Feedback from the reviewer.</CardDescription>
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
