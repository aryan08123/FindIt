import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, Trash2 } from "lucide-react";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import ItemImage from "../components/ItemImage";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../context/ToastContext";
import adminService from "../services/adminService";
import itemService from "../services/itemService";
import { errorMessage, formatDate } from "../utils/helpers";

const TYPE_TABS = [
  ["", "All"],
  ["LOST", "Lost"],
  ["FOUND", "Found"],
];
const STATUSES = ["ACTIVE", "CLAIMED", "RECOVERED"];

export default function AdminReports() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [statusBusyId, setStatusBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    adminService
      .reports()
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

  const q = query.trim().toLowerCase();
  const visible = items.filter((i) => {
    if (type && i.itemType !== type) return false;
    if (status && i.status !== status) return false;
    if (!q) return true;
    return [i.itemName, i.reportedByName, i.location, i.category]
      .filter(Boolean)
      .some((text) => text.toLowerCase().includes(q));
  });

  const changeStatus = async (item, newStatus) => {
    if (newStatus === item.status) return;
    setStatusBusyId(item.id);
    try {
      const updated = await itemService.updateStatus(item.id, newStatus);
      setItems((list) =>
        list.map((x) =>
          x.id === item.id ? { ...x, status: updated.status } : x,
        ),
      );
      toast.success(`Status changed to ${newStatus.toLowerCase()}.`);
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setStatusBusyId(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await itemService.remove(toDelete.id);
      setItems((list) => list.filter((x) => x.id !== toDelete.id));
      toast.success("Report deleted.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  return (
    <>
      <PageHeader
        title="All reports"
        subtitle="Review every lost and found report, update statuses and remove inappropriate posts."
      />

      <div className="tabs" role="tablist">
        {TYPE_TABS.map(([key, label]) => (
          <button
            key={key || "all"}
            role="tab"
            aria-selected={type === key}
            className={`tab ${type === key ? "active" : ""}`}
            onClick={() => setType(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="toolbar">
        <FormField
          name="reportSearch"
          icon={Search}
          placeholder="Search by item, reporter, location or category"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader text="Loading reports…" />
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
          title="No reports found"
          message="Nothing matches the current filters."
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th>Reported by</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div className="cell-item">
                      <div className="table-thumb">
                        <ItemImage path={i.imageUrl} alt={i.itemName} />
                      </div>
                      <div>
                        <strong>{i.itemName}</strong>
                        <small>{i.category}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={i.itemType} />
                  </td>
                  <td>
                    {i.reportedByName}
                    {i.contactInfo && <small>{i.contactInfo}</small>}
                  </td>
                  <td>{i.location}</td>
                  <td>{formatDate(i.reportedDate)}</td>
                  <td>
                    <select
                      className="status-select"
                      value={i.status}
                      disabled={statusBusyId === i.id}
                      onChange={(e) => changeStatus(i, e.target.value)}
                      aria-label={`Status of ${i.itemName}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0) + s.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="row-actions">
                      <Link
                        to={`/items/${i.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        View
                      </Link>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setToDelete(i)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        busy={deleting}
        title="Delete this report?"
        message={`"${toDelete?.itemName}" reported by ${toDelete?.reportedByName} and any claims on it will be permanently removed.`}
        confirmText="Delete report"
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </>
  );
}


