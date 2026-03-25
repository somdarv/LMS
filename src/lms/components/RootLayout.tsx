import { Outlet } from "react-router";
import { LMSProvider } from "../context/LMSContext";

export function RootLayout() {
  return (
    <LMSProvider>
      <Outlet />
    </LMSProvider>
  );
}
