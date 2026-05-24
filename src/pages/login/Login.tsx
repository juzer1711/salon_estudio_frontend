// src/pages/login/Login.tsx

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import "./Login.css";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import GoogleButton from "../../components/ui/GoogleButton";
import Input from "../../components/ui/Input";

import { useAuthStore } from "../../store/useAuthStore";
import { useSnackbar } from "../../context/SnackbarContext";
import { isValidEmail, isValidPassword, isEducationalEmail} from "../../utils/validators";


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
    }else if (!isEducationalEmail(email)) {
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
        <header style={{ marginBottom: "1.75rem" }}>
          <h1 id="login-title" className="login-header__title">
            Bienvenido de nuevo
          </h1>
          <p className="login-header__subtitle">
            Accede a Roomix y continúa tu experiencia colaborativa.
          </p>
        </header>

        {/* FORM — gap controlado por login-form, sin space-y */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>

          {error && (
            <div role="alert" aria-live="assertive" className="login-error-banner">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="login-field">
            <label htmlFor="email" className="login-field__label">
              Correo electrónico
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              aria-required="true"
              aria-describedby={emailError ? "email-error" : undefined}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p id="email-error" role="alert" aria-live="assertive"
                className="login-field__error">
                {emailError}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="login-field">
            <label htmlFor="password" className="login-field__label">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              aria-required="true"
              aria-describedby={passwordError ? "password-error" : undefined}
              aria-invalid={!!passwordError}
            />
            {passwordError && (
              <p id="password-error" role="alert" aria-live="assertive"
                className="login-field__error">
                {passwordError}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <Button type="submit" disabled={loading} aria-busy={loading}>
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </Button>

        </form>

        {/* DIVIDER */}
        <div className="login-divider" style={{ margin: "1.5rem 0" }}>
          <div className="login-divider__line" />
          <span className="login-divider__text">o continúa con</span>
          <div className="login-divider__line" />
        </div>

        {/* GOOGLE */}
        <GoogleButton
          text={loading ? "Procesando..." : "Continuar con Google"}
          onClick={handleGoogleLogin}
          disabled={loading}
        />

        {/* FOOTER */}
        <footer style={{ marginTop: "1.5rem" }}>
          <p className="login-footer">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="login-footer__link">
              Regístrate
            </Link>
          </p>
        </footer>

      </section>
    </main>
  </AuthLayout>
);
}
