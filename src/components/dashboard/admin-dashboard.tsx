
"use client";

import * as React from "react";
import { UserCheck, UserX, Trash2, UserPlus, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User, UserStatus, Submission, SubmissionStatus } from "@/lib/types";
import { DateDisplay } from "@/components/shared/date-display";
import { adminAddUserSchema, type AdminAddUserFormValues } from "@/lib/schemas";
import { Loader2 } from "lucide-react";
import { StatusBadge as SubmissionStatusBadge } from "@/components/shared/status-badge";


interface AdminDashboardProps {
  users: User[];
  submissions: Submission[];
  currentUser: User | null;
  onUpdateUserStatus: (userId: string, status: UserStatus) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (data: AdminAddUserFormValues) => Promise<boolean>;
  onApprovePasswordReset: (userId: string) => void;
  onRejectPasswordReset: (userId: string) => void;
  onViewSubmission: (id: string) => void;
  onUpdateSubmissionStatus: (id: string, status: SubmissionStatus, comments?: string) => void;
  onDeleteSubmission: (id: string) => void;
}

type SortableUserColumn = keyof Pick<User, 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'statusUpdatedAt'>;
type SortableSubmissionColumn = keyof Pick<Submission, 'id' | 'projectTitle' | 'userName' | 'department' | 'submittedAt' | 'status'>;


const statusTranslations: Record<UserStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};

const roleTranslations: Record<User['role'], string> = {
    Admin: "አስተዳዳሪ",
    Approver: "አጽዳቂ",
}

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
        defaultValues: { name: "", email: "", password: "", confirmPassword: "", role: "Approver" }
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
                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                            <FormItem><FormLabel>የይለፍ ቃል ያረጋግጡ</FormLabel><FormControl><Input type="password" placeholder="የይለፍ ቃል እንደገና ያስገቡ" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem><FormLabel>ሚና</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="ሚና ይምረጡ" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Approver">{roleTranslations['Approver']}</SelectItem>
                                        <SelectItem value="Admin">{roleTranslations['Admin']}</SelectItem>
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

const TablePagination = ({
    itemCount,
    itemsPerPage,
    currentPage,
    onPreviousPage,
    onNextPage
}: {
    itemCount: number,
    itemsPerPage: number,
    currentPage: number,
    onPreviousPage: () => void,
    onNextPage: () => void
}) => {
    const totalPages = Math.ceil(itemCount / itemsPerPage);
    if (totalPages <= 1) return null;
    
    return (
        <CardFooter className="flex items-center justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
                ከ <strong>{itemCount}</strong> ውስጥ <strong>{Math.min((currentPage - 1) * itemsPerPage + 1, itemCount)}-{Math.min(currentPage * itemsPerPage, itemCount)}</strong> በማሳየት ላይ
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onPreviousPage} disabled={currentPage === 1}>የቀድሞ</Button>
                <Button variant="outline" size="sm" onClick={onNextPage} disabled={currentPage === totalPages}>ቀጣይ</Button>
            </div>
        </CardFooter>
    )
}

export function AdminDashboard({ 
    users, 
    submissions,
    currentUser, 
    onUpdateUserStatus, 
    onDeleteUser, 
    onAddUser, 
    onApprovePasswordReset, 
    onRejectPasswordReset,
    onViewSubmission,
    onUpdateSubmissionStatus,
    onDeleteSubmission
}: AdminDashboardProps) {

  const ITEMS_PER_PAGE = 5;

  // --- State for "Requests" tab ---
  const [requestsSearchTerm, setRequestsSearchTerm] = React.useState("");
  const [requestsCurrentPage, setRequestsCurrentPage] = React.useState(1);
  const [requestsSortConfig, setRequestsSortConfig] = React.useState<{ key: SortableUserColumn; direction: 'ascending' | 'descending' }>({
    key: 'createdAt',
    direction: 'descending',
  });
  const [passwordResetRequestsSearchTerm, setPasswordResetRequestsSearchTerm] = React.useState("");
  const [passwordResetRequestsCurrentPage, setPasswordResetRequestsCurrentPage] = React.useState(1);
  const [passwordResetRequestsSortConfig, setPasswordResetRequestsSortConfig] = React.useState<{ key: SortableUserColumn; direction: 'ascending' | 'descending' }>({
    key: 'createdAt',
    direction: 'descending',
  });


  // --- State for "All Users" tab ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<User['role'] | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | "all">("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableUserColumn; direction: 'ascending' | 'descending' }>({
    key: 'createdAt',
    direction: 'descending',
  });
  
  // --- State for "Submissions" tab ---
  const [submissionsSearchTerm, setSubmissionsSearchTerm] = React.useState("");
  const [submissionsStatusFilter, setSubmissionsStatusFilter] = React.useState<SubmissionStatus | "all">("all");
  const [submissionsCurrentPage, setSubmissionsCurrentPage] = React.useState(1);
  const [submissionsSortConfig, setSubmissionsSortConfig] = React.useState<{ key: SortableSubmissionColumn; direction: 'ascending' | 'descending' }>({
    key: 'submittedAt',
    direction: 'descending',
  });

  const genericUserSort = (items: User[], config: typeof sortConfig) => {
    const sortableItems = [...items];
    sortableItems.sort((a, b) => {
      const aValue = a[config.key];
      const bValue = b[config.key];

      if (['createdAt', 'statusUpdatedAt'].includes(config.key)) {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          if (dateA < dateB) return config.direction === 'ascending' ? -1 : 1;
          if (dateA > dateB) return config.direction === 'ascending' ? 1 : -1;
          return 0;
      }

      if (aValue < bValue) return config.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }

  const genericSubmissionSort = (items: Submission[], config: typeof submissionsSortConfig) => {
    const sortableItems = [...items];
    sortableItems.sort((a, b) => {
      const aValue = a[config.key];
      const bValue = b[config.key];

      if (config.key === 'submittedAt') {
          const dateA = new Date(aValue).getTime();
          const dateB = new Date(bValue).getTime();
          if (dateA < dateB) return config.direction === 'ascending' ? -1 : 1;
          if (dateA > dateB) return config.direction === 'ascending' ? 1 : -1;
          return 0;
      }

      if (aValue < bValue) return config.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return config.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sortableItems;
  }
  
  // --- Memoized data for "Requests" tab ---
  const pendingRegistrations = React.useMemo(() => users.filter(u => u.status === 'Pending'), [users]);
  const filteredPendingUsers = React.useMemo(() => {
    return pendingRegistrations
      .filter((user) =>
        user.name.toLowerCase().includes(requestsSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(requestsSearchTerm.toLowerCase())
      );
  }, [pendingRegistrations, requestsSearchTerm]);
  const sortedPendingUsers = React.useMemo(() => genericUserSort(filteredPendingUsers, requestsSortConfig), [filteredPendingUsers, requestsSortConfig]);
  const paginatedPendingUsers = sortedPendingUsers.slice((requestsCurrentPage - 1) * ITEMS_PER_PAGE, requestsCurrentPage * ITEMS_PER_PAGE);

  const passwordResetRequests = React.useMemo(() => users.filter(u => u.passwordResetStatus === 'Pending'), [users]);
  const filteredPasswordResetRequests = React.useMemo(() => {
    return passwordResetRequests
      .filter((user) =>
        user.name.toLowerCase().includes(passwordResetRequestsSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(passwordResetRequestsSearchTerm.toLowerCase())
      );
  }, [passwordResetRequests, passwordResetRequestsSearchTerm]);
  const sortedPasswordResetRequests = React.useMemo(() => genericUserSort(filteredPasswordResetRequests, passwordResetRequestsSortConfig), [filteredPasswordResetRequests, passwordResetRequestsSortConfig]);
  const paginatedPasswordResetRequests = sortedPasswordResetRequests.slice((passwordResetRequestsCurrentPage - 1) * ITEMS_PER_PAGE, passwordResetRequestsCurrentPage * ITEMS_PER_PAGE);


  // --- Memoized data for "All Users" tab ---
  const filteredUsers = React.useMemo(() => {
    return users
      .filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((user) => roleFilter === "all" ? true : user.role === roleFilter)
      .filter((user) => statusFilter === "all" ? true : user.status === statusFilter);
  }, [users, searchTerm, roleFilter, statusFilter]);
  const sortedUsers = React.useMemo(() => genericUserSort(filteredUsers, sortConfig), [filteredUsers, sortConfig]);
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Memoized data for "Submissions" tab ---
    const filteredSubmissions = React.useMemo(() => {
        return (submissions || [])
            .filter((sub) =>
                sub.projectTitle.toLowerCase().includes(submissionsSearchTerm.toLowerCase()) ||
                sub.id.toLowerCase().includes(submissionsSearchTerm.toLowerCase()) ||
                sub.userName.toLowerCase().includes(submissionsSearchTerm.toLowerCase())
            )
            .filter((sub) => submissionsStatusFilter === "all" ? true : sub.status === submissionsStatusFilter);
    }, [submissions, submissionsSearchTerm, submissionsStatusFilter]);

  const sortedSubmissions = React.useMemo(() => genericSubmissionSort(filteredSubmissions, submissionsSortConfig), [filteredSubmissions, submissionsSortConfig]);
  const paginatedSubmissions = sortedSubmissions.slice((submissionsCurrentPage - 1) * ITEMS_PER_PAGE, submissionsCurrentPage * ITEMS_PER_PAGE);


  // --- Generic sort request handler ---
  const createUserSortRequestHandler = (
    config: typeof sortConfig,
    setConfig: React.Dispatch<React.SetStateAction<typeof sortConfig>>
  ) => (key: SortableUserColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (config && config.key === key && config.direction === 'ascending') {
      direction = 'descending';
    }
    setConfig({ key, direction });
  };
   const createSubmissionSortRequestHandler = (
    config: typeof submissionsSortConfig,
    setConfig: React.Dispatch<React.SetStateAction<typeof submissionsSortConfig>>
  ) => (key: SortableSubmissionColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (config && config.key === key && config.direction === 'ascending') {
      direction = 'descending';
    }
    setConfig({ key, direction });
  };
  
  const requestSort = createUserSortRequestHandler(sortConfig, setSortConfig);
  const requestRequestsSort = createUserSortRequestHandler(requestsSortConfig, setRequestsSortConfig);
  const requestPasswordResetSort = createUserSortRequestHandler(passwordResetRequestsSortConfig, setPasswordResetRequestsSortConfig);
  const requestSubmissionsSort = createSubmissionSortRequestHandler(submissionsSortConfig, setSubmissionsSortConfig);

  
  const getSortIcon = (columnKey: SortableUserColumn | SortableSubmissionColumn, currentConfig: any) => {
    if (!currentConfig || currentConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/70" />;
    return currentConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);
  React.useEffect(() => { setRequestsCurrentPage(1); }, [requestsSearchTerm]);
  React.useEffect(() => { setPasswordResetRequestsCurrentPage(1); }, [passwordResetRequestsSearchTerm]);
  React.useEffect(() => { setSubmissionsCurrentPage(1); }, [submissionsSearchTerm, submissionsStatusFilter]);

  
  const SortableUserHeader = ({ column, label, config, onRequestSort }: { column: SortableUserColumn, label: string, config: typeof sortConfig, onRequestSort: (key: SortableUserColumn) => void }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => onRequestSort(column)} className="px-2">
            {label}
            {getSortIcon(column, config)}
        </Button>
    </TableHead>
  );

  const SortableSubmissionHeader = ({ column, label, config, onRequestSort }: { column: SortableSubmissionColumn, label: string, config: typeof submissionsSortConfig, onRequestSort: (key: SortableSubmissionColumn) => void }) => (
    <TableHead>
        <Button variant="ghost" onClick={() => onRequestSort(column)} className="px-2">
            {label}
            {getSortIcon(column, config)}
        </Button>
    </TableHead>
  );


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
          <TabsTrigger value="submissions">ማመልከቻዎች</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>በመጠባበቅ ላይ ያሉ ምዝገባዎች</CardTitle>
                    <CardDescription>አዲስ የተጠቃሚ ምዝገባ ጥያቄዎችን አጽድቅ ወይም ውድቅ አድርግ።</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="በስም ወይም በኢሜይል ይፈልጉ..." value={requestsSearchTerm} onChange={(e) => setRequestsSearchTerm(e.target.value)} className="pl-10 w-full"/>
                        </div>
                    </div>
                   <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableUserHeader column="name" label="ስም" config={requestsSortConfig} onRequestSort={requestRequestsSort} />
                                <SortableUserHeader column="email" label="ኢሜይል" config={requestsSortConfig} onRequestSort={requestRequestsSort} />
                                <SortableUserHeader column="createdAt" label="የተጠየቀበት ቀን" config={requestsSortConfig} onRequestSort={requestRequestsSort} />
                                <TableHead className="text-right">ድርጊቶች</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPendingUsers.length > 0 ? paginatedPendingUsers.map(user => (
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
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">በመጠባበቅ ላይ ያሉ ምዝገባዎች የሉም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                   </div>
                </CardContent>
                <TablePagination itemCount={sortedPendingUsers.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={requestsCurrentPage} onPreviousPage={() => setRequestsCurrentPage(p => p - 1)} onNextPage={() => setRequestsCurrentPage(p => p + 1)} />
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎች</CardTitle>
                    <CardDescription>የአስተዳዳሪ የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎችን አጽድቅ ወይም ውድቅ አድርግ።</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="በስም ወይም በኢሜይል ይፈልጉ..." value={passwordResetRequestsSearchTerm} onChange={(e) => setPasswordResetRequestsSearchTerm(e.target.value)} className="pl-10 w-full"/>
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableUserHeader column="name" label="ስም" config={passwordResetRequestsSortConfig} onRequestSort={requestPasswordResetSort} />
                                    <SortableUserHeader column="email" label="ኢሜይል" config={passwordResetRequestsSortConfig} onRequestSort={requestPasswordResetSort} />
                                    <SortableUserHeader column="createdAt" label="የተጠየቀበት ቀን" config={passwordResetRequestsSortConfig} onRequestSort={requestPasswordResetSort} />
                                    <TableHead className="text-right">ድርጊቶች</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPasswordResetRequests.length > 0 ? paginatedPasswordResetRequests.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><DateDisplay dateString={user.statusUpdatedAt} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="outline" onClick={() => onApprovePasswordReset(user.id)} disabled={currentUser?.id === user.id}><UserCheck className="mr-2 h-4 w-4" /> አጽድቅ</Button>
                                        <Button size="sm" variant="destructive" onClick={() => onRejectPasswordReset(user.id)} disabled={currentUser?.id === user.id}><UserX className="mr-2 h-4 w-4" /> ውድቅ አድርግ</Button>
                                    </TableCell>
                                </TableRow>
                                )) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">ምንም የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄዎች የሉም።</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <TablePagination itemCount={sortedPasswordResetRequests.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={passwordResetRequestsCurrentPage} onPreviousPage={() => setPasswordResetRequestsCurrentPage(p => p - 1)} onNextPage={() => setPasswordResetRequestsCurrentPage(p => p + 1)} />
            </Card>
        </TabsContent>

        <TabsContent value="users">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>የተጠቃሚ አስተዳደር</CardTitle>
                        <CardDescription>ሁሉንም ተጠቃሚዎች ፈልግ፣ አጣራ እና አስተዳድር።</CardDescription>
                    </div>
                    <AddUserDialog onAddUser={onAddUser} />
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="በስም ወይም በኢሜይል ይፈልጉ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full"/>
                        </div>
                        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as User['role'] | "all")}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="በሚና ማጣሪያ" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ሁሉም ሚናዎች</SelectItem>
                                <SelectItem value="Admin">{roleTranslations['Admin']}</SelectItem>
                                <SelectItem value="Approver">{roleTranslations['Approver']}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | "all")}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="በሁኔታ ማጣሪያ" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ሁሉም ሁኔታዎች</SelectItem>
                                <SelectItem value="Approved">{statusTranslations['Approved']}</SelectItem>
                                <SelectItem value="Pending">{statusTranslations['Pending']}</SelectItem>
                                <SelectItem value="Rejected">{statusTranslations['Rejected']}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                   <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableUserHeader column="name" label="ስም" config={sortConfig} onRequestSort={requestSort} />
                                <SortableUserHeader column="email" label="ኢሜይል" config={sortConfig} onRequestSort={requestSort} />
                                <SortableUserHeader column="role" label="ሚና" config={sortConfig} onRequestSort={requestSort} />
                                <SortableUserHeader column="status" label="ሁኔታ" config={sortConfig} onRequestSort={requestSort} />
                                <SortableUserHeader column="createdAt" label="የተፈጠረበት ቀን" config={sortConfig} onRequestSort={requestSort} />
                                <SortableUserHeader column="statusUpdatedAt" label="ሁኔታ የዘመነው" config={sortConfig} onRequestSort={requestSort} />
                                <TableHead className="text-right">ድርጊቶች</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.length > 0 ? paginatedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'Admin' ? "default" : "secondary"}>{roleTranslations[user.role]}</Badge></TableCell>
                                    <TableCell><StatusBadge status={user.status} /></TableCell>
                                    <TableCell><DateDisplay dateString={user.createdAt} /></TableCell>
                                    <TableCell><DateDisplay dateString={user.statusUpdatedAt} /></TableCell>
                                    <TableCell className="text-right space-x-2">
                                       {currentUser?.id !== user.id && (
                                         <AlertDialog>
                                              <AlertDialogTrigger asChild><Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                              <AlertDialogContent>
                                                  <AlertDialogHeader><AlertDialogTitle>እርግጠኛ ነዎት?</AlertDialogTitle><AlertDialogDescription>ይህ ተጠቃሚውን እስከመጨረሻው ይሰርዘዋል። ይህን እርምጃ መቀልበስ አይቻልም።</AlertDialogDescription></AlertDialogHeader>
                                                  <AlertDialogFooter><AlertDialogCancel>ይቅር</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteUser(user.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">አዎ፣ ተጠቃሚውን ሰርዝ</AlertDialogAction></AlertDialogFooter>
                                              </AlertDialogContent>
                                          </AlertDialog>
                                       )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={7} className="h-24 text-center">ምንም ተጠቃሚዎች አልተገኙም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                   </div>
                </CardContent>
                <TablePagination itemCount={sortedUsers.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPreviousPage={() => setCurrentPage(p => p - 1)} onNextPage={() => setCurrentPage(p => p + 1)} />
            </Card>
        </TabsContent>

        <TabsContent value="submissions">
            <Card>
                <CardHeader>
                    <CardTitle>የማመልከቻ አስተዳደር</CardTitle>
                    <CardDescription>ሁሉንም ማመልከቻዎች ፈልግ፣ አጣራ እና አስተዳድር።</CardDescription>
                </CardHeader>
                 <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="በፕሮጀክት ርዕስ፣ ID ወይም ስም ይፈልጉ..."
                                value={submissionsSearchTerm}
                                onChange={(e) => setSubmissionsSearchTerm(e.target.value)}
                                className="pl-10 w-full"
                            />
                        </div>
                        <Select value={submissionsStatusFilter} onValueChange={(value) => setSubmissionsStatusFilter(value as SubmissionStatus | "all")}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="በሁኔታ ማጣሪያ" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ሁሉም ሁኔታዎች</SelectItem>
                                <SelectItem value="Pending">በመጠባበቅ ላይ</SelectItem>
                                <SelectItem value="Approved">ጸድቋል</SelectItem>
                                <SelectItem value="Rejected">ውድቅ ተደርጓል</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <SortableSubmissionHeader column="id" label="ID" config={submissionsSortConfig} onRequestSort={requestSubmissionsSort}/>
                                    <SortableSubmissionHeader column="projectTitle" label="የፕሮጀክት ርዕስ" config={submissionsSortConfig} onRequestSort={requestSubmissionsSort}/>
                                    <SortableSubmissionHeader column="userName" label="ያስገባው" config={submissionsSortConfig} onRequestSort={requestSubmissionsSort}/>
                                    <SortableSubmissionHeader column="submittedAt" label="የገባበት ቀን" config={submissionsSortConfig} onRequestSort={requestSubmissionsSort}/>
                                    <SortableSubmissionHeader column="status" label="ሁኔታ" config={submissionsSortConfig} onRequestSort={requestSubmissionsSort}/>
                                    <TableHead className="text-right">ድርጊቶች</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedSubmissions.length > 0 ? (
                                paginatedSubmissions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">{sub.id}</TableCell>
                                        <TableCell className="font-medium">{sub.projectTitle}</TableCell>
                                        <TableCell>{sub.userName}</TableCell>
                                        <TableCell><DateDisplay dateString={sub.submittedAt} /></TableCell>
                                        <TableCell><SubmissionStatusBadge status={sub.status} /></TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => onViewSubmission(sub.id)}>ይመልከቱ</Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild><Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader><AlertDialogTitle>እርግጠኛ ነዎት?</AlertDialogTitle><AlertDialogDescription>ይህ ማመልከቻን እስከመጨረሻው ይሰርዘዋል። ይህን እርምጃ መቀልበስ አይቻልም።</AlertDialogDescription></AlertDialogHeader>
                                                    <AlertDialogFooter><AlertDialogCancel>ይቅር</AlertDialogCancel><AlertDialogAction onClick={() => onDeleteSubmission(sub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">አዎ፣ ማመልከቻውን ሰርዝ</AlertDialogAction></AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                                ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">ምንም ማመልከቻዎች አልተገኙም።</TableCell>
                                </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                <TablePagination itemCount={sortedSubmissions.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={submissionsCurrentPage} onPreviousPage={() => setSubmissionsCurrentPage(p => p - 1)} onNextPage={() => setSubmissionsCurrentPage(p => p + 1)} />
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    