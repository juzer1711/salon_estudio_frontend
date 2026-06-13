// src/pages/Dashboard/Dashboard.tsx

import { useEffect } from "react";
import { useNavigate }
from "react-router-dom";

import AppLayout from "../../layouts/AppLayout";

import { useAuthStore } from "../../store/useAuthStore";
import { useRoomStore } from "../../store/useRoomStore";

import emptyImage from "../../assets/IMAGVACIO.png";
import {
  BookOpen,
  Users,
  MessageCircle,
  Zap,
  ArrowRight,
  PlusCircle,
  Search,
  LogIn
} from "lucide-react";

import "./Dashboard.css";

export default function Dashboard(): React.JSX.Element {

  const { profile } =
    useAuthStore();

  const navigate = useNavigate();

  const {
    rooms,
    fetchMyRooms,
    joinedRooms,
    fetchJoinedRooms,
  } = useRoomStore();     

  /**
   * =========================================
   * FETCH ROOMS
   * =========================================
   */

  useEffect(() => {
    fetchMyRooms();
    fetchJoinedRooms();
  }, [
    fetchMyRooms,
    fetchJoinedRooms
  ]); 

  return (
    <AppLayout>

      <main className="dashboard">

        <section className="dashboard__container">

          {/* HERO */}
          <header className="dashboard__hero">

            <div className="dashboard__hero-content">

              <div className="dashboard__badge">
                Plataforma colaborativa académica
              </div>

              <h1 className="dashboard__title">
                Bienvenido,
                <span>
                  {" "}
                  {profile?.firstName ?? "Usuario"}
                </span>
              </h1>

              <p className="dashboard__subtitle">
                Gestiona tus salas, comunícate
                en tiempo real y construye
                espacios colaborativos de estudio
                con Roomix.
              </p>
              <p className="dashboard__summary">
                Actualmente tienes{" "}
                <strong>{rooms.length}</strong> salas creadas
                y participas en{" "}
                <strong>{joinedRooms.length}</strong> salas.
              </p>
              <div className="dashboard__quick-actions">

              <button
                className="dashboard__quick-btn dashboard__quick-btn--primary"
                onClick={() => navigate("/rooms")}
              >
                <Search size={18} />
                Unirme a una sala
              </button>

              <button
                className="dashboard__quick-btn"
                onClick={() => navigate("/rooms")}
              >
                <PlusCircle size={18} />
                Crear sala
              </button>

            </div>

            </div>

          </header>

          {/* STATS */}
          <section
            aria-labelledby="dashboard-stats-title"
            className="dashboard-stats"
          >

            <div className="dashboard-section__header">

              <div>
                <p className="dashboard-section__eyebrow">
                  Resumen general
                </p>

                <h2
                  id="dashboard-stats-title"
                  className="dashboard-section__title"
                >
                  Actividad de tu cuenta
                </h2>
              </div>

            </div>

            <div className="dashboard-stats__grid">

              <article className="dashboard-stat-card">

                <span className="dashboard-stat-card__icon">
                  <BookOpen size={24} color="#a78bfa" />
                </span>

                <div>
                  <p className="dashboard-stat-card__label">
                    Salas creadas
                  </p>

                  <h3 className="dashboard-stat-card__value">
                    {rooms.length}
                  </h3>
                </div>

              </article>

              <article className="dashboard-stat-card">

                <span className="dashboard-stat-card__icon">
                  <Users size={24} color="#a78bfa" />
                </span>

                <div>
                  <p className="dashboard-stat-card__label">
                    Salas donde participo
                  </p>
                  <h3 className="dashboard-stat-card__value">
                    {joinedRooms.length}
                  </h3>

                </div>

              </article>

              <article className="dashboard-stat-card">

                <span className="dashboard-stat-card__icon">
                  <MessageCircle size={24} color="#a78bfa" />
                </span>

                <div>
                  <p className="dashboard-stat-card__label">
                    Mensajes
                  </p>

                  <h3 className="dashboard-stat-card__value">
                    WebSockets activos
                  </h3>
                </div>

              </article>

              <article className="dashboard-stat-card">

                <span className="dashboard-stat-card__icon">
                  <Zap size={24} color="#a78bfa" />
                </span>

                <div>
                  <p className="dashboard-stat-card__label">
                    Actividad
                  </p>

                  <h3 className="dashboard-stat-card__value">
                    En tiempo real
                  </h3>
                </div>

              </article>

            </div>

          </section>
          <section className="dashboard-welcome">

            <div className="dashboard-welcome__content">

              <span className="dashboard-empty__badge">
                Acceso rápido
              </span>

              <h2>
                ¿Quieres unirte a una sala?
              </h2>

              <p>
                Si un compañero te compartió un código de sala,
                puedes ingresar desde la sección Mis Salas y
                acceder inmediatamente al espacio colaborativo.
              </p>

            </div>

            <button
              className="dashboard-welcome__button"
              onClick={() => navigate("/rooms")}
            >
              <LogIn size={18} />
              Ir a Unirme a una sala
            </button>

          </section>

          {/* ROOMS STATE */}
          <section
            aria-labelledby="dashboard-rooms-title"
            className="dashboard-rooms"
          >

            <div className="dashboard-section__header">

              <div>

                <p className="dashboard-section__eyebrow">
                  Gestión de salas
                </p>

                <h2
                  id="dashboard-rooms-title"
                  className="dashboard-section__title"
                >
                  Tus espacios colaborativos
                </h2>

              </div>

            </div>

            {rooms.length === 0 && joinedRooms.length === 0 ? (

              <div
                  className="dashboard-empty"
                  role="button"
                  tabIndex={0}
                  aria-label="Ir a crear salas"
                  onClick={() => navigate("/rooms")}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " "
                    ) {
                      navigate("/rooms");
                    }
                  }}
                >

                <div className="dashboard-empty__image-wrapper">

                  <img
                    src={emptyImage}
                    alt="Sin salas creadas"
                    className="dashboard-empty__image"
                  />

                </div>

                <div className="dashboard-empty__content">

                  <span className="dashboard-empty__badge">
                    Estado vacío detectado
                  </span>

                  <h3 className="dashboard-empty__title">
                    Aún no tienes espacios colaborativos
                  </h3>

                  <p className="dashboard-empty__text">
                     Puedes crear una nueva sala o unirte a una
                      existente mediante un código compartido
                      por tus compañeros.
                  </p>
                  <div className="dashboard-empty__action">

                      <span className="dashboard-empty__action-icon">
                        <ArrowRight size={16} color="#c4b5fd" />
                      </span>

                      <span className="dashboard-empty__action-text">
                        Haz clic aquí para crear tu primera sala
                      </span>

                    </div>

                </div>

              </div>

            ) : (

              <div className="dashboard-rooms__grid">

                {rooms.map((room) => (

                  <article
                      key={room.id}
                      className="dashboard-room-card"
                      role="button"
                      tabIndex={0}
                      aria-label={`Entrar a la sala ${room.name}`}
                      onClick={() =>
                        navigate(`/room-preview/${room.id}`)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.key === " "
                        ) {
                          navigate(`/room-preview/${room.id}`);
                        }
                      }}
                    >

                    <div className="dashboard-room-card__top">

                      <span className="dashboard-room-card__status">
                        Activa
                      </span>

                    </div>

                    <h3 className="dashboard-room-card__title">
                      {room.name}
                    </h3>

                    <p className="dashboard-room-card__id">
                      ID: {room.id}
                    </p>

                  </article>
                ))}

              </div>

            )}
            {/* SALAS DONDE PARTICIPO */}

{joinedRooms.length > 0 && (

  <>

    <div
      style={{
        marginTop: "2rem"
      }}
    >

      <h3 className="dashboard-subtitle-section">
        Salas donde participo
      </h3>

    </div>

    <div className="dashboard-rooms__grid">

      {joinedRooms.map((room) => (

        <article
          key={room.id}
          className="dashboard-room-card"
          role="button"
          tabIndex={0}
          aria-label={`Entrar a la sala ${room.name}`}
          onClick={() =>
            navigate(`/room-preview/${room.id}`)
          }
          onKeyDown={(e) => {
            if (
              e.key === "Enter" ||
              e.key === " "
            ) {
              navigate(`/room-preview/${room.id}`);
            }
          }}
        >

          <div className="dashboard-room-card__top">

            <span
              className="dashboard-room-card__status"
              style={{
                background:
                  "rgba(59,130,246,0.15)",
                color:
                  "#93c5fd"
              }}
            >
              Miembro
            </span>

          </div>

          <h3 className="dashboard-room-card__title">
            {room.name}
          </h3>

          <p className="dashboard-room-card__id">
            ID: {room.id}
          </p>

        </article>

      ))}

    </div>

  </>

)}

          </section>

        </section>

      </main>

    </AppLayout>
  );
}