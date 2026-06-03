// src/pages/Room/Room.tsx

import {
  type FormEvent,
  useEffect,
  useRef,
  useState
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import AppLayout from "../../layouts/AppLayout";
import Button from "../../components/ui/Button";
import { MessageSquareOff, Mic, MicOff, Video, VideoOff, LogOut, Users } from "lucide-react";
import { useRoomSocket } from "../../hooks/useRoomSocket";
import { useAuthStore } from "../../store/useAuthStore";
import { useRoomStore } from "../../store/useRoomStore";
import { useSnackbar } from "../../context/SnackbarContext";
import "./Room.css";

export default function Room(): React.JSX.Element {

  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { showSnackbar } = useSnackbar();

  if (!roomId || !profile) {
    return (
      <AppLayout>
        <main className="room">
          <p>Cargando sala...</p>
        </main>
      </AppLayout>
    );
  }

  const {
    messages,
    participants,
    isConnected,
    sendChatMessage,
  } = useRoomSocket({
    roomId,
    uid: profile.uid,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
    onParticipantJoined: (username) => {
      showSnackbar(`${username} se unió a la sala 👋`, "success");
    },
    onParticipantLeft: (username) => {
      showSnackbar(`${username} abandonó la sala`, "error");
    },
  });

  const { searchRoomById } = useRoomStore();

  const [message, setMessage] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // =========================================
  // LOAD ROOM
  // =========================================

  useEffect(() => {
    const loadRoom = async () => {
      if (!roomId) return;

      const room = await searchRoomById(roomId);

      if (!room) {
        navigate("/rooms");
        return;
      }

      setCurrentRoom(room);
    };

    loadRoom();
  }, [roomId, searchRoomById, navigate]);

  // =========================================
  // AUTO SCROLL
  // =========================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // =========================================
  // SEND MESSAGE
  // =========================================

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!message.trim()) return;

    sendChatMessage(message);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleLeaveRoom = (): void => {
    navigate("/rooms");
  };

  // =========================================
  // HELPERS
  // =========================================

  const formatTime = (dateStr: string): string => {
    return new Date(dateStr).toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitial = (name: string): string =>
    name?.[0]?.toUpperCase() ?? "?";

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
                onClick={handleLeaveRoom}
                aria-label="Salir de la sesión"
              >
                <LogOut size={16} />
                Salir
              </button>

              <div>
                <div className="room__badge">Sala colaborativa</div>

                <h1 className="room__title">
                  {currentRoom?.name ?? "Cargando sala..."}
                </h1>

                <p className="room__subtitle">
                  Comunicación en tiempo real mediante WebSockets.
                </p>

                <div className="room__connection" aria-live="polite">
                  <span className={`room__connection-dot ${isConnected ? "room__connection-dot--on" : "room__connection-dot--off"}`} />
                  {isConnected ? "Conectado" : "Desconectado"}
                </div>
              </div>
            </div>

            <div className="room__room-id">
              <span className="room__room-id-label">ID de sala</span>
              <span className="room__room-id-value">{roomId}</span>
            </div>
          </header>

          {/* CONTENT */}
          <section className="room-content">

            {/* SIDEBAR — PARTICIPANTS */}
            <aside className="room-sidebar" aria-labelledby="participants-title">

              <div className="room-sidebar__header">
                <div className="room-sidebar__header-left">
                  <Users size={16} />
                  <h2 id="participants-title">Participantes</h2>
                </div>
                <span className="room-sidebar__count">
                  {participants.length}
                </span>
              </div>

              <div className="room-sidebar__list" role="list">
                {participants.length === 0 ? (
                  <p className="room-sidebar__empty">
                    Aún no hay participantes.
                  </p>
                ) : (
                  participants.map((participant) => {

                    // Mock AV states — placeholders hasta Sprint 5
                    const isMuted = false;
                    const isCameraOff = false;
                    const isMe = participant.uid === profile.uid;

                    return (
                      <article
                        key={participant.socketId}
                        className={`room-sidebar__participant ${isMe ? "room-sidebar__participant--me" : ""}`}
                        role="listitem"
                        aria-label={`${participant.username}${isMe ? ", tú" : ""}`}
                      >
                        <div className="room-sidebar__avatar-wrap">
                          <div className="room-sidebar__avatar">
                            {participant.avatarUrl ? (
                              <img
                                src={participant.avatarUrl}
                                alt={participant.username}
                                className="room-sidebar__avatar-img"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span>{getInitial(participant.username)}</span>
                            )}
                          </div>
                          <span
                            className="room-sidebar__online-dot"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="room-sidebar__info">
                          <p className="room-sidebar__name">
                            @{participant.username}
                            {isMe && <span className="room-sidebar__you-tag">tú</span>}
                          </p>
                          <small className="room-sidebar__status">Conectado</small>
                        </div>

                        {/* Mock AV icons */}
                        <div
                          className="room-sidebar__av"
                          aria-label={`${isMuted ? "Micrófono silenciado" : "Micrófono activo"}, ${isCameraOff ? "Cámara apagada" : "Cámara activa"}`}
                        >
                          {isMuted
                            ? <MicOff size={14} className="room-sidebar__av-icon room-sidebar__av-icon--off" aria-hidden="true" />
                            : <Mic size={14} className="room-sidebar__av-icon room-sidebar__av-icon--on" aria-hidden="true" />
                          }
                          {isCameraOff
                            ? <VideoOff size={14} className="room-sidebar__av-icon room-sidebar__av-icon--off" aria-hidden="true" />
                            : <Video size={14} className="room-sidebar__av-icon room-sidebar__av-icon--on" aria-hidden="true" />
                          }
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </aside>

            {/* CHAT */}
            <section
              className="room-chat"
              aria-label="Chat de la sala"
            >
              <div className="room-chat__messages" role="log" aria-live="polite" aria-label="Mensajes del chat">

                {messages.length === 0 ? (
                  <div className="room-chat__empty">
                    <MessageSquareOff size={48} strokeWidth={1.5} />
                    <p>Aún no hay mensajes en esta sala.</p>
                    <small>¡Sé el primero en escribir algo!</small>
                  </div>
                ) : (
                  messages.map((chat, index) => {

                    const isOwn = chat.username === profile?.username;
                    const prevMessage = messages[index - 1];
                    const isConsecutive =
                      prevMessage?.username === chat.username;

                    return (
                      <article
                        key={`${chat.userUid}-${chat.createdAt}-${index}`}
                        className={`room-message ${isOwn ? "room-message--own" : "room-message--other"} ${isConsecutive ? "room-message--consecutive" : ""}`}
                        aria-label={`Mensaje de ${chat.username}`}
                      >
                        {/* Avatar — oculto en mensajes consecutivos */}
                        <div
                          className={`room-message__avatar ${isConsecutive ? "room-message__avatar--hidden" : ""}`}
                          aria-hidden="true"
                        >
                          {!isConsecutive && (
                            chat.avatarUrl ? (
                              <img
                                src={chat.avatarUrl}
                                alt={chat.username}
                                className="room-message__avatar-image"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span>{getInitial(chat.username)}</span>
                            )
                          )}
                        </div>

                        <div className="room-message__content">
                          {!isConsecutive && (
                            <div className="room-message__header">
                              <span className="room-message__user">
                                @{chat.username}
                              </span>
                              <span className="room-message__time">
                                {formatTime(chat.createdAt)}
                              </span>
                            </div>
                          )}
                          <p className="room-message__text">{chat.message}</p>
                          {isConsecutive && (
                            <span className="room-message__time room-message__time--inline">
                              {formatTime(chat.createdAt)}
                            </span>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* INPUT */}
              <form onSubmit={handleSubmit} className="room-chat__form">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="room-chat__input"
                  aria-label="Campo de mensaje"
                  maxLength={500}
                />
                <Button
                  type="submit"
                  disabled={!message.trim()}
                  aria-label="Enviar mensaje"
                >
                  Enviar
                </Button>
              </form>
            </section>

          </section>
        </section>
      </main>
    </AppLayout>
  );
}