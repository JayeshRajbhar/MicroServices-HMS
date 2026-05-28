"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import styles from "../dashboard.module.css";
import { clientServiceUrls, type Room } from "../../../lib/service";
import { buildAuthHeader, clearToken, isAuthFailure } from "../../../lib/auth";
import { useAuthToken } from "../../../lib/useAuthToken";

type RoomForm = {
  roomNumber: string;
  wing: string;
  status: string;
  assignedPatient: string;
};

type Props = {
  initialRooms: Room[];
  initialOk: boolean;
};

const emptyForm: RoomForm = {
  roomNumber: "",
  wing: "",
  status: "AVAILABLE",
  assignedPatient: "",
};

const statusOptions = ["OCCUPIED", "AVAILABLE", "CLEANING", "MAINTENANCE"];

export default function RoomManager({ initialRooms, initialOk }: Props) {
  const [rooms, setRooms] = useState(initialRooms);
  const [serviceOk, setServiceOk] = useState(initialOk);
  const [form, setForm] = useState<RoomForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthToken();

  const isEditing = editingId !== null;
  const baseUrl = clientServiceUrls.staffBaseUrl;
  const limitReached = rooms.length >= 10;
  const authHeader = useMemo(() => buildAuthHeader(token), [token]);

  const formTitle = useMemo(() => {
    return isEditing ? "Update room" : "Add room";
  }, [isEditing]);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  useEffect(() => {
    let isActive = true;

    async function loadRooms() {
      if (!token) {
        if (isActive) {
          setRooms([]);
          setServiceOk(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${baseUrl}/rooms`, {
          headers: authHeader,
          cache: "no-store",
        });
        if (!isActive) {
          return;
        }
        if (isAuthFailure(response)) {
          clearToken();
          setRooms([]);
          setServiceOk(false);
          return;
        }
        if (!response.ok) {
          setServiceOk(false);
          setRooms([]);
          return;
        }
        const data = (await response.json()) as Room[];
        setRooms(Array.isArray(data) ? data : []);
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

    loadRooms();
    return () => {
      isActive = false;
    };
  }, [authHeader, baseUrl, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isEditing && limitReached) {
      setError("Room limit reached. There are already 10 rooms.");
      return;
    }

    const trimmedRoom = form.roomNumber.trim();
    const trimmedWing = form.wing.trim();

    if (!trimmedRoom || !trimmedWing) {
      setError("Room number and wing are required.");
      return;
    }

    const payload = {
      roomNumber: trimmedRoom,
      wing: trimmedWing,
      status: form.status,
      assignedPatient: form.assignedPatient.trim() || null,
    };

    setIsSaving(true);
    try {
      const endpoint = isEditing
        ? `${baseUrl}/rooms/${editingId}`
        : `${baseUrl}/rooms`;
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
          setError("Your session expired. Sign in again to save room data.");
          return;
        }
        setServiceOk(false);
        setError("Unable to save room data. Check the service status.");
        return;
      }

      const saved = (await response.json()) as Room;
      setServiceOk(true);
      setRooms((current) => {
        if (isEditing) {
          return current.map((room) => (room.id === saved.id ? saved : room));
        }
        return [saved, ...current];
      });
      resetForm();
    } catch {
      setServiceOk(false);
      setError("Network error while saving the room.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(room: Room) {
    setEditingId(room.id);
    setForm({
      roomNumber: room.roomNumber ?? "",
      wing: room.wing ?? "",
      status: room.status ?? "AVAILABLE",
      assignedPatient: room.assignedPatient ?? "",
    });
  }

  async function handleDelete(room: Room) {
    const confirmed = window.confirm(
      `Delete ${room.roomNumber}? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/rooms/${room.id}`, {
        method: "DELETE",
        headers: authHeader,
      });

      if (!response.ok) {
        if (isAuthFailure(response)) {
          clearToken();
          setError("Your session expired. Sign in again to delete rooms.");
          return;
        }
        setServiceOk(false);
        setError("Unable to delete room. Check the service status.");
        return;
      }

      setServiceOk(true);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      if (editingId === room.id) {
        resetForm();
      }
    } catch {
      setServiceOk(false);
      setError("Network error while deleting the room.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!token) {
    return (
      <section className={styles.panel}>
        <div className={styles.emptyState}>
          Sign in to manage rooms. <Link href="/auth">Go to auth</Link>.
        </div>
      </section>
    );
  }

  return (
    <>
      <form id="room-form" className={styles.formCard} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <div>
            <div className={styles.panelTitle}>{formTitle}</div>
            <div className={styles.panelMeta}>
              Fixed inventory of 10 rooms.{" "}
              {limitReached ? "Limit reached." : ""}
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
            Room number
            <input
              className={styles.input}
              value={form.roomNumber}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  roomNumber: event.target.value,
                }))
              }
              placeholder="Room 101"
              required
            />
          </label>
          <label className={styles.field}>
            Wing
            <input
              className={styles.input}
              value={form.wing}
              onChange={(event) =>
                setForm((current) => ({ ...current, wing: event.target.value }))
              }
              placeholder="East Wing"
              required
            />
          </label>
          <label className={styles.field}>
            Status
            <select
              className={styles.select}
              value={form.status}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            Assigned patient
            <input
              className={styles.input}
              value={form.assignedPatient}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  assignedPatient: event.target.value,
                }))
              }
              placeholder="Optional"
            />
          </label>
        </div>

        {error && <div className={styles.errorText}>{error}</div>}
        {isLoading && (
          <div className={styles.panelMeta}>Refreshing room list...</div>
        )}

        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.buttonPrimary}`}
            disabled={isSaving || (!isEditing && limitReached)}
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
            <div className={styles.panelTitle}>Room overview</div>
            <div className={styles.panelMeta}>Total rooms: {rooms.length}</div>
          </div>
          <span
            className={`${styles.statusPill} ${serviceOk ? "" : styles.statusWarn}`}
          >
            {serviceOk ? "Online" : "Offline"}
          </span>
        </div>

        {!serviceOk && (
          <div className={styles.emptyState}>
            Room service is offline. Check the API connection.
          </div>
        )}

        {serviceOk && rooms.length === 0 && (
          <div className={styles.emptyState}>
            Rooms are seeding. Reload in a moment.
          </div>
        )}

        {serviceOk && rooms.length > 0 && (
          <div className={styles.table}>
            <div className={`${styles.tableHeader} ${styles.tableColumnsRoom}`}>
              <span>Room</span>
              <span>Wing</span>
              <span>Status</span>
              <span>Assigned</span>
              <span>Actions</span>
            </div>
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`${styles.tableRow} ${styles.tableColumnsRoom}`}
              >
                <span className={styles.cellStrong}>{room.roomNumber}</span>
                <span>{room.wing}</span>
                <span>{room.status}</span>
                <span className={styles.truncate}>
                  {room.assignedPatient ?? "Unassigned"}
                </span>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.buttonSecondary} ${styles.rowButton}`}
                    onClick={() => handleEdit(room)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${styles.button} ${styles.rowButton} ${styles.rowButtonDanger}`}
                    onClick={() => handleDelete(room)}
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
