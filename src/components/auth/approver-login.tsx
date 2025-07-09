
"use client";

import * as React from "react";
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

interface ApproverLoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onBack: () => void;
  onGoToRegister: () => void;
  onGoToReset: () => void;
  onGoToAdminLogin: () => void;
}

export function ApproverLogin({ onLogin, onBack, onGoToRegister, onGoToReset, onGoToAdminLogin }: ApproverLoginProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await onLogin(email, password);
    if (!success) {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">የሰራተኛ መግቢያ</CardTitle>
          <CardDescription>ለመቀጠል እባክዎ ይግቡ</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">ኢሜይል</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
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
             <div className="text-sm">
                <Button variant="link" type="button" onClick={onGoToReset} className="p-0 h-auto">የይለፍ ቃል ረሱ?</Button>
            </div>
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
              variant="link"
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
