
"use client";

import * as React from "react";
import { trackSubmission } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Submission } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search, Edit, ArrowLeft } from "lucide-react";
import { SubmissionView } from "@/components/forms/submission-view";

interface SubmissionTrackingProps {
  onEdit: (id: string) => void;
  onBack: () => void;
}

export function SubmissionTracking({ onEdit, onBack }: SubmissionTrackingProps) {
  const [trackingId, setTrackingId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [submission, setSubmission] = React.useState<Submission | null>(null);
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
    setSubmission(null);
    const result = await trackSubmission({ trackingId, userName });
    if (result.success && result.submission) {
      setSubmission(result.submission);
    } else {
      setError(result.message || "ያልታወቀ ስህተት ተፈጥሯል።");
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
             <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  <span className="ml-2">ፈልግ</span>
                </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ተመለስ
            </Button>
          </CardFooter>
        </form>
      </Card>

      {submission && (
        <div className="animate-in fade-in-50">
          <SubmissionView submission={submission} />
          {(submission.status === "Rejected" || submission.status === "Pending") && (
            <Card className="mt-6">
                 <CardHeader>
                    <CardTitle className="font-headline">ድርጊቶች</CardTitle>
                    <CardDescription>
                       {submission.status === "Rejected" ? "ይህ ማመልከቻ ውድቅ ተደርጓል። እባክዎ አስተያየቶቹን ይከልሱ እና እንደገና ያስገቡ።" : "ይህ ማመልከቻ አሁንም በመጠባበቅ ላይ ነው። አስፈላጊ ከሆነ ለውጦችን ማድረግ ይችላሉ።"}
                    </CardDescription>
                 </CardHeader>
                 <CardContent>
                    <Button onClick={() => onEdit(submission.id)} className="w-full">
                       <Edit className="mr-2 h-4 w-4" /> አርትዕ እና እንደገና አስገባ
                    </Button>
                 </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {error && (
        <Card className="border-destructive bg-destructive/10">
            <CardHeader>
                <CardTitle className="text-destructive">ፍለጋ አልተሳካም</CardTitle>
                <CardDescription className="text-destructive/80">{error}</CardDescription>
            </CardHeader>
        </Card>
      )}

    </div>
  );
}

    
