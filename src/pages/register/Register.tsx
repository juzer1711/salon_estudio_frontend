// src/pages/register/Register.tsx

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
  useMemo,
} from "react";

import { Link } from "react-router-dom";
import "./Register.css";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import GoogleButton from "../../components/ui/GoogleButton";
import Input from "../../components/ui/Input";

import { useAuthStore } from "../../store/useAuthStore";
import { useSnackbar } from "../../context/SnackbarContext";
import { isValidEmail, isValidPassword } from "../../utils/validators";

/**
 * =========================================
 * TYPES
 * =========================================
 */

type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "error";

export default function Register(): React.JSX.Element {
  const {
    registerWithEmail,
    loginWithGoogle,
    checkUsername,
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
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [firstNameError, setFirstNameError] = useState<string>("");
  const [lastNameError, setLastNameError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  const [usernameStatus, setUsernameStatus] =
    useState<UsernameStatus>("idle");

  const [usernameMessage, setUsernameMessage] =
    useState<string>("");

  const [isCheckingUsername, setIsCheckingUsername] =
    useState<boolean>(false);

  const normalizedUsername = useMemo(
    () => username.trim().toLowerCase(),
    [username]
);

  /**
   * =========================================
   * CLEANUP al montar
   * =========================================
   */

    useEffect(() => {
      clearError();

      if (!normalizedUsername) {
        setUsernameStatus("idle");
        setUsernameMessage("");
        return;
      }

      if (normalizedUsername.length < 3) {
        setUsernameStatus("error");
        setUsernameMessage(
          "El nombre de usuario debe tener al menos 3 caracteres."
        );
        return;
      }

      // Validar formato antes de consultar el backend
      if (!/^[a-zA-Z0-9_]+$/.test(normalizedUsername)) {
        setUsernameStatus("error");
        setUsernameMessage(
          "Solo se permiten letras, números y guiones bajos."
        );
        return;
      }

      const timeout = setTimeout(async () => {
        try {
          setIsCheckingUsername(true);
          setUsernameStatus("checking");
          setUsernameMessage(
            "Verificando disponibilidad del nombre de usuario..."
          );

          const available = await checkUsername(normalizedUsername);

          if (available) {
            setUsernameStatus("available");
            setUsernameMessage("Nombre de usuario disponible.");
          } else {
            setUsernameStatus("taken");
            setUsernameMessage("Este nombre de usuario ya está ocupado.");
          }
        } catch {
          setUsernameStatus("error");
          setUsernameMessage(
            "No fue posible verificar el nombre de usuario."
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }, 600);

      return () => clearTimeout(timeout);
    }, [normalizedUsername, checkUsername, clearError]);

  /**
   * =========================================
   * FIX: Reaccionar al error del store con snackbar
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
    setConfirmPasswordError("");
    setFirstNameError("");
    setLastNameError("");
    setUsernameError("");

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

    if (!confirmPassword.trim()) {
      setConfirmPasswordError(
        "Debes confirmar la contraseña."
      );
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError(
        "Las contraseñas no coinciden."
      );
      hasErrors = true;
    }

    if (!firstName.trim()) {
        setFirstNameError("Los nombres son obligatorios.");
        hasErrors = true;
      }

      if (!lastName.trim()) {
        setLastNameError("Los apellidos son obligatorios.");
        hasErrors = true;
      }

      if (!normalizedUsername) {
        setUsernameError(
          "El nombre de usuario es obligatorio."
        );
        hasErrors = true;
      }

      if (usernameStatus !== "available") {
        setUsernameError(
          "Debes elegir un nombre de usuario válido."
        );
        hasErrors = true;
      }

    if (hasErrors) return;

  await registerWithEmail(
    email.trim(),
    password,
    {
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatarUrl: "",
    }
  );
  };

  const handleGoogleRegister = async (): Promise<void> => {
    clearError();
    await loginWithGoogle().catch(() => {
      // Error ya manejado por el useEffect de state.error
    });
  };

  const isSubmitDisabled =
    loading ||
    isCheckingUsername ||
    usernameStatus !== "available" ||
    !email.trim() ||
    !password.trim() ||
    !firstName.trim() ||
    !lastName.trim() ||
    !normalizedUsername;

  /**
   * =========================================
   * RENDER
   * =========================================
   */

return (
  <AuthLayout>
    <main className="w-full">
      <section aria-labelledby="register-title" className="w-full">

        {/* HEADER */}
        <header style={{ marginBottom: "1.75rem" }}>
          <h1 id="register-title" className="register-header__title">
            Crear cuenta
          </h1>
          <p className="register-header__subtitle">
            Regístrate y únete a tu salón colaborativo en tiempo real.
          </p>
        </header>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="register-form" noValidate>

          {error && (
            <div role="alert" aria-live="assertive" className="register-error-banner">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <div className="register-field">
            <label htmlFor="email" className="register-field__label">
              Correo electrónico
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {setEmail(e.target.value)
                if (emailError) {
                    setEmailError("");
                  }
              }}
              aria-required="true"
              aria-describedby={emailError ? "email-error" : undefined}
              aria-invalid={!!emailError}
            />
            {emailError && (
              <p id="email-error" role="alert" aria-live="assertive"
                className="register-field__error">
                {emailError}
              </p>
            )}
          </div>

          {/* NOMBRES */}
          <div className="register-field">
            <label htmlFor="firstName" className="register-field__label">
              Nombres
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              placeholder="Ingresa tus nombres"
              value={firstName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {setFirstName(e.target.value)
                if (firstNameError) {
                    setFirstNameError("");
                  }
              }}
              aria-required="true"
            />
            {firstNameError && (
              <p
                role="alert"
                aria-live="assertive"
                className="register-field__error"
              >
                {firstNameError}
              </p>
            )}
          </div>

          {/* APELLIDOS */}
          <div className="register-field">
            <label htmlFor="lastName" className="register-field__label">
              Apellidos
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Ingresa tus apellidos"
              value={lastName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {setLastName(e.target.value)
                if (lastNameError) {
                    setLastNameError("");
                  }
              }}
              aria-required="true"
            />
            {lastNameError && (
              <p
                role="alert"
                aria-live="assertive"
                className="register-field__error"
              >
                {lastNameError}
              </p>
            )}
          </div>

          {/* USERNAME */}
          <div className="register-field">
            <label htmlFor="username" className="register-field__label">
              Nombre de usuario
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Ej: juanserna"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {setUsername(e.target.value)
                if (usernameError) {
                    setUsernameError("");
                  }
              }}
              aria-required="true"
              aria-describedby="username-status"
              aria-invalid={
                usernameStatus === "taken" || usernameStatus === "error"
              }
            />

            {/* LIVE REGION — accesible para lectores de pantalla */}
            <div
              id="username-status"
              role={
                usernameStatus === "taken" || usernameStatus === "error"
                  ? "alert"
                  : "status"
              }
              aria-live="polite"
              className={`register-username-status register-username-status--${usernameStatus}`}
            >
              {usernameMessage}
            </div>
          </div>

          {/* PASSWORD */}
          <div className="register-field">
            <label htmlFor="password" className="register-field__label">
              Contraseña
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Crea una contraseña segura"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>{ setPassword(e.target.value)
                if (passwordError) {
                    setPasswordError("");
                  }
              }}
              aria-required="true"
              aria-describedby={passwordError ? "password-error" : undefined}
              aria-invalid={!!passwordError}
            />
            {passwordError && (
              <p id="password-error" role="alert" aria-live="assertive"
                className="register-field__error">
                {passwordError}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="register-field">
            <label
              htmlFor="confirmPassword"
              className="register-field__label"
            >
              Confirmar contraseña
            </label>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirma tu contraseña"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>{
                setConfirmPassword(e.target.value)
                if (confirmPasswordError) {
                    setConfirmPasswordError("");
                  }
              }}
              aria-required="true"
              aria-describedby={
                confirmPasswordError
                  ? "confirm-password-error"
                  : undefined
              }
              aria-invalid={!!confirmPasswordError}
            />

            {confirmPasswordError && (
              <p
                id="confirm-password-error"
                role="alert"
                aria-live="assertive"
                className="register-field__error"
              >
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <Button type="submit" disabled={isSubmitDisabled}
            aria-busy={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </Button>

        </form>

        {/* DIVIDER */}
        <div className="register-divider" style={{ margin: "1.5rem 0" }}>
          <div className="register-divider__line" />
          <span className="register-divider__text">o continúa con</span>
          <div className="register-divider__line" />
        </div>

        {/* GOOGLE */}
        <GoogleButton
          text={loading ? "Procesando..." : "Continuar con Google"}
          onClick={handleGoogleRegister}
          disabled={loading}
        />

        {/* FOOTER */}
        <footer style={{ marginTop: "1.5rem" }}>
          <p className="register-footer">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="register-footer__link">
              Inicia sesión
            </Link>
          </p>
        </footer>

      </section>
    </main>
  </AuthLayout>
);
}