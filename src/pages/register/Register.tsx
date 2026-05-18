import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import GoogleButton from "../../components/ui/GoogleButton";

import { useAuthStore } from "../../store/useAuthStore";

export default function Register() {
  const navigate = useNavigate();

  const { registerWithEmail, checkUsername, error } = useAuthStore();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    const available = await checkUsername(username);

    if (!available) {
      alert("El username ya está en uso");
      return;
    }

    const success = await registerWithEmail(email, password);

    if (success) navigate("/dashboard");
  };

  return (
    <main>
      {/* NAME */}
      <Input
        type="text"
        placeholder="Ingresa tu nombre"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setName(e.target.value)
        }
      />

      {/* USERNAME */}
      <Input
        type="text"
        placeholder="Ingresa tu nombre de usuario"
        value={username}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setUsername(e.target.value)
        }
      />

      {/* EMAIL */}
      <Input
        type="email"
        placeholder="Ingresa tu correo"
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setEmail(e.target.value)
        }
      />

      {/* PASSWORD */}
      <Input
        type="password"
        placeholder="Crea una contraseña"
        value={password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <Button onClick={handleRegister}>
        Crear cuenta
      </Button>

      <GoogleButton text="Continuar con Google" />

      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </main>
  );
}