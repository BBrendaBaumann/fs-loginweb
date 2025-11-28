"use client";

import { useState } from "react";
import LoginLayout from "../../components/LoginLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    await fetch("/api/set-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: data.token }),
    });

    await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "logLogin",
        payload: {
          email,
          name: data?.user?.name ?? "",
          timestamp: new Date().toISOString()
        }
      })
    });

    await fetch("/api/index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "sendEmail",
        payload: {
          to: email,
          subject: "Bienvenido",
          message: `Hola ${data?.user?.name ?? ""}, tu login se registró correctamente.`
        }
      })
    });

    alert("Login correcto!");
    window.location.href = "/dashboard";

  } catch (err) {
    console.error(err);
    setError("Error de conexión con el servidor.");
  } finally {
    setLoading(false);
  }
};


  return (
    <LoginLayout>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 space-y-4 animate-fade-in"
      >
        <h1 className="text-2xl font-semibold text-center text-(--color-primary)">
          Iniciar Sesión
        </h1>

        {error && (
          <p className="text-red-500 text-center font-medium">{error}</p>
        )}

        <div>
          <label className="block text-(--color-primary) mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none 
                       focus:ring-2 focus:ring-(--color-primary)"
            placeholder="usuario@correo.com"
            required
          />
        </div>

        <div>
          <label className="block text-(--color-primary) mb-2">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none 
                       focus:ring-2 focus:ring-(--color-primary)"
            placeholder="********"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-(--color-primary) text-white py-2 rounded-md 
                     hover:bg-(--color-primary-hover) transition disabled:opacity-70"
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </LoginLayout>
  );
}
