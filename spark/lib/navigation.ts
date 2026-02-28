export function safeRedirect(router: any, url?: string | null, options?: { replace?: boolean }) {
  try {
    if (!url) {
      if (options?.replace && typeof router.replace === "function") router.replace("/");
      else router.back();
      return;
    }

    // Resolve relative URLs against current location.
    const resolved = new URL(url, typeof window !== "undefined" ? window.location.href : "");

    // Allow only same-origin redirects (or root-relative paths).
    if (resolved.origin === (typeof window !== "undefined" ? window.location.origin : "")) {
      // Use pathname + search + hash to avoid duplicating origin in push()/replace()
      const target = `${resolved.pathname}${resolved.search}${resolved.hash}`;
      if (options?.replace && typeof router.replace === "function") {
        router.replace(target);
      } else {
        router.push(target);
      }
      return;
    }
  } catch (err) {
    // ignore and fallthrough to back()
  }

  // Fallback: navigate back to previous page
  try {
    router.back();
  } catch (err) {
    // best-effort no-op
  }
}

export default safeRedirect;
