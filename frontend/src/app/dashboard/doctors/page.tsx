import DoctorManager from "./DoctorManager";
import styles from "../dashboard.module.css";

export default async function DoctorsPage() {
  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Doctors</p>
          <h1 className={styles.pageTitle}>Specialist coverage</h1>
          <p className={styles.pageSubtitle}>
            Keep doctor profiles, specialties, and contact details in sync
            across the hospital.
          </p>
        </div>
        <div className={styles.pageActions}>
          <a
            href="#doctor-form"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Add doctor
          </a>
        </div>
      </div>
      <DoctorManager initialDoctors={[]} initialOk={false} />
    </div>
  );
}
