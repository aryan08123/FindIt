import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import PageHeader from "../components/PageHeader";
import ItemImage from "../components/ItemImage";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import claimService from "../services/claimService";
import { errorMessage, formatDate } from "../utils/helpers";

const TABS = [
  ["", "All"],
  ["PENDING", "Pending"],
  ["APPROVED", "Approved"],
  ["REJECTED", "Rejected"],
];

export default function MyClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    claimService
      .myClaims()
      .then((data) => {
        if (!cancelled) setClaims(data);
      })
      .catch((err) => {
        if (!cancelled) setError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  const visible = tab ? claims.filter((c) => c.status === tab) : claims;

  return (
    <>
      <PageHeader
        title="My claims"
        subtitle="Track the claims you have submitted for found items."
      />

      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button
            key={key || "all"}
            role="tab"
            aria-selected={tab === key}
            className={`tab ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading your claims…" />
      ) : error ? (
        <div className="alert alert-error">
          {error}{" "}
          <button className="link-btn" onClick={() => setReload((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No claims here"
          message="Found something that looks like yours? Browse found items and submit a claim."
          action={
            <Link to="/browse?type=FOUND" className="btn btn-primary">
              Browse found items
            </Link>
          }
        />
      ) : (
        <div className="report-list">
          {visible.map((c) => (
            <article className="claim-card" key={c.id}>
              <div className="claim-head">
                <div className="claim-thumb">
                  <ItemImage path={c.itemImageUrl} alt={c.itemName} />
                </div>
                <div className="claim-head-info">
                  <h3>{c.itemName}</h3>
                  <small>
                    Found at {c.itemLocation} · claim submitted{" "}
                    {formatDate(c.createdAt)}
                  </small>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="claim-body">
                <div className="claim-block">
                  <strong>Your explanation</strong>
                  {c.description}
                </div>
                <div className="claim-block">
                  <strong>Proof you gave</strong>
                  {c.proofDetails}
                </div>
              </div>

              {c.status === "PENDING" && (
                <p className="claim-note">
                  Waiting for an administrator to review this claim.
                </p>
              )}
              {c.adminRemarks && (
                <div
                  className={`claim-remarks remarks-${c.status.toLowerCase()}`}
                >
                  <strong>Administrator remarks</strong>
                  {c.adminRemarks}
                </div>
              )}

              <div className="claim-foot">
                <span>
                  Item status: <StatusBadge status={c.itemStatus} />
                </span>
                <Link
                  to={`/items/${c.itemId}`}
                  className="btn btn-outline btn-sm"
                >
                  View item
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}



