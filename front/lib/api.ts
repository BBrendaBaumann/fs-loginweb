export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(path, { ...options, headers, cache: "no-store" });

  console.log("apiFetch headers enviados:", headers);

  if (res.status === 401) {
    console.log("apiFetch 401, borrando token y redirigiendo...");
    localStorage.removeItem("token");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const data = await res.json(); msg = data?.message ?? msg; } catch {}
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return null;

  return res.json();
}
