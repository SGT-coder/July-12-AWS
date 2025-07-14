
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
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await onLogin(email, password, 'Admin');
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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ኢሜይል</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">የይለፍ ቃል</Label>
              <Input
                id="password"
                type="password"
                placeholder="የይለፍ ቃል ያስገቡ"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between items-center text-sm">
                <Button variant="link" type="button" onClick={onGoToReset} className="p-0 h-auto">የይለፍ ቃል ረሱ?</Button>
                <Button variant="link" asChild type="button" className="p-0 h-auto">
                    <Link href="/admin/register">የአስተዳዳሪ መለያ ፍጠር</Link>
                </Button>
            </div>
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
