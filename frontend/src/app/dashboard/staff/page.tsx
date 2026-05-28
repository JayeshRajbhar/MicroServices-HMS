import StaffManager from "./StaffManager";
import styles from "../dashboard.module.css";

export default async function StaffPage() {
  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Staff</p>
          <h1 className={styles.pageTitle}>Coverage and assignments</h1>
          <p className={styles.pageSubtitle}>
            Align nurse, admin, and support teams with real-time coverage and
            department assignments.
          </p>
        </div>
        <div className={styles.pageActions}>
          <a
            href="#staff-form"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Add staff member
          </a>
        </div>
      </div>
      <StaffManager initialStaff={[]} initialOk={false} />
    </div>
  );
}
