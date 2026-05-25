import { io, Socket } from "socket.io-client";

import { SOCKET_URL }
from "../config/env";

/**
 * =========================================
 * SOCKET CLIENT
 * =========================================
 */

export const socket: Socket = io(
  SOCKET_URL,
  {
    autoConnect: false,
  }
);