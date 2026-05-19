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

export default function Register(): React.JSX.Element {
  const {
    registerWithEmail,
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

    await registerWithEmail(
      email.trim(),
      password
    );

    /**
     * El router interceptará automáticamente
     * y enviará al usuario a /choose-username
     * gracias al flag needsUsername.
     */
  };

  const handleGoogleRegister =
    async (): Promise<void> => {
      clearError();

      await loginWithGoogle();

      /**
       * El listener global manejará
       * automáticamente la redirección.
       */
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
          aria-labelledby="register-title"
          className="w-full"
        >
          {/* HEADER */}

          <header className="mb-8">
            <h1
              id="register-title"
              className="text-3xl font-bold text-white"
            >
              Crear cuenta
            </h1>

            <p className="mt-2 text-sm text-slate-300">
              Regístrate para acceder al salón
              colaborativo en tiempo real.
            </p>
          </header>

          {/* FORM */}

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
                autoComplete="new-password"
                placeholder="Crea una contraseña"
                value={password}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>
                ) =>
                  setPassword(event.target.value)
                }
                aria-required="true"
              />
            </div>

            {/* ERROR */}

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
                ? "Creando cuenta..."
                : "Crear cuenta"}
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
            onClick={handleGoogleRegister}
            disabled={loading}
          />

          {/* FOOTER */}

          <footer className="mt-8 text-center">
            <p className="text-sm text-slate-300">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-violet-400 transition hover:text-violet-300"
              >
                Inicia sesión
              </Link>
            </p>
          </footer>
        </section>
      </main>
    </AuthLayout>
  );
}