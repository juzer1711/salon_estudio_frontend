// src/pages/ChooseUsername.tsx

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuthStore } from "../../store/useAuthStore";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import "./ChooseUsername.css";
import AuthLayout from "../../layouts/AuthLayout";

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

/**
 * =========================================
 * COMPONENT
 * =========================================
 * Nota: los guards de navegación (user, needsUsername)
 * ya están en UsernameRoute — no se necesitan aquí.
 * =========================================
 */

export default function ChooseUsername(): React.JSX.Element {
  const {
    user,
    loading,
    error,
    checkUsername,
    createUserProfile,
    clearError,
  } = useAuthStore();

  /**
   * =========================================
   * LOCAL STATE
   * =========================================
   */

  const [username, setUsername] = useState<string>("");

  const [usernameError, setUsernameError] =
    useState<string>("");

  const [usernameStatus, setUsernameStatus] =
    useState<UsernameStatus>("idle");

  const [usernameMessage, setUsernameMessage] =
    useState<string>("");

  const [isCheckingUsername, setIsCheckingUsername] =
    useState<boolean>(false);

  /**
   * =========================================
   * NORMALIZED USERNAME
   * =========================================
   */

  const normalizedUsername = useMemo(
    () => username.trim().toLowerCase(),
    [username]
  );

  /**
   * =========================================
   * USERNAME VALIDATION con debounce
   * =========================================
   */


  useEffect(() => {
    clearError();
    setUsernameError("");

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
   * FORM SUBMIT
   * FIX: usa firstName + lastName (no displayName)
   * =========================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    clearError();

    let hasErrors = false;

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

    // Procesamos el displayName que mandó Google de forma interna y segura
    let firstName = "";
    let lastName = "";

    if (user?.displayName) {
      const parts = user.displayName.split(" ");
      firstName = parts[0] || "";
      lastName = parts.slice(1).join(" ") || "";
    }

    const googleAvatar = user?.photoURL || "";

    await createUserProfile({
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      avatarUrl: googleAvatar,
    });

    // El cambio de needsUsername: false en el store
    // hace que UsernameRoute redirija al /dashboard automáticamente.
  };

  /**
   * =========================================
   * HELPERS
   * =========================================
   */

  const isSubmitDisabled =
    loading ||
    isCheckingUsername ||
    usernameStatus !== "available" ||
    !normalizedUsername;

  /**
   * =========================================
   * RENDER
   * =========================================
   */

return (
  <AuthLayout>
    <main className="w-full">
      <section aria-labelledby="choose-username-title" className="w-full">

        {/* HEADER */}
        <header style={{ marginBottom: "1.75rem" }}>
          <h1 id="choose-username-title" className="choose-header__title">
            Completa tu perfil
          </h1>
          <p className="choose-header__subtitle">
            Antes de ingresar al salón colaborativo,
            necesitamos completar tu información básica.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="choose-form" noValidate>

          {/* ERROR GLOBAL */}
          {error && (
            <div role="alert" aria-live="assertive" className="choose-error-banner">
              {error}
            </div>
          )}

          {/* USERNAME */}
          <div className="choose-field">
            <label htmlFor="username" className="choose-field__label">
              Nombre de usuario
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Ej: juanserna"
              value={username}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>{ setUsername(e.target.value)
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
              className={`choose-username-status choose-username-status--${usernameStatus}`}
            >
              {usernameMessage}
            </div>
            {usernameError && (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="choose-field__error"
                >
                  {usernameError}
                </p>
              )}
          </div>

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            aria-busy={loading}
          >
            {loading ? "Guardando perfil..." : "Completar registro"}
          </Button>

        </form>
      </section>
    </main>
  </AuthLayout>
);
}