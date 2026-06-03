// src/pages/Rooms/Rooms.tsx

import {
  useEffect,
  useState,
} from "react";

import AppLayout from "../../layouts/AppLayout.tsx";

import Button from "../../components/ui/Button";
import RoomCard from "../../components/RoomCard/RoomCard.tsx";
import EditRoomModal from "../../components/modals/EditRoomModal";
import DeleteRoomModal from "../../components/modals/DeleteRoomModal";

import { useRoomStore } from "../../store/useRoomStore";

import type { StudyRoom }
  from "../../services/roomService";
  
import { useSnackbar } from "../../context/SnackbarContext";

import { useNavigate } from "react-router-dom";
import emptyImage from "../../assets/IMAGVACIO.png";

import { BookOpen, Zap } from "lucide-react";

import "./Rooms.css";

export default function Rooms(): React.JSX.Element {

  const {
    rooms,
    isCreatingRoom,
    isFetchingRooms,
    isSearchingRoom,
    error,
    fetchMyRooms,
    createNewRoom,
    clearError,
    searchRoomById,
    editRoom,
    removeRoom,
  } = useRoomStore();

  const { showSnackbar } =
    useSnackbar();

  const navigate = useNavigate();

  const [roomName, setRoomName] =
    useState<string>("");

  const [searchRoomId, setSearchRoomId] =
    useState<string>("");

  const [roomError, setRoomError] =
    useState<string>("");

  const [foundRoom, setFoundRoom] =
    useState<StudyRoom | null>(null);

  const [editingRoom, setEditingRoom] =
    useState<StudyRoom | null>(null);

  const [deletingRoom, setDeletingRoom] =
    useState<StudyRoom | null>(null);

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
    event: React.FormEvent<HTMLFormElement>
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

  /**
   * =========================================
   * SEARCH ROOM
   * =========================================
   */

  const handleSearchRoom = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {

    event.preventDefault();

    clearError();

    if (!searchRoomId.trim()) {

      showSnackbar(
        "Debes ingresar un ID de sala.",
        "error"
      );

      return;
    }

    const room =
      await searchRoomById(
        searchRoomId.trim().toUpperCase()
      );

    if (!room) {
      return;
    }

    setFoundRoom(room);
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
                <BookOpen size={36} color="#a78bfa" />
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
                <Zap size={36} color="#a78bfa" />
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

          {/* SEARCH ROOM */}
          <section
            className="rooms-create"
          >
            <h2
              className="rooms-create__title"
            >
              Buscar sala
            </h2>

            <form
              onSubmit={handleSearchRoom}
              className="rooms-create__form"
            >

              <div className="rooms-create__field">

                <label
                  className="rooms-create__label"
                >
                  ID de la sala
                </label>

                <input
                  type="text"
                  placeholder="Ej: A1B2C3"
                  value={searchRoomId}
                  onChange={(e) =>
                    setSearchRoomId(
                      e.target.value
                    )
                  }
                  className="rooms-create__input"
                />

              </div>

              <Button
                type="submit"
                disabled={isSearchingRoom}
                className="rooms-create__button"
              >
                {isSearchingRoom
                  ? "Buscando..."
                  : "Buscar sala"}
              </Button>

            </form>
          </section>

            {foundRoom && (

              <section className="rooms-found">

                <div className="rooms-found__icon">
                  🚀
                </div>

                <div className="rooms-found__content">

                  <span className="rooms-found__badge">
                    Sala encontrada
                  </span>

                  <h3 className="rooms-found__title">
                    {foundRoom.name}
                  </h3>

                  <p className="rooms-found__text">
                    Creada por{" "}
                    <strong>
                      {foundRoom.ownerName}
                    </strong>
                  </p>

                  <div className="rooms-found__meta">

                    <span className="rooms-found__id">
                      #{foundRoom.id}
                    </span>

                    <span className="rooms-found__status">
                      En línea
                    </span>

                  </div>

                </div>

                <div className="rooms-found__actions">

                  <button
                    type="button"
                    onClick={() =>
                      setFoundRoom(null)
                    }
                    className="rooms-found__cancel"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/room/${foundRoom.id}`)
                    }
                    className="rooms-found__enter"
                  >
                    Entrar
                  </button>

                </div>

              </section>

            )}

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
                    onEdit={setEditingRoom}
                    onDelete={setDeletingRoom}
                  />

                ))}

              </div>

            )}

          </section>

        </section>

      </main>

      {editingRoom && (

        <EditRoomModal
          currentName={editingRoom.name}
          onClose={() =>
            setEditingRoom(null)
          }
          onSave={async (newName) => {

            const success =
              await editRoom(
                editingRoom.id,
                newName
              );

            if (success) {

              showSnackbar(
                "Sala actualizada correctamente.",
                "success"
              );

              setEditingRoom(null);

            }

          }}
        />

      )}

      {deletingRoom && (

        <DeleteRoomModal
          roomName={deletingRoom.name}
          onClose={() =>
            setDeletingRoom(null)
          }
          onConfirm={async () => {

            const success =
              await removeRoom(
                deletingRoom.id
              );

            if (success) {

              showSnackbar(
                "Sala eliminada correctamente.",
                "success"
              );

              setDeletingRoom(null);

            }

          }}
        />

      )}

    </AppLayout>
  );
}