// src/hooks/useWebRTC.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { socket } from "../services/socket";
import {
  sendWebRtcOffer,
  sendWebRtcAnswer,
  sendIceCandidate,
  sendParticipantMediaState,
  sendScreenShareState,
} from "../services/socket";
import { WebRtcService } from "../services/webRtcService";
import type { Participant } from "../types/socket";

interface UseWebRTCProps {
  participants: Participant[];
  localUid: string;
  initialCameraOn?: boolean;
  initialMicOn?: boolean;
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  speakingParticipants: Set<string>;
  toggleMute: () => void;
  toggleCamera: () => void;
  toggleScreenShare: () => Promise<void>;
}

export function useWebRTC({
  participants,
  localUid,
  initialCameraOn = true,
  initialMicOn = true,
}: UseWebRTCProps): UseWebRTCReturn {

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(!initialMicOn);
  const [isCameraOff, setIsCameraOff] = useState(!initialCameraOn);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);

  const [speakingParticipants, setSpeakingParticipants] =
    useState<Set<string>>(new Set());

  const serviceRef = useRef<WebRtcService | null>(null);

  // FIX Bug 4: Un solo prevParticipantsRef aquí en useWebRTC.
  // useRoomSocket tiene el suyo para notificaciones (joined/left),
  // pero no debe interferir con la lógica WebRTC.
  // La clave: inicializamos con los participantes actuales al montar,
  // así evitamos que en el primer render se traten todos como "nuevos"
  // y el recién llegado mande offers a todos (lo que causaría glare).
  const prevParticipantsRef = useRef<Participant[]>([]);
  const isInitializedRef = useRef(false);

  const speakingCleanups =
    useRef<Map<string, () => void>>(new Map());

  // ─────────────────────────────────────────────────────────────
  // 1. INICIALIZAR SERVICIO + STREAM LOCAL
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const service = new WebRtcService({
      onSendOffer: (targetSocketId, offer) =>
        sendWebRtcOffer({ targetSocketId, offer }),
      onSendAnswer: (targetSocketId, answer) =>
        sendWebRtcAnswer({ targetSocketId, answer }),
      onSendIceCandidate: (targetSocketId, candidate) =>
        sendIceCandidate({ targetSocketId, candidate }),
      onRemoteStream: (socketId, stream) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(socketId, stream);
          return next;
        });
      },
      onPeerDisconnected: (socketId) => {
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.delete(socketId);
          return next;
        });
      },
    });

    serviceRef.current = service;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getAudioTracks().forEach((track) => {
          track.enabled = initialMicOn;
        });
        stream.getVideoTracks().forEach((track) => {
          track.enabled = initialCameraOn;
        });
        cameraTrackRef.current = stream.getVideoTracks()[0] ?? null;
        service.setLocalStream(stream);
        setLocalStream(stream);
        console.log("[WebRTC] Stream local obtenido ✓");
      })
      .catch((err) => {
        console.warn("[WebRTC] Sin acceso a cámara/micrófono:", err);
      });

    return () => {
      service.closeAll();
      serviceRef.current = null;
      isInitializedRef.current = false;
      prevParticipantsRef.current = [];
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 2. ESCUCHAR SEÑALIZACIÓN DEL SOCKET
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onReceiveOffer = async (data: {
      fromSocketId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      console.log("[WebRTC] Recibida oferta de", data.fromSocketId);
      await serviceRef.current?.handleOffer(data.fromSocketId, data.offer);
    };

    const onReceiveAnswer = async (data: {
      fromSocketId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      console.log("[WebRTC] Recibida respuesta de", data.fromSocketId);
      await serviceRef.current?.handleAnswer(data.fromSocketId, data.answer);
    };

    const onReceiveIceCandidate = async (data: {
      fromSocketId: string;
      candidate: RTCIceCandidateInit;
    }) => {
      await serviceRef.current?.handleIceCandidate(
        data.fromSocketId,
        data.candidate
      );
    };

    socket.on("receive-webrtc-offer", onReceiveOffer);
    socket.on("receive-webrtc-answer", onReceiveAnswer);
    socket.on("receive-ice-candidate", onReceiveIceCandidate);

    return () => {
      socket.off("receive-webrtc-offer", onReceiveOffer);
      socket.off("receive-webrtc-answer", onReceiveAnswer);
      socket.off("receive-ice-candidate", onReceiveIceCandidate);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 3. DETECTAR PARTICIPANTES NUEVOS → CREAR PEERS
  //
  // FIX Bug 4: El primer render con participantes se usa para
  // inicializar prevParticipantsRef SIN crear peers.
  // Esto evita que el recién llegado trate a todos los existentes
  // como "nuevos" y mande offers, lo que causaría glare (ambos
  // lados mandando offer al mismo tiempo).
  //
  // Solo creamos peers cuando detectamos participantes que se
  // UNEN después de que ya estábamos inicializados.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    // Primera vez que recibimos participantes: inicializar ref y salir.
    // No creamos peers todavía — si hay otros en la sala, ellos
    // ya nos mandarán un offer al detectar que entramos (desde su
    // participants-updated donde nosotros somos los "nuevos").
    if (!isInitializedRef.current) {
      prevParticipantsRef.current = participants;
      isInitializedRef.current = true;
      return;
    }

    const prev = prevParticipantsRef.current;

    const joined = participants.filter(
      (p) => !prev.some((old) => old.socketId === p.socketId)
    );

    const left = prev.filter(
      (old) => !participants.some((p) => p.socketId === old.socketId)
    );

    // Solo los que ya estaban crean el offer hacia el recién llegado.
    // El recién llegado simplemente espera los offers entrantes.
    joined.forEach((p) => {
      if (p.uid === localUid) return;

      // Nosotros ya estábamos inicializados → somos el iniciador
      console.log(
        `[WebRTC] Nuevo participante ${p.username}, creando oferta...`
      );
      service.createPeerAsInitiator(p.socketId);
    });

    left.forEach((p) => {
      console.log(`[WebRTC] ${p.username} salió, cerrando peer...`);
      service.closePeer(p.socketId);
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(p.socketId);
        return next;
      });
    });

    prevParticipantsRef.current = participants;
  }, [participants, localUid]);

  // ─────────────────────────────────────────────────────────────
  // 4. DETECCIÓN DE VOZ
  // ─────────────────────────────────────────────────────────────
  const monitorSpeaking = useCallback(
    (stream: MediaStream, participantId: string) => {
      if (stream.getAudioTracks().length === 0) return () => {};

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let animationId = 0;
      const speakingThreshold = 12;

      const checkVolume = () => {
        analyser.getByteFrequencyData(data);
        const average =
          data.reduce((sum, value) => sum + value, 0) / data.length;

        setSpeakingParticipants((previous) => {
          const next = new Set(previous);
          const isSpeaking = average > speakingThreshold;
          const wasSpeaking = previous.has(participantId);
          if (isSpeaking === wasSpeaking) return previous;
          if (isSpeaking) next.add(participantId);
          else next.delete(participantId);
          return next;
        });

        animationId = requestAnimationFrame(checkVolume);
      };

      checkVolume();

      return () => {
        cancelAnimationFrame(animationId);
        source.disconnect();
        analyser.disconnect();
        void audioContext.close();
      };
    },
    []
  );

  useEffect(() => {
    if (localStream && !speakingCleanups.current.has("local")) {
      const cleanup = monitorSpeaking(localStream, "local");
      speakingCleanups.current.set("local", cleanup);
    }

    remoteStreams.forEach((stream, socketId) => {
      if (!speakingCleanups.current.has(socketId)) {
        const cleanup = monitorSpeaking(stream, socketId);
        speakingCleanups.current.set(socketId, cleanup);
      }
    });

    return () => {
      speakingCleanups.current.forEach((cleanup) => cleanup());
      speakingCleanups.current.clear();
    };
  }, [localStream, remoteStreams, monitorSpeaking]);

  // ─────────────────────────────────────────────────────────────
  // 5. CONTROLES AV
  // ─────────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    serviceRef.current?.updateTrackState("audio", !newMuted);
    sendParticipantMediaState({ isMicrophoneOn: !newMuted });
    setIsMuted(newMuted);
  }, [isMuted]);

  const toggleCamera = useCallback(() => {
    const newOff = !isCameraOff;
    serviceRef.current?.updateTrackState("video", !newOff);
    sendParticipantMediaState({ isCameraOn: !newOff });
    setIsCameraOff(newOff);
  }, [isCameraOff]);

  const toggleScreenShare = useCallback(async () => {
    if (!serviceRef.current || !localStream) return;

    if (isScreenSharing) {
      const cameraTrack = cameraTrackRef.current;
      if (!cameraTrack) return;

      serviceRef.current.replaceVideoTrack(cameraTrack);
      setLocalStream(
        new MediaStream([...localStream.getAudioTracks(), cameraTrack])
      );
      setIsScreenSharing(false);
      sendScreenShareState(false);
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      const screenTrack = displayStream.getVideoTracks()[0];

      serviceRef.current.replaceVideoTrack(screenTrack);
      setLocalStream(
        new MediaStream([...localStream.getAudioTracks(), screenTrack])
      );
      setIsScreenSharing(true);
      sendScreenShareState(true);

      screenTrack.onended = () => {
        const cameraTrack = cameraTrackRef.current;
        if (!cameraTrack) return;
        serviceRef.current?.replaceVideoTrack(cameraTrack);
        setLocalStream(
          new MediaStream([...localStream.getAudioTracks(), cameraTrack])
        );
        setIsScreenSharing(false);
        sendScreenShareState(false);
      };
    } catch (err) {
      console.log("Compartir pantalla cancelado", err);
    }
  }, [localStream, isScreenSharing]);

  return {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    speakingParticipants,
    toggleMute,
    toggleCamera,
    toggleScreenShare,
  };
}