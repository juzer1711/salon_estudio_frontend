// src/components/RoomCard/RoomCard.tsx

import "./RoomCard.css";

import type {
  StudyRoom,
} from "../../services/roomService";

import { useNavigate } from 'react-router-dom';

import { MoreVertical } from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
} from "react";

interface Props {
  room: StudyRoom;

  onEdit?: (
    room: StudyRoom
  ) => void;

  onDelete?: (
    room: StudyRoom
  ) => void;

  onLeave?: (
    room: StudyRoom
  ) => void;

  isJoinedRoom?: boolean;
}

export default function RoomCard({
  room,
  onEdit,
  onDelete,
  onLeave,
  isJoinedRoom = false,
}: Props): React.JSX.Element {

  const navigate = useNavigate();

  const [showMenu, setShowMenu] =
  useState(false);

  const menuRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {

    const handleClickOutside = (
      event: MouseEvent
    ) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setShowMenu(false);
      }

    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);

  return (
    <article className="room-card">

      <div className="room-card__content">

        <div
          className="room-card__header"
          ref={menuRef}
        >

          <div className="room-card__badge">
            Sala activa
          </div>

          <button
            type="button"
            className="room-card__menu-button"
            onClick={() =>
              setShowMenu(!showMenu)
            }
          >
            <MoreVertical
              size={18}
              color="#a78bfa"
            />
          </button>

          {showMenu && (

          <div className="room-card__menu">

            {isJoinedRoom ? (

              <button
                className="
                  room-card__menu-item
                  room-card__menu-item--danger
                "
                onClick={() => {
                  setShowMenu(false);

                  if (onLeave) {
                    onLeave(room);
                  }
                }}
              >
                Abandonar sala
              </button>

            ) : (

              <>
                <button
                  className="room-card__menu-item"
                  onClick={() => {
                    setShowMenu(false);

                    if (onEdit) {
                      onEdit(room);
                    }
                  }}
                >
                  Editar sala
                </button>

                <button
                  className="
                    room-card__menu-item
                    room-card__menu-item--danger
                  "
                  onClick={() => {
                    setShowMenu(false);

                    if (onDelete) {
                      onDelete(room);
                    }
                  }}
                >
                  Eliminar sala
                </button>
              </>

            )}

          </div>

        )}

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