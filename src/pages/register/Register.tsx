import { Link } from "react-router-dom";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import GoogleButton from "../../components/ui/GoogleButton";

export default function Register() {

  return (

    <main
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        background: "#070B1A",
      }}
    >

      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#111827",
          borderRadius: "24px",
          padding: "28px",
        }}
      >

        {/* HEADER */}

        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
          }}
        >

          <h1
            style={{
              fontSize: "32px",
              fontWeight: "800",
              color: "white",
            }}
          >
            Crear cuenta
          </h1>

          <p
            style={{
              marginTop: "10px",
              color: "#94A3B8",
              fontSize: "14px",
              lineHeight: "22px",
            }}
          >
            Únete a Roomix y empieza
            a colaborar en tiempo real.
          </p>

        </div>

        {/* NAME */}

        <div style={{ marginBottom: "20px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Nombre
          </label>

          <Input
            type="text"
            placeholder="Ingresa tu nombre"
          />

        </div>

        {/* USERNAME */}

        <div style={{ marginBottom: "20px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Nombre de usuario
          </label>

          <Input
            type="text"
            placeholder="Ingresa tu nombre de usuario"
          />

        </div>

        {/* EMAIL */}

        <div style={{ marginBottom: "20px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
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

        <div style={{ marginBottom: "20px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Contraseña
          </label>

          <Input
            type="password"
            placeholder="Crea una contraseña"
          />

        </div>

        {/* CONFIRM PASSWORD */}

        <div style={{ marginBottom: "24px" }}>

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "white",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Confirmar contraseña
          </label>

          <Input
            type="password"
            placeholder="Confirma tu contraseña"
          />

        </div>

        {/* BUTTON */}

        <Button>
          Crear cuenta
        </Button>

        {/* DIVIDER */}

        <div style={{ marginTop: "14px" }}>

          <GoogleButton
            text="Continuar con Google"
          />

        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            margin: "24px 0",
          }}
        >

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#2E335A",
            }}
          />

          <span
            style={{
              color: "#94A3B8",
              fontSize: "13px",
            }}
          >
            o
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              background: "#2E335A",
            }}
          />

        </div>

        {/* LOGIN */}

        <div
          style={{
            textAlign: "center",
          }}
        >

          <p
            style={{
              color: "#94A3B8",
              fontSize: "14px",
            }}
          >

            ¿Ya tienes cuenta?{" "}

            <Link
              to="/login"
              style={{
                color: "#7C3AED",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Inicia sesión
            </Link>

          </p>

        </div>

      </div>

    </main>

  );
}