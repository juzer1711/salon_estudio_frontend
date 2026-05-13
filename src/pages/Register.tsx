import { Link } from 'react-router-dom';
export default function Login() {
  return (
    <main className="p-6">
        <nav className="mt-4 flex gap-2">
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/room/123">Room</Link>
        </nav>
      <h1 className="text-2xl font-bold">Registrar</h1>
      <p>Vista temporal para configuración de rutas.</p>
    </main>
  );
}