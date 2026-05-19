// src/pages/ChooseUsername.tsx

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Navigate } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

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
 */

export default function ChooseUsername(): React.JSX.Element {
  const {
    user,
    needsUsername,
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

  const [usernameStatus, setUsernameStatus] =
    useState<UsernameStatus>("idle");

  const [usernameMessage, setUsernameMessage] =
    useState<string>("");

  const [isCheckingUsername, setIsCheckingUsername] =
    useState<boolean>(false);

  /**
   * =========================================
   * REDIRECT SAFETY
   * =========================================
   */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!needsUsername) {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * =========================================
   * NORMALIZED USERNAME
   * =========================================
   */

  const normalizedUsername = useMemo(() => {
    return username.trim().toLowerCase();
  }, [username]);

  /**
   * =========================================
   * USERNAME VALIDATION
   * =========================================
   */

  useEffect(() => {
    clearError();

    /**
     * Reset states
     */
    if (!normalizedUsername) {
      setUsernameStatus("idle");
      setUsernameMessage("");
      return;
    }

    /**
     * Basic frontend validation
     */
    if (normalizedUsername.length < 3) {
      setUsernameStatus("error");
      setUsernameMessage(
        "El nombre de usuario debe tener al menos 3 caracteres."
      );

      return;
    }

    /**
     * Debounce async validation
     */
    const timeout = setTimeout(async () => {
      try {
        setIsCheckingUsername(true);
        setUsernameStatus("checking");
        setUsernameMessage(
          "Verificando disponibilidad del nombre de usuario..."
        );

        const available = await checkUsername(
          normalizedUsername
        );

        if (available) {
          setUsernameStatus("available");
          setUsernameMessage(
            "Nombre de usuario disponible."
          );
        } else {
          setUsernameStatus("taken");
          setUsernameMessage(
            "Este nombre de usuario ya está ocupado."
          );
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
  }, [
    normalizedUsername,
    checkUsername,
    clearError,
  ]);

  /**
   * =========================================
   * FORM SUBMIT
   * =========================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    clearError();

    /**
     * Defensive validation
     */
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !normalizedUsername
    ) {
      return;
    }

    if (usernameStatus !== "available") {
      return;
    }

    const success = await createUserProfile({
      username: normalizedUsername,
      displayName: `${firstName.trim()} ${lastName.trim()}`,
    });

    /**
     * El router moverá automáticamente
     * al usuario al dashboard por cambio
     * de estado global.
     */
    if (!success) {
      return;
    }
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10">
      <section
        aria-labelledby="choose-username-title"
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl"
      >
        <header className="mb-8">
          <h1
            id="choose-username-title"
            className="text-3xl font-bold text-white"
          >
            Completa tu perfil
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-300">
            Antes de ingresar al salón colaborativo,
            necesitamos completar tu información básica.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
        >
          {/* =========================================
              FIRST NAME
          ========================================= */}

          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-slate-100"
            >
              Nombres
            </label>

            <Input
              id="firstName"
              name="firstName"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(
                event: ChangeEvent<HTMLInputElement>
              ) => setFirstName(event.target.value)}
              placeholder="Ingresa tus nombres"
              aria-required="true"
            />
          </div>

          {/* =========================================
              LAST NAME
          ========================================= */}

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-slate-100"
            >
              Apellidos
            </label>

            <Input
              id="lastName"
              name="lastName"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(
                event: ChangeEvent<HTMLInputElement>
              ) => setLastName(event.target.value)}
              placeholder="Ingresa tus apellidos"
              aria-required="true"
            />
          </div>

          {/* =========================================
              USERNAME
          ========================================= */}

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-slate-100"
            >
              Nombre de usuario
            </label>

            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(
                event: ChangeEvent<HTMLInputElement>
              ) => setUsername(event.target.value)}
              placeholder="Ej: juanserna"
              aria-required="true"
              aria-describedby="username-status"
              aria-invalid={
                usernameStatus === "taken" ||
                usernameStatus === "error"
              }
            />

            {/* =========================================
                ACCESSIBLE LIVE REGION
            ========================================= */}

            <div
              id="username-status"
              role={
                usernameStatus === "taken" ||
                usernameStatus === "error"
                  ? "alert"
                  : "status"
              }
              aria-live="polite"
              className="min-h-[24px]"
            >
              {usernameMessage && (
                <p
                  className={`text-sm ${
                    usernameStatus === "available"
                      ? "text-emerald-400"
                      : usernameStatus === "taken" ||
                          usernameStatus === "error"
                        ? "text-red-400"
                        : "text-slate-300"
                  }`}
                >
                  {usernameMessage}
                </p>
              )}
            </div>
          </div>

          {/* =========================================
              GLOBAL ERROR
          ========================================= */}

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

          {/* =========================================
              SUBMIT BUTTON
          ========================================= */}

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            aria-busy={loading}
            className="w-full"
          >
            {loading
              ? "Guardando perfil..."
              : "Completar registro"}
          </Button>
        </form>
      </section>
    </main>
  );
}

