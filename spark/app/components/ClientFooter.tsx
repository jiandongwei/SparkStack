"use client";

import React from "react";

export default function ClientFooter() {
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
