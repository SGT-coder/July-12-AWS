
"use client";

import * as React from "react";
import type { Role, Submission, SubmissionStatus, StrategicPlanFormValues, User, UserStatus } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { 
    getSubmissions, addSubmission, updateSubmission, updateSubmissionStatus, deleteSubmission, 
    loginUser, registerUser, requestPasswordReset, getUsers, updateUserStatus, deleteUser,
    updateUserProfile, changeUserPassword, adminAddUser, approvePasswordReset, rejectPasswordReset,
    trackSubmission
} from "@/app/client-actions";
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
import { SubmissionTracking } from "@/components/tracking/submission-tracking";
import { initialUsers } from "@/lib/data";

type AppView = 'role-selector' | 'dashboard' | 'admin-dashboard' | 'form' | 'view-submission' | 'approver-login' | 'admin-login' | 'register' | 'reset-password' | 'analytics' | 'settings' | 'track-submission' | 'admin/register';

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
  const [newSubmissionId, setNewSubmissionId] = React.useState<string | null>(null);
  const [isTrackingIdDialogOpen, setIsTrackingIdDialogOpen] = React.useState(false);
  const [trackedSubmission, setTrackedSubmission] = React.useState<Submission | null>(null);

  const { toast } = useToast();

  React.useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        const users = await fetchUsers();
        setUsers(users);

        if (loggedInUser?.role === 'Admin') {
            const submissions = await fetchSubmissions();
            setSubmissions(submissions);
        } else if (loggedInUser?.role === 'Approver') {
            const submissions = await fetchSubmissions();
            setSubmissions(submissions);
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
  const pendingPasswordResets = React.useMemo(() => users.filter(u => u.passwordResetStatus === 'Pending'), [users]);
  const pendingSubmissions = React.useMemo(() => submissions.filter(s => s.status === 'Pending'), [submissions]);

  const notificationCount = React.useMemo(() => {
    if (loggedInUser?.role === 'Admin') {
      return (pendingUsers?.length || 0) + (pendingPasswordResets?.length || 0);
    }
    if (loggedInUser?.role === 'Approver') {
      return pendingSubmissions.length;
    }
    return 0;
  }, [loggedInUser, pendingUsers, pendingPasswordResets, pendingSubmissions]);


  const fetchSubmissions = async () => {
    const fetchedSubmissions = await getSubmissions();
    return fetchedSubmissions;
  };
  
  const fetchUsers = async () => {
    const fetchedUsers = await getUsers();
    return fetchedUsers;
  };

  const handleSelectView = (newView: 'form' | 'approver-login' | 'track-submission' | 'admin/register') => {
    if (newView === 'form') {
        setRole('User');
        setCurrentSubmissionId(null);
        setTrackedSubmission(null);
        setFormKey(Date.now());
    } else if (newView === 'approver-login') {
        setRole('Approver'); // Or Admin, this just sets context
        setView('approver-login');
        return;
    }
     if (newView === 'track-submission') {
        setRole('User');
        setCurrentSubmissionId(null);
        setTrackedSubmission(null);
    }
    setView(newView);
    setCurrentSubmissionId(null);
  };

  const handleLogin = async (email: string, password: string, role: "Admin" | "Approver"): Promise<boolean> => {
    let userToLogin: User | undefined;
    
    const roleTranslations: Record<User['role'], string> = {
        Admin: "አስተዳዳሪ",
        Approver: "አጽዳቂ",
    };

    if (role === 'Admin') {
        userToLogin = initialUsers.find(u => u.role === 'Admin');
        if (userToLogin) {
            setLoggedInUser(userToLogin);
            setRole('Admin');
            setView('admin-dashboard');
            toast({ title: "በተሳካ ሁኔታ ገብተዋል", description: `እንኳን ደህና መጡ، ${userToLogin.name} (${roleTranslations[userToLogin.role]})!` });
            return true;
        }
    }

    if (role === 'Approver') {
        userToLogin = initialUsers.find(u => u.role === 'Approver');
        if (userToLogin) {
            setLoggedInUser(userToLogin);
            setRole('Approver');
            setView('dashboard');
            toast({ title: "በተሳካ ሁኔታ ገብተዋል", description: `እንኳን ደህና መጡ، ${userToLogin.name} (${roleTranslations[userToLogin.role]})!` });
            return true;
        }
    }
    
    // Fallback if no sample user is found, though this shouldn't happen with the current setup.
    toast({ title: "መግባት አልተቻለም", description: "Sample user not found.", variant: "destructive" });
    return false;
  }

  const handleLogout = () => {
    setRole(null);
    setLoggedInUser(null);
    setView('role-selector');
    setCurrentSubmissionId(null);
    setTrackedSubmission(null);
    setSubmissions([]);
    setUsers([]);
  };

  const handleGoToSettings = () => {
      setView('settings');
  }

  const handleCreateNew = () => {
    setCurrentSubmissionId(null);
    setFormKey(Date.now());
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
      if (view === 'form' || view === 'track-submission' || view === 'admin/register') {
        handleLogout();
      } else if (view === 'approver-login' || view === 'admin-login' || view === 'register' || view === 'reset-password') {
        handleLogout();
      }
      else {
        // Go back to the correct dashboard based on logged in user's role
        if (loggedInUser?.role === 'Admin') {
            setView('admin-dashboard');
        } else if (loggedInUser?.role === 'Approver') {
            setView('dashboard');
        } else {
            handleLogout();
        }
        setCurrentSubmissionId(null);
        setTrackedSubmission(null);
      }
  };

  const handleBackToLogin = () => {
      setView('approver-login');
  }

  const handleSaveSubmission = async (data: StrategicPlanFormValues, id?: string) => {
    setIsSubmitting(true);
    const result = id ? await updateSubmission(id, data) : await addSubmission(data);
    
    if (result.success) {
      if (!id && result.submission) {
         setNewSubmissionId(result.submission.id);
         setIsTrackingIdDialogOpen(true);
         setTrackedSubmission(null); // Clear tracked submission after new one is created
         setFormKey(Date.now()); // Reset form
      } else if (id && result.submission) {
          toast({
            title: "ዕቅድ ተስተካክሏል",
            description: `"${data.projectTitle}" ${'የተሰኘው እቅድዎ ተስተካክሎ እንደገና ለግምገማ ተልኳል።'}`,
          });
          setTrackedSubmission(result.submission);
          setCurrentSubmissionId(id);
          setFormKey(Date.now());
          // If a logged-in user is editing, fetch fresh data
          if(loggedInUser) await fetchSubmissions();
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
      const subs = await fetchSubmissions();
      setSubmissions(subs);
      // After updating, go back to dashboard
      setView(loggedInUser?.role === 'Admin' ? 'admin-dashboard' : 'dashboard');
    } else {
      toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    const result = await deleteSubmission(id);
    if(result.success) {
      toast({ title: "ማመልከቻ ተሰርዟል", description: result.message });
      const subs = await fetchSubmissions();
      setSubmissions(subs);
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
    setIsSubmitting(true);
    const result = await requestPasswordReset(data);
    setIsSubmitting(false);
    if (result.success) {
      if (result.isAdminRequest) {
        toast({ title: "ጥያቄው ተልኳል", description: result.message });
        handleBackToLogin();
      } else if (result.newPassword) {
        setNewPassword(result.newPassword);
        setIsPasswordResetDialogOpen(true);
      }
      return true;
    } 
    toast({ title: "ጥያቄው አልተሳካም", description: result.message, variant: "destructive" });
    return false;
  };

  // --- Admin actions handlers ---
  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
      const result = await updateUserStatus(userId, status);
      if (result.success) {
          toast({ title: "የተጠቃሚ ሁኔታ ታድሷል", description: result.message });
          const users = await fetchUsers();
          setUsers(users);
      } else {
          toast({ title: "ስህተት", description: result.message, variant: "destructive" });
      }
  };

  const handleDeleteUser = async (userId: string) => {
      const result = await deleteUser(userId);
      if (result.success) {
          toast({ title: "ተጠቃሚ ተሰርዟል", description: result.message });
          const users = await fetchUsers();
          setUsers(users);
      } else {
          toast({ title: "ስህተት", description: result.message, variant: "destructive" });
      }
  }

  const handleAddUser = async (data: any) => {
      const result = await adminAddUser(data);
      if (result.success) {
          toast({ title: "ተጠቃሚ ተፈጥሯል", description: result.message });
          const users = await fetchUsers();
          setUsers(users);
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
        const users = await fetchUsers();
        setUsers(users);
    } else {
        toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
  };

  const handleRejectPasswordReset = async (userId: string) => {
      const result = await rejectPasswordReset(userId);
      if (result.success) {
          toast({ title: "ጥያቄ ውድቅ ተደርጓል", description: result.message });
          const users = await fetchUsers();
          setUsers(users);
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

  const shouldShowHeaderButton = ['form', 'view-submission', 'analytics', 'settings', 'track-submission', 'admin/register'].includes(view);

  const renderContent = () => {
    if (isLoading && !['role-selector', 'form', 'track-submission', 'admin/register'].includes(view)) {
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
        return <ApproverDashboard submissions={submissions} onView={handleView} onUpdateStatus={handleUpdateSubmissionStatus} onDelete={handleDeleteSubmission} />;
      
      case 'admin-dashboard':
        return <AdminDashboard 
            users={users}
            submissions={submissions}
            currentUser={loggedInUser}
            onUpdateUserStatus={handleUpdateUserStatus} 
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
            onApprovePasswordReset={handleApprovePasswordReset}
            onRejectPasswordReset={handleRejectPasswordReset}
            onViewSubmission={handleView}
            onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
            onDeleteSubmission={handleDeleteSubmission}
        />;

      case 'analytics':
        return <AnalyticsDashboard submissions={submissions} />;

      case 'form':
        return <StrategicPlanForm key={formKey} onSave={handleSaveSubmission} isSubmitting={isSubmitting} />;

      case 'view-submission':
        if (currentSubmission) {
          return <SubmissionView 
                    submission={currentSubmission} 
                    onUpdateStatus={loggedInUser?.role === 'Approver' || loggedInUser?.role === 'Admin' ? handleUpdateSubmissionStatus : undefined} 
                 />;
        }
        return null;

      case 'approver-login':
        return <ApproverLogin onLogin={handleLogin} onBack={handleLogout} onGoToRegister={() => setView('register')} onGoToReset={() => setView('reset-password')} onGoToAdminLogin={() => setView('admin-login')} />;
      
      case 'admin-login':
        return <AdminLogin onLogin={handleLogin} onBack={() => setView('approver-login')} onGoToReset={() => setView('reset-password')} />;

      case 'register':
        return <RegisterForm onRegister={handleRegister} onBack={handleBackToLogin} />;
      
      case 'reset-password':
        return <ResetPasswordForm onReset={handleResetPassword} onBack={handleBackToLogin} isSubmitting={isSubmitting} />;

      case 'settings':
        if (loggedInUser) {
          return <SettingsPage user={loggedInUser} onUserUpdate={handleUserUpdate} />;
        }
        return null;
        
      case 'track-submission':
          return <SubmissionTracking 
                    onTracked={setTrackedSubmission}
                    trackedSubmission={trackedSubmission}
                  >
                     {trackedSubmission && (
                        <StrategicPlanForm
                            key={formKey}
                            submission={trackedSubmission}
                            onSave={handleSaveSubmission}
                            isSubmitting={isSubmitting}
                            isReadOnly={trackedSubmission?.status === 'Approved'}
                        />
                     )}
                  </SubmissionTracking>;
      case 'admin/register':
        const AdminRegisterPage = require('@/app/admin/register/page').default;
        return <AdminRegisterPage />;

      default:
        return <RoleSelector onSelectView={handleSelectView} />;
    }
  };
  
  if (view === 'role-selector') {
    return (
        <main className="min-h-screen">
            <RoleSelector onSelectView={handleSelectView} />
        </main>
    );
  }

  const handleDialogDone = () => {
    setIsTrackingIdDialogOpen(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        user={loggedInUser} 
        onLogout={handleLogout} 
        onGoToSettings={handleGoToSettings} 
        onBack={shouldShowHeaderButton ? handleBack : undefined}
        onNavigateToAnalytics={loggedInUser?.role === 'Approver' || loggedInUser?.role === 'Admin' ? handleViewAnalytics : undefined}
        notificationCount={notificationCount}
        pendingUsers={pendingUsers}
        pendingPasswordResets={pendingPasswordResets}
        pendingSubmissions={pendingSubmissions}
        onNotificationClick={(targetView) => setView(targetView)}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
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
       <Dialog open={isTrackingIdDialogOpen} onOpenChange={setIsTrackingIdDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>ዕቅድ በተሳካ ሁኔታ ገብቷል!</DialogTitle>
                <DialogDescription>
                    ለግምገማ እና ለክትትል ይህንን ልዩ የመከታተያ መታወቂያ ይጠቀሙ። እባክዎ ገልብጠው ደህንነቱ በተጠበቀ ቦታ ያስቀምጡት፣ ምክንያቱም እንደገና አይታይም።
                </DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 my-4">
                <Input value={newSubmissionId || ''} readOnly className="font-mono text-lg tracking-wider bg-primary/10" />
                <Button variant="outline" size="icon" onClick={() => {
                    if(newSubmissionId) navigator.clipboard.writeText(newSubmissionId)
                    toast({ title: "ተቀድቷል!", description: "የመከታተያ መታወቂያ ወደ ቅንጥብ ሰሌዳ ተቀድቷል።" });
                }}><Copy className="h-4 w-4" /></Button>
            </div>
            <DialogFooter>
                <Button onClick={handleDialogDone}>ተከናውኗል</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
