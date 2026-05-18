import { FcGoogle } from "react-icons/fc";

type GoogleButtonProps = {
  text: string;
};

export default function GoogleButton({
  text,
}: GoogleButtonProps) {

  return (

    <button
      style={{
        width: "100%",
        padding: "12px",
        borderRadius: "12px",
        border: "1px solid #2E335A",
        background: "#1A1B3A",
        color: "white",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >

      <FcGoogle size={20} />

      {text}

    </button>

  );
}