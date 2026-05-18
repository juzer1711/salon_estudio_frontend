import { Link } from "react-router-dom";

import AuthLayout from "../../layouts/AuthLayout";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import GoogleButton from "../../components/ui/GoogleButton";

export default function Login() {

  return (

    <AuthLayout>

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "32px",
        }}
      >

        <h1
          style={{
            fontSize: "38px",
            fontWeight: "800",
            color: "white",
          }}
        >
          Roomix
        </h1>

        <p
          style={{
            marginTop: "14px",
            color: "#94A3B8",
            fontSize: "14px",
            lineHeight: "22px",
          }}
        >
          Colabora, estudia y conecta
          con tu equipo en tiempo real.
        </p>

      </div>

      {/* EMAIL */}

      <div style={{ marginBottom: "22px" }}>

        <label
          style={{
            display: "block",
            marginBottom: "10px",
            color: "white",
            fontWeight: "600",
          }}
        >
          Correo electrónico
        </label>

        <Input
          type="email"
          placeholder="Ingresa tu correo"
        />

      </div>

      {/* PASSWORD */}

      <div style={{ marginBottom: "28px" }}>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >

          <label
            style={{
              color: "white",
              fontWeight: "600",
            }}
          >
            Contraseña
          </label>

          <Link
            to="/forgot-password"
            style={{
              color: "#7C3AED",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ¿Olvidaste tu contraseña?
          </Link>

        </div>

        <Input
          type="password"
          placeholder="Ingresa tu contraseña"
        />

      </div>

      {/* BUTTON */}

      <Button>
        Iniciar sesión
      </Button>

      <div style={{ marginTop: "14px" }}>

        <GoogleButton
          text="Continuar con Google"
        />

      </div>

      {/* FOOTER */}

      <div
        style={{
          textAlign: "center",
          marginTop: "24px",
        }}
      >

        <p
          style={{
            color: "#94A3B8",
            fontSize: "14px",
          }}
        >

          ¿No tienes cuenta?{" "}

          <Link
            to="/register"
            style={{
              color: "#7C3AED",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            Regístrate
          </Link>

        </p>

      </div>

    </AuthLayout>

  );
}