// src/pages/Room/Room.tsx

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { useParams } from "react-router-dom";

import AppLayout from "../../layouts/AppLayout";

import Button from "../../components/ui/Button";

import { socket }
from "../../services/socket";

import { useAuthStore }
from "../../store/useAuthStore";

import "./Room.css";

interface ChatMessage {
  roomId: string;
  message: string;
  user: string;
  createdAt: string;
}

export default function Room(): React.JSX.Element {

  const { roomId } =
    useParams<{ roomId: string }>();

  const { profile } =
    useAuthStore();

  const [message, setMessage] =
    useState<string>("");

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  /**
   * =========================================
   * SOCKET CONNECTION
   * =========================================
   */

useEffect(() => {

  if (!roomId) return;

  /**
   * CONNECT SOCKET
   */

  socket.connect();

  /**
   * SOCKET CONNECTED
   */

  socket.on("connect", () => {

    console.log(
      "Socket conectado:",
      socket.id
    );

    /**
     * JOIN ROOM
     */

    socket.emit(
      "join-room",
      roomId
    );

    console.log(
      "Joined room:",
      roomId
    );
  });

  /**
   * RECEIVE MESSAGE
   */

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

  /**
   * DISCONNECT EVENT
   */

  socket.on("disconnect", () => {

    console.log(
      "Socket desconectado"
    );
  });

  /**
   * CLEANUP
   */

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
      }
    );

    setMessage("");
  };

  return (
    <>
      <AppLayout>

      <main className="room">


        <section className="room__container">

          {/* HEADER */}
          <header className="room__header">

            <div>

              <h1 className="room__title">
                Sala colaborativa
              </h1>

              <p className="room__subtitle">
                Comunicación en tiempo real
                mediante WebSockets.
              </p>

            </div>

            <div className="room__badge">
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
                      className="room-message"
                    >

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
    </>
  );
}