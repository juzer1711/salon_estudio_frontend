// src/pages/Rooms/Rooms.tsx

import {
  type FormEvent,
  useEffect,
  useState,
} from "react";

import AppLayout from "../../layouts/AppLayout.tsx";

import Button from "../../components/ui/Button";
import RoomCard from "../../components/RoomCard/RoomCard.tsx";

import { useRoomStore } from "../../store/useRoomStore";
import { useSnackbar } from "../../context/SnackbarContext";

import emptyImage from "../../assets/IMAGVACIO.png";

import "./Rooms.css";

export default function Rooms(): React.JSX.Element {

  const {
    rooms,
    isCreatingRoom,
    isFetchingRooms,
    error,
    fetchMyRooms,
    createNewRoom,
    clearError,
  } = useRoomStore();

  const { showSnackbar } =
    useSnackbar();

  const [roomName, setRoomName] =
    useState<string>("");

  const [roomError, setRoomError] =
    useState<string>("");

  /**
   * =========================================
   * FETCH ROOMS
   * =========================================
   */

  useEffect(() => {
    fetchMyRooms();
  }, [fetchMyRooms]);

  /**
   * =========================================
   * ERROR HANDLING
   * =========================================
   */

  useEffect(() => {

    if (error) {
      showSnackbar(error, "error");
    }

  }, [error, showSnackbar]);

  /**
   * =========================================
   * CREATE ROOM
   * =========================================
   */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {

    event.preventDefault();

    clearError();
    setRoomError("");

    if (!roomName.trim()) {

      setRoomError(
        "Debes ingresar un nombre para la sala."
      );

      return;
    }

    const roomId =
      await createNewRoom(roomName);

    if (roomId) {

      showSnackbar(
        "Sala creada exitosamente.",
        "success"
      );

      setRoomName("");
    }
  };

  return (
    <AppLayout>

      <main className="rooms">

        <section className="rooms__container">

          {/* HERO */}
          <header className="rooms__hero">

            <div className="rooms__badge">
              Gestión colaborativa
            </div>

            <h1 className="rooms__title">
              Tus salas de estudio
            </h1>

            <p className="rooms__subtitle">
              Crea espacios colaborativos,
              organiza sesiones académicas
              y comunícate en tiempo real
              con otros participantes.
            </p>

          </header>

          {/* STATS */}
          <section className="rooms-stats">

            <article className="rooms-stat-card">

              <span>
                📚
              </span>

              <div>

                <p>
                  Total salas
                </p>

                <h3>
                  {rooms.length}
                </h3>

              </div>

            </article>

            <article className="rooms-stat-card">

              <span>
                ⚡
              </span>

              <div>

                <p>
                  Estado
                </p>

                <h3>
                  Tiempo real
                </h3>

              </div>

            </article>

          </section>

          {/* CREATE ROOM */}
          <section
            aria-labelledby="create-room-title"
            className="rooms-create"
          >

            <h2
              id="create-room-title"
              className="rooms-create__title"
            >
              Crear nueva sala
            </h2>

            <form
              onSubmit={handleSubmit}
              className="rooms-create__form"
            >

              <div className="rooms-create__field">

                <label
                  htmlFor="room-name"
                  className="rooms-create__label"
                >
                  Nombre de la sala
                </label>

                <input
                  id="room-name"
                  type="text"
                  placeholder="Ej: Física Cuántica"
                  value={roomName}
                  onChange={(e) =>
                    setRoomName(e.target.value)
                  }
                  className="rooms-create__input"
                  aria-invalid={!!roomError}
                  aria-describedby={
                    roomError
                      ? "room-error"
                      : undefined
                  }
                />

                {roomError && (

                  <p
                    id="room-error"
                    role="alert"
                    className="rooms-create__error"
                  >
                    {roomError}
                  </p>

                )}

              </div>

              <Button
                type="submit"
                disabled={isCreatingRoom}
                className="rooms-create__button"
              >
                {isCreatingRoom
                    ? "Creando..."
                    : "Crear sala"}
              </Button>

            </form>

          </section>

          {/* ROOMS */}
          <section
            aria-labelledby="rooms-list-title"
            className="rooms-list"
          >

            <div className="rooms-list__header">

              <h2
                id="rooms-list-title"
                className="rooms-list__title"
              >
                Tus salas
              </h2>

              <span className="rooms-list__count">
                {rooms.length} salas
              </span>

            </div>
            {isFetchingRooms ? (

              <div className="rooms-grid">

                {Array.from({ length: 6 }).map((_, index) => (

                  <div
                    key={index}
                    className="rooms-skeleton"
                  />

                ))}

              </div>

            ) :
            rooms.length === 0 ? (

              <div className="rooms-empty">

                <div className="rooms-empty__image-wrapper">

                  <img
                    src={emptyImage}
                    alt="Sin salas creadas"
                    className="rooms-empty__image"
                  />

                </div>

                <div className="rooms-empty__content">

                  <span className="rooms-empty__badge">
                    Estado vacío
                  </span>

                  <h3 className="rooms-empty__title">
                    Aún no has creado salas
                  </h3>

                  <p className="rooms-empty__text">
                    Crea tu primera sala colaborativa
                    para comenzar sesiones académicas
                    en tiempo real dentro de Roomix.
                  </p>

                  <button
                    type="button"
                    className="rooms-empty__cta"
                    onClick={() => {
                      document
                        .getElementById("room-name")
                        ?.focus();
                    }}
                  >
                    Crear mi primera sala
                  </button>

                </div>

              </div>

            ) : (

              <div className="rooms-grid">

                {rooms.map((room) => (

                  <RoomCard
                    key={room.id}
                    room={room}
                  />

                ))}

              </div>

            )}

          </section>

        </section>

      </main>

    </AppLayout>
  );
}