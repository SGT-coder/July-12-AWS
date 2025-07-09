
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { User, Submission } from "@/lib/types";
import { LogOut, Settings, Bell, User as UserIcon, FileText, KeyRound, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onGoToSettings: () => void;
  onBack?: () => void;
  onNavigateToAnalytics?: () => void;
  notificationCount?: number;
  pendingUsers?: User[];
  pendingPasswordResets?: User[];
  pendingSubmissions?: Submission[];
  onNotificationClick: (view: 'admin-dashboard' | 'dashboard') => void;
}

const roleTranslations: Record<User['role'], string> = {
    Admin: "አስተዳዳሪ",
    Approver: "አጽዳቂ",
};

export function AppHeader({ 
    user, 
    onLogout, 
    onGoToSettings, 
    onBack, 
    onNavigateToAnalytics,
    notificationCount, 
    pendingUsers, 
    pendingPasswordResets, 
    pendingSubmissions, 
    onNotificationClick 
}: HeaderProps) {
  const [logoError, setLogoError] = React.useState(false);
  
  const getInitials = (name: string) => {
    if (!name) return "";
    const names = name.split(' ');
    const initials = names.map(n => n[0]).join('');
    return initials.toUpperCase().slice(0, 2);
  }

  const handleAdminNotificationClick = () => {
    onNotificationClick('admin-dashboard');
  }

  const handleApproverNotificationClick = () => {
    onNotificationClick('dashboard');
  }

  return (
    <header className="bg-card/80 border-b backdrop-blur-sm sticky top-0 z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {onBack && (
                <Button variant="ghost" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-5 w-5" />
                    <span className="sr-only">ተመለስ</span>
                </Button>
            )}
             {logoError ? (
                <span className="font-headline text-lg font-bold">አህሪ የስራ ፍሰት</span>
             ) : (
                <Image
                  src="https://ahri.gov.et/wp-content/uploads/2022/08/AHRI-UPDATED-LOGO1.jpg"
                  alt="አህሪ የስራ ፍሰት"
                  width={140}
                  height={56}
                  className="h-14 w-auto object-contain"
                  onError={() => setLogoError(true)}
                  priority
                />
             )}
          </div>
          {user && (
            <div className="flex items-center gap-2 sm:gap-4">
              {user.role === 'Approver' && onNavigateToAnalytics && (
                  <Button variant="ghost" onClick={onNavigateToAnalytics}>
                    የትንታኔ ገጽ
                  </Button>
              )}
              {(user.role === 'Admin' || user.role === 'Approver') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <Bell className="h-5 w-5" />
                      {notificationCount && notificationCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {notificationCount}
                        </span>
                      )}
                      <span className="sr-only">ማሳወቂያዎችን ቀይር</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80" align="end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">ማሳወቂያዎች</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'Admin' && (
                      <>
                        {pendingUsers && pendingUsers.length > 0 && pendingUsers.map(pu => (
                            <DropdownMenuItem key={`user-${pu.id}`} onSelect={handleAdminNotificationClick} className="cursor-pointer">
                              <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium">{pu.name}</p>
                                <p className="text-xs text-muted-foreground">አዲስ የተጠቃሚ ምዝገባ ጥያቄ</p>
                              </div>
                            </DropdownMenuItem>
                        ))}
                        {pendingPasswordResets && pendingPasswordResets.length > 0 && pendingPasswordResets.map(pr => (
                            <DropdownMenuItem key={`pw-${pr.id}`} onSelect={handleAdminNotificationClick} className="cursor-pointer">
                                <KeyRound className="mr-2 h-4 w-4 text-orange-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{pr.name}</p>
                                    <p className="text-xs text-muted-foreground">የይለፍ ቃል ዳግም ማስጀመሪያ ጥያቄ</p>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        {(notificationCount === 0) && (
                            <DropdownMenuItem disabled>ምንም አዲስ ማሳወቂያዎች የሉም።</DropdownMenuItem>
                        )}
                      </>
                    )}
                     {user.role === 'Approver' && (
                      <>
                        {pendingSubmissions && pendingSubmissions.length > 0 ? (
                          pendingSubmissions.map(ps => (
                            <DropdownMenuItem key={ps.id} onSelect={handleApproverNotificationClick} className="cursor-pointer">
                              <FileText className="mr-2 h-4 w-4 text-green-500" />
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{ps.projectTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  በ <span className="font-semibold">{ps.userName}</span> የቀረበ
                                </p>
                              </div>
                            </DropdownMenuItem>
                          ))
                        ) : (
                           <DropdownMenuItem disabled>ምንም አዲስ ማመልከቻዎች የሉም።</DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                       <p className="text-xs leading-none text-muted-foreground pt-1">
                        ({roleTranslations[user.role]})
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onGoToSettings}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>ቅንብሮች</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>ውጣ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
