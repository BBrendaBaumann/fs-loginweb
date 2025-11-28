"use client";

import React from "react";
import { Login } from "../app/Images/Illustration";

export const LoginLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="flex h-screen">
    <div className="hidden md:flex justify-center items-center bg-(--color-fondo-suave) md:w-1/2">
      <Login className="w-96 h-96 animate-fade-in" />
    </div>

    <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 w-full md:w-1/2">
      <div className="mx-auto w-full max-w-md">{children}</div>
    </div>
  </div>
);

export default LoginLayout;
