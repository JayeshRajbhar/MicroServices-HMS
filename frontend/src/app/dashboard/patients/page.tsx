import PatientManager from "./PatientManager";
import styles from "../dashboard.module.css";

export default async function PatientsPage() {
  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Patients</p>
          <h1 className={styles.pageTitle}>Active patient directory</h1>
          <p className={styles.pageSubtitle}>
            Track intake details, appointment history, and key medical notes in
            one consistent view.
          </p>
        </div>
        <div className={styles.pageActions}>
          <a
            href="#patient-form"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Add patient
          </a>
        </div>
      </div>
      <PatientManager initialPatients={[]} initialOk={false} />
    </div>
  );
}
