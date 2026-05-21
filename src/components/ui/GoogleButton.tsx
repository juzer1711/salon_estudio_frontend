import React from "react";
import { FcGoogle } from "react-icons/fc";
import "./GoogleButton.css";

export type GoogleButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    text: string;
  };

export default function GoogleButton({
  text,
  disabled,
  className = "",
  style,
  ...props
}: GoogleButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      style={style}
      className={`roomix-btn-google ${className}`}
    >
      <FcGoogle size={19} aria-hidden="true" />
      <span>{text}</span>
    </button>
  );
}