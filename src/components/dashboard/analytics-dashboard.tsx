
"use client";

import * as React from "react";
import {
    Bar,
    BarChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Cell,
} from "recharts";

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
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import type { Submission, SubmissionStatus } from "@/lib/types";

interface AnalyticsDashboardProps {
  submissions: Submission[];
  onBack: () => void;
}

const COLORS = {
    Approved: "hsl(var(--chart-2))",
    Pending: "hsl(var(--chart-3))",
    Rejected: "hsl(var(--chart-5))",
};

const departmentTranslations: { [key: string]: string } = {
    hr: "የሰው ሃይል",
    finance: "ፋይናንስ",
    it: "የመረጃ ቴክኖሎጂ",
    // Add other departments here if needed
};

const statusTranslations: Record<SubmissionStatus, string> = {
    Approved: "ጸድቋል",
    Pending: "በመጠባበቅ ላይ",
    Rejected: "ውድቅ ተደርጓል",
};


export function AnalyticsDashboard({ submissions, onBack }: AnalyticsDashboardProps) {

  const analyticsData = React.useMemo(() => {
    const totalSubmissions = submissions.length;
    const statusCounts = submissions.reduce(
      (acc, s) => {
        acc[s.status] = (acc[s.status] || 0) + 1;
        return acc;
      },
      {} as Record<SubmissionStatus, number>
    );

    const departmentCounts = submissions.reduce(
        (acc, s) => {
          const deptName = departmentTranslations[s.department] || s.department;
          acc[deptName] = (acc[deptName] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
    );

    const statusChartData = Object.entries(statusCounts)
      .map(([status, count]) => ({
        status: statusTranslations[status as SubmissionStatus],
        count,
        fill: COLORS[status as SubmissionStatus],
      }))
      .sort((a, b) => b.count - a.count);

    const departmentChartData = Object.entries(departmentCounts)
        .map(([department, count]) => ({
            department,
            count,
        }))
        .sort((a, b) => b.count - a.count);

    return {
      totalSubmissions,
      approved: statusCounts.Approved || 0,
      pending: statusCounts.Pending || 0,
      rejected: statusCounts.Rejected || 0,
      statusChartData,
      departmentChartData,
    };
  }, [submissions]);

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                ወደ ዳሽቦርድ ተመለስ
            </Button>
            <CardTitle className="font-headline text-3xl">የሪፖርት ዳሽቦርድ</CardTitle>
       </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>ማመልከቻዎች በሁኔታ</CardTitle>
                <CardDescription>የማመልከቻዎች ስርጭት በሁኔታቸው።</CardDescription>
            </CardHeader>
            <CardContent>
                 <ChartContainer config={{}} className="mx-auto aspect-square max-h-[300px]">
                    <PieChart>
                         <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={analyticsData.statusChartData} dataKey="count" nameKey="status" innerRadius={60}>
                            {analyticsData.statusChartData.map((entry) => (
                                <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                    </PieChart>
                 </ChartContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>ማመልከቻዎች በዲፓርትመንት</CardTitle>
                <CardDescription>ከእያንዳንዱ ዲፓርትመንት የቀረቡ የማመልከቻዎች ብዛት።</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{ count: { label: "ማመልከቻዎች", color: "hsl(var(--chart-1))" } }}>
                    <BarChart data={analyticsData.departmentChartData} layout="vertical" margin={{ left: 20 }}>
                         <YAxis
                            dataKey="department"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 15)}
                        />
                        <XAxis dataKey="count" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="count" radius={5} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>

      </div>
    </div>
  );
}
