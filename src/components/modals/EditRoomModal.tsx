// src/components/modals/EditRoomModal.tsx

import { useState } from "react";

import Button from "../ui/Button";

import "./EditRoomModal.css";

interface Props {
  currentName: string;
  isLoading?: boolean;

  onClose: () => void;

  onSave: (
    newName: string
  ) => Promise<void>;
}

export default function EditRoomModal({
  currentName,
  isLoading = false,
  onClose,
  onSave,
}: Props): React.JSX.Element {

  const [name, setName] =
    useState(currentName);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    await onSave(name.trim());
  };

  return (

    <div
      className="edit-room-modal__backdrop"
      onClick={onClose}
    >

      <div
        className="edit-room-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <h2>
          Editar sala
        </h2>

        <p>
          Cambia el nombre de tu sala.
        </p>

        <form
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            className="edit-room-modal__input"
          />

          <div
            className="edit-room-modal__actions"
          >

            <button
              type="button"
              onClick={onClose}
              className="edit-room-modal__cancel"
            >
              Cancelar
            </button>

            <Button
              type="submit"
              disabled={isLoading}
            >
              {
                isLoading
                  ? "Guardando..."
                  : "Guardar"
              }
            </Button>

          </div>

        </form>

      </div>

    </div>

  );
}