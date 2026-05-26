// src/components/AvatarPicker/AvatarPicker.tsx

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { uploadImage } from "../../services/imageUploadService";

import "./AvatarPicker.css";

interface AvatarPickerProps {
  currentAvatar?: string;
  initials: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (avatarUrl: string) => void;
}

export default function AvatarPicker({
  currentAvatar,
  initials,
  isOpen,
  onClose,
  onSave,
}: AvatarPickerProps): React.JSX.Element | null {

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] =
    useState<string>(
      currentAvatar ?? ""
    );

  const [urlInput, setUrlInput] =
    useState<string>(
      currentAvatar ?? ""
    );

  const [isUploading, setIsUploading] =
  useState(false);

  /**
   * =========================================
   * SYNC CURRENT AVATAR
   * =========================================
   */

  useEffect(() => {

    setPreview(currentAvatar ?? "");

    setUrlInput(currentAvatar ?? "");

  }, [currentAvatar]);

  /**
   * =========================================
   * CLOSE MODAL WITH ESC
   * =========================================
   */

  useEffect(() => {

    const handleEsc = (
      event: KeyboardEvent
    ) => {

      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleEsc
      );
    };

  }, [onClose]);

  /**
   * =========================================
   * FILE CHANGE
   * =========================================
   */

    const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
    ): Promise<void> => {

    const file =
        event.target.files?.[0];

    if (!file) return;

    try {

        setIsUploading(true);

        const cloudinaryUrl =
        await uploadImage(file);

        setPreview(cloudinaryUrl);

        onSave(cloudinaryUrl);

    } catch (error) {

        console.error(error);

    } finally {

        setIsUploading(false);
    }
    };

  /**
   * =========================================
   * URL CHANGE
   * =========================================
   */

  const handleUrlPreview = (): void => {

    if (!urlInput.trim()) return;

    setPreview(urlInput);
  };

  /**
   * =========================================
   * SAVE
   * =========================================
   */

  const handleSave = (): void => {

    onSave(preview);

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="avatar-picker"
      onClick={onClose}
    >

      <div
        className="avatar-picker__modal"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}
        <div className="avatar-picker__header">

          <div>

            <h2 className="avatar-picker__title">
              Cambiar avatar
            </h2>

            <p className="avatar-picker__subtitle">
              Sube una imagen o pega
              una URL.
            </p>

          </div>

          <button
            type="button"
            className="avatar-picker__close"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        {/* PREVIEW */}
        <div className="avatar-picker__preview">

          {preview ? (

            <img
              src={preview}
              alt="Preview avatar"
              className="avatar-picker__image"
            />

          ) : (

            <span className="avatar-picker__initials">
              {initials}
            </span>

          )}

        </div>

        {isUploading && (

            <div className="avatar-picker__loading">

                <div className="avatar-picker__spinner" />

                <p>
                Subiendo imagen...
                </p>

            </div>

            )}

        {/* ACTIONS */}
        <div className="avatar-picker__body">

          {/* FILE */}
          <div className="avatar-picker__section">

            <label className="avatar-picker__label">
              Subir imagen
            </label>

            <button
              type="button"
              className="avatar-picker__upload"
              disabled={isUploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              {isUploading
                ? "Subiendo imagen..."
                : "Elegir desde el equipo"}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />

          </div>

          {/* URL */}
          <div className="avatar-picker__section">

            <label className="avatar-picker__label">
              O usar URL
            </label>

            <div className="avatar-picker__url-group">

              <input
                type="text"
                value={urlInput}
                onChange={(e) =>
                  setUrlInput(
                    e.target.value
                  )
                }
                placeholder="https://..."
                className="avatar-picker__input"
              />

              <button
                type="button"
                className="avatar-picker__preview-btn"
                onClick={handleUrlPreview}
              >
                Preview
              </button>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="avatar-picker__footer">

          <button
            type="button"
            className="avatar-picker__cancel"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="avatar-picker__save"
            onClick={handleSave}
            disabled={isUploading}
          >
            {isUploading
                ? "Procesando..."
                : "Guardar avatar"}
          </button>

        </div>

      </div>

    </div>
  );
}