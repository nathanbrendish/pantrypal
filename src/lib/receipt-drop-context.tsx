"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ReceiptDropContextValue = {
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  consumePendingFile: () => File | null;
};

const ReceiptDropContext = createContext<ReceiptDropContextValue | null>(null);

export function ReceiptDropProvider({ children }: { children: ReactNode }) {
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const consumePendingFile = useCallback(() => {
    const file = pendingFile;
    setPendingFile(null);
    return file;
  }, [pendingFile]);

  return (
    <ReceiptDropContext.Provider
      value={{ pendingFile, setPendingFile, consumePendingFile }}
    >
      {children}
    </ReceiptDropContext.Provider>
  );
}

export function useReceiptDrop() {
  const context = useContext(ReceiptDropContext);

  if (!context) {
    throw new Error("useReceiptDrop must be used within ReceiptDropProvider");
  }

  return context;
}
