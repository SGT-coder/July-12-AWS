
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
import { Loader2 } from "lucide-react";

interface ResetPasswordFormProps {
  onReset: (data: { fullName: string; email: string }) => Promise<boolean>;
  onBack: () => void;
  isSubmitting: boolean;
}

export function ResetPasswordForm({ onReset, onBack, isSubmitting }: ResetPasswordFormProps) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onReset({ fullName, email });
    if (success) {
      // Parent will show dialog, we just clear the form
      setFullName("");
      setEmail("");
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">የይለፍ ቃል ዳግም ያስጀምሩ</CardTitle>
          <CardDescription>
            የይለፍ ቃልዎን ዳግም ለማስጀመር ጥያቄ ለማስገባት እባክዎ ሙሉ ስምዎን እና የኢሜይል አድራሻዎን ያስገቡ። ጥያቄዎ በአስተዳዳሪ ይገመገማል።
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ሙሉ ስም</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="ሙሉ ስም ያስገቡ"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ኢሜይል</Label>
              <Input
                id="email"
                type="email"
                placeholder="ኢሜይል ያስገቡ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : "የዳግም ማስጀመሪያ ጥያቄ ላክ"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={onBack}
            >
              ወደ መግቢያ ገጽ ተመለስ
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
