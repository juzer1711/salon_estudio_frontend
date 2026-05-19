// src/main.tsx

import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import {
  RouterProvider,
} from "react-router-dom";

import { router } from "./app/router/router";

import { useAuthStore } from "./store/useAuthStore";

import "./styles/index.css";

/**
 * =========================================
 * ACCESSIBLE INITIAL LOADER
 * WCAG 2.2
 * =========================================
 */

const AccessibleLoader = (): React.JSX.Element => {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen items-center justify-center bg-slate-950 px-4"
    >
      <div className="text-center">
        <h1 className="text-xl font-semibold text-white">
          Inicializando Roomix...
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          Verificando sesión y sincronizando tu perfil.
        </p>

        <p className="sr-only">
          La aplicación está cargando el estado de
          autenticación del usuario.
        </p>
      </div>
    </main>
  );
};

/**
 * =========================================
 * AUTH PROVIDER
 * =========================================
 */

const AppBootstrap = (): React.JSX.Element => {
  const {
    initAuthListener,
    loading,
    authInitialized,
  } = useAuthStore();

  /**
   * =========================================
   * INITIALIZE GLOBAL AUTH LISTENER
   * =========================================
   */

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  /**
   * =========================================
   * INITIAL BOOT LOADER
   * =========================================
   *
   * Evita:
   * - flickering
   * - redirecciones falsas
   * - pantallas vacías
   * - problemas con lectores de pantalla
   */

  if (!authInitialized || loading) {
    return <AccessibleLoader />;
  }

  /**
   * =========================================
   * APP
   * =========================================
   */

  return <RouterProvider router={router} />;
};

/**
 * =========================================
 * ROOT RENDER
 * =========================================
 */

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <AppBootstrap />
  </React.StrictMode>
);