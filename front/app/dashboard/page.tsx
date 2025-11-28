// front/app/dashboard/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Topbar from "@/components/Topbar";
import { formatLoginDateISO } from "@/lib/date";

type LoginRecord = {
  id: string;
  userEmail: string;
  passwordHash: string;
  loggedAt: string; // dd/mm/yyyy - hh:mm
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const u = await apiFetch("/api/me");
        setUser(u);
        const recs = await apiFetch("/api/login-records");
        setRecords(recs || []);
      } catch (err: any) {
        setError(err.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogout() {
    // clear cookie and redirect
    fetch("/api/clear-token", { method: "POST" }).finally(()=>window.location.href="/login");
  }

  if (loading) return <div className="p-8 text-center text7">Cargando dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <>
      <Topbar userName={user?.name ?? user?.email} onLogout={handleLogout} />

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl shadow gift-event-card">
          <h3 className="text-text10 text-[var(--color-gray-text)]">Usuarios totales</h3>
          <p className="text-h5 font-bold">—</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow gift-event-card">
          <h3 className="text-text10 text-[var(--color-gray-text)]">Registros</h3>
          <p className="text-h5 font-bold">{records.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow gift-event-card">
          <h3 className="text-text10 text-[var(--color-gray-text)]">Último acceso</h3>
          <p className="text-h5 font-bold">{records.length ? records[records.length-1].loggedAt : "—"}</p>
        </div>
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-xl border border-[var(--color-fondo-suave)]">
        <h3 className="text-h5 mb-4 text-[var(--color-primary)]">Últimos registros</h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-[var(--color-fondo-suave)]">
                <th className="py-2 px-3 text-text11">Email</th>
                <th className="py-2 px-3 text-text11">Hash</th>
                <th className="py-2 px-3 text-text11">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              {records.slice().reverse().slice(0, 10).map(r => (
                <tr key={r.id} className="border-b">
                  <td className="py-3 px-3 text-text9">{r.userEmail}</td>
                  <td className="py-3 px-3 text-text9 truncate max-w-xs">{r.passwordHash}</td>
                  <td className="py-3 px-3 text-text9">{r.loggedAt}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-4 px-3 text-center text-text10 text-gray-500">No hay registros</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
