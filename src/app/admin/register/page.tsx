
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { adminAddUser, getUsers } from "@/app/client-actions";
import type { User } from "@/lib/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { adminAddUserSchema, type AdminAddUserFormValues } from "@/lib/schemas";


export default function AdminRegisterPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [adminExists, setAdminExists] = React.useState<boolean | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    async function checkAdmin() {
      try {
        const users: User[] = await getUsers();
        const existingAdmin = users.some(u => u.role === 'Admin');
        setAdminExists(existingAdmin);
      } catch (error) {
        console.error("Failed to check for admin user:", error);
        setAdminExists(false); // Assume no admin if there's an error
      }
    }
    checkAdmin();
  }, []);

  const form = useForm<AdminAddUserFormValues>({
    resolver: zodResolver(adminAddUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Admin"
    },
  });

  const onSubmit = async (data: AdminAddUserFormValues) => {
    setIsSubmitting(true);
    const result = await adminAddUser({ ...data, role: 'Admin' });
    if (result.success) {
      toast({
        title: "Admin Account Created",
        description: "You have successfully created the admin account. Please log in.",
      });
      router.push('/');
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };
  
  if (adminExists === null) {
      return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )
  }

  if (adminExists) {
    return (
        <div className="flex justify-center items-center min-h-screen bg-background p-4">
            <Alert variant="destructive" className="max-w-md">
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Admin Account Already Exists</AlertTitle>
                <AlertDescription>
                    An administrator account has already been set up. This registration page is for one-time use only. If you need to log in, please return to the homepage.
                </AlertDescription>
                <div className="mt-4">
                    <Button asChild>
                        <Link href="/">Go to Login Page</Link>
                    </Button>
                </div>
            </Alert>
        </div>
    )
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                    <UserPlus className="h-10 w-10 text-primary" />
                </div>
              <CardTitle className="font-headline text-2xl">Create Admin Account</CardTitle>
              <CardDescription>
                This is a one-time setup for the primary administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter a secure password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Admin Account
              </Button>
              <Button type="button" variant="link" asChild>
                <Link href="/">Back to Role Selection</Link>
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
