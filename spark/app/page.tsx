"use client";

import React from "react";
import Link from "next/link";
import {
  Typography,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Stack,
} from "@mui/material";

export default function Home() {
  return (
    <>
      {/* Navbar provided by layout's ClientMuiNavbar; removed duplicate AppBar here */}

      <Box component="main" sx={{ py:2}}>
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
    </>
  );
}
