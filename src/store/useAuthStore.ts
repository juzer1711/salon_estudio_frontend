// src/store/useAuthStore.ts

import { create } from "zustand";
import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth } from "../config/firebase";

/**
 * =========================
 * TYPES & INTERFACES
 * =========================
 */

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: string;
}

export interface CreateProfileDTO {
  username: string;
  displayName?: string;
  photoURL?: string;
}

interface CheckUsernameResponse {
  available: boolean;
}

interface GetCurrentUserResponse {
  exists: boolean;
  user?: UserProfile;
}

interface CreateUserProfileResponse {
  success?: boolean;
  user?: UserProfile;
  message?: string;
}

interface AuthState {
  /**
   * Usuario autenticado desde Firebase Auth
   */
  user: User | null;

  /**
   * Perfil persistido en Firestore vía Backend
   */
  profile: UserProfile | null;

  /**
   * Control de carga global
   */
  loading: boolean;

  /**
   * Mensajes de error accesibles para UI
   */
  error: string | null;

  /**
   * Flag crítico del flujo académico.
   * true => usuario autenticado PERO sin perfil completo
   */
  needsUsername: boolean;

  /**
   * Evita múltiples listeners de Firebase
   */
  authInitialized: boolean;

  /**
   * =========================
   * ACTIONS
   * =========================
   */

  initAuthListener: () => void;

  loginWithEmail: (email: string, password: string) => Promise<void>;

  registerWithEmail: (
    email: string,
    password: string
  ) => Promise<void>;

  loginWithGoogle: () => Promise<void>;

  logout: () => Promise<void>;

  checkUsername: (username: string) => Promise<boolean>;

  createUserProfile: (
    profileData: CreateProfileDTO
  ) => Promise<boolean>;

  clearError: () => void;
}

/**
 * =========================
 * ENV
 * =========================
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
console.log("BACKEND_URL:", BACKEND_URL);

/**
 * =========================
 * HELPERS
 * =========================
 */

const getAuthHeaders = (uid: string): HeadersInit => ({
  "Content-Type": "application/json",
  uid,
});

/**
 * =========================
 * STORE
 * =========================
 */

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  needsUsername: false,
  authInitialized: false,

  /**
   * =========================================
   * INIT AUTH LISTENER
   * =========================================
   */

  initAuthListener: () => {
    if (get().authInitialized) return;

    set({
      authInitialized: true,
      loading: true,
    });

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        /**
         * Usuario NO autenticado
         */
        if (!firebaseUser) {
          set({
            user: null,
            profile: null,
            needsUsername: false,
            loading: false,
            error: null,
          });

          return;
        }

        /**
         * Usuario autenticado en Firebase
         */
        set({
          user: firebaseUser,
          loading: true,
          error: null,
        });

        /**
         * Consultar perfil REAL en backend
         */
        const response = await fetch(
          `${BACKEND_URL}/users/me`,
          {
            method: "GET",
            headers: getAuthHeaders(firebaseUser.uid),
          }
        );

        if (!response.ok) {
          throw new Error(
            "No fue posible validar el perfil del usuario."
          );
        }

        const data: GetCurrentUserResponse =
          await response.json();

        /**
         * Usuario YA tiene perfil en Firestore
         */
        if (data.exists && data.user) {
          set({
            profile: data.user,
            needsUsername: false,
            loading: false,
            error: null,
          });

          return;
        }

        /**
         * Usuario autenticado PERO sin perfil
         */
        set({
          profile: null,
          needsUsername: true,
          loading: false,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.";

        set({
          loading: false,
          error: message,
          profile: null,
          needsUsername: false,
        });
      }
    });
  },

  /**
   * =========================================
   * LOGIN EMAIL
   * =========================================
   */

  loginWithEmail: async (
    email: string,
    password: string
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al iniciar sesión.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  /**
   * =========================================
   * REGISTER EMAIL
   * =========================================
   */

  registerWithEmail: async (
    email: string,
    password: string
  ) => {
    try {
      set({
        loading: true,
        error: null,
      });

      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al registrar usuario.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  /**
   * =========================================
   * GOOGLE LOGIN
   * =========================================
   */

  loginWithGoogle: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error con autenticación de Google.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  /**
   * =========================================
   * LOGOUT
   * =========================================
   */

  logout: async () => {
    try {
      set({
        loading: true,
        error: null,
      });

      await signOut(auth);

      set({
        user: null,
        profile: null,
        needsUsername: false,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cerrar sesión.";

      set({
        error: message,
        loading: false,
      });

      throw error;
    }
  },

  /**
   * =========================================
   * CHECK USERNAME
   * =========================================
   */

  checkUsername: async (
    username: string
  ): Promise<boolean> => {
    try {
      set({
        error: null,
      });

      const response = await fetch(
        `${BACKEND_URL}/users/check-username/${encodeURIComponent(
          username
        )}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(
          "No fue posible verificar el username."
        );
      }

      const data: CheckUsernameResponse =
        await response.json();

      return data.available;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error validando username.";

      set({
        error: message,
      });

      return false;
    }
  },

  /**
   * =========================================
   * CREATE USER PROFILE
   * =========================================
   */

  createUserProfile: async (
    profileData: CreateProfileDTO
  ): Promise<boolean> => {
    try {
      const currentUser = get().user;

      if (!currentUser) {
        throw new Error(
          "No existe un usuario autenticado."
        );
      }

      set({
        loading: true,
        error: null,
      });

      const response = await fetch(
        `${BACKEND_URL}/users/profile`,
        {
          method: "POST",
          headers: getAuthHeaders(currentUser.uid),
          body: JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            ...profileData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "No fue posible crear el perfil."
        );
      }

      const data: CreateUserProfileResponse =
        await response.json();

      /**
       * Reconsultar el perfil oficial desde backend
       * para garantizar sincronización total
       */
      const meResponse = await fetch(
        `${BACKEND_URL}/users/me`,
        {
          method: "GET",
          headers: getAuthHeaders(currentUser.uid),
        }
      );

      if (!meResponse.ok) {
        throw new Error(
          "Perfil creado pero no fue posible sincronizarlo."
        );
      }

      const meData: GetCurrentUserResponse =
        await meResponse.json();

      if (!meData.exists || !meData.user) {
        throw new Error(
          "El perfil no pudo validarse correctamente."
        );
      }

      set({
        profile: meData.user,
        needsUsername: false,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error creando perfil.";

      set({
        error: message,
        loading: false,
      });

      return false;
    }
  },

  /**
   * =========================================
   * CLEAR ERROR
   * =========================================
   */

  clearError: () => {
    set({
      error: null,
    });
  },
}));