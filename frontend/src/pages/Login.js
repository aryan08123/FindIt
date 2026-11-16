import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, PackageSearch, ShieldCheck, Zap } from "lucide-react";
import Navbar from "../components/Navbar";
import FormField from "../components/FormField";
import { homePath, useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { errorMessage } from "../utils/helpers";

const EMAIL_RULE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: location.state?.registeredEmail || "", password: "" });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const sessionExpired = new URLSearchParams(location.search).get("expired") === "1";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
    setServerError("");
  };

  const validate = () => {
    const found = {};
    if (!form.email.trim()) found.email = "Email is required";
    else if (!EMAIL_RULE.test(form.email.trim())) found.email = "Enter a valid email address";
    if (!form.password) found.password = "Password is required";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError("");
    try {
      const user = await login(form.email.trim(), form.password, remember);
      toast.success(`Welcome back, ${user.fullName.split(" ")[0]}!`);
      navigate(location.state?.from || homePath(user), { replace: true });
    } catch (err) {
      setServerError(errorMessage(err, "Login failed. Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  // Quick-fill buttons for the live demo
  const fillDemo = (email, password) => {
    setForm({ email, password });
    setErrors({});
    setServerError("");
  };

  return (
    <>
      <Navbar />
      <main className="auth-page">
        <aside className="auth-aside">
          <h1>Welcome back to FindIt</h1>
          <p>Log in to report lost items, share what you found and track your claims.</p>
          <ul className="auth-points">
            <li><PackageSearch size={28} /> Search every lost and found report on campus</li>
            <li><Zap size={28} /> Submit a claim in under a minute</li>
            <li><ShieldCheck size={28} /> Admin-verified returns keep belongings safe</li>
          </ul>
        </aside>

        <section className="auth-main">
          <div className="auth-card">
            <h2>Log in</h2>
            <p className="auth-sub">Enter your college email and password.</p>

            {sessionExpired && !serverError && (
              <div className="alert alert-info">Your session has expired. Please log in again.</div>
            )}
            {serverError && <div className="alert alert-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <FormField
                label="College email"
                name="email"
                type="email"
                icon={Mail}
                placeholder="name@college.edu"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
              />
              <FormField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                placeholder="Your password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                rightSlot={
                  <button
                    type="button"
                    className="input-action"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <label className="check-row">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Keep me logged in on this device
              </label>

              <button className="btn btn-primary btn-block btn-lg" disabled={submitting}>
                {submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            <p className="auth-switch">
              New to FindIt? <Link to="/register">Create an account</Link>
            </p>

            <div className="demo-box">
              <span>Demo accounts</span>
              <div>
                <button type="button" onClick={() => fillDemo("aarav.sharma@college.edu", "Student@123")}>
                  Student
                </button>
                <button type="button" onClick={() => fillDemo("admin@findit.edu", "Admin@123")}>
                  Admin
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}


