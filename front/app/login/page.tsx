"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginLayout from "../../components/LoginLayout";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      // toast.success(`¡Bienvenido ${data.user.name}!`);
     setTimeout(() => {
      router.push("/dashboard");
    }, 50);

    } catch (err: any) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-4 w-full max-w-md mx-auto">
        <h1 className="text-2xl font-semibold text-center">Iniciar Sesión</h1>
        {error && <p className="text-red-500 text-center">{error}</p>}

        <input type="email" placeholder="Correo electrónico" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-md"/>
        <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-md"/>
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </LoginLayout>
  );
}
