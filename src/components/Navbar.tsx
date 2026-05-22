// src/components/Navbar.tsx

import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

import logo from "../assets/LOGOROOMIX.png";

import "./Navbar.css";

export default function Navbar(): React.JSX.Element {
  const { profile, logout, loading } = useAuthStore();
  const [avatarError, setAvatarError] = useState<boolean>(false);

  useEffect(() => {
    setAvatarError(false);
  }, [profile?.avatarUrl]);

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : "RM";

  const handleLogout = async (): Promise<void> => {
    await logout();
  };

  return (
    <header className="navbar">
      <div className="navbar__container">

        {/* LEFT */}
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

        {/* CENTER */}
        <nav
          className="navbar__nav"
          aria-label="Navegación principal"
        >
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Salas
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Perfil
          </NavLink>
        </nav>

        {/* RIGHT */}
        <div className="navbar__actions">

          <div
            className="navbar__profile"
            aria-label="Perfil del usuario"
          >
            <div className="navbar__avatar">
              {profile?.avatarUrl && !avatarError ? (
                <img 
                  src={profile.avatarUrl} 
                  alt={`Avatar de ${profile.firstName}`} 
                  className="navbar__avatar-img"
                  referrerPolicy="no-referrer" 
                  onError={() => setAvatarError(true)} 
                />
              ) : (
                <span className="navbar__avatar-text">{initials}</span>
              )}
            </div>

            <div className="navbar__profile-info">
              <p className="navbar__name">
                {profile?.firstName ?? "Usuario"}
              </p>

              <p className="navbar__username">
                @{profile?.username ?? "roomix"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loading}
            aria-busy={loading}
            className="navbar__logout"
          >
            {loading ? "Cerrando..." : "Salir"}
          </button>
        </div>
      </div>
    </header>
  );
}