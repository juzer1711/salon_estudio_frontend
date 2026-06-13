// src/pages/Room/Room.tsx

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import EditRoomModal from "../../components/modals/EditRoomModal";
import DeleteRoomModal from "../../components/modals/DeleteRoomModal";
import VideoGrid from "../../components/VideoGrid/VideoGrid";

import { useLocation } from "react-router-dom";
import { useNavigate, useParams } from "react-router-dom";
import type { StudyRoom } from "../../services/roomService";
import AppLayout from "../../layouts/AppLayout";
import Button from "../../components/ui/Button";
import { MessageSquareOff, LogOut, MoreVertical } from "lucide-react";

import { useRoomSocket } from "../../hooks/useRoomSocket";
import { useWebRTC } from "../../hooks/useWebRTC";
import { useAuthStore } from "../../store/useAuthStore";
import { useRoomStore } from "../../store/useRoomStore";
import { useSnackbar } from "../../context/SnackbarContext";
import { formatTime } from "../../utils/formatDate";
import "./Room.css";


export default function Room(): React.JSX.Element {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { showSnackbar } = useSnackbar();

  const [message, setMessage] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<StudyRoom | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [editingRoom, setEditingRoom] = useState<StudyRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<StudyRoom | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

  const previewState = location.state as {
      isCameraOn?: boolean;
      isMicOn?: boolean;
  } | null;

  // ── Socket (chat + participantes) ────────────────────────────
  const {
    messages,
    participants,
    isConnected,
    sendChatMessage,
  } = useRoomSocket({
    roomId: roomId ?? "",
    uid: profile?.uid ?? "",
    username: profile?.username ?? "",
    avatarUrl: profile?.avatarUrl ?? "",
    onParticipantJoined: (username) =>
      showSnackbar(`${username} se unió a la sala 👋`, "success"),
    onParticipantLeft: (username) =>
      showSnackbar(`${username} abandonó la sala`, "error"),
  });

  // ── WebRTC (cámara, micrófono, peers) ────────────────────────
  // Recibe la misma lista `participants` del socket y
  // crea/destruye RTCPeerConnections automáticamente
  const {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    speakingParticipants,
    toggleMute,
    toggleCamera,
  } = useWebRTC({
    participants,
    localUid: profile?.uid ?? "",
    initialCameraOn: previewState?.isCameraOn,
    initialMicOn: previewState?.isMicOn,
  });

  const { searchRoomById, editRoom, removeRoom } = useRoomStore();
  const isOwner = profile?.uid === currentRoom?.ownerUid;

  if (!roomId || !profile) {
    return (
      <AppLayout>
        <main className="room">
          <p>Cargando sala...</p>
        </main>
      </AppLayout>
    );
  }

  // ── Cargar sala ───────────────────────────────────────────────
  useEffect(() => {
    const loadRoom = async () => {
      const room = await searchRoomById(roomId);
      if (!room) { navigate("/rooms"); return; }
      setCurrentRoom(room);
    };
    loadRoom();
  }, [roomId, searchRoomById, navigate]);

  // ── Auto scroll chat ──────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Click outside menú ────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Handlers ─────────────────────────────────────────────────
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!message.trim()) return;
    sendChatMessage(message);
    setMessage("");
    inputRef.current?.focus();
  };

  // Participante local con la misma forma que Participant
  const localParticipant = {
    uid: profile.uid,
    username: profile.username,
    avatarUrl: profile.avatarUrl ?? "",
    socketId: "local",
  };

  // Participantes remotos = todos salvo el usuario actual
  const remoteParticipants = participants.filter((p) => p.uid !== profile.uid);

  return (
    <AppLayout>
      <main className="room">
        <section className="room__container">

          {/* ── HEADER ─────────────────────────────────────────── */}
          <header className="room__header">
            <div className="room__header-left">
              <button
                type="button"
                className="room__back"
                onClick={() => navigate("/rooms")}
                aria-label="Salir de la sesión"
              >
                <LogOut size={16} /> Salir
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

            <div className="room__actions" ref={menuRef}>
              <div className="room__room-id">
                <span className="room__room-id-label">ID de sala: </span>
                <span className="room__room-id-value">{roomId}</span>
              </div>
              {isOwner && (
                <button
                  type="button"
                  className="room__menu-button"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical size={18} />
                </button>
              )}
              {showMenu && (
                <div className="room__menu">
                  <button className="room__menu-item" onClick={() => { setShowMenu(false); setEditingRoom(currentRoom); }}>
                    Editar sala
                  </button>
                  <button className="room__menu-item room__menu-item--danger" onClick={() => { setShowMenu(false); setDeletingRoom(currentRoom); }}>
                    Eliminar sala
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* ── CONTENT: Video Grid + Chat ──────────────────────── */}
          <section className={`room-content ${!isChatOpen ? "room-content--chat-hidden" : ""}`}>

            {/* VIDEO GRID — pasa los streams remotos por socketId */}
            <VideoGrid
              participants={remoteParticipants}
              localParticipant={localParticipant}
              localStream={localStream}
              remoteStreams={remoteStreams}
              localAV={{ isMuted, isCameraOff }}
              onToggleMute={toggleMute}
              onToggleCamera={toggleCamera}
              isChatOpen={isChatOpen}
              onToggleChat={() => setIsChatOpen((prev) => !prev)}
              speakingParticipants={speakingParticipants}
            />

            {/* CHAT */}
            <section className="room-chat" aria-label="Chat de la sala" aria-hidden={!isChatOpen}>
              <div className="room-chat__messages" role="log" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="room-chat__empty">
                    <MessageSquareOff size={48} strokeWidth={1.5} />
                    <p>Aún no hay mensajes en esta sala.</p>
                    <small>¡Sé el primero en escribir algo!</small>
                  </div>
                ) : (
                  messages.map((chat, index) => {
                    const isOwn = chat.username === profile.username;
                    const isConsecutive = messages[index - 1]?.username === chat.username;

                    return (
                      <article
                        key={`${chat.userUid}-${chat.createdAt}-${index}`}
                        className={`room-message ${isOwn ? "room-message--own" : "room-message--other"} ${isConsecutive ? "room-message--consecutive" : ""}`}
                        aria-label={`Mensaje de ${chat.username}`}
                      >
                        <div className={`room-message__avatar ${isConsecutive ? "room-message__avatar--hidden" : ""}`} aria-hidden="true">
                          {!isConsecutive && (
                            chat.avatarUrl
                              ? <img src={chat.avatarUrl} alt={chat.username} className="room-message__avatar-image" referrerPolicy="no-referrer" />
                              : <span>{chat.username?.[0]?.toUpperCase() ?? "?"}</span>
                          )}
                        </div>
                        <div className="room-message__content">
                          {!isConsecutive && (
                            <div className="room-message__header">
                              <span className="room-message__user">@{chat.username}</span>
                              <span className="room-message__time">{formatTime(chat.createdAt)}</span>
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

              <form onSubmit={handleSubmit} className="room-chat__form">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="room-chat__input"
                  aria-label="Campo de mensaje"
                />
                <Button type="submit" disabled={!message.trim()} aria-label="Enviar mensaje">
                  Enviar
                </Button>
              </form>
            </section>

          </section>
        </section>
      </main>

      {editingRoom && (
        <EditRoomModal
          currentName={editingRoom.name}
          onClose={() => setEditingRoom(null)}
          onSave={async (newName) => {
            const success = await editRoom(editingRoom.id, newName);
            if (success) {
              setCurrentRoom((prev: any) => ({ ...prev, name: newName }));
              showSnackbar("Sala actualizada correctamente.", "success");
              setEditingRoom(null);
            }
          }}
        />
      )}

      {deletingRoom && (
        <DeleteRoomModal
          roomName={deletingRoom.name}
          onClose={() => setDeletingRoom(null)}
          onConfirm={async () => {
            const success = await removeRoom(deletingRoom.id);
            if (success) {
              showSnackbar("Sala eliminada correctamente.", "success");
              setDeletingRoom(null);
              navigate("/rooms");
            }
          }}
        />
      )}
    </AppLayout>
  );
}
