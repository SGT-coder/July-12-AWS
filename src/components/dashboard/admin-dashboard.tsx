
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
                <AlertDialogTitle>{isRejection ? 'ምዝገባው ውድቅ ይደረግ?' : 'እርግጠኛ ነዎት?'}</AlertDialogTitle>
                <AlertDialogDescription>
                    {isRejection 
                        ? "ይህ የተጠቃሚውን የምዝገባ ጥያቄ እስከመጨረሻው ይሰርዘዋል። ይህን እርምጃ መቀልበስ አይቻልም።"
                        : "ይህ ተጠቃሚውን እስከመጨረሻው ይሰርዘዋል። ይህን እርምጃ መቀልበስ አይቻልም።"
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>ይቅር</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    {isRejection ? 'አዎ፣ ውድቅ አድርግ እና ሰርዝ' : 'አዎ፣ ተጠቃሚውን ሰርዝ'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}

const statusTranslations: Record<UserStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};

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
    return <Badge variant="outline" className={config[status].className}>{statusTranslations[status]}</Badge>;
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
          <CardTitle className="font-headline">የአስተዳዳሪ ዳሽቦርድ</CardTitle>
          <CardDescription>
            የተጠቃሚ ምዝገባዎችን እና የመለያ ጉዳዮችን ያስተዳድሩ።
          </CardDescription>
        </CardHeader>
      </Card>
      
      {/* Pending Registrations */}
      <Card>
        <CardHeader>
            <CardTitle>በመጠባበቅ ላይ ያሉ ምዝገባዎች</CardTitle>
            <CardDescription>አዲስ የተጠቃሚ ምዝገባ ጥያቄዎችን አጽድቅ ወይም ውድቅ አድርግ።</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>ስም</TableHead>
                    <TableHead>ኢሜይል</TableHead>
                    <TableHead>የተጠየቀው ሚና</TableHead>
                    <TableHead className="text-right">ድርጊቶች</TableHead>
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
                                        <UserCheck className="mr-2 h-4 w-4" /> አጽድቅ
                                    </Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <UserX className="mr-2 h-4 w-4" /> ውድቅ አድርግ
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
                                በመጠባበቅ ላይ ያሉ ምዝገባዎች የሉም።
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
            <CardTitle>የተጠቃሚ አስተዳደር</CardTitle>
            <CardDescription>ሁሉንም ንቁ ተጠቃሚዎችን ይመልከቱ እና መለያዎቻቸውን ያስተዳድሩ።</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ስም</TableHead>
                        <TableHead>ኢሜይል</TableHead>
                        <TableHead>ሚና</TableHead>
                        <TableHead>ሁኔታ</TableHead>
                        <TableHead>የይለፍ ቃል ዳግም ማስጀመር</TableHead>
                        <TableHead className="text-right">ድርጊቶች</TableHead>
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
                                <TableCell>{user.passwordResetRequested ? 'አዎ' : 'አይ'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                   {user.passwordResetRequested && (
                                     <TooltipProvider>
                                       <Tooltip>
                                         <TooltipTrigger asChild>
                                           <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50" onClick={() => onConfirmPasswordReset(user.id)}>
                                                <KeyRound className="mr-2 h-4 w-4" /> እውቅና ስጥ
                                           </Button>
                                         </TooltipTrigger>
                                         <TooltipContent>
                                           <p>የይለፍ ቃል ዳግም ማስጀመር ጥያቄን እውቅና ይስጡ።</p>
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
                                ሌሎች ተጠቃሚዎች አልተገኙም።
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
