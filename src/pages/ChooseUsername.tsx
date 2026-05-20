// src/pages/ChooseUsername.tsx

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

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
 * Nota: los guards de navegación (user, needsUsername)
 * ya están en UsernameRoute — no se necesitan aquí.
 * =========================================
 */

export default function ChooseUsername(): React.JSX.Element {
  const {
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

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !normalizedUsername ||
      usernameStatus !== "available"
    ) {
      return;
    }

    await createUserProfile({
      username: normalizedUsername,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
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

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>

          {/* NOMBRES */}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setFirstName(e.target.value)
              }
              placeholder="Ingresa tus nombres"
              aria-required="true"
            />
          </div>

          {/* APELLIDOS */}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setLastName(e.target.value)
              }
              placeholder="Ingresa tus apellidos"
              aria-required="true"
            />
          </div>

          {/* USERNAME */}
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
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setUsername(e.target.value)
              }
              placeholder="Ej: juanserna"
              aria-required="true"
              aria-describedby="username-status"
              aria-invalid={
                usernameStatus === "taken" || usernameStatus === "error"
              }
            />

            {/* LIVE REGION accesible para lectores de pantalla */}
            <div
              id="username-status"
              role={
                usernameStatus === "taken" || usernameStatus === "error"
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

          {/* ERROR GLOBAL del store */}
          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-lg border border-red-500/40 bg-red-500/10 p-3"
            >
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* SUBMIT */}
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            aria-busy={loading}
            className="w-full"
          >
            {loading ? "Guardando perfil..." : "Completar registro"}
          </Button>

        </form>
      </section>
    </main>
  );
}