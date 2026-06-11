// src/components/VideoGrid/VideoGrid.tsx

import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import VideoCard from "./VideoCard";
import type { Participant } from "../../types/socket";
import "./VideoGrid.css";

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
  onToggleMute: () => void;
  onToggleCamera: () => void;
}

export default function VideoGrid({
  participants,
  localParticipant,
  localStream,
  remoteStreams,
  localAV,
  onToggleMute,
  onToggleCamera,
}: VideoGridProps): React.JSX.Element {
  const totalCards = participants.length + 1;

  return (
    <section
      className={`video-grid video-grid--count-${Math.min(totalCards, 9)}`}
      aria-label="Cuadrícula de participantes"
    >
      {/* TARJETA LOCAL */}
      {localParticipant && (
        <VideoCard
          participant={localParticipant}
          isLocal
          stream={localStream}
          isMuted={localAV.isMuted}
          isCameraOff={localAV.isCameraOff}
        />
      )}

      {/* TARJETAS REMOTAS — cada una recibe su stream por socketId */}
      {participants.map((participant) => (
        <VideoCard
          key={participant.socketId}
          participant={participant}
          isLocal={false}
          stream={remoteStreams.get(participant.socketId) ?? null}
          isMuted={false}    // TODO US-13: señalización de estado AV remoto
          isCameraOff={false}
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
      </div>
    </section>
  );
}