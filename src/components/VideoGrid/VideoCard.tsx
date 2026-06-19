// src/components/VideoGrid/VideoCard.tsx

import { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { Participant } from "../../types/socket";

interface VideoCardProps {
  participant: Participant;
  isLocal?: boolean;
  stream?: MediaStream | null;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isSpeaking?: boolean;
  preview?: boolean;
  isScreenShare?: boolean;
}

const getInitial = (name: string): string =>
  name?.[0]?.toUpperCase() ?? "?";

export default function VideoCard({
  participant,
  isLocal = false,
  stream = null,
  isMuted = false,
  isCameraOff = false,
  isSpeaking = false,
  preview = false,
  isScreenShare = false,
}: VideoCardProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Keep video and remote audio attached separately so hiding video never kills audio.
  useEffect(() => {
    const videoElement = videoRef.current;
    const audioElement = audioRef.current;

    if (videoElement) {
      videoElement.srcObject = stream;
      void videoElement.play().catch(() => undefined);
    }

    if (audioElement) {
      const audioTracks = stream?.getAudioTracks() ?? [];
      audioElement.srcObject =
        audioTracks.length > 0
          ? new MediaStream(audioTracks)
          : null;

      if (audioElement.srcObject) {
        void audioElement.play().catch(() => undefined);
      }
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }

      if (audioElement) {
        audioElement.srcObject = null;
      }
    };
  }, [stream]);

  const showVideo = !!stream && !isCameraOff;
  const cardClassName = [
    "video-card",
    isLocal ? "video-card--local" : "",
    isCameraOff ? "video-card--no-camera" : "",
    isSpeaking ? "video-card--speaking" : "",
    isScreenShare ? "video-card--screen-share" : "",
  ]
  .filter(Boolean)
  .join(" ");

  return (
    <article
      className={cardClassName}
      aria-label={`Video de ${participant.username}${isLocal ? ", tú" : ""}`}
    >
      {/* VIDEO ELEMENT — oculto cuando cámara apagada */}
      <video
        ref={videoRef}
        className={`video-card__video ${showVideo ? "" : "video-card__video--hidden"}`}
        autoPlay
        playsInline
        muted
        aria-hidden="true"
      />

      {!isLocal && (
        <audio
          ref={audioRef}
          autoPlay
          playsInline
          aria-hidden="true"
        />
      )}

      {/* AVATAR FALLBACK — visible cuando no hay stream o cámara apagada */}
      {!showVideo && (
        <div className="video-card__avatar" aria-hidden="true">
          {participant.avatarUrl ? (
            <img
              src={participant.avatarUrl}
              alt={participant.username}
              className="video-card__avatar-img"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="video-card__avatar-initial">
              {getInitial(participant.username)}
            </span>
          )}
        </div>
      )}

      {/* FOOTER — nombre + indicadores AV */}
      <footer className="video-card__footer">
        <span className="video-card__name">
          {preview ? "Vista previa" : `@${participant.username}`}

          {isLocal && !preview && (
            <span className="video-card__you-tag">
              tú
            </span>
          )}
        </span>

        <div
          className="video-card__av"
          aria-label={`${isMuted ? "Micrófono silenciado" : "Micrófono activo"}, ${isCameraOff ? "Cámara apagada" : "Cámara activa"}`}
        >
          {isMuted ? (
            <MicOff
              size={13}
              className="video-card__av-icon video-card__av-icon--off"
              aria-hidden="true"
            />
          ) : (
            <Mic
              size={13}
              className="video-card__av-icon video-card__av-icon--on"
              aria-hidden="true"
            />
          )}
          {isCameraOff ? (
            <VideoOff
              size={13}
              className="video-card__av-icon video-card__av-icon--off"
              aria-hidden="true"
            />
          ) : (
            <Video
              size={13}
              className="video-card__av-icon video-card__av-icon--on"
              aria-hidden="true"
            />
          )}
        </div>
      </footer>

      {/* LOCAL BADGE */}
      {isLocal && !preview && (
        <div className="video-card__local-badge" aria-hidden="true">
          En vivo
        </div>
      )}
    </article>
  );
}
