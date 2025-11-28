"use client";
import React from "react";
import Link from "next/link";

export default function Sidebar({ userName }: { userName?: string }) {
  return (
    <aside className="md:col-span-1 bg-white p-5 rounded-2xl shadow-lg border border-var(--color-primary-suave)">
      <div className="mb-6">
        <h2 className="text-h5 text-var(--color-primary)">Panel</h2>
        <p className="text-text10 text-var(--color-gray-text)">Usuario: {userName ?? "—"}</p>
      </div>

      <nav className="space-y-3">
        <Link className="block py-2 px-3 rounded-xl hover:bg-var(--color-fondo-suave) transition-all text-text9" href="/dashboard">Resumen</Link>
        <Link className="block py-2 px-3 rounded-xl hover:bg-var(--color-fondo-suave) transition-all text-text9" href="/dashboard/records">Registros</Link>
      </nav>
    </aside>
  );
}
