"use client";

import Link from "next/link";
import styles from "./dashboard.module.css";
import { clearToken } from "../../lib/auth";
import { useAuthToken } from "../../lib/useAuthToken";

export default function AuthControls() {
  const token = useAuthToken();

  if (!token) {
    return (
      <Link
        href="/auth"
        className={`${styles.button} ${styles.buttonSecondary}`}
      >
        Sign in
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.button} ${styles.buttonSecondary}`}
      onClick={clearToken}
    >
      Sign out
    </button>
  );
}
