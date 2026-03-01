"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function ClientFooter() {
  const pathname = usePathname();
  // Hide the global footer on admin pages
  if (typeof pathname === "string" && pathname.startsWith("/admin")) return null;

  const [Footer, setFooter] = React.useState<React.ComponentType | null>(null);

  React.useEffect(() => {
    let mounted = true;
    import("./Footer").then((mod) => {
      if (mounted) setFooter(() => mod.default);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!Footer) return null;
  return <Footer />;
}
