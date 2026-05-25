// src/components/RoomCard/RoomCard.tsx

import "./RoomCard.css";

import type {
  StudyRoom,
} from "../../services/roomService";

import { useNavigate } from 'react-router-dom';

interface Props {
  room: StudyRoom;
}



export default function RoomCard({
  room,
}: Props): React.JSX.Element {

  const navigate = useNavigate();

  return (
    <article className="room-card">

      <div className="room-card__content">

        <div className="room-card__badge">
          Sala activa
        </div>

        <h3 className="room-card__title">
          {room.name}
        </h3>

        <p className="room-card__id">
          ID: {room.id}
        </p>

      </div>

      <button
        className="room-card__button"
        aria-label={`Entrar a la sala ${room.name}`}
        onClick={() => navigate(`/room/${room.id}`)}
      >
        Entrar
      </button>

    </article>
  );
}