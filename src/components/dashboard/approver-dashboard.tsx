
"use client";

import * as React from "react";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  FileWarning,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Submission, SubmissionStatus } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateDisplay } from "@/components/shared/date-display";

interface ApproverDashboardProps {
  submissions: Submission[];
  onView: (id: string) => void;
  onUpdateStatus: (
    id: string,
    status: SubmissionStatus,
    comments?: string
  ) => void;
  onDelete: (id: string) => void;
}

const RejectionDialog = ({ onConfirm }: { onConfirm: (comment: string) => void }) => {
    const [comment, setComment] = React.useState("");
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>ማመልከቻው ውድቅ ይደረግ?</AlertDialogTitle>
                <AlertDialogDescription>
                    እባክዎ ይህን ማመልከቻ ውድቅ ለማድረግ ምክንያት ያቅርቡ። ይህ ለተጠቃሚው የሚታይ ይሆናል።
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea 
                placeholder="አስተያየትዎን እዚህ ይጻፉ..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setComment('')}>ይቅር</AlertDialogCancel>
                <AlertDialogAction onClick={() => onConfirm(comment)}>ውድቅ ማድረጉን አረጋግጥ</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}


const DeletionDialog = ({ onConfirm }: { onConfirm: () => void }) => (
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>እርግጠኛ ነዎት?</AlertDialogTitle>
            <AlertDialogDescription>
                ይህ እርምጃ ሊቀለበስ አይችልም። ይህ ማመልከቻውን እስከመጨረሻው ይሰርዘዋል።
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>ይቅር</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                አዎ፣ ሰርዝ
            </AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
);


export function ApproverDashboard({
  submissions,
  onView,
  onUpdateStatus,
  onDelete,
}: ApproverDashboardProps) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [departmentFilter, setDepartmentFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState<SubmissionStatus | "all">("all");
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 5;

  const filteredSubmissions = React.useMemo(() => {
    return submissions
      .filter((submission) =>
        submission.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((submission) =>
        departmentFilter === "all" ? true : submission.department === departmentFilter
      )
      .filter((submission) =>
        statusFilter === "all" ? true : submission.status === statusFilter
      );
  }, [submissions, searchTerm, departmentFilter, statusFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, departmentFilter, statusFilter]);
  
  const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE);
  const paginatedSubmissions = filteredSubmissions.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
      setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const departmentTranslations: { [key: string]: string } = {
    hr: "የሰው ሃይል",
    finance: "ፋይናንስ",
    it: "የመረጃ ቴክኖሎጂ",
  };

  const departmentOptions = React.useMemo(() => {
      return [...new Set(submissions.map(s => s.department))];
  }, [submissions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">የአጽዳቂ ዳሽቦርድ</CardTitle>
        <CardDescription>
          ሁሉንም ገቢ ቅጾች ይገምግሙ እና ያስተዳድሩ።
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="በፕሮጀክት ርዕስ ይፈልጉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="በዲፓርትመንት ማጣሪያ" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">ሁሉም ዲፓርትመንቶች</SelectItem>
                    {departmentOptions.map(dept => (
                      <SelectItem key={dept} value={dept}>{departmentTranslations[dept] || dept}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SubmissionStatus | "all")}>
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>የፕሮጀክት ርዕስ</TableHead>
              <TableHead>ያስገባው</TableHead>
              <TableHead>ዲፓርትመንት</TableHead>
              <TableHead className="hidden md:table-cell">
                የገባበት ቀን
              </TableHead>
              <TableHead>ሁኔታ</TableHead>
              <TableHead>
                <span className="sr-only">ድርጊቶች</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSubmissions.length > 0 ? (
              paginatedSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.projectTitle}
                  </TableCell>
                  <TableCell>{submission.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{departmentTranslations[submission.department] || submission.department}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <DateDisplay dateString={submission.submittedAt} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">ምናሌ ቀይር</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>ድርጊቶች</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => onView(submission.id)}>
                            <Eye className="mr-2 h-4 w-4" /> ይመልከቱ
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              onUpdateStatus(submission.id, "Approved")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            አጽድቅ
                          </DropdownMenuItem>

                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                                    ውድቅ አድርግ
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <RejectionDialog onConfirm={(comment) => onUpdateStatus(submission.id, "Rejected", comment)} />
                          </AlertDialog>

                          <DropdownMenuSeparator />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> ሰርዝ
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <DeletionDialog onConfirm={() => onDelete(submission.id)} />
                          </AlertDialog>

                        </DropdownMenuContent>
                      </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <FileWarning className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  ከፍለጋዎ ጋር የሚዛመድ ማመልከቻ አልተገኘም።
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
         <CardFooter className="flex items-center justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
                ከ{' '}
                <strong>{filteredSubmissions.length}</strong> ማመልከቻዎች ውስጥ{' '}
                <strong>
                    {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSubmissions.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)}
                </strong>
                {' '}በማሳየት ላይ
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    የቀድሞ
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    ቀጣይ
                </Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
