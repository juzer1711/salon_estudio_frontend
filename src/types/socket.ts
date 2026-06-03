export interface ChatMessage {
  id?: string;

  roomId: string;

  userUid: string;

  username: string;

  avatarUrl?: string;

  message: string;

  createdAt: string;
}

export interface Participant {
  socketId: string;

  uid: string;

  username: string;

  avatarUrl?: string;
}