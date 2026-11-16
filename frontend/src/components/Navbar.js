import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, Search, X } from "lucide-react";
import { homePath, useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const close = () => setOpen(false);
  const handleLogout = () => {
    logout();
    close();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark">
            <Search size={18} strokeWidth={2.5} />
          </span>
          <span className="brand-name">FindIt</span>
        </Link>

        <button
          className="nav-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`nav-menu ${open ? "open" : ""}`}>
          <div className="nav-links">
            <NavLink to="/" end onClick={close}>Home</NavLink>
            <NavLink to="/browse" onClick={close}>Browse Items</NavLink>
            <Link to={{ pathname: "/", hash: "#how-it-works" }} onClick={close}>How It Works</Link>
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <Link to={homePath(user)} className="btn btn-outline btn-sm" onClick={close}>
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={close}>Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={close}>Register</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

