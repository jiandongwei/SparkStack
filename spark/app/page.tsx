"use client";

import React from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
} from "@mui/material";

export default function Home() {
  return (
    <Box component="main" sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box
        sx={{
          py: { xs: 2, md: 4 },
          background: "linear-gradient(135deg,#06b6d4 0%,#7c3aed 50%,#f97316 100%)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  color: "white",
                  fontSize: { xs: "1.75rem", sm: "2.25rem", md: "3rem" },
                  lineHeight: { xs: 1.1, md: 1.15 },
                }}
              >
                SparkStack — Next.js on Google Cloud Run
              </Typography>

              <Typography variant="h6" paragraph sx={{ color: "rgba(255,255,255,0.95)" }}>
                A modern, containerized architecture for private, high-performance AI workflows.
                SparkStack runs your Next.js app as a lightweight container on Google Cloud Run —
                giving you instant SSR, predictable scaling, and full control over runtime
                environment and dependencies.
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 3 }}>
                <Button component={Link} href="/login" variant="contained" size="large">
                  Get started
                </Button>
                <Button component={Link} href="/about" variant="outlined" size="large">
                  Learn how it works
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <Chip label="Cloud Run" color="primary" />
                <Chip label="Instant SSR" />
                <Chip label="Private by default" />
                <Chip label="Scalable" />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card elevation={2} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }} gutterBottom>
                    Modern deployment stack
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Containerized
                      </Typography>
                      <Typography color="text.secondary">Built as a standalone Node container for Cloud Run.</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Secure Auth
                      </Typography>
                      <Typography color="text.secondary">Firebase Authentication for user identity and sessions.</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Fast SSR
                      </Typography>
                      <Typography color="text.secondary">Server-side rendering with minimal client overhead.</Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        Scalable
                      </Typography>
                      <Typography color="text.secondary">Automatic, per-request scaling on Cloud Run.</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            How it fits together
          </Typography>
          <Typography color="text.secondary" paragraph>
            SparkStack compiles Next.js into a production-ready standalone app, packages it into a container,
            and deploys it to Google Cloud Run. Optionally, Firebase Hosting can act as a proxy or provide
            static hosting. This gives you the best of both worlds: a modern SSR experience with the
            operational simplicity of serverless containers.
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: "monospace", background: "#f2f3f5", p: 1, borderRadius: 1, display: "inline-block" }}>
            gcloud builds submit --tag gcr.io/&lt;PROJECT&gt;/sparkstack && gcloud run deploy sparkstack
          </Typography>
        </Box>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Database
          </Typography>

          <Typography color="text.secondary" paragraph>
            SparkStack uses Prisma as the application ORM and migrations system with PostgreSQL as the
            primary relational database. In production we recommend a managed Postgres instance (for
            example Cloud SQL on GCP) and running migrations from your CI/CD pipeline.
          </Typography>

          <Typography color="text.secondary" paragraph>
            Migrations live in the <span style={{ fontFamily: "monospace" }}>prisma/migrations</span> folder. To apply migrations locally or in CI, run the Prisma migrate commands or use a deploy script that calls
            <span style={{ fontFamily: "monospace" }}>npx prisma migrate deploy</span> against your database URL. The project also includes helper scripts in the <span style={{ fontFamily: "monospace" }}>scripts/</span> directory for setup and testing.
          </Typography>

          <Typography variant="body2" sx={{ fontFamily: "monospace", background: "#f2f3f5", p: 1, borderRadius: 1, display: "inline-block" }}>
            npx prisma migrate deploy
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
