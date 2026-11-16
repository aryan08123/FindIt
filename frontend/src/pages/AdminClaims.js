import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ClipboardList, Search, X } from "lucide-react";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import ItemImage from "../components/ItemImage";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ReviewDialog from "../components/ReviewDialog";
import claimService from "../services/claimService";
import { errorMessage, formatDate } from "../utils/helpers";

const TABS = [
  ["PENDING", "Pending"],
  ["APPROVED", "Approved"],
  ["REJECTED", "Rejected"],
  ["", "All"],
];

export default function AdminClaims() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("PENDING");
  const [query, setQuery] = useState("");
  const [reload, setReload] = useState(0);
  const [review, setReview] = useState(null); // { claim, mode }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    claimService
      .all()
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

  const countOf = (status) =>
    status ? claims.filter((c) => c.status === status).length : claims.length;

  const q = query.trim().toLowerCase();
  const visible = claims.filter((c) => {
    if (tab && c.status !== tab) return false;
    if (!q) return true;
    return [c.itemName, c.claimantName, c.claimantEmail, c.claimantStudentId]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(q));
  });

  return (
    <>
      <PageHeader
        title="Claims"
        subtitle="Compare each claimant's proof with the finder's private details, then approve or reject."
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
            {label} <span className="tab-count">{countOf(key)}</span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <FormField
          name="claimSearch"
          icon={Search}
          placeholder="Search by item, claimant, email or student ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader text="Loading claims…" />
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
          message={
            q ? "No claims match your search." : "Nothing to show in this tab."
          }
        />
      ) : (
        <div className="report-list">
          {visible.map((c) => {
            const itemOpen = c.itemStatus === "ACTIVE";
            return (
              <article className="claim-card" key={c.id}>
                <div className="claim-head">
                  <div className="claim-thumb">
                    <ItemImage path={c.itemImageUrl} alt={c.itemName} />
                  </div>
                  <div className="claim-head-info">
                    <h3>{c.itemName}</h3>
                    <small>
                      Found at {c.itemLocation} · reported by {c.itemReportedBy}{" "}
                      · claim #{c.id} on {formatDate(c.createdAt)}
                    </small>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <div className="claim-body">
                  <div className="claim-block">
                    <strong>Claimant</strong>
                    <span className="line">{c.claimantName}</span>
                    <span className="line">{c.claimantEmail}</span>
                    <span className="line">
                      Student ID {c.claimantStudentId} · {c.claimantDepartment}
                    </span>
                  </div>
                  <div className="claim-block">
                    <strong>Claimant explanation</strong>
                    {c.description}
                  </div>
                  <div className="claim-block">
                    <strong>Claimant proof</strong>
                    {c.proofDetails}
                  </div>
                  <div className="claim-block claim-block-private">
                    <strong>Finder private identifying details</strong>
                    {c.itemAdditionalDetails ||
                      "The finder did not add any identifying details."}
                  </div>
                </div>

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
                  <div className="claim-actions">
                    <Link
                      to={`/items/${c.itemId}`}
                      className="btn btn-outline btn-sm"
                    >
                      View item
                    </Link>
                    {c.status === "PENDING" && (
                      <>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() =>
                            setReview({ claim: c, mode: "reject" })
                          }
                        >
                          <X size={14} /> Reject
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={!itemOpen}
                          title={
                            itemOpen
                              ? ""
                              : "This item is no longer active, so the claim can only be rejected"
                          }
                          onClick={() =>
                            setReview({ claim: c, mode: "approve" })
                          }
                        >
                          <Check size={14} /> Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {review && (
        <ReviewDialog
          claim={review.claim}
          mode={review.mode}
          onClose={() => setReview(null)}
          onDone={() => {
            setReview(null);
            setReload((n) => n + 1);
          }}
        />
      )}
    </>
  );
}


