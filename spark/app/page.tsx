"use client";

import React from "react";
import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CssBaseline,
  Stack,
} from "@mui/material";

export default function Home() {
  return (
    <>
      <CssBaseline />
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            SparkStack
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button component={Link} href="/about" variant="outlined" size="small">
              About
            </Button>
            <Button component={Link} href="/login" variant="contained" size="small">
              Sign in
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item component="div" xs={12} md={6}>
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                Fullstack starter for Next.js + Firebase
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                SparkStack bundles Next.js, Firebase Functions, and Hosting into a
                developer-friendly starter. Get a secure authentication flow,
                serverless functions, and zero-configuration hosting to launch
                prototypes quickly.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                <Button component={Link} href="/login" variant="contained" size="large">
                  Get Started
                </Button>
                <Button component={Link} href="/about" variant="outlined" size="large">
                  Learn More
                </Button>
              </Stack>
            </Grid>

            <Grid item component="div" xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                    What’s included
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item component="div" xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Authentication
                      </Typography>
                      <Typography color="text.secondary">Email/password and provider auth</Typography>
                    </Grid>
                    <Grid item component="div" xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Serverless
                      </Typography>
                      <Typography color="text.secondary">Cloud Functions for backend logic</Typography>
                    </Grid>
                    <Grid item component="div" xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Hosting
                      </Typography>
                      <Typography color="text.secondary">Static + dynamic hosting via Firebase</Typography>
                    </Grid>
                    <Grid item component="div" xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Developer Experience
                      </Typography>
                      <Typography color="text.secondary">Next.js App Router, Tailwind utilities, and examples</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
              Quick start
            </Typography>
            <Typography color="text.secondary" paragraph>
              Clone the repo, install dependencies and run the dev server. Follow the
              provided `functions` and `hosting` folders to deploy with Firebase.
            </Typography>
          </Box>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 4, borderTop: "1px solid", borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item component="div">
              <Typography variant="body2">© {new Date().getFullYear()} SparkStack</Typography>
            </Grid>
            <Grid item component="div">
              <Stack direction="row" spacing={2}>
                <Button size="small" component={Link} href="https://github.com/">Source</Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}
