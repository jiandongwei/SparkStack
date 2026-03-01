"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers/AuthProvider";
import safeRedirect from "@/lib/navigation";

export default function AdminTopbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleMobileMenuOpen = () => setMobileOpen(true);
  const handleMobileMenuClose = () => setMobileOpen(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      safeRedirect(router, "/login");
    } catch (err) {
      console.error("admin sign out failed", err);
    }
  };

  const displayName = user?.displayName || user?.email || "Admin";

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open navigation"
          onClick={handleMobileMenuOpen}
          sx={{ mr: 2, display: { xs: "flex", md: "none" } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1, cursor: 'pointer' }} onClick={() => safeRedirect(router, '/') }>
          <img src="/sparkstack.png" alt="SparkStack" style={{ height: 32 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            Admin Console
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
          <Button color="inherit" component={Link} href="/admin">
            Dashboard
          </Button>
          <Button color="inherit" component={Link} href="/admin/users">
            Users
          </Button>
          <Button color="inherit" component={Link} href="/">
            View Site
          </Button>
          <Button color="inherit" onClick={handleSignOut}>
            Logout
          </Button>
        </Box>

        <Drawer anchor="left" open={mobileOpen} onClose={handleMobileMenuClose}>
          <Box sx={{ width: 280 }} role="presentation">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: 'transparent' }}>{displayName?.[0]?.toUpperCase() || 'A'}</Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{displayName}</Typography>
                  {!loading && <Typography variant="caption">Admin</Typography>}
                </Box>
              </Box>
              <IconButton aria-label="close drawer" onClick={handleMobileMenuClose} sx={{ color: 'primary.contrastText' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin" onClick={handleMobileMenuClose}>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/admin/users" onClick={handleMobileMenuClose}>
                  <ListItemText primary="Users" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton component={Link} href="/" onClick={handleMobileMenuClose}>
                  <ListItemText primary="View Site" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { handleMobileMenuClose(); handleSignOut(); }}>
                  <ListItemText primary="Sign Out" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
