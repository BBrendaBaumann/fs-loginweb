"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Topbar from "@/components/Topbar";

type LoginRecord = {
  id: string;
  userEmail: string;
  passwordHash: string;
  loggedAt: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token leído en dashboard:", token);

    if (!token) {
      console.log("No hay token, redirigiendo...");
      router.replace("/login");
      return;
    }

    async function load() {
      try {
        console.log("Llamando a api/me con token...");
        const u = await apiFetch("/api/me"); // Asegúrate que apiFetch envíe Authorization
        console.log("Usuario recibido:", u);
        setUser(u);

        console.log("Llamando a api/login-records...");
        const recs = await apiFetch("/api/login-records");
        console.log("Registros recibidos:", recs);
        setRecords(recs || []);
      } catch (err: any) {
        console.error("Error al cargar datos del dashboard:", err);
        setError(err.message || "Error cargando datos");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router]);

  function handleLogout() {
    console.log("Cerrando sesión...");
    localStorage.removeItem("token");
    router.replace("/login");
  }

  if (loading) return <div className="p-8 text-center">Cargando dashboard...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <>
      <Topbar userName={user?.name ?? user?.email} onLogout={handleLogout} />
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">¡Bienvenido, {user?.name}!</h2>

        <section className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
          <h3 className="text-xl mb-4">Últimos registros de login</h3>
          {records.length === 0 ? (
            <p>No hay registros</p>
          ) : (
            <ul>
              {records.slice().reverse().slice(0, 10).map((r) => (
                <li key={r.id}>
                  {r.userEmail} — {r.loggedAt}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
