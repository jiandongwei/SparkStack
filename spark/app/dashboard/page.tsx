"use client";

import React from "react";
import { useAuth } from "../providers/AuthProvider";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) return <Container sx={{ py: 6 }}>Loading...</Container>;
  if (!user) return <Container sx={{ py: 6 }}>Please sign in to view the dashboard.</Container>;

  return (
    <Box component="main" sx={{ py: 2 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Welcome back
          </Typography>

          <Typography paragraph>
            Hello {user.displayName ?? user.email ?? "user"}. Your user id is <strong>{user.uid}</strong>.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
