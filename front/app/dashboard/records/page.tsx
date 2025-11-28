"use client";
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import { parseLoginDate } from "@/lib/date";

type LoginRecord = { id:string; userEmail:string; passwordHash:string; loggedAt:string; };

export default function RecordsPage() {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState("");
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(()=>{
    apiFetch("/api/login-records").then((r:any)=>setRecords(r||[])).catch(console.error).finally(()=>setLoading(false));
  },[]);

  const filtered = useMemo(()=>{
    let out = records.slice().reverse();
    if (emailFilter) out = out.filter(x => x.userEmail.includes(emailFilter));
    if (fromFilter) {
      const from = parseLoginDate(fromFilter);
      if (from) out = out.filter(x => { const d = parseLoginDate(x.loggedAt); return d ? d >= from : false; });
    }
    if (toFilter) {
      const to = parseLoginDate(toFilter);
      if (to) out = out.filter(x => { const d = parseLoginDate(x.loggedAt); return d ? d <= to : false; });
    }
    return out;
  },[records,emailFilter,fromFilter,toFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page-1)*perPage, page*perPage);

  function exportCSV() {
    const header = ["email","passwordHash","loggedAt"];
    const rows = filtered.map(r => [r.userEmail, `"${r.passwordHash}"`, r.loggedAt]);
    const csv = [header.join(","), ...rows.map(r=>r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login-records-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="p-8 text-center">Cargando registros...</div>;

  return (
    <div className="min-h-screen bg-[var(--color-fondo-claro)] p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        <Sidebar />
        <main className="md:col-span-3">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-[var(--color-fondo-suave)]">
            <h3 className="text-h5 mb-4 text-[var(--color-primary)]">Registros de login</h3>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input value={emailFilter} onChange={(e)=>setEmailFilter(e.target.value)} placeholder="Filtrar por email" className="flex-1 px-3 py-2 border rounded-xl"/>
              <input value={fromFilter} onChange={(e)=>setFromFilter(e.target.value)} placeholder="Desde dd/mm/yyyy - hh:mm" className="px-3 py-2 border rounded-xl"/>
              <input value={toFilter} onChange={(e)=>setToFilter(e.target.value)} placeholder="Hasta dd/mm/yyyy - hh:mm" className="px-3 py-2 border rounded-xl"/>
              <button onClick={exportCSV} className="btn-amber px-4 py-2 rounded-xl">Exportar CSV</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-[var(--color-fondo-suave)]">
                    <th className="py-2 px-3 text-left">Email</th>
                    <th className="py-2 px-3 text-left">Hash</th>
                    <th className="py-2 px-3 text-left">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map(r=>(
                    <tr key={r.id} className="border-b">
                      <td className="py-2 px-3 text-text9">{r.userEmail}</td>
                      <td className="py-2 px-3 text-text9 truncate max-w-xs">{r.passwordHash}</td>
                      <td className="py-2 px-3 text-text9">{r.loggedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-text11">Página {page} de {totalPages} — {filtered.length} registros</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-1 border rounded" disabled={page===1}>Anterior</button>
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} className="px-3 py-1 border rounded" disabled={page===totalPages}>Siguiente</button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
