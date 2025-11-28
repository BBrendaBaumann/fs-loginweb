export function saveToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem("token", token);
}

export function getToken() {
  if (typeof window !== "undefined") return localStorage.getItem("token");
  return null;
}

export async function logout() {
  try {
    await fetch("/api/clear-token", { method: "POST" });
  } catch {}
  if (typeof window !== "undefined") window.location.href = "/login";
}
