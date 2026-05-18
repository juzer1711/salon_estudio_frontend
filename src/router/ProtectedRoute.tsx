import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuthStore } from "../store/useAuthStore";

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const { user, loading } = useAuthStore();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;