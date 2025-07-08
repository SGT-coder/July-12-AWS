"use client";

import * as React from "react";
import type { Role, Submission, SubmissionStatus, StrategicPlanFormValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getSubmissions, addSubmission, updateSubmission, updateSubmissionStatus, deleteSubmission } from "@/app/actions";
import { AppHeader } from "@/components/shared/header";
import { RoleSelector } from "@/components/auth/role-selector";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [role, setRole] = React.useState<Role>(null);
  const [view, setView] = React.useState<'role-selector' | 'dashboard' | 'form' | 'view-submission'>('role-selector');
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = React.useState<string | null>(null);
  const [formKey, setFormKey] = React.useState(Date.now());
  const { toast } = useToast();

  React.useEffect(() => {
    if (view !== 'role-selector') {
      fetchSubmissions();
    } else {
        setIsLoading(false);
    }
  }, [view]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const fetchedSubmissions = await getSubmissions();
    setSubmissions(fetchedSubmissions);
    setIsLoading(false);
  };

  const handleSelectRole = (selectedRole: Role) => {
    if (selectedRole) {
      setRole(selectedRole);
      if (selectedRole === 'User') {
        setView('form');
        setCurrentSubmissionId(null);
      } else {
        setView('dashboard');
      }
    }
  };

  const handleLogout = () => {
    setRole(null);
    setView('role-selector');
    setCurrentSubmissionId(null);
  };

  const handleCreateNew = () => {
    setCurrentSubmissionId(null);
    setView('form');
  };

  const handleEdit = (id: string) => {
    setCurrentSubmissionId(id);
    setView('form');
  };

  const handleView = (id: string) => {
    setCurrentSubmissionId(id);
    setView('view-submission');
  };
  
  const handleBack = () => {
      if (role === 'User') {
        // A user who cancels a form goes back to role selection
        handleLogout();
      } else {
        // An approver goes back to their dashboard
        setView('dashboard');
        setCurrentSubmissionId(null);
      }
  };

  const handleSaveSubmission = async (data: StrategicPlanFormValues, id?: string) => {
    setIsSubmitting(true);
    const result = id ? await updateSubmission(id, data) : await addSubmission(data);
    
    if (result.success) {
      toast({
        title: id ? "ዕቅድ ተስተካክሏል" : "ዕቅድ ገብቷል",
        description: `"${data.projectTitle}" ${id ? 'የተሰኘው እቅድዎ ተስተካክሎ እንደገና ለግምገማ ተልኳል።' : 'የተሰኘው እቅድዎ ለግምገማ ተልኳል።'}`,
      });
      
      if (role === 'User') {
        // For a public user, just reset the form for a new submission
        setFormKey(Date.now());
      } else {
        setView('dashboard');
        fetchSubmissions();
      }

    } else {
      toast({
        title: "ስህተት",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  const handleUpdateStatus = async (id: string, status: SubmissionStatus, comments?: string) => {
    const result = await updateSubmissionStatus(id, status, comments);
    if(result.success) {
      toast({ title: "Status Updated", description: result.message });
      fetchSubmissions();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deleteSubmission(id);
    if(result.success) {
      toast({ title: "Submission Deleted", description: result.message });
      fetchSubmissions();
    } else {
      toast({ title: "Error", description: result.message, variant: "destructive" });
    }
  };

  const currentSubmission = submissions.find(s => s.id === currentSubmissionId);
  const userSubmissions = submissions.filter(s => s.userId === 'user1'); // Simplified for now

  const renderContent = () => {
    if (isLoading && view !== 'role-selector') {
        return (
            <div className="space-y-4">
                <Skeleton className="h-16 w-1/2" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        )
    }

    switch(view) {
      case 'dashboard':
        // The 'User' role no longer has a dashboard
        if (role === 'Approver') {
          return <ApproverDashboard submissions={submissions} onView={handleView} onUpdateStatus={handleUpdateStatus} onDelete={handleDelete} />;
        }
        return null;
      
      case 'form':
        return <StrategicPlanForm key={formKey} submission={currentSubmission} onSave={handleSaveSubmission} onCancel={handleBack} isSubmitting={isSubmitting} />;

      case 'view-submission':
        if (currentSubmission) {
          return <SubmissionView submission={currentSubmission} onBack={handleBack} />;
        }
        return null;

      default:
        return <RoleSelector onSelectRole={handleSelectRole} />;
    }
  };
  
  if (view === 'role-selector') {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <RoleSelector onSelectRole={handleSelectRole} />
        </main>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader role={role} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-500">
            {renderContent()}
        </div>
      </main>
    </div>
  );
}
