import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Check,
  FileText,
  MapPin,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import PageHeader from "../components/PageHeader";
import ItemImage from "../components/ItemImage";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import itemService from "../services/itemService";
import { errorMessage, formatDate } from "../utils/helpers";

const TABS = [
  ["", "All"],
  ["LOST", "Lost"],
  ["FOUND", "Found"],
];

// Mirrors the backend rules
const canEdit = (i) => i.status === "ACTIVE";
const canRecover = (i) =>
  i.status !== "RECOVERED" && (i.itemType === "LOST" || i.status === "CLAIMED");

export default function MyReports() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("");
  const [reload, setReload] = useState(0);
  const [action, setAction] = useState(null); // { kind: "delete" | "recover", item }
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    itemService
      .myReports()
      .then((data) => {
        if (!cancelled) setItems(data);
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

  const visible = tab ? items.filter((i) => i.itemType === tab) : items;

  const confirmAction = async () => {
    setBusy(true);
    try {
      if (action.kind === "delete") {
        await itemService.remove(action.item.id);
        toast.success("Report deleted.");
      } else {
        await itemService.updateStatus(action.item.id, "RECOVERED");
        toast.success("Item marked as recovered.");
      }
      setReload((n) => n + 1);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setBusy(false);
      setAction(null);
    }
  };

  return (
    <>
      <PageHeader
        title="My reports"
        subtitle="Everything you have reported as lost or found."
        actions={
          <>
            <Link to="/report/lost" className="btn btn-primary btn-sm">
              <Plus size={16} /> Lost
            </Link>
            <Link to="/report/found" className="btn btn-outline btn-sm">
              <Plus size={16} /> Found
            </Link>
          </>
        }
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
        <Loader text="Loading your reports…" />
      ) : error ? (
        <div className="alert alert-error">
          {error}{" "}
          <button className="link-btn" onClick={() => setReload((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No reports here yet"
          message="Report a lost or found item and it will show up on this page."
          action={
            <Link to="/report/lost" className="btn btn-primary">
              Report an item
            </Link>
          }
        />
      ) : (
        <div className="report-list">
          {visible.map((item) => (
            <article className="report-row" key={item.id}>
              <div className="report-thumb">
                <ItemImage path={item.imageUrl} alt={item.itemName} />
              </div>

              <div className="report-info">
                <div className="report-badges">
                  <StatusBadge status={item.itemType} />
                  <StatusBadge status={item.status} />
                </div>
                <h3>{item.itemName}</h3>
                <div className="report-meta">
                  <span>
                    <MapPin size={14} /> {item.location}
                  </span>
                  <span>
                    <Calendar size={14} /> {formatDate(item.reportedDate)}
                  </span>
                  <span>{item.category}</span>
                </div>
                {item.itemType === "FOUND" && item.status === "CLAIMED" && (
                  <p className="report-note">
                    A claim was approved. Mark this item as recovered once it
                    has been handed over.
                  </p>
                )}
              </div>

              <div className="report-actions">
                <Link
                  to={`/items/${item.id}`}
                  className="btn btn-outline btn-sm"
                >
                  View
                </Link>
                {canEdit(item) && (
                  <Link
                    to={`/my-reports/${item.id}/edit`}
                    className="btn btn-outline btn-sm"
                  >
                    <Pencil size={14} /> Edit
                  </Link>
                )}
                {canRecover(item) && (
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setAction({ kind: "recover", item })}
                  >
                    <Check size={14} /> Mark recovered
                  </button>
                )}
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => setAction({ kind: "delete", item })}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(action)}
        danger={action?.kind === "delete"}
        busy={busy}
        title={
          action?.kind === "delete"
            ? "Delete this report?"
            : "Mark as recovered?"
        }
        message={
          action?.kind === "delete"
            ? `"${action?.item.itemName}" and any claims on it will be permanently removed. This cannot be undone.`
            : `Confirm that "${action?.item.itemName}" has been returned to its owner. The report will be closed.`
        }
        confirmText={action?.kind === "delete" ? "Delete" : "Mark recovered"}
        onConfirm={confirmAction}
        onCancel={() => !busy && setAction(null)}
      />
    </>
  );
}



