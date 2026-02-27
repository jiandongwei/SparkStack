"use client";

import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function ClientMuiProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          primary: { main: "#222E3F" },
          background: { default: "#ffffff", paper: "#ffffff" },
          text: { primary: "#0f172a" },
        },
        typography: {
          fontFamily: "inherit",
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              colorPrimary: {
                backgroundColor: "#ffffff",
                color: "#0f172a",
              },
            },
          },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
