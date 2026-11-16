import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import publicService from "../services/publicService";
import { errorMessage } from "../utils/helpers";

export default function Welcome() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    publicService
      .stats()
      .then(setStats)
      .catch((e) => setError(errorMessage(e)));
  }, []);

  return (
    <>
      <Navbar />
      <main className="container page-center">
        <div className="card welcome-card">
          <h2>Hello, {user.fullName}</h2>
          <p>
            You are logged in as <StatusBadge status={user.role} /> (
            {user.email}). The full dashboards arrive in the next parts.
          </p>

          {error && <div className="alert alert-error">{error}</div>}
          {!stats && !error && <Loader text="Contacting the backend…" />}
          {stats && (
            <div className="stat-grid">
              <div className="stat">
                <strong>{stats.totalLost}</strong>
                <span>Lost reports</span>
              </div>
              <div className="stat">
                <strong>{stats.totalFound}</strong>
                <span>Found reports</span>
              </div>
              <div className="stat">
                <strong>{stats.totalRecovered}</strong>
                <span>Recovered</span>
              </div>
              <div className="stat">
                <strong>{stats.totalStudents}</strong>
                <span>Students</span>
              </div>
            </div>
          )}

          <button
            className="btn btn-outline"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </main>
    </>
  );
}


