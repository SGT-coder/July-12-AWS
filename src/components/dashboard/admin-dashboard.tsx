
"use client";

import * as React from "react";
import {
  UserCheck, UserX, ShieldCheck, Trash2, FileWarning, UserPlus, KeyRound, Copy
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";

import type { User, UserStatus } from "@/lib/types";
import { DateDisplay } from "@/components/shared/date-display";
import { adminAddUserSchema, type AdminAddUserFormValues } from "@/lib/schemas";
import { Loader2 } from "lucide-react";


interface AdminDashboardProps {
  users: User[];
  currentUser: User | null;
  onUpdateUserStatus: (userId: string, status: UserStatus) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (data: AdminAddUserFormValues) => Promise<boolean>;
  onApprovePasswordReset: (userId: string) => Promise<string | null>;
  onDenyPasswordReset: (userId: string) => void;
}

const statusTranslations: Record<UserStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};

const StatusBadge = ({ status }: { status: UserStatus }) => {
    const config = {
        Approved: "bg-green-100 text-green-800 border-green-200",
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
        Rejected: "bg-red-100 text-red-800 border-red-200",
    };
    return <Badge variant="outline" className={config[status]}>{statusTranslations[status]}</Badge>;
}

const AddUserDialog = ({ onAddUser }: { onAddUser: (data: AdminAddUserFormValues) => Promise<boolean> }) => {
    const [open, setOpen] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const form = useForm<AdminAddUserFormValues>({
        resolver: zodResolver(adminAddUserSchema),
        defaultValues: { name: "", email: "", password: "", role: "Approver" }
    });

    const onSubmit = async (data: AdminAddUserFormValues) => {
        setIsSubmitting(true);
        const success = await onAddUser(data);
        setIsSubmitting(false);
        if (success) {
            setOpen(false);
            form.reset();
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><UserPlus className="mr-2 h-4 w-4" /> ተጠቃሚ ጨምር</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>አዲስ ተጠቃሚ ጨምር</DialogTitle>
                    <DialogDescription>አዲስ የአስተዳዳሪ ወይም የአጽዳቂ መለያ ፍጠር።</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>ሙሉ ስም</FormLabel><FormControl><Input placeholder="ሙሉ ስም ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>ኢሜይል</FormLabel><FormControl><Input type="email" placeholder="ኢሜይል ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="password" render={({ field }) => (
                            <FormItem><FormLabel>የይለፍ ቃል</FormLabel><FormControl><Input type="password" placeholder="የይለፍ ቃል ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>ሚና</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="ሚና ይምረጡ" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Approver">አጽዳቂ</SelectItem>
                                        <SelectItem value="Admin">አስተዳዳሪ</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "ተጠቃሚ ፍጠር"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

const ApproveResetDialog = ({ onConfirm }: { onConfirm: () => void }) => (
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>የይለፍ ቃል ዳግም ማስጀመርን አጽድቅ?</AlertDialogTitle>
            <AlertDialogDescription>
                ይህ ለተጠቃሚው አዲስ የይለፍ ቃል ይፈጥራል። አዲሱን የይለፍ ቃል ለተጠቃሚው ማሳወቅ ይኖርብዎታል።
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>ይቅር</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm}>አዎ፣ አጽድቅ</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
);

const NewPasswordDialog = ({ password, onDone }: { password: string, onDone: () => void }) => {
    const { toast } = useToast();
    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        toast({ title: "ተቀድቷል!", description: "አዲስ የይለፍ ቃል ወደ ቅንጥብ ሰሌዳ ተቀድቷል።" });
    }
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>አዲስ የይለፍ ቃል ተፈጥሯል</DialogTitle>
                <DialogDescription>እባክዎ ይህን አዲስ የይለፍ ቃል ገልብጠው ለተጠቃሚው በአስተማማኝ ሁኔታ ያጋሩ።</DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2 my-4">
                <Input value={password} readOnly className="font-mono text-lg tracking-wider" />
                <Button variant="outline" size="icon" onClick={copyToClipboard}><Copy className="h-4 w-4" /></Button>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button onClick={onDone}>ተከናውኗል</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}

export function AdminDashboard({ users, currentUser, onUpdateUserStatus, onDeleteUser, onAddUser, onApprovePasswordReset, onDenyPasswordReset }: AdminDashboardProps) {

  const [newlyGeneratedPassword, setNewlyGeneratedPassword] = React.useState<string | null>(null);

  const handleApproveReset = async (userId: string) => {
    const newPassword = await onApprovePasswordReset(userId);
    if (newPassword) {
        setNewlyGeneratedPassword(newPassword);
    }
  }

  const pendingRegistrations = users.filter(u => u.status === 'Pending');
  const passwordResetRequests = users.filter(u => u.passwordResetRequested);
  const activeUsers = users.filter(u => u.status === 'Approved' && u.id !== currentUser?.id);
  const registrationHistory = users.filter(u => u.status === 'Approved' || u.status === 'Rejected');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">የአስተዳዳሪ ዳሽቦርድ</h1>
        <p className="text-muted-foreground">የተጠቃሚ መለያዎችን፣ ጥያቄዎችን እና ታሪክን ያስተዳድሩ።</p>
      </div>

      <Tabs defaultValue="requests">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="requests">ጥያቄዎች</TabsTrigger>
          <TabsTrigger value="users">ተጠቃሚዎች</TabsTrigger>
          <TabsTrigger value="history">ታሪክ</TabsTrigger>
        </TabsList>
        
        {/* REQUESTS TAB */}
        <TabsContent value="requests" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>በመጠባበቅ ላይ ያሉ ምዝገባዎች</CardTitle>
                    <CardDescription>አዲስ የተጠቃሚ ምዝገባ ጥያቄዎችን አጽድቅ ወይም ውድቅ አድርግ።</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader><TableRow><TableHead>ስም</TableHead><TableHead>ኢሜይል</TableHead><TableHead>የተጠየቀበት ቀን</TableHead><TableHead className="text-right">ድርጊቶች</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {pendingRegistrations.length > 0 ? pendingRegistrations.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><DateDisplay dateString={user.createdAt} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => onUpdateUserStatus(user.id, 'Approved')}><UserCheck className="mr-2 h-4 w-4" /> አጽድቅ</Button>
                                        <Button size="sm" variant="destructive" onClick={() => onUpdateUserStatus(user.id, 'Rejected')}><UserX className="mr-2 h-4 w-4" /> ውድቅ አድርግ</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />በመጠባበቅ ላይ ያሉ ምዝገባዎች የሉም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎች</CardTitle>
                    <CardDescription>የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎችን አጽድቅ ወይም ውድቅ አድርግ።</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader><TableRow><TableHead>ስም</TableHead><TableHead>ኢሜይል</TableHead><TableHead>የተጠየቀበት ቀን</TableHead><TableHead className="text-right">ድርጊቶች</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {passwordResetRequests.length > 0 ? passwordResetRequests.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><DateDisplay dateString={user.statusUpdatedAt} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="outline"><KeyRound className="mr-2 h-4 w-4" /> አጽድቅ</Button></AlertDialogTrigger><ApproveResetDialog onConfirm={() => handleApproveReset(user.id)} /></AlertDialog>
                                        <Button size="sm" variant="destructive" onClick={() => onDenyPasswordReset(user.id)}><UserX className="mr-2 h-4 w-4" /> ውድቅ አድርግ</Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground mb-2" />የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎች የሉም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>ሁሉም ንቁ ተጠቃሚዎች</CardTitle>
                        <CardDescription>በስርዓቱ ውስጥ ያሉትን ሁሉንም ንቁ የአስተዳዳሪ እና የአጽዳቂ ተጠቃሚዎችን ያስተዳድሩ።</CardDescription>
                    </div>
                    <AddUserDialog onAddUser={onAddUser} />
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader><TableRow><TableHead>ስም</TableHead><TableHead>ኢሜይል</TableHead><TableHead>ሚና</TableHead><TableHead>የተቀላቀለበት ቀን</TableHead><TableHead className="text-right">ድርጊቶች</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {activeUsers.length > 0 ? activeUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                                    <TableCell><DateDisplay dateString={user.createdAt} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                       <AlertDialog>
                                            <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>እርግጠኛ ነዎት?</AlertDialogTitle><AlertDialogDescription>ይህ ተጠቃሚውን እስከመጨረሻው ይሰርዘዋል። ይህን እርምጃ መቀልበስ አይቻልም።</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>ይቅር</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">አዎ، ተጠቃሚውን ሰርዝ</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center"><FileWarning className="mx-auto h-8 w-8 text-muted-foreground mb-2" />ሌሎች ንቁ ተጠቃሚዎች አልተገኙም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        {/* HISTORY TAB */}
        <TabsContent value="history">
            <Card>
                <CardHeader>
                    <CardTitle>የተጠቃሚ አስተዳደር ታሪክ</CardTitle>
                    <CardDescription>የጸደቁ እና ውድቅ የተደረጉ የተጠቃሚ ምዝገባዎች መዝገብ።</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader><TableRow><TableHead>ስም</TableHead><TableHead>ኢሜይል</TableHead><TableHead>ሁኔታ</TableHead><TableHead>ቀን</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {registrationHistory.length > 0 ? registrationHistory.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><StatusBadge status={user.status} /></TableCell>
                                    <TableCell><DateDisplay dateString={user.statusUpdatedAt} /></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center"><FileWarning className="mx-auto h-8 w-8 text-muted-foreground mb-2" />ምንም ታሪክ አልተገኘም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={!!newlyGeneratedPassword} onOpenChange={(open) => !open && setNewlyGeneratedPassword(null)}>
          {newlyGeneratedPassword && <NewPasswordDialog password={newlyGeneratedPassword} onDone={() => setNewlyGeneratedPassword(null)} />}
      </Dialog>
    </div>
  );
}
