import { ReceiptDropProvider } from "@/lib/receipt-drop-context";
import { GlobalReceiptDrop } from "@/components/global-receipt-drop";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReceiptDropProvider>
      <GlobalReceiptDrop />
      {children}
    </ReceiptDropProvider>
  );
}
