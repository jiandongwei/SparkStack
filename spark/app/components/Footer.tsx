"use client"

import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const hideFooter =
    typeof pathname === "string" && (pathname.startsWith("/signin") || pathname.startsWith("/signup"));
  const year = new Date().getFullYear();

  if (hideFooter) return null;

  return (
    <Box component="footer" sx={{ bgcolor: "#222E3F", color: "#fff", mt: 4, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ textAlign: { xs: 'left', md: 'left' } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, cursor: 'pointer' }}>
              <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>SparkStack</Link>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
              © {year} SparkStack. All rights reserved.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 }, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
            <Link href="/about" style={{ color: '#fff', textDecoration: 'none' }}>
              <Typography variant="body2">About</Typography>
            </Link>
            <Link href="/privacy" style={{ color: '#fff', textDecoration: 'none' }}>
              <Typography variant="body2">Privacy Policy</Typography>
            </Link>
            <Link href="/terms" style={{ color: '#fff', textDecoration: 'none' }}>
              <Typography variant="body2">Terms of Service</Typography>
            </Link>
            <Link href="/contact" style={{ color: '#fff', textDecoration: 'none' }}>
              <Typography variant="body2">Contact</Typography>
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
