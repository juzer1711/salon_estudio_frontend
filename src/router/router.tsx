import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Room from "../pages/Room";
import CreateRoom from "../pages/CreateRoom";
import MyRooms from "../pages/MyRooms";

const ProtectedLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  {
    element: <ProtectedLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/profile", element: <Profile /> },
      { path: "/room/:id", element: <Room /> },
      { path: "/create_room", element: <CreateRoom /> },
      { path: "/my_rooms", element: <MyRooms /> },
    ],
  },
]);