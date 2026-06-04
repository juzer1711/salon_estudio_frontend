import { NavLink } from "react-router-dom";

import { useAuthStore }
from "../store/useAuthStore";

import { useRoomStore }
from "../store/useRoomStore";

import "./Sidebar.css";

import { BookOpen, Library, Home, User} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
}: Props): React.JSX.Element {

  const { profile } =
    useAuthStore();

  const {
    rooms,
    joinedRooms,
  } = useRoomStore();

  const initials =
    profile?.firstName &&
    profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : "RM";
  
  const recentOwnedRooms =
  rooms.slice(0, 3);

  const recentJoinedRooms =
    joinedRooms.slice(0, 3);

  return (
    <aside
      className={`sidebar ${
        isOpen
          ? "sidebar--open"
          : ""
      }`}
      aria-label="Barra lateral"
      aria-hidden={!isOpen}
    >

      {/* USER */}
      <section className="sidebar__profile">

        <div className="sidebar__avatar">

          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`Avatar de ${profile.firstName}`}
              className="sidebar__avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="sidebar__avatar-text">
              {initials}
            </span>
          )}

        </div>

        <div className="sidebar__profile-info">

          <h2 className="sidebar__name">
            {profile?.firstName}{" "}
            {profile?.lastName}
          </h2>

          <p className="sidebar__username">
            @{profile?.username}
          </p>

          <p className="sidebar__email">
            {profile?.email}
          </p>

        </div>

      </section>

      {/* NAVIGATION */}
      <nav
        className="sidebar__nav"
        aria-label="Navegación principal"
      >

        <NavLink
          to="/dashboard"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar__link ${
              isActive
                ? "sidebar__link--active"
                : ""
            }`
          }
        >
          <Home size={20} color="#a78bfa" />Dashboard
        </NavLink>

        <NavLink
          to="/rooms"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar__link ${
              isActive
                ? "sidebar__link--active"
                : ""
            }`
          }
        >
          <Library size={20} color="#a78bfa" /> Mis salas
        </NavLink>

        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) =>
            `sidebar__link ${
              isActive
                ? "sidebar__link--active"
                : ""
            }`
          }
        >
          <User size={20} color="#a78bfa" /> Perfil
        </NavLink>

      </nav>

      {/* RECENT ROOMS */}
      <section className="sidebar__rooms">

        <div className="sidebar__rooms-header">

          <h3 className="sidebar__rooms-title">
            Salas recientes
          </h3>

          <span className="sidebar__rooms-count">
            {
              rooms.length +
              joinedRooms.length
            }
          </span>

        </div>

        {rooms.length === 0 ? (

          <p className="sidebar__empty">
            Aún no tienes salas.
          </p>

        ) : (

          <div className="sidebar__rooms-list">

          {recentOwnedRooms.length > 0 && (

            <>
              <p className="sidebar__section-label">
                Mis salas
              </p>

              {recentOwnedRooms.map((room) => (

                <NavLink
                  key={room.id}
                  to={`/room/${room.id}`}
                  onClick={onClose}
                  className="sidebar__room-link"
                >
                  <span>
                    <BookOpen
                      size={20}
                      color="#a78bfa"
                    />
                  </span>

                  <div>

                    <p className="sidebar__room-name">
                      {room.name}
                    </p>

                    <p className="sidebar__room-id">
                      {room.id}
                    </p>

                  </div>

                </NavLink>

              ))}
            </>

          )}

          {recentJoinedRooms.length > 0 && (

            <>
              <p className="sidebar__section-label">
                Participando
              </p>

              {recentJoinedRooms.map((room) => (

                <NavLink
                  key={room.id}
                  to={`/room/${room.id}`}
                  onClick={onClose}
                  className="sidebar__room-link"
                >
                  <span>
                    <BookOpen
                      size={20}
                      color="#60a5fa"
                    />
                  </span>

                  <div>

                    <p className="sidebar__room-name">
                      {room.name}
                    </p>

                    <p className="sidebar__room-id">
                      {room.id}
                    </p>

                  </div>

                </NavLink>

              ))}
            </>

          )}

        </div>
        )}

      </section>

    </aside>
  );
}