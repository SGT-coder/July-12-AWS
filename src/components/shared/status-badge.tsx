"use client";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface StatusBadgeProps extends BadgeProps {
  status: SubmissionStatus;
}

const statusTranslations: Record<SubmissionStatus, string> = {
  Approved: "ጸድቋል",
  Pending: "በመጠባበቅ ላይ",
  Rejected: "ውድቅ ተደርጓል",
};

export function StatusBadge({ status, className, ...props }: StatusBadgeProps) {
  const statusConfig = {
    Approved: {
      variant: "default",
      className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
      icon: <CheckCircle className="mr-1.5 h-3.5 w-3.5" />,
    },
    Pending: {
      variant: "secondary",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
      icon: <Clock className="mr-1.5 h-3.5 w-3.5" />,
    },
    Rejected: {
      variant: "destructive",
      className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
      icon: <XCircle className="mr-1.5 h-3.5 w-3.5" />,
    },
  };

  const config = statusConfig[status];
  const translatedStatus = statusTranslations[status];

  return (
    <Badge
      variant={config.variant as BadgeProps["variant"]}
      className={cn("font-medium", config.className, className)}
      {...props}
    >
      {config.icon}
      {translatedStatus}
    </Badge>
  );
}
