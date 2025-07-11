
"use client";

import * as React from "react";
import { trackSubmission } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Submission } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search, MessageSquareWarning } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { DateDisplay } from "@/components/shared/date-display";

interface SubmissionTrackingProps {
  onTracked: (submission: Submission | null) => void;
  trackedSubmission: Submission | null;
  children: React.ReactNode;
}

const DescriptionListItem = ({ term, children, isMono=false }: { term: string, children: React.ReactNode, isMono?: boolean }) => (
    !children || children === '' ? null :
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 py-3">
      <dt className="font-medium text-muted-foreground">{term}</dt>
      <dd className={`md:col-span-2 ${isMono ? 'font-mono text-sm' : ''}`}>{children}</dd>
    </div>
);

export function SubmissionTracking({ onTracked, trackedSubmission, children }: SubmissionTrackingProps) {
  const [trackingId, setTrackingId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingId || !userName) {
      toast({
        title: "መረጃ ያስፈልጋል",
        description: "እባክዎ ለመፈለግ የመከታተያ መታወቂያ እና ሙሉ ስም ያስገቡ።",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setError(null);
    onTracked(null);
    const result = await trackSubmission({ trackingId, userName });
    if (result.success && result.submission) {
      onTracked(result.submission);
    } else {
      setError(result.message || "ያልታወቀ ስህተት ተፈጥሯል።");
    }
    setIsLoading(false);
  };

  const handleNewSearch = () => {
    onTracked(null);
    setTrackingId('');
    setUserName('');
    setError(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {!trackedSubmission && (
         <Card>
            <CardHeader>
            <CardTitle className="font-headline text-2xl">የማመልከቻ ሁኔታን ይከታተሉ</CardTitle>
            <CardDescription>
                የማመልከቻዎን ሁኔታ ለማየት ከዚህ በታች የመከታተያ መታወቂያዎን እና ሙሉ ስምዎን ያስገቡ።
            </CardDescription>
            </CardHeader>
            <form onSubmit={handleSearch}>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="trackingId">የመከታተያ መታወቂያ</Label>
                    <Input
                    id="trackingId"
                    placeholder="TRX-..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="userName">በማመልከቻው ላይ የተጠቀመ ሙሉ ስም</Label>
                    <Input
                        id="userName"
                        placeholder="ሙሉ ስም ያስገቡ"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading ? (
                        <Loader2 className="animate-spin mr-2" />
                        ) : (
                        <Search className="mr-2 h-5 w-5" />
                        )}
                        <span>ፈልግ</span>
                    </Button>
                </CardFooter>
            </form>
         </Card>
      )}
      
      {error && (
        <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive">ፍለጋ አልተሳካም</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
            </CardHeader>
        </Card>
      )}

      {trackedSubmission && (
        <div className="animate-in fade-in-50 space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                     <div>
                        <CardTitle>የፍለጋ ውጤት</CardTitle>
                        <CardDescription>የማመልከቻዎ ዝርዝሮች ከዚህ በታች ይታያሉ።</CardDescription>
                     </div>
                    <Button variant="outline" onClick={handleNewSearch}>አዲስ ፍለጋ ጀምር</Button>
                </CardHeader>
                <CardContent>
                   <dl className="divide-y">
                       <DescriptionListItem term="ID" isMono>{trackedSubmission.id}</DescriptionListItem>
                       <DescriptionListItem term="ሁኔታ"><StatusBadge status={trackedSubmission.status} /></DescriptionListItem>
                       <DescriptionListItem term="የገባበት ቀን"><DateDisplay dateString={trackedSubmission.submittedAt} includeTime /></DescriptionListItem>
                       <DescriptionListItem term="ለመጨረሻ ጊዜ የተሻሻለው"><DateDisplay dateString={trackedSubmission.lastModifiedAt} includeTime /></DescriptionListItem>
                   </dl>
                </CardContent>
            </Card>

            {trackedSubmission.comments && (
                <Card className="bg-amber-50 border-amber-200">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <MessageSquareWarning className="h-8 w-8 text-amber-600" />
                        <div>
                            <CardTitle className="font-headline text-amber-900">የአጽዳቂው አስተያየት</CardTitle>
                            <CardDescription className="text-amber-700">ይህንን አስተያየት መሰረት በማድረግ ማመልከቻዎን ያስተካክሉ።</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-amber-800">{trackedSubmission.comments}</p>
                    </CardContent>
                </Card>
            )}
        </div>
      )}
      
      {/* The StrategicPlanForm is passed as children */}
      {children}
    </div>
  );
}
