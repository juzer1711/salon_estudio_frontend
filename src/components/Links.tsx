import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="p-4 flex gap-4 border-b">
      <Link to="/login">Login</Link>
      <Link  to="/register">Register</Link>
      <Link  to="/dashboard">Dashboard</Link>
      <Link to="/rooms">Salas</Link>
      <Link  to="/profile">Profile</Link>
      <Link  to="/room/123">Room</Link>
      <Link  to="/create_room">CreateRooms</Link>
      <Link  to="/my_rooms">MyRooms</Link>
    </nav>
  );
}