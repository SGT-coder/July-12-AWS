"use client";

import * as React from "react";
import type { Role, Submission, StrategicPlanFormValues } from "@/lib/types";
import { initialSubmissions, users } from "@/lib/data";
import { RoleSelector } from "@/components/auth/role-selector";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { AppHeader } from "@/components/shared/header";
import { useToast } from "@/hooks/use-toast";
import { SubmissionStatus } from "@/lib/types";

type View =
  | { name: "ROLE_SELECTION" }
  | { name: "USER_DASHBOARD" }
  | { name: "APPROVER_DASHBOARD" }
  | { name: "STRATEGIC_PLAN_FORM"; submissionId?: string }
  | { name: "SUBMISSION_VIEW"; submissionId: string };

export default function Home() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [view, setView] = React.useState<View>({ name: "ROLE_SELECTION" });
  const [submissions, setSubmissions] = React.useState<Submission[]>(initialSubmissions);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

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
  
  const handleSaveSubmission = (data: StrategicPlanFormValues, id?: string) => {
    setIsSubmitting(true);
    const isEditing = !!id;
    
    // Simulate server delay
    setTimeout(() => {
        setSubmissions(prev => {
            if (isEditing) {
                return prev.map(s => s.id === id ? { ...s, ...data, lastModifiedAt: new Date().toISOString(), status: 'Pending' } : s);
            } else {
                const newSubmission: Submission = {
                    id: `sub${Date.now()}`,
                    userId: currentUser!.id,
                    userName: currentUser!.name,
                    status: 'Pending',
                    submittedAt: new Date().toISOString(),
                    lastModifiedAt: new Date().toISOString(),
                    ...data
                };
                return [newSubmission, ...prev];
            }
        });

        toast({
          title: isEditing ? "ዕቅድ ተስተካክሏል" : "ዕቅድ ገብቷል",
          description: `"${data.projectTitle}" የተሰኘው እቅድዎ ተቀምጧል።`,
        });

        setIsSubmitting(false);
        setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" });
    }, 1000);
  };

  const handleDeleteSubmission = (id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
    toast({
        title: "Submission Deleted",
        description: "The submission has been permanently removed.",
        variant: "destructive"
    });
  }

  const handleUpdateStatus = (id: string, status: SubmissionStatus, comments?: string) => {
    setSubmissions(prev => prev.map(s => s.id === id ? { ...s, status, comments, lastModifiedAt: new Date().toISOString() } : s));
    toast({
      title: `Submission ${status}`,
      description: `The submission has been marked as ${status}.`,
    });
  }
  
  const handleBackToDashboard = () => {
      setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" });
  }

  const renderContent = () => {
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
