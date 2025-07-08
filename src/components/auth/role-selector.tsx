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
          Welcome to AHRI Workflow
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">
          Digitizing strategic planning for a more efficient future.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl w-full">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="items-center text-center p-8">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
              <User className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">User</CardTitle>
            <CardDescription>
              Fill and submit forms for strategic planning and activities.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-8 pb-8">
            <Button onClick={() => onSelectRole("User")} className="w-full">
              Proceed as User
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="items-center text-center p-8">
            <div className="p-4 bg-accent/10 rounded-full mb-4">
              <Shield className="h-10 w-10 text-accent" />
            </div>
            <CardTitle className="font-headline text-2xl">Approver</CardTitle>
            <CardDescription>
              Review, approve, or reject submitted forms and manage workflows.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center px-8 pb-8">
            <Button onClick={() => onSelectRole("Approver")} className="w-full" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
              Proceed as Approver
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
