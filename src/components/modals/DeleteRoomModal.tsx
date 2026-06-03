// src/components/modals/DeleteRoomModal.tsx

import "./DeleteRoomModal.css";

interface Props {
  roomName: string;
  isLoading?: boolean;

  onClose: () => void;

  onConfirm: () => Promise<void>;
}

export default function DeleteRoomModal({
  roomName,
  isLoading = false,
  onClose,
  onConfirm,
}: Props): React.JSX.Element {

  return (

    <div
      className="delete-room-modal__backdrop"
      onClick={onClose}
    >

      <div
        className="delete-room-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <h2>
          Eliminar sala
        </h2>

        <p>
          ¿Seguro que deseas eliminar la sala
          <strong> "{roomName}" </strong>?
        </p>

        <div
          className="delete-room-modal__actions"
        >

          <button
            type="button"
            onClick={onClose}
            className="delete-room-modal__cancel"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="delete-room-modal__confirm"
          >
            {
              isLoading
                ? "Eliminando..."
                : "Eliminar"
            }
          </button>

        </div>

      </div>

    </div>

  );
}