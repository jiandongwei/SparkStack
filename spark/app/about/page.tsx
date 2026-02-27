import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Stack,
  Divider,
  Avatar,
} from "@mui/material";

export default function AboutPage() {
  return (
    <Box component="main" sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 12 },
          background: "linear-gradient(180deg, #000000 0%, #0d0d0d 100%)",
          color: "#fff",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="flex-start">
            <Typography variant="h3" component="h1" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
              SparkStack — Your Personal AI Stack
            </Typography>

            <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.85)", maxWidth: 920 }}>
              SparkStack is your private command center for thinking, building, and creating with AI. It brings your
              tools, your data, and your workflows together into one fast, elegant workspace that’s fully yours — not
              shared, not tracked, not mined.
            </Typography>

            <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
              <Button href="/login" variant="contained" size="large">
                Get started
              </Button>
              <Button href="#learn-more" variant="outlined" size="large" sx={{ color: "#ffd54f", borderColor: "rgba(255,213,79,0.18)" }}>
                Learn more
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container id="learn-more" maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                This is where ideas move faster.
              </Typography>
              <Typography color="text.secondary" paragraph>
                Where context stays with you. Where every interaction feels personal, not generic. SparkStack isn’t
                another AI chatbot — it’s the backbone of your creative process: a modular, extensible stack designed
                for people who build, write, design, and ship.
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>
                Everything that matters: private, fast, and usable.
              </Typography>
              <Typography color="text.secondary" paragraph>
                Everything runs on a modern, high‑performance architecture built for speed and privacy. No clutter. No
                noise. Just a clean space where you can think clearly and work deeply.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body1" sx={{ mb: 1, fontWeight: 700 }}>
                Whether you're drafting a strategy, exploring a concept, or orchestrating complex workflows:
              </Typography>
              <ul>
                <li>SparkStack adapts to how you work — not the other way around.</li>
                <li>Your data and context stay private and local to your workspace.</li>
                <li>Extendable integrations let you connect tools on your terms.</li>
              </ul>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: "#ffd54f", color: "#000" }}>SS</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Built for creators
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      A modular stack that grows with your ideas — from drafts to production.
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Fast by design
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Minimal client overhead, instant SSR, and efficient orchestration so you spend time building, not
                  waiting.
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Private by default
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  No analytics. No model telemetry. Your workflows and data remain under your control.
                </Typography>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}


