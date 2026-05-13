import { createBrowserRouter,Navigate  } from 'react-router-dom';
import Login from '../pages/Login.tsx';
import Register from '../pages/Register.tsx';
import Dashboard from '../pages/Dashboard.tsx';
import Profile from '../pages/Profile.tsx';
import Room from '../pages/Room.tsx';

export const router = createBrowserRouter([
  {path: '/',
    element: <Navigate to="/login" replace />,
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/profile', element: <Profile /> },
  { path: '/room/:id', element: <Room /> },
]);