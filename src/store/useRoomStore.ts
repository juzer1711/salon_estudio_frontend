import { create } from "zustand";

import {
  createRoom,
  getMyRooms,
  type StudyRoom,
} from "../services/roomService";

interface RoomState {

  rooms: StudyRoom[];

  isFetchingRooms: boolean;
  isCreatingRoom: boolean;

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

    isFetchingRooms: false,
    isCreatingRoom: false,

    error: null,

    /**
     * =========================================
     * FETCH MY ROOMS
     * =========================================
     */

    fetchMyRooms: async () => {
      try {

        set({
          isFetchingRooms: true,
          error: null,
        });

        const rooms =
          await getMyRooms();

        set({
          rooms,
          isFetchingRooms: false,
        });

      } catch (error) {

        set({
          isFetchingRooms: false,
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
           isCreatingRoom: true,
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
           isCreatingRoom: false,
        });

        return data.roomId;

      } catch (error) {

        set({
           isCreatingRoom: false,
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