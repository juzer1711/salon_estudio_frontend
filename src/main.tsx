import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router/router';
import { useAuthStore } from "./store/useAuthStore";
import './styles/index.css';

useAuthStore.getState().initAuthListener();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);