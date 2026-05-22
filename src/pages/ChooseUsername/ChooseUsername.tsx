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

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [firstNameError, setFirstNameError] =
    useState<string>("");

  const [lastNameError, setLastNameError] =
    useState<string>("");

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
    if (user) {
      if (user.displayName) {
        const parts = user.displayName.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    }
  }, [user]);

  useEffect(() => {
    clearError();
    setFirstNameError("");
    setLastNameError("");
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

          {/* NOMBRES */}
          <div className="choose-field">
            <label htmlFor="firstName" className="choose-field__label">
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
                className="choose-field__error"
              >
                {firstNameError}
              </p>
            )}
          </div>

          {/* APELLIDOS */}
          <div className="choose-field">
            <label htmlFor="lastName" className="choose-field__label">
              Apellidos
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              placeholder="Ingresa tus apellidos"
              value={lastName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>{ setLastName(e.target.value)
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
                className="choose-field__error"
              >
                {lastNameError}
              </p>
            )}
          </div>

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