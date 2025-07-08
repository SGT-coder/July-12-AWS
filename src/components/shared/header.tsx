"use client";

import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/types";
import { LogOut, UserCircle, TestTube2 } from "lucide-react";

interface HeaderProps {
  role: Role;
  onLogout: () => void;
}

export function AppHeader({ role, onLogout }: HeaderProps) {
  return (
    <header className="bg-card/80 border-b backdrop-blur-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <TestTube2 className="h-7 w-7 text-primary" />
            <h1 className="font-headline text-2xl font-bold text-primary">
              AHRI Workflow
            </h1>
          </div>
          {role && (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
                <UserCircle className="w-5 h-5" />
                <span>
                  Role: <span className="font-semibold text-foreground">{role}</span>
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
