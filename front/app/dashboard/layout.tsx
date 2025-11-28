import React from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-var(--color-fondo-claro) p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <Sidebar userName={undefined} />
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
