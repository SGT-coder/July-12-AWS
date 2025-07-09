
"use client";

import * as React from "react";
import type { Role, Submission, SubmissionStatus, StrategicPlanFormValues, User, UserStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
    getSubmissions, addSubmission, updateSubmission, updateSubmissionStatus, deleteSubmission, 
    loginUser, registerUser, requestPasswordReset, getUsers, updateUserStatus, deleteUser,
    updateUserProfile, changeUserPassword, adminAddUser, approvePasswordReset, rejectPasswordReset
} from "@/app/actions";
import { AppHeader } from "@/components/shared/header";
import { RoleSelector } from "@/components/auth/role-selector";
import { ApproverLogin } from "@/components/auth/approver-login";
import { AdminLogin } from "@/components/auth/admin-login";
import { ApproverDashboard } from "@/components/dashboard/approver-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";
import { SubmissionView } from "@/components/forms/submission-view";
import { Skeleton } from "@/components/ui/skeleton";
import { RegisterForm } from "@/components/auth/register-form";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { SettingsPage } from "@/components/settings/settings-page";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

type AppView = 'role-selector' | 'dashboard' | 'admin-dashboard' | 'form' | 'view-submission' | 'approver-login' | 'admin-login' | 'register' | 'reset-password' | 'analytics' | 'settings';

export default function Home() {
  const [role, setRole] = React.useState<Role>(null);
  const [loggedInUser, setLoggedInUser] = React.useState<User | null>(null);
  const [view, setView] = React.useState<AppView>('role-selector');
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = React.useState<string | null>(null);
  const [formKey, setFormKey] = React.useState(Date.now());
  const [newPassword, setNewPassword] = React.useState<string | null>(null);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = React.useState(false);
  const [approvedPassword, setApprovedPassword] = React.useState<string | null>(null);
  const [isApprovedPasswordDialogOpen, setIsApprovedPasswordDialogOpen] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        if (loggedInUser?.role === 'Admin') {
            await fetchUsers();
        } else if (loggedInUser?.role === 'Approver') {
            await fetchSubmissions();
        }
        setIsLoading(false);
    }
    
    if (loggedInUser) {
        loadData();
    } else {
        setIsLoading(false);
    }
  }, [loggedInUser]);
  
  const pendingUsers = React.useMemo(() => users.filter(u => u.status === 'Pending'), [users]);
  const pendingSubmissions = React.useMemo(() => submissions.filter(s => s.status === 'Pending'), [submissions]);

  const notificationCount = React.useMemo(() => {
    if (loggedInUser?.role === 'Admin') {
      return pendingUsers.length;
    }
    if (loggedInUser?.role === 'Approver') {
      return pendingSubmissions.length;
    }
    return 0;
  }, [loggedInUser, pendingUsers, pendingSubmissions]);


  const fetchSubmissions = async () => {
    const fetchedSubmissions = await getSubmissions();
    setSubmissions(fetchedSubmissions);
  };
  
  const fetchUsers = async () => {
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
  };

  const handleSelectView = (newView: 'form' | 'approver-login') => {
    if (newView === 'form') {
        setRole('User');
    }
    setView(newView);
    setCurrentSubmissionId(null);
  };

  const handleLogin = async (email: string, password: string, role: "Admin" | "Approver"): Promise<boolean> => {
    const result = await loginUser({ email, password, role });
    if (result.success && result.user && result.translatedRole) {
        setLoggedInUser(result.user);
        setRole(result.user.role);
        
        if (result.user.role === 'Admin') {
            setView('admin-dashboard');
        } else {
            setView('dashboard');
        }
        toast({ title: "በተሳካ ሁኔታ ገብተዋል", description: `እንኳን ደህና መጡ፣ ${result.translatedRole}!` });
        return true;
    } else {
        toast({ title: "መግባት አልተቻለም", description: result.message, variant: "destructive" });
        return false;
    }
  }

  const handleLogout = () => {
    setRole(null);
    setLoggedInUser(null);
    setView('role-selector');
    setCurrentSubmissionId(null);
    setSubmissions([]);
    setUsers([]);
  };

  const handleGoToSettings = () => {
      setView('settings');
  }

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

  const handleViewAnalytics = () => {
    setView('analytics');
  };
  
  const handleBack = () => {
      if (view === 'form' && role === 'User') {
        handleLogout();
      } else if (view === 'approver-login' || view === 'admin-login' || view === 'register' || view === 'reset-password') {
        handleLogout();
      }
      else {
        // Go back to the correct dashboard based on logged in user's role
        if (loggedInUser?.role === 'Admin') {
            setView('admin-dashboard');
        } else {
            setView('dashboard');
        }
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

  const handleUpdateSubmissionStatus = async (id: string, status: SubmissionStatus, comments?: string) => {
    const result = await updateSubmissionStatus(id, status, comments);
    if(result.success) {
      toast({ title: "ሁኔታው ታድሷል", description: result.message });
      fetchSubmissions();
    } else {
      toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    const result = await deleteSubmission(id);
    if(result.success) {
      toast({ title: "ማመልከቻ ተሰርዟል", description: result.message });
      fetchSubmissions();
    } else {
      toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
  };

  const handleRegister = async (data: any): Promise<boolean> => {
    const result = await registerUser(data);
    if (result.success) {
      toast({ title: "ምዝገባ ገብቷል", description: result.message });
      setView('approver-login');
      return true;
    } else {
      toast({ title: "ምዝገባ አልተሳካም", description: result.message, variant: "destructive" });
      return false;
    }
  };

  const handleResetPassword = async (data: { fullName: string; email: string }): Promise<boolean> => {
    const result = await requestPasswordReset(data);
    if (result.success) {
      if (result.isAdminRequest) {
        toast({ title: "ጥያቄው ተልኳል", description: result.message });
        return true;
      }
      if (result.newPassword) {
        setNewPassword(result.newPassword);
        setIsPasswordResetDialogOpen(true);
        return true;
      }
    } 
    toast({ title: "ጥያቄው አልተሳካም", description: result.message, variant: "destructive" });
    return false;
  };

  // --- Admin actions handlers ---
  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
      const result = await updateUserStatus(userId, status);
      if (result.success) {
          toast({ title: "የተጠቃሚ ሁኔታ ታድሷል", description: result.message });
          fetchUsers();
      } else {
          toast({ title: "ስህተት", description: result.message, variant: "destructive" });
      }
  };

  const handleDeleteUser = async (userId: string) => {
      const result = await deleteUser(userId);
      if (result.success) {
          toast({ title: "ተጠቃሚ ተሰርዟል", description: result.message });
          fetchUsers();
      } else {
          toast({ title: "ስህተት", description: result.message, variant: "destructive" });
      }
  }

  const handleAddUser = async (data: any) => {
      const result = await adminAddUser(data);
      if (result.success) {
          toast({ title: "ተጠቃሚ ተፈጥሯል", description: result.message });
          fetchUsers();
          return true;
      } else {
          toast({ title: "ስህተት", description: result.message, variant: "destructive" });
          return false;
      }
  }

  const handleApprovePasswordReset = async (userId: string) => {
    if (!loggedInUser) return;
    const result = await approvePasswordReset(userId, loggedInUser.id);
    if (result.success && result.newPassword) {
        setApprovedPassword(result.newPassword);
        setIsApprovedPasswordDialogOpen(true);
        toast({ title: "ጥያቄ ጸድቋል", description: result.message });
        fetchUsers();
    } else {
        toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
  };

  const handleRejectPasswordReset = async (userId: string) => {
      const result = await rejectPasswordReset(userId);
      if (result.success) {
          toast({ title: "ጥያቄ ውድቅ ተደርጓል", description: result.message });
          fetchUsers();
      } else {
          toast({ title: "ስህተት", description: result.message, variant: "destructive" });
      }
  };


  // --- User Profile Handlers ---
  const handleUserUpdate = (updatedUser: User) => {
      setLoggedInUser(updatedUser);
      handleBack();
  }

  const currentSubmission = submissions.find(s => s.id === currentSubmissionId);

  const renderContent = () => {
    if (isLoading && view !== 'role-selector' && view !== 'form') {
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
        return <ApproverDashboard submissions={submissions} onView={handleView} onUpdateStatus={handleUpdateSubmissionStatus} onDelete={handleDeleteSubmission} onViewAnalytics={handleViewAnalytics} />;
      
      case 'admin-dashboard':
        return <AdminDashboard 
            users={users} 
            currentUser={loggedInUser}
            onUpdateUserStatus={handleUpdateUserStatus} 
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
            onApprovePasswordReset={handleApprovePasswordReset}
            onRejectPasswordReset={handleRejectPasswordReset}
        />;

      case 'analytics':
        return <AnalyticsDashboard submissions={submissions} onBack={handleBack} />;

      case 'form':
        return <StrategicPlanForm key={formKey} submission={currentSubmission} onSave={handleSaveSubmission} onCancel={handleBack} isSubmitting={isSubmitting} />;

      case 'view-submission':
        if (currentSubmission) {
          return <SubmissionView submission={currentSubmission} onBack={handleBack} />;
        }
        return null;

      case 'approver-login':
        return <ApproverLogin onLogin={handleLogin} onBack={handleBack} onGoToRegister={() => setView('register')} onGoToReset={() => setView('reset-password')} onGoToAdminLogin={() => setView('admin-login')} />;
      
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} onBack={() => setView('approver-login')} onGoToReset={() => setView('reset-password')} />;

      case 'register':
        return <RegisterForm onRegister={handleRegister} onBack={handleBackToLogin} />;
      
      case 'reset-password':
        return <ResetPasswordForm onReset={handleResetPassword} onBack={handleBackToLogin} />;

      case 'settings':
        if (loggedInUser) {
          return <SettingsPage user={loggedInUser} onBack={handleBack} onUserUpdate={handleUserUpdate} />;
        }
        return null;

      default:
        return <RoleSelector onSelectView={handleSelectView} />;
    }
  };
  
  if (view === 'role-selector') {
    return (
        <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <RoleSelector onSelectView={handleSelectView} />
        </main>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader 
        user={loggedInUser} 
        onLogout={handleLogout} 
        onGoToSettings={handleGoToSettings} 
        notificationCount={notificationCount}
        pendingUsers={pendingUsers}
        pendingSubmissions={pendingSubmissions}
        onNotificationClick={(targetView) => setView(targetView)}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-500">
            {renderContent()}
        </div>
      </main>

      <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>የይለፍ ቃል በተሳካ ሁኔታ ዳግም ተጀምሯል</DialogTitle>
                <DialogDescription>
                    እባክዎ ይህን አዲስ ጊዜያዊ የይለፍ ቃል ገልብጠው ደህንነቱ በተጠበቀ ቦታ ያስቀምጡት። ከገቡ በኋላ እንዲቀይሩት ይመከራል።
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 my-4">
                <Input value={newPassword || ''} readOnly className="font-mono text-lg tracking-wider" />
                <Button variant="outline" size="icon" onClick={() => {
                    if(newPassword) navigator.clipboard.writeText(newPassword)
                    toast({ title: "ተቀድቷል!", description: "አዲስ የይለፍ ቃል ወደ ቅንጥብ ሰሌዳ ተቀድቷል።" });
                }}><Copy className="h-4 w-4" /></Button>
            </div>
            <DialogFooter>
                <Button onClick={() => {
                    setIsPasswordResetDialogOpen(false);
                    setView('approver-login');
                }}>ተከናውኗል</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isApprovedPasswordDialogOpen} onOpenChange={setIsApprovedPasswordDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>የይለፍ ቃል ዳግም ማስጀመር ጸድቋል</DialogTitle>
                <DialogDescription>
                እባክዎ ይህን አዲስ ጊዜያዊ የይለፍ ቃል ገልብጠው ለተጠቃሚው ደህንነቱ በተጠበቀ ሁኔታ ያድርሱት። ይህ የይለፍ ቃል እንደገና አይታይም።
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 my-4">
                <Input value={approvedPassword || ''} readOnly className="font-mono text-lg tracking-wider" />
                <Button variant="outline" size="icon" onClick={() => {
                    if(approvedPassword) navigator.clipboard.writeText(approvedPassword)
                    toast({ title: "ተቀድቷል!", description: "አዲስ የይለፍ ቃል ወደ ቅንጥብ ሰሌዳ ተቀድቷል።" });
                }}><Copy className="h-4 w-4" /></Button>
            </div>
            <DialogFooter>
                <Button onClick={() => setIsApprovedPasswordDialogOpen(false)}>ተከናውኗል</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
