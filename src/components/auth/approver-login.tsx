
"use client";

import * as React from "react";
import Link from 'next/link';
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
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import type { Role } from "@/lib/types";

interface ApproverLoginProps {
  onLogin: (email: string, password: string, role: 'Admin' | 'Approver') => Promise<boolean>;
  onBack: () => void;
  onGoToRegister: () => void;
  onGoToReset: () => void;
  onGoToAdminLogin: () => void;
}

export function ApproverLogin({ onLogin, onBack, onGoToRegister, onGoToReset, onGoToAdminLogin }: ApproverLoginProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Bypassing real credentials, the logic is handled in page.tsx
    const success = await onLogin('approver@example.com', 'password', 'Approver');
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">የባለሙያ መግቢያ</CardTitle>
          <CardDescription>ለመቀጠል እባክዎ ይግቡ</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <p className="text-center text-muted-foreground">
                Click the button below to access the Approver dashboard.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "ይግቡ"}
            </Button>
             <div className="text-sm text-center">
                መለያ የለዎትም?{" "}
                <Button variant="link" type="button" onClick={onGoToRegister} className="p-0 h-auto">ይመዝገቡ</Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onGoToAdminLogin}
              className="text-muted-foreground"
            >
              <Shield className="mr-2 h-4 w-4" />
              የአስተዳዳሪ መግቢያ
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
