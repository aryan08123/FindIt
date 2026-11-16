import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  ClipboardList,
  Clock,
  PackageSearch,
  Plus,
  Search,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import ItemCard from "../components/ItemCard";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import itemService from "../services/itemService";
import claimService from "../services/claimService";
import publicService from "../services/publicService";
import { errorMessage, formatDate } from "../utils/helpers";

const QUICK_ACTIONS = [
  { to: "/report/lost", label: "Report lost item", icon: Plus },
  { to: "/report/found", label: "Report found item", icon: PackageSearch },
  { to: "/browse", label: "Browse items", icon: Search },
  { to: "/my-claims", label: "My claims", icon: ClipboardList },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    Promise.all([
      itemService.myReports(),
      claimService.myClaims(),
      publicService.recentItems(),
    ])
      .then(([reports, claims, recent]) => {
        if (!cancelled) setData({ reports, claims, recent });
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const firstName = user.fullName.split(" ")[0];

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
    if (!data) return <Loader text="Loading your dashboard…" />;

    const { reports, claims, recent } = data;
    const lostCount = reports.filter((r) => r.itemType === "LOST").length;
    const foundCount = reports.filter((r) => r.itemType === "FOUND").length;
    const activeClaims = claims.filter((c) => c.status === "PENDING").length;
    const recovered = reports.filter((r) => r.status === "RECOVERED").length;

    return (
      <>
        <div className="stat-cards">
          <StatCard
            icon={Search}
            label="Lost items reported"
            value={lostCount}
            tone="purple"
            to="/my-reports"
          />
          <StatCard
            icon={PackageSearch}
            label="Found items reported"
            value={foundCount}
            tone="blue"
            to="/my-reports"
          />
          <StatCard
            icon={Clock}
            label="Active claims"
            value={activeClaims}
            tone="amber"
            to="/my-claims"
          />
          <StatCard
            icon={Check}
            label="Recovered items"
            value={recovered}
            tone="green"
            to="/my-reports"
          />
        </div>

        <div className="quick-actions">
          {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="quick-action">
              <span className="qa-icon">
                <Icon size={20} />
              </span>
              {label}
            </Link>
          ))}
        </div>

        <div className="two-col">
          <section className="panel">
            <div className="panel-head">
              <h2>My reports</h2>
              <Link to="/my-reports">View all</Link>
            </div>
            {reports.length === 0 ? (
              <p className="muted">You have not reported anything yet.</p>
            ) : (
              <ul className="mini-list">
                {reports.slice(0, 4).map((r) => (
                  <li className="mini-row" key={r.id}>
                    <div>
                      <strong>{r.itemName}</strong>
                      <small>
                        {r.location} · {formatDate(r.reportedDate)}
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

          <section className="panel">
            <div className="panel-head">
              <h2>My claims</h2>
              <Link to="/my-claims">View all</Link>
            </div>
            {claims.length === 0 ? (
              <p className="muted">You have not submitted any claims.</p>
            ) : (
              <ul className="mini-list">
                {claims.slice(0, 4).map((c) => (
                  <li className="mini-row" key={c.id}>
                    <div>
                      <strong>{c.itemName}</strong>
                      <small>Submitted {formatDate(c.createdAt)}</small>
                    </div>
                    <StatusBadge status={c.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section>
          <div className="panel-head panel-head-plain">
            <h2>Recently reported on campus</h2>
            <Link to="/browse">Browse all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="muted">No reports yet.</p>
          ) : (
            <div className="item-grid">
              {recent.slice(0, 4).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </section>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}!`}
        subtitle="Here is what is happening with your reports and claims."
        actions={
          <Link to="/report/lost" className="btn btn-primary">
            <Plus size={16} /> Report lost item
          </Link>
        }
      />
      {renderBody()}
    </>
  );
}


