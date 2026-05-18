
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from '../../pages/login/Login.tsx';
import Register from '../../pages/register/Register.tsx';
import Dashboard from '../../pages/Dashboard.tsx';
import Rooms from '../../pages/Rooms.tsx';
import Profile from '../../pages/Profile.tsx';
import Room from '../../pages/Room.tsx';
import CreateRoom from '../../pages/CreateRoom.tsx';
import MyRooms from '../../pages/MyRooms.tsx';

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
      { path: '/rooms', element: <Rooms />},
      { path: "/room/:id", element: <Room /> },
      { path: "/create_room", element: <CreateRoom /> },
      { path: "/my_rooms", element: <MyRooms /> },
    ],
  },
]);