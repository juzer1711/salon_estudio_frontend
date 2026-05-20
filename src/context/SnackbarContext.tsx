import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
          className="
            fixed
            bottom-6
            left-1/2
            z-50
            w-[90%]
            max-w-md
            -translate-x-1/2
            rounded-xl
            px-4
            py-3
            shadow-2xl
            backdrop-blur-sm
            transition-all
            duration-300
          "
        >
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium text-white ${
              snackbar.type === "success"
                ? "bg-emerald-600"
                : "bg-red-600"
            }`}
          >
            {snackbar.message}
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