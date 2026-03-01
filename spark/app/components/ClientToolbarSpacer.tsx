"use client";

import React from "react";
import Box from "@mui/material/Box";
import { usePathname } from "next/navigation";

export default function ClientToolbarSpacer() {
  const pathname = usePathname();
  if (typeof pathname === "string" && pathname.startsWith("/admin")) return null;
  return <Box sx={(theme) => theme.mixins.toolbar} />;
}
