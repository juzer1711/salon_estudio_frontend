import { create } from "zustand";

import {
  createRoom,
  getMyRooms,
  type StudyRoom,
} from "../services/roomService";

interface RoomState {

  rooms: StudyRoom[];

  loading: boolean;

  error: string | null;

  /**
   * ACTIONS
   */

  fetchMyRooms: () => Promise<void>;

  createNewRoom: (
    name: string
  ) => Promise<string | null>;

  clearError: () => void;
}

export const useRoomStore =
  create<RoomState>((set) => ({

    rooms: [],

    loading: false,

    error: null,

    /**
     * =========================================
     * FETCH MY ROOMS
     * =========================================
     */

    fetchMyRooms: async () => {
      try {

        set({
          loading: true,
          error: null,
        });

        const rooms =
          await getMyRooms();

        set({
          rooms,
          loading: false,
        });

      } catch (error) {

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Error al obtener salas.",
        });
      }
    },

    /**
     * =========================================
     * CREATE ROOM
     * =========================================
     */

    createNewRoom: async (
      name: string
    ) => {
      try {

        set({
          loading: true,
          error: null,
        });

        const data =
          await createRoom(name);

        /**
         * Refetch rooms
         */

        const rooms =
          await getMyRooms();

        set({
          rooms,
          loading: false,
        });

        return data.roomId;

      } catch (error) {

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Error al crear sala.",
        });

        return null;
      }
    },

    /**
     * =========================================
     * CLEAR ERROR
     * =========================================
     */

    clearError: () =>
      set({ error: null }),
  }));