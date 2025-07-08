"use client";

import * as React from "react";
import type { Role, Submission, StrategicPlanFormValues } from "@/lib/types";
import { users } from "@/lib/data";
import { RoleSelector } from "@/components/auth/role-selector";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { AppHeader } from "@/components/shared/header";
import { useToast } from "@/hooks/use-toast";
import { SubmissionStatus } from "@/lib/types";
import { addSubmission, deleteSubmission, getSubmissions, updateSubmission, updateSubmissionStatus } from "@/app/actions";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type View =
  | { name: "ROLE_SELECTION" }
  | { name: "USER_DASHBOARD" }
  | { name: "APPROVER_DASHBOARD" }
  | { name: "STRATEGIC_PLAN_FORM"; submissionId?: string }
  | { name: "SUBMISSION_VIEW"; submissionId: string };

const DashboardSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </CardContent>
    </Card>
);


export default function Home() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [view, setView] = React.useState<View>({ name: "ROLE_SELECTION" });
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchSubmissions = React.useCallback(async () => {
    try {
        const fetchedSubmissions = await getSubmissions();
        setSubmissions(fetchedSubmissions);
    } catch (error) {
        toast({ title: "Error", description: "Failed to load submissions.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);


  const handleSelectRole = (role: Role) => {
    const user = users.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      if (role === "User") {
        setView({ name: "USER_DASHBOARD" });
      } else if (role === "Approver") {
        setView({ name: "APPROVER_DASHBOARD" });
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ name: "ROLE_SELECTION" });
  };
  
  const handleSaveSubmission = async (data: StrategicPlanFormValues, id?: string) => {
    if (!currentUser) return;
    setIsSubmitting(true);
    
    const result = id ? await updateSubmission(id, data) : await addSubmission(data, currentUser);

    if (result.success) {
        toast({
          title: id ? "ዕቅድ ተስተካክሏል" : "ዕቅድ ገብቷል",
          description: `"${data.projectTitle}" የተሰኘው እቅድዎ ተቀምጧል።`,
        });
        await fetchSubmissions();
        setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" });
    } else {
        toast({
            title: "Error Submitting",
            description: result.message,
            variant: "destructive"
        });
    }

    setIsSubmitting(false);
  };

  const handleDeleteSubmission = async (id: string) => {
    const result = await deleteSubmission(id);
    if (result.success) {
        toast({
            title: "Submission Deleted",
            description: "The submission has been permanently removed.",
            variant: "destructive"
        });
        await fetchSubmissions();
    } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  }

  const handleUpdateStatus = async (id: string, status: SubmissionStatus, comments?: string) => {
    const result = await updateSubmissionStatus(id, status, comments);
    if (result.success) {
        toast({
          title: `Submission ${status}`,
          description: `The submission has been marked as ${status}.`,
        });
        await fetchSubmissions();
    } else {
         toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  }
  
  const handleBackToDashboard = () => {
      setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" });
  }

  const renderContent = () => {
    if (isLoading && view.name !== 'ROLE_SELECTION') {
        return <DashboardSkeleton />;
    }

    switch (view.name) {
      case "ROLE_SELECTION":
        return <RoleSelector onSelectRole={handleSelectRole} />;
      case "USER_DASHBOARD":
        const userSubmissions = submissions.filter(s => s.userId === currentUser?.id);
        return (
          <UserDashboard
            submissions={userSubmissions}
            onCreateNew={() => setView({ name: "STRATEGIC_PLAN_FORM" })}
            onView={(id) => setView({ name: "SUBMISSION_VIEW", submissionId: id })}
            onEdit={(id) => setView({ name: "STRATEGIC_PLAN_FORM", submissionId: id })}
          />
        );
      case "APPROVER_DASHBOARD":
        return (
          <ApproverDashboard
            submissions={submissions}
            onView={(id) => setView({ name: "SUBMISSION_VIEW", submissionId: id })}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteSubmission}
          />
        );
      case "STRATEGIC_PLAN_FORM":
        const submissionToEdit = submissions.find(s => s.id === view.submissionId);
        return (
            <StrategicPlanForm
                submission={submissionToEdit}
                onSave={handleSaveSubmission}
                onCancel={handleBackToDashboard}
                isSubmitting={isSubmitting}
            />
        );
      case "SUBMISSION_VIEW":
        const submissionToView = submissions.find(s => s.id === view.submissionId);
        if (!submissionToView) {
            setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" });
            return null;
        }
        return (
            <SubmissionView
                submission={submissionToView}
                onBack={handleBackToDashboard}
            />
        );
      default:
        return <RoleSelector onSelectRole={handleSelectRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
       <AppHeader role={currentUser?.role ?? null} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-500">
           {renderContent()}
        </div>
      </main>
    </div>
  );
}
