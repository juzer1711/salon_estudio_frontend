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

import "./Profile.css";

export default function Profile(): React.JSX.Element {

  const {
    profile,
    loading,
    error,
    updateUserProfile,
    removeAccount,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    clearError();
  }, []);

  const { showSnackbar } = useSnackbar();

  const [formData, setFormData] =
    useState<UpdateProfileDTO>({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      avatarUrl: "",
    });

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

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {

    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

    const confirmed = window.confirm(
      "¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer."
    );

    if (!confirmed) return;

    await removeAccount();
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

              <div className="profile-card__avatar">
                {profile?.avatarUrl &&
                profile.avatarUrl.startsWith("http") ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Avatar"
                    className="profile-card__avatar-image"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="profile-card__avatar-text">
                    {initials}
                  </span>
                )}
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

                    <Input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Username"
                    />
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

                <div className="profile-form__field">
                  <label>Avatar URL</label>

                  <Input
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="profile-form__actions">
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Guardando..."
                      : "Guardar cambios"}
                  </Button>
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
              onClick={handleDeleteAccount}
              className="profile-danger__button"
            >
              Eliminar cuenta
            </button>
          </section>

        </section>
      </main>
      </AppLayout>
    </>
  );
}