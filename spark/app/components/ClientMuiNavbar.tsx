"use client";

import React from "react";

export default function ClientMuiNavbar() {
  const [Nav, setNav] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import("./MuiNavbar").then((mod) => {
      if (mounted) setNav(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Nav) return null;
  return <Nav />;
}
