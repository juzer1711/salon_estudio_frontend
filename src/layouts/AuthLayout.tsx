type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {

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
          maxWidth: "460px",
          background: "#111827",
          borderRadius: "24px",
          padding: "28px",
        }}
      >

        {children}

      </div>

    </main>

  );
}