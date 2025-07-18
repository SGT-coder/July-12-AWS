
"use client";

import * as React from "react";
import {
    Bar,
    BarChart,
    XAxis,
    YAxis,
    Cell,
    LineChart,
    Line,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, FileText, XCircle, Download, BarChart2, TrendingUp } from "lucide-react";
import type { Submission, SubmissionStatus } from "@/lib/types";

interface AnalyticsDashboardProps {
  submissions: Submission[];
}

const COLORS: Record<SubmissionStatus, string> = {
    Approved: "hsl(142.1 76.2% 36.3%)", // green-600
    Pending: "hsl(47.9 95.8% 53.1%)",  // yellow-500
    Rejected: "hsl(0 84.2% 60.2%)",   // red-500
};

const statusTranslations: Record<SubmissionStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};


export function AnalyticsDashboard({ submissions }: AnalyticsDashboardProps) {

  const analyticsData = React.useMemo(() => {
    const totalSubmissions = submissions.length;
    const statusCounts = submissions.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      },
      { Approved: 0, Pending: 0, Rejected: 0 } as Record<SubmissionStatus, number>
    );

    const departmentCounts = submissions.reduce(
        (acc, s) => {
          const deptName = s.department;
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
    );

    const quarterCounts = submissions.reduce(
        (acc, s) => {
            const quarterName = s.executionTime;
            acc[quarterName] = (acc[quarterName] || 0) + 1;
            return acc;
        }, {} as Record<string, number>
    );
    
    // --- Monthly Counts for the last 6 months ---
    const last6Months: Date[] = [];
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        last6Months.push(startOfMonth(subMonths(today, i)));
    }
    
    const monthlyCounts: Record<string, number> = last6Months.reduce((acc, month) => {
        const monthKey = format(month, 'yyyy-MM');
        acc[monthKey] = 0;
        return acc;
    }, {} as Record<string, number>);

    submissions.forEach(s => {
        try {
            const submissionMonth = startOfMonth(new Date(s.submittedAt));
            const monthKey = format(submissionMonth, 'yyyy-MM');
            if (monthKey in monthlyCounts) {
                monthlyCounts[monthKey]++;
            }
        } catch (e) { /* ignore invalid dates */ }
    });
    
    const monthlyChartData = Object.entries(monthlyCounts)
        .map(([month, count]) => ({
            month: format(new Date(month), 'MMM yy'), // For display
            rawMonth: month,
            count
        }))
        .sort((a, b) => a.rawMonth.localeCompare(b.rawMonth));


    // --- Status Chart Data ---
    const statusOrder: SubmissionStatus[] = ['Pending', 'Approved', 'Rejected'];
    const statusChartData = statusOrder.map(status => ({
        status: statusTranslations[status],
        count: statusCounts[status] || 0,
        fill: COLORS[status],
    }));

    const departmentChartData = Object.entries(departmentCounts)
        .map(([department, count]) => ({ department, count, fill: "hsl(var(--primary))" }))
        .sort((a, b) => b.count - a.count);

    const quarterChartData = Object.entries(quarterCounts)
        .map(([quarter, count]) => ({ quarter, count, fill: "hsl(var(--accent))" }))
        .sort((a,b) => a.quarter.localeCompare(b.quarter));

    return {
      totalSubmissions,
      approved: statusCounts.Approved || 0,
      pending: statusCounts.Pending || 0,
      rejected: statusCounts.Rejected || 0,
      statusChartData,
      departmentChartData,
      quarterChartData,
      monthlyChartData,
    };
  }, [submissions]);

  const handleDownloadCsv = () => {
    if (!submissions.length) return;

    const headers = [
        "ID", "የፕሮጀክት ርዕስ", "የአስገባው ስም", "ዲፓርትመንት", "ሁኔታ",
        "የገባበት ቀን", "ለመጨረሻ ጊዜ የተሻሻለው", "ግብ", "ዓላማ", "ስትራቴጂክ እርምጃ",
        "መለኪያ", "ዋና ተግባር", "የዋና ተግባር ዒላማ", "የዓላማ ክብደት", "የስትራቴጂክ እርምጃ ክብደት",
        "የመለኪያ ክብደት", "የዋና ተግባር ክብደት", "ፈጻሚ አካል", "የሚከናወንበት ጊዜ",
        "በጀት ምንጭ", "ከመንግስት በጀት በብር", "ከመንግስት በጀት ኮድ",
        "ከግራንት በጀት በብር", "ከኢስ ዲ ጂ በጀት በብር", "አስተያየቶች"
    ];

    const escapeCsvCell = (cell: any): string => {
        const cellStr = String(cell ?? '');
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
    };

    const rows = submissions.map(s => [
        s.id, s.projectTitle, s.userName, s.department, statusTranslations[s.status],
        format(new Date(s.submittedAt), 'yyyy-MM-dd HH:mm'), format(new Date(s.lastModifiedAt), 'yyyy-MM-dd HH:mm'),
        s.goal, s.objective, s.strategicAction, s.metric, s.mainTask, s.mainTaskTarget,
        s.objectiveWeight, s.strategicActionWeight, s.metricWeight, s.mainTaskWeight,
        s.executingBody, s.executionTime, s.budgetSource,
        s.governmentBudgetAmount, s.governmentBudgetCode, s.grantBudgetAmount, s.sdgBudgetAmount,
        s.comments
    ].map(escapeCsvCell).join(','));

    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `የአህሪ_ማመልከቻ_ሪፖርት_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-8">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <CardTitle className="font-headline text-3xl">የሪፖርት ዳሽቦርድ</CardTitle>
                <CardDescription>የማመልከቻ ውሂብ ትንተና እና ግንዛቤዎች።</CardDescription>
            </div>
            <Button onClick={handleDownloadCsv}>
                <Download className="mr-2 h-4 w-4" />
                CSV አውርድ
            </Button>
       </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ጠቅላላ ማመልከቻዎች</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalSubmissions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">የጸደቁ</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">በመጠባበቅ ላይ ያሉ</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.pending}</div>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ውድቅ የተደረጉ</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <CardTitle>የማስረከቢያ አዝማሚያዎች በጊዜ ሂደት</CardTitle>
            </div>
            <CardDescription>ማመልከቻዎች ባለፉት 6 ወራት እንዴት እንደተለወጡ ይመልከቱ።</CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={{}} className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.monthlyChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} name="ማመልከቻዎች" />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>
      </Card>


      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-primary" />
                    <CardTitle>ዕቅዶች በሁኔታ (ባር ገበታ)</CardTitle>
                </div>
                <CardDescription>የማመልከቻዎች ስርጭት በሁኔታቸው።</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.statusChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                           <CartesianGrid strokeDasharray="3 3" />
                           <XAxis dataKey="status" />
                           <YAxis allowDecimals={false} />
                           <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                           <Bar dataKey="count" name="ብዛት">
                                {analyticsData.statusChartData.map((entry) => (
                                    <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                 </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                 <div className="flex items-center gap-2">
                    <BarChart2 className="h-6 w-6 text-primary" />
                    <CardTitle>ማመልከቻዎች በዲፓርትመንት</CardTitle>
                </div>
                <CardDescription>በዲፓርትመንት የማመልከቻዎች ብዛት።</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={analyticsData.departmentChartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis
                                dataKey="department"
                                type="category"
                                tickLine={false}
                                tickMargin={5}
                                axisLine={false}
                                tickFormatter={(value) => value.length > 20 ? `${value.slice(0, 20)}...` : value}
                                width={150}
                            />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                            <Bar dataKey="count" radius={4} name="ማመልከቻዎች" fill="hsl(var(--primary))" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
                <div className="flex items-center gap-2">
                <BarChart2 className="h-6 w-6 text-accent" />
                <CardTitle>ማመልከቻዎች በሩብ ዓመት</CardTitle>
            </div>
            <CardDescription>በሩብ ዓመት የማመልከቻዎች ብዛት።</CardDescription>
        </CardHeader>
        <CardContent>
                <ChartContainer config={{}} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.quarterChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="quarter" />
                        <YAxis allowDecimals={false} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                            <Bar dataKey="count" radius={4} name="ማመልከቻዎች" fill="hsl(var(--accent))" />
                    </BarChart>
                </ResponsiveContainer>
                </ChartContainer>
        </CardContent>
    </Card>
    </div>
  );
}
