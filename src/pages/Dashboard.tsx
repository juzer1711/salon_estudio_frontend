import { useAuthStore } from "../store/useAuthStore";
import Navbar from '../components/Links'; 

export default function Dashboard() {
  const { profile, user } = useAuthStore();

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        {/* HEADER */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold">
            Bienvenido a Roomix
          </h1>

          <p className="mt-2 text-slate-400">
            Tu salón colaborativo en tiempo real.
          </p>
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
            <div>
              <p className="text-sm text-slate-400">
                Nombre completo
              </p>

              <p className="text-lg font-medium">
                {profile?.displayName ?? "Sin nombre"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Correo electrónico
              </p>

              <p className="text-lg font-medium">
                {profile?.email ?? user?.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                Username
              </p>

              <p className="text-lg font-medium">
                @{profile?.username}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-400">
                UID
              </p>

              <p className="break-all text-sm text-slate-300">
                {profile?.uid}
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
    </>
  );
}