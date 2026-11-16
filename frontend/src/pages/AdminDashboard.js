import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, PackageSearch, Search, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import BarList from "../components/BarList";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import adminService from "../services/adminService";
import claimService from "../services/claimService";
import { errorMessage, formatDate } from "../utils/helpers";

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    Promise.all([
      adminService.dashboard(),
      claimService.all("PENDING"),
      adminService.reports(),
    ])
      .then(([stats, pending, reports]) => {
        if (!cancelled) setData({ stats, pending, reports });
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const renderBody = () => {
    if (error) {
      return (
        <div className="alert alert-error">
          {error}{" "}
          <button className="link-btn" onClick={() => setReload((n) => n + 1)}>
            Try again
          </button>
        </div>
      );
    }
    if (!data) return <Loader text="Loading dashboard…" />;

    const { stats, pending, reports } = data;

    return (
      <>
        <div className="stat-cards">
          <StatCard
            icon={Users}
            label="Registered students"
            value={stats.totalStudents}
            tone="blue"
            to="/admin/users"
          />
          <StatCard
            icon={Search}
            label="Lost items"
            value={stats.totalLostItems}
            tone="purple"
            to="/admin/reports"
          />
          <StatCard
            icon={PackageSearch}
            label="Found items"
            value={stats.totalFoundItems}
            tone="green"
            to="/admin/reports"
          />
          <StatCard
            icon={Clock}
            label="Pending claims"
            value={stats.pendingClaims}
            tone="amber"
            to="/admin/claims"
          />
        </div>

        <div className="two-col">
          <BarList
            title="Items by status"
            items={[
              { label: "Active", value: stats.activeItems, tone: "blue" },
              { label: "Claimed", value: stats.claimedItems, tone: "amber" },
              {
                label: "Recovered",
                value: stats.recoveredItems,
                tone: "green",
              },
            ]}
          />
          <BarList
            title="Claims by status"
            items={[
              { label: "Pending", value: stats.pendingClaims, tone: "amber" },
              { label: "Approved", value: stats.approvedClaims, tone: "green" },
              { label: "Rejected", value: stats.rejectedClaims, tone: "red" },
            ]}
          />
        </div>

        <div className="two-col">
          <section className="panel">
            <div className="panel-head">
              <h2>Claims waiting for review</h2>
              <Link to="/admin/claims">Open claims</Link>
            </div>
            {pending.length === 0 ? (
              <p className="muted">
                No claims are waiting. You are all caught up.
              </p>
            ) : (
              <ul className="mini-list">
                {pending.slice(0, 5).map((c) => (
                  <li className="mini-row" key={c.id}>
                    <div>
                      <strong>{c.itemName}</strong>
                      <small>
                        {c.claimantName} · {formatDate(c.createdAt)}
                      </small>
                    </div>
                    <Link to="/admin/claims" className="btn btn-outline btn-sm">
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2>Latest reports</h2>
              <Link to="/admin/reports">All reports</Link>
            </div>
            {reports.length === 0 ? (
              <p className="muted">No reports yet.</p>
            ) : (
              <ul className="mini-list">
                {reports.slice(0, 6).map((r) => (
                  <li className="mini-row" key={r.id}>
                    <div>
                      <strong>{r.itemName}</strong>
                      <small>
                        {r.reportedByName} · {formatDate(r.reportedDate)}
                      </small>
                    </div>
                    <div className="mini-badges">
                      <StatusBadge status={r.itemType} />
                      <StatusBadge status={r.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="Admin dashboard"
        subtitle="An overview of everything happening on campus."
      />
      {renderBody()}
    </>
  );
}


