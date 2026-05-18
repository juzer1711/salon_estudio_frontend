import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export type InputProps =
  React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  type = "text",
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div style={{ position: "relative" }}>
      <input
        {...props}
        type={
          isPassword
            ? showPassword
              ? "text"
              : "password"
            : type
        }
        style={{
          width: "100%",
          padding: "12px 14px",
          paddingRight: isPassword ? "45px" : "14px",
          borderRadius: "12px",
          border: "1px solid #2E335A",
          background: "#1A1B3A",
          color: "white",
          fontSize: "14px",
          outline: "none",
        }}
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            top: "50%",
            right: "14px",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "#94A3B8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {showPassword ? (
            <FiEyeOff size={18} />
          ) : (
            <FiEye size={18} />
          )}
        </button>
      )}
    </div>
  );
}