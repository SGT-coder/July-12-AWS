
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
}

type SortableUserColumn = keyof Pick<User, 'name' | 'email' | 'role' | 'status' | 'createdAt' | 'statusUpdatedAt'>;

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

export function AdminDashboard({ users, currentUser, onUpdateUserStatus, onDeleteUser, onAddUser }: AdminDashboardProps) {

  const ITEMS_PER_PAGE = 5;

  // --- State for "All Users" tab ---
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<User['role'] | "all">("all");
  const [statusFilter, setStatusFilter] = React.useState<UserStatus | "all">("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<{ key: SortableUserColumn; direction: 'ascending' | 'descending' }>({
    key: 'createdAt',
    direction: 'descending',
  });
  
  // --- State for "History" tab ---
  const [historySearchTerm, setHistorySearchTerm] = React.useState("");
  const [historyRoleFilter, setHistoryRoleFilter] = React.useState<User['role'] | "all">("all");
  const [historyStatusFilter, setHistoryStatusFilter] = React.useState<"Approved" | "Rejected" | "all">("all");
  const [historyCurrentPage, setHistoryCurrentPage] = React.useState(1);
  const [historySortConfig, setHistorySortConfig] = React.useState<{ key: SortableUserColumn; direction: 'ascending' | 'descending' }>({
    key: 'statusUpdatedAt',
    direction: 'descending',
  });

  const pendingRegistrations = users.filter(u => u.status === 'Pending');

  const genericSort = (items: User[], config: typeof sortConfig) => {
    const sortableItems = [...items];
    if (config) {
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
    }
    return sortableItems;
  }
  
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
  
  const sortedUsers = React.useMemo(() => genericSort(filteredUsers, sortConfig), [filteredUsers, sortConfig]);
  
  const paginatedUsers = sortedUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // --- Memoized data for "History" tab ---
  const filteredHistoryUsers = React.useMemo(() => {
    return users
      .filter(u => u.status !== 'Pending')
      .filter(u => historySearchTerm ? u.name.toLowerCase().includes(historySearchTerm.toLowerCase()) || u.email.toLowerCase().includes(historySearchTerm.toLowerCase()) : true)
      .filter(u => historyRoleFilter === "all" ? true : u.role === historyRoleFilter)
      .filter(u => historyStatusFilter === "all" ? true : u.status === historyStatusFilter);
  }, [users, historySearchTerm, historyRoleFilter, historyStatusFilter]);

  const sortedHistoryUsers = React.useMemo(() => genericSort(filteredHistoryUsers, historySortConfig), [filteredHistoryUsers, historySortConfig]);
  
  const paginatedHistoryUsers = sortedHistoryUsers.slice((historyCurrentPage - 1) * ITEMS_PER_PAGE, historyCurrentPage * ITEMS_PER_PAGE);

  // --- Generic sort request handler ---
  const createSortRequestHandler = (
    config: typeof sortConfig,
    setConfig: React.Dispatch<React.SetStateAction<typeof sortConfig>>
  ) => (key: SortableUserColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (config && config.key === key && config.direction === 'ascending') {
      direction = 'descending';
    }
    setConfig({ key, direction });
  };
  
  const requestSort = createSortRequestHandler(sortConfig, setSortConfig);
  const requestHistorySort = createSortRequestHandler(historySortConfig, setHistorySortConfig);
  
  const getSortIcon = (columnKey: SortableUserColumn, currentConfig: typeof sortConfig) => {
    if (!currentConfig || currentConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/70" />;
    return currentConfig.direction === 'ascending' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  React.useEffect(() => { setCurrentPage(1); }, [searchTerm, roleFilter, statusFilter]);
  React.useEffect(() => { setHistoryCurrentPage(1); }, [historySearchTerm, historyRoleFilter, historyStatusFilter]);
  
  const SortableHeader = ({ column, label, config, onRequestSort }: { column: SortableUserColumn, label: string, config: typeof sortConfig, onRequestSort: (key: SortableUserColumn) => void }) => (
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
          <TabsTrigger value="users">ሁሉም ተጠቃሚዎች</TabsTrigger>
          <TabsTrigger value="history">ታሪክ</TabsTrigger>
        </TabsList>
        
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
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">በመጠባበቅ ላይ ያሉ ምዝገባዎች የሉም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
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
                                <SelectItem value="Admin">አስተዳዳሪ</SelectItem>
                                <SelectItem value="Approver">አጽዳቂ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as UserStatus | "all")}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="በሁኔታ ማጣሪያ" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ሁሉም ሁኔታዎች</SelectItem>
                                <SelectItem value="Approved">ጸድቋል</SelectItem>
                                <SelectItem value="Pending">በመጠባበቅ ላይ</SelectItem>
                                <SelectItem value="Rejected">ውድቅ ተደርጓል</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                   <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader column="name" label="ስም" config={sortConfig} onRequestSort={requestSort} />
                                <SortableHeader column="email" label="ኢሜይል" config={sortConfig} onRequestSort={requestSort} />
                                <SortableHeader column="role" label="ሚና" config={sortConfig} onRequestSort={requestSort} />
                                <SortableHeader column="status" label="ሁኔታ" config={sortConfig} onRequestSort={requestSort} />
                                <SortableHeader column="createdAt" label="የተፈጠረበት ቀን" config={sortConfig} onRequestSort={requestSort} />
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
                                    <TableCell className="text-right space-x-2">
                                       {currentUser?.id !== user.id && user.status !== 'Pending' && (
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
                                <TableRow><TableCell colSpan={6} className="h-24 text-center">ምንም ተጠቃሚዎች አልተገኙም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                   </div>
                </CardContent>
                <TablePagination itemCount={sortedUsers.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPreviousPage={() => setCurrentPage(p => p - 1)} onNextPage={() => setCurrentPage(p => p + 1)} />
            </Card>
        </TabsContent>

        <TabsContent value="history">
            <Card>
                <CardHeader>
                    <CardTitle>የተጠቃሚ አስተዳደር ታሪክ</CardTitle>
                    <CardDescription>የጸደቁ እና ውድቅ የተደረጉ የተጠቃሚ ምዝገባዎች መዝገብ።</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="በስም ወይም በኢሜይል ይፈልጉ..." value={historySearchTerm} onChange={(e) => setHistorySearchTerm(e.target.value)} className="pl-10 w-full"/>
                        </div>
                        <Select value={historyRoleFilter} onValueChange={(value) => setHistoryRoleFilter(value as User['role'] | "all")}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="በሚና ማጣሪያ" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ሁሉም ሚናዎች</SelectItem>
                                <SelectItem value="Admin">አስተዳዳሪ</SelectItem>
                                <SelectItem value="Approver">አጽዳቂ</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={historyStatusFilter} onValueChange={(value) => setHistoryStatusFilter(value as "Approved" | "Rejected" | "all")}>
                            <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="በሁኔታ ማጣሪያ" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">ሁሉም ሁኔታዎች</SelectItem>
                                <SelectItem value="Approved">ጸድቋል</SelectItem>
                                <SelectItem value="Rejected">ውድቅ ተደርጓል</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                   <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader column="name" label="ስም" config={historySortConfig} onRequestSort={requestHistorySort} />
                                <SortableHeader column="email" label="ኢሜይል" config={historySortConfig} onRequestSort={requestHistorySort} />
                                <SortableHeader column="role" label="ሚና" config={historySortConfig} onRequestSort={requestHistorySort} />
                                <SortableHeader column="status" label="ሁኔታ" config={historySortConfig} onRequestSort={requestHistorySort} />
                                <SortableHeader column="statusUpdatedAt" label="የተወሰነበት ቀን" config={historySortConfig} onRequestSort={requestHistorySort} />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedHistoryUsers.length > 0 ? paginatedHistoryUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell><Badge variant={user.role === 'Admin' ? "default" : "secondary"}>{roleTranslations[user.role]}</Badge></TableCell>
                                    <TableCell><StatusBadge status={user.status} /></TableCell>
                                    <TableCell><DateDisplay dateString={user.statusUpdatedAt} /></TableCell>
                                </TableRow>
                            )) : (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">ምንም የታሪክ መዝገቦች አልተገኙም።</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                   </div>
                </CardContent>
                <TablePagination itemCount={sortedHistoryUsers.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={historyCurrentPage} onPreviousPage={() => setHistoryCurrentPage(p => p - 1)} onNextPage={() => setHistoryCurrentPage(p => p + 1)} />
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
