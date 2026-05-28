"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./auth.module.css";
import { setToken } from "../../lib/auth";
import { clientGatewayBaseUrl } from "../../lib/config";

type Mode = "signin" | "signup";

type FormState = {
  fullName: string;
  email: string;
  password: string;
};

const emptyForm: FormState = {
  fullName: "",
  email: "",
  password: "",
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isSignup = mode === "signup";
  const title = useMemo(
    () => (isSignup ? "Create your access" : "Welcome back"),
    [isSignup],
  );
  const subtitle = useMemo(
    () =>
      isSignup
        ? "Create an account to access the HospitalOS live operations suite."
        : "Sign in to continue managing your hospital microservices.",
    [isSignup],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!form.email.trim() || !form.password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (isSignup && !form.fullName.trim()) {
      setError("Full name is required for signup.");
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = isSignup ? "/auth/signup" : "/auth/signin";
      const payload = isSignup
        ? {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
            password: form.password,
          }
        : {
            email: form.email.trim(),
            password: form.password,
          };

      const response = await fetch(`${clientGatewayBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setError("Unable to authenticate. Check your details and try again.");
        return;
      }

      const data = (await response.json()) as { token: string };
      setToken(data.token);
      router.push("/dashboard");
    } catch {
      setError("Network error while contacting the auth service.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.card}>
        <aside className={styles.sidePanel}>
          <div className={styles.sideEyebrow}>HospitalOS Secure Access</div>
          <div className={styles.sideTitle}>
            Secure sign-in for shared care teams.
          </div>
          <div className={styles.sideText}>
            Every request to doctors, patients, and staff flows through the
            gateway with a signed JWT. Your data stays protected end-to-end.
          </div>
          <ul className={styles.sideList}>
            <li>Token-secured routing via Eureka + Gateway.</li>
            <li>Single account to access every microservice.</li>
            <li>Fast session handoff across dashboard screens.</li>
          </ul>
        </aside>

        <section className={styles.formPanel}>
          <div className={styles.toggleRow}>
            <button
              type="button"
              className={`${styles.toggleButton} ${!isSignup ? styles.toggleButtonActive : ""}`}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`${styles.toggleButton} ${isSignup ? styles.toggleButtonActive : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>

          <div>
            <div className={styles.formTitle}>{title}</div>
            <p className={styles.formText}>{subtitle}</p>
          </div>

          <form className={styles.formGrid} onSubmit={handleSubmit}>
            {isSignup && (
              <div className={styles.field}>
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  placeholder="Ava Rodriguez"
                  autoComplete="name"
                />
              </div>
            )}
            <div className={styles.field}>
              <label htmlFor="email">Work email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                placeholder="ava@hospital.com"
                autoComplete="email"
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="At least 6 characters"
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </div>

            {error && <div className={styles.errorText}>{error}</div>}

            <div className={styles.formActions}>
              <button
                className={styles.submitButton}
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? "Working..."
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
              </button>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setForm(emptyForm)}
                disabled={isSaving}
              >
                Clear
              </button>
            </div>
          </form>

          <div className={styles.helperRow}>
            Credentials are stored in the auth service Postgres table and issued
            as JWTs.
          </div>
        </section>
      </div>
    </div>
  );
}
