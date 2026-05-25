// src/components/Navbar.tsx

import { Menu } from "lucide-react";

import { useAuthStore } from "../store/useAuthStore";

import logo from "../assets/LOGOROOMIX.png";

import "./Navbar.css";

interface Props {
  onToggleSidebar: () => void;
}

export default function Navbar({
  onToggleSidebar,
}: Props): React.JSX.Element {

  const {
    logout,
    loading,
  } = useAuthStore();

  const handleLogout =
    async (): Promise<void> => {
      await logout();
    };

  return (
    <header className="navbar">

      <div className="navbar__container">

        {/* LEFT */}
        <div className="navbar__left">

          <button
            type="button"
            className="navbar__menu-button"
            aria-label="Abrir menú lateral"
            onClick={onToggleSidebar}
          >
            <Menu size={22} />
          </button>

          <div className="navbar__brand">

            <img
              src={logo}
              alt="Roomix"
              className="navbar__logo"
            />

            <span className="navbar__brand-name">
              Room<span>ix</span>
            </span>

          </div>

        </div>

        {/* CENTER */}
        <div className="navbar__center">

          <div className="navbar__status">

            <span className="navbar__status-dot" />

            <span className="navbar__status-text">
              Online
            </span>

          </div>

        </div>

        {/* RIGHT */}
        <div className="navbar__actions">

          <button
            onClick={handleLogout}
            disabled={loading}
            aria-busy={loading}
            className="navbar__logout"
          >
            {loading
              ? "Cerrando..."
              : "Cerrar sesión"}
          </button>

        </div>

      </div>

    </header>
  );
}