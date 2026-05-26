// src/pages/Room/Room.tsx

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout from "../../layouts/AppLayout";

import Button from "../../components/ui/Button";

import { socket }
from "../../services/socket";

import { useAuthStore }
from "../../store/useAuthStore";

import { useRoomStore }
from "../../store/useRoomStore";

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

  const { searchRoomById } =
    useRoomStore();

  const [message, setMessage] =
    useState<string>("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [currentRoom, setCurrentRoom] =
    useState<any>(null);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

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

            <div className="room__room-id">
              ID: {roomId}
            </div>

          </header>

          {/* CHAT */}
          <section className="room-chat">

            <div className="room-chat__messages">

              {messages.length === 0 ? (

                <div className="room-chat__empty">

                  <span>
                    💬
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

    </AppLayout>
  );
}