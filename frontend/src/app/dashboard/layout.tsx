import Link from "next/link";
import AuthControls from "./AuthControls";
import DashboardNav from "./DashboardNav";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarDot} />
            HospitalOS
          </div>
          <div className={styles.sidebarLabel}>Operations console</div>
        </div>
        <DashboardNav />
        <div className={styles.sidebarFooter}>
          Shared database • Three live services
        </div>
      </aside>
      <section className={styles.content}>
        <div className={styles.topBar}>
          <div>
            <div className={styles.topLabel}>Live system</div>
            <div className={styles.topSub}>
              Updates in real-time from patient, doctor, and staff services.
            </div>
          </div>
          <div className={styles.topActions}>
            <AuthControls />
            <Link href="/" className={`${styles.button} ${styles.buttonGhost}`}>
              Marketing site
            </Link>
            <Link
              href="/#demo"
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Request support
            </Link>
          </div>
        </div>
        {children}
      </section>
    </div>
  );
}
