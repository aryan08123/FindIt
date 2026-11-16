import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STUDENT_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/report/lost", label: "Report Lost Item", icon: Plus },
  { to: "/report/found", label: "Report Found Item", icon: PackageSearch },
  { to: "/my-reports", label: "My Reports", icon: FileText },
  { to: "/my-claims", label: "My Claims", icon: ClipboardList },
  { to: "/browse", label: "Browse Items", icon: Search },
];

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/reports", label: "All Reports", icon: FileText },
  { to: "/admin/claims", label: "Claims", icon: ClipboardList },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/browse", label: "Browse Items", icon: Search },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = user.role === "ADMIN" ? ADMIN_LINKS : STUDENT_LINKS;
  const close = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link
          to="/"
          className="brand brand-light sidebar-brand"
          onClick={close}
        >
          <span className="brand-mark">
            <Search size={18} strokeWidth={2.5} />
          </span>
          <span className="brand-name">FindIt</span>
        </Link>

        <nav className="sidebar-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={close}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-user">
          <span className="avatar">
            {user.fullName.charAt(0).toUpperCase()}
          </span>
          <div className="sidebar-user-info">
            <strong>{user.fullName}</strong>
            <small>{user.role === "ADMIN" ? "Administrator" : "Student"}</small>
          </div>
          <button
            className="sidebar-logout"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {open && <div className="sidebar-backdrop" onClick={close} />}

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="topbar-btn"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="brand-name">FindIt</span>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


