import { useState } from "react";
import {
  FiUser, FiClipboard, FiCheckSquare, FiUploadCloud, FiActivity, FiLogOut,
  FiPhone, FiMail, FiHome, FiList, FiSettings, FiBookOpen, FiArrowRightCircle
} from "react-icons/fi";

// ---- Sample data (replace with API call later) ----
const clientData = {
  companyName: "Pramanya Solutions Pvt Ltd",
  clientName: "Ravi Krishna Rayudu",
  pocname: "Amit Sharma",
  pocphone: "+91 9876543210",
  email: "ravi@pramanya.com",
  requirement: "Working Capital Loan",
  product: {
    name: "Working Capital Finance",
    details: "Flexible credit facility for business operations, invoice discounting, and overdraft."
  },
  checklist: {
    partA: [
      "Last 3 years financials Along with ITR’s",
      "Latest year provisionals",
      "Debt sheet",
      "Work order - if applicable",
      "Company profile",
      "Colletral details.",
      "Projections(CMA data)"
    ],
    partB: [
      "Sanction Letters",
      "Individual ITR’s",
      "Company and promoters KYC",
      "Last one year banking of all the current accounts.",
      "Last one year GSTR3B of all the GST’s.",
      "Creditors and Debtors ageing report - if applicable",
      "Loan SOA’s",
      "Colletral full set",
      "Directors profile",
      "Group company details if any."
    ]
  },
  documentsUploaded: ["Company profile", "Colletral details."],
  banker: {
    assigned: true,
    name: "Ms. Priya Mehra",
    email: "priya@bestbank.com",
    phone: "+91 9900887766",
    bank: "Best Bank Ltd."
  },
  caseProgress: [
    { stage: "Registered", status: "done" },
    { stage: "Documents Pending", status: "in-progress" },
    { stage: "Banker Assigned", status: "done" },
    { stage: "Underwriting", status: "pending" },
    { stage: "Sanction/Disbursement", status: "pending" }
  ],
  notification: "PART A checklist received. Notified Underwriter and Operations team."
};

const allProducts = [
  { name: "Working Capital Finance", details: "Credit for business ops, invoice discounting, OD etc." },
  { name: "Loan Against Property", details: "Flexible funding with property collateral." },
  { name: "Term Loan", details: "Long term funding for asset creation." },
  { name: "Invoice Discounting", details: "Advance on pending customer bills." }
];

// ---- UI Main ----
export default function ClientDashboardDark() {
  const [docsUploaded, setDocsUploaded] = useState(clientData.documentsUploaded || []);
  const [showProducts, setShowProducts] = useState(false);

  // Handlers for checklist upload (stub; connect to API later)
  const allDocs = [...clientData.checklist.partA, ...clientData.checklist.partB];
  const pendingDocs = allDocs.filter(d => !docsUploaded.includes(d));
  function handleDocUpload(doc) {
    if (!docsUploaded.includes(doc)) setDocsUploaded(docs => [...docs, doc]);
  }

  // --- Status progress for progress bar
  function progressPercent() {
    const idx = clientData.caseProgress.findIndex(s => s.status === "in-progress" || s.status === "pending");
    return Math.round((idx / clientData.caseProgress.length) * 100);
  }

  return (
    <div className="dash-bg">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <FiHome size={32} />
          <span className="logo-txt">RWOT</span>
        </div>
        <nav className="dash-nav">
          <NavItem icon={<FiClipboard />} label="Dashboard" active />
          <NavItem icon={<FiUser />} label="Profile" />
          <NavItem icon={<FiList />} label="Requirements" />
          <NavItem icon={<FiCheckSquare />} label="Checklist" />
          <NavItem icon={<FiUploadCloud />} label="Upload" />
          <NavItem icon={<FiActivity />} label="Progress" />
          <NavItem icon={<FiBookOpen />} label="Products" onClick={() => setShowProducts(true)} />
          <NavItem icon={<FiSettings />} label="Settings" />
        </nav>
        <div className="dash-logout"><FiLogOut /> Logout</div>
      </aside>

      {/* MAIN */}
      <main className="dash-main">
        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-client" style={{ marginBottom: "12px"}}>
            <div className="dash-client-initial">{clientData.clientName[0]}</div>
            <div>
              <div className="client-name">{clientData.clientName}</div>
              <div className="company-name">{clientData.companyName}</div>
            </div>
          </div>
          <div className="dash-contact">
            <FiPhone /> {clientData.pocphone}
            <span style={{ margin: "0 12px" }} />
            <FiMail /> {clientData.email}
          </div>
        </header>

        {/* TOP CARDS */}
        <section className="dash-top-cards">
          <DashStatCard
            icon={<FiClipboard />}
            label="Requirement"
            value={clientData.requirement}
            detail={clientData.product.name}
            sub={clientData.product.details}
          />
          <DashStatCard
            icon={<FiUser />}
            label="POC"
            value={clientData.pocname}
            detail={clientData.pocphone}
            sub={clientData.email}
          />
          <DashStatCard
            icon={<FiCheckSquare />}
            label="Documents"
            value={`${docsUploaded.length}/${allDocs.length}`}
            detail={pendingDocs.length === 0 ? "All uploaded" : `${pendingDocs.length} pending`}
            sub="Checklist"
          />
        </section>

        {/* MAIN GRID */}
        <section className="dash-cards-grid">

          {/* Case Progress */}
          <div className="dash-card">
            <div className="dash-card-title">Case Progress</div>
            <ProgressBar
              steps={clientData.caseProgress}
              percent={progressPercent()}
            />
            <div style={{ fontSize: "0.93rem", marginTop: "12px", color: "#b3b3b3" }}>
              {clientData.caseProgress.find(s => s.status === "in-progress")?.stage || ""}
            </div>
          </div>

          {/* Checklist */}
          <div className="dash-card">
            <div className="dash-card-title">Document Checklist</div>
            <div className="dash-checklist-section">
              <span className="dash-checklist-header">PART A</span>
              <ul className="dash-checklist-list">
                {clientData.checklist.partA.map(doc =>
                  <ChecklistItem
                    key={doc}
                    doc={doc}
                    checked={docsUploaded.includes(doc)}
                    onUpload={() => handleDocUpload(doc)}
                  />
                )}
              </ul>
              <span className="dash-checklist-header">PART B</span>
              <ul className="dash-checklist-list">
                {clientData.checklist.partB.map(doc =>
                  <ChecklistItem
                    key={doc}
                    doc={doc}
                    checked={docsUploaded.includes(doc)}
                    onUpload={() => handleDocUpload(doc)}
                  />
                )}
              </ul>
            </div>
          </div>

          {/* Banker */}
          <div className="dash-card">
            <div className="dash-card-title">Assigned Banker</div>
            {clientData.banker?.assigned ? (
              <div className="dash-banker">
                <div><b>Name:</b> {clientData.banker.name}</div>
                <div><b>Email:</b> {clientData.banker.email}</div>
                <div><b>Phone:</b> {clientData.banker.phone}</div>
                <div><b>Bank:</b> {clientData.banker.bank}</div>
              </div>
            ) : <div className="dash-banker">No banker assigned yet.</div>}
          </div>

          {/* Notification */}
          <div className="dash-card">
            <div className="dash-card-title">Notification</div>
            <div className="dash-notification">
              <FiActivity /> {clientData.notification}
            </div>
            <div className="dash-other-products-link" onClick={() => setShowProducts(true)}>
              <FiArrowRightCircle /> Explore Other Products
            </div>
          </div>
        </section>
      </main>

      {/* PRODUCT MODAL */}
      {showProducts && (
        <div className="dash-modal-bg" onClick={() => setShowProducts(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-title">All Products</div>
            <ul>
              {allProducts.map(prod =>
                <li key={prod.name}>
                  <b>{prod.name}</b>: <span style={{ color: "#b0cfff" }}>{prod.details}</span>
                </li>
              )}
            </ul>
            <button className="dash-modal-close" onClick={() => setShowProducts(false)}>Close</button>
          </div>
        </div>
      )}

      {/* SCOPED CSS */}
      <style jsx="true">{`
        body, .dash-bg { background:#ffffff; color: #fff; }
        .dash-bg {
          min-height: 100vh; width: 100vw; display: flex; flex-direction: row;
        }
        .dash-sidebar {
          width: 210px;
          background: #525252;
          min-height: 100vh;
          padding: 24px 10px 10px 10px;
          display: flex; flex-direction: column; align-items: flex-start;
          box-shadow: 1px 0 12pxrgb(255, 255, 255);
        }
        .dash-logo {
          font-weight: 700; font-size: 1.6rem;
          display: flex; align-items: center; gap: 10px; margin-bottom: 30px;
          color:#ffffff;
        }
        .logo-txt { font-weight: 800; font-size: 1.6rem; }
        .dash-nav { flex: 1 1 auto; width: 100%; }
        .dash-logout {
          font-size: 1.01rem; margin-top: 14px; color: #fa5d67;
          cursor: pointer; display: flex; gap: 8px; align-items: center;
          padding: 7px 12px; border-radius: 7px;
          transition: background 0.2s;
        }
        .dash-logout:hover { background:#ffffff; }

        .dash-main { flex: 1 1 auto; padding: 0 0 0 0; }
        .dash-header {
          padding: 26px 38px 0 38px; display: flex; align-items: center; justify-content: space-between;
          background: #000; box-shadow: 0 1px 7px #1111;
        }
        .dash-client { display: flex; align-items: center; gap: 15px; }
        .dash-client-initial {
          width: 48px; height: 48px; border-radius: 50%; background:rgb(255, 255, 255); display: flex;
          justify-content: center; align-items: center; font-size: 1.7rem; font-weight: bold; color: #6cd1ff;
        }
        .client-name { font-weight: 700; font-size: 1.19rem; color: #fff; }
        .company-name { color: #b9c2cc; font-size: 1.01rem; }
        .dash-contact { color: #86a4d3; font-size: 1.03rem; display: flex; align-items: center; gap: 4px; }

        .dash-top-cards {
          display: flex; gap: 34px;
          margin: 32px 40px 10px 40px;
        }
        .dash-stat-card {
          flex: 1; min-width: 195px; max-width: 320px;
          background:#525252;
          border-radius: 13px;
          box-shadow: 0 2px 16px#000000;
          padding: 22px 18px 16px 18px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .dash-stat-top { display: flex; align-items: center; gap: 12px; font-size: 1.15rem; }
        .dash-stat-label { color: #6cd1ff; font-size: 0.97rem; font-weight: 600;}
        .dash-stat-value { font-size: 1.16rem; font-weight: 700; color: #fff; }
        .dash-stat-detail { color: #f7c47b; font-size: 1.07rem; font-weight: 600;}
        .dash-stat-sub { color: #8faad1; font-size: 0.96rem; margin-top: 2px;}

        .dash-cards-grid {
          margin: 20px 40px 30px 40px;
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px;
        }
        .dash-card {
          background:#525252;
          border-radius: 15px;
          box-shadow: 0 2px 14px #525252;
          padding: 22px 22px 16px 22px;
          min-width: 220px; min-height: 180px;
        }
        .dash-card-title { font-size: 1.09rem; font-weight: 700; margin-bottom: 9px; color: #53b4ff; }

        /* Checklist */
        .dash-checklist-header { font-weight: 700; color: #7cf6d6; display: block; margin: 13px 0 6px 0;}
        .dash-checklist-list { list-style: none; padding-left: 0; }
        .dash-checklist-list li { margin-bottom: 6px; }
        .dash-checklist-checkbox {
          accent-color: #47d6a5; width: 16px; height: 16px; margin-right: 7px;
        }
        .dash-upload-btn {
          background:rgb(82, 82, 82); color: #85f6ff; border: none; border-radius: 6px;
          font-size: 0.9rem; padding: 3px 11px; margin-left: 10px; cursor: pointer;
          transition: background 0.2s;
        }
        .dash-upload-btn:hover { background:rgba(56, 96, 190, 0); color: #fff; }
        .dash-uploaded { color:rgb(255, 255, 255); text-decoration: line-through; }

        /* Progress bar */
        .progress-bar-bg {
          background:rgb(0, 0, 0); border-radius: 6px; height: 11px; width: 100%; margin-top: 11px;
        }
        .progress-bar-fill {
          background: linear-gradient(90deg,#52a0fa,#65f6e3 80%);
          border-radius: 6px; height: 11px; transition: width 0.6s;
        }
        .progress-bar-label {
          font-size: 0.99rem; font-weight: 600; color: #a0cdfa; margin-top: 5px;
        }
        .progress-bar-steps { display: flex; justify-content: space-between; margin-top: 8px; }
        .progress-bar-step {
          font-size: 0.89rem; color: #c4cfff; opacity: 0.7;
        }

        /* Banker */
        .dash-banker div { font-size: 0.99rem; margin-bottom: 5px; }
        .dash-banker { color: #9cbeed; background: #232d47; border-radius: 7px; padding: 12px 10px; }

        .dash-notification { color: #f7c47b; font-size: 1.01rem; margin: 13px 0 14px 0; display: flex; gap: 10px; align-items: center;}
        .dash-other-products-link {
          color: #7cf6d6; cursor: pointer; font-size: 1.03rem; display: flex; gap: 7px; align-items: center;
          margin-top: 9px; font-weight: 600;
        }
        .dash-other-products-link:hover { text-decoration: underline; color: #6cd1ff;}

        /* Modal */
        .dash-modal-bg {
          position: fixed; left: 0; top: 0; width: 100vw; height: 100vh;
          background: #000c; z-index: 1001; display: flex; justify-content: center; align-items: center;
        }
        .dash-modal {
          background: #161a29;
          color: #b0cfff;
          border-radius: 14px;
          box-shadow: 0 6px 40px #18284744;
          padding: 38px 36px 28px 36px;
          min-width: 300px; max-width: 94vw;
          min-height: 100px;
          position: relative;
        }
        .dash-modal-title { font-size: 1.17rem; font-weight: bold; margin-bottom: 18px; color: #7cf6d6;}
        .dash-modal-close {
          margin-top: 25px; background: #222b4c; color: #ff8383; border: none; padding: 7px 18px; border-radius: 8px; font-size: 1.01rem; font-weight: 600; cursor: pointer;
          box-shadow: 0 1px 10px #0003;
        }

        /* Responsive */
        @media (max-width: 1050px) {
          .dash-main { min-width: 0; }
          .dash-header, .dash-top-cards, .dash-cards-grid { margin-left: 12px; margin-right: 12px;}
        }
        @media (max-width: 800px) {
          .dash-sidebar { width: 62px; min-width: 62px; align-items: center; padding: 15px 0;}
          .dash-logo { font-size: 1.12rem; }
          .logo-txt { display: none;}
          .dash-nav span { display: none;}
        }
        @media (max-width: 750px) {
          .dash-header { flex-direction: column; align-items: flex-start; gap: 11px; padding: 13px 8px 0 8px;}
          .dash-top-cards { flex-direction: column; gap: 18px; margin: 22px 8px 4px 8px;}
          .dash-cards-grid { grid-template-columns: 1fr; margin: 10px 7px;}
        }
        @media (max-width: 510px) {
          .dash-sidebar { display: none;}
          .dash-header { margin-top: 10px; }
        }
      `}</style>
    </div>
  );
}

// ---- Components for code clarity ----

function NavItem({ icon, label, active, ...props }) {
  return (
    <div className={`dash-navitem ${active ? "active" : ""}`} {...props} style={{
      display: "flex", alignItems: "center", gap: "9px", color: active ? "#7cf6d6" : "#a2a6b6", padding: "8px 10px",
      borderRadius: "7px", cursor: "pointer", fontWeight: 600, marginBottom: 10, background: active ? "#101c2e44" : "none"
    }}>
      {icon}<span>{label}</span>
    </div>
  );
}

function DashStatCard({ icon, label, value, detail, sub }) {
  return (
    <div className="dash-stat-card">
      <div className="dash-stat-top">{icon} <span className="dash-stat-label">{label}</span></div>
      <div className="dash-stat-value">{value}</div>
      <div className="dash-stat-detail">{detail}</div>
      <div className="dash-stat-sub">{sub}</div>
    </div>
  );
}

function ChecklistItem({ doc, checked, onUpload }) {
  return (
    <li>
      <input className="dash-checklist-checkbox" type="checkbox" checked={checked} readOnly />
      <span className={checked ? "dash-uploaded" : ""}>{doc}</span>
      {!checked && (
        <button className="dash-upload-btn" onClick={onUpload}>Upload</button>
      )}
    </li>
  );
}

function ProgressBar({ steps, percent }) {
  return (
    <div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: percent + "%" }} />
      </div>
      <div className="progress-bar-label">{percent}% completed</div>
      <div className="progress-bar-steps">
        {steps.map((s, i) =>
          <span key={i} className="progress-bar-step" style={{
            color:
              s.status === "done" ? "#53ffbe"
                : s.status === "in-progress" ? "#f7c47b"
                  : "#94a3b8",
            fontWeight: s.status === "in-progress" ? 600 : 500
          }}>{s.stage}</span>
        )}
      </div>
    </div>
  );
}
