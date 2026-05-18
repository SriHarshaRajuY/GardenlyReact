const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const getCookie = (name) => {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
};

export const installCsrfFetch = () => {
  if (typeof window === "undefined") return;
  if (window.__gardenlyCsrfFetchInstalled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const method = (init.method || "GET").toUpperCase();

    if (UNSAFE_METHODS.has(method)) {
      const token = getCookie("csrf_token");
      if (token) {
        const headers = new Headers(init.headers || {});
        if (!headers.has("X-CSRF-Token")) {
          headers.set("X-CSRF-Token", token);
        }
        init = { ...init, headers };
      }
    }

    return originalFetch(input, init);
  };

  window.__gardenlyCsrfFetchInstalled = true;
};
