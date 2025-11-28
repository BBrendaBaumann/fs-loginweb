"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

type LoginRecord = { id:string; userEmail:string; passwordHash:string; loggedAt:string };

export default function RecordsPage() {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/login-records")
      .then(res => res.json())
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Cargando registros...</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50 flex">
      <Sidebar />
      <main className="md:col-span-3 flex-1">
        <h2 className="text-xl font-bold mb-4">Registros de Login</h2>
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Email</th>
              <th className="p-2">Hash</th>
              <th className="p-2">Fecha/Hora</th>
            </tr>
          </thead>
          <tbody>
            {records.slice().reverse().map(r => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.userEmail}</td>
                <td className="p-2 truncate max-w-xs">{r.passwordHash}</td>
                <td className="p-2">{r.loggedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
