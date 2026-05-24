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
import { FirebaseError } from "firebase/app";

import { auth } from "../config/firebase";
import {
  getCurrentUserProfile,
  createProfile,
  checkUsernameAvailability,
  updateProfile,
  deleteAccount,
} from "../services/authService";

/**
 * =========================
 * TYPES & INTERFACES
 * =========================
 */

export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface CreateProfileDTO {
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

export interface UpdateProfileDTO {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
}

interface AuthState {
  /** Usuario autenticado desde Firebase Auth */
  user: User | null;

  /** Perfil persistido en Firestore vía Backend */
  profile: UserProfile | null;

  /** Control de carga global */
  loading: boolean;

  /** Mensajes de error accesibles para UI */
  error: string | null;

  /**
   * Flag crítico del flujo académico.
   * true => usuario autenticado PERO sin perfil completo
   */
  needsUsername: boolean;

  /** Evita múltiples listeners de Firebase */
  authInitialized: boolean;

  // =========================
  // ACTIONS
  // =========================

  initAuthListener: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    profileData: CreateProfileDTO
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  createUserProfile: (profileData: CreateProfileDTO) => Promise<boolean>;
  updateUserProfile: (profileData: UpdateProfileDTO) => Promise<boolean>;
  removeAccount: () => Promise<boolean>;
  clearError: () => void;
}

/**
 * =========================
 * FIREBASE ERROR TRANSLATOR
 * =========================
 */

const translateAuthError = (error: unknown): string => {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
        return "Correo o contraseña incorrectos.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/email-already-in-use":
        return "El correo ya está registrado.";
      case "auth/popup-closed-by-user":
        return "El proceso de autenticación fue cancelado.";
      case "auth/network-request-failed":
        return "No fue posible conectarse al servidor.";
      default:
        return "Ocurrió un error de autenticación.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
};

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

    set({ authInitialized: true, loading: true });

    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
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

        set({ user: firebaseUser, loading: true, error: null });


        let data = await getCurrentUserProfile();

        if (!data.exists) {
          await new Promise((resolve) =>
            setTimeout(resolve, 500)
          );

          data = await getCurrentUserProfile();
        }

        if (data.exists && data.user) {
          set({
            profile: data.user,
            needsUsername: false,
            loading: false,
            error: null,
          });

          return;
        }

        // Usuario autenticado PERO sin perfil → Google flow
        set({
          profile: null,
          needsUsername: true,
          loading: false,
          error: null,
        });
      } catch (error) {
        set({
          loading: false,
          error: translateAuthError(error),
          profile: null,
          needsUsername: false,
        });
      }
    });
  },

  /**
   * =========================================
   * LOGIN EMAIL
   * FIX: lanza el error para que la vista lo capture
   * =========================================
   */

  loginWithEmail: async (email, password) => {
    set({ loading: true, error: null });

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // loading se resetea dentro del listener.
    } catch (error) {
      const message = translateAuthError(error);
      set({ error: message, loading: false });
      throw new Error(message); // ← FIX: permite que la vista reaccione
    }
  },

  /**
   * =========================================
   * REGISTER EMAIL
   * FIX: lanza el error para que la vista lo capture
   * =========================================
   */

  registerWithEmail: async (email, password, profileData) => {
    set({ loading: true, error: null });

    try {
      await createUserWithEmailAndPassword(auth, email, password);
          // Crear perfil inmediatamente
      await createProfile(profileData);

      // Obtener perfil recién creado
      const meData = await getCurrentUserProfile();

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
    } catch (error) {
      const message = translateAuthError(error);
      set({ error: message, loading: false });
      throw new Error(message); // ← FIX
    }
  },

  /**
   * =========================================
   * GOOGLE LOGIN
   * FIX: lanza el error para que la vista lo capture
   * =========================================
   */

  loginWithGoogle: async () => {
    set({ loading: true, error: null });

    try {
      const provider = new GoogleAuthProvider();
      const result =
        await signInWithPopup(auth, provider);

        const email = result.user.email;

        if (
          !email ||
          !email.toLowerCase().endsWith(".edu.co")
        ) {
          await signOut(auth);

          set({
            loading: false,
          });

          throw new Error(
            "Debes usar un correo institucional .edu.co"
          );
        }
    } catch (error) {
      const message = translateAuthError(error);
      set({ error: message, loading: false });
      throw new Error(message); // ← FIX
    }
  },

  /**
   * =========================================
   * LOGOUT
   * =========================================
   */

  logout: async () => {
    set({ loading: true, error: null });

    try {
      await signOut(auth);
      set({
        user: null,
        profile: null,
        needsUsername: false,
        loading: false,
      });
    } catch (error) {
      const message = translateAuthError(error);
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  /**
   * =========================================
   * CHECK USERNAME
   * =========================================
   */

  checkUsername: async (username) => {
    try {
      set({ error: null });
      return await checkUsernameAvailability(username);
    } catch (error) {
      set({ error: translateAuthError(error) });
      return false;
    }
  },

  /**
   * =========================================
   * CREATE USER PROFILE
   * FIX: usa firstName/lastName (no displayName)
   * =========================================
   */

  createUserProfile: async (profileData) => {
    set({ loading: true, error: null });

    try {
      await createProfile(profileData);

      const meData = await getCurrentUserProfile();

      if (!meData.exists || !meData.user) {
        throw new Error("El perfil no pudo validarse correctamente.");
      }

      set({
        profile: meData.user,
        needsUsername: false,
        loading: false,
        error: null,
      });

      return true;
    } catch (error) {
      set({
        error: translateAuthError(error),
        loading: false,
      });
      return false;
    }
  },

    /**
   * =========================================
   * UPDATE USER PROFILE
   * =========================================
   */

  updateUserProfile: async (profileData) => {
    set({ loading: true, error: null });

    try {

      await updateProfile(profileData);

      const meData =
        await getCurrentUserProfile();

      if (!meData.exists || !meData.user) {
        throw new Error(
          "No fue posible obtener el perfil actualizado."
        );
      }

      set({
        profile: meData.user,
        loading: false,
        error: null,
      });

      return true;

    } catch (error) {

      set({
        error: translateAuthError(error),
        loading: false,
      });

      return false;
    }
  },

    /**
   * =========================================
   * REMOVE ACCOUNT
   * =========================================
   */

  removeAccount: async () => {

    set({
      loading: true,
      error: null,
    });

    try {

      await deleteAccount();

      await signOut(auth);

      set({
        user: null,
        profile: null,
        needsUsername: false,
        loading: false,
        error: null,
      });

      return true;

    } catch (error) {

      set({
        error: translateAuthError(error),
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

  clearError: () => set({ error: null }),
}));