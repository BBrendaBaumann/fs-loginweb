import React from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <Sidebar />
        <main className="md:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
