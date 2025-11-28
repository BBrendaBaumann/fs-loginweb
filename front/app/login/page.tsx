"use client";
import { useState } from "react";
import LoginLayout from "../../components/LoginLayout";
import bcrypt from "bcryptjs"; // para hash antes de enviar

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
      // Hash de la contraseña antes de enviarla
      const hashedPassword = await bcrypt.hash(password, 10);

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: hashedPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales inválidas");
        setLoading(false);
        return;
      }

      // Login exitoso
      localStorage.setItem("token", "demo-token"); // si quieres JWT en el futuro
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
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-center">Iniciar Sesión</h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md"
        >
          {loading ? "Cargando..." : "Entrar"}
        </button>
      </form>
    </LoginLayout>
  );
}
