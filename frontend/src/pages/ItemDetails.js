import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, PackageSearch } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ItemImage from "../components/ItemImage";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ClaimDialog from "../components/ClaimDialog";
import { useAuth } from "../context/AuthContext";
import itemService from "../services/itemService";
import { errorMessage, formatDate } from "../utils/helpers";

export default function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [claimOpen, setClaimOpen] = useState(false);

  const load = useCallback(
    (silent = false) => {
      if (!silent) setLoading(true);
      setError("");
      setNotFound(false);
      return itemService
        .get(id)
        .then(setItem)
        .catch((err) => {
          if (err.response?.status === 404) setNotFound(true);
          else setError(errorMessage(err));
        })
        .finally(() => setLoading(false));
    },
    [id]
  );

  useEffect(() => {
    load();
  }, [load]);

  const renderBody = () => {
    if (loading) return <Loader text="Loading item…" />;

    if (notFound) {
      return (
        <EmptyState
          icon={PackageSearch}
          title="Item not found"
          message="This report may have been removed."
          action={<Link to="/browse" className="btn btn-primary">Back to browse</Link>}
        />
      );
    }
    if (error) {
      return (
        <div className="alert alert-error">
          {error} <button className="link-btn" onClick={() => load()}>Try again</button>
        </div>
      );
    }

    const isStudent = user.role === "STUDENT";
    const canClaim =
      isStudent && item.itemType === "FOUND" && item.status === "ACTIVE" && !item.ownedByMe && !item.claimedByMe;

    const rows = [
      ["Category", item.category],
      ["Location", item.location],
      [item.itemType === "LOST" ? "Date lost" : "Date found", formatDate(item.reportedDate)],
      ["Reported by", item.reportedByName],
      ["Contact", item.contactInfo],
      ["Reported on", formatDate(item.createdAt)],
    ].filter(([, value]) => value);

    return (
      <div className="detail-grid">
        <div className="detail-media">
          <ItemImage path={item.imageUrl} alt={item.itemName} />
        </div>

        <div className="card detail-card">
          <div className="detail-head">
            <StatusBadge status={item.itemType} />
            <StatusBadge status={item.status} />
          </div>
          <h1>{item.itemName}</h1>
          <p className="detail-desc">{item.description}</p>

          <dl className="detail-list">
            {rows.map(([label, value]) => (
              <div className="detail-row" key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          {item.additionalDetails && (
            <div className="notice">
              <strong>Identifying details (private)</strong>
              {item.additionalDetails}
            </div>
          )}

          {/* ---------- Actions and status messages ---------- */}
          {item.ownedByMe && (
            <div className="alert alert-info">
              This is your report. You can manage it from <Link to="/my-reports">My Reports</Link>.
            </div>
          )}

          {!item.ownedByMe && user.role === "ADMIN" && (
            <div className="alert alert-info">
              Administrators review and decide claims from the admin dashboard.
            </div>
          )}

          {item.claimedByMe && (
            <div className="alert alert-success">
              You have already submitted a claim for this item. Track it in{" "}
              <Link to="/my-claims">My Claims</Link>.
            </div>
          )}

          {item.itemType === "FOUND" && item.status !== "ACTIVE" && (
            <div className="alert alert-info">
              This item is {item.status.toLowerCase()} and is no longer open for new claims.
            </div>
          )}

          {isStudent && item.itemType === "LOST" && !item.ownedByMe && item.status === "ACTIVE" && (
            <div className="alert alert-info">
              Did you find this item? Contact the owner using the details above, or report it as found.
            </div>
          )}

          <div className="btn-row">
            {canClaim && (
              <button className="btn btn-primary btn-lg" onClick={() => setClaimOpen(true)}>
                <ClipboardList size={18} /> Submit Claim
              </button>
            )}
            {isStudent && item.itemType === "LOST" && !item.ownedByMe && item.status === "ACTIVE" && (
              <Link to="/report/found" className="btn btn-outline">Report as found</Link>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <Link to="/browse" className="back-link">
          <ArrowLeft size={16} /> Back to browse
        </Link>
        {renderBody()}
      </main>
      <Footer />

      {claimOpen && item && (
        <ClaimDialog
          item={item}
          onClose={() => setClaimOpen(false)}
          onSubmitted={() => {
            setClaimOpen(false);
            load(true);
          }}
        />
      )}
    </>
  );
}

