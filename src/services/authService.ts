// src/services/authService.ts

import { auth } from "../config/firebase";
import { API_URL } from "../config/env";

import type {
  CreateProfileDTO,
  UpdateProfileDTO,
  UserProfile,
} from "../store/useAuthStore";

/**
 * =========================
 * HELPERS
 * =========================
 */

const getAuthHeaders = async (): Promise<HeadersInit> => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No existe usuario autenticado.");
  }

  const token = await currentUser.getIdToken();
  console.log(token);

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Lee el mensaje de error del backend si existe,
 * o usa un fallback genérico.
 */
const extractBackendError = async (
  response: Response,
  fallback: string
): Promise<string> => {
  try {
    const data = await response.json();
    return data?.message ?? fallback;
  } catch {
    return fallback;
  }
};

/**
 * =========================
 * GET CURRENT USER PROFILE
 * GET /api/users/me
 * =========================
 */

export const getCurrentUserProfile = async (): Promise<{
  exists: boolean;
  user?: UserProfile;
}> => {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: await getAuthHeaders(),
  });

  if (!response.ok) {
    const message = await extractBackendError(
      response,
      "No fue posible obtener el perfil."
    );
    throw new Error(message);
  }

  return response.json();
};

/**
 * =========================
 * CHECK USERNAME AVAILABILITY
 * GET /api/users/check-username/:username
 * =========================
 */

export const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  const response = await fetch(
    `${API_URL}/users/check-username/${encodeURIComponent(username)}`
  );

  if (!response.ok) {
    const message = await extractBackendError(
      response,
      "No fue posible verificar el nombre de usuario."
    );
    throw new Error(message);
  }

  const data = await response.json();
  return data.available;
};

/**
 * =========================
 * CREATE PROFILE
 * POST /api/users/profile
 * =========================
 */

export const createProfile = async (
  profileData: CreateProfileDTO
): Promise<void> => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "POST",
    headers: await getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const message = await extractBackendError(
      response,
      "No fue posible crear el perfil."
    );
    throw new Error(message);
  }
};

/**
 * =========================
 * UPDATE PROFILE
 * PUT /api/users/me
 * =========================
 */

export const updateProfile = async (
  profileData: UpdateProfileDTO
): Promise<void> => {

  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: "PUT",
      headers: await getAuthHeaders(),
      body: JSON.stringify(profileData),
    }
  );

  if (!response.ok) {
    const message = await extractBackendError(
      response,
      "No fue posible actualizar el perfil."
    );

    throw new Error(message);
  }
};

/**
 * =========================
 * DELETE ACCOUNT
 * DELETE /api/users/me
 * =========================
 */

export const deleteAccount = async (): Promise<void> => {

  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: "DELETE",
      headers: await getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const message = await extractBackendError(
      response,
      "No fue posible eliminar la cuenta."
    );

    throw new Error(message);
  }
};