import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import AuthLayout from "../../layouts/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import GoogleButton from "../../components/ui/GoogleButton";

import { useAuthStore } from "../../store/useAuthStore";

export default function Login() {
  const navigate = useNavigate();

  const { loginWithEmail, loginWithGoogle, error } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const success = await loginWithEmail(email, password);
    if (success) navigate("/dashboard");
  };

  const handleGoogle = async () => {
    const success = await loginWithGoogle();
    if (success) navigate("/dashboard");
  };

  return (
    <AuthLayout>
      {/* HEADER */}

      {/* EMAIL */}
      <div style={{ marginBottom: "22px" }}>
        <label>Correo electrónico</label>
        <Input
          type="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />
      </div>

      {/* PASSWORD */}
      <div style={{ marginBottom: "28px" }}>
        <label>Contraseña</label>
        <Input
          type="password"
          placeholder="Ingresa tu contraseña"
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />
      </div>

      {/* ERROR */}
      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
      )}

      {/* BUTTON */}
      <Button onClick={handleLogin}>Iniciar sesión</Button>

      <div style={{ marginTop: "14px" }}>
        <GoogleButton
          text="Continuar con Google"
          onClick={handleGoogle}
        />
      </div>

      {/* FOOTER */}
      <p>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </AuthLayout>
  );
}