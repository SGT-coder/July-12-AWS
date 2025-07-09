
"use client";

import * as React from "react";
import {
  UserCheck,
  UserX,
  ShieldCheck,
  Trash2,
  KeyRound,
  FileWarning,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User, UserStatus } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface AdminDashboardProps {
  users: User[];
  currentUser: User | null;
  onUpdateUserStatus: (userId: string, status: UserStatus) => void;
  onDeleteUser: (userId: string) => void;
  onConfirmPasswordReset: (userId: string) => void;
}

const DeletionDialog = ({ onConfirm, type = 'user' }: { onConfirm: () => void, type?: 'user' | 'rejection' }) => {
    const isRejection = type === 'rejection';
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{isRejection ? 'Reject Registration?' : 'Are you sure?'}</AlertDialogTitle>
                <AlertDialogDescription>
                    {isRejection 
                        ? "This will permanently delete the user's registration request. This action cannot be undone."
                        : "This will permanently delete the user. This action cannot be undone."
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isRejection ? 'Yes, reject and delete' : 'Yes, delete user'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

const StatusBadge = ({ status }: { status: UserStatus }) => {
    const config = {
        Approved: {
            className: "bg-green-100 text-green-800 border-green-200",
        },
        Pending: {
            className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        },
        Rejected: {
            className: "bg-red-100 text-red-800 border-red-200",
        },
    };
    return <Badge variant="outline" className={config[status].className}>{status}</Badge>;
}

export function AdminDashboard({
  users,
  currentUser,
  onUpdateUserStatus,
  onDeleteUser,
  onConfirmPasswordReset
}: AdminDashboardProps) {

  const pendingUsers = users.filter(u => u.status === 'Pending');
  const managedUsers = users.filter(u => u.status !== 'Pending' && u.id !== currentUser?.id);
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Admin Dashboard</CardTitle>
          <CardDescription>
            Manage user registrations and account issues.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Pending Registrations */}
      <Card>
        <CardHeader>
            <CardTitle>Pending Registrations</CardTitle>
            <CardDescription>Approve or reject new user registration requests.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Requested Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pendingUsers.length > 0 ? (
                        pendingUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="outline" onClick={() => onUpdateUserStatus(user.id, 'Approved')}>
                                        <UserCheck className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <UserX className="mr-2 h-4 w-4" /> Reject
                                            </Button>
                                        </AlertDialogTrigger>
                                        <DeletionDialog type="rejection" onConfirm={() => onDeleteUser(user.id)} />
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                No pending registrations.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>View all active users and manage their accounts.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pwd Reset Req.</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {managedUsers.length > 0 ? (
                        managedUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                                <TableCell><StatusBadge status={user.status} /></TableCell>
                                <TableCell>{user.passwordResetRequested ? 'Yes' : 'No'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                   {user.passwordResetRequested && (
                                     <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50" onClick={() => onConfirmPasswordReset(user.id)}>
                                                <KeyRound className="mr-2 h-4 w-4" /> Acknowledge
                                           </Button>
                                         </TooltipTrigger>
                                         <TooltipContent>
                                           <p>Acknowledge password reset request.</p>
                                         </TooltipContent>
                                       </Tooltip>
                                     </TooltipProvider>
                                   )}
                                   <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <DeletionDialog onConfirm={() => onDeleteUser(user.id)} />
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                         <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                <FileWarning className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                No other users found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
