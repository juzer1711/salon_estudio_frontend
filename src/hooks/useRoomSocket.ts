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
  onParticipantJoined?: (username: string) => void;
  onParticipantLeft?: (username: string) => void;
}

export function useRoomSocket({
  roomId,
  uid,
  username,
  avatarUrl,
  onParticipantJoined,
  onParticipantLeft,
}: UseRoomSocketProps) {

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [participants, setParticipants] =
    useState<Participant[]>([]);

  const [isConnected, setIsConnected] =
    useState(false);

  /**
   * Guardamos la lista previa de participantes para detectar
   * quién entró o salió comparando con el update nuevo.
   */
  const prevParticipantsRef =
    useRef<Participant[]>([]);

  useEffect(() => {

    socket.connect();

    socket.on("connect", () => {

      setIsConnected(true);

      joinRoom({ roomId, uid, username, avatarUrl });

      getChatHistory(roomId);
    });

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

        // Detectar quién se unió (está en updated pero no en prev)
        if (prev.length > 0) {

          const joined = updated.filter(
            (u) => !prev.some((p) => p.socketId === u.socketId)
          );

          const left = prev.filter(
            (p) => !updated.some((u) => u.socketId === p.socketId)
          );

          joined.forEach((p) => {
            // No notificamos al propio usuario cuando él mismo entra
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
      socket.off("connect");
      socket.off("disconnect");
      socket.off("chat-history");
      socket.off("receive-message");
      socket.off("participants-updated");
      socket.disconnect();
    };

  }, [roomId, uid, username, avatarUrl]);

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