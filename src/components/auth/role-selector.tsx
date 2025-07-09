
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Briefcase } from "lucide-react";

interface RoleSelectorProps {
  onSelectView: (view: 'form' | 'approver-login') => void;
}

export function RoleSelector({ onSelectView }: RoleSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center pt-16 w-full max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          ወደ አህሪ የስራ ፍሰት እንኳን በደህና መጡ
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          ለበለጠ ውጤታማነት ስትራቴጂካዊ ዕቅድን በዲጂታል መልክ ማደራጀት።
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader className="items-center text-center p-6 flex-grow">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">የህዝብ ተጠቃሚ</CardTitle>
            <CardDescription>
              የስትራቴጂክ ዕቅድ እና የሥራ እንቅስቃሴ ቅጾችን ይሙሉ እና ያስገቡ።
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-6 pb-6">
            <Button onClick={() => onSelectView("form")} className="w-full">
              እንደ ተጠቃሚ ይቀጥሉ
            </Button>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <CardHeader className="items-center text-center p-6 flex-grow">
            <div className="p-4 bg-accent/10 rounded-full mb-4">
              <Briefcase className="h-10 w-10 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl">የሰራተኛ መግቢያ</CardTitle>
            <CardDescription>
              ገምጋሚዎች እና አስተዳዳሪዎች ለመግባት እዚህ ይጫኑ።
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-6 pb-6">
            <Button onClick={() => onSelectView("approver-login")} className="w-full" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              ይግቡ
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
