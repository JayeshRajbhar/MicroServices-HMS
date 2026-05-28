"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/patients", label: "Patients" },
  { href: "/dashboard/doctors", label: "Doctors" },
  { href: "/dashboard/staff", label: "Staff" },
  { href: "/dashboard/rooms", label: "Rooms", badge: "10" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.sideNav}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`${styles.sideLink} ${isActive ? styles.sideLinkActive : ""}`}
          >
            {item.label}
            {(item.badge || isActive) && (
              <span className={styles.sideBadge}>{item.badge ?? "Live"}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
