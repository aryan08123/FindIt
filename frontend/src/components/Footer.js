import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Search } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-light">
            <span className="brand-mark">
              <Search size={18} strokeWidth={2.5} />
            </span>
            <span className="brand-name">FindIt</span>
          </div>
          <p className="footer-about">
            FindIt is the campus Lost and Found portal. Report what you lost,
            share what you found, and help belongings find their way back to
            their owners.
          </p>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/browse">Browse Items</Link>
            </li>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register">Register</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul className="footer-contact">
            <li>
              <Mail size={16} /> findit@college.edu
            </li>
            <li>
              <Phone size={16} /> +91 98765 43210
            </li>
            <li>
              <MapPin size={16} /> Lost &amp; Found Desk, Admin Block
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          © {new Date().getFullYear()} FindIt – Campus Lost and Found Management
          Portal
        </div>
      </div>
    </footer>
  );
}



