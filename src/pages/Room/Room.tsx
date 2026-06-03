// src/pages/Room/Room.tsx

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import EditRoomModal from "../../components/modals/EditRoomModal";
import DeleteRoomModal from "../../components/modals/DeleteRoomModal";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import type { StudyRoom } from "../../services/roomService";

import AppLayout from "../../layouts/AppLayout";

import Button from "../../components/ui/Button";

import {
  MessageSquareOff,
  MoreVertical,
} from "lucide-react";

import { socket } from "../../services/socket";
import { useAuthStore } from "../../store/useAuthStore";
import { useRoomStore } from "../../store/useRoomStore";
import { useSnackbar } from "../../context/SnackbarContext";

import "./Room.css";

interface ChatMessage {
  roomId: string;
  message: string;
  user: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function Room(): React.JSX.Element {

  const { roomId } =
    useParams<{ roomId: string }>();

  const navigate =
    useNavigate();

  const { profile } =
    useAuthStore();

  const { showSnackbar } =
    useSnackbar();

  const {
    searchRoomById,
    editRoom,
    removeRoom,
  } = useRoomStore();

  const [message, setMessage] =
    useState<string>("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [currentRoom, setCurrentRoom] =
    useState<StudyRoom | null>(null);

  const isOwner =
    profile?.uid ===
    currentRoom?.ownerUid;

  const [showMenu, setShowMenu] =
    useState(false);

  const [editingRoom, setEditingRoom] =
    useState<StudyRoom | null>(null);

  const [deletingRoom, setDeletingRoom] =
    useState<StudyRoom | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  /**
   * =========================================
   * LOAD ROOM
   * =========================================
   */

  useEffect(() => {

    const loadRoom = async () => {

      if (!roomId) {
        return;
      }

      const room =
        await searchRoomById(roomId);

      if (!room) {

        navigate("/rooms");

        return;
      }

      setCurrentRoom(room);
    };

    loadRoom();

  }, [
    roomId,
    searchRoomById,
    navigate,
  ]);

  /**
   * =========================================
   * SOCKET CONNECTION
   * =========================================
   */

  useEffect(() => {

    if (!roomId) return;

    socket.connect();

    socket.on("connect", () => {

      console.log(
        "Socket conectado:",
        socket.id
      );

      socket.emit(
        "join-room",
        roomId
      );

      console.log(
        "Joined room:",
        roomId
      );
    });

    socket.on(
      "receive-message",
      (data: ChatMessage) => {

        console.log(
          "Mensaje recibido:",
          data
        );

        setMessages((prev) => [
          ...prev,
          data,
        ]);
      }
    );

    socket.on("disconnect", () => {

      console.log(
        "Socket desconectado"
      );
    });

    return () => {

      socket.off("connect");

      socket.off("receive-message");

      socket.off("disconnect");

      socket.disconnect();
    };

  }, [roomId]);

  /**
   * =========================================
   * AUTO SCROLL
   * =========================================
   */

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  /**
   * =========================================
   * CLICK OUTSIDE
   * =========================================
   */
  useEffect(() => {

    const handleClickOutside = (
      event: MouseEvent
    ) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowMenu(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  /**
   * =========================================
   * SEND MESSAGE
   * =========================================
   */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ): void => {

    event.preventDefault();

    if (
      !message.trim() ||
      !roomId
    ) {
      return;
    }

    socket.emit(
      "send-message",
      {
        roomId,
        message,
        user:
          profile?.username ??
          "Anónimo",

        avatarUrl:
          profile?.avatarUrl ?? "",
      }
    );

    setMessage("");
  };

  return (
    <AppLayout>

      <main className="room">

        <section className="room__container">

          {/* HEADER */}
          <header className="room__header">

            <div className="room__header-left">

              <button
                type="button"
                className="room__back"
                onClick={() => navigate(-1)}
              >
                ← Volver
              </button>

              <div>

                <div className="room__badge">
                  Sala colaborativa
                </div>

                <h1 className="room__title">
                  {currentRoom?.name ??
                    "Cargando sala..."}
                </h1>

                <p className="room__subtitle">
                  Comunicación en tiempo real
                  mediante WebSockets.
                </p>

              </div>

            </div>

            <div
              className="room__actions"
              ref={menuRef}
            >

              <div className="room__room-id">
                ID: {roomId}
              </div>

              {isOwner && (

                <button
                  type="button"
                  className="room__menu-button"
                  onClick={() =>
                    setShowMenu(!showMenu)
                  }
                >
                  <MoreVertical size={18} />
                </button>

              )}

              {showMenu && (

                <div className="room__menu">

                  <button
                    className="room__menu-item"
                    onClick={() => {
                      setShowMenu(false);
                      setEditingRoom(currentRoom);
                    }}
                  >
                    Editar sala
                  </button>

                  <button
                    className="
                      room__menu-item
                      room__menu-item--danger
                    "
                    onClick={() => {
                      setShowMenu(false);
                      setDeletingRoom(currentRoom);
                    }}
                  >
                    Eliminar sala
                  </button>

                </div>

              )}

            </div>

          </header>

          {/* CHAT */}
          <section className="room-chat">

            <div className="room-chat__messages">

              {messages.length === 0 ? (

                <div className="room-chat__empty">

                  <span>
                    <MessageSquareOff size={48} color="#a78bfa" />
                  </span>

                  <p>
                    Aún no hay mensajes
                    en esta sala.
                  </p>

                </div>

              ) : (

                messages.map(
                  (chat, index) => (

                    <article
                      key={index}
                      className={`room-message ${
                        chat.user === profile?.username
                          ? "room-message--own"
                          : "room-message--other"
                      }`}
                    >

                      <div className="room-message__avatar">

                        {chat.avatarUrl ? (

                          <img
                            src={chat.avatarUrl}
                            alt={chat.user}
                            className="room-message__avatar-image"
                            referrerPolicy="no-referrer"
                          />

                        ) : (

                          <span>
                            {chat.user[0]?.toUpperCase()}
                          </span>

                        )}

                      </div>

                      <div className="room-message__content">

                        <div className="room-message__header">

                          <span className="room-message__user">
                            @{chat.user}
                          </span>

                          <span className="room-message__time">
                            {new Date(
                              chat.createdAt
                            ).toLocaleTimeString()}
                          </span>

                        </div>

                        <p className="room-message__text">
                          {chat.message}
                        </p>

                      </div>

                    </article>
                  )
                )
              )}

              <div ref={messagesEndRef} />

            </div>

            {/* INPUT */}
            <form
              onSubmit={handleSubmit}
              className="room-chat__form"
            >

              <input
                type="text"
                placeholder="Escribe un mensaje..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                className="room-chat__input"
              />

              <Button type="submit">
                Enviar
              </Button>

            </form>

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

              setCurrentRoom((prev: any) => ({
                ...prev,
                name: newName,
              }));

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