"use client";

import React, { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

export const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    setChecking(false);
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center">Comprobando autenticación...</div>;
  }

  return <>{children}</>;
};

export default ProtectedLayout;
