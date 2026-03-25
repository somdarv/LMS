"use client";

import { useMemo } from "react";
import { RouterProvider, createBrowserRouter } from "react-router";
import { lmsRoutes } from "./routes";

export default function LmsSpa() {
  const router = useMemo(() => createBrowserRouter(lmsRoutes), []);
  return <RouterProvider router={router} />;
}
