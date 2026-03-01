"use client";

import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function AdminMuiProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light",
          // light gray primary for admin topnav/footer
          primary: { main: "#e0e0e0", contrastText: "#0f172a" },
          background: { default: "#f5f5f6", paper: "#ffffff" },
          text: { primary: "#0f172a" },
        },
        typography: {
          fontFamily: "inherit",
        },
        components: {
          MuiAppBar: {
            styleOverrides: {
              colorPrimary: {
                backgroundColor: "#e0e0e0",
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
