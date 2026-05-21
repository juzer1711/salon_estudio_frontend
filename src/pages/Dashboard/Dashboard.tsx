// src/pages/Dashboard/Dashboard.tsx

import Navbar from "../../components/Navbar";

import logo from "../../assets/LOGOROOMIX.png";

import { useAuthStore } from "../../store/useAuthStore";

import "./Dashboard.css";

export default function Dashboard(): React.JSX.Element {
  const { profile } = useAuthStore();

  return (
    <>
      <Navbar />

      <main className="dashboard">

        {/* GLOWS */}
        <div className="dashboard__glow dashboard__glow--top" />
        <div className="dashboard__glow dashboard__glow--bottom" />

        <section className="dashboard__container">

          {/* HERO */}
          <header className="dashboard__hero">

            <img
              src={logo}
              alt="Roomix"
              className="dashboard__logo"
            />

            <h1 className="dashboard__title">
              Bienvenido a <span>Roomix</span>
            </h1>

            <p className="dashboard__subtitle">
              Un espacio colaborativo diseñado para
              estudiar, comunicarte y compartir
              en tiempo real con tus compañeros
              y profesores.
            </p>

            {/* USER CARD */}
            <div className="dashboard__user-card">

              <p className="dashboard__user-label">
                Sesión iniciada como
              </p>

              <h2 className="dashboard__user-name">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="dashboard__user-username">
                {profile?.email}
              </p>

              <p className="dashboard__user-username">
                @{profile?.username}
              </p>
            </div>
          </header>

          {/* FEATURES */}
          <section
            aria-labelledby="features-title"
            className="dashboard__features"
          >
            <h2
              id="features-title"
              className="dashboard__features-title"
            >
              Próximamente en Roomix
            </h2>

            <div className="dashboard__features-grid">

              {/* CARD */}
              <article className="dashboard-feature-card">
                <div className="dashboard-feature-card__icon">
                  🎥
                </div>

                <h3 className="dashboard-feature-card__title">
                  Videollamadas
                </h3>

                <p className="dashboard-feature-card__text">
                  Conéctate con estudiantes y profesores
                  mediante salas colaborativas en tiempo real.
                </p>
              </article>

              {/* CARD */}
              <article className="dashboard-feature-card">
                <div className="dashboard-feature-card__icon">
                  💬
                </div>

                <h3 className="dashboard-feature-card__title">
                  Chat en vivo
                </h3>

                <p className="dashboard-feature-card__text">
                  Comparte mensajes, ideas y recursos
                  instantáneamente dentro de cada sala.
                </p>
              </article>

              {/* CARD */}
              <article className="dashboard-feature-card">
                <div className="dashboard-feature-card__icon">
                  👥
                </div>

                <h3 className="dashboard-feature-card__title">
                  Salones colaborativos
                </h3>

                <p className="dashboard-feature-card__text">
                  Crea grupos privados de estudio para
                  trabajar con tus compañeros.
                </p>
              </article>

              {/* CARD */}
              <article className="dashboard-feature-card">
                <div className="dashboard-feature-card__icon">
                  📚
                </div>

                <h3 className="dashboard-feature-card__title">
                  Recursos académicos
                </h3>

                <p className="dashboard-feature-card__text">
                  Comparte archivos, enlaces y material
                  educativo dentro de cada sesión.
                </p>
              </article>

            </div>
          </section>

        </section>
      </main>
    </>
  );
}