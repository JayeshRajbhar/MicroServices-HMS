"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "../dashboard.module.css";
import { clientServiceUrls, type Patient } from "../../../lib/service";
import { buildAuthHeader, clearToken, isAuthFailure } from "../../../lib/auth";
import { useAuthToken } from "../../../lib/useAuthToken";

type PatientForm = {
  name: string;
  dateOfBirth: string;
  medicalHistory: string;
};

type Props = {
  initialPatients: Patient[];
  initialOk: boolean;
};

const emptyForm: PatientForm = {
  name: "",
  dateOfBirth: "",
  medicalHistory: "",
};

export default function PatientManager({ initialPatients, initialOk }: Props) {
  const [patients, setPatients] = useState(initialPatients);
  const [serviceOk, setServiceOk] = useState(initialOk);
  const [form, setForm] = useState<PatientForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthToken();

  const isEditing = editingId !== null;
  const baseUrl = clientServiceUrls.patientBaseUrl;
  const authHeader = useMemo(() => buildAuthHeader(token), [token]);

  const formTitle = useMemo(() => {
    return isEditing ? "Update patient" : "Add patient";
  }, [isEditing]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  useEffect(() => {
    let isActive = true;

    async function loadPatients() {
      if (!token) {
        if (isActive) {
          setPatients([]);
          setServiceOk(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/patients`, {
          headers: authHeader,
          cache: "no-store",
        });
        if (!isActive) {
          return;
        }
        if (isAuthFailure(response)) {
          clearToken();
          setPatients([]);
          setServiceOk(false);
          return;
        }
        if (!response.ok) {
          setServiceOk(false);
          setPatients([]);
          return;
        }
        const data = (await response.json()) as Patient[];
        setPatients(Array.isArray(data) ? data : []);
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

    loadPatients();
    return () => {
      isActive = false;
    };
  }, [authHeader, baseUrl, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    if (!trimmedName) {
      setError("Patient name is required.");
      return;
    }

    const payload = {
      name: trimmedName,
      dateOfBirth: form.dateOfBirth || null,
      medicalHistory: form.medicalHistory.trim() || null,
    };

    setIsSaving(true);
    try {
      const endpoint = isEditing
        ? `${baseUrl}/patients/${editingId}`
        : `${baseUrl}/patients`;
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
          setError("Your session expired. Sign in again to save patient data.");
          return;
        }
        setServiceOk(false);
        setError("Unable to save patient data. Check the service status.");
        return;
      }

      const saved = (await response.json()) as Patient;
      setServiceOk(true);
      setPatients((current) => {
        if (isEditing) {
          return current.map((patient) =>
            patient.id === saved.id ? saved : patient,
          );
        }
        return [saved, ...current];
      });
      resetForm();
    } catch {
      setServiceOk(false);
      setError("Network error while saving the patient.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(patient: Patient) {
    setEditingId(patient.id);
    setForm({
      name: patient.name ?? "",
      dateOfBirth: patient.dateOfBirth ?? "",
      medicalHistory: patient.medicalHistory ?? "",
    });
  }

  async function handleDelete(patient: Patient) {
    const confirmed = window.confirm(
      `Delete patient ${patient.name}? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/patients/${patient.id}`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!response.ok) {
        if (isAuthFailure(response)) {
          clearToken();
          setError("Your session expired. Sign in again to delete patients.");
          return;
        }
        setServiceOk(false);
        setError("Unable to delete patient. Check the service status.");
        return;
      }

      setServiceOk(true);
      setPatients((current) =>
        current.filter((item) => item.id !== patient.id),
      );
      if (editingId === patient.id) {
        resetForm();
      }
    } catch {
      setServiceOk(false);
      setError("Network error while deleting the patient.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!token) {
    return (
      <section className={styles.panel}>
        <div className={styles.emptyState}>
          Sign in to manage patients. <Link href="/auth">Go to auth</Link>.
        </div>
      </section>
    );
  }

  return (
    <>
      <form
        id="patient-form"
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
              placeholder="Patient name"
              required
            />
          </label>
          <label className={styles.field}>
            Date of birth
            <input
              className={styles.input}
              type="date"
              value={form.dateOfBirth}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  dateOfBirth: event.target.value,
                }))
              }
            />
          </label>
          <label className={`${styles.field} ${styles.fieldFull}`}>
            Medical history
            <textarea
              className={styles.textarea}
              value={form.medicalHistory}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  medicalHistory: event.target.value,
                }))
              }
              placeholder="Key notes, allergies, or conditions"
            />
          </label>
        </div>

        {error && <div className={styles.errorText}>{error}</div>}
        {isLoading && (
          <div className={styles.panelMeta}>Refreshing patient list...</div>
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
            <div className={styles.panelTitle}>Patient roster</div>
            <div className={styles.panelMeta}>
              Total patients: {patients.length}
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
            Patient service is offline. Check the API connection.
          </div>
        )}

        {serviceOk && patients.length === 0 && (
          <div className={styles.emptyState}>
            No patients yet. Add the first record above.
          </div>
        )}

        {serviceOk && patients.length > 0 && (
          <div className={styles.table}>
            <div
              className={`${styles.tableHeader} ${styles.tableColumnsPatient}`}
            >
              <span>Name</span>
              <span>Date of birth</span>
              <span>Medical notes</span>
              <span>Actions</span>
            </div>
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`${styles.tableRow} ${styles.tableColumnsPatient}`}
              >
                <span className={styles.cellStrong}>{patient.name}</span>
                <span>{patient.dateOfBirth ?? "Not provided"}</span>
                <span className={styles.truncate}>
                  {patient.medicalHistory ?? "No notes added"}
                </span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.rowButton}`}
                    onClick={() => handleEdit(patient)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.rowButton} ${styles.rowButtonDanger}`}
                    onClick={() => handleDelete(patient)}
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
