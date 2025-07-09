
"use client";

import * as React from "react";
import type { Role, Submission, SubmissionStatus, StrategicPlanFormValues } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { getSubmissions, addSubmission, updateSubmission, updateSubmissionStatus, deleteSubmission, loginUser, registerUser } from "@/app/actions";
import { AppHeader } from "@/components/shared/header";
import { RoleSelector } from "@/components/auth/role-selector";
import { ApproverLogin } from "@/components/auth/approver-login";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterForm } from "@/components/auth/register-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function Home() {
  const [role, setRole] = React.useState<Role>(null);
  const [view, setView] = React.useState<'role-selector' | 'dashboard' | 'form' | 'view-submission' | 'approver-login' | 'register' | 'reset-password'>('role-selector');
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = React.useState<string | null>(null);
  const [formKey, setFormKey] = React.useState(Date.now());
  const { toast } = useToast();

  React.useEffect(() => {
    if (view === 'dashboard') {
      fetchSubmissions();
    } else if (view === 'role-selector') {
        setIsLoading(false);
    } else {
        // For other views like form, login, etc., we don't need to load all submissions initially.
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
      if (selectedRole === 'User') {
        setRole('User');
        setView('form');
        setCurrentSubmissionId(null);
      } else if (selectedRole === 'Approver') {
        setView('approver-login');
      }
    }
  };

  const handleApproverLogin = async (email: string, password: string): Promise<boolean> => {
    const result = await loginUser({ email, password });
    if (result.success) {
        setRole('Approver');
        setView('dashboard');
        toast({ title: "Login Successful", description: "Welcome, Approver!" });
        return true;
    } else {
        toast({ title: "Login Failed", description: result.message, variant: "destructive" });
        return false;
    }
  }

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
      if (view === 'form' && role === 'User') {
        handleLogout();
      } else if (view === 'approver-login' || view === 'register' || view === 'reset-password') {
        handleLogout();
      }
      else {
        setView('dashboard');
        setCurrentSubmissionId(null);
      }
  };

  const handleBackToLogin = () => {
      setView('approver-login');
  }

  const handleSaveSubmission = async (data: StrategicPlanFormValues, id?: string) => {
    setIsSubmitting(true);
    const result = id ? await updateSubmission(id, data) : await addSubmission(data);
    
    if (result.success) {
      toast({
        title: id ? "ዕቅድ ተስተካክሏል" : "ዕቅድ ገብቷል",
        description: `"${data.projectTitle}" ${id ? 'የተሰኘው እቅድዎ ተስተካክሎ እንደገና ለግምገማ ተልኳል።' : 'የተሰኘው እቅድዎ ለግምገማ ተልኳል።'}`,
      });
      
      if (role === 'User') {
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

  // --- Placeholder Auth Functions ---
  const handleRegister = async (data: any): Promise<boolean> => {
    const result = await registerUser(data);
    if (result.success) {
      toast({ title: "Registration Submitted", description: result.message });
      setView('approver-login');
      return true;
    } else {
      toast({ title: "Registration Failed", description: result.message, variant: "destructive" });
      return false;
    }
  };

  const handleResetPassword = async (name: string, email: string) => {
      toast({ title: "Password Reset Requested", description: `If an account exists for ${email}, a reset link would be sent.` });
      setView('approver-login');
  };
  // ------------------------------------


  const currentSubmission = submissions.find(s => s.id === currentSubmissionId);

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

      case 'approver-login':
        return <ApproverLogin onLogin={handleApproverLogin} onBack={handleBack} onGoToRegister={() => setView('register')} onGoToReset={() => setView('reset-password')} />;

      case 'register':
        return <RegisterForm onRegister={handleRegister} onBack={handleBackToLogin} />;
      
      case 'reset-password':
        return <ResetPasswordForm onReset={handleResetPassword} onBack={handleBackToLogin} />;

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
