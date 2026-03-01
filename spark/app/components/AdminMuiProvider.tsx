"use client";

import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function AdminMuiProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: { main: "#0D47A1" },
          background: { default: "#0b1220", paper: "#0b1220" },
          text: { primary: "#ffffff" },
        },
        typography: {
          fontFamily: "inherit",
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              colorPrimary: {
                backgroundColor: "#0b1220",
                color: "#fff",
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
