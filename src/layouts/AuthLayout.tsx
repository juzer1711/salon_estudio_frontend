import "./AuthLayout.css";

type AuthLayoutProps = { children: React.ReactNode };

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      {/* Glows decorativos */}
      <div aria-hidden="true" className="auth-layout__glow auth-layout__glow--top" />
      <div aria-hidden="true" className="auth-layout__glow auth-layout__glow--bottom" />

      {/* Logo FUERA del card */}
      <div className="auth-layout__logo-wrapper">
        <img
          src="/src/assets/LOGOROOMIX.png"
          alt="Roomix"
          className="auth-layout__logo-img"
        />
        <span className="auth-layout__logo-name">
          Room<span>ix</span>
        </span>
      </div>

      {/* Card — solo el formulario */}
      <div className="auth-layout__card">
        {children}
      </div>
    </div>
  );
}