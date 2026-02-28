"use client";

import React from "react";
import GoogleSignInButton from "./GoogleSignInButton";
import EmailLoginForm from "./EmailLoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import {
  Box,
  Container,
  Paper,
  Grid,
  Typography,
  Stack,
  Divider,
  Avatar,
  Button,
} from "@mui/material";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  return (
    <Box component="main" sx={{ display: "flex", flex: 1, py: { xs: 6, md: 12 } }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, borderRadius: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Stack spacing={2} alignItems="flex-start">
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#ffd54f", color: "#000" }}>SS</Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    Welcome back
                  </Typography>
                </Stack>

                <Typography color="text.secondary">
                  Sign in to access your SparkStack workspace. Fast, private, and built for creators.
                </Typography>

                <Box sx={{ width: "100%" }}>
                  <EmailLoginForm />
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack spacing={3} alignItems="stretch">
                <Divider sx={{ my: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    or
                  </Typography>
                </Divider>

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <GoogleSignInButton />
                </Box>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Why SparkStack?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Private by default. Runs on Cloud Run for predictable scaling and instant SSR. Connect the tools
                    you love and keep your data under your control.
                  </Typography>
                </Paper>

                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button component={Link} href="/about" variant="text" size="small">
                    Learn more
                  </Button>
                  <Button component={Link} href="/" variant="outlined" size="small">
                    Home
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}
