// src/pages/login/Login.tsx

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
import { useSnackbar } from "../../context/SnackbarContext";
import { isValidEmail, isValidPassword } from "../../utils/validators";

export default function Login(): React.JSX.Element {
  const {
    loginWithEmail,
    loginWithGoogle,
    loading,
    error,
    clearError,
  } = useAuthStore();

  const { showSnackbar } = useSnackbar();

  /**
   * =========================================
   * LOCAL STATE
   * =========================================
   */

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  /**
   * =========================================
   * CLEANUP al montar
   * =========================================
   */

  useEffect(() => {
    clearError();
  }, [clearError]);

  /**
   * =========================================
   * FIX: Reaccionar al error del store con snackbar.
   * El catch de loginWithEmail ya no es necesario
   * porque el store lanza + guarda el error.
   * =========================================
   */

  useEffect(() => {
    if (error) {
      showSnackbar(error, "error");
    }
  }, [error, showSnackbar]);

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
    setEmailError("");
    setPasswordError("");

    let hasErrors = false;

    if (!email.trim()) {
      setEmailError("El correo electrónico es obligatorio.");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      setEmailError("Ingresa un correo válido.");
      hasErrors = true;
    }

    if (!password.trim()) {
      setPasswordError("La contraseña es obligatoria.");
      hasErrors = true;
    } else if (!isValidPassword(password)) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres.");
      hasErrors = true;
    }

    if (hasErrors) return;

    // El store lanza si hay error → el useEffect de arriba lo muestra.
    // Si no lanza, el onAuthStateChanged toma el control y redirige.
    await loginWithEmail(email.trim(), password).catch(() => {
      // Error ya manejado por el useEffect de state.error
    });
  };

  const handleGoogleLogin = async (): Promise<void> => {
    clearError();
    await loginWithGoogle().catch(() => {
      // Error ya manejado por el useEffect de state.error
    });
  };

  /**
   * =========================================
   * RENDER
   * =========================================
   */

  return (
    <AuthLayout>
      <main className="w-full">
        <section aria-labelledby="login-title" className="w-full">

          {/* HEADER */}
          <header className="mb-8">
            <h1
              id="login-title"
              className="text-3xl font-bold text-white"
            >
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Accede a Roomix y continúa tu experiencia colaborativa.
            </p>
          </header>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* Error global del store (visible dentro del form también) */}
            {error && (
              <p role="alert" aria-live="assertive" className="text-sm text-red-400">
                {error}
              </p>
            )}

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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                aria-required="true"
                aria-describedby={emailError ? "email-error" : undefined}
                aria-invalid={!!emailError}
              />
              {emailError && (
                <p
                  id="email-error"
                  role="alert"
                  aria-live="assertive"
                  className="text-sm text-red-300"
                >
                  {emailError}
                </p>
              )}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                aria-required="true"
                aria-describedby={passwordError ? "password-error" : undefined}
                aria-invalid={!!passwordError}
              />
              {passwordError && (
                <p
                  id="password-error"
                  role="alert"
                  aria-live="assertive"
                  className="text-sm text-red-300"
                >
                  {passwordError}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full"
            >
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* DIVIDER */}
          <div className="my-6 flex items-center">
            <div className="h-px flex-1 bg-slate-700" />
            <span className="px-3 text-sm text-slate-400">o continúa con</span>
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          {/* GOOGLE */}
          <GoogleButton
            text={loading ? "Procesando..." : "Continuar con Google"}
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