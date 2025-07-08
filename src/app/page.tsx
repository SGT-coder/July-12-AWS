"use client";

import * as React from "react";
import type { Role, Submission, SubmissionStatus, User } from "@/lib/types";
import { initialSubmissions, users } from "@/lib/data";
import { RoleSelector } from "@/components/auth/role-selector";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { SubmissionForm } from "@/components/forms/submission-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { AppHeader } from "@/components/shared/header";
import { useToast } from "@/hooks/use-toast";

type View =
  | { name: "ROLE_SELECTION" }
  | { name: "USER_DASHBOARD" }
  | { name: "APPROVER_DASHBOARD" }
  | { name: "SUBMISSION_FORM"; submissionId?: string }
  | { name: "SUBMISSION_VIEW"; submissionId: string };

export default function Home() {
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [view, setView] = React.useState<View>({ name: "ROLE_SELECTION" });
  const [submissions, setSubmissions] = React.useState<Submission[]>(initialSubmissions);
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
  
  const handleSaveSubmission = (data: Partial<Submission>) => {
    const isEditing = !!data.id;
    
    setSubmissions(prev => {
        if (isEditing) {
            return prev.map(s => s.id === data.id ? { ...s, ...data, lastModifiedAt: new Date().toISOString() } : s);
        } else {
            const newSubmission: Submission = {
                id: `sub${Date.now()}`,
                userId: currentUser!.id,
                userName: currentUser!.name,
                status: 'Pending',
                submittedAt: new Date().toISOString(),
                lastModifiedAt: new Date().toISOString(),
                ...data
            } as Submission;
            return [newSubmission, ...prev];
        }
    });

    toast({
      title: isEditing ? "Submission Updated" : "Submission Created",
      description: `Your submission "${data.projectTitle}" has been saved.`,
    });

    setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" });
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

  const renderContent = () => {
    switch (view.name) {
      case "ROLE_SELECTION":
        return <RoleSelector onSelectRole={handleSelectRole} />;
      case "USER_DASHBOARD":
        const userSubmissions = submissions.filter(s => s.userId === currentUser?.id);
        return (
          <UserDashboard
            submissions={userSubmissions}
            onCreateNew={() => setView({ name: "SUBMISSION_FORM" })}
            onView={(id) => setView({ name: "SUBMISSION_VIEW", submissionId: id })}
            onEdit={(id) => setView({ name: "SUBMISSION_FORM", submissionId: id })}
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
      case "SUBMISSION_FORM":
        const submissionToEdit = submissions.find(s => s.id === view.submissionId);
        return (
            <SubmissionForm
                submission={submissionToEdit}
                onSave={handleSaveSubmission}
                onCancel={() => setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" })}
                allSubmissions={submissions}
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
                onBack={() => setView({ name: currentUser?.role === "User" ? "USER_DASHBOARD" : "APPROVER_DASHBOARD" })}
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
