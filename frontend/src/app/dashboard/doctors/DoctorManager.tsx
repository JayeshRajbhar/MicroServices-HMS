"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "../dashboard.module.css";
import { clientServiceUrls, type Doctor } from "../../../lib/service";
import { buildAuthHeader, clearToken, isAuthFailure } from "../../../lib/auth";
import { useAuthToken } from "../../../lib/useAuthToken";

type DoctorForm = {
  name: string;
  specialty: string;
  email: string;
  phone: string;
};

type Props = {
  initialDoctors: Doctor[];
  initialOk: boolean;
};

const emptyForm: DoctorForm = {
  name: "",
  specialty: "",
  email: "",
  phone: "",
};

export default function DoctorManager({ initialDoctors, initialOk }: Props) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [serviceOk, setServiceOk] = useState(initialOk);
  const [form, setForm] = useState<DoctorForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthToken();

  const isEditing = editingId !== null;
  const baseUrl = clientServiceUrls.doctorBaseUrl;
  const authHeader = useMemo(() => buildAuthHeader(token), [token]);

  const formTitle = useMemo(() => {
    return isEditing ? "Update doctor" : "Add doctor";
  }, [isEditing]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  useEffect(() => {
    let isActive = true;

    async function loadDoctors() {
      if (!token) {
        if (isActive) {
          setDoctors([]);
          setServiceOk(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/doctors`, {
          headers: authHeader,
          cache: "no-store",
        });
        if (!isActive) {
          return;
        }
        if (isAuthFailure(response)) {
          clearToken();
          setDoctors([]);
          setServiceOk(false);
          return;
        }
        if (!response.ok) {
          setServiceOk(false);
          setDoctors([]);
          return;
        }
        const data = (await response.json()) as Doctor[];
        setDoctors(Array.isArray(data) ? data : []);
        setServiceOk(true);
      } catch {
        if (isActive) {
          setServiceOk(false);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDoctors();
    return () => {
      isActive = false;
    };
  }, [authHeader, baseUrl, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    const trimmedSpecialty = form.specialty.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName || !trimmedSpecialty || !trimmedEmail) {
      setError("Name, specialty, and email are required.");
      return;
    }

    const payload = {
      name: trimmedName,
      specialty: trimmedSpecialty,
      email: trimmedEmail,
      phone: form.phone.trim() || null,
    };

    setIsSaving(true);
    try {
      const endpoint = isEditing
        ? `${baseUrl}/doctors/${editingId}`
        : `${baseUrl}/doctors`;
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeader,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (isAuthFailure(response)) {
          clearToken();
          setError("Your session expired. Sign in again to save doctor data.");
          return;
        }
        setServiceOk(false);
        setError("Unable to save doctor data. Check the service status.");
        return;
      }

      const saved = (await response.json()) as Doctor;
      setServiceOk(true);
      setDoctors((current) => {
        if (isEditing) {
          return current.map((doctor) =>
            doctor.id === saved.id ? saved : doctor,
          );
        }
        return [saved, ...current];
      });
      resetForm();
    } catch {
      setServiceOk(false);
      setError("Network error while saving the doctor.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(doctor: Doctor) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name ?? "",
      specialty: doctor.specialty ?? "",
      email: doctor.email ?? "",
      phone: doctor.phone ?? "",
    });
  }

  async function handleDelete(doctor: Doctor) {
    const confirmed = window.confirm(
      `Delete doctor ${doctor.name}? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/doctors/${doctor.id}`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!response.ok) {
        if (isAuthFailure(response)) {
          clearToken();
          setError("Your session expired. Sign in again to delete doctors.");
          return;
        }
        setServiceOk(false);
        setError("Unable to delete doctor. Check the service status.");
        return;
      }

      setServiceOk(true);
      setDoctors((current) => current.filter((item) => item.id !== doctor.id));
      if (editingId === doctor.id) {
        resetForm();
      }
    } catch {
      setServiceOk(false);
      setError("Network error while deleting the doctor.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!token) {
    return (
      <section className={styles.panel}>
        <div className={styles.emptyState}>
          Sign in to manage doctors. <Link href="/auth">Go to auth</Link>.
        </div>
      </section>
    );
  }

  return (
    <>
      <form
        id="doctor-form"
        className={styles.formCard}
        onSubmit={handleSubmit}
      >
        <div className={styles.formHeader}>
          <div>
            <div className={styles.panelTitle}>{formTitle}</div>
            <div className={styles.panelMeta}>
              {serviceOk ? "Service online" : "Service offline"}
            </div>
          </div>
          {isEditing && (
            <button
              type="button"
              className={`${styles.button} ${styles.buttonGhost}`}
              onClick={resetForm}
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className={styles.formGrid}>
          <label className={styles.field}>
            Full name
            <input
              className={styles.input}
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Doctor name"
              required
            />
          </label>
          <label className={styles.field}>
            Specialty
            <input
              className={styles.input}
              value={form.specialty}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  specialty: event.target.value,
                }))
              }
              placeholder="Cardiology"
              required
            />
          </label>
          <label className={styles.field}>
            Email
            <input
              className={styles.input}
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="doctor@hospital.com"
              required
            />
          </label>
          <label className={styles.field}>
            Phone
            <input
              className={styles.input}
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              placeholder="Optional"
            />
          </label>
        </div>

        {error && <div className={styles.errorText}>{error}</div>}
        {isLoading && (
          <div className={styles.panelMeta}>Refreshing doctor list...</div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : formTitle}
          </button>
          <button
            type="button"
            className={`${styles.button} ${styles.buttonSecondary}`}
            onClick={resetForm}
            disabled={isSaving}
          >
            Reset form
          </button>
        </div>
      </form>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Doctor directory</div>
            <div className={styles.panelMeta}>
              Total doctors: {doctors.length}
            </div>
          </div>
          <span
            className={`${styles.statusPill} ${serviceOk ? "" : styles.statusWarn}`}
          >
            {serviceOk ? "Online" : "Offline"}
          </span>
        </div>

        {!serviceOk && (
          <div className={styles.emptyState}>
            Doctor service is offline. Check the API connection.
          </div>
        )}

        {serviceOk && doctors.length === 0 && (
          <div className={styles.emptyState}>
            No doctors yet. Add a specialist above.
          </div>
        )}

        {serviceOk && doctors.length > 0 && (
          <div className={styles.table}>
            <div
              className={`${styles.tableHeader} ${styles.tableColumnsDoctor}`}
            >
              <span>Name</span>
              <span>Specialty</span>
              <span>Email</span>
              <span>Phone</span>
              <span>Actions</span>
            </div>
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`${styles.tableRow} ${styles.tableColumnsDoctor}`}
              >
                <span className={styles.cellStrong}>{doctor.name}</span>
                <span>{doctor.specialty}</span>
                <span className={styles.truncate}>{doctor.email}</span>
                <span>{doctor.phone ?? "Not provided"}</span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.rowButton}`}
                    onClick={() => handleEdit(doctor)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.rowButton} ${styles.rowButtonDanger}`}
                    onClick={() => handleDelete(doctor)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
