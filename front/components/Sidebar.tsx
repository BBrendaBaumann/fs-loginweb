import React from "react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="bg-white p-6 rounded-2xl shadow flex flex-col gap-4">
      <h2 className="text-xl font-bold mb-4">Dashboard</h2>
      <Link href="/dashboard">Inicio</Link>
      <Link href="/dashboard/records">Registros</Link>
    </aside>
  );
}
