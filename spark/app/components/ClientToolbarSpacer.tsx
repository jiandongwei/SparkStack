"use client";

import React from "react";
import Box from "@mui/material/Box";

export default function ClientToolbarSpacer() {
  return <Box sx={(theme) => theme.mixins.toolbar} />;
}
