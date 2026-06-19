// src/components/VideoGrid/VideoGrid.tsx

import { MessageSquare, Mic, MicOff, Video, VideoOff } from "lucide-react";
import VideoCard from "./VideoCard";
import type { Participant } from "../../types/socket";
import "./VideoGrid.css";
import { LogOut, MonitorUp } from "lucide-react";


interface LocalAVState {
  isMuted: boolean;
  isCameraOff: boolean;
}

interface VideoGridProps {
  participants: Participant[];
  localParticipant: Participant | null;
  localStream: MediaStream | null;
  /** Map de socketId → MediaStream remoto — viene de useWebRTC */
  remoteStreams: Map<string, MediaStream>;
  localAV: LocalAVState;
  speakingParticipants: Set<string>;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;  
  isScreenSharing: boolean;         
  onLeaveRoom: () => void;   
  isChatOpen: boolean;
  onToggleChat: () => void;
}

export default function VideoGrid({
  participants,
  localParticipant,
  localStream,
  remoteStreams,
  localAV,
  speakingParticipants,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
  isScreenSharing,
  onLeaveRoom,
  isChatOpen,
  onToggleChat,
}: VideoGridProps): React.JSX.Element {
  const totalCards = participants.length + 1;
  const localIsSharing = isScreenSharing;
  const remoteSharer =
      participants.find(
          p => p.isScreenSharing
      );

  const screenSharer =
      localIsSharing
          ? localParticipant
          : remoteSharer;

  const isPresentationMode =
      localIsSharing ||
      !!remoteSharer;

  const normalParticipants =
    participants.filter(
        p => !p.isScreenSharing
    );

  if (isPresentationMode) {

    return (

      <section
          className="presentation-layout"
          aria-label="Presentación"
      >

          <div className="presentation-layout__screen">

              {screenSharer && (

                  <VideoCard
                      participant={screenSharer}
                      stream={
                        screenSharer.socketId === localParticipant?.socketId
                            ? localStream
                            : remoteStreams.get(screenSharer.socketId) ?? null
                      }
                      isMuted={
                          screenSharer.socketId === localParticipant?.socketId
                              ? localAV.isMuted
                              : screenSharer.isMicrophoneOn === false
                      }
                      isCameraOff={false}
                      isScreenShare
                      isSpeaking={
                          screenSharer.socketId === localParticipant?.socketId
                              ? speakingParticipants.has("local")
                              : speakingParticipants.has(screenSharer.socketId)
                      }
                  />

              )}

          </div>

          <aside className="presentation-layout__participants">

              {/* TU VIDEO */}

              {localParticipant && (

                  <VideoCard
                      participant={localParticipant}
                      isLocal
                      stream={localStream}
                      isMuted={localAV.isMuted}
                      isCameraOff={localAV.isCameraOff}
                      isSpeaking={
                          speakingParticipants.has("local")
                      }
                  />

              )}

              {/* RESTO */}

              {normalParticipants.map((participant) => (

                  <VideoCard
                      key={participant.socketId}
                      participant={participant}
                      stream={
                        remoteStreams.get(participant.socketId) ?? null
                      }
                      isMuted={
                          participant.isMicrophoneOn === false
                      }
                      isCameraOff={
                          participant.isCameraOn === false
                      }
                      isSpeaking={
                          speakingParticipants.has(
                              participant.socketId
                          )
                      }
                  />

              ))}

          </aside>

          {/* CONTROLES AV */}
          <div className="video-grid__controls" role="toolbar" aria-label="Controles de audio y video">
            <button
              type="button"
              className={`video-grid__control-btn ${localAV.isMuted ? "video-grid__control-btn--active" : ""}`}
              onClick={onToggleMute}
              aria-label={localAV.isMuted ? "Activar micrófono" : "Silenciar micrófono"}
              aria-pressed={localAV.isMuted}
            >
              {localAV.isMuted
                ? <MicOff size={18} aria-hidden="true" />
                : <Mic size={18} aria-hidden="true" />
              }
              <span className="video-grid__control-label">
                {localAV.isMuted ? "Activar mic" : "Silenciar"}
              </span>
            </button>

            <button
              type="button"
              className={`video-grid__control-btn ${localAV.isCameraOff ? "video-grid__control-btn--active" : ""}`}
              onClick={onToggleCamera}
              aria-label={localAV.isCameraOff ? "Activar cámara" : "Apagar cámara"}
              aria-pressed={localAV.isCameraOff}
            >
              {localAV.isCameraOff
                ? <VideoOff size={18} aria-hidden="true" />
                : <Video size={18} aria-hidden="true" />
              }
              <span className="video-grid__control-label">
                {localAV.isCameraOff ? "Activar cam" : "Apagar cam"}
              </span>
            </button>

            <button
              type="button"
              className={`video-grid__control-btn ${
                  isScreenSharing
                      ? "video-grid__control-btn--active"
                      : ""
              }`}
              onClick={onToggleScreenShare}
            >
              {
                isScreenSharing
                    ? <Video size={18}/>
                    : <MonitorUp size={18}/>
              }
              <span className="video-grid__control-label">
                {isScreenSharing
                    ? "Dejar de compartir"
                    : "Compartir"}
              </span>
            </button>

            <button
              type="button"
              className={`video-grid__control-btn video-grid__control-btn--chat ${isChatOpen ? "video-grid__control-btn--chat-open" : ""}`}
              onClick={onToggleChat}
              aria-label={isChatOpen ? "Ocultar chat" : "Mostrar chat"}
              aria-pressed={isChatOpen}
            >
              <MessageSquare size={18} aria-hidden="true" />
              <span className="video-grid__control-label">
                {isChatOpen ? "Ocultar chat" : "Chat"}
              </span>
            </button>

            <button
              type="button"
              className="video-grid__control-btn video-grid__control-btn--danger"
              onClick={onLeaveRoom}
            >
              <LogOut size={18}/>
              <span className="video-grid__control-label">
                  Salir
              </span>
            </button>
          </div>
      </section>

    );
  }

  return (
    <section
      className={`
          video-grid
          video-grid--count-${Math.min(totalCards,9)}
          ${
              isPresentationMode
                  ? "video-grid--presentation"
                  : ""
          }
      `}
      aria-label="Cuadrícula de participantes"
    >
      {/* TARJETA LOCAL */}
      {localParticipant && (
        <VideoCard
          participant={localParticipant}
          isLocal
          stream={localStream}
          isMuted={localAV.isMuted}
          isCameraOff={isScreenSharing? false: localAV.isCameraOff}
          isSpeaking={speakingParticipants.has("local")}
        />
      )}

      {/* TARJETAS REMOTAS — cada una recibe su stream por socketId */}
      {/* Participantes normales */}
      {normalParticipants.map((participant) => (
        <VideoCard
            key={participant.socketId}
            participant={participant}
            isLocal={false}
            stream={remoteStreams.get(participant.socketId) ?? null}
            isMuted={participant.isMicrophoneOn === false}
            isCameraOff={participant.isCameraOn === false}
            isSpeaking={speakingParticipants.has(participant.socketId)}
        />
      ))}

      {/* CONTROLES AV */}
      <div className="video-grid__controls" role="toolbar" aria-label="Controles de audio y video">
        <button
          type="button"
          className={`video-grid__control-btn ${localAV.isMuted ? "video-grid__control-btn--active" : ""}`}
          onClick={onToggleMute}
          aria-label={localAV.isMuted ? "Activar micrófono" : "Silenciar micrófono"}
          aria-pressed={localAV.isMuted}
        >
          {localAV.isMuted
            ? <MicOff size={18} aria-hidden="true" />
            : <Mic size={18} aria-hidden="true" />
          }
          <span className="video-grid__control-label">
            {localAV.isMuted ? "Activar mic" : "Silenciar"}
          </span>
        </button>

        <button
          type="button"
          className={`video-grid__control-btn ${localAV.isCameraOff ? "video-grid__control-btn--active" : ""}`}
          onClick={onToggleCamera}
          aria-label={localAV.isCameraOff ? "Activar cámara" : "Apagar cámara"}
          aria-pressed={localAV.isCameraOff}
        >
          {localAV.isCameraOff
            ? <VideoOff size={18} aria-hidden="true" />
            : <Video size={18} aria-hidden="true" />
          }
          <span className="video-grid__control-label">
            {localAV.isCameraOff ? "Activar cam" : "Apagar cam"}
          </span>
        </button>

        <button
          type="button"
          className={`video-grid__control-btn ${
              isScreenSharing
                  ? "video-grid__control-btn--active"
                  : ""
          }`}
          onClick={onToggleScreenShare}
        >
          {
            isScreenSharing
                ? <Video size={18}/>
                : <MonitorUp size={18}/>
          }
          <span className="video-grid__control-label">
            {isScreenSharing
                ? "Dejar de compartir"
                : "Compartir"}
          </span>
        </button>

        <button
          type="button"
          className={`video-grid__control-btn video-grid__control-btn--chat ${isChatOpen ? "video-grid__control-btn--chat-open" : ""}`}
          onClick={onToggleChat}
          aria-label={isChatOpen ? "Ocultar chat" : "Mostrar chat"}
          aria-pressed={isChatOpen}
        >
          <MessageSquare size={18} aria-hidden="true" />
          <span className="video-grid__control-label">
            {isChatOpen ? "Ocultar chat" : "Chat"}
          </span>
        </button>

        <button
          type="button"
          className="video-grid__control-btn video-grid__control-btn--danger"
          onClick={onLeaveRoom}
        >
          <LogOut size={18}/>
          <span className="video-grid__control-label">
              Salir
          </span>
        </button>

      </div>
    </section>
  );
}
