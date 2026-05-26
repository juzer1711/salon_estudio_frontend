import { useEffect, useState } from "react";

import AppLayout from "../../layouts/AppLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  isEducationalEmail,
  isValidName,
} from "../../utils/validators";
import { useSnackbar, } from "../../context/SnackbarContext";

import {
  useAuthStore,
  type UpdateProfileDTO,
} from "../../store/useAuthStore";

import AvatarPicker
from "../../components/AvatarPicker/AvatarPicker";

import { Pencil } from "lucide-react";

import "./Profile.css";

export default function Profile(): React.JSX.Element {

  const {
    profile,
    loading,
    isUpdatingProfile,
    error,
    checkUsername,
    updateUserProfile,
    removeAccount,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    clearError();
  }, []);

  const { showSnackbar } = useSnackbar();

  const [
    isAvatarPickerOpen,
    setIsAvatarPickerOpen,
  ] = useState(false);

  const [avatarError, setAvatarError] =
  useState(false);

  type UsernameStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "error";

  const [usernameStatus, setUsernameStatus] =
  useState<UsernameStatus>("idle");

  const [usernameMessage, setUsernameMessage] =
    useState("");

  const [formData, setFormData] =
    useState<UpdateProfileDTO>({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      avatarUrl: "",
    });

  const [isDeleteModalOpen, setIsDeleteModalOpen] =
    useState<boolean>(false);

  useEffect(() => {

    if (!profile) return;

    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      email: profile.email,
      avatarUrl: profile.avatarUrl ?? "",
    });

  }, [profile]);

  useEffect(() => {
  setAvatarError(false);
}, [formData.avatarUrl]);

useEffect(() => {

  const username =
    formData.username
      .trim()
      .toLowerCase();

  /**
   * IGNORAR username original
   */

  if (
    !username ||
    username === profile?.username
  ) {

    setUsernameStatus("idle");

    setUsernameMessage("");

    return;
  }

  if (username.length < 3) {

    setUsernameStatus("error");

    setUsernameMessage(
      "Mínimo 3 caracteres."
    );

    return;
  }

  const timeout =
    setTimeout(async () => {

      try {

        setUsernameStatus("checking");

        setUsernameMessage(
          "Verificando username..."
        );

        const available =
          await checkUsername(username);

        if (available) {

          setUsernameStatus("available");

          setUsernameMessage(
            "Username disponible."
          );

        } else {

          setUsernameStatus("taken");

          setUsernameMessage(
            "Este username ya está ocupado."
          );
        }

      } catch {

        setUsernameStatus("error");

        setUsernameMessage(
          "No se pudo verificar."
        );
      }

    }, 600);

  return () =>
    clearTimeout(timeout);

}, [
  formData.username,
  profile?.username,
  checkUsername,
]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {

    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSave = (
    avatarUrl: string
  ): void => {

    setFormData((prev) => ({
      ...prev,
      avatarUrl,
    }));
  };

  const isUsernameInvalid =
  usernameStatus === "taken" ||
  usernameStatus === "checking" ||
  usernameStatus === "error";

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {

    event.preventDefault();

    if (
      !isEducationalEmail(formData.email)
    ) {
      showSnackbar(
        "Debes usar un correo institucional .edu.co",
        "error"
      );

      return;
    }

    if (!isValidName(formData.firstName)) {

      showSnackbar(
        "El nombre solo puede contener letras.",
        "error"
      );

      return;
    }

    if (!isValidName(formData.lastName)) {

      showSnackbar(
        "El apellido solo puede contener letras.",
        "error"
      );


      return;
    }

    const success =
      await updateUserProfile(formData);

    if (success) {

      showSnackbar(
        "Perfil actualizado correctamente.",
        "success"
      );

    } else if (error) {

      showSnackbar(error, "error");

    }
  };

  const handleDeleteAccount = async (): Promise<void> => {

    const success = await removeAccount();

    if (success) {
      setIsDeleteModalOpen(false);
    }
  };

  const initials =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName[0]}${profile.lastName[0]}`
      : "RM";

  return (
    <>
      <AppLayout>

      <main className="profile">


        <section className="profile__container">

          {/* HEADER */}
          <header className="profile__header">

            <h1 className="profile__title">
              Perfil de Usuario
            </h1>

            <p className="profile__subtitle">
              Administra y actualiza tu información personal.
            </p>
          </header>

          {/* CONTENT */}
          <section className="profile__content">

            {/* PROFILE CARD */}
            <aside className="profile-card">

              <div className="profile-card__avatar-wrapper">

                <div className="profile-card__avatar">

                  {formData.avatarUrl &&
                      !avatarError ? (

                        <img
                          src={formData.avatarUrl}
                          alt="Avatar"
                          className="profile-card__avatar-image"
                          referrerPolicy="no-referrer"
                          onError={() => {
                            setAvatarError(true);
                          }}
                        />

                      ) : (

                        <span className="profile-card__avatar-text">
                          {initials}
                        </span>

                      )}

                </div>

                <button
                  type="button"
                  className="profile-card__avatar-edit"
                  onClick={() =>
                    setIsAvatarPickerOpen(true)
                  }
                >
                  <Pencil size={20} color="#a78bfa" />
                </button>

              </div>

              <h2 className="profile-card__name">
                {formData.firstName} {formData.lastName}
              </h2>

              <p className="profile-card__username">
                @{formData.username}
              </p>

              <p className="profile-card__email">
                {formData.email}
              </p>
            </aside>

            {/* FORM CARD */}
            <section className="profile-form-card">

              <form
                onSubmit={handleSubmit}
                className="profile-form"
              >

                <div className="profile-form__grid">

                  <div className="profile-form__field">
                    <label>Nombre</label>

                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Nombre"
                    />
                  </div>

                  <div className="profile-form__field">
                    <label>Apellido</label>

                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Apellido"
                    />
                  </div>

                  <div className="profile-form__field">
                    <label>Username</label>

                    <div
                        className={`profile-form__username-wrapper
                        ${
                          usernameStatus === "available"
                            ? "profile-form__username-wrapper--success"
                            : ""
                        }
                        ${
                          usernameStatus === "taken" ||
                          usernameStatus === "error"
                            ? "profile-form__username-wrapper--error"
                            : ""
                        }
                        ${
                          usernameStatus === "checking"
                            ? "profile-form__username-wrapper--checking"
                            : ""
                        }`}
                      >

                        <Input
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Username"
                        />

                      </div>

                    <div
                      className={`
                        profile-form__username-status
                        profile-form__username-status--${usernameStatus}
                      `}
                    >

                      {usernameMessage}

                    </div>
                  </div>

                  <div className="profile-form__field">
                    <label>Correo electrónico</label>

                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Correo"
                    />
                  </div>
                </div>



                <div className="profile-form__actions">

                  <Button
                    type="submit"
                    disabled={isUpdatingProfile||
                      isUsernameInvalid
                    }
                    className={`
                      profile-form__submit-button
                      ${isUpdatingProfile
                        ? "profile-form__submit-button--loading"
                        : ""}
                    `}
                  >

                    {isUpdatingProfile && (
                      <span className="profile-form__spinner" />
                    )}

                    {isUpdatingProfile
                      ? "Guardando cambios..."
                      : "Guardar cambios"}

                  </Button>

                  {isUpdatingProfile && (

                    <p className="profile-form__loading-text">
                      Actualizando información del perfil...
                    </p>

                  )}

                </div>
              </form>
            </section>
          </section>

          {/* DANGER ZONE */}
          <section className="profile-danger">

            <div>
              <h3 className="profile-danger__title">
                Zona peligrosa
              </h3>

              <p className="profile-danger__text">
                Eliminar tu cuenta removerá
                permanentemente tu perfil y acceso a Roomix.
              </p>
            </div>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="profile-danger__button"
            >
              Eliminar cuenta
            </button>
          </section>

          {isDeleteModalOpen && (
            <div className="delete-modal">

              <div
                className="delete-modal__backdrop"
                onClick={() =>
                  setIsDeleteModalOpen(false)
                }
              />

              <div className="delete-modal__content">

                <h3 className="delete-modal__title">
                  Eliminar cuenta
                </h3>

                <p className="delete-modal__text">
                  Esta acción eliminará permanentemente
                  tu cuenta y toda tu información en Roomix.
                </p>

                <div className="delete-modal__actions">

                  <button
                    onClick={() =>
                      setIsDeleteModalOpen(false)
                    }
                    
                    className="delete-modal__cancel"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="delete-modal__confirm"
                  >
                    {loading
                      ? "Eliminando..."
                      : "Sí, eliminar"}
                  </button>

                </div>
              </div>
            </div>
          )}

        </section>
      </main>
      <AvatarPicker
          isOpen={isAvatarPickerOpen}
          onClose={() =>
            setIsAvatarPickerOpen(false)
          }
          onSave={handleAvatarSave}
          currentAvatar={formData.avatarUrl}
          initials={initials}
        />
      </AppLayout>
    </>
  );
}