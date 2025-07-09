
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
import { useToast } from "@/hooks/use-toast";

interface RegisterFormProps {
  onRegister: (data: {fullName: string, email: string, password: string}) => Promise<boolean>;
  onBack: () => void;
}

export function RegisterForm({ onRegister, onBack }: RegisterFormProps) {
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "የይለፍ ቃል አይዛመድም",
        description: "እባክዎ ሁለቱም የይለፍ ቃሎች የሚዛመዱ መሆናቸውን ያረጋግጡ።",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    const success = await onRegister({ fullName, email, password });
    if (!success) {
      setIsLoading(false);
    }
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
              <Input id="fullName" type="text" placeholder="ሙሉ ስም ያስገቡ" required value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">ኢሜይል</Label>
              <Input id="email" type="email" placeholder="ኢሜይል ያስገቡ" required value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">የይለፍ ቃል</Label>
              <Input id="password" type="password" placeholder="የይለፍ ቃል ያስገቡ" required value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">የይለፍ ቃል ያረጋግጡ</Label>
              <Input id="confirm-password" type="password" placeholder="የይለፍ ቃል እንደገና ያስገቡ" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
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
