"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function AdminFooter() {
  return (
    <Box component="footer" sx={{ py: 2, textAlign: "center", bgcolor: "background.paper" }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Admin Console — SparkStack
      </Typography>
    </Box>
  );
}
