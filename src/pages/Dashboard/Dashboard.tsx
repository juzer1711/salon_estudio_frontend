// src/pages/Dashboard/Dashboard.tsx

import { useEffect } from "react";
import { useNavigate }
from "react-router-dom";

import AppLayout from "../../layouts/AppLayout";

import { useAuthStore } from "../../store/useAuthStore";
import { useRoomStore } from "../../store/useRoomStore";

import emptyImage from "../../assets/IMAGVACIO.png";
import { BookOpen, Users, MessageCircle, Zap, ArrowRight } from "lucide-react";

import "./Dashboard.css";

export default function Dashboard(): React.JSX.Element {

  const { profile } =
    useAuthStore();

  const navigate = useNavigate();

  const {
    rooms,
    fetchMyRooms,
  } = useRoomStore();

  /**
   * =========================================
   * FETCH ROOMS
   * =========================================
   */

  useEffect(() => {
    fetchMyRooms();
  }, [fetchMyRooms]);

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
                    Participantes
                  </p>

                  <h3 className="dashboard-stat-card__value">
                    Próximamente
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

            {rooms.length === 0 ? (

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
                    Aún no has creado salas
                  </h3>

                  <p className="dashboard-empty__text">
                    Comienza creando tu primera
                    sala colaborativa para invitar
                    compañeros, comunicarte en
                    tiempo real y organizar sesiones
                    de estudio dentro de Roomix.
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
                        navigate(`/room/${room.id}`)
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" ||
                          e.key === " "
                        ) {
                          navigate(`/room/${room.id}`);
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

          </section>

        </section>

      </main>

    </AppLayout>
  );
}