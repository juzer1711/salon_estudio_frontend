import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import "./SnackBar.css"
type SnackbarType = "success" | "error";

interface SnackbarState {
  open: boolean;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextValue {
  showSnackbar: (
    message: string,
    type: SnackbarType
  ) => void;
}

const SnackbarContext =
  createContext<SnackbarContextValue | null>(null);

interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider = ({
  children,
}: SnackbarProviderProps): React.JSX.Element => {
  const [snackbar, setSnackbar] =
    useState<SnackbarState>({
      open: false,
      message: "",
      type: "success",
    });

  const showSnackbar = useCallback(
    (
      message: string,
      type: SnackbarType
    ) => {
      setSnackbar({
        open: true,
        message,
        type,
      });

      window.setTimeout(() => {
        setSnackbar((prev) => ({
          ...prev,
          open: false,
        }));
      }, 4000);
    },
    []
  );

  const value = useMemo(
    () => ({
      showSnackbar,
    }),
    [showSnackbar]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      {snackbar.open && (
          <div
            role="alert"
            aria-live="assertive"
            className="snackbar-container"
          >
            <div
              className={`snackbar snackbar--${snackbar.type}`}
            >
              {/* ICON */}
              <div className="snackbar__icon">
                {snackbar.type === "success" ? "✓" : "!"}
              </div>

              {/* CONTENT */}
              <div className="snackbar__content">
                <p className="snackbar__title">
                  {snackbar.type === "success"
                    ? "Operación exitosa"
                    : "Ocurrió un problema"}
                </p>

                <p className="snackbar__message">
                  {snackbar.message}
                </p>
              </div>
            </div>
          </div>
        )}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar =
  (): SnackbarContextValue => {
    const context =
      useContext(SnackbarContext);

    if (!context) {
      throw new Error(
        "useSnackbar must be used within SnackbarProvider"
      );
    }

    return context;
  };