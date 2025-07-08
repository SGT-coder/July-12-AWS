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
                <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
                <AlertDialogDescription>
                    Please provide a reason for rejecting this submission. This will be visible to the user.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Textarea 
                placeholder="Type your comments here..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setComment('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onConfirm(comment)}>Confirm Rejection</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}


const DeletionDialog = ({ onConfirm }: { onConfirm: () => void }) => (
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the submission.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Yes, delete it
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
    hr: "Human Resources",
    finance: "Finance",
    it: "IT",
  };

  const departmentOptions = React.useMemo(() => {
      return [...new Set(submissions.map(s => s.department))];
  }, [submissions]);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Approver Dashboard</CardTitle>
        <CardDescription>
          Review and manage all submitted forms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by project title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentOptions.map(dept => (
                      <SelectItem key={dept} value={dept}>{departmentTranslations[dept] || dept}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SubmissionStatus | "all")}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Title</TableHead>
              <TableHead>Submitted By</TableHead>
              <TableHead>Department</TableHead>
              <TableHead className="hidden md:table-cell">
                Submitted At
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
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
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => onView(submission.id)}>
                            <Eye className="mr-2 h-4 w-4" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              onUpdateStatus(submission.id, "Approved")
                            }
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Approve
                          </DropdownMenuItem>

                           <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                                    Reject
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <RejectionDialog onConfirm={(comment) => onUpdateStatus(submission.id, "Rejected", comment)} />
                          </AlertDialog>

                          <DropdownMenuSeparator />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
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
                  No submissions found matching your criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      {totalPages > 1 && (
         <CardFooter className="flex items-center justify-between border-t pt-6">
            <div className="text-sm text-muted-foreground">
                Showing{' '}
                <strong>
                    {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredSubmissions.length)}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredSubmissions.length)}
                </strong>{' '}
                of <strong>{filteredSubmissions.length}</strong> submissions
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    Next
                </Button>
            </div>
        </CardFooter>
      )}
    </Card>
  );
}
