
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import {
  updateProfileSchema,
  changePasswordSchema,
  UpdateProfileFormValues,
  ChangePasswordFormValues
} from "@/lib/schemas";
import { updateUserProfile, changeUserPassword } from "@/app/actions";

interface SettingsPageProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export function SettingsPage({ user, onUserUpdate }: SettingsPageProps) {
  const { toast } = useToast();
  const [isProfileSubmitting, setIsProfileSubmitting] = React.useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = React.useState(false);

  const profileForm = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  const passwordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handleProfileSubmit = async (data: UpdateProfileFormValues) => {
    setIsProfileSubmitting(true);
    const result = await updateUserProfile(user.id, data);
    if (result.success && result.user) {
      toast({ title: "መገለጫ ተዘምኗል", description: "የመገለጫ መረጃዎ በተሳካ ሁኔታ ተዘምኗል።" });
      onUserUpdate(result.user);
    } else {
      toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
    setIsProfileSubmitting(false);
  };

  const handlePasswordSubmit = async (data: ChangePasswordFormValues) => {
    setIsPasswordSubmitting(true);
    const result = await changeUserPassword(user.id, data);
    if (result.success) {
      toast({ title: "የይለፍ ቃል ተቀይሯል", description: "የይለፍ ቃልዎ በተሳካ ሁኔታ ተቀይሯል።" });
      passwordForm.reset();
    } else {
      toast({ title: "ስህተት", description: result.message, variant: "destructive" });
    }
    setIsPasswordSubmitting(false);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline">ቅንብሮች</h1>
        <p className="text-muted-foreground">የመለያ ዝርዝሮችዎን እና የይለፍ ቃልዎን ያስተዳድሩ።</p>
      </div>
      
      <Card>
        <Form {...profileForm}>
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <CardHeader>
              <CardTitle>የመገለጫ መረጃ</CardTitle>
              <CardDescription>የእርስዎን ስም እና የኢሜይል አድራሻ ያዘምኑ።</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ሙሉ ስም</FormLabel>
                    <FormControl>
                      <Input placeholder="ሙሉ ስም ያስገቡ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ኢሜይል</FormLabel>
                    <FormControl>
                      <Input placeholder="ኢሜይል ያስገቡ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isProfileSubmitting}>
                {isProfileSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ለውጦችን አስቀምጥ
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <CardHeader>
              <CardTitle>የይለፍ ቃል ቀይር</CardTitle>
              <CardDescription>ለተሻለ ደህንነት በየጊዜው የይለፍ ቃልዎን እንዲቀይሩ ይመከራል።</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>የድሮ የይለፍ ቃል</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>አዲስ የይለፍ ቃል</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>አዲስ የይለፍ ቃል አረጋግጥ</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                የይለፍ ቃል ቀይር
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
