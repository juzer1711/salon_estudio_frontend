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
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar__top">

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

      {/* PROFILE */}
      <div className="sidebar__profile">

        <div className="sidebar__avatar">
          {profile?.avatarUrl && !avatarError ? (
            <img
              src={profile.avatarUrl}
              alt={`Avatar de ${profile.firstName}`}
              className="sidebar__avatar-img"
              referrerPolicy="no-referrer"
              onError={() => setAvatarError(true)}
            />
          ) : (
            <span className="sidebar__avatar-text">
              {initials}
            </span>
          )}
        </div>

        <h3 className="sidebar__name">
          {profile?.firstName ?? "Usuario"}
        </h3>

        <p className="sidebar__username">
          @{profile?.username ?? "roomix"}
        </p>

        <button
          onClick={handleLogout}
          disabled={loading}
          className="sidebar__logout"
        >
          {loading ? "Cerrando..." : "Cerrar sesión"}
        </button>

      </div>

      {/* NAVIGATION */}
      <nav
        className="sidebar__nav"
        aria-label="Navegación principal"
      >

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar__link ${
              isActive ? "sidebar__link--active" : ""
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/rooms"
          className={({ isActive }) =>
            `sidebar__link ${
              isActive ? "sidebar__link--active" : ""
            }`
          }
        >
          Salas
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar__link ${
              isActive ? "sidebar__link--active" : ""
            }`
          }
        >
          Perfil
        </NavLink>

      </nav>
    </aside>
  );
}