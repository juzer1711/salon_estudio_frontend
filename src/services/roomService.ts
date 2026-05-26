import { auth } from "../config/firebase";
import { API_URL } from "../config/env";

/**
 * =========================================
 * TYPES
 * =========================================
 */

export interface StudyRoom {
  id: string;
  name: string;
  ownerUid: string;
  ownerName: string;
  createdAt?: string;
}

/**
 * =========================================
 * HELPERS
 * =========================================
 */

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error(
      "No existe usuario autenticado."
    );
  }

  const token =
    await currentUser.getIdToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Extrae mensaje del backend
 */

const extractBackendError = async (
  response: Response,
  fallback: string
): Promise<string> => {

  try {

    const data =
      await response.json();

    return data?.message ?? fallback;

  } catch {

    return fallback;
  }
};

/**
 * =========================================
 * CREATE ROOM
 * POST /api/v1/rooms
 * =========================================
 */

export const createRoom = async (
  name: string
): Promise<{ roomId: string }> => {

  const response = await fetch(
    `${API_URL}/rooms`,
    {
      method: "POST",
      headers: await getAuthHeaders(),
      body: JSON.stringify({
        name,
      }),
    }
  );

  if (!response.ok) {

    const message =
      await extractBackendError(
        response,
        "No fue posible crear la sala."
      );

    throw new Error(message);
  }

  return response.json();
};

/**
 * =========================================
 * GET MY ROOMS
 * GET /api/v1/rooms/my-rooms
 * =========================================
 */

export const getMyRooms = async (): Promise<StudyRoom[]> => {

  const response = await fetch(
    `${API_URL}/rooms/my-rooms`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {

    const message =
      await extractBackendError(
        response,
        "No fue posible obtener las salas."
      );

    throw new Error(message);
  }

  const data =
    await response.json();

  return data.rooms;
};

/**
 * =========================================
 * GET ROOM BY ID
 * GET /api/v1/rooms/:roomId
 * =========================================
 */

export const getRoomById = async (
  roomId: string
): Promise<StudyRoom> => {

  const response = await fetch(
    `${API_URL}/rooms/${roomId}`,
    {
      method: "GET",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {

    const message =
      await extractBackendError(
        response,
        "No fue posible obtener la sala."
      );

    throw new Error(message);
  }

  const data =
    await response.json();

  return data.room;
};