import React from "react";
import "./Button.css";

export type ButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    children: React.ReactNode;
  };

export default function Button({
  children,
  disabled,
  className = "",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={style}
      className={`roomix-btn-primary ${className}`}
    >
      {children}
    </button>
  );
}