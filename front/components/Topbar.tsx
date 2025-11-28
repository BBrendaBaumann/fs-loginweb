"use client";
import React from "react";

export default function Topbar({ userName, onLogout }: { userName?: string, onLogout: ()=>void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="h4 text-var(--color-primary)">Dashboard</h1>
        <p className="text-text11 text-var(--color-gray-text)">Resumen de actividad</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-text9">{userName}</div>
        <button onClick={onLogout} className="btn-amber px-4 py-2 rounded-xl">Cerrar sesión</button>
      </div>
    </div>
  );
}
