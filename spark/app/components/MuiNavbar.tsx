"use client"

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";

export default function MuiNavbar() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountAnchorEl, setAccountAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleMobileMenuOpen = () => {
    setMobileOpen(true);
  };

  const handleMobileMenuClose = () => {
    setMobileOpen(false);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleAccountMenuClose();
    try {
      await signOut();
      router.push('/login');
    } catch (err) {
      console.error('sign out failed', err);
    }
  };

  const displayName = user?.displayName || user?.email || 'User';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed" sx={{ backgroundColor: "#222E3F", color: "#fff" }}>
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

          <Box
            onClick={() => router.push('/')}
            sx={{
              flexGrow: { xs: 0, md: 1 },
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              position: { xs: 'absolute', md: 'static' },
              left: { xs: '50%', md: 'auto' },
              transform: { xs: 'translateX(-50%)', md: 'none' },
            }}
          >
            <img src="/sparkstack.png" alt="SparkStack" style={{ height: 36, display: 'block' }} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              SparkStack
            </Typography>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Button color="inherit" href="#">Docs</Button>
            <Button color="inherit" href="#">Pricing</Button>
            {user && (
              <Button color="inherit" href="/dashboard">Dashboard</Button>
            )}
            {!loading && !user && (
              <Button color="inherit" href="/login">Sign In</Button>
            )}
            {user && (
              <Button
                color="inherit"
                onClick={handleAccountMenuOpen}
                startIcon={
                  <Avatar
                    src={user?.photoURL ?? undefined}
                    alt={displayName}
                    sx={{ width: 28, height: 28 }}
                  >
                    {!user?.photoURL && displayName?.[0]?.toUpperCase()}
                  </Avatar>
                }
              >
                {displayName}
              </Button>
            )}
          </Box>

          <Drawer anchor="left" open={mobileOpen} onClose={handleMobileMenuClose}>
            <Box sx={{ width: 280 }} role="presentation">
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: '#222E3F', color: '#fff' }}>
                {user ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: '#1976d2', width: 44, height: 44 }}>{displayName?.[0]?.toUpperCase() || 'U'}</Avatar>
                    <Box sx={{ ml: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{displayName}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>{user?.email}</Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => { handleMobileMenuClose(); router.push('/'); }}>
                    <img src="/sparkstack.png" alt="SparkStack" style={{ height: 36, display: 'block' }} />
                    <Typography variant="h6" component="div">SparkStack</Typography>
                  </Box>
                )}
                <IconButton aria-label="close drawer" onClick={handleMobileMenuClose} sx={{ color: '#fff' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
              <List>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { handleMobileMenuClose(); router.push('/'); }}>
                    <ListItemText primary="Home" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { handleMobileMenuClose(); router.push('/docs'); }}>
                    <ListItemText primary="Docs" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { handleMobileMenuClose(); router.push('/pricing'); }}>
                    <ListItemText primary="Pricing" />
                  </ListItemButton>
                </ListItem>
                {user && (
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleMobileMenuClose(); router.push('/dashboard'); }}>
                      <ListItemText primary="Dashboard" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
              <Divider />
              <List>
                {!loading && !user ? (
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => { handleMobileMenuClose(); router.push('/login'); }}>
                      <ListItemText primary="Sign In" />
                    </ListItemButton>
                  </ListItem>
                ) : (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => { handleMobileMenuClose(); router.push('/settings'); }}>
                        <ListItemText primary="Settings" />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => { handleMobileMenuClose(); handleSignOut(); }}>
                        <ListItemText primary="Sign Out" />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </List>
            </Box>
          </Drawer>

          <Menu
            id="account-menu"
            anchorEl={accountAnchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(accountAnchorEl)}
            onClose={handleAccountMenuClose}
            PaperProps={{ sx: { mt: 1.5, minWidth: 180 } }}
          >
            <MenuItem
              onClick={() => {
                handleAccountMenuClose();
                router.push('/settings');
              }}
            >
              Settings
            </MenuItem>
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </Menu>

        </Toolbar>
      </AppBar>
    </Box>
  );
}
