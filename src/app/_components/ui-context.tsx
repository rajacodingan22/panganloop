"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type ToastState = {
  message: string;
  visible: boolean;
};

type PanganloopUiValue = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  toast: ToastState;
  openInfo: () => void;
  closeInfo: () => void;
  isInfoOpen: () => boolean;
  showToast: (message: string) => void;
  runDemo: (label: string) => void;
};

const PanganloopUiContext = createContext<PanganloopUiValue | null>(null);

export function PanganloopUiProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const toastTimer = useRef<number | null>(null);
  const [toast, setToast] = useState<ToastState>({
    message: "",
    visible: false,
  });

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ message, visible: true });
    toastTimer.current = window.setTimeout(() => {
      setToast((current) => ({ ...current, visible: false }));
    }, 3600);
  }, []);

  const isInfoOpen = useCallback(() => dialogRef.current?.open ?? false, []);

  const openInfo = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
    document.body.classList.add("modal-open");
  }, []);

  const closeInfo = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open) return;
    dialog.close();
  }, []);

  const runDemo = useCallback(
    (label: string) => {
      if (isInfoOpen()) closeInfo();
      showToast(
        `${label} segera hadir. Sementara itu, jelajahi cara kerja PANGANLOOP.`,
      );
    },
    [closeInfo, isInfoOpen, showToast],
  );

  const value = useMemo<PanganloopUiValue>(
    () => ({
      dialogRef,
      toast,
      openInfo,
      closeInfo,
      isInfoOpen,
      showToast,
      runDemo,
    }),
    [closeInfo, isInfoOpen, openInfo, runDemo, showToast, toast],
  );

  return (
    <PanganloopUiContext.Provider value={value}>
      {children}
    </PanganloopUiContext.Provider>
  );
}

export function usePanganloopUi() {
  const context = useContext(PanganloopUiContext);
  if (!context) {
    throw new Error("usePanganloopUi must be used within PanganloopUiProvider");
  }
  return context;
}
