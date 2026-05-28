"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "./dashboard.module.css";
import { buildAuthHeader, clearToken, isAuthFailure } from "../../lib/auth";
import { useAuthToken } from "../../lib/useAuthToken";
import {
  clientServiceUrls,
  type Doctor,
  type Patient,
  type Room,
  type Staff,
} from "../../lib/service";

const { patientBaseUrl, doctorBaseUrl, staffBaseUrl } = clientServiceUrls;

type Status<T> = {
  items: T[];
  ok: boolean;
};

const emptyStatus = { items: [], ok: false };

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export default function DashboardOverviewClient() {
  const token = useAuthToken();
  const [patientsResult, setPatientsResult] =
    useState<Status<Patient>>(emptyStatus);
  const [doctorsResult, setDoctorsResult] =
    useState<Status<Doctor>>(emptyStatus);
  const [staffResult, setStaffResult] = useState<Status<Staff>>(emptyStatus);
  const [roomsResult, setRoomsResult] = useState<Status<Room>>(emptyStatus);
  const [loading, setLoading] = useState(true);

  const authHeader = useMemo(() => buildAuthHeader(token), [token]);

  useEffect(() => {
    let isActive = true;

    async function load() {
      if (!token) {
        if (isActive) {
          setPatientsResult(emptyStatus);
          setDoctorsResult(emptyStatus);
          setStaffResult(emptyStatus);
          setRoomsResult(emptyStatus);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const [patientsRes, doctorsRes, staffRes, roomsRes] = await Promise.all(
          [
            fetch(`${patientBaseUrl}/patients`, {
              headers: authHeader,
              cache: "no-store",
            }),
            fetch(`${doctorBaseUrl}/doctors`, {
              headers: authHeader,
              cache: "no-store",
            }),
            fetch(`${staffBaseUrl}/staff`, {
              headers: authHeader,
              cache: "no-store",
            }),
            fetch(`${staffBaseUrl}/rooms`, {
              headers: authHeader,
              cache: "no-store",
            }),
          ],
        );

        if (!isActive) {
          return;
        }

        if (
          [patientsRes, doctorsRes, staffRes, roomsRes].some(isAuthFailure)
        ) {
          clearToken();
          setPatientsResult(emptyStatus);
          setDoctorsResult(emptyStatus);
          setStaffResult(emptyStatus);
          setRoomsResult(emptyStatus);
          return;
        }

        const patients = patientsRes.ok
          ? ((await patientsRes.json()) as Patient[])
          : [];
        const doctors = doctorsRes.ok
          ? ((await doctorsRes.json()) as Doctor[])
          : [];
        const staff = staffRes.ok ? ((await staffRes.json()) as Staff[]) : [];
        const rooms = roomsRes.ok ? ((await roomsRes.json()) as Room[]) : [];

        setPatientsResult({
          items: Array.isArray(patients) ? patients : [],
          ok: patientsRes.ok,
        });
        setDoctorsResult({
          items: Array.isArray(doctors) ? doctors : [],
          ok: doctorsRes.ok,
        });
        setStaffResult({
          items: Array.isArray(staff) ? staff : [],
          ok: staffRes.ok,
        });
        setRoomsResult({
          items: Array.isArray(rooms) ? rooms : [],
          ok: roomsRes.ok,
        });
      } catch {
        if (isActive) {
          setPatientsResult(emptyStatus);
          setDoctorsResult(emptyStatus);
          setStaffResult(emptyStatus);
          setRoomsResult(emptyStatus);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isActive = false;
    };
  }, [authHeader, token]);

  const patients = patientsResult.items;
  const doctors = doctorsResult.items;
  const staff = staffResult.items;
  const rooms = roomsResult.items;

  const authNotice = !token;
  const patientStatusText = authNotice
    ? "Sign in"
    : patientsResult.ok
      ? "Live"
      : "Offline";
  const doctorStatusText = authNotice
    ? "Sign in"
    : doctorsResult.ok
      ? "Live"
      : "Offline";
  const staffStatusText = authNotice
    ? "Sign in"
    : staffResult.ok
      ? "Live"
      : "Offline";

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Dashboard</p>
          <h1 className={styles.pageTitle}>Clinic overview</h1>
          <p className={styles.pageSubtitle}>
            A single operational snapshot across all services, updated with
            every change in the shared Postgres database.
          </p>
        </div>
        <div className={styles.pageActions}>
          <Link
            href="/dashboard/patients"
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            View patients
          </Link>
          <Link
            href="/dashboard/doctors"
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            View doctors
          </Link>
          <Link
            href="/dashboard/staff"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            View staff
          </Link>
        </div>
      </div>

      {authNotice && (
        <div className={styles.emptyState}>
          Sign in to load live metrics. <Link href="/auth">Go to auth</Link>.
        </div>
      )}

      {loading && token && (
        <div className={styles.emptyState}>Loading live metrics...</div>
      )}

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Patients on record</span>
          <span className={styles.kpiValue}>
            {formatCount(patients.length)}
          </span>
          <span
            className={`${styles.statusPill} ${patientsResult.ok ? "" : styles.statusWarn}`}
          >
            {patientStatusText}
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Doctors available</span>
          <span className={styles.kpiValue}>{formatCount(doctors.length)}</span>
          <span
            className={`${styles.statusPill} ${doctorsResult.ok ? "" : styles.statusWarn}`}
          >
            {doctorStatusText}
          </span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Staff rostered</span>
          <span className={styles.kpiValue}>{formatCount(staff.length)}</span>
          <span
            className={`${styles.statusPill} ${staffResult.ok ? "" : styles.statusWarn}`}
          >
            {staffStatusText}
          </span>
        </div>
      </div>

      <div className={styles.splitGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>Recent patients</div>
              <div className={styles.panelMeta}>Latest intake updates</div>
            </div>
            <Link href="/dashboard/patients" className={styles.tag}>
              Manage
            </Link>
          </div>
          <ul className={styles.list}>
            {patientsResult.ok && patients.length === 0 && (
              <li className={styles.emptyState}>
                No patient records yet. Add the first entry to get started.
              </li>
            )}
            {!authNotice && !patientsResult.ok && (
              <li className={styles.emptyState}>
                Patient service is offline. Retry in a moment.
              </li>
            )}
            {patients.slice(0, 4).map((patient) => (
              <li key={patient.id} className={styles.listItem}>
                <div>
                  <div className={styles.listTitle}>{patient.name}</div>
                  <div className={styles.listMeta}>
                    DOB {patient.dateOfBirth ?? "Not provided"}
                  </div>
                </div>
                <span className={styles.tag}>Active</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <div className={styles.panelTitle}>On-call doctors</div>
              <div className={styles.panelMeta}>Today&apos;s coverage</div>
            </div>
            <Link href="/dashboard/doctors" className={styles.tag}>
              Schedule
            </Link>
          </div>
          <ul className={styles.list}>
            {doctorsResult.ok && doctors.length === 0 && (
              <li className={styles.emptyState}>
                No doctor records yet. Add a specialist to begin.
              </li>
            )}
            {!authNotice && !doctorsResult.ok && (
              <li className={styles.emptyState}>
                Doctor service is offline. Retry in a moment.
              </li>
            )}
            {doctors.slice(0, 4).map((doctor) => (
              <li key={doctor.id} className={styles.listItem}>
                <div>
                  <div className={styles.listTitle}>{doctor.name}</div>
                  <div className={styles.listMeta}>{doctor.specialty}</div>
                </div>
                <span className={styles.tag}>On site</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Staff coverage</div>
            <div className={styles.panelMeta}>Shift snapshot by role</div>
          </div>
          <Link href="/dashboard/staff" className={styles.tag}>
            Manage
          </Link>
        </div>
        <ul className={styles.list}>
          {staffResult.ok && staff.length === 0 && (
            <li className={styles.emptyState}>
              No staff records yet. Add a team to view coverage.
            </li>
          )}
          {!authNotice && !staffResult.ok && (
            <li className={styles.emptyState}>
              Staff service is offline. Retry in a moment.
            </li>
          )}
          {staff.slice(0, 6).map((member) => (
            <li key={member.id} className={styles.listItem}>
              <div>
                <div className={styles.listTitle}>{member.name}</div>
                <div className={styles.listMeta}>
                  {member.role}
                  {member.department ? ` - ${member.department}` : ""}
                </div>
              </div>
              <span className={styles.tag}>On shift</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Room overview</div>
            <div className={styles.panelMeta}>Fixed set of 10 rooms</div>
          </div>
          <Link href="/dashboard/rooms" className={styles.tag}>
            View all
          </Link>
        </div>
        <ul className={styles.list}>
          {roomsResult.ok && rooms.length === 0 && (
            <li className={styles.emptyState}>
              Rooms are seeding. Reload in a moment.
            </li>
          )}
          {!authNotice && !roomsResult.ok && (
            <li className={styles.emptyState}>
              Room service is offline. Retry in a moment.
            </li>
          )}
          {rooms.slice(0, 6).map((room) => (
            <li key={room.id} className={styles.listItem}>
              <div>
                <div className={styles.listTitle}>{room.roomNumber}</div>
                <div className={styles.listMeta}>
                  {room.wing}
                  {room.assignedPatient ? ` - ${room.assignedPatient}` : ""}
                </div>
              </div>
              <span className={styles.tag}>{room.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
