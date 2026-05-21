// src/main.tsx

import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { SnackbarProvider } from "./context/SnackbarContext";
import { router } from "./app/router/router";
import { useAuthStore } from "./store/useAuthStore";

import "./styles/index.css";

/**
 * =========================================
 * ACCESSIBLE INITIAL LOADER
 * WCAG 2.2
 * =========================================
 */

const AccessibleLoader = (): React.JSX.Element => (
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
        La aplicación está cargando el estado de autenticación del usuario.
      </p>
    </div>
  </main>
);

/**
 * =========================================
 * APP BOOTSTRAP
 * FIX: SnackbarProvider envuelve TODO,
 * incluyendo el loader, para que el snackbar
 * esté disponible desde el primer render.
 * =========================================
 */

const AppBootstrap = (): React.JSX.Element => {
  const { initAuthListener, loading, authInitialized } = useAuthStore();

  useEffect(() => {
    initAuthListener();
  }, [initAuthListener]);

  /**
   * Muestra el loader hasta que Firebase haya
   * respondido al menos una vez (authInitialized)
   * Y el perfil haya sido consultado (loading false).
   *
   * FIX: la condición es OR — basta con que
   * cualquiera de los dos sea verdadero para esperar.
   */
  if (!authInitialized || loading) {
    return <AccessibleLoader />;
  }

  return <RouterProvider router={router} />;
};

/**
 * =========================================
 * ROOT RENDER
 * FIX: SnackbarProvider está FUERA de AppBootstrap
 * para que esté disponible en el loader también.
 * =========================================
 */
document.documentElement.classList.add("dark");
ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <React.StrictMode>
    <SnackbarProvider>
      <AppBootstrap />
    </SnackbarProvider>
  </React.StrictMode>
);