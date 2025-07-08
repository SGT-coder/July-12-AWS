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

interface RegisterFormProps {
  onRegister: (data: any) => void;
  onBack: () => void;
}

export function RegisterForm({ onRegister, onBack }: RegisterFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // In a real app, you would collect form data here
    onRegister({}); 
  };

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">አዲስ መለያ ይፍጠሩ</CardTitle>
          <CardDescription>ለመጀመር ዝርዝሮችዎን ይሙሉ</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">ሙሉ ስም</Label>
              <Input id="fullName" type="text" placeholder="ሙሉ ስም ያስገቡ" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ኢሜይል</Label>
              <Input id="email" type="email" placeholder="ኢሜይል ያስገቡ" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">የይለፍ ቃል</Label>
              <Input id="password" type="password" placeholder="የይለፍ ቃል ያስገቡ" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">የይለፍ ቃል ያረጋግጡ</Label>
              <Input id="confirm-password" type="password" placeholder="የይለፍ ቃል እንደገና ያስገቡ" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "ይመዝገቡ"}
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
