type ButtonProps = {
  children: React.ReactNode;
};

export default function Button({
  children,
}: ButtonProps) {

  return (

    <button
      style={{
        width: "100%",
        padding: "12px",
        fontSize: "14px",
        borderRadius: "12px",
        border: "none",
        background: "#7C3AED",
        color: "white",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {children}
    </button>

  );
}