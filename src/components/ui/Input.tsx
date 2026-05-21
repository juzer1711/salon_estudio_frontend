import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import "./Input.css";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  type = "text",
  className = "",
  disabled,
  style,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full">
      <input
        {...props}
        disabled={disabled}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        style={{ paddingRight: isPassword ? "3rem" : undefined, ...style }}
        className={`roomix-input ${className}`}
      />

      {isPassword && (
        <button
          type="button"
          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          onClick={() => setShowPassword((v) => !v)}
          style={{
            position: "absolute",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2px",
            borderRadius: "6px",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              "var(--text)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.color =
              "var(--text-secondary)")
          }
        >
          {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
        </button>
      )}
    </div>
  );
}