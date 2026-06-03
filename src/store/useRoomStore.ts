import { create } from "zustand";

import {
  createRoom,
  getMyRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  type StudyRoom,
} from "../services/roomService";

interface RoomState {

  rooms: StudyRoom[];

  isFetchingRooms: boolean;
  isCreatingRoom: boolean;
  isSearchingRoom: boolean;

  error: string | null;

  /**
   * ACTIONS
   */

  fetchMyRooms: () => Promise<void>;

  createNewRoom: (
    name: string
  ) => Promise<string | null>;

  searchRoomById: (
    roomId: string
  ) => Promise<StudyRoom | null>;

  editRoom: (
    roomId: string,
    name: string
  ) => Promise<boolean>;

  removeRoom: (
    roomId: string
  ) => Promise<boolean>;

  clearError: () => void;
}

export const useRoomStore =
  create<RoomState>((set) => ({

    rooms: [],

    isFetchingRooms: false,
    isCreatingRoom: false,
    isSearchingRoom: false,

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
     * SEARCH ROOM BY ID
     * =========================================
     */

    searchRoomById: async (
      roomId: string
    ) => {
      try {

        set({
          isSearchingRoom: true,
          error: null,
        });

        const room =
          await getRoomById(roomId);

        set({
          isSearchingRoom: false,
        });

        return room;

      } catch (error) {

        set({
          isSearchingRoom: false,
          error:
            error instanceof Error
              ? error.message
              : "Error al buscar sala.",
        });

        return null;
      }
    },

    /**
     * =========================================
     * EDIT ROOM
     * =========================================
     */

    editRoom: async (
      roomId,
      name
    ) => {

      try {

        set({
          error: null,
        });

        await updateRoom(
          roomId,
          name
        );

        const rooms =
          await getMyRooms();

        set({
          rooms,
        });

        return true;

      } catch (error) {

        set({
          error:
            error instanceof Error
              ? error.message
              : "Error al editar sala.",
        });

        return false;
      }
    },

    /**
     * =========================================
     * DELETE ROOM
     * =========================================
     */

    removeRoom: async (
      roomId
    ) => {

      try {

        set({
          error: null,
        });

        await deleteRoom(roomId);

        set((state) => ({
          rooms: state.rooms.filter(
            (room) => room.id !== roomId
          ),
        }));

        return true;

      } catch (error) {

        set({
          error:
            error instanceof Error
              ? error.message
              : "Error al eliminar sala.",
        });

        return false;
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