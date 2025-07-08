"use client";

import * as React from "react";
import {
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
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

export function ApproverDashboard({
  submissions,
  onView,
  onUpdateStatus,
  onDelete,
}: ApproverDashboardProps) {
  const [rejectionComment, setRejectionComment] = React.useState("");

  const handleReject = (submissionId: string) => {
    onUpdateStatus(submissionId, "Rejected", rejectionComment);
    setRejectionComment("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Approver Dashboard</CardTitle>
        <CardDescription>
          Review and manage all submitted forms.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            {submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.projectTitle}
                  </TableCell>
                  <TableCell>{submission.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{submission.department}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <DateDisplay dateString={submission.submittedAt} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
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
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <XCircle className="mr-2 h-4 w-4 text-orange-500" />
                              Reject
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>

                       {/* Rejection Dialog */}
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Reject Submission?</AlertDialogTitle>
                           <AlertDialogDescription>
                             Please provide a reason for rejecting this submission. This will be visible to the user.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <Textarea 
                           placeholder="Type your comments here..."
                           value={rejectionComment}
                           onChange={(e) => setRejectionComment(e.target.value)}
                         />
                         <AlertDialogFooter>
                           <AlertDialogCancel onClick={() => setRejectionComment('')}>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleReject(submission.id)}>Confirm Rejection</AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>

                       {/* Deletion Dialog */}
                       <AlertDialogContent>
                          <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the submission.
                              </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(submission.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Yes, delete it
                              </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>

                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <FileWarning className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  No submissions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
