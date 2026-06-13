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
  speakingParticipants: Set<string>;
  toggleMute: () => void;
  toggleCamera: () => void;
}

export function useWebRTC({
    participants,
    localUid,
    initialCameraOn = true,
    initialMicOn = true,
}: UseWebRTCProps): UseWebRTCReturn {

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] =
    useState(!initialMicOn);

  const [isCameraOff, setIsCameraOff] =
      useState(!initialCameraOn);

  const [speakingParticipants, setSpeakingParticipants] =
    useState<Set<string>>(new Set());

  const serviceRef = useRef<WebRtcService | null>(null);
  const prevParticipantsRef = useRef<Participant[]>([]);
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
        stream.getAudioTracks().forEach(track => {
            track.enabled = initialMicOn;
        });

        stream.getVideoTracks().forEach(track => {
            track.enabled = initialCameraOn;
        });
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
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // 2. ESCUCHAR SEÑALIZACIÓN DEL SOCKET
  //    FIX: useEffect con [] para que solo se registre una vez
  //    pero accede a serviceRef (ref estable) para siempre
  //    tener el servicio actualizado sin re-registrar listeners
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
      await serviceRef.current?.handleIceCandidate(data.fromSocketId, data.candidate);
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
  //    FIX CRÍTICO: Solo el usuario que YA ESTABA en la sala
  //    crea la oferta (isInitiator). El recién llegado espera
  //    recibir la oferta vía "receive-webrtc-offer".
  //
  //    ¿Cómo sabemos quién "ya estaba"?
  //    Si prev.length > 0 cuando llega el nuevo participante,
  //    significa que nosotros ya estábamos → somos el iniciador.
  //    Si prev.length === 0 (primera vez que vemos participantes),
  //    significa que acabamos de entrar → no creamos oferta.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    const prev = prevParticipantsRef.current;

    const joined = participants.filter(
      (p) => !prev.some((old) => old.socketId === p.socketId)
    );

    const left = prev.filter(
      (old) => !participants.some((p) => p.socketId === old.socketId)
    );

    joined.forEach((p) => {
      if (p.uid === localUid) return; // nunca conectar con uno mismo

      const weWereAlreadyHere = prev.length > 0;

      if (weWereAlreadyHere) {
        // Nosotros ya estábamos → creamos la oferta
        console.log(`[WebRTC] Nuevo participante ${p.username}, creando oferta...`);
        service.createPeerAsInitiator(p.socketId);
      } else {
        // Acabamos de entrar → esperamos la oferta del otro
        console.log(`[WebRTC] Entramos a sala con ${p.username}, esperando oferta...`);
      }
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

  const monitorSpeaking = useCallback(
    (
      stream: MediaStream,
      participantId: string
    ) => {

      if (
        stream.getAudioTracks().length === 0
      ) {
        return () => {};
      }

      const audioContext =
        new AudioContext();

      const analyser =
        audioContext.createAnalyser();

      analyser.fftSize = 512;

      const source =
        audioContext.createMediaStreamSource(stream);

      source.connect(analyser);

      const data =
        new Uint8Array(analyser.frequencyBinCount);

      let animationId = 0;
      const speakingThreshold = 12;

      const checkVolume = () => {

        analyser.getByteFrequencyData(data);

        const average =
          data.reduce((sum, value) => sum + value, 0) /
          data.length;

        setSpeakingParticipants((previous) => {

          const next =
            new Set(previous);

          const isSpeaking =
            average > speakingThreshold;

          const wasSpeaking =
            previous.has(participantId);

          if (isSpeaking === wasSpeaking) {
            return previous;
          }

          if (isSpeaking) {

            next.add(participantId);

          } else {

            next.delete(participantId);

          }

          return next;
        });

        animationId =
          requestAnimationFrame(checkVolume);

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

    if (localStream) {

      if (!speakingCleanups.current.has("local")) {

        const cleanup =
          monitorSpeaking(
            localStream,
            "local"
          );

        speakingCleanups.current.set(
          "local",
          cleanup
        );

      }

    }

    remoteStreams.forEach((stream, socketId) => {

      if (
        !speakingCleanups.current.has(socketId)
      ) {

        const cleanup =
          monitorSpeaking(
            stream,
            socketId
          );

        speakingCleanups.current.set(
          socketId,
          cleanup
        );

      }

    });

    return () => {

      speakingCleanups.current.forEach(
        (cleanup) => cleanup()
      );

      speakingCleanups.current.clear();

    };

  }, [
    localStream,
    remoteStreams,
    monitorSpeaking,
  ]);

  // ─────────────────────────────────────────────────────────────
  // 4. CONTROLES AV
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

  return {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    speakingParticipants,
    toggleMute,
    toggleCamera,
  };
}
