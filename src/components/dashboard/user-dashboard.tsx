"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FilePlus, Edit, Eye, FileWarning } from "lucide-react";
import type { Submission } from "@/lib/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateDisplay } from "@/components/shared/date-display";

interface UserDashboardProps {
  submissions: Submission[];
  onCreateNew: () => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
}

export function UserDashboard({
  submissions,
  onCreateNew,
  onView,
  onEdit,
}: UserDashboardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline">My Submissions</CardTitle>
          <CardDescription>
            Track the status of your strategic planning forms.
          </CardDescription>
        </div>
        <Button onClick={onCreateNew}>
          <FilePlus className="mr-2 h-4 w-4" />
          New Submission
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Title</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead>Last Updated</TableHead>
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
                  <TableCell>
                    <DateDisplay dateString={submission.submittedAt} />
                  </TableCell>
                  <TableCell>
                    <DateDisplay dateString={submission.lastModifiedAt} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => onView(submission.id)} aria-label="View">
                       <Eye className="h-4 w-4" />
                     </Button>
                    {submission.status === 'Rejected' && (
                       <Button variant="ghost" size="icon" onClick={() => onEdit(submission.id)} aria-label="Edit">
                         <Edit className="h-4 w-4" />
                       </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                 <TableCell colSpan={5} className="h-48 text-center">
                   <div className="flex flex-col items-center gap-4">
                     <FileWarning className="mx-auto h-12 w-12 text-muted-foreground" />
                     <h3 className="text-xl font-semibold">No submissions yet</h3>
                     <p className="text-muted-foreground">Click the button below to create your first submission.</p>
                     <Button onClick={onCreateNew}>
                       <FilePlus className="mr-2 h-4 w-4" />
                       Create New Submission
                     </Button>
                   </div>
                 </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
