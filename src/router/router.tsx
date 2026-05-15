import { createBrowserRouter,Navigate  } from 'react-router-dom';
import Login from '../pages/Login.tsx';
import Register from '../pages/Register.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import Profile from '../pages/Profile.tsx';
import Room from '../pages/Room.tsx';
import CreateRoom from '../pages/CreateRoom.tsx';
import MyRooms from '../pages/MyRooms.tsx';

export const router = createBrowserRouter([
  {path: '/',
    element: <Navigate to="/login" replace />,
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },
  { path: '/room/:id', element: <Room /> },
  { path: '/create_room', element: <CreateRoom /> },
  { path: '/my_rooms', element: <MyRooms /> },
]);