"use client";

import { StrategicPlanForm } from "@/components/forms/strategic-plan-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-in fade-in duration-500">
          <StrategicPlanForm />
        </div>
      </main>
    </div>
  );
}
