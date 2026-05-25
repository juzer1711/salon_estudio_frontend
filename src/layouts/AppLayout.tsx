import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import Navbar from "../components/Navbar.tsx";
import Sidebar from "../components/Sidebar.tsx";
import "./AppLayout.css";

interface Props {
  children: ReactNode;
}

export default function AppLayout({
  children,
}: Props): React.JSX.Element {

  /**
   * =========================================
   * SIDEBAR STATE
   * =========================================
   */

  const [sidebarOpen, setSidebarOpen] =
    useState<boolean>(
      window.innerWidth >= 1024
    );

  /**
   * =========================================
   * IS MOBILE
   * =========================================
   */

  const isMobile =
    window.innerWidth < 1024;

  /**
   * =========================================
   * HANDLE RESIZE
   * =========================================
   */

  useEffect(() => {

    const handleResize = () => {

      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };

  }, []);

  return (
    <div className="app-layout">

      {/* NAVBAR */}
      <Navbar
        onToggleSidebar={() =>
          setSidebarOpen((prev) => !prev)
        }
      />

      {/* OVERLAY SOLO MOBILE */}
      {sidebarOpen && isMobile && (
        <button
          className="app-layout__overlay"
          aria-label="Cerrar menú lateral"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* CONTENT */}
      <main
        className={`app-layout__content ${
          sidebarOpen
            ? "app-layout__content--sidebar-open"
            : ""
        }`}
      >
        {children}
      </main>

    </div>
  );
}