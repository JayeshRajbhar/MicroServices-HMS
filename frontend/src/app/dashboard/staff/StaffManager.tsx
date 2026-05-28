"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "../dashboard.module.css";
import { clientServiceUrls, type Staff } from "../../../lib/service";
import { buildAuthHeader, clearToken, isAuthFailure } from "../../../lib/auth";
import { useAuthToken } from "../../../lib/useAuthToken";

type StaffForm = {
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
};

type Props = {
  initialStaff: Staff[];
  initialOk: boolean;
};

const emptyForm: StaffForm = {
  name: "",
  role: "",
  department: "",
  email: "",
  phone: "",
};

export default function StaffManager({ initialStaff, initialOk }: Props) {
  const [staff, setStaff] = useState(initialStaff);
  const [serviceOk, setServiceOk] = useState(initialOk);
  const [form, setForm] = useState<StaffForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthToken();

  const isEditing = editingId !== null;
  const baseUrl = clientServiceUrls.staffBaseUrl;
  const authHeader = useMemo(() => buildAuthHeader(token), [token]);

  const formTitle = useMemo(() => {
    return isEditing ? "Update staff member" : "Add staff member";
  }, [isEditing]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  useEffect(() => {
    let isActive = true;

    async function loadStaff() {
      if (!token) {
        if (isActive) {
          setStaff([]);
          setServiceOk(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/staff`, {
          headers: authHeader,
          cache: "no-store",
        });
        if (!isActive) {
          return;
        }
        if (isAuthFailure(response)) {
          clearToken();
          setStaff([]);
          setServiceOk(false);
          return;
        }
        if (!response.ok) {
          setServiceOk(false);
          setStaff([]);
          return;
        }
        const data = (await response.json()) as Staff[];
        setStaff(Array.isArray(data) ? data : []);
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

    loadStaff();
    return () => {
      isActive = false;
    };
  }, [authHeader, baseUrl, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = form.name.trim();
    const trimmedRole = form.role.trim();
    const trimmedEmail = form.email.trim();

    if (!trimmedName || !trimmedRole || !trimmedEmail) {
      setError("Name, role, and email are required.");
      return;
    }

    const payload = {
      name: trimmedName,
      role: trimmedRole,
      department: form.department.trim() || null,
      email: trimmedEmail,
      phone: form.phone.trim() || null,
    };

    setIsSaving(true);
    try {
      const endpoint = isEditing
        ? `${baseUrl}/staff/${editingId}`
        : `${baseUrl}/staff`;
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
          setError("Your session expired. Sign in again to save staff data.");
          return;
        }
        setServiceOk(false);
        setError("Unable to save staff data. Check the service status.");
        return;
      }

      const saved = (await response.json()) as Staff;
      setServiceOk(true);
      setStaff((current) => {
        if (isEditing) {
          return current.map((member) =>
            member.id === saved.id ? saved : member,
          );
        }
        return [saved, ...current];
      });
      resetForm();
    } catch {
      setServiceOk(false);
      setError("Network error while saving the staff member.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(member: Staff) {
    setEditingId(member.id);
    setForm({
      name: member.name ?? "",
      role: member.role ?? "",
      department: member.department ?? "",
      email: member.email ?? "",
      phone: member.phone ?? "",
    });
  }

  async function handleDelete(member: Staff) {
    const confirmed = window.confirm(
      `Delete staff member ${member.name}? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/staff/${member.id}`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!response.ok) {
        if (isAuthFailure(response)) {
          clearToken();
          setError("Your session expired. Sign in again to delete staff.");
          return;
        }
        setServiceOk(false);
        setError("Unable to delete staff member. Check the service status.");
        return;
      }

      setServiceOk(true);
      setStaff((current) => current.filter((item) => item.id !== member.id));
      if (editingId === member.id) {
        resetForm();
      }
    } catch {
      setServiceOk(false);
      setError("Network error while deleting the staff member.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!token) {
    return (
      <section className={styles.panel}>
        <div className={styles.emptyState}>
          Sign in to manage staff. <Link href="/auth">Go to auth</Link>.
        </div>
      </section>
    );
  }

  return (
    <>
      <form id="staff-form" className={styles.formCard} onSubmit={handleSubmit}>
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
              placeholder="Staff name"
              required
            />
          </label>
          <label className={styles.field}>
            Role
            <input
              className={styles.input}
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({ ...current, role: event.target.value }))
              }
              placeholder="Nurse, Admin, Support"
              required
            />
          </label>
          <label className={styles.field}>
            Department
            <input
              className={styles.input}
              value={form.department}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
              placeholder="Ward or specialty"
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
              placeholder="staff@hospital.com"
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
          <div className={styles.panelMeta}>Refreshing staff list...</div>
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
            <div className={styles.panelTitle}>Staff roster</div>
            <div className={styles.panelMeta}>Total staff: {staff.length}</div>
          </div>
          <span
            className={`${styles.statusPill} ${serviceOk ? "" : styles.statusWarn}`}
          >
            {serviceOk ? "Online" : "Offline"}
          </span>
        </div>

        {!serviceOk && (
          <div className={styles.emptyState}>
            Staff service is offline. Check the API connection.
          </div>
        )}

        {serviceOk && staff.length === 0 && (
          <div className={styles.emptyState}>
            No staff yet. Add a team member above.
          </div>
        )}

        {serviceOk && staff.length > 0 && (
          <div className={styles.table}>
            <div
              className={`${styles.tableHeader} ${styles.tableColumnsStaff}`}
            >
              <span>Name</span>
              <span>Role</span>
              <span>Department</span>
              <span>Email</span>
              <span>Actions</span>
            </div>
            {staff.map((member) => (
              <div
                key={member.id}
                className={`${styles.tableRow} ${styles.tableColumnsStaff}`}
              >
                <span className={styles.cellStrong}>{member.name}</span>
                <span>{member.role}</span>
                <span>{member.department ?? "Not assigned"}</span>
                <span className={styles.truncate}>{member.email}</span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.rowButton}`}
                    onClick={() => handleEdit(member)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.rowButton} ${styles.rowButtonDanger}`}
                    onClick={() => handleDelete(member)}
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
