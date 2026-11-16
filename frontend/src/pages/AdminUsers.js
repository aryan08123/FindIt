import { useEffect, useState } from "react";
import { Search, Trash2, Users } from "lucide-react";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import adminService from "../services/adminService";
import { errorMessage, formatDate } from "../utils/helpers";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    adminService
      .users()
      .then((data) => {
        if (!cancelled) setUsers(data);
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
  const visible = users.filter(
    (u) =>
      !q ||
      [u.fullName, u.email, u.studentId, u.department].some((text) =>
        text.toLowerCase().includes(q),
      ),
  );
  const studentCount = users.filter((u) => u.role === "STUDENT").length;

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await adminService.deleteUser(toDelete.id);
      setUsers((list) => list.filter((u) => u.id !== toDelete.id));
      toast.success("User deleted.");
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  };

  const deleteHint = (u) => {
    if (u.id === me.id) return "You cannot delete your own account";
    if (u.role === "ADMIN") return "Administrator accounts cannot be deleted";
    return "Delete user";
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${studentCount} registered ${studentCount === 1 ? "student" : "students"}, ${users.length - studentCount} administrator${users.length - studentCount === 1 ? "" : "s"}.`}
      />

      <div className="toolbar">
        <FormField
          name="userSearch"
          icon={Search}
          placeholder="Search by name, email, student ID or department"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader text="Loading users…" />
      ) : error ? (
        <div className="alert alert-error">
          {error}{" "}
          <button className="link-btn" onClick={() => setReload((n) => n + 1)}>
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          message="Nobody matches your search."
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Student ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="cell-user">
                      <span className="avatar avatar-sm">
                        {u.fullName.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <strong>{u.fullName}</strong>
                        <small>{u.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{u.studentId}</td>
                  <td>{u.department}</td>
                  <td>
                    <StatusBadge status={u.role} />
                  </td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      disabled={u.role === "ADMIN" || u.id === me.id}
                      title={deleteHint(u)}
                      onClick={() => setToDelete(u)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
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
        title="Delete this user?"
        message={`${toDelete?.fullName} (${toDelete?.email}) will be removed together with all their reports, claims and uploaded images. This cannot be undone.`}
        confirmText="Delete user"
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </>
  );
}


