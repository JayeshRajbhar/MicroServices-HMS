import RoomManager from "./RoomManager";
import styles from "../dashboard.module.css";

export default async function RoomsPage() {
  return (
    <div className={styles.dashboardPage}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageEyebrow}>Rooms</p>
          <h1 className={styles.pageTitle}>Room occupancy overview</h1>
          <p className={styles.pageSubtitle}>
            Ten rooms are seeded in the staff service and kept in sync with the
            rest of the hospital workflow.
          </p>
        </div>
        <div className={styles.pageActions}>
          <a
            href="#room-form"
            className={`${styles.button} ${styles.buttonPrimary}`}
          >
            Update rooms
          </a>
        </div>
      </div>

      <RoomManager initialRooms={[]} initialOk={false} />
    </div>
  );
}
