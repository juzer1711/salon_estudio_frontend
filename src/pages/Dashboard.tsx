// src/pages/Dashboard.tsx

import { useAuthStore } from "../store/useAuthStore";
import Navbar from "../components/Links";

export default function Dashboard(): React.JSX.Element {
  const { profile, user, logout, loading } = useAuthStore();

  const fullName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : "Sin nombre";

  const handleLogout = async (): Promise<void> => {
    await logout();
    // El onAuthStateChanged detecta el logout y el router
    // redirige automáticamente a /login
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <section className="mx-auto max-w-4xl">

          {/* HEADER */}
          <header className="mb-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold">
                Bienvenido a Roomix
              </h1>
              <p className="mt-2 text-slate-400">
                Tu salón colaborativo en tiempo real.
              </p>
            </div>

            {/* LOGOUT BUTTON */}
            <button
              onClick={handleLogout}
              disabled={loading}
              aria-busy={loading}
              className="
                flex-shrink-0
                rounded-xl
                border border-red-500/40
                bg-red-500/10
                px-4 py-2
                text-sm font-medium
                text-red-400
                transition
                hover:bg-red-500/20
                hover:text-red-300
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </header>

          {/* USER CARD */}
          <section
            aria-labelledby="profile-heading"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
          >
            <h2
              id="profile-heading"
              className="mb-6 text-2xl font-semibold"
            >
              Información del perfil
            </h2>

            <div className="space-y-4">

              {/* NOMBRE COMPLETO */}
              <div>
                <p className="text-sm text-slate-400">Nombre completo</p>
                <p className="text-lg font-medium">{fullName}</p>
              </div>

              {/* EMAIL */}
              <div>
                <p className="text-sm text-slate-400">Correo electrónico</p>
                <p className="text-lg font-medium">
                  {profile?.email ?? user?.email ?? "—"}
                </p>
              </div>

              {/* USERNAME */}
              <div>
                <p className="text-sm text-slate-400">Nombre de usuario</p>
                <p className="text-lg font-medium">
                  @{profile?.username ?? "—"}
                </p>
              </div>

              {/* UID */}
              <div>
                <p className="text-sm text-slate-400">UID</p>
                <p className="break-all text-sm text-slate-300">
                  {profile?.uid ?? user?.uid ?? "—"}
                </p>
              </div>

            </div>
          </section>

        </section>
      </main>
    </>
  );
}