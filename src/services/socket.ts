import { io, Socket } from "socket.io-client";

import { SOCKET_URL }
from "../config/env";

export const socket: Socket = io(
  SOCKET_URL,
  {
    autoConnect: false,
  }
);

/**
 * ROOM EVENTS
 */

export const joinRoom = (
  data: {
    roomId: string;
    uid: string;
    username: string;
    avatarUrl?: string;
  }
): void => {

  socket.emit(
    "join-room",
    data
  );
};

export const leaveRoom = (): void => {

  socket.emit(
    "leave-room"
  );
};

/**
 * CHAT
 */

export const sendMessage = (
  data: {
    roomId: string;
    userUid: string;
    username: string;
    avatarUrl?: string;
    message: string;
  }
): void => {

  socket.emit(
    "send-message",
    data
  );
};

export const getChatHistory = (
  roomId: string
): void => {

  socket.emit(
    "get-chat-history",
    roomId
  );
};

export const sendWebRtcOffer = (data: {
  targetSocketId: string;
  offer: RTCSessionDescriptionInit;
}): void => {
  socket.emit("webrtc-offer", data);
};
 
export const sendWebRtcAnswer = (data: {
  targetSocketId: string;
  answer: RTCSessionDescriptionInit;
}): void => {
  socket.emit("webrtc-answer", data);
};
 
export const sendIceCandidate = (data: {
  targetSocketId: string;
  candidate: RTCIceCandidateInit;
}): void => {
  socket.emit("webrtc-ice-candidate", data);
};