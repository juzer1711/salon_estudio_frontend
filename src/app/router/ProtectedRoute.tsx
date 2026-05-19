import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";

import { useAuthStore } from "../../store/useAuthStore";

type ProtectedRouteProps = {
  children: ReactNode;
};

type PublicRouteProps = {
  children: ReactNode;
};

type UsernameRouteProps = {
  children: ReactNode;
};

/**
 * =========================================
 * ACCESSIBLE LOADER
 * WCAG 2.2
 * =========================================
 */

const AccessibleLoader = (): React.JSX.Element => {
  return (
    <main
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-screen items-center justify-center"
    >
      <div className="text-center">
        <p className="text-lg font-medium">
          Procesando sesión...
        </p>

        <p className="sr-only">
          La aplicación está verificando el estado de autenticación
          y sincronizando el perfil del usuario.
        </p>
      </div>
    </main>
  );
};

/**
 * =========================================
 * PRIVATE ROUTES
 * Requiere:
 * - user autenticado
 * - perfil completo
 * =========================================
 */

export const ProtectedRoute = ({
  children,
}: ProtectedRouteProps): React.JSX.Element => {
  const { user, loading, needsUsername } = useAuthStore();

  if (loading) {
    return <AccessibleLoader />;
  }

  /**
   * Usuario NO autenticado
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * Usuario autenticado PERO sin perfil
   */
  if (needsUsername) {
    return <Navigate to="/choose-username" replace />;
  }

  return <>{children}</>;
};

/**
 * =========================================
 * PUBLIC ROUTES
 * login / register
 * =========================================
 */

export const PublicRoute = ({
  children,
}: PublicRouteProps): React.JSX.Element => {
  const { user, loading, needsUsername } = useAuthStore();

  if (loading) {
    return <AccessibleLoader />;
  }

  /**
   * Usuario completamente autenticado
   */
  if (user && !needsUsername) {
    return <Navigate to="/dashboard" replace />;
  }

  /**
   * Usuario en limbo de username
   */
  if (user && needsUsername) {
    return <Navigate to="/choose-username" replace />;
  }

  return <>{children}</>;
};

/**
 * =========================================
 * USERNAME ROUTE
 * SOLO accesible si:
 * - user existe
 * - needsUsername === true
 * =========================================
 */

export const UsernameRoute = ({
  children,
}: UsernameRouteProps): React.JSX.Element => {
  const { user, loading, needsUsername } = useAuthStore();

  if (loading) {
    return <AccessibleLoader />;
  }

  /**
   * Usuario NO autenticado
   */
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * Usuario ya tiene perfil completo
   */
  if (!needsUsername) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;