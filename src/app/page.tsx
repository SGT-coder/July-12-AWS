"use client";

import { useState, useEffect, useMemo } from "react";
import type { User, Submission, Role, SubmissionStatus } from "@/lib/types";
import { AppHeader } from "@/components/shared/header";
import { RoleSelector } from "@/components/auth/role-selector";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { SubmissionForm } from "@/components/forms/submission-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { initialSubmissions, users } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

type View =
  | { type: "DASHBOARD" }
  | { type: "NEW_FORM" }
  | { type: "EDIT_FORM"; submissionId: string }
  | { type: "VIEW_SUBMISSION"; submissionId: string };

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [view, setView] = useState<View>({ type: "DASHBOARD" });
  const { toast } = useToast();

  useEffect(() => {
    setSubmissions(initialSubmissions);
    const savedRole = sessionStorage.getItem("ahri-role") as Role;
    if (savedRole) {
      handleLogin(savedRole, true);
    }
  }, []);

  const handleLogin = (role: Role, silent = false) => {
    const user = users.find((u) => u.role === role);
    setCurrentUser(user || null);
    setView({ type: "DASHBOARD" });
    if (role) {
      sessionStorage.setItem("ahri-role", role);
      if (!silent) {
        toast({
          title: `Logged in as ${role}`,
          description: `Welcome, ${user?.name}!`,
        });
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView({ type: "DASHBOARD" });
    sessionStorage.removeItem("ahri-role");
    toast({ title: "Logged out", description: "You have successfully logged out." });
  };

  const handleSaveSubmission = (data: Partial<Submission>) => {
    if (data.id) {
      // Update existing
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === data.id
            ? { ...s, ...data, lastModifiedAt: new Date().toISOString() }
            : s
        )
      );
      toast({ title: "Submission Updated", description: "Your changes have been saved." });
    } else {
      // Create new
      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        userId: currentUser!.id,
        userName: currentUser!.name,
        status: "Pending",
        submittedAt: new Date().toISOString(),
        lastModifiedAt: new Date().toISOString(),
        ...data,
      } as Submission;
      setSubmissions((prev) => [newSubmission, ...prev]);
      toast({ title: "Submission Saved", description: "Your form has been submitted for approval." });
    }
    setView({ type: "DASHBOARD" });
  };
  
  const handleUpdateStatus = (
    submissionId: string,
    status: SubmissionStatus,
    comments?: string
  ) => {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? { ...s, status, comments, lastModifiedAt: new Date().toISOString() }
          : s
      )
    );
    toast({
      title: `Submission ${status}`,
      description: `The submission has been marked as ${status.toLowerCase()}.`,
    });
  };

  const handleDelete = (submissionId: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    toast({
      title: "Submission Deleted",
      variant: "destructive",
    });
  }
  
  const userSubmissions = useMemo(() => {
    if (currentUser?.role === 'User') {
      return submissions.filter(s => s.userId === currentUser.id);
    }
    return [];
  }, [currentUser, submissions]);

  const renderContent = () => {
    if (!currentUser) {
      return <RoleSelector onSelectRole={handleLogin} />;
    }

    const selectedSubmission = (view.type === "VIEW_SUBMISSION" || view.type === "EDIT_FORM") 
      ? submissions.find((s) => s.id === view.submissionId)
      : null;

    switch (view.type) {
      case "NEW_FORM":
        return <SubmissionForm onSave={handleSaveSubmission} onCancel={() => setView({type: 'DASHBOARD'})} allSubmissions={submissions} />;
      case "EDIT_FORM":
         return selectedSubmission ? <SubmissionForm submission={selectedSubmission} onSave={handleSaveSubmission} onCancel={() => setView({type: 'DASHBOARD'})} allSubmissions={submissions} /> : null;
      case "VIEW_SUBMISSION":
        return selectedSubmission ? <SubmissionView submission={selectedSubmission} onBack={() => setView({type: 'DASHBOARD'})} /> : null;
      case "DASHBOARD":
      default:
        if (currentUser.role === "User") {
          return (
            <UserDashboard
              submissions={userSubmissions}
              onCreateNew={() => setView({ type: "NEW_FORM" })}
              onView={(id) => setView({ type: "VIEW_SUBMISSION", submissionId: id })}
              onEdit={(id) => setView({ type: "EDIT_FORM", submissionId: id })}
            />
          );
        }
        if (currentUser.role === "Approver") {
          return (
            <ApproverDashboard
              submissions={submissions}
              onView={(id) => setView({ type: "VIEW_SUBMISSION", submissionId: id })}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          );
        }
        return null;
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
