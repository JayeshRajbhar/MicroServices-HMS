"use client";

import { useEffect, useState } from "react";
import { AUTH_EVENT, getToken } from "./auth";

export function useAuthToken() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    function updateToken() {
      setToken(getToken());
    }

    updateToken();
    window.addEventListener(AUTH_EVENT, updateToken);
    window.addEventListener("storage", updateToken);
    return () => {
      window.removeEventListener(AUTH_EVENT, updateToken);
      window.removeEventListener("storage", updateToken);
    };
  }, []);

  return token;
}
