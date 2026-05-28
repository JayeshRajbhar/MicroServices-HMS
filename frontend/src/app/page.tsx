import Link from "next/link";
import styles from "./page.module.css";
import {
  fetchList,
  serviceUrls,
  type Doctor,
  type Patient,
  type Staff,
} from "../lib/service";

export const dynamic = "force-dynamic";

const { patientBaseUrl, doctorBaseUrl, staffBaseUrl } = serviceUrls;

function formatCount(value: number) {
  return value.toLocaleString("en-US");
}

export default async function Home() {
  const [patientsResult, doctorsResult, staffResult] = await Promise.all([
    fetchList<Patient>(patientBaseUrl, "/patients"),
    fetchList<Doctor>(doctorBaseUrl, "/doctors"),
    fetchList<Staff>(staffBaseUrl, "/staff"),
  ]);

  const patients = patientsResult.items;
  const doctors = doctorsResult.items;
  const staff = staffResult.items;

  return (
    <div className={styles.page}>
      <header className={styles.topNav}>
        <div className={styles.navInner}>
          <div className={styles.wordmark}>
            <span className={styles.wordmarkDot} />
            HospitalOS
          </div>
          <nav className={styles.navLinks}>
            <a href="#platform">Platform</a>
            <a href="#workflow">Workflow</a>
            <a href="#pricing">Pricing</a>
            <a href="#resources">Resources</a>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
          <div className={styles.navActions}>
            <Link href="/auth" className={styles.navLink}>
              Sign in
            </Link>
            <a
              href="#demo"
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              Book a demo
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <section className={`${styles.section} ${styles.hero}`}>
          <div className={styles.sectionInner}>
            <div className={styles.heroGrid}>
              <div className={`${styles.reveal} ${styles.revealDelay1}`}>
                <p className={styles.heroEyebrow}>Unified scheduling</p>
                <h1 className={styles.heroTitle}>
                  A calmer way to coordinate patients, doctors, and staff.
                </h1>
                <p className={styles.heroSubtitle}>
                  HospitalOS brings your three microservices into a single live
                  surface, giving every team member the same real-time view of
                  appointments, coverage, and availability.
                </p>
                <div className={styles.heroActions}>
                  <Link
                    href="/dashboard"
                    className={`${styles.button} ${styles.buttonPrimary}`}
                  >
                    Launch live view
                  </Link>
                  <a
                    href="#workflow"
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    See the workflow
                  </a>
                </div>
                <div className={styles.heroMeta}>
                  <div className={styles.pillGroup}>
                    <span className={`${styles.pill} ${styles.pillActive}`}>
                      Patients
                    </span>
                    <span className={styles.pill}>Doctors</span>
                    <span className={styles.pill}>Staff</span>
                  </div>
                  <span>HIPAA-aligned, audit-ready workflows</span>
                </div>
              </div>

              <div
                className={`${styles.heroMock} ${styles.reveal} ${styles.revealDelay2}`}
              >
                <div className={styles.mockHeader}>
                  <div>
                    <div className={styles.mockTitle}>Weekly schedule</div>
                    <div className={styles.cardLabel}>Dr. Asha Patel</div>
                  </div>
                  <span className={styles.mockBadge}>Live</span>
                </div>
                <div className={styles.calendarGrid}>
                  {Array.from({ length: 28 }).map((_, index) => (
                    <div
                      key={`cell-${index}`}
                      className={`${
                        styles.calendarCell
                      } ${index === 9 || index === 16 ? styles.calendarCellActive : ""}`}
                    />
                  ))}
                </div>
                <div className={styles.timeList}>
                  <div className={styles.timeSlot}>09:00 • Intake</div>
                  <div className={styles.timeSlot}>10:30 • Follow-up</div>
                  <div className={styles.timeSlot}>13:00 • Consultation</div>
                  <div className={styles.timeSlot}>15:00 • Review</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.heroEyebrow}>Live system</p>
                <h2 className={styles.sectionTitle}>
                  Real-time clinic directory
                </h2>
              </div>
              <p className={styles.sectionBody}>
                The frontend listens directly to each microservice so every
                dashboard view stays current with the shared Postgres database.
              </p>
            </div>

            <div className={styles.cardGrid}>
              <article className={`${styles.card} ${styles.reveal}`}>
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardLabel}>Patients</div>
                    <div className={styles.cardValue}>
                      {formatCount(patients.length)}
                    </div>
                  </div>
                  <span
                    className={`${
                      styles.status
                    } ${patientsResult.ok ? styles.statusOk : styles.statusWarn}`}
                  >
                    {patientsResult.ok ? "Online" : "Offline"}
                  </span>
                </div>
                <ul className={styles.dataList}>
                  {patientsResult.authRequired && (
                    <li className={styles.dataEmpty}>
                      Sign in to view patient records.
                    </li>
                  )}
                  {patientsResult.ok &&
                    !patientsResult.authRequired &&
                    patients.length === 0 && (
                    <li className={styles.dataEmpty}>
                      No patients yet. Create the first record.
                    </li>
                  )}
                  {!patientsResult.ok && (
                    <li className={styles.dataEmpty}>
                      Patient service unavailable.
                    </li>
                  )}
                  {patients.slice(0, 3).map((patient) => (
                    <li key={patient.id} className={styles.dataRow}>
                      <span>{patient.name}</span>
                      <span className={styles.dataMeta}>
                        {patient.dateOfBirth ?? "DOB pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article
                className={`${styles.card} ${styles.reveal} ${styles.revealDelay1}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardLabel}>Doctors</div>
                    <div className={styles.cardValue}>
                      {formatCount(doctors.length)}
                    </div>
                  </div>
                  <span
                    className={`${
                      styles.status
                    } ${doctorsResult.ok ? styles.statusOk : styles.statusWarn}`}
                  >
                    {doctorsResult.ok ? "Online" : "Offline"}
                  </span>
                </div>
                <ul className={styles.dataList}>
                  {doctorsResult.authRequired && (
                    <li className={styles.dataEmpty}>
                      Sign in to view doctor records.
                    </li>
                  )}
                  {doctorsResult.ok &&
                    !doctorsResult.authRequired &&
                    doctors.length === 0 && (
                    <li className={styles.dataEmpty}>
                      No doctors yet. Create the first record.
                    </li>
                  )}
                  {!doctorsResult.ok && (
                    <li className={styles.dataEmpty}>
                      Doctor service unavailable.
                    </li>
                  )}
                  {doctors.slice(0, 3).map((doctor) => (
                    <li key={doctor.id} className={styles.dataRow}>
                      <span>{doctor.name}</span>
                      <span className={styles.dataMeta}>
                        {doctor.specialty}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>

              <article
                className={`${styles.card} ${styles.reveal} ${styles.revealDelay2}`}
              >
                <div className={styles.cardHeader}>
                  <div>
                    <div className={styles.cardLabel}>Staff</div>
                    <div className={styles.cardValue}>
                      {formatCount(staff.length)}
                    </div>
                  </div>
                  <span
                    className={`${
                      styles.status
                    } ${staffResult.ok ? styles.statusOk : styles.statusWarn}`}
                  >
                    {staffResult.ok ? "Online" : "Offline"}
                  </span>
                </div>
                <ul className={styles.dataList}>
                  {staffResult.authRequired && (
                    <li className={styles.dataEmpty}>
                      Sign in to view staff records.
                    </li>
                  )}
                  {staffResult.ok &&
                    !staffResult.authRequired &&
                    staff.length === 0 && (
                    <li className={styles.dataEmpty}>
                      No staff yet. Create the first record.
                    </li>
                  )}
                  {!staffResult.ok && (
                    <li className={styles.dataEmpty}>
                      Staff service unavailable.
                    </li>
                  )}
                  {staff.slice(0, 3).map((member) => (
                    <li key={member.id} className={styles.dataRow}>
                      <span>{member.name}</span>
                      <span className={styles.dataMeta}>{member.role}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.heroEyebrow}>Clarity at every step</p>
                <h2 className={styles.sectionTitle}>
                  Everything your care teams need, in one flow
                </h2>
              </div>
              <p className={styles.sectionBody}>
                Lightweight cards surface the important work while the UI
                fragments mirror the actual microservice data.
              </p>
            </div>
            <div className={styles.cardGrid}>
              <article className={styles.featureCard}>
                <div className={styles.featureIcon}>AI</div>
                <h3>Smart intake routing</h3>
                <p className={styles.sectionBody}>
                  Patient forms auto-route to the right doctor based on
                  specialty and current availability.
                </p>
                <div className={styles.miniWidget}>
                  <div className={styles.miniRow}>
                    <span>Cardiology</span>
                    <span>Assigned</span>
                  </div>
                  <div className={styles.miniRow}>
                    <span>Neurology</span>
                    <span>Queue</span>
                  </div>
                </div>
              </article>

              <article className={styles.featureCard}>
                <div className={styles.featureIcon}>RT</div>
                <h3>Real-time coverage</h3>
                <p className={styles.sectionBody}>
                  Staff assignments update instantly so nurse leads always see
                  coverage gaps.
                </p>
                <div className={styles.miniWidget}>
                  <div className={styles.miniRow}>
                    <span>Ward A</span>
                    <span>4 on shift</span>
                  </div>
                  <div className={styles.miniRow}>
                    <span>Ward B</span>
                    <span>2 on shift</span>
                  </div>
                </div>
              </article>

              <article className={styles.featureCard}>
                <div className={styles.featureIcon}>UX</div>
                <h3>Unified scheduling</h3>
                <p className={styles.sectionBody}>
                  A single glance shows upcoming appointments, open slots, and
                  the exact team supporting each visit.
                </p>
                <div className={styles.miniWidget}>
                  <div className={styles.miniRow}>
                    <span>10:30</span>
                    <span>Dr. Ahmed</span>
                  </div>
                  <div className={styles.miniRow}>
                    <span>11:00</span>
                    <span>Open slot</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="workflow" className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.heroEyebrow}>Workflow</p>
                <h2 className={styles.sectionTitle}>
                  Automation without losing the human touch
                </h2>
              </div>
              <p className={styles.sectionBody}>
                From admission to follow-up, every step is visible and assigned.
              </p>
            </div>
            <div className={styles.productMockup}>
              <div className={styles.workflowSteps}>
                <div className={styles.workflowStep}>
                  <span>Admission request received</span>
                  <span className={styles.workflowBadge}>Queue</span>
                </div>
                <div className={styles.workflowStep}>
                  <span>Doctor assigned</span>
                  <span className={styles.workflowBadge}>Auto-match</span>
                </div>
                <div className={styles.workflowStep}>
                  <span>Staff shift confirmed</span>
                  <span className={styles.workflowBadge}>Coverage</span>
                </div>
                <div className={styles.workflowStep}>
                  <span>Follow-up created</span>
                  <span className={styles.workflowBadge}>Scheduled</span>
                </div>
              </div>
              <div className={styles.miniWidget}>
                <div className={styles.miniRow}>
                  <span>Patient service</span>
                  <span className={styles.dataMeta}>Synced</span>
                </div>
                <div className={styles.miniRow}>
                  <span>Doctor service</span>
                  <span className={styles.dataMeta}>Synced</span>
                </div>
                <div className={styles.miniRow}>
                  <span>Staff service</span>
                  <span className={styles.dataMeta}>Synced</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.heroEyebrow}>Customer story</p>
                <h2 className={styles.sectionTitle}>
                  Teams stay aligned with fewer handoffs
                </h2>
              </div>
            </div>
            <div className={styles.testimonialGrid}>
              <article className={styles.testimonialCard}>
                <div className={styles.avatarRow}>
                  <div className={`${styles.avatar} ${styles.avatarOrange}`}>
                    AM
                  </div>
                  <div>
                    <div>Amira Malik</div>
                    <div className={styles.dataMeta}>Head of Operations</div>
                  </div>
                </div>
                <div className={styles.rating}>★★★★★</div>
                <p>
                  “We went from three disconnected tools to one live surface.
                  Shift changes are smoother and patients see fewer delays.”
                </p>
              </article>
              <article className={styles.testimonialCard}>
                <div className={styles.avatarRow}>
                  <div className={`${styles.avatar} ${styles.avatarPink}`}>
                    JG
                  </div>
                  <div>
                    <div>Jared Grant</div>
                    <div className={styles.dataMeta}>Clinic Director</div>
                  </div>
                </div>
                <div className={styles.rating}>★★★★★</div>
                <p>
                  “Doctors now see the staffing plan before they open their day.
                  It has improved coverage and patient throughput.”
                </p>
              </article>
              <article className={styles.testimonialCard}>
                <div className={styles.avatarRow}>
                  <div className={`${styles.avatar} ${styles.avatarViolet}`}>
                    SR
                  </div>
                  <div>
                    <div>Sara Ruiz</div>
                    <div className={styles.dataMeta}>Nursing Lead</div>
                  </div>
                </div>
                <div className={styles.rating}>★★★★★</div>
                <p>
                  “We finally have a shared snapshot of who is available. It
                  feels modern, calm, and reliable.”
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="pricing" className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.heroEyebrow}>Pricing</p>
                <h2 className={styles.sectionTitle}>
                  Built for clinics of every size
                </h2>
              </div>
              <p className={styles.sectionBody}>
                Start small, scale when your facility does. No hidden database
                costs.
              </p>
            </div>
            <div className={styles.pricingGrid}>
              <article className={styles.pricingCard}>
                <div className={styles.cardLabel}>Starter</div>
                <div className={styles.cardValue}>$29</div>
                <p className={styles.sectionBody}>For single-clinic teams.</p>
                <ul className={styles.pricingList}>
                  <li>Up to 3 departments</li>
                  <li>Shared patient database</li>
                  <li>Email support</li>
                </ul>
                <a
                  href="#"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Choose Starter
                </a>
              </article>

              <article
                className={`${styles.pricingCard} ${styles.pricingFeatured}`}
              >
                <div className={styles.cardLabel}>Teams</div>
                <div className={styles.cardValue}>$79</div>
                <p className={styles.sectionBody}>For growing hospitals.</p>
                <ul className={styles.pricingList}>
                  <li>Unlimited departments</li>
                  <li>Automation workflows</li>
                  <li>Priority support</li>
                </ul>
                <a
                  href="#"
                  className={`${styles.button} ${styles.buttonOnDark}`}
                >
                  Choose Teams
                </a>
              </article>

              <article className={styles.pricingCard}>
                <div className={styles.cardLabel}>Enterprise</div>
                <div className={styles.cardValue}>Let’s talk</div>
                <p className={styles.sectionBody}>
                  For multi-site health networks.
                </p>
                <ul className={styles.pricingList}>
                  <li>Custom security review</li>
                  <li>Dedicated success team</li>
                  <li>On-prem options</li>
                </ul>
                <a
                  href="#demo"
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Contact sales
                </a>
              </article>
            </div>
          </div>
        </section>

        <section id="demo" className={styles.section}>
          <div className={styles.sectionInner}>
            <div className={styles.ctaBand}>
              <div>
                <h2 className={styles.ctaTitle}>
                  Smarter scheduling for every care team.
                </h2>
                <p className={styles.sectionBody}>
                  Connect the three services and launch a calm, unified front
                  desk experience.
                </p>
              </div>
              <a
                href="#"
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                Book a walkthrough
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer id="resources" className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.footerTitle}>Product</div>
            <a className={styles.footerLink} href="#">
              Scheduling
            </a>
            <a className={styles.footerLink} href="#">
              Automation
            </a>
            <a className={styles.footerLink} href="#">
              Integrations
            </a>
          </div>
          <div>
            <div className={styles.footerTitle}>Solutions</div>
            <a className={styles.footerLink} href="#">
              Hospitals
            </a>
            <a className={styles.footerLink} href="#">
              Clinics
            </a>
            <a className={styles.footerLink} href="#">
              Private practice
            </a>
          </div>
          <div>
            <div className={styles.footerTitle}>Company</div>
            <a className={styles.footerLink} href="#">
              About
            </a>
            <a className={styles.footerLink} href="#">
              Security
            </a>
            <a className={styles.footerLink} href="#">
              Careers
            </a>
          </div>
          <div>
            <div className={styles.footerTitle}>Resources</div>
            <a className={styles.footerLink} href="#">
              API docs
            </a>
            <a className={styles.footerLink} href="#">
              Status
            </a>
            <a className={styles.footerLink} href="#">
              Support
            </a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>HospitalOS © 2026</span>
          <span>Built on the patient, doctor, and staff services</span>
        </div>
      </footer>
    </div>
  );
}
