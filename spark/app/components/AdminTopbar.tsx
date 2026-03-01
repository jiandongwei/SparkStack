"use client";

import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";

export default function AdminTopbar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Admin Console
        </Typography>
        <Button color="inherit" href="/admin">
          Dashboard
        </Button>
        <Button color="inherit" href="/">
          View Site
        </Button>
        <Button color="inherit" href="/logout">
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}
