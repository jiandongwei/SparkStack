"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function ClientMuiNavbar() {
  const pathname = usePathname();
  // Don't show the site navbar on admin pages
  if (typeof pathname === "string" && pathname.startsWith("/admin")) return null;

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
