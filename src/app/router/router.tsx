import {
  createBrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  ProtectedRoute,
  PublicRoute,
  UsernameRoute,
} from "./ProtectedRoute";

import Login from "../../pages/login/Login.tsx";
import Register from "../../pages/register/Register.tsx";

import Dashboard from "../../pages/Dashboard/Dashboard.tsx";
import Rooms from "../../pages/Rooms/Rooms.tsx";
import Profile from "../../pages/Profile/Profile.tsx";
import Room from "../../pages/Room/Room.tsx";
import MyRooms from "../../pages/MyRooms/MyRooms.tsx";

import RoomPreview from "../../components/RoomPreview/RoomPreview";

import ChooseUsername from "../../pages/ChooseUsername/ChooseUsername";


/**
 * =========================================
 * LAYOUTS
 * =========================================
 */

const ProtectedLayout = (): React.JSX.Element => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

const PublicLayout = (): React.JSX.Element => (
  <PublicRoute>
    <Outlet />
  </PublicRoute>
);

const UsernameLayout = (): React.JSX.Element => (
  <UsernameRoute>
    <Outlet />
  </UsernameRoute>
);

/**
 * =========================================
 * ROUTER
 * =========================================
 */

export const router = createBrowserRouter([
  /**
   * Redirect raíz
   */
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  /**
   * =========================================
   * PUBLIC ROUTES
   * =========================================
   */
  {
    element: <PublicLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
    ],
  },

  /**
   * =========================================
   * USERNAME LIMBO ROUTE
   * =========================================
   */
  {
    element: <UsernameLayout />,
    children: [
      {
        path: "/choose-username",
        element: <ChooseUsername />,
      },
    ],
  },

  /**
   * =========================================
   * PRIVATE ROUTES
   * =========================================
   */
  {
    element: <ProtectedLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/rooms",
        element: <Rooms />,
      },
      {
        path: "/room-preview/:roomId",
        element: <RoomPreview />,
      },
      {
        path: "/room/:roomId",
        element: <Room />,
      },
      {
        path: "/my_rooms",
        element: <MyRooms />,
      },
    ],
  },

  /**
   * Fallback global
   */
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);