"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Shield } from "lucide-react";
import type { Role } from "@/lib/types";

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

export function RoleSelector({ onSelectRole }: RoleSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          ወደ AHRI Workflow እንኳን በደህና መጡ
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          ለበለጠ ውጤታማነት ስትራቴጂካዊ ዕቅድን በዲጂታል መልክ ማደራጀት።
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="items-center text-center p-8">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">ተጠቃሚ</CardTitle>
            <CardDescription>
              የስትራቴጂክ ዕቅድ እና የሥራ እንቅስቃሴ ቅጾችን ይሙሉ እና ያስገቡ።
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-8 pb-8">
            <Button onClick={() => onSelectRole("User")} className="w-full">
              እንደ ተጠቃሚ ይቀጥሉ
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="items-center text-center p-8">
            <div className="p-4 bg-accent/10 rounded-full mb-4">
              <Shield className="h-10 w-10 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl">አጽዳቂ</CardTitle>
            <CardDescription>
              የገቡ ቅጾችን ይገምግሙ፣ ያጽድቁ ወይም ውድቅ ያድርጉ እና የሥራ ሂደቶችን ያስተዳድሩ።
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-8 pb-8">
            <Button onClick={() => onSelectRole("Approver")} className="w-full" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              እንደ አጽዳቂ ይቀጥሉ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
