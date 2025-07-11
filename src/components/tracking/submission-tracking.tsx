
"use client";

import * as React from "react";
import { trackSubmission } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { Submission } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Search } from "lucide-react";
import { SubmissionView } from "@/components/forms/submission-view";

interface SubmissionTrackingProps {
  onTracked: (submission: Submission | null) => void;
  trackedSubmission: Submission | null;
  children: React.ReactNode;
}

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
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">የማመልከቻ ሁኔታን ይከታተሉ</CardTitle>
          <CardDescription>
            የማመልከቻዎን ሁኔታ ለማየት ከዚህ በታች የመከታተያ መታወቂያዎን እና ሙሉ ስምዎን ያስገቡ።
          </CardDescription>
        </CardHeader>
        {!trackedSubmission && (
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
            </CardFooter>
          </form>
        )}
      </Card>
      
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
                <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>የፍለጋ ውጤት</CardTitle>
                    <Button variant="outline" onClick={handleNewSearch}>አዲስ ፍለጋ ጀምር</Button>
                </CardHeader>
                <CardContent>
                    <SubmissionView submission={trackedSubmission} />
                </CardContent>
            </Card>

            {children}
        </div>
      )}

      {!trackedSubmission && (
         <div className="animate-in fade-in-50 space-y-6">
            <Card>
                 <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center font-headline">ወይም አዲስ እቅድ ያስገቡ</CardTitle>
                 </CardHeader>
            </Card>
            {children}
         </div>
      )}


    </div>
  );
}

  