
"use client";

import * as React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

interface AdminLoginProps {
  onLogin: (email: string, password: string, role: 'Admin' | 'Approver') => Promise<boolean>;
  onBack: () => void;
  onGoToReset: () => void;
}

export function AdminLogin({ onLogin, onBack, onGoToReset }: AdminLoginProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Bypassing real credentials, the logic is handled in page.tsx
    const success = await onLogin('admin@example.com', 'admin123', 'Admin');
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">የአስተዳዳሪ መግቢያ</CardTitle>
          <CardDescription>ለመቀጠል እባክዎ የአስተዳዳሪ ምስክርነቶችዎን ያስገቡ</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <p className="text-center text-muted-foreground">
                Click the button below to access the Admin dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "ይግቡ"}
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
    </div>
  );
}
