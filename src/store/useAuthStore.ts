// src/store/useAuthStore.ts
import { create } from "zustand";
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;

  initAuthListener: () => void;

  registerWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;

  checkUsername: (username: string) => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initAuthListener: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, loading: false });
    });
  },

  registerWithEmail: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unknown error" });
      }
      return false;
    } finally {
      set({ loading: false });
    }
  },

  loginWithEmail: async (email, password) => {
    try {
      set({ loading: true, error: null });
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unknown error" });
      }
      return false;
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unknown error" });
      }
      return false;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  checkUsername: async (username: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/users/check-username/${username}`
      );

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      return data.available;
    } catch (err: unknown) {
      if (err instanceof Error) {
        set({ error: err.message });
      } else {
        set({ error: "Unknown error checking username" });
      }
      return false;
    }
  },
}));