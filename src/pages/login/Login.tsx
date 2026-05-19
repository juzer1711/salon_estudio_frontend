import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";

import Button from "../../components/ui/Button";
import GoogleButton from "../../components/ui/GoogleButton";
import Input from "../../components/ui/Input";

import { useAuthStore } from "../../store/useAuthStore";

export default function Login(): React.JSX.Element {
  const {
    loginWithEmail,
    loginWithGoogle,
    loading,
    error,
    clearError,
  } = useAuthStore();

  /**
   * =========================================
   * LOCAL STATE
   * =========================================
   */

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] =
    useState<string>("");

  /**
   * =========================================
   * CLEANUP
   * =========================================
   */

  useEffect(() => {
    clearError();
  }, [clearError]);

  /**
   * =========================================
   * HANDLERS
   * =========================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    clearError();

    await loginWithEmail(
      email.trim(),
      password
    );
  };

  const handleGoogleLogin =
    async (): Promise<void> => {
      clearError();

      await loginWithGoogle();
    };

  /**
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <AuthLayout>
      <main className="w-full">
        <section
          aria-labelledby="login-title"
          className="w-full"
        >
          {/* =========================================
              HEADER
          ========================================= */}

          <header className="mb-8">
            <h1
              id="login-title"
              className="text-3xl font-bold text-white"
            >
              Iniciar sesión
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Accede a Roomix y continúa tu
              experiencia colaborativa.
            </p>
          </header>

          {/* =========================================
              FORM
          ========================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
            noValidate
          >
            {/* EMAIL */}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-100"
              >
                Correo electrónico
              </label>

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>
                ) =>
                  setEmail(event.target.value)
                }
                aria-required="true"
              />
            </div>

            {/* PASSWORD */}

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-100"
              >
                Contraseña
              </label>

              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>
                ) =>
                  setPassword(event.target.value)
                }
                aria-required="true"
              />
            </div>

            {/* GLOBAL ERROR */}

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="rounded-lg border border-red-500/40 bg-red-500/10 p-3"
              >
                <p className="text-sm text-red-300">
                  {error}
                </p>
              </div>
            )}

            {/* SUBMIT */}

            <Button
              type="submit"
              disabled={
                loading ||
                !email.trim() ||
                !password.trim()
              }
              aria-busy={loading}
              className="w-full"
            >
              {loading
                ? "Ingresando..."
                : "Iniciar sesión"}
            </Button>
          </form>

          {/* DIVIDER */}

          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-slate-700" />

            <span className="px-3 text-sm text-slate-400">
              o continúa con
            </span>

            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* GOOGLE */}

          <GoogleButton
            text={
              loading
                ? "Procesando..."
                : "Continuar con Google"
            }
            onClick={handleGoogleLogin}
            disabled={loading}
          />

          {/* FOOTER */}

          <footer className="mt-8 text-center">
            <p className="text-sm text-slate-300">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Regístrate
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </AuthLayout>
  );
}