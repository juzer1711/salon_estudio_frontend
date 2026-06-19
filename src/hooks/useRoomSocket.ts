// src/hooks/useRoomSocket.ts

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  socket,
  joinRoom,
  leaveRoom,
  getChatHistory,
  sendMessage,
} from "../services/socket";

import type {
  ChatMessage,
  Participant,
} from "../types/socket";

interface UseRoomSocketProps {
  roomId: string;
  uid: string;
  username: string;
  avatarUrl?: string;
  isCameraOn?: boolean;      // FIX: recibir el estado real de media
  isMicrophoneOn?: boolean;  // FIX: recibir el estado real de media
  onParticipantJoined?: (username: string) => void;
  onParticipantLeft?: (username: string) => void;
}

export function useRoomSocket({
  roomId,
  uid,
  username,
  avatarUrl,
  isCameraOn = true,       // FIX: usar el valor real, no hardcodeado
  isMicrophoneOn = true,   // FIX: usar el valor real, no hardcodeado
  onParticipantJoined,
  onParticipantLeft,
}: UseRoomSocketProps) {

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [isConnected, setIsConnected] =
    useState(false);

  const prevParticipantsRef =
    useRef<Participant[]>([]);

  useEffect(() => {

    // FIX Bug 1 — Race condition:
    // Si el socket ya está conectado cuando montamos el componente,
    // el evento "connect" nunca disparará. Hay que llamar joinRoom
    // directamente en ese caso, además de registrar el listener
    // para futuros reconects.
    const doJoin = () => {
      setIsConnected(true);
      joinRoom({
        roomId,
        uid,
        username,
        avatarUrl,
        isCameraOn,        // FIX Bug 3: usar el estado real
        isMicrophoneOn,    // FIX Bug 3: usar el estado real
      });
      getChatHistory(roomId);
    };

    if (socket.connected) {
      // Ya estaba conectado: unirse directamente
      doJoin();
    } else {
      // No conectado: conectar y esperar el evento
      socket.connect();
    }

    socket.on("connect", doJoin);

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on(
      "chat-history",
      (history: ChatMessage[]) => {
        setMessages(history);
      }
    );

    socket.on(
      "receive-message",
      (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
      }
    );

    socket.on(
      "participants-updated",
      (updated: Participant[]) => {

        const prev = prevParticipantsRef.current;

        if (prev.length > 0) {

          const joined = updated.filter(
            (u) => !prev.some((p) => p.socketId === u.socketId)
          );

          const left = prev.filter(
            (p) => !updated.some((u) => u.socketId === p.socketId)
          );

          joined.forEach((p) => {
            if (p.uid !== uid) {
              onParticipantJoined?.(p.username);
            }
          });

          left.forEach((p) => {
            if (p.uid !== uid) {
              onParticipantLeft?.(p.username);
            }
          });
        }

        prevParticipantsRef.current = updated;
        setParticipants(updated);
      }
    );

    return () => {
      leaveRoom();
      socket.off("connect", doJoin);
      socket.off("disconnect");
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("participants-updated");
      socket.disconnect();
    };

  // FIX: roomId y uid son los únicos que deben disparar reconexión.
  // username/avatarUrl pueden cambiar sin necesitar rehacer todo el socket.
  }, [roomId, uid]);

  const sendChatMessage = (text: string): void => {
    if (!text.trim()) return;
    sendMessage({
      roomId,
      userUid: uid,
      username,
      avatarUrl,
      message: text,
    });
  };

  return {
    messages,
    participants,
    isConnected,
    sendChatMessage,
  };
}