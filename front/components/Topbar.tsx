import React from "react";

export default function Topbar({ userName, onLogout }: { userName?: string; onLogout: () => void }) {
  return (
    <div className="flex justify-between items-center mb-6 p-4 bg-white shadow rounded-2xl">
      <h1 className="text-xl font-bold">Hola, {userName || "Usuario"}</h1>
      <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
        Logout
      </button>
    </div>
  );
}
